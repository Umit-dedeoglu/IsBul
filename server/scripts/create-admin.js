/**
 * İşBul — Admin hesabı oluşturma scripti
 * Kullanım: node scripts/create-admin.js
 * 
 * Ya da direkt bilgi vererek:
 * node scripts/create-admin.js --email admin@isbul.com --password Admin1234! --firstName Ümit --lastName Admin
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { initDb, dbGet, dbRun, closeDb } = require('../src/db/database');
const bcrypt = require('bcryptjs');

async function main() {
  await initDb();

  // Komut satırı argümanlarını parse et
  const args = process.argv.slice(2);
  const get  = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : null;
  };

  const email     = get('--email')     || 'admin@isbul.com';
  const password  = get('--password')  || 'Admin1234!';
  const firstName = get('--firstName') || 'Admin';
  const lastName  = get('--lastName')  || 'User';

  console.log('\n⚡ İşBul — Admin Kurulum Scripti');
  console.log('─'.repeat(40));

  // Mevcut admin var mı?
  const existingAdmin = dbGet("SELECT * FROM users WHERE role = 'admin'");
  if (existingAdmin) {
    console.log(`\n⚠️  Zaten bir admin hesabı mevcut:`);
    console.log(`   E-posta: ${existingAdmin.email}`);
    console.log(`   ID:      ${existingAdmin.id}`);
    console.log(`\n   Mevcut admin hesabını güncellemek için:`);
    console.log(`   node scripts/create-admin.js --email ${existingAdmin.email} --password YeniSifre123!`);
    closeDb();
    return;
  }

  // Mevcut kullanıcı bu e-postayla var mı?
  const existingUser = dbGet('SELECT * FROM users WHERE email = ?', email.toLowerCase());
  if (existingUser) {
    console.log(`\n✅ Mevcut kullanıcı admin yapılıyor: ${email}`);
    dbRun("UPDATE users SET role = 'admin', updated_at = datetime('now') WHERE email = ?", email.toLowerCase());
    // Expert profil yoksa oluştur
    const ep = dbGet('SELECT user_id FROM expert_profiles WHERE user_id = ?', existingUser.id);
    if (!ep) dbRun('INSERT INTO expert_profiles (user_id) VALUES (?)', existingUser.id);
    console.log('   Rol: admin ✓');
    printLoginInfo(email, password);
    closeDb();
    return;
  }

  // Yeni admin oluştur
  if (password.length < 8) {
    console.error('\n❌ Şifre en az 8 karakter olmalıdır.');
    closeDb();
    process.exit(1);
  }

  const hash   = await bcrypt.hash(password, 12);
  const id     = `u_admin_${Date.now()}`;
  const avatar = ((firstName[0] || 'A') + (lastName[0] || 'U')).toUpperCase();

  dbRun(
    `INSERT INTO users (id, first_name, last_name, email, password_hash, avatar, color, role)
     VALUES (?, ?, ?, ?, ?, ?, '#6C63FF', 'admin')`,
    id, firstName, lastName, email.toLowerCase(), hash, avatar
  );
  dbRun('INSERT INTO expert_profiles (user_id) VALUES (?)', id);

  console.log(`\n✅ Admin hesabı oluşturuldu!`);
  console.log(`   Ad:    ${firstName} ${lastName}`);
  console.log(`   ID:    ${id}`);
  printLoginInfo(email, password);
  closeDb();
}

function printLoginInfo(email, password) {
  console.log('\n─'.repeat(40));
  console.log('🔑 Giriş Bilgileri:');
  console.log(`   E-posta: ${email}`);
  console.log(`   Şifre:   ${password}`);
  console.log(`   URL:     http://localhost:4000/admin-panel.html`);
  console.log('─'.repeat(40));
  console.log('\nℹ️  Backend çalışıyor olmalı: node src/app.js\n');
}

main().catch(err => {
  console.error('\n❌ Hata:', err.message);
  process.exit(1);
});
