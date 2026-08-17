const { dbAll, dbGet } = require('../../db');

/** GET /api/calendar/:expertId/slots */
function getSlots(req, res) {
  try {
    const { expertId } = req.params;
    const { date }     = req.query;

    let rows;
    if (date) {
      rows = dbAll(
        "SELECT slot_key FROM calendar_slots WHERE expert_id = ? AND slot_key LIKE ?",
        expertId, `${date}_%`
      );
    } else {
      rows = dbAll('SELECT slot_key FROM calendar_slots WHERE expert_id = ?', expertId);
    }

    const slots = {};
    rows.forEach(r => { slots[r.slot_key] = true; });
    return res.json({ success: true, slots });
  } catch (err) {
    console.error('[calendar/slots]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** POST /api/calendar/:expertId/check */
function checkSlots(req, res) {
  try {
    const { expertId } = req.params;
    const { slots }    = req.body;

    if (!Array.isArray(slots) || !slots.length)
      return res.status(400).json({ success: false, error: 'Slot listesi gereklidir.' });

    for (const slot of slots) {
      const conflict = dbGet(
        'SELECT slot_key FROM calendar_slots WHERE expert_id = ? AND slot_key = ?',
        expertId, slot
      );
      if (conflict) {
        return res.json({ success: true, available: false, conflictSlot: conflict.slot_key });
      }
    }

    return res.json({ success: true, available: true });
  } catch (err) {
    console.error('[calendar/check]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

module.exports = { getSlots, checkSlots };
