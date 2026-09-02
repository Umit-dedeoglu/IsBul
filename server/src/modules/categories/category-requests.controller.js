/**
 * Category Requests Controller
 * Kategori ekleme başvuruları yönetimi
 */

const { dbGet, dbAll, dbRun } = require('../../db');

/**
 * Yeni kategori başvurusu oluştur
 */
async function createCategoryRequest(req, res) {
  const { category_name, icon, description, sample_services } = req.body;
  const userId = req.user.id;

  // Validasyon
  if (!category_name || !icon) {
    return res.status(400).json({ error: 'Kategori adı ve icon zorunludur' });
  }

  if (sample_services && (!Array.isArray(sample_services) || sample_services.length < 3)) {
    return res.status(400).json({ error: 'En az 3 örnek hizmet belirtmelisiniz' });
  }

  try {
    // Slug oluştur (Türkçe karakter desteği)
    const slug = category_name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Aynı slug var mı kontrol et
    const existing = dbGet(
      'SELECT id FROM category_requests WHERE category_slug = ? AND status = ?',
      slug, 'pending'
    );

    if (existing) {
      return res.status(400).json({ error: 'Bu kategori için zaten bekleyen bir başvuru var' });
    }

    // data.js'de var mı kontrol et (frontend'de de kontrol edilmeli ama backend'de de olsun)
    // Bu kontrol opsiyonel - admin onay aşamasında da yapılabilir

    dbRun(
      `INSERT INTO category_requests 
       (user_id, category_name, category_slug, icon, description, sample_services, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      userId,
      category_name,
      slug,
      icon,
      description || null,
      JSON.stringify(sample_services || []),
      'pending'
    );

    // Son eklenen id'yi al (sqlite)
    const lastId = dbGet('SELECT last_insert_rowid() as id');

    res.json({
      message: 'Kategori başvurunuz alındı ve inceleniyor',
      request_id: lastId.id,
      status: 'pending'
    });
  } catch (err) {
    console.error('Category request creation error:', err);
    res.status(500).json({ error: 'Başvuru oluşturulurken hata oluştu' });
  }
}

/**
 * Kullanıcının kendi başvurularını listele
 */
async function getMyRequests(req, res) {
  const userId = req.user.id;

  try {
    const requests = dbAll(
      `SELECT 
        id, category_name, category_slug, icon, description, 
        sample_services, status, admin_note, 
        created_at, reviewed_at
       FROM category_requests 
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      userId
    );

    // Parse JSON fields
    const formatted = requests.map(r => ({
      ...r,
      sample_services: JSON.parse(r.sample_services || '[]')
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Get my requests error:', err);
    res.status(500).json({ error: 'Başvurular alınırken hata oluştu' });
  }
}

/**
 * Tüm başvuruları listele (admin only)
 */
async function getAllRequests(req, res) {
  const { status } = req.query; // pending, approved, rejected veya hepsi

  try {
    let query = `
      SELECT 
        cr.id, cr.category_name, cr.category_slug, cr.icon, 
        cr.description, cr.sample_services, cr.status, cr.admin_note,
        cr.created_at, cr.reviewed_at, cr.reviewed_by,
        u.id as user_id, u.first_name || ' ' || u.last_name as user_name, u.email as user_email
      FROM category_requests cr
      LEFT JOIN users u ON cr.user_id = u.id
    `;

    const params = [];
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query += ' WHERE cr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY cr.created_at DESC';

    const requests = dbAll(query, ...params);

    // Parse JSON fields
    const formatted = requests.map(r => ({
      ...r,
      sample_services: JSON.parse(r.sample_services || '[]')
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Get all requests error:', err);
    res.status(500).json({ error: 'Başvurular alınırken hata oluştu' });
  }
}

/**
 * Başvuruyu onayla/reddet (admin only)
 */
async function reviewRequest(req, res) {
  const { id } = req.params;
  const { status, admin_note } = req.body; // status: 'approved' veya 'rejected'
  const adminId = req.user.id;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Geçersiz durum. approved veya rejected olmalı' });
  }

  try {
    // Başvuru var mı kontrol et
    const request = dbGet(
      'SELECT * FROM category_requests WHERE id = ?',
      id
    );

    if (!request) {
      return res.status(404).json({ error: 'Başvuru bulunamadı' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Bu başvuru zaten incelenmiş' });
    }

    // Güncelle
    dbRun(
      `UPDATE category_requests 
       SET status = ?, admin_note = ?, reviewed_at = datetime('now'), reviewed_by = ?
       WHERE id = ?`,
      status, admin_note || null, adminId, id
    );

    // Onaylandıysa data.js'e ekleme işlemi için bilgi döndür
    // (Gerçek uygulamada bu otomatik yapılabilir ama güvenlik için manuel kontrol daha iyi)
    if (status === 'approved') {
      const categoryData = {
        slug: request.category_slug,
        name: request.category_name,
        icon: request.icon,
        description: request.description,
        sample_services: JSON.parse(request.sample_services || '[]')
      };

      return res.json({
        message: 'Kategori başvurusu onaylandı',
        status: 'approved',
        category_data: categoryData,
        note: 'data.js dosyasına manuel olarak eklenmelidir'
      });
    }

    res.json({
      message: 'Başvuru reddedildi',
      status: 'rejected'
    });
  } catch (err) {
    console.error('Review request error:', err);
    res.status(500).json({ error: 'Başvuru güncellenirken hata oluştu' });
  }
}

/**
 * Başvuruyu sil (admin only)
 */
async function deleteRequest(req, res) {
  const { id } = req.params;

  try {
    dbRun('DELETE FROM category_requests WHERE id = ?', id);

    // Silinen satır sayısını kontrol edemiyoruz (sql.js limitasyonu)
    // Basit kontrol için tekrar sorgulayabiliriz ama performans için skip
    res.json({ message: 'Başvuru silindi' });
  } catch (err) {
    console.error('Delete request error:', err);
    res.status(500).json({ error: 'Başvuru silinirken hata oluştu' });
  }
}

/**
 * İstatistikler (admin dashboard için)
 */
async function getStats(req, res) {
  try {
    const stats = dbGet(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM category_requests
    `);

    res.json(stats);
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'İstatistikler alınırken hata oluştu' });
  }
}

module.exports = {
  createCategoryRequest,
  getMyRequests,
  getAllRequests,
  reviewRequest,
  deleteRequest,
  getStats
};
