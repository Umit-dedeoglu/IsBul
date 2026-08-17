const { verifyToken } = require('../config/jwt');

/**
 * JWT doğrulama middleware
 * Authorization: Bearer <token>
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Oturum açmanız gerekiyor.' });
  }
  const token = authHeader.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Geçersiz veya süresi dolmuş oturum.' });
  }
}

/**
 * Opsiyonel JWT doğrulama (giriş yapmadan da çalışır)
 * Token varsa req.user'a atar, yoksa next() ile devam eder
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = authHeader.slice(7);
  try {
    req.user = verifyToken(token);
  } catch (err) {
    req.user = null;
  }
  next();
}

/**
 * Rol kontrolü middleware factory
 * Kullanım: requireRole('admin') veya requireRole('expert')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Oturum açmanız gerekiyor.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Bu işlem için yetkiniz yok.' });
    }
    next();
  };
}

module.exports = { authenticate, optionalAuth, requireRole };
