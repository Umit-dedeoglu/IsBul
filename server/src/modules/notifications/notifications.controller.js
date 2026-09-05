const { dbGet, dbAll } = require('../../db');

/** GET /api/v1/notifications */
async function getNotifications(req, res) {
  try {
    const userId = req.user.id;

    const [bookings, expertBookings] = await Promise.all([
      dbAll(`SELECT b.*, u.first_name, u.last_name
             FROM bookings b LEFT JOIN users u ON u.id = b.expert_id
             WHERE b.customer_id = ? ORDER BY b.updated_at DESC LIMIT 20`, userId),
      dbAll(`SELECT b.*, u.first_name, u.last_name
             FROM bookings b LEFT JOIN users u ON u.id = b.customer_id
             WHERE b.expert_id = ? ORDER BY b.updated_at DESC LIMIT 20`, userId),
    ]);

    const notifications = [];

    (Array.isArray(bookings) ? bookings : []).forEach(b => {
      if (b.status === 'confirmed') notifications.push({
        id: `notif_${b.id}_confirmed`, type: 'booking_confirmed',
        title: '✅ Rezervasyonunuz Onaylandı',
        message: `${b.first_name} ${b.last_name} rezervasyonunuzu onayladı. Tarih: ${b.date} ${b.time}`,
        bookingId: b.id, read: false, createdAt: b.updated_at || b.created_at,
      });
      if (b.status === 'rejected') notifications.push({
        id: `notif_${b.id}_rejected`, type: 'booking_rejected',
        title: '❌ Rezervasyonunuz Reddedildi',
        message: `${b.date} ${b.time} tarihli rezervasyonunuz reddedildi.`,
        bookingId: b.id, read: false, createdAt: b.updated_at || b.created_at,
      });
    });

    (Array.isArray(expertBookings) ? expertBookings : []).forEach(b => {
      if (b.status === 'pending') notifications.push({
        id: `notif_${b.id}_new`, type: 'new_booking',
        title: '📅 Yeni Rezervasyon İsteği',
        message: `${b.first_name} ${b.last_name} — ${b.date} ${b.time}`,
        bookingId: b.id, read: false, createdAt: b.created_at,
      });
      if (b.status === 'cancelled') notifications.push({
        id: `notif_${b.id}_cancelled`, type: 'booking_cancelled',
        title: '🚫 Rezervasyon İptal Edildi',
        message: `${b.first_name} ${b.last_name} — ${b.date} ${b.time}`,
        bookingId: b.id, read: false, createdAt: b.updated_at || b.created_at,
      });
    });

    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      data: {
        notifications: notifications.slice(0, 20),
        unreadCount: notifications.filter(n => !n.read).length,
      },
    });
  } catch (err) {
    console.error('[notifications/get]', err);
    return res.status(500).json({ success: false, error: 'Bildirimler yüklenirken hata oluştu.' });
  }
}

/** GET /api/v1/notifications/stats */
async function getUserStats(req, res) {
  try {
    const userId = req.user.id;

    // Tek sorguda tüm müşteri istatistikleri — N+1 yerine 1 sorgu
    const [customerStats, expertProfile] = await Promise.all([
      dbGet(`SELECT
               COUNT(*)                                          AS total_bookings,
               SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed_bookings,
               SUM(CASE WHEN status IN ('pending','confirmed') THEN 1 ELSE 0 END) AS pending_bookings,
               SUM(CASE WHEN status='completed' THEN total_price ELSE 0 END) AS total_spent,
               (SELECT COUNT(*) FROM reviews WHERE customer_id = ?) AS reviews_given
             FROM bookings WHERE customer_id = ?`, userId, userId),
      dbGet('SELECT user_id FROM expert_profiles WHERE user_id = ?', userId),
    ]);

    let expertStats = null;
    if (expertProfile) {
      // Tek sorguda tüm uzman istatistikleri
      const [expStats, expReviews] = await Promise.all([
        dbGet(`SELECT
                 SUM(CASE WHEN status='completed' THEN total_price ELSE 0 END) AS earned_total,
                 SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END)           AS jobs_completed,
                 SUM(CASE WHEN status IN ('pending','confirmed') THEN 1 ELSE 0 END) AS jobs_pending
               FROM bookings WHERE expert_id = ?`, userId),
        dbGet(`SELECT AVG(rating) AS avg_rating, COUNT(*) AS reviews_received
               FROM reviews WHERE expert_id = ?`, userId),
      ]);

      expertStats = {
        earnedTotal:      expStats?.earned_total   || 0,
        jobsCompleted:    expStats?.jobs_completed  || 0,
        jobsPending:      expStats?.jobs_pending    || 0,
        avgRating:        Math.round((parseFloat(expReviews?.avg_rating) || 5) * 10) / 10,
        reviewsReceived:  expReviews?.reviews_received || 0,
      };
    }

    return res.json({
      success: true,
      data: {
        customer: {
          totalBookings:     parseInt(customerStats?.total_bookings)     || 0,
          completedBookings: parseInt(customerStats?.completed_bookings) || 0,
          pendingBookings:   parseInt(customerStats?.pending_bookings)   || 0,
          totalSpent:        parseInt(customerStats?.total_spent)        || 0,
          reviewsGiven:      parseInt(customerStats?.reviews_given)      || 0,
        },
        expert: expertStats,
      },
    });
  } catch (err) {
    console.error('[notifications/stats]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

module.exports = { getNotifications, getUserStats };
