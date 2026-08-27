/**
 * Upstash Redis Cache
 * 
 * Kullanım:
 *   const cache = require('./cache');
 *   await cache.set('key', data, 60);  // 60 saniye TTL
 *   const data = await cache.get('key');
 *   await cache.del('key');
 */

const { Redis } = require('@upstash/redis');

let redis = null;

function getRedis() {
  if (!redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return null; // Cache devre dışı, DB'den çek
    }
    redis = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

const cache = {
  /**
   * Cache'den veri al
   * @returns {any|null} - Veri yoksa null
   */
  async get(key) {
    try {
      const client = getRedis();
      if (!client) return null;
      return await client.get(key);
    } catch (err) {
      console.warn('[Cache] get hatası:', err.message);
      return null;
    }
  },

  /**
   * Cache'e veri kaydet
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds - Varsayılan 60 saniye
   */
  async set(key, value, ttlSeconds = 60) {
    try {
      const client = getRedis();
      if (!client) return;
      await client.set(key, value, { ex: ttlSeconds });
    } catch (err) {
      console.warn('[Cache] set hatası:', err.message);
    }
  },

  /**
   * Cache'den sil
   */
  async del(key) {
    try {
      const client = getRedis();
      if (!client) return;
      await client.del(key);
    } catch (err) {
      console.warn('[Cache] del hatası:', err.message);
    }
  },

  /**
   * Pattern ile sil (örn: "experts:*")
   */
  async delPattern(pattern) {
    try {
      const client = getRedis();
      if (!client) return;
      const keys = await client.keys(pattern);
      if (keys.length > 0) await client.del(...keys);
    } catch (err) {
      console.warn('[Cache] delPattern hatası:', err.message);
    }
  },
};

module.exports = cache;
