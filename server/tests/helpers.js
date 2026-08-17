const request = require('supertest');
const { app, initDb } = require('../src/app');
const { resetDb, closeDb, dbRun, dbGet } = require('../src/db/database');  // Test'te SQLite kullan

// Testler başlamadan DB'yi başlat
beforeAll(async () => {
  process.env.DB_PATH    = ':memory:';
  process.env.NODE_ENV   = 'test';
  await initDb();
});

async function registerAndLogin(data = {}) {
  const user = {
    firstName: 'Test',
    lastName:  'Kullanıcı',
    email:     `test_${Date.now()}_${Math.random().toString(36).slice(2,5)}@test.com`,
    password:  'Test1234!',
    ...data
  };
  const regRes = await request(app).post('/api/auth/register').send(user);
  return { token: regRes.body.token, user: regRes.body.user, raw: user };
}

module.exports = { app, request, resetDb, closeDb, registerAndLogin, dbRun, dbGet };
