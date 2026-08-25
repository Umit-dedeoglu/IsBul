# 🚀 İşBul Platform

[![CI Status](https://github.com/Umit-dedeoglu/IsBul/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Umit-dedeoglu/IsBul/actions/workflows/ci.yml)
[![CD Status](https://github.com/Umit-dedeoglu/IsBul/actions/workflows/cd.yml/badge.svg?branch=main)](https://github.com/Umit-dedeoglu/IsBul/actions/workflows/cd.yml)

İşBul, uzmanlar ve müşterileri bir araya getiren modern bir platform.

## 📍 Deployment URLs

- **🌐 Frontend:** [https://isbul-frontend.onrender.com](https://isbul-frontend.onrender.com)
- **🔧 Backend API:** [https://isbul-backend.onrender.com](https://isbul-backend.onrender.com)
- **📚 API Docs:** [https://isbul-backend.onrender.com/api/docs](https://isbul-backend.onrender.com/api/docs)

## 🏗️ Teknoloji Stack

### Frontend
- **HTML5, CSS3, JavaScript**
- **Component-based Architecture**
- **Responsive Design**
- **PWA Support**

### Backend
- **Node.js + Express**
- **MongoDB**
- **JWT Authentication**
- **RESTful API**

### DevOps
- **GitHub Actions** (CI/CD)
- **Render** (Deployment)
- **Automated Testing**
- **Security Scanning**

## 🔄 CI/CD Pipeline

### Continuous Integration (CI)
Her push ve PR'da otomatik olarak:
- ✅ Kod kalitesi kontrolü (ESLint)
- ✅ Güvenlik taraması (npm audit, TruffleHog)
- ✅ Unit ve integration testleri
- ✅ Frontend validasyonu
- ✅ Build kontrolü

### Continuous Deployment (CD)
Main branch'e merge sonrası otomatik olarak:
- ✅ Render'a deployment
- ✅ Health check testleri
- ✅ Smoke testleri
- ✅ Deployment bildirimleri

## 🚀 Kurulum

### Gereksinimler
- Node.js 18.x veya üzeri
- MongoDB
- npm veya yarn

### Backend Kurulumu

```bash
cd server
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm start
```

### Frontend Çalıştırma

```bash
# Doğrudan HTML dosyalarını bir web server ile serve edin
# Örnek: Live Server (VS Code Extension)
# veya
npx http-server . -p 8080
```

## 📦 Proje Yapısı

```
isbul/
├── .github/
│   └── workflows/          # GitHub Actions workflow'ları
│       ├── ci.yml          # CI pipeline
│       ├── cd.yml          # CD pipeline
│       ├── pr-check.yml    # PR kontrolleri
│       └── scheduled.yml   # Zamanlanmış görevler
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   ├── tests/
│   └── package.json
├── assets/                 # Frontend statik dosyaları
│   ├── css/
│   ├── js/
│   └── img/
├── components/             # Yeniden kullanılabilir bileşenler
└── *.html                  # Frontend sayfaları
```

## 🔐 Güvenlik

- JWT token bazlı authentication
- Rate limiting
- CORS yapılandırması
- Input validasyonu
- SQL injection koruması
- XSS koruması
- Otomatik güvenlik taramaları (CI/CD)

## 🧪 Testing

```bash
# Backend testleri
cd server
npm test

# Test coverage
npm run test:coverage
```

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Kullanıcı kaydı
- `POST /api/v1/auth/login` - Giriş
- `POST /api/v1/auth/logout` - Çıkış
- `GET /api/v1/auth/me` - Profil

### Users
- `GET /api/v1/users` - Kullanıcı listesi
- `GET /api/v1/users/:id` - Kullanıcı detayı
- `PUT /api/v1/users/:id` - Kullanıcı güncelleme

### Experts
- `GET /api/v1/experts` - Uzman listesi
- `GET /api/v1/experts/:id` - Uzman detayı
- `POST /api/v1/experts` - Uzman başvurusu

### Bookings
- `POST /api/v1/bookings` - Randevu oluştur
- `GET /api/v1/bookings` - Randevular
- `PUT /api/v1/bookings/:id` - Randevu güncelle

Tam API dökümantasyonu için: [API Docs](https://isbul-backend.onrender.com/api/docs)

## 🤝 Katkıda Bulunma

1. Bu repo'yu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: amazing feature eklendi'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Commit Mesaj Formatı

```
<type>(<scope>): <subject>

<body>
```

**Type'lar:**
- `feat`: Yeni özellik
- `fix`: Bug düzeltme
- `docs`: Dökümantasyon
- `style`: Kod formatı
- `refactor`: Refactoring
- `test`: Test ekleme
- `chore`: Build, CI/CD

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

## 👥 İletişim

- **GitHub:** [@Umit-dedeoglu](https://github.com/Umit-dedeoglu)
- **Repository:** [IsBul](https://github.com/Umit-dedeoglu/IsBul)

## 🙏 Teşekkürler

İşBul platformunu kullandığınız için teşekkürler!

---

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**
