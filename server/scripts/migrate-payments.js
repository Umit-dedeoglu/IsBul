/**
 * Payments tablosu migration
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

    // Payments tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id                TEXT PRIMARY KEY,
        booking_id        TEXT REFERENCES bookings(id) ON DELETE CASCADE,
        customer_id       TEXT REFERENCES users(id) ON DELETE CASCADE,
        amount            INTEGER NOT NULL,
        currency          TEXT DEFAULT 'TRY',
        status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
        iyzico_token      TEXT,
        iyzico_payment_id TEXT,
        conversation_id   TEXT,
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ payments tablosu oluşturuldu');

    // İndexler
    await client.query('CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_payments_token ON payments(iyzico_token)');
    console.log('✅ payments indexleri oluşturuldu');

    await client.query('COMMIT');
    console.log('\n✅ Migration tamamlandı!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration başarısız:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
