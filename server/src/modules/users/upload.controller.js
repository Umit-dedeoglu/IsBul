/**
 * Profil Fotoğrafı Upload
 * Basit: Base64 avatar string (database'e kaydediliyor)
 * Gelişmiş: Supabase Storage (production için)
 */
const { dbRun, dbGet } = require('../../db');

/** POST /api/v1/users/avatar */
async function uploadAvatar(req, res) {
  try {
    const { avatar } = req.body; // base64 string veya URL

    if (!avatar || typeof avatar !== 'string') {
      return res.status(400).json({ success: false, error: 'Avatar gerekli (base64 veya URL).' });
    }

    // Boyut kontrolü (max 500KB base64)
    if (avatar.length > 700000) {
      return res.status(400).json({ success: false, error: 'Dosya çok büyük (max 500KB).' });
    }

    dbRun('UPDATE users SET avatar = ? WHERE id = ?', avatar, req.user.id);

    return res.json({ 
      success: true, 
      message: 'Profil fotoğrafı güncellendi.',
      avatar 
    });
  } catch (err) {
    console.error('[upload-avatar]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

module.exports = { uploadAvatar };
