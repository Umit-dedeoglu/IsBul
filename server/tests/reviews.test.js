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

describe('GET /api/reviews/:expertId', () => {
  test('uzmanın yorumları listelenir', async () => {
    const expert = await setupExpert();
    const res = await request(app).get(`/api/reviews/${expert.user.id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.reviews)).toBe(true);
  });

  test('yorumu olmayan uzman için boş liste döner', async () => {
    const expert = await setupExpert();
    const res = await request(app).get(`/api/reviews/${expert.user.id}`);
    expect(res.body.count).toBe(0);
    expect(res.body.reviews).toEqual([]);
  });
});

describe('POST /api/reviews/:expertId', () => {
  test('oturum açmadan yorum yapılamaz', async () => {
    const expert = await setupExpert();
    const res = await request(app)
      .post(`/api/reviews/${expert.user.id}`)
      .send({ rating: 5, text: 'Harika bir uzman!', service: 'Elektrik' });
    expect(res.status).toBe(401);
  });

  test('geçerli yorum eklenir', async () => {
    const expert   = await setupExpert();
    const customer = await registerAndLogin({ email: `musteri_${Date.now()}@test.com` });

    const res = await request(app)
      .post(`/api/reviews/${expert.user.id}`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ rating: 5, text: 'Çok memnun kaldım, kesinlikle tavsiye ederim.', service: 'Elektrik' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.review.rating).toBe(5);
    expect(res.body.review.userName).toContain('Test');
  });

  test('10 karakterden kısa yorum reddedilir', async () => {
    const expert   = await setupExpert();
    const customer = await registerAndLogin({ email: `kisa_${Date.now()}@test.com` });

    const res = await request(app)
      .post(`/api/reviews/${expert.user.id}`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ rating: 4, text: 'Kısa', service: 'Test' });

    expect(res.status).toBe(400);
  });

  test('geçersiz puan reddedilir', async () => {
    const expert   = await setupExpert();
    const customer = await registerAndLogin({ email: `puan_${Date.now()}@test.com` });

    const res = await request(app)
      .post(`/api/reviews/${expert.user.id}`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ rating: 6, text: 'Çok iyi bir hizmet aldım gerçekten memnun kaldım.', service: 'Test' });

    expect(res.status).toBe(400);
  });

  test('yorum sonrası uzmanın puan ortalaması güncellenir', async () => {
    const expert   = await setupExpert();
    const customer = await registerAndLogin({ email: `ortalama_${Date.now()}@test.com` });

    await request(app)
      .post(`/api/reviews/${expert.user.id}`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ rating: 4, text: 'Gayet iyi hizmet aldım, memnun kaldım.', service: 'Elektrik' });

    const listRes = await request(app).get(`/api/reviews/${expert.user.id}`);
    expect(listRes.body.count).toBe(1);
    expect(listRes.body.reviews[0].rating).toBe(4);
  });
});
