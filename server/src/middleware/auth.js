const { verifyToken } = require('../config/jwt');
const cache = require('../config/cache');

/**
 * Token blacklist kontrolü
 * Logout olan token'lar Redis'te saklanır
 */
async function isBlacklisted(token) {
  const result = await cache.get(`blacklist:${token}`);
  return !!result;
}

/**
 * Token'ı blacklist'e ekle (logout için)
 * TTL: token'ın kalan süresi kadar (max 7 gün)
 */
async function blacklistToken(token) {
  // Token'ın exp claim'inden kalan süreyi hesapla
  try {
    const payload = verifyToken(token);
    const now = Math.floor(Date.now() / 1000);
    const ttl = Math.max((payload.exp || 0) - now, 1);
    await cache.set(`blacklist:${token}`, '1', ttl);
  } catch {
    // Token zaten geçersizse yine de 7 gün blacklist'e al
    await cache.set(`blacklist:${token}`, '1', 7 * 24 * 60 * 60);
  }
}

/**
 * JWT doğrulama middleware
 * Authorization: Bearer <token>
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Oturum açmanız gerekiyor.' });
  }
  const token = authHeader.slice(7);
  try {
    // Blacklist kontrolü — cache yoksa (test/dev) geç
    const blacklisted = await isBlacklisted(token).catch(() => false);
    if (blacklisted) {
      return res.status(401).json({ success: false, error: 'Oturum sonlandırılmış. Lütfen tekrar giriş yapın.' });
    }
    req.user = verifyToken(token);
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Geçersiz veya süresi dolmuş oturum.' });
  }
}

/**
 * Opsiyonel JWT doğrulama (giriş yapmadan da çalışır)
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = authHeader.slice(7);
  try {
    if (await isBlacklisted(token)) {
      req.user = null;
      return next();
    }
    req.user = verifyToken(token);
    req.token = token;
  } catch {
    req.user = null;
  }
  next();
}

/**
 * Rol kontrolü middleware factory
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

module.exports = { authenticate, optionalAuth, requireRole, blacklistToken };
