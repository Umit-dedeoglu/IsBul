const { dbGet, dbAll, dbRun } = require('../../db');

function genId() { return `rev_${Date.now()}_${Math.random().toString(36).slice(2,6)}`; }

/** GET /api/reviews/:expertId */
function getReviews(req, res) {
  try {
    const rows = dbAll(`
      SELECT r.*, u.first_name, u.last_name, u.avatar, u.color
      FROM reviews r
      JOIN users u ON u.id = r.customer_id
      WHERE r.expert_id = ?
      ORDER BY r.created_at DESC
    `, req.params.expertId);

    return res.json({
      success: true,
      count: rows.length,
      reviews: rows.map(r => ({
        id:          r.id,
        expertId:    r.expert_id,
        customerId:  r.customer_id,
        userName:    `${r.first_name} ${r.last_name}`,
        avatar:      r.avatar,
        color:       r.color,
        rating:      r.rating,
        text:        r.text,
        service:     r.service,
        date:        new Date(r.created_at).toLocaleDateString('tr-TR'),
        createdAt:   r.created_at,
      }))
    });
  } catch (err) {
    console.error('[reviews/get]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** POST /api/reviews/:expertId */
function addReview(req, res) {
  try {
    const { rating, text, service } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ success: false, error: 'Puan 1-5 arasında olmalıdır.' });
    if (!text || text.trim().length < 10)
      return res.status(400).json({ success: false, error: 'Yorum en az 10 karakter olmalıdır.' });

    // Uzman veya müşteri mi kontrol et (sadece müşteriler yorum yapabilir)
    const expertId = req.params.expertId;
    const id = genId();

    dbRun(
      'INSERT INTO reviews (id, expert_id, customer_id, rating, text, service) VALUES (?,?,?,?,?,?)',
      id, expertId, req.user.id, rating, text.trim(), service || ''
    );

    // Expert profilinin puan ortalamasını güncelle
    const stats = dbGet(
      'SELECT AVG(rating) AS avg, COUNT(*) AS cnt FROM reviews WHERE expert_id = ?',
      expertId
    );
    if (stats) {
      dbRun(
        'UPDATE expert_profiles SET rating = ?, review_count = ? WHERE user_id = ?',
        Math.round((stats.avg || 5) * 10) / 10, stats.cnt, expertId
      );
    }

    // Eklenen yorumu geri döndür
    const user = dbGet('SELECT * FROM users WHERE id = ?', req.user.id);
    return res.status(201).json({
      success: true,
      review: {
        id,
        expertId,
        customerId: req.user.id,
        userName:   `${user?.first_name} ${user?.last_name}`,
        avatar:     user?.avatar,
        color:      user?.color,
        rating,
        text:       text.trim(),
        service:    service || '',
        date:       new Date().toLocaleDateString('tr-TR'),
        createdAt:  new Date().toISOString(),
      }
    });
  } catch (err) {
    console.error('[reviews/add]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

module.exports = { getReviews, addReview };
