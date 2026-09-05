// Test ortamı env'leri require'dan ÖNCE set edilmeli — setup.js'de yapılıyor
const request = require('supertest');
const TEST_SETUP_KEY = 'test_setup_key_123';
const { app, initDb } = require('../src/app');
const { resetDb, closeDb, dbRun, dbGet } = require('../src/db/database');

beforeAll(async () => {
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

module.exports = { app, request, resetDb, closeDb, registerAndLogin, dbRun, dbGet, TEST_SETUP_KEY };
