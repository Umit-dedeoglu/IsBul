const { dbAll, dbGet } = require('../../db');

/** GET /api/calendar/:expertId/slots */
async function getSlots(req, res) {
  try {
    const { expertId } = req.params;
    const { date }     = req.query;

    let rows;
    if (date) {
      rows = await dbAll(
        'SELECT slot_key FROM calendar_slots WHERE expert_id = ? AND slot_key LIKE ?',
        expertId, `${date}_%`
      );
    } else {
      rows = await dbAll(
        'SELECT slot_key FROM calendar_slots WHERE expert_id = ?',
        expertId
      );
    }

    const list = Array.isArray(rows) ? rows : [];
    const slots = {};
    list.forEach(r => {
      const key = r.slot_key;
      if (key) slots[key] = true;
    });

    return res.json({ success: true, slots });
  } catch (err) {
    console.error('[calendar/slots]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/** POST /api/calendar/:expertId/check */
async function checkSlots(req, res) {
  try {
    const { expertId } = req.params;
    const { slots }    = req.body;

    if (!Array.isArray(slots) || !slots.length)
      return res.status(400).json({ success: false, error: 'Slot listesi gereklidir.' });

    for (const slot of slots) {
      const conflict = await dbGet(
        'SELECT slot_key FROM calendar_slots WHERE expert_id = ? AND slot_key = ?',
        expertId, slot
      );
      if (conflict) {
        return res.json({
          success: true,
          available: false,
          conflictSlot: conflict.slot_key
        });
      }
    }

    return res.json({ success: true, available: true });
  } catch (err) {
    console.error('[calendar/check]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

module.exports = { getSlots, checkSlots };

