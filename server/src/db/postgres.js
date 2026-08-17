/**
 * PostgreSQL Database Adapter (Supabase)
 * Production-ready database with connection pooling
 */
const { Pool } = require('pg');

let pool = null;

/** Initialize PostgreSQL connection pool */
async function initPostgres() {
  if (pool) return;

  const isProduction = process.env.NODE_ENV === 'production';
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString && isProduction) {
    throw new Error('DATABASE_URL is required in production');
  }

  // Development: SQLite fallback
  if (!connectionString) {
    console.log('⚠️  PostgreSQL URL not found, using SQLite for development');
    return require('./database').initDb();
  }

  pool = new Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    max: 20,                    // Max connections
    idleTimeoutMillis: 30000,   // Close idle connections after 30s
    connectionTimeoutMillis: 5000,
  });

  // Test connection
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected:', connectionString.split('@')[1]?.split('/')[0]);
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    throw err;
  }

  // Create tables
  await createTables();
  console.log('✅ PostgreSQL tables ready');
}

/** Create all tables */
async function createTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        avatar TEXT,
        color TEXT DEFAULT '#6C63FF',
        role TEXT DEFAULT 'customer' CHECK (role IN ('customer','expert','admin','pending_expert')),
        is_active BOOLEAN DEFAULT TRUE,
        google_id TEXT UNIQUE,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Expert Profiles
    await client.query(`
      CREATE TABLE IF NOT EXISTS expert_profiles (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        price INTEGER DEFAULT 250,
        bio TEXT,
        city TEXT,
        tags TEXT,
        hours TEXT DEFAULT '09:00-18:00',
        experience TEXT,
        rating REAL DEFAULT 5.0,
        review_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bookings
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        customer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        expert_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        service TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        duration_type TEXT DEFAULT 'hours',
        duration_value INTEGER DEFAULT 1,
        slots TEXT,
        total_price INTEGER,
        city TEXT,
        notes TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','cancelled','completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Calendar Slots
    await client.query(`
      CREATE TABLE IF NOT EXISTS calendar_slots (
        id TEXT PRIMARY KEY,
        expert_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        slot TEXT NOT NULL,
        booking_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(expert_id, slot)
      )
    `);

    // Reviews
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        expert_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        customer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        text TEXT,
        service TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Password Reset Tokens
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_bookings_expert ON bookings(expert_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_calendar_expert ON calendar_slots(expert_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_reviews_expert ON reviews(expert_id)');

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Query wrapper */
async function query(sql, params = []) {
  if (!pool) throw new Error('Database not initialized');
  const result = await pool.query(sql, params);
  return result.rows;
}

/** Get single row */
async function pgGet(sql, ...params) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

/** Get all rows */
async function pgAll(sql, ...params) {
  return await query(sql, params);
}

/** Execute (INSERT/UPDATE/DELETE) */
async function pgRun(sql, ...params) {
  const result = await pool.query(sql, params);
  return result.rowCount;
}

/** Close pool */
async function closePostgres() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('PostgreSQL connection closed');
  }
}

module.exports = {
  initPostgres,
  pgGet,
  pgAll,
  pgRun,
  closePostgres,
  pool: () => pool,
};
