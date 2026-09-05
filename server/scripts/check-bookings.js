const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.msizckgdsizcilmhpcqn:IsBulProd2024@aws-0-eu-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    const r = await client.query('SELECT id, customer_id, expert_id, service, status, date, time, created_at FROM bookings ORDER BY created_at DESC LIMIT 10');
    console.log('Son 10 rezervasyon:');
    console.log(JSON.stringify(r.rows, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}
run().catch(e => { console.error(e.message); process.exit(1); });
