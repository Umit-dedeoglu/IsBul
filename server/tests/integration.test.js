/**
 * İşBul — Uçtan Uca Entegrasyon Testleri
 *
 * Test Senaryoları:
 *   1. Uzman Kayıt Akışı  — kaydol → pending_expert → admin onayla → uzman listesinde görün
 *   2. Rezervasyon Akışı  — müşteri giriş → uzman bul → rezervasyon oluştur → uzman panelde görsün
 *   3. Şifre Sıfırlama    — token oluştur → şifre değiştir → eski şifre çalışmasın
 *   4. Veri Tutarlılığı   — API'den gelen uzman ile profil sayfasının beklediği format uyuşuyor mu
 */

const { app, request, resetDb, closeDb, registerAndLogin, dbRun, dbGet, TEST_SETUP_KEY } = require('./helpers');

beforeEach(async () => {
  await resetDb();
});
afterAll(() => closeDb());

/* ─── Yardımcılar ─── */
async function createAdmin() {
  await request(app)
    .post('/api/admin/create-admin')
    .set('x-admin-setup-key', TEST_SETUP_KEY)
    .send({ firstName: 'Admin', lastName: 'Test', email: 'admin@test.com', password: 'Admin1234!' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'Admin1234!' });
  return { token: res.body.token, user: res.body.user };
}

async function createCustomer(emailPrefix = 'musteri') {
  return registerAndLogin({
    firstName: 'Müşteri',
    lastName:  'Test',
    email:     `${emailPrefix}_${Date.now()}@test.com`,
    password:  'Test1234!',
  });
}

/* ══════════════════════════════════════════════════════════
   1. UZMAN KAYIT AKIŞI
   Kaydol → pending_expert → admin onayla → listede görün
══════════════════════════════════════════════════════════ */
describe('1. Uzman Kayıt Akışı', () => {

  test('1.1 — pending_expert olarak kaydolunabilir', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName:     'Yeni',
        lastName:      'Uzman',
        email:         'uzman@test.com',
        password:      'Test1234!',
        role:          'pending_expert',
        expertProfile: { price: 300, bio: 'Elektrik uzmanı', city: 'İstanbul', tags: ['Elektrik'], experience: '3 yıl' }
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('pending_expert');
    // Kayıt sırasında isExpert false olmalı (admin onayı bekleniyor)
    expect(res.body.user.isExpert).toBe(false);
  });

  test('1.2 — pending_expert, admin başvuru listesinde görünür', async () => {
    // Uzman kaydol
    await request(app).post('/api/auth/register').send({
      firstName: 'Bekleyen', lastName: 'Uzman', email: 'bekleyen@test.com',
      password: 'Test1234!', role: 'pending_expert',
      expertProfile: { price: 250, bio: 'Bio', city: 'Ankara', tags: ['Temizlik'] }
    });

    const admin = await createAdmin();
    const res = await request(app)
      .get('/api/admin/applications')
      .set('Authorization', `Bearer ${admin.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pendingCount).toBeGreaterThan(0);

    const pendingEmails = res.body.pending.map(u => u.email);
    expect(pendingEmails).toContain('bekleyen@test.com');
  });

  test('1.3 — admin onayladıktan sonra role expert olur', async () => {
    // Uzman kaydol
    const uzmanRes = await request(app).post('/api/auth/register').send({
      firstName: 'Onay', lastName: 'Bekliyor', email: 'onaybekliyor@test.com',
      password: 'Test1234!', role: 'pending_expert',
      expertProfile: { price: 280, bio: 'Bio', city: 'İzmir', tags: ['Elektrik'] }
    });
    const uzmanId = uzmanRes.body.user.id;

    // Admin onayla
    const admin = await createAdmin();
    const approveRes = await request(app)
      .patch(`/api/admin/applications/${uzmanId}/approve`)
      .set('Authorization', `Bearer ${admin.token}`);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.success).toBe(true);

    // Kullanıcının rolü expert olmuş mu?
    const user = await dbGet('SELECT role FROM users WHERE id = ?', uzmanId);
    expect(user.role).toBe('expert');
  });

  test('1.4 — onaylanan uzman /api/experts listesinde görünür', async () => {
    // Uzman kaydol ve profil oluştur
    const uzmanRes = await request(app).post('/api/auth/register').send({
      firstName: 'Listede', lastName: 'Görünmeli', email: 'listede@test.com',
      password: 'Test1234!', role: 'pending_expert',
      expertProfile: { price: 350, bio: 'Elektrik uzmanıyım', city: 'İstanbul', tags: ['Elektrik', 'Aydınlatma'] }
    });
    const uzmanId = uzmanRes.body.user.id;

    // Admin onayla
    const admin = await createAdmin();
    await request(app)
      .patch(`/api/admin/applications/${uzmanId}/approve`)
      .set('Authorization', `Bearer ${admin.token}`);

    // Uzman listesini kontrol et
    const listRes = await request(app).get('/api/experts');
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);

    const uzmanIds = listRes.body.experts.map(e => e.id);
    expect(uzmanIds).toContain(uzmanId);
  });

  test('1.5 — pending_expert profil güncelleyemez (403)', async () => {
    const { token } = await request(app).post('/api/auth/register').then(async () => {
      const r = await request(app).post('/api/auth/register').send({
        firstName: 'Pending', lastName: 'Expert', email: 'pending@test.com',
        password: 'Test1234!', role: 'pending_expert',
      });
      return { token: r.body.token };
    });

    const res = await request(app)
      .patch('/api/experts/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Deneme', price: 300 });

    expect(res.status).toBe(403);
  });

  test('1.6 — admin reddederse role customer olur', async () => {
    const uzmanRes = await request(app).post('/api/auth/register').send({
      firstName: 'Red', lastName: 'Edilecek', email: 'red@test.com',
      password: 'Test1234!', role: 'pending_expert',
    });
    const uzmanId = uzmanRes.body.user.id;

    const admin = await createAdmin();
    const rejectRes = await request(app)
      .patch(`/api/admin/applications/${uzmanId}/reject`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ reason: 'Belgeler eksik' });

    expect(rejectRes.status).toBe(200);

    const user = await dbGet('SELECT role FROM users WHERE id = ?', uzmanId);
    expect(user.role).toBe('customer');
  });
});

/* ══════════════════════════════════════════════════════════
   2. REZERVASYON AKIŞI
   Müşteri giriş → uzman bul → rezervasyon yap → uzman panelde görsün
══════════════════════════════════════════════════════════ */
describe('2. Rezervasyon Akışı', () => {

  async function setupApprovedExpert() {
    const uzmanRes = await request(app).post('/api/auth/register').send({
      firstName: 'Onaylı', lastName: 'Uzman',
      email:     `uzman_rez_${Date.now()}@test.com`,
      password:  'Test1234!',
      role:      'pending_expert',
      expertProfile: { price: 300, bio: 'Bio', city: 'İstanbul', tags: ['Elektrik'] }
    });
    const uzmanId    = uzmanRes.body.user.id;
    const uzmanToken = uzmanRes.body.token;

    const admin = await createAdmin();
    await request(app)
      .patch(`/api/admin/applications/${uzmanId}/approve`)
      .set('Authorization', `Bearer ${admin.token}`);

    return { uzmanId, uzmanToken };
  }

  test('2.1 — müşteri uzman profilini API\'den çekebilir', async () => {
    const { uzmanId } = await setupApprovedExpert();

    const res = await request(app).get(`/api/experts/${uzmanId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.expert.id).toBe(uzmanId);
    expect(res.body.expert.price).toBe(300);
    expect(res.body.expert.tags).toContain('Elektrik');
  });

  test('2.2 — müşteri rezervasyon oluşturabilir', async () => {
    const { uzmanId } = await setupApprovedExpert();
    const customer    = await createCustomer();

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        expertId:      uzmanId,
        service:       'Elektrik Tamiri',
        date:          '2026-09-10',
        time:          '10:00',
        durationType:  'hours',
        durationValue: 2,
        durationLabel: '2 saat',
        totalPrice:    600,
        slots:         ['2026-09-10_10:00', '2026-09-10_11:00'],
        city:          'İstanbul',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.status).toBe('pending');
    expect(res.body.booking.expertId).toBe(uzmanId);
  });

  test('2.3 — aynı slota iki farklı müşteri rezervasyon yapamaz', async () => {
    const { uzmanId } = await setupApprovedExpert();
    const musteri1    = await createCustomer('m1');
    const musteri2    = await createCustomer('m2');
    const bookingData = {
      expertId: uzmanId, service: 'Test',
      date: '2026-09-11', time: '14:00',
      slots: ['2026-09-11_14:00'],
      durationType: 'hours', durationValue: 1, totalPrice: 300, city: 'İstanbul',
    };

    const res1 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${musteri1.token}`)
      .send(bookingData);
    expect(res1.status).toBe(201);

    const res2 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${musteri2.token}`)
      .send(bookingData);
    expect(res2.status).toBe(409); // Çakışma
  });

  test('2.4 — uzman kendi rezervasyonlarını görebilir', async () => {
    const { uzmanId, uzmanToken } = await setupApprovedExpert();
    const customer                = await createCustomer();

    // Rezervasyon oluştur
    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        expertId: uzmanId, service: 'Test',
        date: '2026-09-12', time: '09:00',
        slots: ['2026-09-12_09:00'],
        durationType: 'hours', durationValue: 1, totalPrice: 300,
      });

    // Uzman kendi rezervasyonlarına baksın
    const res = await request(app)
      .get('/api/bookings/expert')
      .set('Authorization', `Bearer ${uzmanToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.bookings.length).toBeGreaterThan(0);
    expect(res.body.bookings[0].expertId).toBe(uzmanId);
  });

  test('2.5 — müşteri kendi rezervasyonlarını görebilir', async () => {
    const { uzmanId } = await setupApprovedExpert();
    const customer    = await createCustomer();

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        expertId: uzmanId, service: 'Test',
        date: '2026-09-13', time: '11:00',
        slots: ['2026-09-13_11:00'],
        durationType: 'hours', durationValue: 1, totalPrice: 300,
      });

    const res = await request(app)
      .get('/api/bookings/my')
      .set('Authorization', `Bearer ${customer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.bookings.length).toBeGreaterThan(0);
    expect(res.body.bookings[0].customerId).toBe(customer.user.id);
  });

  test('2.6 — uzman rezervasyonu onayladığında durum confirmed olur', async () => {
    const { uzmanId, uzmanToken } = await setupApprovedExpert();
    const customer                = await createCustomer();

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        expertId: uzmanId, service: 'Test',
        date: '2026-09-14', time: '15:00',
        slots: ['2026-09-14_15:00'],
        durationType: 'hours', durationValue: 1, totalPrice: 300,
      });
    const bookingId = bookRes.body.booking.id;

    const updateRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${uzmanToken}`)
      .send({ status: 'confirmed' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.booking.status).toBe('confirmed');
  });
});

/* ══════════════════════════════════════════════════════════
   3. ŞİFRE SIFIRLAMA AKIŞI
══════════════════════════════════════════════════════════ */
describe('3. Şifre Sıfırlama Akışı', () => {

  test('3.1 — kayıtlı e-posta için token oluşturulur', async () => {
    await request(app).post('/api/auth/register').send({
      firstName: 'Şifre', lastName: 'Test', email: 'sifre@test.com', password: 'Test1234!'
    });

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'sifre@test.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Dev modunda token response'da dönmeli
    expect(res.body.devToken).toBeDefined();
  });

  test('3.2 — kayıtsız e-posta için de başarılı döner (enum koruması)', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'yok@test.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Ama devToken olmamalı (kullanıcı yok)
    expect(res.body.devToken).toBeUndefined();
  });

  test('3.3 — geçerli token ile şifre sıfırlanır', async () => {
    await request(app).post('/api/auth/register').send({
      firstName: 'Reset', lastName: 'Test', email: 'reset@test.com', password: 'EskiSifre1!'
    });
    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'reset@test.com' });

    const token = forgotRes.body.devToken;
    expect(token).toBeDefined();

    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword: 'YeniSifre1234!' });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);
  });

  test('3.4 — yeni şifre ile giriş yapılır, eski şifre çalışmaz', async () => {
    await request(app).post('/api/auth/register').send({
      firstName: 'Eski', lastName: 'Sifre', email: 'eskisifre@test.com', password: 'EskiSifre1!'
    });
    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'eskisifre@test.com' });

    await request(app)
      .post('/api/auth/reset-password')
      .send({ token: forgotRes.body.devToken, newPassword: 'YeniSifre1234!' });

    // Eski şifre çalışmaz
    const oldLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'eskisifre@test.com', password: 'EskiSifre1!' });
    expect(oldLogin.status).toBe(401);

    // Yeni şifre çalışır
    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'eskisifre@test.com', password: 'YeniSifre1234!' });
    expect(newLogin.status).toBe(200);
    expect(newLogin.body.token).toBeDefined();
  });

  test('3.5 — aynı token iki kez kullanılamaz', async () => {
    await request(app).post('/api/auth/register').send({
      firstName: 'Tek', lastName: 'Kullanim', email: 'tekkullanim@test.com', password: 'Test1234!'
    });
    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'tekkullanim@test.com' });
    const token = forgotRes.body.devToken;

    await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword: 'YeniSifre1234!' });

    const res2 = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword: 'BaskaSifre5678!' });

    expect(res2.status).toBe(400);
    expect(res2.body.success).toBe(false);
  });
});

/* ══════════════════════════════════════════════════════════
   4. VERİ TUTARLILIĞI — API formatı ile frontend beklentisi uyuşuyor mu
══════════════════════════════════════════════════════════ */
describe('4. Veri Tutarlılığı', () => {

  async function getApprovedExpert() {
    const uzmanRes = await request(app).post('/api/auth/register').send({
      firstName: 'Format', lastName: 'Uzman',
      email:     `format_${Date.now()}@test.com`,
      password:  'Test1234!',
      role:      'pending_expert',
      expertProfile: { price: 400, bio: 'Format test bio', city: 'İstanbul', tags: ['Elektrik', 'Boya'] }
    });
    const uzmanId = uzmanRes.body.user.id;
    const admin = await createAdmin();
    await request(app)
      .patch(`/api/admin/applications/${uzmanId}/approve`)
      .set('Authorization', `Bearer ${admin.token}`);
    return uzmanId;
  }

  test('4.1 — uzman listesi frontend için gerekli tüm alanları içeriyor', async () => {
    const uzmanId = await getApprovedExpert();
    const res = await request(app).get('/api/experts');

    expect(res.status).toBe(200);
    const expert = res.body.experts.find(e => e.id === uzmanId);
    expect(expert).toBeDefined();

    // Frontend'in beklediği alanlar
    expect(expert).toHaveProperty('id');
    expect(expert).toHaveProperty('name');
    expect(expert).toHaveProperty('price');
    expect(expert).toHaveProperty('bio');
    expect(expert).toHaveProperty('city');
    expect(expert).toHaveProperty('tags');
    expect(expert).toHaveProperty('rating');
    expect(expert).toHaveProperty('avatar');
    expect(Array.isArray(expert.tags)).toBe(true);
    expect(expert.city).toBe('İstanbul');
    expect(expert.price).toBe(400);
  });

  test('4.2 — uzman profil detayı yorum listesi içeriyor', async () => {
    const uzmanId = await getApprovedExpert();
    const res = await request(app).get(`/api/experts/${uzmanId}`);

    expect(res.status).toBe(200);
    expect(res.body.expert).toHaveProperty('reviewList');
    expect(Array.isArray(res.body.expert.reviewList)).toBe(true);
  });

  test('4.3 — şehir filtresi doğru çalışıyor', async () => {
    const uzmanId = await getApprovedExpert(); // İstanbul'da
    const res = await request(app).get('/api/experts?city=Ankara');

    expect(res.status).toBe(200);
    // İstanbul'daki uzman Ankara filtresinde çıkmamalı
    const ids = res.body.experts.map(e => e.id);
    expect(ids).not.toContain(uzmanId);
  });

  test('4.4 — kategori filtresi doğru çalışıyor', async () => {
    const uzmanId = await getApprovedExpert(); // Elektrik ve Boya tag'leri var
    const res = await request(app).get('/api/experts?category=Elektrik');

    expect(res.status).toBe(200);
    const ids = res.body.experts.map(e => e.id);
    expect(ids).toContain(uzmanId);
  });

  test('4.5 — rezervasyon formatı frontend beklentisiyle uyuşuyor', async () => {
    const uzmanId  = await getApprovedExpert();
    const customer = await createCustomer('format');

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        expertId: uzmanId, service: 'Elektrik', date: '2026-09-20',
        time: '10:00', slots: ['2026-09-20_10:00'],
        durationType: 'hours', durationValue: 1, totalPrice: 400,
      });

    expect(res.status).toBe(201);
    const b = res.body.booking;

    // Frontend'in beklediği alanlar
    expect(b).toHaveProperty('id');
    expect(b).toHaveProperty('expertId');
    expect(b).toHaveProperty('customerId');
    expect(b).toHaveProperty('service');
    expect(b).toHaveProperty('date');
    expect(b).toHaveProperty('status');
    expect(b).toHaveProperty('totalPrice');
    expect(b.status).toBe('pending');
    expect(b.expertId).toBe(uzmanId);
    expect(b.customerId).toBe(customer.user.id);
  });
});
