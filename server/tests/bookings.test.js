const { app, request, resetDb, closeDb, registerAndLogin, dbRun } = require('./helpers');

beforeEach(() => resetDb());
afterAll(()  => closeDb());

async function setupExpert() {
  const { token, user } = await registerAndLogin({
    firstName: 'Uzman', lastName: 'Test',
    email: `uzman_${Date.now()}@test.com`, password: 'Test1234!'
  });
  dbRun("UPDATE users SET role = 'expert' WHERE id = ?", user.id);
  dbRun(
    'INSERT INTO expert_profiles (user_id, price, bio, city, tags) VALUES (?, ?, ?, ?, ?)',
    user.id, 300, 'bio', 'Istanbul', '["Elektrik"]'
  );
  return { token, user };
}

describe('POST /api/bookings', () => {
  test('oturum açmadan rezervasyon yapılamaz', async () => {
    const res = await request(app).post('/api/bookings').send({});
    expect(res.status).toBe(401);
  });

  test('geçerli verilerle rezervasyon oluşturulur', async () => {
    const expert   = await setupExpert();
    const customer = await registerAndLogin({ email: `musteri_${Date.now()}@test.com` });

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        expertId:      expert.user.id,
        service:       'Elektrik Tamiri',
        date:          '2026-09-01',
        time:          '10:00',
        durationType:  'hours',
        durationValue: 2,
        durationLabel: '2 saat',
        totalPrice:    600,
        slots:         ['2026-09-01_10:00','2026-09-01_11:00'],
        city:          'Istanbul',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.status).toBe('pending');
    expect(res.body.booking.expertId).toBe(expert.user.id);
  });

  test('dolu slota rezervasyon yapılamaz', async () => {
    const expert   = await setupExpert();
    const customer = await registerAndLogin({ email: `musteri2_${Date.now()}@test.com` });

    const booking = {
      expertId: expert.user.id, service: 'Test',
      date: '2026-09-02', time: '10:00',
      slots: ['2026-09-02_10:00'],
      durationType: 'hours', durationValue: 1, totalPrice: 300,
    };

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send(booking);

    // Aynı slota ikinci rezervasyon
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send(booking);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('eksik alan ile rezervasyon yapılamaz', async () => {
    const customer = await registerAndLogin({ email: `eksik_${Date.now()}@test.com` });
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ expertId: 'x' }); // service, date, time eksik
    expect(res.status).toBe(400);
  });
});

describe('GET /api/bookings/my', () => {
  test('müşteri kendi rezervasyonlarını görür', async () => {
    const expert   = await setupExpert();
    const customer = await registerAndLogin({ email: `benimrez_${Date.now()}@test.com` });

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        expertId: expert.user.id, service: 'Test',
        date: '2026-09-03', time: '09:00',
        slots: ['2026-09-03_09:00'],
        durationType: 'hours', durationValue: 1, totalPrice: 300,
      });

    const res = await request(app)
      .get('/api/bookings/my')
      .set('Authorization', `Bearer ${customer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.bookings.length).toBe(1);
    expect(res.body.bookings[0].service).toBe('Test');
  });

  test('oturum açmadan rezervasyon listesi alınamaz', async () => {
    const res = await request(app).get('/api/bookings/my');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/bookings/expert', () => {
  test('uzman kendi gelen rezervasyonlarını görür', async () => {
    const expert   = await setupExpert();
    const customer = await registerAndLogin({ email: `expertlist_${Date.now()}@test.com` });

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        expertId: expert.user.id, service: 'Servis',
        date: '2026-09-10', time: '11:00',
        slots: ['2026-09-10_11:00'],
        durationType: 'hours', durationValue: 1, totalPrice: 300,
      });

    const res = await request(app)
      .get('/api/bookings/expert')
      .set('Authorization', `Bearer ${expert.token}`);

    expect(res.status).toBe(200);
    expect(res.body.bookings.length).toBeGreaterThanOrEqual(1);
    expect(res.body.bookings[0].customerName).toBeDefined();
  });
});

describe('PATCH /api/bookings/:id/status', () => {
  test('uzman rezervasyonu onaylar', async () => {
    const expert   = await setupExpert();
    const customer = await registerAndLogin({ email: `onayla_${Date.now()}@test.com` });

    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        expertId: expert.user.id, service: 'Test',
        date: '2026-09-04', time: '10:00',
        slots: ['2026-09-04_10:00'],
        durationType: 'hours', durationValue: 1, totalPrice: 300,
      });
    const bookingId = createRes.body.booking.id;

    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${expert.token}`)
      .send({ status: 'confirmed' });

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe('confirmed');
  });

  test('müşteri rezervasyonu iptal eder', async () => {
    const expert   = await setupExpert();
    const customer = await registerAndLogin({ email: `iptal_${Date.now()}@test.com` });

    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        expertId: expert.user.id, service: 'Test',
        date: '2026-09-05', time: '10:00',
        slots: ['2026-09-05_10:00'],
        durationType: 'hours', durationValue: 1, totalPrice: 300,
      });
    const bookingId = createRes.body.booking.id;

    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ status: 'cancelled' });

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe('cancelled');
  });

  test('müşteri onaylama yapamaz', async () => {
    const expert   = await setupExpert();
    const customer = await registerAndLogin({ email: `noyetkisi_${Date.now()}@test.com` });

    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        expertId: expert.user.id, service: 'Test',
        date: '2026-09-06', time: '10:00',
        slots: ['2026-09-06_10:00'],
        durationType: 'hours', durationValue: 1, totalPrice: 300,
      });
    const bookingId = createRes.body.booking.id;

    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ status: 'confirmed' });

    expect(res.status).toBe(403);
  });

  test('iptal sonrası slot takvimden silinir ve tekrar alınabilir', async () => {
    const expert   = await setupExpert();
    const customer = await registerAndLogin({ email: `slotserbest_${Date.now()}@test.com` });

    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        expertId: expert.user.id, service: 'Test',
        date: '2026-09-07', time: '10:00',
        slots: ['2026-09-07_10:00'],
        durationType: 'hours', durationValue: 1, totalPrice: 300,
      });
    const bookingId = createRes.body.booking.id;

    // İptal et
    await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ status: 'cancelled' });

    // Aynı slotu tekrar al — bu sefer başarılı olmalı
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        expertId: expert.user.id, service: 'Test2',
        date: '2026-09-07', time: '10:00',
        slots: ['2026-09-07_10:00'],
        durationType: 'hours', durationValue: 1, totalPrice: 300,
      });

    expect(res.status).toBe(201);
  });
});
