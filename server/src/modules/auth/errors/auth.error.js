/**
 * Custom Auth Error
 * Authentication hatalarını tiplendirir ve standartlaştırır
 */
class AuthError extends Error {
  /**
   * @param {string} code - Error code (EMAIL_NOT_VERIFIED, INVALID_TOKEN, vb.)
   * @param {object} data - Ek bilgiler (userId, email, vb.)
   * @param {string} message - Kullanıcıya gösterilecek mesaj (opsiyonel)
   */
  constructor(code, data = {}, message = null) {
    super(message || code);
    this.name = 'AuthError';
    this.code = code;
    this.data = data;
    this.isOperational = true; // Beklenen hata (bug değil)
  }
}

/**
 * Auth Error Kodları
 * Yeni hata tipleri buraya eklenir
 */
AuthError.CODES = {
  // Token errors
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  NO_TOKEN: 'NO_TOKEN',
  
  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_EXISTS: 'USER_EXISTS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Verification errors
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  PHONE_NOT_VERIFIED: 'PHONE_NOT_VERIFIED',
  
  // Account status
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  
  // Security
  TWO_FACTOR_REQUIRED: 'TWO_FACTOR_REQUIRED',
  INVALID_TWO_FACTOR_CODE: 'INVALID_TWO_FACTOR_CODE',
  
  // Provider errors
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  GOOGLE_AUTH_FAILED: 'GOOGLE_AUTH_FAILED',
  FACEBOOK_AUTH_FAILED: 'FACEBOOK_AUTH_FAILED',
};

/**
 * Kullanıcı dostu hata mesajları
 */
AuthError.MESSAGES = {
  [AuthError.CODES.INVALID_TOKEN]: 'Geçersiz oturum. Lütfen tekrar giriş yapın.',
  [AuthError.CODES.TOKEN_EXPIRED]: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
  [AuthError.CODES.NO_TOKEN]: 'Lütfen giriş yapın.',
  [AuthError.CODES.USER_NOT_FOUND]: 'Kullanıcı bulunamadı.',
  [AuthError.CODES.INVALID_CREDENTIALS]: 'E-posta veya şifre hatalı.',
  [AuthError.CODES.USER_EXISTS]: 'Bu e-posta adresi zaten kayıtlı.',
  [AuthError.CODES.EMAIL_NOT_VERIFIED]: 'Lütfen e-posta adresinizi doğrulayın.',
  [AuthError.CODES.PHONE_NOT_VERIFIED]: 'Lütfen telefon numaranızı doğrulayın.',
  [AuthError.CODES.ACCOUNT_SUSPENDED]: 'Hesabınız askıya alınmış.',
  [AuthError.CODES.ACCOUNT_INACTIVE]: 'Hesabınız devre dışı.',
  [AuthError.CODES.TWO_FACTOR_REQUIRED]: 'İki faktörlü doğrulama gerekli.',
  [AuthError.CODES.INVALID_TWO_FACTOR_CODE]: 'Geçersiz doğrulama kodu.',
  [AuthError.CODES.PROVIDER_ERROR]: 'Giriş sağlayıcısında bir hata oluştu.',
  [AuthError.CODES.GOOGLE_AUTH_FAILED]: 'Google ile giriş yapılamadı.',
  [AuthError.CODES.FACEBOOK_AUTH_FAILED]: 'Facebook ile giriş yapılamadı.',
};

/**
 * Error code'a göre kullanıcı dostu mesaj getir
 * @param {string} code - Error code
 * @returns {string} - Kullanıcı dostu mesaj
 */
AuthError.getMessage = function(code) {
  return AuthError.MESSAGES[code] || 'Bir hata oluştu.';
};

module.exports = AuthError;
