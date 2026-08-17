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
router.get('/me',        authenticate, ctrl.me);
router.post('/forgot-password', pwReset.forgotPassword);
router.post('/reset-password',  pwReset.resetPassword);
router.post('/verify-email',    pwReset.verifyEmail);

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:4000'}?auth=error` }),
  (req, res) => {
    // Başarılı OAuth — token üret ve frontend'e yönlendir
    const token = signToken({ id: req.user.id, email: req.user.email, role: req.user.role });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
    // Token'ı URL'e ekle — frontend bunu alıp localStorage'a kaydeder
    res.redirect(`${frontendUrl}/oauth-callback.html?token=${token}`);
  }
);

module.exports = router;
