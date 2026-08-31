const { dbGet, dbAll, dbRun } = require('../../db');
const cache = require('../../config/cache');
const { sanitizeText } = require('../../utils/sanitize');

/** GET /api/experts */
async function listExperts(req, res) {
  try {
    const { city, category, search, sort = 'rating' } = req.query;

    // Cache key — arama sorgularını cache'leme, sadece genel listeler
    const cacheKey = `experts:${city||'all'}:${category||'all'}:${sort}`;
    if (!search) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json({ success: true, count: cached.length, experts: cached });
      }
    }

    const sortMap = {
      rating:      'ep.rating DESC',
      'price-asc': 'ep.price ASC',
      'price-desc':'ep.price DESC',
      reviews:     'ep.review_count DESC',
    };

    let sql = `
      SELECT u.id, u.first_name, u.last_name, u.avatar, u.color,
             ep.price, ep.bio, ep.city, ep.tags, ep.hours,
             ep.rating, ep.review_count, ep.experience
      FROM users u
      JOIN expert_profiles ep ON ep.user_id = u.id
      WHERE u.role IN ('expert','admin') AND u.is_active = true
    `;
    const params = [];

    if (city) { sql += ' AND ep.city = ?'; params.push(city); }
    sql += ` ORDER BY ${sortMap[sort] || 'ep.rating DESC'}`;

    let experts = await dbAll(sql, ...params);
    experts = Array.isArray(experts) ? experts : [];
    experts = _filterExperts(experts, search, category);
    const formatted = experts.map(formatExpert);

    // Cache'e kaydet (search yoksa, 60 saniye)
    if (!search) {
      await cache.set(cacheKey, formatted, 60);
    }

    return res.json({ success: true, count: formatted.length, experts: formatted });
  } catch (err) {
    console.error('[experts/list]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

function _filterExperts(experts, search, category) {
  if (search) {
    const q = search.toLowerCase();
    experts = experts.filter(e => {
      const tags = JSON.parse(e.tags || '[]');
      return `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
             (e.bio||'').toLowerCase().includes(q) ||
             tags.some(t => t.toLowerCase().includes(q));
    });
  }
  if (category) {
    const q = category.toLowerCase();
    experts = experts.filter(e => {
      const tags = JSON.parse(e.tags || '[]');
      return tags.some(t => t.toLowerCase().replace(/\s/g,'') === q || t.toLowerCase().includes(q));
    });
  }
  return experts;
}

/** GET /api/experts/:id */
async function getExpert(req, res) {
  try {
    // Uzman detayını cache'den dene
    const cacheKey = `expert:${req.params.id}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, expert: cached });
    }

    const row = await dbGet(`
      SELECT u.id, u.first_name, u.last_name, u.avatar, u.color,
             ep.price, ep.bio, ep.city, ep.tags, ep.hours,
             ep.rating, ep.review_count, ep.experience
      FROM users u
      JOIN expert_profiles ep ON ep.user_id = u.id
      WHERE u.id = ?
    `, req.params.id);

    if (!row) return res.status(404).json({ success: false, error: 'Uzman bulunamadı.' });

    let reviews = await dbAll(`
      SELECT r.*, u.first_name, u.last_name, u.avatar, u.color
      FROM reviews r JOIN users u ON u.id = r.customer_id
      WHERE r.expert_id = ? ORDER BY r.created_at DESC LIMIT 20
    `, req.params.id);
    reviews = Array.isArray(reviews) ? reviews : [];

    const expert = { ...formatExpert(row), reviewList: reviews };

    // 5 dakika cache'le
    await cache.set(cacheKey, expert, 300);

    return res.json({ success: true, expert });
  } catch (err) {
    console.error('[experts/get]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** PATCH /api/experts/profile */
async function updateExpertProfile(req, res) {
  try {
    const { price, bio, city, tags, hours, experience } = req.body;

    // Sanitize — XSS koruması
    const safeBio  = bio  !== undefined ? sanitizeText(bio)  : undefined;
    const safeCity = city !== undefined ? sanitizeText(city) : undefined;

    const existing = await dbGet('SELECT user_id FROM expert_profiles WHERE user_id = ?', req.user.id);

    if (!existing) {
      await dbRun(
        'INSERT INTO expert_profiles (user_id, price, bio, city, tags, hours, experience) VALUES (?,?,?,?,?,?,?)',
        req.user.id, price||300, safeBio||'', safeCity||'İstanbul',
        JSON.stringify(tags||[]), hours||'', experience||'1 yıl'
      );
    } else {
      const updates = [];
      if (price      !== undefined) updates.push(dbRun('UPDATE expert_profiles SET price=? WHERE user_id=?', price, req.user.id));
      if (safeBio    !== undefined) updates.push(dbRun('UPDATE expert_profiles SET bio=? WHERE user_id=?', safeBio, req.user.id));
      if (safeCity   !== undefined) updates.push(dbRun('UPDATE expert_profiles SET city=? WHERE user_id=?', safeCity, req.user.id));
      if (tags       !== undefined) updates.push(dbRun('UPDATE expert_profiles SET tags=? WHERE user_id=?', JSON.stringify(tags), req.user.id));
      if (hours      !== undefined) updates.push(dbRun('UPDATE expert_profiles SET hours=? WHERE user_id=?', hours, req.user.id));
      if (experience !== undefined) updates.push(dbRun('UPDATE expert_profiles SET experience=? WHERE user_id=?', experience, req.user.id));
      await Promise.all(updates);
    }

    // Profil güncellenince cache'i temizle
    await cache.del(`expert:${req.user.id}`);
    await cache.delPattern('experts:*');

    const row = await dbGet(`
      SELECT u.id, u.first_name, u.last_name, u.avatar, u.color,
             ep.price, ep.bio, ep.city, ep.tags, ep.hours,
             ep.rating, ep.review_count, ep.experience
      FROM users u JOIN expert_profiles ep ON ep.user_id = u.id WHERE u.id = ?
    `, req.user.id);

    return res.json({ success: true, expert: formatExpert(row) });
  } catch (err) {
    console.error('[experts/update]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

function formatExpert(row) {
  const tags = JSON.parse(row.tags || '[]');
  return {
    id:         row.id,
    name:       `${row.first_name} ${row.last_name}`,
    firstName:  row.first_name,
    lastName:   row.last_name,
    avatar:     row.avatar,
    color:      row.color,
    price:      row.price,
    bio:        row.bio,
    city:       row.city,
    tags,
    hours:      row.hours,
    rating:     row.rating,
    reviews:    row.review_count,
    experience: row.experience,
    elite:      false,
    isRealUser: true,
    title:      tags[0] ? `${tags[0]} Uzmanı` : 'Uzman',
    categories: tags.map(t => t.toLowerCase().replace(/\s/g,'')),
  };
}

module.exports = { listExperts, getExpert, updateExpertProfile };
