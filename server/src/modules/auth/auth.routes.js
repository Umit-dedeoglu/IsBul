const express   = require('express');
const router    = express.Router();
const ctrl      = require('./auth.controller');
const pwReset   = require('./password-reset.controller');
const { authenticate } = require('../../middleware/auth');
const passport  = require('passport');
const { signToken } = require('../../config/jwt');

// E-posta / şifre
router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.post('/logout',   authenticate, ctrl.logout);
router.get('/me',        authenticate, ctrl.me);
router.post('/forgot-password', pwReset.forgotPassword);
router.post('/reset-password',  pwReset.resetPassword);
router.post('/verify-email',    pwReset.verifyEmail);

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL || 'https://isbul.online'}/oauth-callback.html?auth=error&error=Authentication%20failed`
  }),
  (req, res) => {
    try {
      // Başarılı OAuth — token üret ve frontend'e yönlendir
      const token = signToken({ id: req.user.id, email: req.user.email, role: req.user.role });
      const frontendUrl = process.env.FRONTEND_URL || 'https://isbul.online';
      
      console.log('✅ OAuth başarılı, token oluşturuldu');
      console.log('🚀 Yönlendirme URL:', `${frontendUrl}/oauth-callback.html?token=${token.substring(0, 20)}...`);
      
      // Token'ı URL'e ekle — frontend bunu alıp localStorage'a kaydeder
      res.redirect(`${frontendUrl}/oauth-callback.html?token=${token}`);
    } catch (err) {
      console.error('❌ OAuth callback hatası:', err);
      const frontendUrl = process.env.FRONTEND_URL || 'https://isbul.online';
      res.redirect(`${frontendUrl}/oauth-callback.html?auth=error&error=${encodeURIComponent(err.message)}`);
    }
  }
);

module.exports = router;
