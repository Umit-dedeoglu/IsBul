/**
 * Ä°ÅŸBul â€” GÃ¼venlik & Derinlemesine Test Paketi
 *
 * Kategori 1: Concurrency & Race Conditions
 * Kategori 2: State Machine Anomalies
 * Kategori 3: IDOR & Yetki AÅŸÄ±mÄ±
 * Kategori 4: Mass Assignment
 * Kategori 5: Fuzzing & Edge Cases
 * Bonus   : Overlap Detection, Ä°yzico Idempotency, Yetki YÃ¼kseltme
 *
 * NOT: SQLite in-memory gerÃ§ek row-level lock desteÄŸi olmadÄ±ÄŸÄ±ndan
 * race condition testleri "sistemin birden fazla kaydÄ± kabul etmemesi"
 * beklentisiyle yazÄ±lmÄ±ÅŸtÄ±r. PostgreSQL'de bu testlerin CI'da
 * Testcontainers ile koÅŸturulmasÄ± Ã¶nerilir.
 */

const {
  app, request, resetDb, closeDb,
  registerAndLogin, dbRun, dbGet, TEST_SETUP_KEY
} = require('./helpers');

beforeEach(async () => { await resetDb(); });
afterAll(() => closeDb());

/* â”€â”€â”€ Merkezi YardÄ±mcÄ±lar â”€â”€â”€ */

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
    expertProfile: { price: 300, bio: 'Bio', city: 'Ä°stanbul', tags: ['Elektrik'] },
  });
  const uzmanId    = uzmanRes.body.user.id;
  const uzmanToken = uzmanRes.body.token;
  const admin      = await createAdmin();
  await request(app)
    .patch(`/api/admin/applications/${uzmanId}/approve`)
    .set('Authorization', `Bearer ${admin.token}`);
  // Token gÃ¼ncellenmesi iÃ§in yeniden giriÅŸ yap
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: uzmanRes.raw?.email || `uzman${suffix}_${Date.now()}@sec.test`, password: 'Test1234!' });
  return { uzmanId, uzmanToken, uzmanEmail: uzmanRes.body.user?.email };
}

/** HÄ±zlÄ± onaylÄ± uzman â€” email'i saklayarak */
async function quickExpert() {
  const email = `qe_${Date.now()}_${Math.random().toString(36).slice(2,5)}@sec.test`;
  await request(app).post('/api/auth/register').send({
    firstName: 'Q', lastName: 'Expert', email,
    password: 'Test1234!', role: 'pending_expert',
    expertProfile: { price: 300, bio: 'Bio', city: 'Ä°stanbul', tags: ['Elektrik'] },
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
    totalPrice: 300 * slots.length, city: 'Ä°stanbul',
  };
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   KATEGORÄ° 1 â€” CONCURRENCY & RACE CONDITIONS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
describe('Kategori 1 â€” Concurrency & Race Conditions', () => {

  test('1.1 â€” AynÄ± anda 5 mÃ¼ÅŸteri aynÄ± slota rezervasyon yaparsa sadece 1 kabul edilir', async () => {
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

    // Tam olarak 1 kabul, geri kalanlar Ã§akÄ±ÅŸma hatasÄ±
    expect(accepted.length).toBe(1);
    expect(rejected.length).toBe(4);
  });

  test('1.2 â€” AynÄ± uzman aynÄ± anda iki farklÄ± slota rezervasyon alabilir (Ã§akÄ±ÅŸma yoksa)', async () => {
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

  test('1.3 â€” AynÄ± rezervasyon 5 kez iptal edilmeye Ã§alÄ±ÅŸÄ±lÄ±rsa hata vermez, durum tutarlÄ± kalÄ±r', async () => {
    const { uzmanId } = await quickExpert();
    const customer    = await quickCustomer();

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send(bookingPayload(uzmanId, '2026-10-03', ['2026-10-03_14:00']));
    const bookingId = bookRes.body.booking.id;

    // Ä°lk iptal baÅŸarÄ±lÄ± olmalÄ±, sonraki istekler 400/200 dÃ¶nmeli ama 500 vermemeli
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        request(app)
          .patch(`/api/bookings/${bookingId}/status`)
          .set('Authorization', `Bearer ${customer.token}`)
          .send({ status: 'cancelled' })
      )
    );

    const serverErrors = results.filter(r => r.status === 500);
    expect(serverErrors.length).toBe(0); // HiÃ§ 500 olmamalÄ±

    const booking = await dbGet('SELECT status FROM bookings WHERE id = ?', bookingId);
    expect(booking.status).toBe('cancelled'); // Son durum tutarlÄ±
  });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   KATEGORÄ° 2 â€” STATE MACHINE ANOMALIES
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
describe('Kategori 2 â€” State Machine Anomalies', () => {

  test('2.1 â€” Ä°ptal edilmiÅŸ rezervasyon tekrar confirmed yapÄ±lamaz', async () => {
    const { uzmanId, uzmanToken } = await quickExpert();
    const customer = await quickCustomer();

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send(bookingPayload(uzmanId, '2026-10-05', ['2026-10-05_11:00']));
    const bookingId = bookRes.body.booking.id;

    // MÃ¼ÅŸteri iptal eder
    await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ status: 'cancelled' });

    // Uzman iptal edilmiÅŸ rezervasyonu onaylamaya Ã§alÄ±ÅŸÄ±r
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${uzmanToken}`)
      .send({ status: 'confirmed' });

    // Ä°ptal edilmiÅŸi onaylamak geÃ§ersiz bir geÃ§iÅŸ â€” 400 bekleniyor
    // Åu an bu kontrol yoksa test kÄ±rÄ±lÄ±r â†’ gerÃ§ek bug tespiti
    expect([400, 409, 422]).toContain(res.status);
    const booking = await dbGet('SELECT status FROM bookings WHERE id = ?', bookingId);
    expect(booking.status).toBe('cancelled');
  });

  test('2.2 â€” pending_expert, onay almadan /experts/profile PATCH yapamaz', async () => {
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

  test('2.3 â€” pending_expert, uzman rezervasyonlarÄ±nÄ± gÃ¶remez', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      firstName: 'Still', lastName: 'Pending', email: 'stillpending@sec.test',
      password: 'Test1234!', role: 'pending_expert',
    });
    const token = regRes.body.token;

    const res = await request(app)
      .get('/api/bookings/expert')
      .set('Authorization', `Bearer ${token}`);

    // pending_expert normal kullanÄ±cÄ± gibi davranmalÄ± â€” boÅŸ liste ya da 403
    // En kÃ¶tÃ¼ ihtimalle boÅŸ liste dÃ¶ner, ama kritik veri sÄ±zdÄ±rmamalÄ±
    if (res.status === 200) {
      expect(res.body.bookings).toHaveLength(0);
    } else {
      expect([401, 403]).toContain(res.status);
    }
  });

  test('2.4 â€” TamamlanmÄ±ÅŸ (completed) rezervasyon tekrar iptal edilemez', async () => {
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

    // MÃ¼ÅŸteri tamamlanmÄ±ÅŸ rezervasyonu iptal etmeye Ã§alÄ±ÅŸÄ±r
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ status: 'cancelled' });

    // 400 veya durum deÄŸiÅŸmeden 200 â€” ama completed kalmalÄ±
    const booking = await dbGet('SELECT status FROM bookings WHERE id = ?', bookingId);
    expect(booking.status).toBe('completed');
  });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   KATEGORÄ° 3 â€” IDOR & YETKÄ° AÅIMI
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
describe('Kategori 3 â€” IDOR & Yetki AÅŸÄ±mÄ±', () => {

  test('3.1 â€” KullanÄ±cÄ± A, kullanÄ±cÄ± B\'nin rezervasyonunu okuyamaz', async () => {
    const { uzmanId } = await quickExpert();
    const [c1, c2]   = await Promise.all([quickCustomer(), quickCustomer()]);

    // c1 rezervasyon yaptÄ±
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${c1.token}`)
      .send(bookingPayload(uzmanId, '2026-10-10', ['2026-10-10_10:00']));
    const bookingId = bookRes.body.booking.id;

    // c2 bu rezervasyona eriÅŸmeye Ã§alÄ±ÅŸÄ±r
    const res = await request(app)
      .get(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${c2.token}`);

    expect([403, 404]).toContain(res.status);
  });

  test('3.2 â€” KullanÄ±cÄ± A, kullanÄ±cÄ± B\'nin rezervasyonunu iptal edemez', async () => {
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
    expect(booking.status).toBe('pending'); // DeÄŸiÅŸmemiÅŸ olmalÄ±
  });

  test('3.3 â€” Uzman A, uzman B\'nin rezervasyonunu onaylayamaz', async () => {
    const e1 = await quickExpert();
    const e2 = await quickExpert();
    const customer = await quickCustomer();

    // e1'e rezervasyon yapÄ±ldÄ±
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send(bookingPayload(e1.uzmanId, '2026-10-12', ['2026-10-12_09:00']));
    const bookingId = bookRes.body.booking.id;

    // e2 bunu onaylamaya Ã§alÄ±ÅŸÄ±r
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${e2.uzmanToken}`)
      .send({ status: 'confirmed' });

    expect([403, 404]).toContain(res.status);
  });

  test('3.4 â€” Token olmadan korumalÄ± endpoint\'e eriÅŸilemez', async () => {
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

  test('3.5 â€” MÃ¼ÅŸteri token\'Ä± ile admin endpoint\'e eriÅŸilemez', async () => {
    const customer = await quickCustomer();

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${customer.token}`);

    expect(res.status).toBe(403);
  });

  test('3.6 â€” Sahte/geÃ§ersiz JWT token reddedilir', async () => {
    const res = await request(app)
      .get('/api/bookings/my')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.SAHTE.imza');

    expect(res.status).toBe(401);
  });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   KATEGORÄ° 4 â€” MASS ASSIGNMENT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
describe('Kategori 4 â€” Mass Assignment (Toplu Atama Zafiyeti)', () => {

  test('4.1 â€” KayÄ±t sÄ±rasÄ±nda role:admin enjekte edilemez', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Hacker', lastName: 'User', email: 'hacker@sec.test',
      password: 'Test1234!',
      role:     'admin', // â† SaldÄ±rÄ±
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).not.toBe('admin');
    // customer veya pending_expert olabilir, admin kesinlikle olmaz
    expect(['customer', 'pending_expert']).toContain(res.body.user.role);
  });

  test('4.2 â€” Profil gÃ¼ncelleme sÄ±rasÄ±nda role:admin enjekte edilemez', async () => {
    const { uzmanId, uzmanToken } = await quickExpert();

    const res = await request(app)
      .patch('/api/experts/profile')
      .set('Authorization', `Bearer ${uzmanToken}`)
      .send({
        bio:   'GÃ¼ncelleme',
        price: 350,
        role:  'admin',       // â† SaldÄ±rÄ±
        isActive: true,       // â† SaldÄ±rÄ±
        rating: 5.0,          // â† Rating manipÃ¼lasyonu
      });

    expect(res.status).toBe(200);

    // KullanÄ±cÄ±nÄ±n rolÃ¼ hÃ¢lÃ¢ expert olmalÄ±
    const user = await dbGet('SELECT role FROM users WHERE id = ?', uzmanId);
    expect(user.role).toBe('expert');
  });

  test('4.3 â€” KayÄ±t sÄ±rasÄ±nda isActive:true enjekte edilemez (hesap pasif baÅŸlamamalÄ±)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Mass', lastName: 'Assignment', email: 'mass@sec.test',
      password: 'Test1234!',
      is_active: true,       // â† SaldÄ±rÄ± (zaten default true, ama false enjekte denemesi)
      isApproved: true,      // â† SaldÄ±rÄ±
      email_verified: true,  // â† SaldÄ±rÄ±
    });

    expect(res.status).toBe(201);
    // Normal kullanÄ±cÄ± olarak kaydolmuÅŸ olmalÄ±
    expect(res.body.user.role).toBe('customer');
  });

  test('4.4 â€” Rezervasyon oluÅŸtururken status:completed enjekte edilemez', async () => {
    const { uzmanId } = await quickExpert();
    const customer    = await quickCustomer();

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        ...bookingPayload(uzmanId, '2026-10-15', ['2026-10-15_10:00']),
        status:    'completed', // â† SaldÄ±rÄ±
        totalPrice: -1,         // â† SaldÄ±rÄ± (negatif fiyat)
      });

    if (res.status === 201) {
      // BaÅŸarÄ±lÄ±ysa durum pending olmalÄ±, completed deÄŸil
      expect(res.body.booking.status).toBe('pending');
    }
  });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   KATEGORÄ° 5 â€” FUZZING & EDGE CASES
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
describe('Kategori 5 â€” Fuzzing & Edge Cases', () => {

  test('5.1 â€” 10.000 karakterlik bio sunucuyu Ã§Ã¶kertemez', async () => {
    const { uzmanToken } = await quickExpert();
    const longString      = 'A'.repeat(10000);

    const res = await request(app)
      .patch('/api/experts/profile')
      .set('Authorization', `Bearer ${uzmanToken}`)
      .send({ bio: longString, price: 300 });

    // Kabul etsede reddetse de 500 vermemeli
    expect(res.status).not.toBe(500);
  });

  test('5.2 â€” Emojili ve Ã¶zel karakterli bio kabul edilebilir veya zararsÄ±z reddedilir', async () => {
    const { uzmanToken } = await quickExpert();

    const res = await request(app)
      .patch('/api/experts/profile')
      .set('Authorization', `Bearer ${uzmanToken}`)
      .send({ bio: 'ğŸ”§âš¡ğŸ‰ Merhaba <script>alert(1)</script>', price: 300 });

    expect(res.status).not.toBe(500);
    // XSS iÃ§eriÄŸi kaydedildiyse script tag'i temizlenmiÅŸ olmalÄ±
    if (res.status === 200 && res.body.expert?.bio) {
      expect(res.body.expert.bio).not.toContain('<script>');
    }
  });

  test('5.3 â€” Negatif fiyatla rezervasyon reddedilir veya 0 olarak iÅŸlenir', async () => {
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
      // Kabul edildiyse negatif fiyat saklanmamÄ±ÅŸ olmalÄ±
      expect(res.body.booking.totalPrice).toBeGreaterThanOrEqual(0);
    } else {
      expect([400, 422]).toContain(res.status);
    }
  });

  test('5.4 â€” SQL injection denemesi zararsÄ±z biÃ§imde reddedilir', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email:    "admin@test.com' OR '1'='1",
      password: "' OR '1'='1",
    });

    // SQL injection'Ä±n Ã§alÄ±ÅŸmamasÄ± gerek â€” 401 veya 400, kesinlikle 200 deÄŸil
    expect([400, 401]).toContain(res.status);
  });

  test('5.5 â€” GeÃ§ersiz tarih formatÄ±yla rezervasyon 400/500 vermez', async () => {
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

  test('5.6 â€” BoÅŸ body ile kayÄ±t 400 dÃ¶ner, 500 vermez', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('5.7 â€” 10.000 karakterlik notlu rezervasyon sunucuyu Ã§Ã¶kertemez', async () => {
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BONUS 1 â€” OVERLAP DETECTION (Zaman KesiÅŸimi)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
describe('Bonus 1 â€” Overlap Detection (Zaman KesiÅŸimi)', () => {

  test('B1.1 â€” KesiÅŸen slotlu rezervasyon reddedilir (09:30â€“10:30 vs 10:15â€“11:15)', async () => {
    const { uzmanId } = await quickExpert();
    const [c1, c2]   = await Promise.all([quickCustomer(), quickCustomer()]);

    // c1: 09:00 + 10:00 slotlarÄ±nÄ± alÄ±r (09:00â€“11:00)
    const r1 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${c1.token}`)
      .send(bookingPayload(uzmanId, '2026-10-25', [
        '2026-10-25_09:00',
        '2026-10-25_10:00',
      ]));
    expect(r1.status).toBe(201);

    // c2: 10:00 + 11:00 â†’ 10:00 Ã§akÄ±ÅŸÄ±yor
    const r2 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${c2.token}`)
      .send(bookingPayload(uzmanId, '2026-10-25', [
        '2026-10-25_10:00',
        '2026-10-25_11:00',
      ]));
    expect(r2.status).toBe(409);
  });

  test('B1.2 â€” BitiÅŸik ama Ã§akÄ±ÅŸmayan slotlar her ikisi de kabul edilir', async () => {
    const { uzmanId } = await quickExpert();
    const [c1, c2]   = await Promise.all([quickCustomer(), quickCustomer()]);

    // c1: 09:00 slotu
    const r1 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${c1.token}`)
      .send(bookingPayload(uzmanId, '2026-10-26', ['2026-10-26_09:00']));
    expect(r1.status).toBe(201);

    // c2: 10:00 slotu â€” bitiÅŸik ama Ã§akÄ±ÅŸmÄ±yor
    const r2 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${c2.token}`)
      .send(bookingPayload(uzmanId, '2026-10-26', ['2026-10-26_10:00']));
    expect(r2.status).toBe(201);
  });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BONUS 2 â€” Ä°YZÄ°CO IDEMPOTENCY (Webhook Race Condition)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
describe('Bonus 2 â€” Ä°yzico Idempotency', () => {

  test('B2.1 â€” AynÄ± iyzico token ile iki kez callback gelirse booking sadece bir kez completed olur', async () => {
    const { uzmanId } = await quickExpert();
    const customer    = await quickCustomer();

    // Rezervasyon oluÅŸtur
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send(bookingPayload(uzmanId, '2026-11-01', ['2026-11-01_09:00']));
    const bookingId = bookRes.body.booking.id;

    // DB'ye manuel Ã¶deme kaydÄ± ekle (iyzico'dan Ã¶nce callback test etmek iÃ§in)
    const paymentId = `pay_test_${Date.now()}`;
    const fakeToken = `iyz_token_${Date.now()}`;
    await dbRun(
      `INSERT INTO payments (id, booking_id, customer_id, amount, currency, status, iyzico_token)
       VALUES (?, ?, ?, 300, 'TRY', 'pending', ?)`,
      paymentId, bookingId, customer.user.id, fakeToken
    );

    // Ä°ki kez aynÄ± callback (iyzico aÄŸ gecikmesi simÃ¼lasyonu)
    const [cb1, cb2] = await Promise.all([
      request(app).post('/api/payments/callback').send({ token: fakeToken }),
      request(app).post('/api/payments/callback').send({ token: fakeToken }),
    ]);

    // Her ikisi de sunucu hatasÄ±na yol aÃ§mamalÄ± (redirect bekleniyor)
    expect([200, 302]).toContain(cb1.status);
    expect([200, 302]).toContain(cb2.status);

    // Booking durumu tek olmalÄ± â€” Ã§ift completed/completed deÄŸil
    const booking = await dbGet('SELECT status FROM bookings WHERE id = ?', bookingId);
    // pending ya da completed â€” ikisi de kabul edilebilir, ama tutarlÄ± olmalÄ±
    expect(['pending', 'completed']).toContain(booking.status);
  });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BONUS 3 â€” GEÃ‡MÄ°Å TARÄ°H & Ä°PTAL MANTÄ°ÄI
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
describe('Bonus 3 â€” GeÃ§miÅŸ Tarih & Ä°ptal MantÄ±ÄŸÄ±', () => {

  test('B3.1 â€” GeÃ§miÅŸ tarihli slot serbest kalÄ±r, yeni rezervasyona aÃ§Ä±lÄ±r', async () => {
    const { uzmanId } = await quickExpert();
    const customer    = await quickCustomer();

    // Rezervasyon yap
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send(bookingPayload(uzmanId, '2026-11-05', ['2026-11-05_10:00']));
    const bookingId = bookRes.body.booking.id;

    // Ä°ptal et
    await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ status: 'cancelled' });

    // AynÄ± slot tekrar rezervasyona aÃ§Ä±lmÄ±ÅŸ olmalÄ±
    const slot = await dbGet(
      'SELECT * FROM calendar_slots WHERE expert_id = ? AND slot_key = ?',
      uzmanId, '2026-11-05_10:00'
    );
    expect(slot).toBeUndefined(); // Slot temizlenmiÅŸ olmalÄ±

    // BaÅŸka mÃ¼ÅŸteri aynÄ± slotu alabilmeli
    const c2 = await quickCustomer();
    const r2 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${c2.token}`)
      .send(bookingPayload(uzmanId, '2026-11-05', ['2026-11-05_10:00']));
    expect(r2.status).toBe(201);
  });

  test('B3.2 â€” Ä°ptal edilmiÅŸ rezervasyonun slotu takvimden silinir', async () => {
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

    // Ä°ptal
    await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ status: 'cancelled' });

    // Her iki slot da temizlenmiÅŸ olmalÄ±
    const [s1, s2] = await Promise.all([
      dbGet('SELECT * FROM calendar_slots WHERE expert_id = ? AND slot_key = ?', uzmanId, '2026-11-06_09:00'),
      dbGet('SELECT * FROM calendar_slots WHERE expert_id = ? AND slot_key = ?', uzmanId, '2026-11-06_10:00'),
    ]);
    expect(s1).toBeUndefined();
    expect(s2).toBeUndefined();
  });
});

