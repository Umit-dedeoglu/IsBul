const bcrypt = require('bcryptjs');
const { dbGet, dbAll, dbRun } = require('../../db');

/* ─── GET /api/admin/stats ─── */
async function getStats(req, res) {
  try {
    const totalUsers      = (await dbGet('SELECT COUNT(*) AS c FROM users'))?.c || 0;
    const totalExperts    = (await dbGet("SELECT COUNT(*) AS c FROM users WHERE role IN ('expert','admin')"))?.c || 0;
    const totalCustomers  = (await dbGet("SELECT COUNT(*) AS c FROM users WHERE role = 'customer'"))?.c || 0;
    const pendingExperts  = (await dbGet("SELECT COUNT(*) AS c FROM users WHERE role = 'pending_expert'"))?.c || 0;
    const totalBookings   = (await dbGet('SELECT COUNT(*) AS c FROM bookings'))?.c || 0;
    const pendingBooks    = (await dbGet("SELECT COUNT(*) AS c FROM bookings WHERE status = 'pending'"))?.c || 0;
    const confirmedBooks  = (await dbGet("SELECT COUNT(*) AS c FROM bookings WHERE status = 'confirmed'"))?.c || 0;
    const completedBooks  = (await dbGet("SELECT COUNT(*) AS c FROM bookings WHERE status = 'completed'"))?.c || 0;
    const totalRevenue    = (await dbGet("SELECT SUM(total_price) AS s FROM bookings WHERE status = 'completed'"))?.s || 0;

    return res.json({
      success: true,
      stats: {
        users: { total: totalUsers, experts: totalExperts, customers: totalCustomers, pendingExperts },
        bookings: { total: totalBookings, pending: pendingBooks, confirmed: confirmedBooks, completed: completedBooks },
        revenue: { total: totalRevenue },
      }
    });
  } catch (err) {
    console.error('[admin/stats]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─── GET /api/admin/users ─── */
async function getUsers(req, res) {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = 'SELECT u.*, ep.price, ep.city, ep.rating, ep.review_count FROM users u LEFT JOIN expert_profiles ep ON ep.user_id = u.id WHERE 1=1';
    const params = [];

    if (role)   { sql += ' AND u.role = ?';  params.push(role); }
    if (search) {
      // PostgreSQL ILIKE, SQLite LIKE (case-insensitive zaten)
      const likeOp = process.env.DATABASE_URL ? 'ILIKE' : 'LIKE';
      sql += ` AND (u.first_name ${likeOp} ? OR u.last_name ${likeOp} ? OR u.email ${likeOp} ?)`;
      const q = `%${search}%`;
      params.push(q, q, q);
    }

    const totalRow = await dbGet(`SELECT COUNT(*) AS c FROM (${sql}) AS sub`, ...params);
    const total = parseInt(totalRow?.c || 0);

    sql += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const users = await dbAll(sql, ...params);

    return res.json({
      success: true, total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
      users: (Array.isArray(users) ? users : []).map(formatUser),
    });
  } catch (err) {
    console.error('[admin/users]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─── GET /api/admin/users/:id ─── */
async function getUser(req, res) {
  try {
    const user = await dbGet(
      'SELECT u.*, ep.price, ep.bio, ep.city, ep.tags, ep.hours, ep.rating, ep.review_count FROM users u LEFT JOIN expert_profiles ep ON ep.user_id = u.id WHERE u.id = ?',
      req.params.id
    );
    if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });

    const bookings = await dbAll('SELECT * FROM bookings WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10', user.id);
    return res.json({ success: true, user: formatUser(user), bookings: Array.isArray(bookings) ? bookings : [] });
  } catch (err) {
    console.error('[admin/getUser]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─── PATCH /api/admin/users/:id/role ─── */
async function setUserRole(req, res) {
  try {
    const { role } = req.body;
    if (!['customer', 'expert', 'admin', 'pending_expert'].includes(role))
      return res.status(400).json({ success: false, error: 'Geçersiz rol.' });
    if (req.params.id === req.user.id)
      return res.status(400).json({ success: false, error: 'Kendi rolünüzü değiştiremezsiniz.' });

    const user = await dbGet('SELECT * FROM users WHERE id = ?', req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });

    await dbRun('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', role, req.params.id);

    if (role === 'expert' || role === 'admin') {
      const ep = await dbGet('SELECT user_id FROM expert_profiles WHERE user_id = ?', req.params.id);
      if (!ep) await dbRun('INSERT INTO expert_profiles (user_id) VALUES (?)', req.params.id);
    }

    const updated = await dbGet('SELECT * FROM users WHERE id = ?', req.params.id);
    return res.json({ success: true, user: formatUser(updated), message: `Rol "${role}" olarak güncellendi.` });
  } catch (err) {
    console.error('[admin/setRole]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─── PATCH /api/admin/users/:id/toggle-active ─── */
async function toggleUserActive(req, res) {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ success: false, error: 'Kendi hesabınızı devre dışı bırakamazsınız.' });

    const user = await dbGet('SELECT * FROM users WHERE id = ?', req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });

    const newStatus = !user.is_active;
    await dbRun('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', newStatus, req.params.id);

    return res.json({ success: true, message: newStatus ? 'Hesap aktif edildi.' : 'Hesap devre dışı bırakıldı.', isActive: newStatus });
  } catch (err) {
    console.error('[admin/toggleActive]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─── DELETE /api/admin/users/:id ─── */
async function deleteUser(req, res) {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ success: false, error: 'Kendi hesabınızı silemezsiniz.' });

    const user = await dbGet('SELECT id FROM users WHERE id = ?', req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });

    await dbRun('DELETE FROM users WHERE id = ?', req.params.id);
    return res.json({ success: true, message: 'Kullanıcı silindi.' });
  } catch (err) {
    console.error('[admin/deleteUser]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─── GET /api/admin/bookings ─── */
async function getBookings(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = 'SELECT b.*, u.first_name, u.last_name, u.email FROM bookings b JOIN users u ON u.id = b.customer_id WHERE 1=1';
    const params = [];

    if (status) { sql += ' AND b.status = ?'; params.push(status); }

    const totalRow = await dbGet(`SELECT COUNT(*) AS c FROM (${sql}) AS sub`, ...params);
    const total = parseInt(totalRow?.c || 0);

    sql += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const bookings = await dbAll(sql, ...params);

    return res.json({
      success: true, total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      bookings: (Array.isArray(bookings) ? bookings : []).map(b => ({
        id: b.id, customerId: b.customer_id,
        customerName: `${b.first_name} ${b.last_name}`,
        customerEmail: b.email, expertId: b.expert_id,
        service: b.service, date: b.date, time: b.time,
        totalPrice: b.total_price, city: b.city,
        status: b.status, createdAt: b.created_at,
      }))
    });
  } catch (err) {
    console.error('[admin/bookings]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─── POST /api/admin/create-admin ─── */
async function createAdmin(req, res) {
  try {
    const existingAdmin = await dbGet("SELECT id FROM users WHERE role = 'admin'");
    if (existingAdmin)
      return res.status(409).json({ success: false, error: 'Zaten bir admin hesabı mevcut.' });

    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ success: false, error: 'Tüm alanlar zorunludur.' });
    if (password.length < 8)
      return res.status(400).json({ success: false, error: 'Şifre en az 8 karakter olmalıdır.' });

    const existing = await dbGet('SELECT id FROM users WHERE email = ?', email.toLowerCase());
    if (existing) {
      await dbRun("UPDATE users SET role = 'admin', updated_at = CURRENT_TIMESTAMP WHERE email = ?", email.toLowerCase());
      return res.json({ success: true, message: 'Mevcut kullanıcı admin yapıldı.', userId: existing.id });
    }

    const hash = await bcrypt.hash(password, 12);
    const id = `u_admin_${Date.now()}`;
    const avatar = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase();

    await dbRun(
      "INSERT INTO users (id, first_name, last_name, email, password_hash, avatar, color, role) VALUES (?, ?, ?, ?, ?, ?, '#6C63FF', 'admin')",
      id, firstName, lastName, email.toLowerCase(), hash, avatar
    );
    await dbRun('INSERT INTO expert_profiles (user_id) VALUES (?)', id);

    return res.status(201).json({ success: true, message: 'Admin hesabı oluşturuldu.', userId: id });
  } catch (err) {
    console.error('[admin/createAdmin]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─── GET /api/admin/applications ─── */
async function getApplications(req, res) {
  try {
    const pending = await dbAll(
      "SELECT u.*, ep.price, ep.bio, ep.city, ep.tags, ep.experience FROM users u LEFT JOIN expert_profiles ep ON ep.user_id = u.id WHERE u.role = 'pending_expert' ORDER BY u.created_at DESC"
    );
    // Son 7 günde onaylanmış uzmanlar — DB uyumlu sorgu
    const recentFilter = process.env.DATABASE_URL
      ? "AND u.updated_at >= NOW() - INTERVAL '7 days'"
      : "AND u.updated_at >= datetime('now','-7 days')";

    const recent = await dbAll(
      `SELECT u.*, ep.price, ep.bio, ep.city, ep.tags, ep.experience FROM users u LEFT JOIN expert_profiles ep ON ep.user_id = u.id WHERE u.role = 'expert' ${recentFilter} ORDER BY u.updated_at DESC LIMIT 20`
    );

    return res.json({
      success: true,
      pending: (Array.isArray(pending) ? pending : []).map(formatApplication),
      recentApproved: (Array.isArray(recent) ? recent : []).map(formatApplication),
      pendingCount: pending.length,
    });
  } catch (err) {
    console.error('[admin/applications]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─── PATCH /api/admin/applications/:id/approve ─── */
async function approveApplication(req, res) {
  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });

    await dbRun("UPDATE users SET role = 'expert', updated_at = CURRENT_TIMESTAMP WHERE id = ?", req.params.id);

    const ep = await dbGet('SELECT user_id FROM expert_profiles WHERE user_id = ?', req.params.id);
    if (!ep) await dbRun('INSERT INTO expert_profiles (user_id) VALUES (?)', req.params.id);

    return res.json({ success: true, message: `${user.first_name} ${user.last_name} uzman olarak onaylandı.` });
  } catch (err) {
    console.error('[admin/approve]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─── PATCH /api/admin/applications/:id/reject ─── */
async function rejectApplication(req, res) {
  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });

    await dbRun("UPDATE users SET role = 'customer', updated_at = CURRENT_TIMESTAMP WHERE id = ?", req.params.id);

    return res.json({ success: true, message: `${user.first_name} ${user.last_name} başvurusu reddedildi.` });
  } catch (err) {
    console.error('[admin/reject]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─── Yardımcılar ─── */
function formatUser(u) {
  return {
    id: u.id, firstName: u.first_name, lastName: u.last_name,
    email: u.email, avatar: u.avatar, color: u.color,
    role: u.role, isActive: !!u.is_active,
    googleId: u.google_id || null, createdAt: u.created_at,
    expertPrice: u.price || null, expertCity: u.city || null,
    expertRating: u.rating || null, expertReviews: u.review_count || null,
  };
}

function formatApplication(u) {
  return {
    id: u.id, firstName: u.first_name, lastName: u.last_name,
    email: u.email, avatar: u.avatar, color: u.color,
    role: u.role, isActive: !!u.is_active,
    createdAt: u.created_at, updatedAt: u.updated_at,
    expertPrice: u.price || null, expertBio: u.bio || null,
    expertCity: u.city || null,
    expertTags: u.tags ? JSON.parse(u.tags) : [],
    experience: u.experience || null,
  };
}

module.exports = {
  getStats, getUsers, getUser,
  setUserRole, toggleUserActive, deleteUser,
  getBookings, createAdmin,
  getApplications, approveApplication, rejectApplication,
};
