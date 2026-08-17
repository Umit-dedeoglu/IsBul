/**
 * İlk Admin Kullanıcısı Oluştur
 * Kullanım: node scripts/seed-admin.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { initDb, dbGet, dbRun } = require('../src/db');

async function seedAdmin() {
  await initDb();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@isbul.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  // Zaten var mı kontrol et
  const existing = dbGet('SELECT * FROM users WHERE email = ?', adminEmail);
  if (existing) {
    console.log('✅ Admin kullanıcısı zaten mevcut:', adminEmail);
    process.exit(0);
  }

  const adminId = 'u_admin_' + Date.now();
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  dbRun(`
    INSERT INTO users (id, first_name, last_name, email, password_hash, role, email_verified, avatar, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, adminId, 'Admin', 'İşBul', adminEmail, hashedPassword, 'admin', 1, 'AI', '#6C63FF');

  // Expert profili de oluştur (admin aynı zamanda uzman olabilir)
  dbRun(`
    INSERT INTO expert_profiles (user_id, price, bio, city, tags, hours)
    VALUES (?, ?, ?, ?, ?, ?)
  `, adminId, 500, 'İşBul platform yöneticisi', 'İstanbul', '["Yönetim","Danışmanlık"]', '09:00-18:00');

  console.log('\n✅ Admin kullanıcısı oluşturuldu!');
  console.log(`   E-posta: ${adminEmail}`);
  console.log(`   Şifre:   ${adminPassword}`);
  console.log('\n⚠️  Üretimde şifreyi değiştirmeyi unutma!\n');

  process.exit(0);
}

seedAdmin().catch(err => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});
