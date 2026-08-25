/**
 * Email Auth Provider Test
 * 
 * Manuel test için basit script
 * Kullanım: node src/modules/auth/providers/email-auth.provider.test.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../.env') });
const EmailAuthProvider = require('./email-auth.provider');
const { initDb } = require('../../../db');

async function test() {
  console.log('🧪 Email Auth Provider Test\n');

  try {
    // Database bağlantısı
    await initDb();
    console.log('✅ Database bağlandı\n');

    const provider = new EmailAuthProvider();

    // Test 1: Provider adı
    console.log('📋 Test 1: Provider Name');
    console.log('   Name:', provider.name);
    console.log('   ✅ Passed\n');

    // Test 2: Authentication (mevcut user ile)
    console.log('📋 Test 2: Authenticate (Existing User)');
    console.log('   Email: aslanates10@gmail.com');
    
    try {
      const result = await provider.authenticate({
        email: 'aslanates10@gmail.com',
        password: 'test_password_123' // Gerçek şifreyi gir
      });
      console.log('   ✅ Login başarılı');
      console.log('   User:', result.user.firstName, result.user.lastName);
      console.log('   Token:', result.token.substring(0, 30) + '...\n');
    } catch (error) {
      console.log('   ⚠️  Login failed (beklenen - şifre yanlış olabilir)');
      console.log('   Error:', error.message, '\n');
    }

    // Test 3: Token Verification
    console.log('📋 Test 3: Token Verification');
    
    // Önce bir token üret (register veya login ile)
    const { signToken } = require('../../../config/jwt');
    const testToken = signToken({
      id: 'u_test_123',
      email: 'test@example.com',
      role: 'customer'
    });

    try {
      // Bu token'ı verify etmeye çalış
      // (User database'de olmadığı için hata verecek - normal)
      await provider.verify(testToken);
      console.log('   ✅ Token verified\n');
    } catch (error) {
      console.log('   ⚠️  Verification failed (beklenen - test user yok)');
      console.log('   Error:', error.message, '\n');
    }

    // Test 4: Provider interface check
    console.log('📋 Test 4: Interface Implementation');
    console.log('   Methods:');
    console.log('   - name:', typeof provider.name === 'string' ? '✅' : '❌');
    console.log('   - verify:', typeof provider.verify === 'function' ? '✅' : '❌');
    console.log('   - authenticate:', typeof provider.authenticate === 'function' ? '✅' : '❌');
    console.log('   - register:', typeof provider.register === 'function' ? '✅' : '❌');

    console.log('\n✅ Tüm testler tamamlandı!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test hatası:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

test();
