/**
 * Bildirimler modülü
 * Web ve mobil için push notification altyapısı
 * Şu an in-memory + DB tabanlı, ilerleyen aşamada FCM/APNs eklenecek
 */
const { dbGet, dbAll, dbRun } = require('../../db');

/**
 * Kullanıcı için bildirimler tablosunu başlat (yoksa oluştur)
 * Veritabanı şeması database.js'de oluşturuluyor
 */

/** GET /api/v1/notifications */
/** GET /api/v1/notifications — Kullanıcı bildirimleri */
function getNotifications(req, res) {
  try {
    const userId = req.user.id;

    // Rezervasyon tabanlı otomatik bildirimler üret
    const bookings = dbAll(`
      SELECT b.*, u.first_name, u.last_name
      FROM bookings b
      LEFT JOIN users u ON u.id = b.expert_id
      WHERE b.customer_id = ?
      ORDER BY b.updated_at DESC, b.created_at DESC
      LIMIT 20
    `, userId);

    const expertBookings = dbAll(`
      SELECT b.*, u.first_name, u.last_name
      FROM bookings b
      LEFT JOIN users u ON u.id = b.customer_id
      WHERE b.expert_id = ?
      ORDER BY b.updated_at DESC, b.created_at DESC
      LIMIT 20
    `, userId);

    const notifications = [];

    // Müşteri bildirimleri - Array kontrolü ekle
    if (bookings && Array.isArray(bookings)) {
      bookings.forEach(b => {
        if (b.status === 'confirmed') {
          notifications.push({
            id:        `notif_${b.id}_confirmed`,
            type:      'booking_confirmed',
            title:     '✅ Rezervasyonunuz Onaylandı',
            message:   `${b.first_name} ${b.last_name} rezervasyonunuzu onayladı. Tarih: ${b.date} ${b.time}`,
            bookingId: b.id,
            read:      false,
            createdAt: b.updated_at || b.created_at,
          });
        }
        if (b.status === 'rejected') {
          notifications.push({
            id:        `notif_${b.id}_rejected`,
            type:      'booking_rejected',
            title:     '❌ Rezervasyonunuz Reddedildi',
            message:   `${b.date} ${b.time} tarihli rezervasyonunuz maalesef reddedildi.`,
            bookingId: b.id,
            read:      false,
            createdAt: b.updated_at || b.created_at,
          });
        }
      });
    }

    // Uzman bildirimleri - Array kontrolü ekle
    if (expertBookings && Array.isArray(expertBookings)) {
      expertBookings.forEach(b => {
        if (b.status === 'pending') {
          notifications.push({
            id:        `notif_${b.id}_new`,
            type:      'new_booking',
            title:     '📅 Yeni Rezervasyon İsteği',
            message:   `${b.first_name} ${b.last_name} adlı müşteri ${b.date} ${b.time} için rezervasyon yaptı.`,
            bookingId: b.id,
            read:      false,
            createdAt: b.created_at,
          });
        }
        if (b.status === 'cancelled') {
          notifications.push({
            id:        `notif_${b.id}_cancelled`,
            type:      'booking_cancelled',
            title:     '🚫 Rezervasyon İptal Edildi',
            message:   `${b.first_name} ${b.last_name} adlı müşteri ${b.date} ${b.time} rezervasyonunu iptal etti.`,
            bookingId: b.id,
            read:      false,
            createdAt: b.updated_at || b.created_at,
          });
        }
      });
    }

    // Tarihe göre sırala
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      data: {
        notifications: notifications.slice(0, 20),
        unreadCount:   notifications.filter(n => !n.read).length,
      },
    });
  } catch (err) {
    console.error('[notifications/get]', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ 
      success: false, 
      error: 'Bildirimler yüklenirken hata oluştu.' 
    });
  }
}

/** GET /api/v1/users/stats — Kullanıcı istatistikleri */
function getUserStats(req, res) {
  try {
    const userId = req.user.id;

    const totalBookings     = dbGet("SELECT COUNT(*) AS c FROM bookings WHERE customer_id = ?", userId)?.c || 0;
    const completedBookings = dbGet("SELECT COUNT(*) AS c FROM bookings WHERE customer_id = ? AND status = 'completed'", userId)?.c || 0;
    const pendingBookings   = dbGet("SELECT COUNT(*) AS c FROM bookings WHERE customer_id = ? AND status IN ('pending','confirmed')", userId)?.c || 0;
    const totalSpent        = dbGet("SELECT SUM(total_price) AS s FROM bookings WHERE customer_id = ? AND status = 'completed'", userId)?.s || 0;
    const reviewsGiven      = dbGet("SELECT COUNT(*) AS c FROM reviews WHERE customer_id = ?", userId)?.c || 0;

    // Uzman istatistikleri
    const isExpert = dbGet("SELECT user_id FROM expert_profiles WHERE user_id = ?", userId);
    let expertStats = null;
    if (isExpert) {
      const earnedTotal   = dbGet("SELECT SUM(total_price) AS s FROM bookings WHERE expert_id = ? AND status = 'completed'", userId)?.s || 0;
      const jobsCompleted = dbGet("SELECT COUNT(*) AS c FROM bookings WHERE expert_id = ? AND status = 'completed'", userId)?.c || 0;
      const jobsPending   = dbGet("SELECT COUNT(*) AS c FROM bookings WHERE expert_id = ? AND status IN ('pending','confirmed')", userId)?.c || 0;
      const avgRating     = dbGet("SELECT AVG(rating) AS a FROM reviews WHERE expert_id = ?", userId)?.a || 5.0;
      const reviewsReceived = dbGet("SELECT COUNT(*) AS c FROM reviews WHERE expert_id = ?", userId)?.c || 0;

      expertStats = {
        earnedTotal,
        jobsCompleted,
        jobsPending,
        avgRating:       Math.round((avgRating || 5) * 10) / 10,
        reviewsReceived,
      };
    }

    return res.json({
      success: true,
      data: {
        customer: { totalBookings, completedBookings, pendingBookings, totalSpent, reviewsGiven },
        expert:   expertStats,
      },
    });
  } catch (err) {
    console.error('[notifications/stats]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

module.exports = { getNotifications, getUserStats };
