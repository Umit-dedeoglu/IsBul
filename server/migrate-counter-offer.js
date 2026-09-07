/**
 * Migration: Add counter_offer_price to existing bookings tables
 * Run this once: node migrate-counter-offer.js
 */
const { initDb } = require('./src/db');

async function migrate() {
  console.log('[MIGRATION] Starting counter-offer migration...');
  
  try {
    const db = await initDb();
    
    // Check if column already exists
    const columns = db.exec("PRAGMA table_info(bookings)");
    const hasColumn = columns[0]?.values?.some(col => col[1] === 'counter_offer_price');
    
    if (hasColumn) {
      console.log('[MIGRATION] ✅ counter_offer_price column already exists.');
      return;
    }
    
    // Add the column
    console.log('[MIGRATION] Adding counter_offer_price column...');
    db.run('ALTER TABLE bookings ADD COLUMN counter_offer_price INTEGER');
    
    console.log('[MIGRATION] ✅ Migration completed successfully!');
    console.log('[MIGRATION] Counter-Offer Booking Engine is now active.');
  } catch (err) {
    console.error('[MIGRATION] ❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate().then(() => {
  console.log('[MIGRATION] Done. Server can now be restarted.');
  process.exit(0);
});
