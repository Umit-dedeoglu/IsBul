/**
 * İşBul Email Service
 * Resend API ile mail gönderimi — tüm mail türleri buradan yönetilir.
 */
const { Resend } = require('resend');

// Test modunda Resend başlatılmaz — gerçek mail gönderilmez
let resend = null;
function getResend() {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      if (process.env.NODE_ENV === 'test') return null;
      throw new Error('RESEND_API_KEY env variable is not set');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_ADDRESS = process.env.MAIL_FROM || 'noreply@isbul.online';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://isbul.online';

/* ─────────────────────────────────────────────────────────
   ŞIFRE SIFIRLAMA
───────────────────────────────────────────────────────── */
async function sendPasswordResetEmail({ to, firstName, resetToken }) {
  const resetLink = `${FRONTEND_URL}/reset-password.html?token=${resetToken}`;
  const client = getResend();
  if (!client) {
    console.log(`[email:test] Şifre sıfırlama maili ATLANДИ (test modu): ${to} → ${resetLink}`);
    return { id: 'test-skip' };
  }
  const { data, error } = await client.emails.send({
    from: `İşBul <${FROM_ADDRESS}>`,
    to,
    subject: 'Şifre Sıfırlama Talebi — İşBul',
    html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Arial,sans-serif">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6C63FF 0%,#764ba2 100%);padding:32px 40px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800">İşBul</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px">Güvenilir Hizmet Platformu</p>
    </div>
    <!-- Body -->
    <div style="padding:40px">
      <h2 style="margin:0 0 16px;font-size:20px;color:#1e293b">Merhaba${firstName ? ', ' + firstName : ''}!</h2>
      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7">
        Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
      </p>
      <div style="text-align:center;margin:32px 0">
        <a href="${resetLink}"
           style="display:inline-block;padding:14px 32px;background:#6C63FF;color:#fff;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:.3px">
          Şifremi Sıfırla
        </a>
      </div>
      <p style="margin:0 0 8px;font-size:13px;color:#94a3b8">
        Bu link <strong>1 saat</strong> geçerlidir. Eğer bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.
      </p>
      <p style="margin:0;font-size:12px;color:#cbd5e1;word-break:break-all">
        Link çalışmıyorsa kopyalayıp tarayıcıya yapıştırın:<br>${resetLink}
      </p>
    </div>
    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center">
      <p style="margin:0;font-size:12px;color:#94a3b8">© 2026 İşBul · <a href="${FRONTEND_URL}" style="color:#6C63FF;text-decoration:none">isbul.online</a></p>
    </div>
  </div>
</body>
</html>`,
  });

  if (error) {
    console.error('[email] Şifre sıfırlama maili gönderilemedi:', error);
    throw new Error('Mail gönderilemedi: ' + error.message);
  }

  console.log('[email] Şifre sıfırlama maili gönderildi:', to, data?.id);
  return data;
}

/* ─────────────────────────────────────────────────────────
   UZMAN BAŞVURUSU ONAYLANDI
───────────────────────────────────────────────────────── */
async function sendExpertApprovedEmail({ to, firstName }) {
  const client = getResend();
  if (!client) {
    console.log(`[email:test] Uzman onay maili ATLANDI (test modu): ${to}`);
    return { id: 'test-skip' };
  }
  const { data, error } = await client.emails.send({
    from: `İşBul <${FROM_ADDRESS}>`,
    to,
    subject: 'Uzman Başvurunuz Onaylandı 🎉 — İşBul',
    html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Arial,sans-serif">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
    <div style="background:linear-gradient(135deg,#6C63FF 0%,#764ba2 100%);padding:32px 40px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800">İşBul</h1>
    </div>
    <div style="padding:40px">
      <div style="text-align:center;font-size:56px;margin-bottom:16px">🎉</div>
      <h2 style="margin:0 0 16px;font-size:20px;color:#1e293b;text-align:center">Tebrikler${firstName ? ', ' + firstName : ''}!</h2>
      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;text-align:center">
        Uzman başvurunuz incelendi ve <strong>onaylandı</strong>. Artık İşBul uzmanısınız!
      </p>
      <div style="text-align:center;margin:32px 0">
        <a href="${FRONTEND_URL}/uzman-panel.html"
           style="display:inline-block;padding:14px 32px;background:#6C63FF;color:#fff;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700">
          Uzman Paneline Git →
        </a>
      </div>
    </div>
    <div style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center">
      <p style="margin:0;font-size:12px;color:#94a3b8">© 2026 İşBul · <a href="${FRONTEND_URL}" style="color:#6C63FF;text-decoration:none">isbul.online</a></p>
    </div>
  </div>
</body>
</html>`,
  });

  if (error) {
    console.error('[email] Uzman onay maili gönderilemedi:', error);
    // Onay maili gönderilemezse işlemi durdurmuyoruz — sadece log
  }

  console.log('[email] Uzman onay maili gönderildi:', to);
  return data;
}

/* ─────────────────────────────────────────────────────────
   YENİ REZERVASYON BİLDİRİMİ
───────────────────────────────────────────────────────── */
async function sendNewBookingEmail({ to, expertName, customerName, service, date }) {
  const client = getResend();
  if (!client) {
    console.log(`[email:test] Rezervasyon maili ATLANDI (test modu): ${to}`);
    return { id: 'test-skip' };
  }
  const { data, error } = await client.emails.send({
    from: `İşBul <${FROM_ADDRESS}>`,
    to,
    subject: `Yeni Rezervasyon: ${customerName} — İşBul`,
    html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Arial,sans-serif">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
    <div style="background:linear-gradient(135deg,#6C63FF 0%,#764ba2 100%);padding:32px 40px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800">İşBul</h1>
    </div>
    <div style="padding:40px">
      <h2 style="margin:0 0 20px;font-size:20px;color:#1e293b">Yeni Rezervasyon Geldi!</h2>
      <div style="background:#f8fafc;border-radius:12px;padding:20px;border:1.5px solid #e2e8f0">
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0">
          <span style="color:#64748b;font-size:14px">Müşteri</span>
          <strong style="font-size:14px">${customerName}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0">
          <span style="color:#64748b;font-size:14px">Hizmet</span>
          <strong style="font-size:14px">${service}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0">
          <span style="color:#64748b;font-size:14px">Tarih</span>
          <strong style="font-size:14px">${date}</strong>
        </div>
      </div>
      <div style="text-align:center;margin-top:28px">
        <a href="${FRONTEND_URL}/uzman-panel.html"
           style="display:inline-block;padding:12px 28px;background:#6C63FF;color:#fff;text-decoration:none;border-radius:50px;font-size:14px;font-weight:700">
          Panelde Görüntüle →
        </a>
      </div>
    </div>
    <div style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center">
      <p style="margin:0;font-size:12px;color:#94a3b8">© 2026 İşBul · <a href="${FRONTEND_URL}" style="color:#6C63FF;text-decoration:none">isbul.online</a></p>
    </div>
  </div>
</body>
</html>`,
  });

  if (error) {
    console.error('[email] Rezervasyon bildirimi gönderilemedi:', error);
  }
  return data;
}

module.exports = { sendPasswordResetEmail, sendExpertApprovedEmail, sendNewBookingEmail };
