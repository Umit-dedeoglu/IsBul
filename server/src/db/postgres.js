/**
 * PostgreSQL Database Adapter (Supabase)
 * Production-ready database with connection pooling
 * 
 * LIVE SYSTEM - CAREFUL WITH CHANGES
 * 
 * Key Compatibility Notes:
 * - SQLite uses INTEGER for booleans (0/1), PostgreSQL uses BOOLEAN (true/false)
 * - SQLite uses TEXT for dates, PostgreSQL uses TIMESTAMP
 * - SQLite uses datetime('now'), PostgreSQL uses CURRENT_TIMESTAMP
 * - SQLite uses ? placeholders, PostgreSQL uses $1, $2, etc.
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
    const hostInfo = connectionString.split('@')[1]?.split('/')[0] || 'supabase';
    console.log('✅ PostgreSQL connected:', hostInfo);
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    throw err;
  }

  // Verify schema (don't create tables on live DB)
  console.log('✅ PostgreSQL ready (live database)');
}

/** Convert SQLite-style ? placeholders to PostgreSQL $1, $2, ... */
function convertPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

/** 
 * Convert SQLite datetime functions to PostgreSQL equivalents
 * Handles all datetime patterns used in the codebase:
 * - datetime('now') → CURRENT_TIMESTAMP
 * - datetime("now") → CURRENT_TIMESTAMP  
 * - datetime('now', '-7 days') → NOW() - INTERVAL '7 days'
 * - datetime('now', '+1 hour') → NOW() + INTERVAL '1 hour'
 */
function convertDateTimeFunctions(sql) {
  // First handle datetime with intervals: datetime('now', '-7 days')
  sql = sql.replace(
    /datetime\s*\(\s*['"]now['"]\s*,\s*['"]([-+])(\d+)\s+(day|days|hour|hours|minute|minutes|second|seconds)['"]\s*\)/gi,
    (match, sign, num, unit) => {
      const op = sign === '-' ? '-' : '+';
      // Normalize unit to PostgreSQL format (always plural)
      const normalizedUnit = unit.endsWith('s') ? unit : unit + 's';
      return `NOW() ${op} INTERVAL '${num} ${normalizedUnit}'`;
    }
  );
  
  // Then handle simple datetime('now') or datetime("now")
  sql = sql.replace(/datetime\s*\(\s*['"]now['"]\s*\)/gi, 'CURRENT_TIMESTAMP');
  
  return sql;
}

/** 
 * Query wrapper with full SQLite-to-PostgreSQL compatibility
 * Automatically converts placeholders and datetime functions
 */
async function query(sql, params = []) {
  if (!pool) throw new Error('Database not initialized');
  
  // Convert datetime functions first, then placeholders
  let convertedSql = convertDateTimeFunctions(sql);
  convertedSql = convertPlaceholders(convertedSql);
  
  const result = await pool.query(convertedSql, params);
  return result.rows;
}

/** 
 * Get single row (SELECT)
 * Returns null instead of undefined for SQLite compatibility
 */
async function pgGet(sql, ...params) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

/** 
 * Get all rows (SELECT)
 * Returns array of rows
 */
async function pgAll(sql, ...params) {
  return await query(sql, params);
}

/** 
 * Execute (INSERT/UPDATE/DELETE)
 * Returns number of affected rows for compatibility
 */
async function pgRun(sql, ...params) {
  let convertedSql = convertDateTimeFunctions(sql);
  convertedSql = convertPlaceholders(convertedSql);
  
  const result = await pool.query(convertedSql, params);
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
