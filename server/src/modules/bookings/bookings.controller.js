const { dbGet, dbAll, dbRun } = require('../../db');
const { sanitizeText } = require('../../utils/sanitize');

function genId() {
  return `rez_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
}

/** POST /api/bookings */
async function createBooking(req, res) {
  try {
    const session = req.user;
    const { expertId, service, date, endDate, time, endTime,
            durationType, durationValue, durationLabel, totalPrice,
            slots, city, notes } = req.body;

    if (!expertId || !service || !date || !time)
      return res.status(400).json({ success: false, error: 'Zorunlu alanlar eksik.' });

    // ✅ Negatif fiyat koruması
    if (totalPrice !== undefined && totalPrice < 0)
      return res.status(400).json({ success: false, error: 'Geçersiz fiyat.' });

    const allSlots = Array.isArray(slots) && slots.length ? slots : [`${date}_${time}`];

    // Çakışma kontrolü
    for (const slot of allSlots) {
      const conflict = await dbGet(
        'SELECT slot FROM calendar_slots WHERE expert_id = ? AND slot = ?',
        expertId, slot
      );
      if (conflict) {
        return res.status(409).json({
          success: false,
          error: `${slot.split('_')[1]} saati dolu. Lütfen başka bir saat seçin.`
        });
      }
    }

    const id = genId();
    await dbRun(
      `INSERT INTO bookings
        (id, customer_id, expert_id, service, date, end_date, time, end_time,
         duration_type, duration_value, duration_label, total_price, slots, city, notes, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')`,
      id, session.id, expertId, service, date, endDate||date,
      time, endTime||time, durationType||'hours', durationValue||1,
      durationLabel||'', totalPrice||0,
      JSON.stringify(allSlots), city||'', sanitizeText(notes||'')
    );

    // Takvime işle — SQLite ve PostgreSQL uyumlu
    // Takvime işle — her iki DB için sadece slot kolonu kullan
    for (const slot of allSlots) {
      try {
        const isPostgres = !!process.env.DATABASE_URL;
        if (isPostgres) {
          const slotId = `cs_${Date.now()}_${Math.random().toString(36).slice(2,4)}`;
          await dbRun(
            'INSERT INTO calendar_slots (id, expert_id, slot, booking_id) VALUES (?,?,?,?)',
            slotId, expertId, slot, id
          );
        } else {
          // SQLite: id AUTOINCREMENT, slot kolonu kullan
          await dbRun(
            'INSERT OR IGNORE INTO calendar_slots (expert_id, slot, booking_id) VALUES (?,?,?)',
            expertId, slot, id
          );
        }
      } catch (e) {
        if (!e.message?.includes('UNIQUE') && !e.message?.includes('unique')) throw e;
      }
    }

    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', id);
    return res.status(201).json({ success: true, booking: formatBooking(booking) });
  } catch (err) {
    console.error('[bookings/create]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** GET /api/bookings/my */
async function getMyBookings(req, res) {
  try {
    const bookings = await dbAll(
      'SELECT * FROM bookings WHERE customer_id = ? ORDER BY created_at DESC',
      req.user.id
    );
    const list = Array.isArray(bookings) ? bookings : [];
    return res.json({ success: true, bookings: list.map(formatBooking) });
  } catch (err) {
    console.error('[bookings/my]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** GET /api/bookings/expert */
async function getExpertBookings(req, res) {
  try {
    const bookings = await dbAll(
      `SELECT b.*, u.first_name, u.last_name, u.avatar, u.color
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       WHERE b.expert_id = ?
       ORDER BY b.created_at DESC`,
      req.user.id
    );
    const list = Array.isArray(bookings) ? bookings : [];
    return res.json({
      success: true,
      bookings: list.map(b => ({
        ...formatBooking(b),
        customerName:   `${b.first_name} ${b.last_name}`,
        customerAvatar: b.avatar,
        customerColor:  b.color,
      }))
    });
  } catch (err) {
    console.error('[bookings/expert]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** GET /api/bookings/:id */
async function getBooking(req, res) {
  try {
    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Rezervasyon bulunamadı.' });

    if (booking.customer_id !== req.user.id && booking.expert_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, error: 'Yetkisiz.' });

    return res.json({ success: true, booking: formatBooking(booking) });
  } catch (err) {
    console.error('[bookings/get]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** PATCH /api/bookings/:id/status */
async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed','rejected','cancelled','completed'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, error: 'Geçersiz durum.' });

    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Rezervasyon bulunamadı.' });

    const isExpert   = booking.expert_id   === req.user.id;
    const isCustomer = booking.customer_id === req.user.id;
    if (!isExpert && !isCustomer && req.user.role !== 'admin')
      return res.status(403).json({ success: false, error: 'Yetkisiz.' });
    if (isCustomer && !isExpert && status !== 'cancelled')
      return res.status(403).json({ success: false, error: 'Sadece iptal yapabilirsiniz.' });

    // ✅ State machine — geçersiz durum geçişlerini engelle
    const current = booking.status;
    const FORBIDDEN_TRANSITIONS = {
      cancelled:  ['confirmed', 'rejected', 'completed'], // iptal edilmişi onaylayamazsın
      completed:  ['confirmed', 'rejected', 'cancelled'], // tamamlanmışı geri alamazsın
      rejected:   ['confirmed', 'completed'],             // reddedilmişi onaylayamazsın
    };
    if (FORBIDDEN_TRANSITIONS[current]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `${current} durumundan ${status} durumuna geçiş yapılamaz.`
      });
    }

    await dbRun(
      'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      status, req.params.id
    );

    // Reddet/İptal → takvimden çıkar
    if (status === 'rejected' || status === 'cancelled') {
      const slotArr = (() => {
        try { return JSON.parse(booking.slots || '[]'); } catch { return []; }
      })();
      for (const s of slotArr) {
        await dbRun(
          'DELETE FROM calendar_slots WHERE expert_id = ? AND slot = ?',
          booking.expert_id, s
        );
      }
    }

    const updated = await dbGet('SELECT * FROM bookings WHERE id = ?', req.params.id);
    return res.json({ success: true, booking: formatBooking(updated) });
  } catch (err) {
    console.error('[bookings/status]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

function formatBooking(b) {
  if (!b) return null;
  return {
    id:            b.id,
    customerId:    b.customer_id,
    expertId:      b.expert_id,
    service:       b.service,
    date:          b.date,
    endDate:       b.end_date,
    time:          b.time,
    endTime:       b.end_time,
    durationType:  b.duration_type,
    durationValue: b.duration_value,
    durationLabel: b.duration_label,
    totalPrice:    b.total_price,
    slots:         (() => { try { return JSON.parse(b.slots || '[]'); } catch { return []; } })(),
    city:          b.city,
    notes:         b.notes,
    status:        b.status,
    createdAt:     b.created_at,
    updatedAt:     b.updated_at,
  };
}

module.exports = { createBooking, getMyBookings, getExpertBookings, getBooking, updateStatus };
