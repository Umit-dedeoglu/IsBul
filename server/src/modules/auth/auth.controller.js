const authService = require('./services/auth.service');
const AuthError = require('./errors/auth.error');
const { dbGet } = require('../../db');

/** POST /api/auth/register */
async function register(req, res) {
  try {
    // ✅ YENİ: AuthService kullan
    const { firstName, lastName, email, password, role } = req.body;

    const result = await authService.registerWithEmail({
      firstName,
      lastName,
      email,
      password,
      role
    });

    return res.status(201).json({
      success: true,
      message: `Hoş geldiniz, ${firstName}!`,
      token: result.token,
      user: formatUserFromProvider(result.user)
    });

  } catch (err) {
    console.error('[auth/register]', err);

    // AuthError handling
    if (err instanceof AuthError) {
      const statusCode = getStatusCodeFromAuthError(err.code);
      return res.status(statusCode).json({ 
        success: false, 
        error: err.message 
      });
    }

    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** POST /api/auth/login */
async function login(req, res) {
  try {
    // ✅ YENİ: AuthService kullan
    const { email, password } = req.body;
    
    const result = await authService.loginWithEmail({ email, password });

    return res.json({
      success: true,
      token: result.token,
      user: formatUserFromProvider(result.user)
    });

  } catch (err) {
    console.error('[auth/login]', err);

    // AuthError handling
    if (err instanceof AuthError) {
      const statusCode = getStatusCodeFromAuthError(err.code);
      return res.status(statusCode).json({ 
        success: false, 
        error: err.message 
      });
    }

    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** GET /api/auth/me */
async function me(req, res) {
  try {
    // ✅ YENİ: AuthService kullan
    const user = await dbGet('SELECT * FROM users WHERE id = ?', req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });
    
    // Expert bilgisi ekle (authService üzerinden)
    const enrichedUser = await authService.enrichUserWithExpertData({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar,
      color: user.color,
      role: user.role,
      provider: 'email'
    });

    return res.json({ 
      success: true, 
      user: formatUser(user, enrichedUser.expertData) 
    });

  } catch (err) {
    console.error('[auth/me]', err);
    
    // AuthError handling
    if (err instanceof AuthError) {
      return res.status(403).json({ 
        success: false, 
        error: err.message 
      });
    }

    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

function formatUser(user, expert) {
  return {
    id:        user.id,
    firstName: user.first_name,
    lastName:  user.last_name,
    email:     user.email,
    avatar:    user.avatar,
    color:     user.color,
    role:      user.role,
    isExpert:  user.role === 'expert' || user.role === 'admin',
    expertData: expert ? {
      price:   expert.price,
      bio:     expert.bio,
      city:    expert.city,
      tags:    JSON.parse(expert.tags || '[]'),
      hours:   expert.hours,
      rating:  expert.rating,
      reviews: expert.review_count,
    } : null
  };
}

/**
 * Provider'dan gelen user object'i frontend formatına çevir
 * @param {object} user - Provider user object
 * @returns {object} - Frontend format user
 */
function formatUserFromProvider(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatar: user.avatar,
    color: user.color,
    role: user.role,
    isExpert: user.isExpert || false,
    expertData: user.expertData || null
  };
}

/**
 * AuthError code'a göre HTTP status code döndür
 * @param {string} code - AuthError code
 * @returns {number} - HTTP status code
 */
function getStatusCodeFromAuthError(code) {
  const statusMap = {
    [AuthError.CODES.INVALID_TOKEN]: 401,
    [AuthError.CODES.TOKEN_EXPIRED]: 401,
    [AuthError.CODES.NO_TOKEN]: 401,
    [AuthError.CODES.USER_NOT_FOUND]: 404,
    [AuthError.CODES.INVALID_CREDENTIALS]: 401,
    [AuthError.CODES.USER_EXISTS]: 409,
    [AuthError.CODES.EMAIL_NOT_VERIFIED]: 403,
    [AuthError.CODES.PHONE_NOT_VERIFIED]: 403,
    [AuthError.CODES.ACCOUNT_SUSPENDED]: 403,
    [AuthError.CODES.ACCOUNT_INACTIVE]: 403,
    [AuthError.CODES.TWO_FACTOR_REQUIRED]: 403,
    [AuthError.CODES.INVALID_TWO_FACTOR_CODE]: 401,
    [AuthError.CODES.PROVIDER_ERROR]: 500,
    [AuthError.CODES.GOOGLE_AUTH_FAILED]: 401,
    [AuthError.CODES.FACEBOOK_AUTH_FAILED]: 401,
  };
  return statusMap[code] || 500;
}

module.exports = { register, login, me };
