const bcrypt = require('bcryptjs');
const { dbGet, dbRun } = require('../../db');

/** GET /api/users/profile */
function getProfile(req, res) {
  try {
    const user = dbGet('SELECT * FROM users WHERE id = ?', req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });
    const expert = dbGet('SELECT * FROM expert_profiles WHERE user_id = ?', user.id);
    return res.json({ success: true, user: formatUser(user, expert) });
  } catch (err) {
    console.error('[users/getProfile]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** PATCH /api/users/profile */
function updateProfile(req, res) {
  try {
    const { firstName, lastName } = req.body;
    if (firstName) dbRun('UPDATE users SET first_name=?, updated_at=datetime("now") WHERE id=?', firstName, req.user.id);
    if (lastName)  dbRun('UPDATE users SET last_name=?, updated_at=datetime("now") WHERE id=?', lastName,  req.user.id);
    const user   = dbGet('SELECT * FROM users WHERE id = ?', req.user.id);
    const expert = dbGet('SELECT * FROM expert_profiles WHERE user_id = ?', user.id);
    return res.json({ success: true, user: formatUser(user, expert) });
  } catch (err) {
    console.error('[users/updateProfile]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** POST /api/users/change-password */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, error: 'Mevcut ve yeni şifre gereklidir.' });
    if (newPassword.length < 8)
      return res.status(400).json({ success: false, error: 'Yeni şifre en az 8 karakter olmalıdır.' });

    const user = dbGet('SELECT * FROM users WHERE id = ?', req.user.id);
    if (!user.password_hash)
      return res.status(400).json({ success: false, error: 'OAuth hesapları için şifre değiştirilemez.' });

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, error: 'Mevcut şifre hatalı.' });

    const hash = await bcrypt.hash(newPassword, 12);
    dbRun('UPDATE users SET password_hash=?, updated_at=datetime("now") WHERE id=?', hash, req.user.id);
    return res.json({ success: true, message: 'Şifreniz güncellendi.' });
  } catch (err) {
    console.error('[users/changePassword]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** DELETE /api/users/account */
async function deleteAccount(req, res) {
  try {
    const { password } = req.body;
    const user = dbGet('SELECT * FROM users WHERE id = ?', req.user.id);
    if (user.password_hash) {
      if (!password) return res.status(400).json({ success: false, error: 'Şifre gereklidir.' });
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ success: false, error: 'Şifre hatalı.' });
    }
    dbRun('DELETE FROM users WHERE id = ?', req.user.id);
    return res.json({ success: true, message: 'Hesabınız silindi.' });
  } catch (err) {
    console.error('[users/deleteAccount]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

function formatUser(user, expert) {
  return {
    id:        user.id,
    firstName: user.first_name,
    lastName:  user.last_name,
    email:     user.email,
    avatar:    user.avatar,
    color:     user.color,
    role:      user.role,
    isExpert:  user.role === 'expert' || user.role === 'admin',
    expertData: expert ? {
      price:   expert.price,
      bio:     expert.bio,
      city:    expert.city,
      tags:    JSON.parse(expert.tags || '[]'),
      hours:   expert.hours,
      rating:  expert.rating,
      reviews: expert.review_count,
    } : null
  };
}

module.exports = { getProfile, updateProfile, changePassword, deleteAccount };
