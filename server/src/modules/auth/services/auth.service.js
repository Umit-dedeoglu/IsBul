/**
 * Auth Service
 * 
 * Provider'ları yönetir ve authentication işlemlerini koordine eder.
 * Controller ile Provider'lar arasında köprü görevi görür.
 */
const EmailAuthProvider = require('../providers/email-auth.provider');
const AuthError = require('../errors/auth.error');

class AuthService {
  constructor() {
    // Provider'ları kaydet
    this.providers = {
      email: new EmailAuthProvider(),
      // Gelecekte: google, facebook, vb.
    };
  }

  /**
   * Token'dan provider'ı algıla
   * @param {string} token - Auth token
   * @returns {string} - Provider name (email, google, facebook)
   */
  detectProvider(token) {
    // JWT token format kontrolü (email provider)
    if (token.split('.').length === 3) {
      return 'email';
    }

    // Google OAuth token format
    if (token.startsWith('ya29.')) {
      return 'google';
    }

    // Facebook token format
    if (token.startsWith('EAA')) {
      return 'facebook';
    }

    // Default: email
    return 'email';
  }

  /**
   * Token'ı verify et (tüm provider'lar için)
   * @param {string} token - Auth token
   * @returns {Promise<User>}
   */
  async verifyToken(token) {
    try {
      const providerName = this.detectProvider(token);
      const provider = this.providers[providerName];

      if (!provider) {
        throw new AuthError(
          AuthError.CODES.PROVIDER_ERROR,
          { provider: providerName },
          `Provider not found: ${providerName}`
        );
      }

      // Provider'dan user bilgisi al
      const user = await provider.verify(token);

      // User'ı database'den enrich et (expert bilgisi, vb.)
      return await this.enrichUserWithExpertData(user);

    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        AuthError.CODES.INVALID_TOKEN,
        {},
        'Token doğrulama hatası'
      );
    }
  }

  /**
   * Email/Password ile login
   * @param {object} credentials - {email, password}
   * @returns {Promise<{user, token}>}
   */
  async loginWithEmail(credentials) {
    const provider = this.providers.email;
    const result = await provider.authenticate(credentials);

    // Expert bilgisi ekle
    result.user = await this.enrichUserWithExpertData(result.user);

    return result;
  }

  /**
   * Email/Password ile register
   * @param {object} data - {firstName, lastName, email, password, role}
   * @returns {Promise<{user, token}>}
   */
  async registerWithEmail(data) {
    const provider = this.providers.email;
    return await provider.register(data);
  }

  /**
   * User'a expert bilgisi ekle
   * @param {object} user - User object
   * @returns {Promise<object>} - Enriched user
   */
  async enrichUserWithExpertData(user) {
    const { dbGet } = require('../../../db');

    // Expert profili var mı kontrol et
    const expert = await dbGet(
      'SELECT * FROM expert_profiles WHERE user_id = ?',
      user.id
    );

    return {
      ...user,
      isExpert: user.role === 'expert' || user.role === 'admin',
      expertData: expert ? {
        price: expert.price,
        bio: expert.bio,
        city: expert.city,
        tags: JSON.parse(expert.tags || '[]'),
        hours: expert.hours,
        rating: expert.rating,
        reviews: expert.review_count,
      } : null
    };
  }

  /**
   * Yeni provider ekle (dinamik)
   * @param {string} name - Provider adı
   * @param {IAuthProvider} provider - Provider instance
   */
  registerProvider(name, provider) {
    this.providers[name] = provider;
  }
}

// Singleton instance
module.exports = new AuthService();
