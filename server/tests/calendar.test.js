const { app, request, resetDb, closeDb, registerAndLogin, dbRun } = require('./helpers');

beforeEach(() => resetDb());
afterAll(()  => closeDb());

describe('GET /api/calendar/:expertId/slots', () => {
  test('boş uzmanın slot listesi boş döner', async () => {
    const res = await request(app).get('/api/calendar/expert_test/slots');
    expect(res.status).toBe(200);
    expect(res.body.slots).toEqual({});
  });

  test('dolu slotlar döner', async () => {
    dbRun(
      'INSERT INTO calendar_slots (expert_id, slot_key, booking_id) VALUES (?,?,?)',
      'exp1', '2026-08-21_11:00', 'rez_test'
    );
    const res = await request(app).get('/api/calendar/exp1/slots');
    expect(res.status).toBe(200);
    expect(res.body.slots['2026-08-21_11:00']).toBe(true);
  });

  test('belirli tarih için slot sorgusu', async () => {
    dbRun('INSERT INTO calendar_slots (expert_id, slot_key) VALUES (?,?)', 'exp2','2026-09-01_09:00');
    dbRun('INSERT INTO calendar_slots (expert_id, slot_key) VALUES (?,?)', 'exp2','2026-09-02_10:00');

    const res = await request(app).get('/api/calendar/exp2/slots?date=2026-09-01');
    expect(res.status).toBe(200);
    expect(Object.keys(res.body.slots).length).toBe(1);
    expect(res.body.slots['2026-09-01_09:00']).toBe(true);
  });
});

describe('POST /api/calendar/:expertId/check', () => {
  test('müsait slotlar uygun döner', async () => {
    const res = await request(app)
      .post('/api/calendar/exp_free/check')
      .send({ slots: ['2026-10-01_10:00','2026-10-01_11:00'] });
    expect(res.status).toBe(200);
    expect(res.body.available).toBe(true);
  });

  test('dolu slot çakışma döner', async () => {
    dbRun('INSERT INTO calendar_slots (expert_id, slot_key) VALUES (?,?)', 'exp3','2026-10-02_14:00');

    const res = await request(app)
      .post('/api/calendar/exp3/check')
      .send({ slots: ['2026-10-02_13:00','2026-10-02_14:00'] });
    expect(res.status).toBe(200);
    expect(res.body.available).toBe(false);
    expect(res.body.conflictSlot).toBe('2026-10-02_14:00');
  });
});
