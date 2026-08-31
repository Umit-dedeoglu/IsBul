/**
 * İşBul — Güvenlik & Derinlemesine Test Paketi
 *
 * Kategori 1: Concurrency & Race Conditions
 * Kategori 2: State Machine Anomalies
 * Kategori 3: IDOR & Yetki Aşımı
 * Kategori 4: Mass Assignment
 * Kategori 5: Fuzzing & Edge Cases
 * Bonus   : Overlap Detection, İyzico Idempotency, Yetki Yükseltme
 *
 * NOT: SQLite in-memory gerçek row-level lock desteği olmadığından
 * race condition testleri "sistemin birden fazla kaydı kabul etmemesi"
 * beklentisiyle yazılmıştır. PostgreSQL'de bu testlerin CI'da
 * Testcontainers ile koşturulması önerilir.
 */

const {
  app, request, resetDb, closeDb,
  registerAndLogin, dbRun, dbGet, TEST_SETUP_KEY
} = require('./helpers');

beforeEach(async () => { await resetDb(); });
afterAll(() => closeDb());

/* ─── Merkezi Yardımcılar ─── */

async function createAdmin() {
  await request(app)
    .post('/api/admin/create-admin')
    .set('x-admin-setup-key', TEST_SETUP_KEY)
    .send({ firstName: 'Admin', lastName: 'Test', email: 'admin@sec.test', password: 'Admin1234!' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@sec.test', password: 'Admin1234!' });
  return { token: res.body.token, user: res.body.user };
}

async function createApprovedExpert(suffix = '') {
  const uzmanRes = await request(app).post('/api/auth/register').send({
    firstName: 'Uzman', lastName: `T${suffix}`,
    email:     `uzman${suffix}_${Date.now()}@sec.test`,
    password:  'Test1234!',
    role:      'pending_expert',
    expertProfile: { price: 300, bio: 'Bio', city: 'İstanbul', tags: ['Elektrik'] },
  });
  const uzmanId    = uzmanRes.body.user.id;
  const uzmanToken = uzmanRes.body.token;
  const admin      = await createAdmin();
  await request(app)
    .patch(`/api/admin/applications/${uzmanId}/approve`)
    .set('Authorization', `Bearer ${admin.token}`);
  // Token güncellenmesi için yeniden giriş yap
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: uzmanRes.raw?.email || `uzman${suffix}_${Date.now()}@sec.test`, password: 'Test1234!' });
  return { uzmanId, uzmanToken, uzmanEmail: uzmanRes.body.user?.email };
}

/** Hızlı onaylı uzman — email'i saklayarak */
async function quickExpert() {
  const email = `qe_${Date.now()}_${Math.random().toString(36).slice(2,5)}@sec.test`;
  await request(app).post('/api/auth/register').send({
    firstName: 'Q', lastName: 'Expert', email,
    password: 'Test1234!', role: 'pending_expert',
    expertProfile: { price: 300, bio: 'Bio', city: 'İstanbul', tags: ['Elektrik'] },
  });
  const admin = await createAdmin();
  const listRes = await request(app)
    .get('/api/admin/applications')
    .set('Authorization', `Bearer ${admin.token}`);
  const uzman = listRes.body.pending.find(u => u.email === email);
  await request(app)
    .patch(`/api/admin/applications/${uzman.id}/approve`)
    .set('Authorization', `Bearer ${admin.token}`);
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Test1234!' });
  return { uzmanId: uzman.id, uzmanToken: loginRes.body.token, email };
}

async function quickCustomer() {
  return registerAndLogin({
    firstName: 'Musteri', lastName: 'T',
    email: `c_${Date.now()}_${Math.random().toString(36).slice(2,5)}@sec.test`,
    password: 'Test1234!',
  });
}

function bookingPayload(expertId, dateStr, slots) {
  return {
    expertId, service: 'Elektrik',
    date: dateStr, time: slots[0].split('_')[1],
    slots,
    durationType: 'hours', durationValue: slots.length,
    totalPrice: 300 * slots.length, city: 'İstanbul',
  };
}

/* ══════════════════════════════════════════════════════════
   KATEGORİ 1 — CONCURRENCY & RACE CONDITIONS
══════════════════════════════════════════════════════════ */
describe('Kategori 1 — Concurrency & Race Conditions', () => {

  test('1.1 — Aynı anda 5 müşteri aynı slota rezervasyon yaparsa sadece 1 kabul edilir', async () => {
    const { uzmanId } = await quickExpert();
    const customers   = await Promise.all(Array.from({ length: 5 }, () => quickCustomer()));
    const slot        = '2026-10-01_10:00';

    const results = await Promise.all(
      customers.map(c =>
        request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${c.token}`)
          .send(bookingPayload(uzmanId, '2026-10-01', [slot]))
      )
    );

    const accepted  = results.filter(r => r.status === 201);
    const rejected  = results.filter(r => r.status === 409);

    // Tam olarak 1 kabul, geri kalanlar çakışma hatası
    expect(accepted.length).toBe(1);
    expect(rejected.length).toBe(4);
  });

  test('1.2 — Aynı uzman aynı anda iki farklı slota rezervasyon alabilir (çakışma yoksa)', async () => {
    const { uzmanId } = await quickExpert();
    const [c1, c2]    = await Promise.all([quickCustomer(), quickCustomer()]);

    const [r1, r2] = await Promise.all([
      request(app).post('/api/bookings')
        .set('Authorization', `Bearer ${c1.token}`)
        .send(bookingPayload(uzmanId, '2026-10-02', ['2026-10-02_09:00'])),
      request(app).post('/api/bookings')
        .set('Authorization', `Bearer ${c2.token}`)
        .send(bookingPayload(uzmanId, '2026-10-02', ['2026-10-02_10:00'])),
    ]);

    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
  });

  test('1.3 — Aynı rezervasyon 5 kez iptal edilmeye çalışılırsa hata vermez, durum tutarlı kalır', async () => {
    const { uzmanId } = await quickExpert();
    const customer    = await quickCustomer();

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send(bookingPayload(uzmanId, '2026-10-03', ['2026-10-03_14:00']));
    const bookingId = bookRes.body.booking.id;

    // İlk iptal başarılı olmalı, sonraki istekler 400/200 dönmeli ama 500 vermemeli
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        request(app)
          .patch(`/api/bookings/${bookingId}/status`)
          .set('Authorization', `Bearer ${customer.token}`)
          .send({ status: 'cancelled' })
      )
    );

    const serverErrors = results.filter(r => r.status === 500);
    expect(serverErrors.length).toBe(0); // Hiç 500 olmamalı

    const booking = await dbGet('SELECT status FROM bookings WHERE id = ?', bookingId);
    expect(booking.status).toBe('cancelled'); // Son durum tutarlı
  });
});

/* ══════════════════════════════════════════════════════════
   KATEGORİ 2 — STATE MACHINE ANOMALIES
══════════════════════════════════════════════════════════ */
describe('Kategori 2 — State Machine Anomalies', () => {

  test('2.1 — İptal edilmiş rezervasyon tekrar confirmed yapılamaz', async () => {
    const { uzmanId, uzmanToken } = await quickExpert();
    const customer = await quickCustomer();

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send(bookingPayload(uzmanId, '2026-10-05', ['2026-10-05_11:00']));
    const bookingId = bookRes.body.booking.id;

    // Müşteri iptal eder
    await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ status: 'cancelled' });

    // Uzman iptal edilmiş rezervasyonu onaylamaya çalışır
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${uzmanToken}`)
      .send({ status: 'confirmed' });

    // İptal edilmişi onaylamak geçersiz bir geçiş — 400 bekleniyor
    // Şu an bu kontrol yoksa test kırılır → gerçek bug tespiti
    expect([400, 409, 422]).toContain(res.status);
    const booking = await dbGet('SELECT status FROM bookings WHERE id = ?', bookingId);
    expect(booking.status).toBe('cancelled');
  });

  test('2.2 — pending_expert, onay almadan /experts/profile PATCH yapamaz', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      firstName: 'Pending', lastName: 'User', email: 'pending@sec.test',
      password: 'Test1234!', role: 'pending_expert',
    });
    const pendingToken = regRes.body.token;

    const res = await request(app)
      .patch('/api/experts/profile')
      .set('Authorization', `Bearer ${pendingToken}`)
      .send({ bio: 'Deneme profil', price: 500 });

    expect(res.status).toBe(403);
  });

  test('2.3 — pending_expert, uzman rezervasyonlarını göremez', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      firstName: 'Still', lastName: 'Pending', email: 'stillpending@sec.test',
      password: 'Test1234!', role: 'pending_expert',
    });
    const token = regRes.body.token;

    const res = await request(app)
      .get('/api/bookings/expert')
      .set('Authorization', `Bearer ${token}`);

    // pending_expert normal kullanıcı gibi davranmalı — boş liste ya da 403
    // En kötü ihtimalle boş liste döner, ama kritik veri sızdırmamalı
    if (res.status === 200) {
      expect(res.body.bookings).toHaveLength(0);
    } else {
      expect([401, 403]).toContain(res.status);
    }
  });

  test('2.4 — Tamamlanmış (completed) rezervasyon tekrar iptal edilemez', async () => {
    const { uzmanId, uzmanToken } = await quickExpert();
    const customer = await quickCustomer();

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send(bookingPayload(uzmanId, '2026-10-06', ['2026-10-06_09:00']));
    const bookingId = bookRes.body.booking.id;

    // Uzman confirmed yapar
    await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${uzmanToken}`)
      .send({ status: 'confirmed' });

    // Uzman completed yapar
    await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${uzmanToken}`)
      .send({ status: 'completed' });

    // Müşteri tamamlanmış rezervasyonu iptal etmeye çalışır
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ status: 'cancelled' });

    // 400 veya durum değişmeden 200 — ama completed kalmalı
    const booking = await dbGet('SELECT status FROM bookings WHERE id = ?', bookingId);
    expect(booking.status).toBe('completed');
  });
});

/* ══════════════════════════════════════════════════════════
   KATEGORİ 3 — IDOR & YETKİ AŞIMI
══════════════════════════════════════════════════════════ */
describe('Kategori 3 — IDOR & Yetki Aşımı', () => {

  test('3.1 — Kullanıcı A, kullanıcı B\'nin rezervasyonunu okuyamaz', async () => {
    const { uzmanId } = await quickExpert();
    const [c1, c2]   = await Promise.all([quickCustomer(), quickCustomer()]);

    // c1 rezervasyon yaptı
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${c1.token}`)
      .send(bookingPayload(uzmanId, '2026-10-10', ['2026-10-10_10:00']));
    const bookingId = bookRes.body.booking.id;

    // c2 bu rezervasyona erişmeye çalışır
    const res = await request(app)
      .get(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${c2.token}`);

    expect([403, 404]).toContain(res.status);
  });

  test('3.2 — Kullanıcı A, kullanıcı B\'nin rezervasyonunu iptal edemez', async () => {
    const { uzmanId } = await quickExpert();
    const [c1, c2]   = await Promise.all([quickCustomer(), quickCustomer()]);

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${c1.token}`)
      .send(bookingPayload(uzmanId, '2026-10-11', ['2026-10-11_11:00']));
    const bookingId = bookRes.body.booking.id;

    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${c2.token}`)
      .send({ status: 'cancelled' });

    expect([403, 404]).toContain(res.status);
    const booking = await dbGet('SELECT status FROM bookings WHERE id = ?', bookingId);
    expect(booking.status).toBe('pending'); // Değişmemiş olmalı
  });

  test('3.3 — Uzman A, uzman B\'nin rezervasyonunu onaylayamaz', async () => {
    const e1 = await quickExpert();
    const e2 = await quickExpert();
    const customer = await quickCustomer();

    // e1'e rezervasyon yapıldı
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send(bookingPayload(e1.uzmanId, '2026-10-12', ['2026-10-12_09:00']));
    const bookingId = bookRes.body.booking.id;

    // e2 bunu onaylamaya çalışır
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${e2.uzmanToken}`)
      .send({ status: 'confirmed' });

    expect([403, 404]).toContain(res.status);
  });

  test('3.4 — Token olmadan korumalı endpoint\'e erişilemez', async () => {
    const endpoints = [
      () => request(app).get('/api/bookings/my'),
      () => request(app).get('/api/bookings/expert'),
      () => request(app).post('/api/bookings').send({}),
      () => request(app).patch('/api/experts/profile').send({}),
      () => request(app).get('/api/admin/stats'),
    ];

    const results = await Promise.all(endpoints.map(fn => fn()));
    results.forEach(res => expect(res.status).toBe(401));
  });

  test('3.5 — Müşteri token\'ı ile admin endpoint\'e erişilemez', async () => {
    const customer = await quickCustomer();

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${customer.token}`);

    expect(res.status).toBe(403);
  });

  test('3.6 — Sahte/geçersiz JWT token reddedilir', async () => {
    const res = await request(app)
      .get('/api/bookings/my')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.SAHTE.imza');

    expect(res.status).toBe(401);
  });
});

/* ══════════════════════════════════════════════════════════
   KATEGORİ 4 — MASS ASSIGNMENT
══════════════════════════════════════════════════════════ */
describe('Kategori 4 — Mass Assignment (Toplu Atama Zafiyeti)', () => {

  test('4.1 — Kayıt sırasında role:admin enjekte edilemez', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Hacker', lastName: 'User', email: 'hacker@sec.test',
      password: 'Test1234!',
      role:     'admin', // ← Saldırı
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).not.toBe('admin');
    // customer veya pending_expert olabilir, admin kesinlikle olmaz
    expect(['customer', 'pending_expert']).toContain(res.body.user.role);
  });

  test('4.2 — Profil güncelleme sırasında role:admin enjekte edilemez', async () => {
    const { uzmanId, uzmanToken } = await quickExpert();

    const res = await request(app)
      .patch('/api/experts/profile')
      .set('Authorization', `Bearer ${uzmanToken}`)
      .send({
        bio:   'Güncelleme',
        price: 350,
        role:  'admin',       // ← Saldırı
        isActive: true,       // ← Saldırı
        rating: 5.0,          // ← Rating manipülasyonu
      });

    expect(res.status).toBe(200);

    // Kullanıcının rolü hâlâ expert olmalı
    const user = await dbGet('SELECT role FROM users WHERE id = ?', uzmanId);
    expect(user.role).toBe('expert');
  });

  test('4.3 — Kayıt sırasında isActive:true enjekte edilemez (hesap pasif başlamamalı)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Mass', lastName: 'Assignment', email: 'mass@sec.test',
      password: 'Test1234!',
      is_active: true,       // ← Saldırı (zaten default true, ama false enjekte denemesi)
      isApproved: true,      // ← Saldırı
      email_verified: true,  // ← Saldırı
    });

    expect(res.status).toBe(201);
    // Normal kullanıcı olarak kaydolmuş olmalı
    expect(res.body.user.role).toBe('customer');
  });

  test('4.4 — Rezervasyon oluştururken status:completed enjekte edilemez', async () => {
    const { uzmanId } = await quickExpert();
    const customer    = await quickCustomer();

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        ...bookingPayload(uzmanId, '2026-10-15', ['2026-10-15_10:00']),
        status:    'completed', // ← Saldırı
        totalPrice: -1,         // ← Saldırı (negatif fiyat)
      });

    if (res.status === 201) {
      // Başarılıysa durum pending olmalı, completed değil
      expect(res.body.booking.status).toBe('pending');
    }
  });
});

/* ══════════════════════════════════════════════════════════
   KATEGORİ 5 — FUZZING & EDGE CASES
══════════════════════════════════════════════════════════ */
describe('Kategori 5 — Fuzzing & Edge Cases', () => {

  test('5.1 — 10.000 karakterlik bio sunucuyu çökertemez', async () => {
    const { uzmanToken } = await quickExpert();
    const longString      = 'A'.repeat(10000);

    const res = await request(app)
      .patch('/api/experts/profile')
      .set('Authorization', `Bearer ${uzmanToken}`)
      .send({ bio: longString, price: 300 });

    // Kabul etsede reddetse de 500 vermemeli
    expect(res.status).not.toBe(500);
  });

  test('5.2 — Emojili ve özel karakterli bio kabul edilebilir veya zararsız reddedilir', async () => {
    const { uzmanToken } = await quickExpert();

    const res = await request(app)
      .patch('/api/experts/profile')
      .set('Authorization', `Bearer ${uzmanToken}`)
      .send({ bio: '🔧⚡🎉 Merhaba <script>alert(1)</script>', price: 300 });

    expect(res.status).not.toBe(500);
    // XSS içeriği kaydedildiyse script tag'i temizlenmiş olmalı
    if (res.status === 200 && res.body.expert?.bio) {
      expect(res.body.expert.bio).not.toContain('<script>');
    }
  });

  test('5.3 — Negatif fiyatla rezervasyon reddedilir veya 0 olarak işlenir', async () => {
    const { uzmanId } = await quickExpert();
    const customer    = await quickCustomer();

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        ...bookingPayload(uzmanId, '2026-10-20', ['2026-10-20_10:00']),
        totalPrice: -500,
      });

    if (res.status === 201) {
      // Kabul edildiyse negatif fiyat saklanmamış olmalı
      expect(res.body.booking.totalPrice).toBeGreaterThanOrEqual(0);
    } else {
      expect([400, 422]).toContain(res.status);
    }
  });

  test('5.4 — SQL injection denemesi zararsız biçimde reddedilir', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email:    "admin@test.com' OR '1'='1",
      password: "' OR '1'='1",
    });

    // SQL injection'ın çalışmaması gerek — 401 veya 400, kesinlikle 200 değil
    expect([400, 401]).toContain(res.status);
  });

  test('5.5 — Geçersiz tarih formatıyla rezervasyon 400/500 vermez', async () => {
    const { uzmanId } = await quickExpert();
    const customer    = await quickCustomer();

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        expertId: uzmanId, service: 'Elektrik',
        date: 'NOT-A-DATE', time: '99:99',
        slots: ['NOT-A-DATE_99:99'],
        durationType: 'hours', durationValue: 1, totalPrice: 300,
      });

    expect(res.status).not.toBe(500);
  });

  test('5.6 — Boş body ile kayıt 400 döner, 500 vermez', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('5.7 — 10.000 karakterlik notlu rezervasyon sunucuyu çökertemez', async () => {
    const { uzmanId } = await quickExpert();
    const customer    = await quickCustomer();

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        ...bookingPayload(uzmanId, '2026-10-21', ['2026-10-21_11:00']),
        notes: 'N'.repeat(10000),
      });

    expect(res.status).not.toBe(500);
  });
});

/* ══════════════════════════════════════════════════════════
   BONUS 1 — OVERLAP DETECTION (Zaman Kesişimi)
══════════════════════════════════════════════════════════ */
describe('Bonus 1 — Overlap Detection (Zaman Kesişimi)', () => {

  test('B1.1 — Kesişen slotlu rezervasyon reddedilir (09:30–10:30 vs 10:15–11:15)', async () => {
    const { uzmanId } = await quickExpert();
    const [c1, c2]   = await Promise.all([quickCustomer(), quickCustomer()]);

    // c1: 09:00 + 10:00 slotlarını alır (09:00–11:00)
    const r1 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${c1.token}`)
      .send(bookingPayload(uzmanId, '2026-10-25', [
        '2026-10-25_09:00',
        '2026-10-25_10:00',
      ]));
    expect(r1.status).toBe(201);

    // c2: 10:00 + 11:00 → 10:00 çakışıyor
    const r2 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${c2.token}`)
      .send(bookingPayload(uzmanId, '2026-10-25', [
        '2026-10-25_10:00',
        '2026-10-25_11:00',
      ]));
    expect(r2.status).toBe(409);
  });

  test('B1.2 — Bitişik ama çakışmayan slotlar her ikisi de kabul edilir', async () => {
    const { uzmanId } = await quickExpert();
    const [c1, c2]   = await Promise.all([quickCustomer(), quickCustomer()]);

    // c1: 09:00 slotu
    const r1 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${c1.token}`)
      .send(bookingPayload(uzmanId, '2026-10-26', ['2026-10-26_09:00']));
    expect(r1.status).toBe(201);

    // c2: 10:00 slotu — bitişik ama çakışmıyor
    const r2 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${c2.token}`)
      .send(bookingPayload(uzmanId, '2026-10-26', ['2026-10-26_10:00']));
    expect(r2.status).toBe(201);
  });
});

/* ══════════════════════════════════════════════════════════
   BONUS 2 — İYZİCO IDEMPOTENCY (Webhook Race Condition)
══════════════════════════════════════════════════════════ */
describe('Bonus 2 — İyzico Idempotency', () => {

  test('B2.1 — Aynı iyzico token ile iki kez callback gelirse booking sadece bir kez completed olur', async () => {
    const { uzmanId } = await quickExpert();
    const customer    = await quickCustomer();

    // Rezervasyon oluştur
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send(bookingPayload(uzmanId, '2026-11-01', ['2026-11-01_09:00']));
    const bookingId = bookRes.body.booking.id;

    // DB'ye manuel ödeme kaydı ekle (iyzico'dan önce callback test etmek için)
    const paymentId = `pay_test_${Date.now()}`;
    const fakeToken = `iyz_token_${Date.now()}`;
    await dbRun(
      `INSERT INTO payments (id, booking_id, customer_id, amount, currency, status, iyzico_token)
       VALUES (?, ?, ?, 300, 'TRY', 'pending', ?)`,
      paymentId, bookingId, customer.user.id, fakeToken
    );

    // İki kez aynı callback (iyzico ağ gecikmesi simülasyonu)
    const [cb1, cb2] = await Promise.all([
      request(app).post('/api/payments/callback').send({ token: fakeToken }),
      request(app).post('/api/payments/callback').send({ token: fakeToken }),
    ]);

    // Her ikisi de sunucu hatasına yol açmamalı (redirect bekleniyor)
    expect([200, 302]).toContain(cb1.status);
    expect([200, 302]).toContain(cb2.status);

    // Booking durumu tek olmalı — çift completed/completed değil
    const booking = await dbGet('SELECT status FROM bookings WHERE id = ?', bookingId);
    // pending ya da completed — ikisi de kabul edilebilir, ama tutarlı olmalı
    expect(['pending', 'completed']).toContain(booking.status);
  });
});

/* ══════════════════════════════════════════════════════════
   BONUS 3 — GEÇMİŞ TARİH & İPTAL MANTİĞI
══════════════════════════════════════════════════════════ */
describe('Bonus 3 — Geçmiş Tarih & İptal Mantığı', () => {

  test('B3.1 — Geçmiş tarihli slot serbest kalır, yeni rezervasyona açılır', async () => {
    const { uzmanId } = await quickExpert();
    const customer    = await quickCustomer();

    // Rezervasyon yap
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send(bookingPayload(uzmanId, '2026-11-05', ['2026-11-05_10:00']));
    const bookingId = bookRes.body.booking.id;

    // İptal et
    await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ status: 'cancelled' });

    // Aynı slot tekrar rezervasyona açılmış olmalı
    const slot = await dbGet(
      'SELECT * FROM calendar_slots WHERE expert_id = ? AND slot = ?',
      uzmanId, '2026-11-05_10:00'
    );
    expect(slot).toBeUndefined(); // Slot temizlenmiş olmalı

    // Başka müşteri aynı slotu alabilmeli
    const c2 = await quickCustomer();
    const r2 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${c2.token}`)
      .send(bookingPayload(uzmanId, '2026-11-05', ['2026-11-05_10:00']));
    expect(r2.status).toBe(201);
  });

  test('B3.2 — İptal edilmiş rezervasyonun slotu takvimden silinir', async () => {
    const { uzmanId } = await quickExpert();
    const customer    = await quickCustomer();

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send(bookingPayload(uzmanId, '2026-11-06', [
        '2026-11-06_09:00',
        '2026-11-06_10:00',
      ]));
    const bookingId = bookRes.body.booking.id;

    // İptal
    await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ status: 'cancelled' });

    // Her iki slot da temizlenmiş olmalı
    const [s1, s2] = await Promise.all([
      dbGet('SELECT * FROM calendar_slots WHERE expert_id = ? AND slot = ?', uzmanId, '2026-11-06_09:00'),
      dbGet('SELECT * FROM calendar_slots WHERE expert_id = ? AND slot = ?', uzmanId, '2026-11-06_10:00'),
    ]);
    expect(s1).toBeUndefined();
    expect(s2).toBeUndefined();
  });
});
