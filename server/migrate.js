/**
 * Migration Runner: Add counter_offer_price to existing databases
 * Run this once to update your existing database
 */
const { initDb, dbRun } = require('./src/db');

async function migrate() {
  console.log('[MIGRATION] Starting database migration...');
  
  try {
    const db = await initDb();
    
    // Check if column already exists
    const columns = db.exec("PRAGMA table_info(bookings)");
    const hasColumn = columns[0]?.values?.some(col => col[1] === 'counter_offer_price');
    
    if (hasColumn) {
      console.log('[MIGRATION] counter_offer_price column already exists. Skipping.');
      return;
    }
    
    // Add the column
    console.log('[MIGRATION] Adding counter_offer_price column to bookings table...');
    dbRun('ALTER TABLE bookings ADD COLUMN counter_offer_price INTEGER');
    
    console.log('[MIGRATION] ✅ Migration completed successfully!');
    console.log('[MIGRATION] Counter-Offer Booking Engine is now ready.');
  } catch (err) {
    console.error('[MIGRATION] ❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate().then(() => {
  console.log('[MIGRATION] Done. You can now restart your server.');
  process.exit(0);
});
