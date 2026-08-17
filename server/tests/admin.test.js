const { app, request, resetDb, closeDb, registerAndLogin, dbRun, dbGet } = require('./helpers');

beforeEach(() => resetDb());
afterAll(()  => closeDb());

/* ── Yardımcı: admin hesabı oluştur ve token al ── */
async function createAdminAndLogin() {
  // createAdmin endpoint ile oluştur
  await request(app).post('/api/admin/create-admin').send({
    firstName: 'Admin',
    lastName:  'User',
    email:     'admin@isbul.com',
    password:  'Admin1234!',
  });
  // Login yap
  const res = await request(app).post('/api/auth/login').send({
    email: 'admin@isbul.com', password: 'Admin1234!',
  });
  return { token: res.body.token, user: res.body.user };
}

/* ── Yardımcı: normal kullanıcı oluştur ── */
async function createCustomer(suffix = '') {
  return registerAndLogin({
    firstName: 'Müşteri', lastName: 'Test',
    email: `musteri${suffix}_${Date.now()}@test.com`,
    password: 'Test1234!',
  });
}

// ═══════════════════════════════════════════════
describe('POST /api/admin/create-admin', () => {
  test('ilk admin hesabı oluşturulur', async () => {
    const res = await request(app).post('/api/admin/create-admin').send({
      firstName: 'Admin', lastName: 'User',
      email: 'admin@test.com', password: 'Admin1234!',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('ikinci admin oluşturulamaz', async () => {
    await request(app).post('/api/admin/create-admin').send({
      firstName: 'Admin', lastName: 'User',
      email: 'admin@test.com', password: 'Admin1234!',
    });
    const res = await request(app).post('/api/admin/create-admin').send({
      firstName: 'Admin2', lastName: 'User2',
      email: 'admin2@test.com', password: 'Admin1234!',
    });
    expect(res.status).toBe(409);
  });

  test('mevcut kullanıcı admin yapılır', async () => {
    // Önce normal kullanıcı oluştur
    await registerAndLogin({ email: 'existing@test.com' });
    // Sonra admin yap
    const res = await request(app).post('/api/admin/create-admin').send({
      firstName: 'Admin', lastName: 'User',
      email: 'existing@test.com', password: 'Admin1234!',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ═══════════════════════════════════════════════
describe('GET /api/admin/stats', () => {
  test('admin olmadan erişilemez', async () => {
    const { token } = await createCustomer();
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin istatistikleri alır', async () => {
    const { token } = await createAdminAndLogin();
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.stats.users).toBeDefined();
    expect(res.body.stats.bookings).toBeDefined();
    expect(res.body.stats.revenue).toBeDefined();
  });

  test('token olmadan 401 döner', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════
describe('GET /api/admin/users', () => {
  test('admin kullanıcı listesini görür', async () => {
    const { token } = await createAdminAndLogin();
    await createCustomer('1');
    await createCustomer('2');

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThanOrEqual(3); // admin + 2 müşteri
    expect(res.body.total).toBeGreaterThanOrEqual(3);
  });

  test('role filtresi çalışır', async () => {
    const { token } = await createAdminAndLogin();
    await createCustomer();

    const res = await request(app)
      .get('/api/admin/users?role=customer')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    res.body.users.forEach(u => expect(u.role).toBe('customer'));
  });

  test('arama filtresi çalışır', async () => {
    const { token } = await createAdminAndLogin();
    await registerAndLogin({
      firstName: 'Ahmet', lastName: 'Yılmaz',
      email: `ahmet_${Date.now()}@test.com`, password: 'Test1234!',
    });

    const res = await request(app)
      .get('/api/admin/users?search=Ahmet')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.users.some(u => u.firstName === 'Ahmet')).toBe(true);
  });

  test('sayfalama çalışır', async () => {
    const { token } = await createAdminAndLogin();

    const res = await request(app)
      .get('/api/admin/users?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeLessThanOrEqual(2);
    expect(res.body.page).toBe(1);
  });
});

// ═══════════════════════════════════════════════
describe('PATCH /api/admin/users/:id/role', () => {
  test('kullanıcı uzman yapılır', async () => {
    const { token } = await createAdminAndLogin();
    const { user }  = await createCustomer();

    const res = await request(app)
      .patch(`/api/admin/users/${user.id}/role`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'expert' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('expert');
  });

  test('geçersiz rol reddedilir', async () => {
    const { token } = await createAdminAndLogin();
    const { user }  = await createCustomer();

    const res = await request(app)
      .patch(`/api/admin/users/${user.id}/role`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'superuser' });

    expect(res.status).toBe(400);
  });

  test('admin kendi rolünü değiştiremez', async () => {
    const { token, user } = await createAdminAndLogin();

    const res = await request(app)
      .patch(`/api/admin/users/${user.id}/role`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'customer' });

    expect(res.status).toBe(400);
  });
});

// ═══════════════════════════════════════════════
describe('PATCH /api/admin/users/:id/toggle-active', () => {
  test('kullanıcı devre dışı bırakılır', async () => {
    const { token } = await createAdminAndLogin();
    const { user }  = await createCustomer();

    const res = await request(app)
      .patch(`/api/admin/users/${user.id}/toggle-active`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(false);
  });

  test('devre dışı kullanıcı tekrar aktif edilir', async () => {
    const { token } = await createAdminAndLogin();
    const { user }  = await createCustomer();

    // Devre dışı bırak
    await request(app)
      .patch(`/api/admin/users/${user.id}/toggle-active`)
      .set('Authorization', `Bearer ${token}`);

    // Tekrar aktif et
    const res = await request(app)
      .patch(`/api/admin/users/${user.id}/toggle-active`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(true);
  });
});

// ═══════════════════════════════════════════════
describe('DELETE /api/admin/users/:id', () => {
  test('kullanıcı silinir', async () => {
    const { token } = await createAdminAndLogin();
    const { user }  = await createCustomer();

    const delRes = await request(app)
      .delete(`/api/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Silinen kullanıcı artık bulunamaz
    const getRes = await request(app)
      .get(`/api/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(404);
  });

  test('admin kendini silemez', async () => {
    const { token, user } = await createAdminAndLogin();

    const res = await request(app)
      .delete(`/api/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});

// ═══════════════════════════════════════════════
describe('GET /api/admin/bookings', () => {
  test('admin tüm rezervasyonları görür', async () => {
    const { token } = await createAdminAndLogin();

    const res = await request(app)
      .get('/api/admin/bookings')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.bookings)).toBe(true);
    expect(typeof res.body.total).toBe('number');
  });

  test('status filtresi çalışır', async () => {
    const { token } = await createAdminAndLogin();

    const res = await request(app)
      .get('/api/admin/bookings?status=pending')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    res.body.bookings.forEach(b => expect(b.status).toBe('pending'));
  });
});

// ═══════════════════════════════════════════════
describe('GET /api/admin/applications', () => {
  test('bekleyen başvurular listelenir', async () => {
    const { token } = await createAdminAndLogin();

    // pending_expert olarak kayıt ol
    await request(app).post('/api/auth/register').send({
      firstName: 'Başvuru', lastName: 'Testi',
      email: `basvuru_${Date.now()}@test.com`,
      password: 'Test1234!',
      role: 'pending_expert',
    });

    const res = await request(app)
      .get('/api/admin/applications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pendingCount).toBeGreaterThanOrEqual(1);
    expect(res.body.pending[0].role).toBe('pending_expert');
  });
});

describe('PATCH /api/admin/applications/:id/approve', () => {
  test('başvuru onaylandığında rol expert olur', async () => {
    const { token } = await createAdminAndLogin();

    const reg = await request(app).post('/api/auth/register').send({
      firstName: 'Onay', lastName: 'Testi',
      email: `onay_${Date.now()}@test.com`,
      password: 'Test1234!',
      role: 'pending_expert',
    });
    const userId = reg.body.user.id;

    const res = await request(app)
      .patch(`/api/admin/applications/${userId}/approve`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Rol expert olmuş mu?
    const userRes = await request(app)
      .get(`/api/admin/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(userRes.body.user.role).toBe('expert');
  });
});

describe('PATCH /api/admin/applications/:id/reject', () => {
  test('başvuru reddedildiğinde rol customer olur', async () => {
    const { token } = await createAdminAndLogin();

    const reg = await request(app).post('/api/auth/register').send({
      firstName: 'Red', lastName: 'Testi',
      email: `red_${Date.now()}@test.com`,
      password: 'Test1234!',
      role: 'pending_expert',
    });
    const userId = reg.body.user.id;

    const res = await request(app)
      .patch(`/api/admin/applications/${userId}/reject`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Eksik belge' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const userRes = await request(app)
      .get(`/api/admin/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(userRes.body.user.role).toBe('customer');
  });
});
