/**
 * Payments Controller
 * İyzico ile ödeme başlatma, sonuç alma ve webhook işleme
 */

const { iyzipay, isSandbox } = require('../../config/iyzico');
const { dbGet, dbRun } = require('../../db');
const { generateId } = require('../../utils/id-generator');

/**
 * POST /api/v1/payments/initialize
 * Ödeme başlat — iyzico checkout form token'ı döndür
 */
async function initializePayment(req, res) {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    // Rezervasyonu kontrol et
    const booking = await dbGet(
      `SELECT b.*, u.first_name, u.last_name, u.email
       FROM bookings b JOIN users u ON u.id = b.customer_id
       WHERE b.id = ? AND b.customer_id = ?`,
      bookingId, userId
    );

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Rezervasyon bulunamadı.' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, error: 'Bu rezervasyon zaten ödendi.' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, error: 'Ödeme yapılabilmesi için rezervasyonun onaylanmış olması gerekiyor.' });
    }

    // Mevcut bekleyen ödeme var mı kontrol et
    const existingPayment = await dbGet(
      "SELECT * FROM payments WHERE booking_id = ? AND status = 'pending'",
      bookingId
    );

    const paymentId = existingPayment?.id || generateId('pay');
    const conversationId = paymentId;
    const price = String(booking.total_price || 100);
    const frontendUrl = process.env.FRONTEND_URL || 'https://isbul.online';

    const request = {
      locale:         'tr',
      conversationId,
      price,
      paidPrice:      price,
      currency:       'TRY',
      basketId:       bookingId,
      paymentGroup:   'SERVICE',
      callbackUrl:    `${process.env.BACKEND_URL || 'https://isbul-backend.onrender.com'}/api/v1/payments/callback`,
      enabledInstallments: ['1', '2', '3', '6'],

      buyer: {
        id:                  userId,
        name:                booking.first_name,
        surname:             booking.last_name,
        gsmNumber:           '+905350000000',
        email:               booking.email,
        identityNumber:      '74300864791',
        lastLoginDate:       new Date().toISOString().replace('T', ' ').slice(0, 19),
        registrationDate:    new Date().toISOString().replace('T', ' ').slice(0, 19),
        registrationAddress: 'Türkiye',
        ip:                  req.ip || '85.34.78.112',
        city:                booking.city || 'İstanbul',
        country:             'Turkey',
        zipCode:             '34000',
      },

      shippingAddress: {
        contactName: `${booking.first_name} ${booking.last_name}`,
        city:        booking.city || 'İstanbul',
        country:     'Turkey',
        address:     booking.city || 'Türkiye',
        zipCode:     '34000',
      },

      billingAddress: {
        contactName: `${booking.first_name} ${booking.last_name}`,
        city:        booking.city || 'İstanbul',
        country:     'Turkey',
        address:     booking.city || 'Türkiye',
        zipCode:     '34000',
      },

      basketItems: [{
        id:        bookingId,
        name:      booking.service || 'Hizmet',
        category1: 'Hizmet',
        itemType:  'VIRTUAL',
        price,
      }],
    };

    // İyzico'ya checkout form isteği gönder
    const result = await new Promise((resolve, reject) => {
      iyzipay.checkoutFormInitialize.create(request, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    if (result.status !== 'success') {
      console.error('[payments/initialize] İyzico hata:', result);
      return res.status(400).json({
        success: false,
        error: result.errorMessage || 'Ödeme başlatılamadı.',
      });
    }

    // Payment kaydı oluştur veya güncelle
    if (!existingPayment) {
      await dbRun(
        `INSERT INTO payments (id, booking_id, customer_id, amount, currency, status, iyzico_token, conversation_id, created_at)
         VALUES (?, ?, ?, ?, 'TRY', 'pending', ?, ?, CURRENT_TIMESTAMP)`,
        paymentId, bookingId, userId, booking.total_price || 100,
        result.token, conversationId
      );
    } else {
      await dbRun(
        'UPDATE payments SET iyzico_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        result.token, existingPayment.id
      );
    }

    return res.json({
      success:       true,
      checkoutFormContent: result.checkoutFormContent,
      token:         result.token,
      paymentPageUrl: result.paymentPageUrl,
      isSandbox,
    });

  } catch (err) {
    console.error('[payments/initialize]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

/**
 * POST /api/v1/payments/callback
 * İyzico'dan gelen ödeme sonucu (redirect callback)
 */
async function paymentCallback(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL || 'https://isbul.online'}/profil.html?payment=failed`);
    }

    // Ödeme sonucunu sorgula
    const result = await new Promise((resolve, reject) => {
      iyzipay.checkoutForm.retrieve({ locale: 'tr', token }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    // Ödeme kaydını bul
    const payment = await dbGet('SELECT * FROM payments WHERE iyzico_token = ?', token);

    if (!payment) {
      return res.redirect(`${process.env.FRONTEND_URL || 'https://isbul.online'}/profil.html?payment=failed`);
    }

    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
      // Ödeme başarılı
      await dbRun(
        'UPDATE payments SET status = ?, iyzico_payment_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        'completed', result.paymentId, payment.id
      );

      // Rezervasyonu tamamlandı olarak işaretle
      await dbRun(
        'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        'completed', payment.booking_id
      );

      return res.redirect(`${process.env.FRONTEND_URL || 'https://isbul.online'}/profil.html?payment=success&bookingId=${payment.booking_id}`);
    } else {
      // Ödeme başarısız
      await dbRun(
        'UPDATE payments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        'failed', payment.id
      );

      return res.redirect(`${process.env.FRONTEND_URL || 'https://isbul.online'}/profil.html?payment=failed`);
    }

  } catch (err) {
    console.error('[payments/callback]', err);
    return res.redirect(`${process.env.FRONTEND_URL || 'https://isbul.online'}/profil.html?payment=error`);
  }
}

/**
 * GET /api/v1/payments/:bookingId
 * Rezervasyona ait ödeme durumunu getir
 */
async function getPaymentStatus(req, res) {
  try {
    const payment = await dbGet(
      'SELECT id, booking_id, amount, currency, status, created_at FROM payments WHERE booking_id = ? AND customer_id = ?',
      req.params.bookingId, req.user.id
    );

    if (!payment) {
      return res.json({ success: true, payment: null });
    }

    return res.json({ success: true, payment });
  } catch (err) {
    console.error('[payments/status]', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası.' });
  }
}

module.exports = { initializePayment, paymentCallback, getPaymentStatus };
