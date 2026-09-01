/**
 * Email/Password Authentication Provider
 * 
 * Email ve şifre ile authentication işlemlerini yönetir.
 * IAuthProvider interface'ini implement eder.
 */
const bcrypt = require('bcryptjs');
const IAuthProvider = require('../interfaces/auth-provider.interface');
const AuthError = require('../errors/auth.error');
const { dbGet, dbRun } = require('../../../db');
const { signToken } = require('../../../config/jwt');

class EmailAuthProvider extends IAuthProvider {
  /**
   * Provider adı
   */
  get name() {
    return 'email';
  }

  /**
   * JWT Token'ı verify et ve user bilgisi döndür
   * @param {string} token - JWT token
   * @returns {Promise<{id, email, firstName, lastName, role, provider}>}
   */
  async verify(token) {
    try {
      const { verifyToken } = require('../../../config/jwt');
      const decoded = verifyToken(token);
      
      // User'ı database'den getir
      const user = await dbGet('SELECT * FROM users WHERE id = ?', decoded.id);
      
      if (!user) {
        throw new AuthError(
          AuthError.CODES.USER_NOT_FOUND,
          { userId: decoded.id },
          'Kullanıcı bulunamadı'
        );
      }

      // User aktif mi kontrol et
      if (!user.is_active) {
        throw new AuthError(
          AuthError.CODES.ACCOUNT_INACTIVE,
          { userId: user.id },
          'Hesabınız devre dışı'
        );
      }

      // Standart user object döndür
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar,
        color: user.color,
        role: user.role,
        provider: 'email',
        isVerified: true // Email provider için varsayılan
      };

    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      
      // JWT verification hatası
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new AuthError(
          AuthError.CODES.INVALID_TOKEN,
          {},
          'Geçersiz veya süresi dolmuş oturum'
        );
      }

      throw error;
    }
  }

  /**
   * Email/Password ile authenticate et
   * @param {object} credentials - {email, password}
   * @returns {Promise<{user, token}>}
   */
  async authenticate({ email, password }) {
    // Validation
    if (!email || !password) {
      throw new AuthError(
        AuthError.CODES.INVALID_CREDENTIALS,
        {},
        'E-posta ve şifre gereklidir'
      );
    }

    // User'ı bul
    const user = await dbGet(
      'SELECT * FROM users WHERE email = ?',
      email.toLowerCase()
    );

    if (!user) {
      throw new AuthError(
        AuthError.CODES.USER_NOT_FOUND,
        { email },
        'Bu e-posta ile kayıtlı hesap bulunamadı'
      );
    }

    // Password hash kontrolü
    if (!user.password_hash) {
      throw new AuthError(
        AuthError.CODES.INVALID_CREDENTIALS,
        { email },
        'Bu hesap Google ile oluşturulmuştur'
      );
    }

    // Password doğrulama
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AuthError(
        AuthError.CODES.INVALID_CREDENTIALS,
        { email },
        'Şifre hatalı'
      );
    }

    // User aktif mi kontrol et
    if (!user.is_active) {
      throw new AuthError(
        AuthError.CODES.ACCOUNT_INACTIVE,
        { userId: user.id },
        'Hesabınız devre dışı'
      );
    }

    // Token üret
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // User object döndür (standart format)
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar,
        color: user.color,
        role: user.role,
        provider: 'email'
      },
      token
    };
  }

  /**
   * Yeni user kaydet
   * @param {object} data - {firstName, lastName, email, password, role, expertProfile}
   * @returns {Promise<{user, token}>}
   */
  async register({ firstName, lastName, email, password, role, expertProfile }) {
    // Validation
    if (!firstName || !lastName || !email || !password) {
      throw new AuthError(AuthError.CODES.VALIDATION_ERROR, {}, 'Tüm alanlar zorunludur');
    }

    // Email format kontrolü
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AuthError(AuthError.CODES.VALIDATION_ERROR, {}, 'Geçerli bir e-posta girin');
    }

    // Password uzunluk kontrolü
    if (password.length < 8) {
      throw new AuthError(AuthError.CODES.VALIDATION_ERROR, {}, 'Şifre en az 8 karakter olmalıdır');
    }

    // Email zaten kayıtlı mı kontrol et
    const existingUser = await dbGet(
      'SELECT id FROM users WHERE email = ?',
      email.toLowerCase()
    );

    if (existingUser) {
      throw new AuthError(
        AuthError.CODES.USER_EXISTS,
        { email },
        'Bu e-posta adresi zaten kayıtlı'
      );
    }

    // Password hash
    const passwordHash = await bcrypt.hash(password, 12);

    // User ID üret
    const userId = this._generateUserId();

    // Avatar ve color üret
    const avatar = this._getInitials(firstName, lastName);
    const color = this._randomColor();

    // Role belirleme
    const userRole = (role === 'pending_expert') ? 'pending_expert' : 'customer';

    // Database'e kaydet
    await dbRun(
      `INSERT INTO users (id, first_name, last_name, email, password_hash, avatar, color, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      userId,
      firstName,
      lastName,
      email.toLowerCase(),
      passwordHash,
      avatar,
      color,
      userRole
    );

    // ✅ YENİ: pending_expert ise expert_profiles tablosuna kaydet
    if (userRole === 'pending_expert' && expertProfile) {
      const { price, bio, city, tags, experience } = expertProfile;
      await dbRun(
        `INSERT INTO expert_profiles (user_id, price, bio, city, tags, experience)
         VALUES (?, ?, ?, ?, ?, ?)`,
        userId,
        price || 0,
        bio || '',
        city || '',
        JSON.stringify(tags || []),
        experience || ''
      );
    }

    // Token üret
    const token = signToken({
      id: userId,
      email: email.toLowerCase(),
      role: userRole
    });

    // User object döndür
    return {
      user: {
        id: userId,
        firstName,
        lastName,
        email: email.toLowerCase(),
        avatar,
        color,
        role: userRole,
        isExpert: false,
        provider: 'email'
      },
      token
    };
  }

  /**
   * Helper: User ID üret
   * @private
   */
  _generateUserId() {
    return `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  /**
   * Helper: İsim baş harflerini al
   * @private
   */
  _getInitials(firstName, lastName) {
    return ((firstName[0] || '') + (lastName[0] || '')).toUpperCase();
  }

  /**
   * Helper: Random renk seç
   * @private
   */
  _randomColor() {
    const colors = [
      '#6C63FF', '#FF6B6B', '#4ECDC4', '#FFD93D',
      '#96CEB4', '#56AB2F', '#f43f5e', '#0891b2'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

module.exports = EmailAuthProvider;
