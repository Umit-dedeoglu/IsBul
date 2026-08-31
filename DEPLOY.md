# 🚀 İşBul Deploy Süreci

Bu dosya, kod değişikliklerinin canlıya alınması için gereken tüm adımları açıklar.

---

## 📦 Proje Yapısı

```
isbul/
├── *.html                 # Frontend sayfalar (GitHub Pages'e deploy)
├── assets/               # CSS, JS, resimler (GitHub Pages'e deploy)
├── components/           # HTML componentler (GitHub Pages'e deploy)
└── server/              # Backend API (Render.com'a deploy)
```

---

## 🌐 Frontend Deploy (GitHub Pages)

### 1. Değişiklikleri Commit Et

```powershell
cd isbul
git add .
git commit -m "feat: açıklama"
git push
```

### 2. Otomatik Deploy

- **GitHub Pages otomatik deploy eder** — push yaptıktan 1-2 dakika sonra `https://isbul.online` güncellenir.
- GitHub repo → Settings → Pages → `main` branch + `/(root)` klasörü seçili olmalı.

### 3. Cache Temizleme

Frontend değişiklikleri tarayıcı cache'inde kalabilir:

```javascript
// Kullanıcının tarayıcısında cache temizlemesi için:
// Ctrl+Shift+R (hard reload)
```

Veya HTML'de versiyonlu asset yükle:

```html
<script src="assets/js/app.js?v=20260824"></script>
```

---

## 🔧 Backend Deploy (Render.com)

### 1. Değişiklikleri Commit Et

```powershell
cd isbul
git add server/
git commit -m "backend: açıklama"
git push
```

### 2. Otomatik Deploy

- **Render otomatik deploy eder** — `main` branch'e push yaptıktan sonra:
  - Render dashboard → `isbul-backend` servisi → Events sekmesinde deploy loglarını izle
  - Deploy süresi: ~3-5 dakika
  - Deploy başarılı olunca `https://isbul-backend.onrender.com/api/health` 200 döner

### 3. Deploy Durumu Kontrolü

```powershell
# Backend sağlık kontrolü
Invoke-WebRequest -Uri "https://isbul-backend.onrender.com/api/health" -UseBasicParsing | Select-Object StatusCode, Content

# Son deploy'un commit hash'i
# Render → isbul-backend → Events → "Deploy live for <commit>"
```

### 4. Manuel Deploy Tetikleme

Eğer otomatik deploy çalışmazsa:

- Render dashboard → `isbul-backend` → "Manual Deploy" → "Deploy latest commit"

---

## 🗄️ Veritabanı Güncellemeleri

### Migration Çalıştırma

Backend değişikliği DB şeması güncellemesi gerektiriyorsa:

```powershell
# Lokal test (önce!)
cd isbul/server
node scripts/migrate.js

# Production'da çalıştırma
# Render → isbul-backend → Shell sekmesi → komut çalıştır:
node scripts/migrate.js
```

**Alternatif:** Migration script'ini Render'ın "Build Command"'ine ekle:

```bash
npm install && node scripts/migrate.js
```

---

## 🧪 Değişiklikleri Test Et

### Frontend Testi

1. **Lokal test:**
   ```powershell
   # Basit HTTP server
   cd isbul
   python -m http.server 8000
   # http://localhost:8000 aç
   ```

2. **Canlı test:**
   - `https://isbul.online` aç
   - Değişikliği doğrula
   - F12 Console'da hata var mı kontrol et

### Backend Testi

1. **Lokal test:**
   ```powershell
   cd isbul/server
   npm run dev
   # http://localhost:3001/api/health
   ```

2. **Canlı test:**
   ```powershell
   # Health check
   Invoke-WebRequest -Uri "https://isbul-backend.onrender.com/api/health"
   
   # Örnek API çağrısı
   Invoke-WebRequest -Uri "https://isbul-backend.onrender.com/api/v1/experts"
   ```

---

## 🔄 Cache Yönetimi

### Upstash Redis Cache Temizleme

Backend değişikliği cache'i invalidate etmiyorsa manuel temizle:

```powershell
$headers = @{ "Authorization" = "Bearer gQAAAAAAAud_AAIgcDFhNGZlZjgzODBhMDM0OWM1YWMzMDg3ZTMwNWEyNDI5NQ" }
Invoke-WebRequest -Uri "https://heroic-oriole-190335.upstash.io/flushall" -Method POST -Headers $headers -UseBasicParsing
```

**Ne zaman temizlenmeli:**
- Uzman listesi değiştiğinde
- Kategori mantığı değiştiğinde
- Profil formatı değiştiğinde

---

## 🐛 Hata Ayıklama

### Sentry Hata Takibi

Backend hatalarını görmek için:

1. [https://isbul.sentry.io](https://isbul.sentry.io) → Issues
2. Son 15 dakikadaki hataları filtrele
3. Breadcrumbs'tan istek detaylarını incele

### Render Logları

```
Render Dashboard → isbul-backend → Logs sekmesi
```

Gerçek zamanlı log akışını görürsün — `console.log` ve `console.error` burada.

---

## 📋 Deploy Checklist

Değişiklik yaparken kontrol listesi:

- [ ] Değişiklikler git commit'lendi
- [ ] Backend değişikliği varsa `server/` commit'lendi
- [ ] Migration gerekiyorsa `migrate.js` çalıştırıldı
- [ ] Lokal test yapıldı (frontend + backend)
- [ ] `git push` yapıldı
- [ ] GitHub Pages deploy beklendi (1-2 dk)
- [ ] Render deploy beklendi (3-5 dk)
- [ ] Canlı sitede test edildi
- [ ] Cache temizlendi (gerekirse)
- [ ] Sentry'de yeni hata var mı kontrol edildi

---

## 🔐 Environment Variables (Render)

Backend'de şu env var'lar tanımlı:

```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres...
UPSTASH_REDIS_URL=https://heroic-oriole...
UPSTASH_REDIS_TOKEN=...
JWT_SECRET=...
SENTRY_DSN=...
FRONTEND_URL=https://isbul.online
ADMIN_SETUP_KEY=...
```

Yeni env var eklemek için:
- Render → isbul-backend → Environment → "Add Environment Variable"
- Kaydet ve redeploy tetiklenir

---

## 📂 Branch Yönetimi

**Main branch:** Production
**Feature branch'ler:** Test için

```powershell
# Feature branch oluştur
git checkout -b feature/rezervasyon-fix
git push -u origin feature/rezervasyon-fix

# Test edilince main'e merge
git checkout main
git merge feature/rezervasyon-fix
git push
```

---

## 🚨 Acil Rollback

Hatalı deploy yapıldıysa geri al:

```powershell
# Son commit'i geri al
git revert HEAD
git push

# Veya doğrudan eski commit'e dön
git reset --hard <commit-hash>
git push --force
```

Render otomatik yeni push'u deploy edecek.

---

## 📞 Destek

- **Render destek:** [render.com/docs](https://render.com/docs)
- **Sentry:** [docs.sentry.io](https://docs.sentry.io)
- **Upstash:** [docs.upstash.com](https://docs.upstash.com)
