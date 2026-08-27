/**
 * Input sanitization — XSS koruması
 * Tüm user-generated text içeriği bu fonksiyondan geçmeli
 */
const sanitizeHtml = require('sanitize-html');

// HTML tamamen yasaklı — sadece düz metin
const PLAIN_TEXT_OPTIONS = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
};

/**
 * Düz metin sanitize et (bio, notes, review, vb.)
 * HTML tag'lerini tamamen kaldırır
 */
function sanitizeText(input) {
  if (!input || typeof input !== 'string') return '';
  return sanitizeHtml(input.trim(), PLAIN_TEXT_OPTIONS);
}

/**
 * Birden fazla alanı sanitize et
 * @param {object} obj - Sanitize edilecek obje
 * @param {string[]} fields - Sanitize edilecek alan adları
 */
function sanitizeFields(obj, fields) {
  const result = { ...obj };
  fields.forEach(field => {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = sanitizeText(String(result[field]));
    }
  });
  return result;
}

module.exports = { sanitizeText, sanitizeFields };
