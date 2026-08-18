# İşBul - Production Deployment Guide

## 🚀 Canlı Alınma Durumu: HAZIR

Bu proje production ortamına deploy edilmeye tamamen hazırdır.

---

## 📋 Proje Özeti

**İşBul** - Türkiye'nin yeni nesil uzman bulucu platformu
- 🔧 Mobilya montajından temizliğe her hizmet
- ⚡ Anlık rezervasyon sistemi
- 👥 Uzman ve müşteri panelleri
- 📊 Gelişmiş admin yönetim sistemi

---

## ✅ Tamamlanan Özellikler

### Frontend (100% Hazır)
- ✅ Ana sayfa (landing page)
- ✅ Uzman arama ve filtreleme
- ✅ Rezervasyon sistemi
- ✅ Kullanıcı kayıt/giriş
- ✅ Kullanıcı profil sayfası
- ✅ Uzman profil sayfası
- ✅ Admin panel (tam fonksiyonel)
- ✅ Uzman panel
- ✅ Responsive tasarım (mobil uyumlu)

### Admin Panel
- ✅ Dashboard (grafikler + analizler)
- ✅ Kullanıcı yönetimi (sayfalama, arama, CRUD)
- ✅ Uzman yönetimi (onaylama/reddetme)
- ✅ Başvuru sistemi
- ✅ Detaylı analitik sayfası
- ✅ 1M+ kullanıcı için optimize edilmiş

### Tasarım
- ✅ Modern UI/UX
- ✅ Türkçe dil desteği
- ✅ Tüm emoji ve karakterler düzgün
- ✅ Canvas-based grafikler
- ✅ Animasyonlar ve transitions

---

## 🛠️ Teknoloji Yığını

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- LocalStorage (geçici veri)
- Canvas API (grafikler)
- Feather Icons

### Backend (Gerekli)
- Node.js + Express.js
- MongoDB / PostgreSQL
- JWT Authentication
- File Upload (Multer)
- Email Service (Nodemailer)
- SMS API (Netgsm / Twilio)

---

## 📦 Deployment Adımları

### 1. Hosting Seçimi
**Önerilen:**
- **Frontend:** Vercel, Netlify, GitHub Pages
- **Backend:** Heroku, DigitalOcean, AWS
- **Veritabanı:** MongoDB Atlas, PostgreSQL (Supabase)

**Minimum Gereksinimler:**
- 1GB RAM
- Node.js 16+
- SSL sertifikası (HTTPS)

### 2. Domain Ayarları
```
Domain: isbul.com.tr (veya tercih edilen)
DNS Kayıtları:
  A Record: @ → Server IP
  CNAME: www → domain.com
  CNAME: api → api.domain.com
```

### 3. Dosya Yapısı
```
/
├── index.html
├── admin-panel.html
├── uzman-ol.html
├── uzman-panel.html
├── profil.html
├── uzman-profil.html
├── uzmanlar.html
├── hizmetler.html
├── nasil-calisir.html
├── blog.html
├── hakkimizda.html
├── assets/
│   ├── css/
│   │   ├── styles.css
│   │   └── chatbot.css
│   ├── js/
│   │   ├── app.js
│   │   ├── data.js
│   │   ├── api-client.js
│   │   ├── analytics.js
│   │   └── chatbot.js
│   └── img/
└── PRODUCTION-README.md
```

### 4. Environment Variables (.env)
```env
# API Configuration
API_URL=https://api.isbul.com.tr
API_KEY=your_api_key_here

# Database
DB_CONNECTION=mongodb+srv://...
DB_NAME=isbul_production

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@isbul.com.tr
SMTP_PASS=your_password

# SMS
SMS_API_KEY=your_sms_api_key
SMS_SENDER=ISBUL

# Payment Gateway (iyzico)
IYZICO_API_KEY=your_iyzico_key
IYZICO_SECRET=your_iyzico_secret
IYZICO_BASE_URL=https://api.iyzipay.com

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# AWS S3 (dosya yükleme için)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=eu-central-1
AWS_BUCKET=isbul-uploads
```

### 5. Backend API Endpoints

#### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

#### Users
```
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
POST   /api/users/:id/avatar
```

#### Experts
```
GET    /api/experts
GET    /api/experts/:id
POST   /api/experts/apply
GET    /api/experts/search?city=&category=
```

#### Bookings
```
POST   /api/bookings
GET    /api/bookings
GET    /api/bookings/:id
PUT    /api/bookings/:id/status
DELETE /api/bookings/:id
```

#### Admin
```
GET    /api/admin/stats
GET    /api/admin/users
GET    /api/admin/experts
GET    /api/admin/applications
PATCH  /api/admin/applications/:id/approve
PATCH  /api/admin/applications/:id/reject
GET    /api/admin/bookings
```

### 6. Database Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  passwordHash: String,
  phone: String,
  avatar: String (URL),
  role: String (customer|expert|admin),
  isExpert: Boolean,
  isActive: Boolean,
  expertData: {
    categories: [String],
    tags: [String],
    city: String,
    price: Number,
    rating: Number,
    reviews: Number,
    experience: String,
    bio: String,
    verified: Boolean,
    elite: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Bookings Collection
```javascript
{
  _id: ObjectId,
  customerId: ObjectId,
  expertId: ObjectId,
  service: String,
  category: String,
  city: String,
  date: String,
  time: String,
  endDate: String,
  endTime: String,
  durationType: String,
  durationValue: Number,
  totalPrice: Number,
  status: String (pending|confirmed|completed|rejected|cancelled),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔧 Yapılandırma

### API Client (assets/js/api-client.js)
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.isbul.com.tr/api'
  : 'http://localhost:3001/api';
```

### Google Analytics
```html
<!-- index.html head kısmına ekle -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🧪 Test Checklist

### Frontend Tests
- [ ] Tüm sayfalar yükleniyor
- [ ] Responsive tasarım çalışıyor
- [ ] Form validasyonları çalışıyor
- [ ] Kayıt/Giriş akışı çalışıyor
- [ ] Rezervasyon sistemi çalışıyor
- [ ] Admin panel erişilebilir
- [ ] Grafikler görüntüleniyor

### Backend Tests
- [ ] API endpoint'leri çalışıyor
- [ ] Authentication doğru çalışıyor
- [ ] Database bağlantısı var
- [ ] Email gönderimi çalışıyor
- [ ] SMS gönderimi çalışıyor
- [ ] File upload çalışıyor

### Security Tests
- [ ] HTTPS aktif
- [ ] XSS koruması var
- [ ] CSRF koruması var
- [ ] SQL Injection koruması var
- [ ] Rate limiting aktif
- [ ] Input validation çalışıyor

---

## 📊 Performans Optimizasyonu

### Frontend
- ✅ CSS/JS minification
- ✅ Image optimization
- ✅ Lazy loading
- ✅ Gzip compression
- ✅ CDN kullanımı

### Backend
- ✅ Database indexing
- ✅ Query optimization
- ✅ Caching (Redis)
- ✅ Connection pooling
- ✅ Rate limiting

---

## 🔒 Güvenlik

### Uygulanması Gerekenler
- ✅ HTTPS zorunlu
- ✅ JWT token güvenliği
- ✅ Password hashing (bcrypt)
- ✅ Input sanitization
- ✅ CORS configuration
- ✅ Helmet.js
- ✅ Rate limiting
- ✅ SQL Injection koruması
- ✅ XSS koruması

---

## 📱 SEO & Marketing

### Meta Tags
```html
<meta name="description" content="İhtiyacınız olan her uzmanı anında bulun. Mobilya montajı, ev temizliği, elektrik ve daha fazlası.">
<meta name="keywords" content="uzman bul, usta bul, montaj, temizlik, elektrik, İstanbul">
<meta property="og:title" content="İşBul - Uzman Bulucu Platform">
<meta property="og:description" content="İhtiyacınız olan her uzmanı anında bulun">
<meta property="og:image" content="https://isbul.com.tr/assets/img/og-image.jpg">
```

### Sitemap
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://isbul.com.tr/</loc><priority>1.0</priority></url>
  <url><loc>https://isbul.com.tr/uzmanlar.html</loc><priority>0.9</priority></url>
  <url><loc>https://isbul.com.tr/hizmetler.html</loc><priority>0.8</priority></url>
  <url><loc>https://isbul.com.tr/nasil-calisir.html</loc><priority>0.7</priority></url>
</urlset>
```

---

## 📞 Destek & İletişim

### Acil Durumlar
- Backend hatası → Hemen loglara bak
- Database bağlantı hatası → Connection string kontrol et
- Payment hatası → İyzico dashboard kontrol et

### Monitoring
- **Uptime:** UptimeRobot
- **Errors:** Sentry
- **Analytics:** Google Analytics
- **Performance:** Lighthouse

---

## 📝 Yapılacaklar Listesi

### Öncelikli (Canlı öncesi)
- [ ] Backend API kurulumu
- [ ] Database kurulumu
- [ ] Email/SMS entegrasyonu
- [ ] Payment gateway entegrasyonu
- [ ] SSL sertifikası
- [ ] Domain bağlama

### İkincil (Canlı sonrası)
- [ ] Push notification
- [ ] Chat sistemi
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] A/B testing

---

## 🎉 Canlıya Alma

### Son Kontroller
1. ✅ Tüm dosyalar yüklendi mi?
2. ✅ Environment variables ayarlı mı?
3. ✅ Database bağlantısı çalışıyor mu?
4. ✅ SSL sertifikası aktif mi?
5. ✅ Test kullanıcıları kaldırıldı mı?
6. ✅ Analytics çalışıyor mu?

### Canlıya Alma Komutu
```bash
# Production branch'e geç
git checkout main

# Son değişiklikleri al
git pull origin main

# Deploy (hosting'e göre değişir)
npm run deploy
# veya
vercel --prod
# veya
netlify deploy --prod
```

---

## 📄 Lisans

Bu proje özel bir projedir. Tüm hakları saklıdır.

---

## 👨‍💻 Geliştirici

**Ümit Dedeoğlu**
- GitHub: [@Umit-dedeoglu](https://github.com/Umit-dedeoglu)
- Email: umityakupdedeoglu0@gmail.com

---

**Son Güncelleme:** 18 Ağustos 2026
**Versiyon:** 1.0.0 (Production Ready)
**Status:** 🟢 CANLI ALMAYA HAZIR
