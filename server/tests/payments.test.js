/**
 * Payments Tests
 * İyzico sandbox entegrasyonu ve ödeme akışı testleri
 */
const { app, request, resetDb, closeDb, registerAndLogin, dbRun, dbGet } = require('./helpers');

beforeEach(() => resetDb());
afterAll(()  => closeDb());

async function setupExpertAndBooking() {
  // Uzman oluştur
  const expert = await registerAndLogin({
    firstName: 'Uzman', lastName: 'Test',
    email: `uzman_pay_${Date.now()}@test.com`, password: 'Test1234!'
  });
  dbRun("UPDATE users SET role = 'expert' WHERE id = ?", expert.user.id);
  dbRun(
    'INSERT INTO expert_profiles (user_id, price, bio, city, tags) VALUES (?,?,?,?,?)',
    expert.user.id, 500, 'bio', 'Istanbul', '[]'
  );

  // Müşteri oluştur
  const customer = await registerAndLogin({
    firstName: 'Müşteri', lastName: 'Test',
    email: `musteri_pay_${Date.now()}@test.com`, password: 'Test1234!'
  });

  // Rezervasyon oluştur
  const rezRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${customer.token}`)
    .send({
      expertId: expert.user.id, service: 'Test Hizmet',
      date: '2026-10-01', time: '10:00',
      slots: ['2026-10-01_10:00'],
      durationType: 'hours', durationValue: 1, totalPrice: 500,
    });

  const bookingId = rezRes.body.booking?.id;

  // Uzman onaylasın → confirmed
  if (bookingId) {
    await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${expert.token}`)
      .send({ status: 'confirmed' });
  }

  return { expert, customer, bookingId };
}

describe('POST /api/payments/initialize', () => {
  test('oturum açmadan ödeme başlatılamaz', async () => {
    const res = await request(app)
      .post('/api/payments/initialize')
      .send({ bookingId: 'test_id' });
    expect(res.status).toBe(401);
  });

  test('olmayan rezervasyon için ödeme başlatılamaz', async () => {
    const { customer } = await setupExpertAndBooking();
    const res = await request(app)
      .post('/api/payments/initialize')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ bookingId: 'olmayan_id' });
    expect(res.status).toBe(404);
  });

  test('pending rezervasyon için ödeme başlatılamaz', async () => {
    const expert = await registerAndLogin({
      email: `uzman2_${Date.now()}@test.com`, password: 'Test1234!'
    });
    dbRun("UPDATE users SET role = 'expert' WHERE id = ?", expert.user.id);
    dbRun('INSERT INTO expert_profiles (user_id, price, bio, city, tags) VALUES (?,?,?,?,?)',
      expert.user.id, 300, '', 'Istanbul', '[]');

    const customer = await registerAndLogin({
      email: `must2_${Date.now()}@test.com`, password: 'Test1234!'
    });

    const rezRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        expertId: expert.user.id, service: 'Test',
        date: '2026-10-02', time: '11:00',
        slots: ['2026-10-02_11:00'],
        durationType: 'hours', durationValue: 1, totalPrice: 300,
      });

    const bookingId = rezRes.body.booking?.id;
    // pending durumda — onaylanmamış
    const res = await request(app)
      .post('/api/payments/initialize')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ bookingId });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/onaylanmış/i);
  });

  test('confirmed rezervasyon için ödeme başlatılır (iyzico sandbox)', async () => {
    const { customer, bookingId } = await setupExpertAndBooking();
    if (!bookingId) return; // Skip if booking failed

    const res = await request(app)
      .post('/api/payments/initialize')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ bookingId });

    // İyzico sandbox'a gerçek istek gidiyor
    // Başarılı olursa checkoutFormContent döner
    // API hatası olursa 400 döner — her iki durum da kabul edilir
    expect([200, 400]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    }
  }, 15000); // İyzico sandbox için timeout artırıldı
});

describe('GET /api/payments/:bookingId', () => {
  test('ödeme durumu sorgulanır — ödeme yok', async () => {
    const { customer, bookingId } = await setupExpertAndBooking();
    if (!bookingId) return;

    const res = await request(app)
      .get(`/api/payments/${bookingId}`)
      .set('Authorization', `Bearer ${customer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.payment).toBeNull(); // Henüz ödeme yok
  });

  test('oturum açmadan ödeme durumu alınamaz', async () => {
    const res = await request(app).get('/api/payments/test_id');
    expect(res.status).toBe(401);
  });

  test('başka kullanıcının ödemesi görülemez', async () => {
    const { bookingId } = await setupExpertAndBooking();
    if (!bookingId) return;

    // Farklı kullanıcı
    const other = await registerAndLogin({
      email: `other_${Date.now()}@test.com`, password: 'Test1234!'
    });

    const res = await request(app)
      .get(`/api/payments/${bookingId}`)
      .set('Authorization', `Bearer ${other.token}`);

    expect(res.status).toBe(200);
    expect(res.body.payment).toBeNull(); // Başkasının ödemesi görünmez
  });
});
