# 🔧 Google OAuth Düzeltme Talimatları

## ✅ Local'de Yapılan Değişiklikler

### 1. Backend (.env)
```env
GOOGLE_CALLBACK_URL=https://isbul.online/api/v1/auth/google/callback
FRONTEND_URL=https://isbul.online
```

### 2. Frontend (oauth-callback.html)
- API base URL: `https://isbul.online/api/v1` olarak güncellendi
- Debug console.log'lar eklendi

### 3. Frontend (api-client.js)
- `isbul.online` domain tespiti eklendi
- Otomatik URL seçimi aktif

### 4. Backend (passport.js)
- Detaylı debug log'ları eklendi
- Hata ayıklama için stack trace eklendi

---

## 🚀 AWS Sunucusunda Yapılması Gerekenler

### 1️⃣ SSH ile Bağlan
```bash
ssh -i "C:\Users\umity\.ssh\isbul-keypair.pem" ubuntu@34.239.191.168
```

### 2️⃣ Backend Dosyalarını Güncelle

#### A) .env Dosyasını Güncelle
```bash
cd /var/www/isbul-backend
sudo nano .env
```

**Değiştirilecek satırlar:**
```env
GOOGLE_CALLBACK_URL=https://isbul.online/api/v1/auth/google/callback
FRONTEND_URL=https://isbul.online
```

**Kaydet:** `Ctrl+O`, `Enter`, `Ctrl+X`

#### B) passport.js Dosyasını Güncelle
```bash
sudo nano src/config/passport.js
```

**Tüm dosya içeriğini aşağıdaki ile değiştirin:**

```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { dbGet, dbRun } = require('../db');

function getInitials(first, last) {
  return ((first[0] || '') + (last[0] || '')).toUpperCase();
}
const COLORS = ['#6C63FF','#FF6B6B','#4ECDC4','#FFD93D','#96CEB4','#56AB2F'];
function randomColor() { return COLORS[Math.floor(Math.random() * COLORS.length)]; }
function genId()       { return `u_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; }

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID     || 'placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    callbackURL:  process.env.GOOGLE_CALLBACK_URL  || 'http://localhost:3001/api/v1/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔵 Google OAuth Strategy triggered');
      console.log('Profile ID:', profile.id);
      console.log('Profile email:', profile.emails?.[0]?.value);
      
      const googleId  = profile.id;
      const email     = profile.emails?.[0]?.value?.toLowerCase();
      
      // Güvenli ad/soyad çıkarımı
      const displayParts = (profile.displayName || '').trim().split(/\s+/);
      const firstName = profile.name?.givenName || displayParts[0] || email?.split('@')[0] || 'Kullanici';
      const lastName  = profile.name?.familyName || displayParts.slice(1).join(' ') || '';

      console.log('Checking existing user with google_id:', googleId);
      // Mevcut kullanıcıyı bul
      let user = await dbGet('SELECT * FROM users WHERE google_id = ?', googleId);
      console.log('User found by google_id:', !!user);

      if (!user && email) {
        console.log('Checking user by email:', email);
        user = await dbGet('SELECT * FROM users WHERE email = ?', email);
        console.log('User found by email:', !!user);
        if (user) {
          console.log('Linking google_id to existing user');
          await dbRun('UPDATE users SET google_id = ? WHERE id = ?', googleId, user.id);
        }
      }

      if (!user) {
        console.log('Creating new user');
        const id = genId();
        const avatar = getInitials(firstName, lastName);
        const color = randomColor();
        await dbRun(
          `INSERT INTO users (id, first_name, last_name, email, avatar, color, role, google_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          id, firstName, lastName, email, avatar, color, 'customer', googleId
        );
        console.log('New user created with id:', id);
        user = await dbGet('SELECT * FROM users WHERE id = ?', id);
      }

      console.log('✅ OAuth successful for user:', user.id);
      return done(null, {
        id:        user.id,
        email:     user.email,
        role:      user.role,
        firstName: user.first_name,
        lastName:  user.last_name,
        avatar:    user.avatar,
        color:     user.color,
      });
    } catch (err) {
      console.error('❌ Google OAuth error:', err);
      console.error('Error stack:', err.stack);
      return done(err, null);
    }
  }
));

module.exports = passport;
```

**Kaydet:** `Ctrl+O`, `Enter`, `Ctrl+X`

#### C) Backend'i Yeniden Başlat
```bash
pm2 restart isbul-api
pm2 logs isbul-api --lines 50
```

### 3️⃣ Frontend Dosyalarını Güncelle

#### A) oauth-callback.html
```bash
cd /var/www/isbul
sudo nano oauth-callback.html
```

**54. satırı bulun ve değiştirin:**
```javascript
// ÖNCE (eski):
const apiBase = 'http://34.239.191.168:3001/api';

// SONRA (yeni):
const apiBase = 'https://isbul.online/api/v1';
```

**Kaydet:** `Ctrl+O`, `Enter`, `Ctrl+X`

#### B) api-client.js
```bash
sudo nano assets/js/api-client.js
```

**10-20. satırları bulun ve değiştirin:**
```javascript
const BACKEND_URL = (() => {
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  // Production domain - isbul.online (Nginx reverse proxy)
  if (h === 'isbul.online' || h === 'www.isbul.online') {
    return 'https://isbul.online';
  }
  // AWS IP fallback
  if (h === '34.239.191.168') {
    return 'http://34.239.191.168:3001';
  }
  // Canlı ortam — Nginx reverse proxy üzerinden /api path'i kullan
  return window.location.origin;
})();
```

**Kaydet:** `Ctrl+O`, `Enter`, `Ctrl+X`

#### C) Nginx'i Yeniden Yükle
```bash
sudo systemctl reload nginx
```

---

## 🔐 Google Cloud Console Ayarları

### Authorized Redirect URIs Ekle:
1. [Google Cloud Console](https://console.cloud.google.com) → Projenizi seçin
2. **APIs & Services** → **Credentials**
3. OAuth 2.0 Client ID'nizi açın (Client ID: `133606299303-gm21lp9ioqjvf9td071d9l7f9t7hs76r.apps.googleusercontent.com`)
4. **Authorized redirect URIs** bölümüne şunu ekleyin:
   ```
   https://isbul.online/api/v1/auth/google/callback
   ```
5. **Save** butonuna tıklayın

---

## 🧪 Test Adımları

### 1️⃣ Backend Loglarını İzleyin
```bash
pm2 logs isbul-api --lines 100 -f
```

### 2️⃣ Tarayıcıda Test Edin
1. https://isbul.online adresine gidin
2. **F12** tuşuna basın (Developer Tools)
3. **Console** sekmesine geçin
4. "Google ile Giriş" butonuna tıklayın
5. Gmail hesabınızı seçin

### 3️⃣ Başarı Kontrolleri:

**Backend Loglarında Görülmesi Gerekenler:**
```
🔵 Google OAuth Strategy triggered
Profile ID: 123456789...
Profile email: yourmail@gmail.com
Checking existing user with google_id: 123456789...
User found by google_id: false
Checking user by email: yourmail@gmail.com
User found by email: false
Creating new user
New user created with id: u_1234567890_xxxxx
✅ OAuth successful for user: u_1234567890_xxxxx
```

**Browser Console'da Görülmesi Gerekenler:**
```
Fetching user info from: https://isbul.online/api/v1/auth/me
Response status: 200
Response data: {success: true, user: {...}}
```

**Başarılı Giriş:**
- Ana sayfaya yönlendirilmelisiniz
- Sağ üst köşede profil avatar'ınız görünmelidir
- "Çıkış Yap" butonu aktif olmalıdır

---

## 🐛 Sorun Giderme

### Hata: "INTERNAL_ERROR"
**Çözüm:**
```bash
# PostgreSQL bağlantısını kontrol edin
pm2 logs isbul-api --lines 200

# Veritabanı bağlantı hatası varsa:
cd /var/www/isbul-backend
nano .env
# DATABASE_URL'i kontrol edin
```

### Hata: "Failed to load resource: 500"
**Çözüm:**
```bash
# Backend loglarını inceleyin
pm2 logs isbul-api --lines 200 --err

# Stack trace'i bulun ve düzeltin
```

### Hata: "redirect_uri_mismatch"
**Çözüm:**
- Google Cloud Console'da Authorized Redirect URIs'e ekleyin:
  ```
  https://isbul.online/api/v1/auth/google/callback
  ```
- 5 dakika bekleyin (Google cache temizlenir)

### Hata: CORS
**Çözüm:**
```bash
# app.js'de CORS ayarlarını kontrol edin
cd /var/www/isbul-backend
sudo nano src/app.js

# allowedOrigins array'ine ekleyin:
'https://isbul.online',
'https://www.isbul.online',
```

---

## ✅ Başarı Kriterleri

- [ ] Backend'de .env güncellendi
- [ ] Backend'de passport.js güncellendi
- [ ] Frontend'de oauth-callback.html güncellendi
- [ ] Frontend'de api-client.js güncellendi
- [ ] PM2 restart yapıldı
- [ ] Nginx reload yapıldı
- [ ] Google Cloud Console güncellendi
- [ ] Browser'da test edildi
- [ ] Login başarılı ✅

---

**Hazırlayan:** Kiro AI  
**Tarih:** 20 Ağustos 2026  
**Durum:** 🟡 Düzeltme Bekleniyor
