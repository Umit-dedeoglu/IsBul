/**
 * Input sanitization — XSS koruması
 * HTML tag'lerini regex ile kaldırır, entity'leri decode eder
 * Jest/CommonJS uyumlu (sanitize-html yerine)
 */

/**
 * HTML tag'lerini kaldır ve tehlikeli karakterleri temizle
 */
function sanitizeText(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    // Script/style tag içeriklerini tamamen kaldır
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    // Tüm HTML tag'lerini kaldır
    .replace(/<[^>]+>/g, '')
    // HTML entity'leri decode et (& < > " ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Birden fazla alanı sanitize et
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
