/**
 * İşBul – Veritabanı katmanı
 * sql.js kullanır — saf JavaScript SQLite, Windows'ta derleme gerektirmez
 * Disk üzerine periyodik kayıt yapar
 */
const path = require('path');
const fs   = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH
  ? path.resolve(__dirname, '../../', process.env.DB_PATH)
  : path.resolve(__dirname, '../../data/isbul.db');

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

let db   = null;
let SQL  = null;

/**
 * sql.js asenkron başlatır, sonra sync kullanılır.
 * getDb() sync çağrıları için initDb() önceden çalıştırılmış olmalı.
 */
async function initDb() {
  if (db) return db;
  SQL = await initSqlJs();

  const isMemory = DB_PATH === ':memory:' || process.env.DB_PATH === ':memory:';

  if (!isMemory && fs.existsSync(DB_PATH)) {
    const filebuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database(); // yeni veya in-memory
  }

  db.run('PRAGMA foreign_keys = ON;');
  initSchema();
  if (!isMemory) saveDb();
  return db;
}

function getDb() {
  if (!db) throw new Error('Veritabanı henüz başlatılmadı. initDb() çağırın.');
  return db;
}

/** Disk üzerine kaydet */
function saveDb() {
  if (!db) return;
  try {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (e) {
    console.error('[DB] Kayıt hatası:', e.message);
  }
}

/** Her 5 saniyede otomatik kaydet */
let saveInterval;
function startAutoSave(ms = 5000) {
  if (saveInterval) return;
  saveInterval = setInterval(saveDb, ms);
  saveInterval.unref?.(); // process'i bloke etme
}

function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      first_name    TEXT NOT NULL,
      last_name     TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      avatar        TEXT,
      color         TEXT DEFAULT '#6C63FF',
      role          TEXT DEFAULT 'customer',
      is_active     INTEGER DEFAULT 1,
      google_id     TEXT UNIQUE,
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS expert_profiles (
      user_id       TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      price         INTEGER DEFAULT 300,
      bio           TEXT DEFAULT '',
      city          TEXT DEFAULT 'İstanbul',
      tags          TEXT DEFAULT '[]',
      hours         TEXT DEFAULT '',
      rating        REAL DEFAULT 5.0,
      review_count  INTEGER DEFAULT 0,
      experience    TEXT DEFAULT '1 yıl',
      is_elite      INTEGER DEFAULT 0,
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id               TEXT PRIMARY KEY,
      customer_id      TEXT NOT NULL REFERENCES users(id),
      expert_id        TEXT NOT NULL,
      service          TEXT NOT NULL,
      date             TEXT NOT NULL,
      end_date         TEXT,
      time             TEXT NOT NULL,
      end_time         TEXT,
      duration_type    TEXT DEFAULT 'hours',
      duration_value   INTEGER DEFAULT 1,
      duration_label   TEXT,
      total_price      INTEGER,
      slots            TEXT DEFAULT '[]',
      city             TEXT,
      notes            TEXT DEFAULT '',
      status           TEXT DEFAULT 'pending',
      created_at       TEXT DEFAULT (datetime('now')),
      updated_at       TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS calendar_slots (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      expert_id   TEXT NOT NULL,
      slot        TEXT NOT NULL,
      booking_id  TEXT,
      UNIQUE(expert_id, slot)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id          TEXT PRIMARY KEY,
      expert_id   TEXT NOT NULL,
      customer_id TEXT NOT NULL REFERENCES users(id),
      rating      INTEGER NOT NULL,
      text        TEXT NOT NULL,
      service     TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_expert   ON bookings(expert_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
    CREATE INDEX IF NOT EXISTS idx_calendar_expert   ON calendar_slots(expert_id);

    CREATE TABLE IF NOT EXISTS payments (
      id                TEXT PRIMARY KEY,
      booking_id        TEXT REFERENCES bookings(id) ON DELETE CASCADE,
      customer_id       TEXT REFERENCES users(id) ON DELETE CASCADE,
      amount            INTEGER NOT NULL,
      currency          TEXT DEFAULT 'TRY',
      status            TEXT DEFAULT 'pending',
      iyzico_token      TEXT,
      iyzico_payment_id TEXT,
      conversation_id   TEXT,
      created_at        TEXT DEFAULT (datetime('now')),
      updated_at        TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_payments_booking  ON payments(booking_id);
    CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
    CREATE INDEX IF NOT EXISTS idx_payments_token    ON payments(iyzico_token);

    CREATE INDEX IF NOT EXISTS idx_bookings_expert   ON bookings(expert_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
    CREATE INDEX IF NOT EXISTS idx_calendar_expert   ON calendar_slots(expert_id);
  `);
}

/* ── sql.js query wrappers (better-sqlite3 API'siyle uyumlu) ── */

/** Tek satır döndür */
function dbGet(sql, ...params) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return undefined;
}

/** Çok satır döndür */
function dbAll(sql, ...params) {
  const results = [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

/** INSERT/UPDATE/DELETE çalıştır */
function dbRun(sql, ...params) {
  db.run(sql, params);
  saveDb();
}

/** Test için veritabanını sıfırla */
function resetDb() {
  if (!db) return;
  db.run('DELETE FROM calendar_slots;');
  db.run('DELETE FROM payments;');
  db.run('DELETE FROM reviews;');
  db.run('DELETE FROM bookings;');
  db.run('DELETE FROM expert_profiles;');
  db.run('DELETE FROM users;');
}

/** Bağlantıyı kapat */
function closeDb() {
  if (saveInterval) { clearInterval(saveInterval); saveInterval = null; }
  if (db) { saveDb(); db.close(); db = null; }
}

module.exports = { initDb, getDb, saveDb, startAutoSave, resetDb, closeDb, dbGet, dbAll, dbRun };
