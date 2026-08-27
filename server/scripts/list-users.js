const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.msizckgdsizcilmhpcqn:IsBulProd2024@aws-0-eu-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    // Tüm kullanıcılar
    const users = await client.query(
      "SELECT id, first_name, last_name, email, role, is_active, created_at FROM users ORDER BY created_at DESC"
    );
    console.log('\n=== TÜM KULLANICILAR (' + users.rows.length + ') ===');
    users.rows.forEach(u => {
      console.log(`[${u.role.toUpperCase()}] ${u.first_name} ${u.last_name} | ${u.email} | aktif:${u.is_active}`);
    });

    // Uzmanlar
    const experts = await client.query(`
      SELECT u.first_name, u.last_name, u.email, ep.price, ep.city, ep.rating, ep.review_count, ep.tags
      FROM users u JOIN expert_profiles ep ON ep.user_id = u.id
      WHERE u.role IN ('expert','admin')
      ORDER BY ep.rating DESC
    `);
    console.log('\n=== UZMANLAR (' + experts.rows.length + ') ===');
    experts.rows.forEach(e => {
      const tags = JSON.parse(e.tags || '[]').join(', ');
      console.log(`${e.first_name} ${e.last_name} | ${e.city} | ₺${e.price}/saat | ⭐${e.rating} (${e.review_count} yorum) | ${tags}`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}
run().catch(e => { console.error(e.message); process.exit(1); });
