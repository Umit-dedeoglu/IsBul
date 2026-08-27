/**
 * Merkezi formatter fonksiyonları
 * Tüm modüller bu fonksiyonları kullanır — DRY
 */

/**
 * DB user row'unu frontend formatına çevir
 */
function formatUser(u, expertData = null) {
  if (!u) return null;
  return {
    id:         u.id,
    firstName:  u.first_name,
    lastName:   u.last_name,
    email:      u.email,
    avatar:     u.avatar,
    color:      u.color,
    role:       u.role,
    isActive:   !!u.is_active,
    isExpert:   u.role === 'expert' || u.role === 'admin',
    googleId:   u.google_id || null,
    createdAt:  u.created_at,
    expertData: expertData || null,
  };
}

/**
 * tags sütununu güvenli parse et
 */
function parseTags(tags) {
  if (Array.isArray(tags)) return tags;
  try {
    return JSON.parse(tags || '[]');
  } catch {
    return [];
  }
}

/**
 * slots sütununu güvenli parse et
 */
function parseSlots(slots) {
  if (Array.isArray(slots)) return slots;
  try {
    return JSON.parse(slots || '[]');
  } catch {
    return [];
  }
}

module.exports = { formatUser, parseTags, parseSlots };
