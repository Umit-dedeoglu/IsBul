/**
 * Auth Provider Interface
 * Tüm authentication provider'lar bu interface'i implement etmelidir.
 * Bu sayede Google, Email, Facebook vb. bağımsız çalışır.
 */
class IAuthProvider {
  /**
   * Provider adı (google, email, facebook, vb.)
   * @returns {string}
   */
  get name() {
    throw new Error('name getter must be implemented');
  }

  /**
   * Token'ı doğrula ve user bilgisi döndür
   * @param {string} token - Authentication token
   * @returns {Promise<{id, email, name, avatar, provider}>}
   */
  async verify(token) {
    throw new Error('verify() method must be implemented');
  }

  /**
   * User'ı authenticate et ve token üret
   * @param {object} credentials - Login credentials
   * @returns {Promise<{user, token}>}
   */
  async authenticate(credentials) {
    throw new Error('authenticate() method must be implemented');
  }

  /**
   * Token'ı yenile (opsiyonel)
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<string>} - Yeni access token
   */
  async refresh(refreshToken) {
    // Optional - provider'lar override edebilir
    throw new Error('Token refresh not supported by this provider');
  }
}

module.exports = IAuthProvider;
