/**
 * Merkezi ID üretici
 * Tüm modüller bu fonksiyonu kullanır
 */

function generateId(prefix = 'u') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

module.exports = { generateId };
