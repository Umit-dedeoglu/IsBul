/**
 * Şifre Sıfırlama - Forgot Password / Reset Password
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { dbGet, dbRun } = require('../../db');
const { sendPasswordResetEmail } = require('../../services/email.service');

/** POST /api/v1/auth/forgot-password */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'E-posta adresi gerekli.' });
    }

    const user = await dbGet('SELECT * FROM users WHERE email = ?', email);
    if (!user) {
      // Güvenlik: Kullanıcı yoksa bile başarılı gibi davran (email enumeration önleme)
      return res.json({ 
        success: true, 
        message: 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama linki gönderildi.' 
      });
    }

    // Token oluştur
    const token = crypto.randomBytes(32).toString('hex');
    const tokenId = 'prt_' + Date.now();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    await dbRun(
      'INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      tokenId, user.id, token, expiresAt.toISOString()
    );

    // Gerçek mail gönder
    const resetLink = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;
    try {
      await sendPasswordResetEmail({
        to:         user.email,
        firstName:  user.first_name || user.firstName || '',
        resetToken: token,
      });
    } catch (mailErr) {
      console.error('[forgot-password] Mail gönderilemedi:', mailErr.message);
      // Mail hatası isteği durdurmaz — loglarda görülebilir
    }

    // Development için token'ı da dön
    console.log(`\n🔐 ŞİFRE SIFIRLAMA LİNKİ:\n   ${resetLink}\n`);

    return res.json({ 
      success: true, 
      message: 'Şifre sıfırlama linki e-posta adresinize gönderildi.',
      // Development için token'ı dön (production'da kaldırılmalı!)
      ...(process.env.NODE_ENV !== 'production' && { devToken: token, devLink: resetLink })
    });
  } catch (err) {
    console.error('[forgot-password]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** POST /api/v1/auth/reset-password */
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Token ve yeni şifre gerekli.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'Şifre en az 8 karakter olmalı.' });
    }

    // Token kontrolü
    const resetToken = await dbGet(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > ?',
      token, new Date().toISOString()
    );

    if (!resetToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Geçersiz veya süresi dolmuş token.' 
      });
    }

    // Şifreyi güncelle
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await dbRun('UPDATE users SET password_hash = ? WHERE id = ?', hashedPassword, resetToken.user_id);

    // Token'ı kullanılmış olarak işaretle
    await dbRun('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', resetToken.id);

    return res.json({ 
      success: true, 
      message: 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.' 
    });
  } catch (err) {
    console.error('[reset-password]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

module.exports = { forgotPassword, resetPassword };


/** POST /api/v1/auth/verify-email */
async function verifyEmail(req, res) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token gerekli.' });
    }

    // Basit token kontrolü (gerçekte veritabanında tutulur)
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, timestamp] = decoded.split('|');
    
    const user = await dbGet('SELECT * FROM users WHERE id = ?', userId);
    if (!user) {
      return res.status(400).json({ success: false, error: 'Geçersiz token.' });
    }

    await dbRun('UPDATE users SET email_verified = 1 WHERE id = ?', userId);

    return res.json({ success: true, message: 'E-posta adresiniz doğrulandı!' });
  } catch (err) {
    console.error('[verify-email]', err);
    return res.status(400).json({ success: false, error: 'Geçersiz token.' });
  }
}

module.exports = { forgotPassword, resetPassword, verifyEmail };
