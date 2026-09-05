/**
 * PostgreSQL Migration Script
 * Eksik sütunları, sütun isim düzeltmelerini ve index'leri ekler.
 * Güvenli: IF NOT EXISTS / DO NOTHING ile idempotent çalışır.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://postgres.msizckgdsizcilmhpcqn:IsBulProd2024@aws-0-eu-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🔄 Migration başlıyor...\n');

    // ── 1. bookings tablosuna eksik sütunlar ──────────────────────────────
    const bookingCols = [
      { name: 'end_date',       type: 'TEXT' },
      { name: 'end_time',       type: 'TEXT' },
      { name: 'duration_label', type: 'TEXT' },
      { name: 'slots',          type: 'TEXT DEFAULT \'[]\'' },
    ];
    for (const col of bookingCols) {
      await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
      console.log(`  ✅ bookings.${col.name} eklendi (IF NOT EXISTS)`);
    }

    // ── 2. calendar_slots — slot_key sütunu ekle (slot yanında) ──────────
    // Mevcut 'slot' sütununu koruyup 'slot_key' alias olarak ekle
    await client.query(`ALTER TABLE calendar_slots ADD COLUMN IF NOT EXISTS slot_key TEXT`);
    console.log('  ✅ calendar_slots.slot_key eklendi');

    // slot_key'i slot ile senkronize et (mevcut kayıtlar için)
    await client.query(`UPDATE calendar_slots SET slot_key = slot WHERE slot_key IS NULL`);
    console.log('  ✅ calendar_slots.slot_key güncellendi (slot\'tan kopyalandı)');

    // ── 3. expert_profiles — experience sütunu ────────────────────────────
    await client.query(`ALTER TABLE expert_profiles ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT '1 yıl'`);
    console.log('  ✅ expert_profiles.experience eklendi');

    // ── 4. users — email_verified ──────────────────────────────────────────
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE`);
    console.log('  ✅ users.email_verified eklendi');

    // ── 5. Eksik index'ler ────────────────────────────────────────────────
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)',
      'CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date)',
      'CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON bookings(date, status)',
      'CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_calendar_slot_key ON calendar_slots(expert_id, slot_key)',
      'CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token)',
      'CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at)',
    ];
    for (const idx of indexes) {
      await client.query(idx);
      const name = idx.match(/idx_\w+/)[0];
      console.log(`  ✅ Index: ${name}`);
    }

    // ── 6. password_reset_tokens tablosu yoksa oluştur ────────────────────
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
    console.log('  ✅ password_reset_tokens tablosu (IF NOT EXISTS)');

    await client.query('COMMIT');
    console.log('\n✅ Migration başarıyla tamamlandı!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration başarısız:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
