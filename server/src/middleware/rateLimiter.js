const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter'lar
 * Web ve mobil istemciler için ayrı limitler
 */

/** Genel API limiti — 15 dakikada 200 istek */
const generalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              200,
  standardHeaders:  true,
  legacyHeaders:    false,
  validate:         { xForwardedForHeader: false, trustProxy: false },
  message: {
    success: false,
    error: {
      code:    'RATE_LIMIT_EXCEEDED',
      message: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.',
    }
  },
});

/** Auth limiti — 15 dakikada 20 istek (brute-force koruması) */
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             20,
  standardHeaders: true,
  legacyHeaders:   false,
  validate:        { xForwardedForHeader: false, trustProxy: false },
  message: {
    success: false,
    error: {
      code:    'AUTH_RATE_LIMIT',
      message: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
    }
  },
});

/** Yorum/Rezervasyon limiti — dakikada 10 istek */
const actionLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  validate:        { xForwardedForHeader: false, trustProxy: false },
  message: {
    success: false,
    error: {
      code:    'ACTION_RATE_LIMIT',
      message: 'Çok fazla işlem yapıldı. Lütfen bir dakika bekleyin.',
    }
  },
});

module.exports = { generalLimiter, authLimiter, actionLimiter };
