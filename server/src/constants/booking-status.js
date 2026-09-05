/**
 * Rezervasyon durumları — magic string yerine bu sabitleri kullan
 */
const BOOKING_STATUS = {
  PENDING:    'pending',
  CONFIRMED:  'confirmed',
  REJECTED:   'rejected',
  CANCELLED:  'cancelled',
  COMPLETED:  'completed',
};

module.exports = { BOOKING_STATUS };
