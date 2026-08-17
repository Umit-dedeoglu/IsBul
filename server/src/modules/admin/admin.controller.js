const bcrypt       = require('bcryptjs');
const { dbGet, dbAll, dbRun } = require('../../db');

/* ─────────────────────────────────────────────
   GET /api/admin/stats
   Genel istatistikler
───────────────────────────────────────────── */
function getStats(req, res) {
  try {
    const totalUsers       = dbGet('SELECT COUNT(*) AS c FROM users')?.c || 0;
    const totalExperts     = dbGet("SELECT COUNT(*) AS c FROM users WHERE role IN ('expert','admin')")?.c || 0;
    const totalCustomers   = dbGet("SELECT COUNT(*) AS c FROM users WHERE role = 'customer'")?.c || 0;
    const pendingExperts   = dbGet("SELECT COUNT(*) AS c FROM users WHERE role = 'pending_expert'")?.c || 0;
    const totalBookings    = dbGet('SELECT COUNT(*) AS c FROM bookings')?.c || 0;
    const pendingBooks     = dbGet("SELECT COUNT(*) AS c FROM bookings WHERE status = 'pending'")?.c || 0;
    const confirmedBooks   = dbGet("SELECT COUNT(*) AS c FROM bookings WHERE status = 'confirmed'")?.c || 0;
    const completedBooks   = dbGet("SELECT COUNT(*) AS c FROM bookings WHERE status = 'completed'")?.c || 0;
    const totalRevenue     = dbGet("SELECT SUM(total_price) AS s FROM bookings WHERE status = 'completed'")?.s || 0;
    const totalSlots       = dbGet('SELECT COUNT(*) AS c FROM calendar_slots')?.c || 0;
    const newUsersWeek     = dbGet("SELECT COUNT(*) AS c FROM users WHERE created_at >= datetime('now','-7 days')")?.c || 0;
    const newBooksWeek     = dbGet("SELECT COUNT(*) AS c FROM bookings WHERE created_at >= datetime('now','-7 days')")?.c || 0;

    return res.json({
      success: true,
      stats: {
        users: {
          total:          totalUsers,
          experts:        totalExperts,
          customers:      totalCustomers,
          pendingExperts: pendingExperts,
          newWeek:        newUsersWeek,
        },
        bookings: {
          total:     totalBookings,
          pending:   pendingBooks,
          confirmed: confirmedBooks,
          completed: completedBooks,
          newWeek:   newBooksWeek,
        },
        revenue: {
          total: totalRevenue,
        },
        calendar: {
          occupiedSlots: totalSlots,
        }
      }
    });
  } catch (err) {
    console.error('[admin/stats]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─────────────────────────────────────────────
   GET /api/admin/users
   Tüm kullanıcılar (sayfalama + arama)
───────────────────────────────────────────── */
function getUsers(req, res) {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql    = 'SELECT u.*, ep.price, ep.city, ep.rating, ep.review_count FROM users u LEFT JOIN expert_profiles ep ON ep.user_id = u.id WHERE 1=1';
    const params = [];

    if (role) { sql += ' AND u.role = ?'; params.push(role); }
    if (search) {
      sql += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q);
    }

    const totalRow = dbGet(`SELECT COUNT(*) AS c FROM (${sql})`, ...params);
    const total    = totalRow?.c || 0;

    sql += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const users = dbAll(sql, ...params);

    return res.json({
      success: true,
      total,
      page:    parseInt(page),
      limit:   parseInt(limit),
      pages:   Math.ceil(total / parseInt(limit)),
      users:   users.map(formatUser),
    });
  } catch (err) {
    console.error('[admin/users]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─────────────────────────────────────────────
   GET /api/admin/users/:id
───────────────────────────────────────────── */
function getUser(req, res) {
  try {
    const user = dbGet(
      'SELECT u.*, ep.price, ep.bio, ep.city, ep.tags, ep.hours, ep.rating, ep.review_count FROM users u LEFT JOIN expert_profiles ep ON ep.user_id = u.id WHERE u.id = ?',
      req.params.id
    );
    if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });

    const bookings = dbAll('SELECT * FROM bookings WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10', user.id);

    return res.json({ success: true, user: formatUser(user), bookings });
  } catch (err) {
    console.error('[admin/getUser]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─────────────────────────────────────────────
   PATCH /api/admin/users/:id/role
   Rol değiştir: customer ↔ expert ↔ admin
───────────────────────────────────────────── */
function setUserRole(req, res) {
  try {
    const { role } = req.body;
    const validRoles = ['customer', 'expert', 'admin'];
    if (!validRoles.includes(role))
      return res.status(400).json({ success: false, error: 'Geçersiz rol.' });

    // Kendi rolünü değiştiremesin
    if (req.params.id === req.user.id)
      return res.status(400).json({ success: false, error: 'Kendi rolünüzü değiştiremezsiniz.' });

    const user = dbGet('SELECT * FROM users WHERE id = ?', req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });

    dbRun('UPDATE users SET role = ?, updated_at = datetime("now") WHERE id = ?', role, req.params.id);

    // Expert yapılıyorsa profil oluştur
    if (role === 'expert' || role === 'admin') {
      const existing = dbGet('SELECT user_id FROM expert_profiles WHERE user_id = ?', req.params.id);
      if (!existing) {
        dbRun('INSERT INTO expert_profiles (user_id) VALUES (?)', req.params.id);
      }
    }

    const updated = dbGet('SELECT * FROM users WHERE id = ?', req.params.id);
    return res.json({ success: true, user: formatUser(updated), message: `Rol "${role}" olarak güncellendi.` });
  } catch (err) {
    console.error('[admin/setRole]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─────────────────────────────────────────────
   PATCH /api/admin/users/:id/toggle-active
   Hesabı aktif/pasif yap
───────────────────────────────────────────── */
function toggleUserActive(req, res) {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ success: false, error: 'Kendi hesabınızı devre dışı bırakamazsınız.' });

    const user = dbGet('SELECT * FROM users WHERE id = ?', req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });

    const newStatus = user.is_active ? 0 : 1;
    dbRun('UPDATE users SET is_active = ?, updated_at = datetime("now") WHERE id = ?', newStatus, req.params.id);

    return res.json({
      success: true,
      message: newStatus ? 'Hesap aktif edildi.' : 'Hesap devre dışı bırakıldı.',
      isActive: !!newStatus,
    });
  } catch (err) {
    console.error('[admin/toggleActive]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─────────────────────────────────────────────
   DELETE /api/admin/users/:id
───────────────────────────────────────────── */
function deleteUser(req, res) {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ success: false, error: 'Kendi hesabınızı silemezsiniz.' });

    const user = dbGet('SELECT id FROM users WHERE id = ?', req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });

    dbRun('DELETE FROM users WHERE id = ?', req.params.id);
    return res.json({ success: true, message: 'Kullanıcı silindi.' });
  } catch (err) {
    console.error('[admin/deleteUser]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─────────────────────────────────────────────
   GET /api/admin/bookings
   Tüm rezervasyonlar
───────────────────────────────────────────── */
function getBookings(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql    = `SELECT b.*, u.first_name, u.last_name, u.email FROM bookings b JOIN users u ON u.id = b.customer_id WHERE 1=1`;
    const params = [];

    if (status) { sql += ' AND b.status = ?'; params.push(status); }

    const total = dbGet(`SELECT COUNT(*) AS c FROM (${sql})`, ...params)?.c || 0;
    sql += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const bookings = dbAll(sql, ...params);

    return res.json({
      success: true,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      bookings: bookings.map(b => ({
        id:           b.id,
        customerId:   b.customer_id,
        customerName: `${b.first_name} ${b.last_name}`,
        customerEmail:b.email,
        expertId:     b.expert_id,
        service:      b.service,
        date:         b.date,
        endDate:      b.end_date,
        time:         b.time,
        endTime:      b.end_time,
        durationLabel:b.duration_label,
        totalPrice:   b.total_price,
        city:         b.city,
        status:       b.status,
        createdAt:    b.created_at,
      }))
    });
  } catch (err) {
    console.error('[admin/bookings]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─────────────────────────────────────────────
   POST /api/admin/create-admin
   İlk admin hesabını oluştur (sadece DB'de hiç admin yoksa)
───────────────────────────────────────────── */
async function createAdmin(req, res) {
  try {
    const existingAdmin = dbGet("SELECT id FROM users WHERE role = 'admin'");
    if (existingAdmin)
      return res.status(409).json({ success: false, error: 'Zaten bir admin hesabı mevcut.' });

    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ success: false, error: 'Tüm alanlar zorunludur.' });
    if (password.length < 8)
      return res.status(400).json({ success: false, error: 'Şifre en az 8 karakter olmalıdır.' });

    const existing = dbGet('SELECT id FROM users WHERE email = ?', email.toLowerCase());
    if (existing) {
      // Mevcut kullanıcıyı admin yap
      dbRun("UPDATE users SET role = 'admin', updated_at = datetime('now') WHERE email = ?", email.toLowerCase());
      const ep = dbGet('SELECT user_id FROM expert_profiles WHERE user_id = ?', existing.id);
      if (!ep) dbRun('INSERT INTO expert_profiles (user_id) VALUES (?)', existing.id);
      return res.json({ success: true, message: 'Mevcut kullanıcı admin yapıldı.', userId: existing.id });
    }

    const hash   = await bcrypt.hash(password, 12);
    const id     = `u_admin_${Date.now()}`;
    const avatar = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase();

    dbRun(
      `INSERT INTO users (id, first_name, last_name, email, password_hash, avatar, color, role)
       VALUES (?, ?, ?, ?, ?, ?, '#6C63FF', 'admin')`,
      id, firstName, lastName, email.toLowerCase(), hash, avatar
    );
    dbRun('INSERT INTO expert_profiles (user_id) VALUES (?)', id);

    return res.status(201).json({ success: true, message: 'Admin hesabı oluşturuldu.', userId: id });
  } catch (err) {
    console.error('[admin/createAdmin]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/* ─── Yardımcı ─── */
function formatUser(u) {
  return {
    id:          u.id,
    firstName:   u.first_name,
    lastName:    u.last_name,
    email:       u.email,
    avatar:      u.avatar,
    color:       u.color,
    role:        u.role,
    isActive:    !!u.is_active,
    googleId:    u.google_id || null,
    createdAt:   u.created_at,
    // Expert alanları (JOIN'dan)
    expertPrice: u.price  || null,
    expertCity:  u.city   || null,
    expertRating:u.rating || null,
    expertReviews:u.review_count || null,
  };
}

/* ─────────────────────────────────────────────
   Uzman başvuruları
   "pending_expert" rolündeki kullanıcılar = onay bekleyen başvurular
   uzman-ol.html formundan kayıt olan kullanıcılar bu role atanır
───────────────────────────────────────────── */

/**
 * GET /api/admin/applications
 * Onay bekleyen uzman başvurularını listele
 */
function getApplications(req, res) {
  try {
    // pending_expert rolündekiler + expert rolüne yeni geçenler (son 7 günde)
    const pending = dbAll(
      "SELECT u.*, ep.price, ep.bio, ep.city, ep.tags, ep.experience FROM users u LEFT JOIN expert_profiles ep ON ep.user_id = u.id WHERE u.role = 'pending_expert' ORDER BY u.created_at DESC"
    );

    // Son 7 günde onaylanmış uzmanlar (yakın geçmiş)
    const recent = dbAll(
      "SELECT u.*, ep.price, ep.bio, ep.city, ep.tags, ep.experience FROM users u LEFT JOIN expert_profiles ep ON ep.user_id = u.id WHERE u.role = 'expert' AND u.updated_at >= datetime('now','-7 days') ORDER BY u.updated_at DESC LIMIT 20"
    );

    return res.json({
      success: true,
      pending: pending.map(formatApplication),
      recentApproved: recent.map(formatApplication),
      pendingCount: pending.length,
    });
  } catch (err) {
    console.error('[admin/applications]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/**
 * PATCH /api/admin/applications/:id/approve
 * Uzman başvurusunu onayla — rolü expert yap
 */
function approveApplication(req, res) {
  try {
    const user = dbGet('SELECT * FROM users WHERE id = ?', req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });

    dbRun(
      "UPDATE users SET role = 'expert', updated_at = datetime('now') WHERE id = ?",
      req.params.id
    );

    // Expert profil yoksa oluştur
    const ep = dbGet('SELECT user_id FROM expert_profiles WHERE user_id = ?', req.params.id);
    if (!ep) dbRun('INSERT INTO expert_profiles (user_id) VALUES (?)', req.params.id);

    return res.json({
      success: true,
      message: `${user.first_name} ${user.last_name} uzman olarak onaylandı.`,
    });
  } catch (err) {
    console.error('[admin/approveApplication]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/**
 * PATCH /api/admin/applications/:id/reject
 * Başvuruyu reddet — rolü customer'a geri al
 */
function rejectApplication(req, res) {
  try {
    const { reason } = req.body;
    const user = dbGet('SELECT * FROM users WHERE id = ?', req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });

    dbRun(
      "UPDATE users SET role = 'customer', updated_at = datetime('now') WHERE id = ?",
      req.params.id
    );

    return res.json({
      success: true,
      message: `${user.first_name} ${user.last_name} başvurusu reddedildi.`,
    });
  } catch (err) {
    console.error('[admin/rejectApplication]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

function formatApplication(u) {
  return {
    id:         u.id,
    firstName:  u.first_name,
    lastName:   u.last_name,
    email:      u.email,
    avatar:     u.avatar,
    color:      u.color,
    role:       u.role,
    isActive:   !!u.is_active,
    createdAt:  u.created_at,
    updatedAt:  u.updated_at,
    expertPrice: u.price  || null,
    expertBio:   u.bio    || null,
    expertCity:  u.city   || null,
    expertTags:  u.tags ? JSON.parse(u.tags) : [],
    experience:  u.experience || null,
  };
}

module.exports = {
  getStats, getUsers, getUser,
  setUserRole, toggleUserActive, deleteUser,
  getBookings, createAdmin,
  getApplications, approveApplication, rejectApplication,
};
