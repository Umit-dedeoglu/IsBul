const { app, request, resetDb, closeDb } = require('./helpers');

beforeEach(() => resetDb());
afterAll(()  => closeDb());

describe('POST /api/auth/register', () => {
  const validUser = {
    firstName: 'Ümit',
    lastName:  'Dedeoğlu',
    email:     'umit@test.com',
    password:  'Umit1234!'
  };

  test('geçerli verilerle kayıt olunur', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('umit@test.com');
    expect(res.body.user.role).toBe('customer');
  });

  test('aynı e-posta ile tekrar kayıt yapılamaz', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('eksik alan ile kayıt yapılamaz', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ email: 'test@test.com', password: '12345678' });
    expect(res.status).toBe(400);
  });

  test('kısa şifre ile kayıt yapılamaz', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ ...validUser, password: '123' });
    expect(res.status).toBe(400);
  });

  test('geçersiz e-posta formatı reddedilir', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ ...validUser, email: 'gecersiz-email' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      firstName: 'Login', lastName: 'Test',
      email: 'login@test.com', password: 'Test1234!'
    });
  });

  test('doğru bilgilerle giriş yapılır', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'Test1234!' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.isExpert).toBe(false);
  });

  test('yanlış şifre reddedilir', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'yanlis' });
    expect(res.status).toBe(401);
  });

  test('kayıtsız e-posta reddedilir', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'yok@test.com', password: 'Test1234!' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  test('geçerli token ile kullanıcı bilgileri döner', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      firstName: 'Me', lastName: 'Test',
      email: 'me@test.com', password: 'Test1234!'
    });
    const token = reg.body.token;

    const res = await request(app).get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@test.com');
  });

  test('token olmadan 401 döner', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('geçersiz token 401 döner', async () => {
    const res = await request(app).get('/api/auth/me')
      .set('Authorization', 'Bearer bozuk_token_123');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/health', () => {
  test('API ayakta', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
