const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres.msizckgdsizcilmhpcqn:IsBulProd2024@aws-0-eu-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    const email = process.argv[2] || 'ahmetvural99@gmail.com';
    const password = process.argv[3] || '12345678';

    const r = await client.query("SELECT id, email, password_hash, role FROM users WHERE email = $1", [email]);
    if (!r.rows.length) { console.log('Kullanıcı bulunamadı:', email); return; }
    
    const user = r.rows[0];
    console.log('Kullanıcı:', user.email, '| Role:', user.role);
    console.log('Password hash var mı:', !!user.password_hash);
    
    if (user.password_hash) {
      const match = await bcrypt.compare(password, user.password_hash);
      console.log('Şifre eşleşiyor mu:', match);
    } else {
      console.log('Bu hesap Google ile oluşturulmuş, şifresi yok');
    }
  } finally {
    client.release();
    await pool.end();
  }
}
run().catch(e => { console.error(e.message); process.exit(1); });
