/**
 * Unified Database Interface
 * - Development: SQLite (fast, no setup)
 * - Production: PostgreSQL (scalable, Supabase)
 */

const isDev = process.env.NODE_ENV !== 'production';
const usePostgres = !!process.env.DATABASE_URL;

let db;

if (usePostgres) {
  console.log('📊 Database: PostgreSQL (Supabase)');
  db = require('./postgres');
} else {
  console.log('📊 Database: SQLite (Development)');
  db = require('./database');
}

module.exports = {
  initDb: usePostgres ? db.initPostgres : db.initDb,
  dbGet: usePostgres ? db.pgGet : db.dbGet,
  dbAll: usePostgres ? db.pgAll : db.dbAll,
  dbRun: usePostgres ? db.pgRun : db.dbRun,
  closeDb: usePostgres ? db.closePostgres : db.closeDb,
  startAutoSave: !usePostgres ? db.startAutoSave : () => {},
};
