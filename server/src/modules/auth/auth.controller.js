const bcrypt   = require('bcryptjs');
const { dbGet, dbRun } = require('../../db');
const { signToken } = require('../../config/jwt');

function genId(prefix = 'u') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
function getInitials(first, last) {
  return ((first[0] || '') + (last[0] || '')).toUpperCase();
}
const COLORS = ['#6C63FF','#FF6B6B','#4ECDC4','#FFD93D','#96CEB4','#56AB2F','#f43f5e','#0891b2'];
function randomColor() { return COLORS[Math.floor(Math.random() * COLORS.length)]; }

/** POST /api/auth/register */
async function register(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ success: false, error: 'Tüm alanlar zorunludur.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success: false, error: 'Geçerli bir e-posta girin.' });
    if (password.length < 8)
      return res.status(400).json({ success: false, error: 'Şifre en az 8 karakter olmalıdır.' });

    const existing = await dbGet('SELECT id FROM users WHERE email = ?', email.toLowerCase());
    if (existing) return res.status(409).json({ success: false, error: 'Bu e-posta adresi zaten kayıtlı.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const id = genId('u');
    const avatar = getInitials(firstName, lastName);
    const color  = randomColor();
    // role parametresi ile pending_expert olarak kaydedilebilir
    const userRole = (req.body.role === 'pending_expert') ? 'pending_expert' : 'customer';

    await dbRun(
      `INSERT INTO users (id, first_name, last_name, email, password_hash, avatar, color, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      id, firstName, lastName, email.toLowerCase(), passwordHash, avatar, color, userRole
    );

    const token = signToken({ id, email: email.toLowerCase(), role: userRole });
    return res.status(201).json({
      success: true,
      message: `Hoş geldiniz, ${firstName}!`,
      token,
      user: { id, firstName, lastName, email: email.toLowerCase(), avatar, color, role: userRole, isExpert: false }
    });
  } catch (err) {
    console.error('[auth/register]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** POST /api/auth/login */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'E-posta ve şifre gereklidir.' });

    const user = await dbGet('SELECT * FROM users WHERE email = ?', email.toLowerCase());
    if (!user) return res.status(401).json({ success: false, error: 'Bu e-posta ile kayıtlı hesap bulunamadı.' });
    if (!user.password_hash) return res.status(401).json({ success: false, error: 'Bu hesap Google ile oluşturulmuştur.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, error: 'Şifre hatalı.' });
    if (!user.is_active) return res.status(403).json({ success: false, error: 'Hesabınız devre dışı.' });

    const expert = await dbGet('SELECT * FROM expert_profiles WHERE user_id = ?', user.id);
    const token  = signToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      success: true, token,
      user: formatUser(user, expert)
    });
  } catch (err) {
    console.error('[auth/login]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** GET /api/auth/me */
async function me(req, res) {
  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });
    const expert = await dbGet('SELECT * FROM expert_profiles WHERE user_id = ?', user.id);
    return res.json({ success: true, user: formatUser(user, expert) });
  } catch (err) {
    console.error('[auth/me]', err);
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

module.exports = { register, login, me };
