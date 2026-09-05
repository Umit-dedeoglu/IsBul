const jwt = require('jsonwebtoken');

const SECRET  = process.env.JWT_SECRET;
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

// Production'da JWT_SECRET zorunlu
if (!SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: JWT_SECRET environment variable is required in production!');
    process.exit(1);
  }
  console.warn('⚠️  JWT_SECRET not set, using insecure default (development only)');
}

const EFFECTIVE_SECRET = SECRET || 'isbul_dev_secret_do_not_use_in_production';

function signToken(payload) {
  return jwt.sign(payload, EFFECTIVE_SECRET, { expiresIn: EXPIRES });
}

function verifyToken(token) {
  return jwt.verify(token, EFFECTIVE_SECRET);
}

module.exports = { signToken, verifyToken };
