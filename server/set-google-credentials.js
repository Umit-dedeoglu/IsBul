/**
 * Google OAuth credentials'ı .env dosyasına yazar.
 * Kullanım: node set-google-credentials.js <CLIENT_ID> <CLIENT_SECRET>
 */
const fs   = require('fs');
const path = require('path');

const [,, clientId, clientSecret] = process.argv;

if (!clientId || !clientSecret) {
  console.error('Kullanım: node set-google-credentials.js <CLIENT_ID> <CLIENT_SECRET>');
  process.exit(1);
}

const envPath = path.join(__dirname, '.env');
let content   = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

function setEnvVar(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  }
  return content + `\n${key}=${value}`;
}

content = setEnvVar(content, 'GOOGLE_CLIENT_ID',     clientId);
content = setEnvVar(content, 'GOOGLE_CLIENT_SECRET', clientSecret);

fs.writeFileSync(envPath, content);
console.log('✅ .env güncellendi!');
console.log(`   GOOGLE_CLIENT_ID:     ${clientId.slice(0, 20)}...`);
console.log(`   GOOGLE_CLIENT_SECRET: ****`);
console.log('\n⚡ Sunucuyu yeniden başlatın: node src/app.js');
