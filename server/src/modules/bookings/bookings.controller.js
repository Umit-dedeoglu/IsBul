const { dbGet, dbAll, dbRun, getDb } = require('../../db');

function genId() {
  return `rez_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
}

/** POST /api/bookings */
function createBooking(req, res) {
  try {
    const session = req.user;
    const { expertId, service, date, endDate, time, endTime,
            durationType, durationValue, durationLabel, totalPrice,
            slots, city, notes } = req.body;

    if (!expertId || !service || !date || !time)
      return res.status(400).json({ success: false, error: 'Zorunlu alanlar eksik.' });

    const allSlots = Array.isArray(slots) && slots.length ? slots : [`${date}_${time}`];

    // Çakışma kontrolü
    for (const slot of allSlots) {
      const conflict = dbGet(
        'SELECT slot_key FROM calendar_slots WHERE expert_id = ? AND slot_key = ?',
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
    dbRun(
      `INSERT INTO bookings
        (id, customer_id, expert_id, service, date, end_date, time, end_time,
         duration_type, duration_value, duration_label, total_price, slots, city, notes, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')`,
      id, session.id, expertId, service, date, endDate||date,
      time, endTime||time, durationType||'hours', durationValue||1,
      durationLabel||'', totalPrice||0,
      JSON.stringify(allSlots), city||'', notes||''
    );

    // Takvime işle
    for (const slot of allSlots) {
      dbRun(
        'INSERT OR IGNORE INTO calendar_slots (expert_id, slot_key, booking_id) VALUES (?,?,?)',
        expertId, slot, id
      );
    }

    const booking = dbGet('SELECT * FROM bookings WHERE id = ?', id);
    return res.status(201).json({ success: true, booking: formatBooking(booking) });
  } catch (err) {
    console.error('[bookings/create]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** GET /api/bookings/my */
function getMyBookings(req, res) {
  try {
    const bookings = dbAll(
      'SELECT * FROM bookings WHERE customer_id = ? ORDER BY created_at DESC',
      req.user.id
    );
    return res.json({ success: true, bookings: bookings.map(formatBooking) });
  } catch (err) {
    console.error('[bookings/my]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** GET /api/bookings/expert */
function getExpertBookings(req, res) {
  try {
    const bookings = dbAll(
      `SELECT b.*, u.first_name, u.last_name, u.avatar, u.color
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       WHERE b.expert_id = ?
       ORDER BY b.created_at DESC`,
      req.user.id
    );
    return res.json({ success: true, bookings: bookings.map(b => ({
      ...formatBooking(b),
      customerName:   `${b.first_name} ${b.last_name}`,
      customerAvatar: b.avatar,
      customerColor:  b.color,
    }))});
  } catch (err) {
    console.error('[bookings/expert]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** PATCH /api/bookings/:id/status */
function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed','rejected','cancelled','completed'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, error: 'Geçersiz durum.' });

    const booking = dbGet('SELECT * FROM bookings WHERE id = ?', req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Rezervasyon bulunamadı.' });

    const isExpert   = booking.expert_id   === req.user.id;
    const isCustomer = booking.customer_id === req.user.id;
    if (!isExpert && !isCustomer)
      return res.status(403).json({ success: false, error: 'Yetkisiz.' });
    if (isCustomer && !isExpert && status !== 'cancelled')
      return res.status(403).json({ success: false, error: 'Sadece iptal yapabilirsiniz.' });

    dbRun('UPDATE bookings SET status = ?, updated_at = datetime("now") WHERE id = ?', status, req.params.id);

    // Reddet/İptal → takvimden çıkar
    if (status === 'rejected' || status === 'cancelled') {
      const slotArr = JSON.parse(booking.slots || '[]');
      slotArr.forEach(s => dbRun(
        'DELETE FROM calendar_slots WHERE expert_id = ? AND slot_key = ?',
        booking.expert_id, s
      ));
    }

    const updated = dbGet('SELECT * FROM bookings WHERE id = ?', req.params.id);
    return res.json({ success: true, booking: formatBooking(updated) });
  } catch (err) {
    console.error('[bookings/status]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

function formatBooking(b) {
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
    slots:         JSON.parse(b.slots || '[]'),
    city:          b.city,
    notes:         b.notes,
    status:        b.status,
    createdAt:     b.created_at,
    updatedAt:     b.updated_at,
  };
}

module.exports = { createBooking, getMyBookings, getExpertBookings, updateStatus };
