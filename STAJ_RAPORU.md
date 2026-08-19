# İŞBUL PLATFORMU
## Bilgisayar Mühendisliği Staj Raporu

---

**Stajyer Adı:** [Adınız Soyadınız]  
**Öğrenci No:** [Öğrenci Numaranız]  
**Bölüm:** Bilgisayar Mühendisliği  
**Üniversite:** [Üniversite Adı]  
**Staj Dönemi:** Ağustos 2026  
**Proje Adı:** İşBul - Freelance İş Eşleştirme Platformu  
**Domain:** isbul.online  
**GitHub Repository:** https://github.com/Umit-dedeoglu/IsBul

---

## İÇİNDEKİLER

1. [Giriş ve Özet](#1-giriş-ve-özet)
2. [Proje Tanımı ve Amacı](#2-proje-tanımı-ve-amacı)
3. [Kullanılan Teknolojiler](#3-kullanılan-teknolojiler)
4. [Sistem Mimarisi](#4-sistem-mimarisi)
5. [Web Uygulaması Geliştirme](#5-web-uygulaması-geliştirme)
6. [Mobil Uygulama Geliştirme](#6-mobil-uygulama-geliştirme)
7. [Backend ve API Geliştirme](#7-backend-ve-api-geliştirme)
8. [Mikroservis Mimarisi](#8-mikroservis-mimarisi)
9. [Veritabanı Tasarımı](#9-veritabanı-tasarımı)
10. [Kimlik Doğrulama ve Güvenlik](#10-kimlik-doğrulama-ve-güvenlik)
11. [Domain Yönetimi](#11-domain-yönetimi)
12. [AWS Altyapısı ve Deployment](#12-aws-altyapısı-ve-deployment)
13. [Kubernetes Orchestration](#13-kubernetes-orchestration)
14. [CI/CD Pipeline](#14-cicd-pipeline)
15. [Monitoring ve Observability](#15-monitoring-ve-observability)
16. [SSL/TLS Sertifika Yönetimi](#16-ssltls-sertifika-yönetimi)
17. [Progressive Web App (PWA)](#17-progressive-web-app-pwa)
18. [Karşılaşılan Zorluklar ve Çözümler](#18-karşılaşılan-zorluklar-ve-çözümler)
19. [Gelecek Geliştirmeler](#19-gelecek-geliştirmeler)
20. [Sonuç ve Kazanımlar](#20-sonuç-ve-kazanımlar)

---

## 1. GİRİŞ VE ÖZET

### 1.1 Staj Kapsamı

Bu staj sürecinde, modern web teknolojileri ve bulut altyapısı kullanılarak tam kapsamlı bir freelance iş eşleştirme platformu geliştirilmiştir. Proje, günümüz yazılım geliştirme pratiklerini (DevOps, mikroservis mimarisi, containerization) ve endüstri standartlarını içermektedir.

### 1.2 Proje Özeti

**İşBul**, müşteriler ile freelance uzmanları buluşturan, modern ve ölçeklenebilir bir platformdur. Platform üç ana bileşenden oluşmaktadır:
- **Web Uygulaması (PWA):** Responsive, mobil uyumlu web arayüzü
- **Mobil Uygulama (Flutter):** Native performanslı cross-platform mobil uygulama
- **Backend API (Node.js):** RESTful mikroservis mimarisi

### 1.3 Teknik Kazanımlar

Bu staj sürecinde aşağıdaki teknik yetkinlikler kazanılmıştır:
- Modern web teknolojileri (HTML5, CSS3, JavaScript)
- Flutter ile cross-platform mobil uygulama geliştirme
- RESTful API tasarımı ve implementasyonu
- Mikroservis mimarisi ve container teknolojileri
- AWS bulut altyapısı yönetimi
- Kubernetes ile container orchestration
- CI/CD pipeline kurulumu ve yönetimi
- Monitoring ve observability (Prometheus, Grafana)
- OAuth 2.0 ve JWT tabanlı kimlik doğrulama
- SSL/TLS sertifika yönetimi ve otomasyonu
- Domain yönetimi ve DNS konfigürasyonu

---

## 2. PROJE TANIMI VE AMACI

### 2.1 Problem Tanımı

Günümüzde freelance ekonomisi hızla büyümekte ve müşteriler ile uzmanları buluşturan güvenilir platformlara ihtiyaç artmaktadır. Mevcut platformların çoğu karmaşık, yavaş ve kullanıcı dostu değildir.

### 2.2 Çözüm Yaklaşımı

İşBul, aşağıdaki prensiplerle geliştirilmiştir:
- **Hız ve Performans:** Modern web teknolojileri ve CDN kullanımı
- **Güvenilirlik:** Yüksek erişilebilirlik (%99.9 uptime hedefi)
- **Ölçeklenebilirlik:** Mikroservis mimarisi ve Kubernetes orchestration
- **Kullanıcı Deneyimi:** Responsive tasarım ve PWA desteği
- **Güvenlik:** SSL/TLS, OAuth 2.0, JWT token sistemi

### 2.3 Hedef Kullanıcılar

1. **Müşteriler:** İş ilanı yayınlayan, uzman arayan kullanıcılar
2. **Uzmanlar:** Freelance çalışan, iş talep eden profesyoneller
3. **Yöneticiler:** Platformu yöneten, içerik denetleyen admin kullanıcılar

### 2.4 Ana Özellikler

#### Müşteri Özellikleri:
- Hesap oluşturma ve profil yönetimi
- İş ilanı oluşturma ve yönetimi
- Uzman arama ve filtreleme
- Teklif alma ve değerlendirme
- Mesajlaşma sistemi
- Ödeme entegrasyonu

#### Uzman Özellikleri:
- Uzman profili oluşturma
- Portfolyo yönetimi
- İş ilanlarını görüntüleme
- Teklif gönderme
- Değerlendirme ve yorum sistemi
- Kazanç takibi

#### Admin Özellikleri:
- Kullanıcı yönetimi
- İçerik moderasyonu
- Uzman onaylama sistemi
- Platform istatistikleri
- Şikayet yönetimi

---

## 3. KULLANILAN TEKNOLOJİLER

### 3.1 Frontend Teknolojileri

#### Web Uygulaması:
- **HTML5:** Semantik markup, accessibility standartları
- **CSS3:** Modern layout (Flexbox, Grid), animations, transitions
- **JavaScript (ES6+):** Vanilla JS, async/await, modules
- **PWA Technologies:** Service Workers, Web App Manifest, Cache API
- **Responsive Design:** Mobile-first approach, media queries

#### Mobil Uygulama:
- **Flutter 3.x:** Cross-platform framework (Dart language)
- **Provider:** State management
- **HTTP Package:** API iletişimi
- **Shared Preferences:** Local storage
- **Material Design:** UI/UX component library

### 3.2 Backend Teknolojileri

- **Node.js 18.x:** JavaScript runtime
- **Express.js:** Web framework
- **MongoDB:** NoSQL veritabanı
- **Mongoose:** ODM (Object Document Mapper)
- **Redis:** Caching ve session yönetimi
- **JWT (jsonwebtoken):** Token-based authentication
- **bcrypt:** Password hashing
- **multer:** File upload handling
- **cors:** Cross-Origin Resource Sharing
- **helmet:** Security headers

### 3.3 Cloud ve Infrastructure

#### AWS Services:
- **EC2:** Virtual server hosting
- **S3:** Object storage (images, files)
- **RDS:** Managed database service (PostgreSQL backup)
- **CloudFront:** CDN for static assets
- **Route 53:** DNS management
- **ELB (Elastic Load Balancer):** Load distribution
- **CloudWatch:** Monitoring ve logging
- **IAM:** Identity and Access Management
- **VPC:** Network isolation

### 3.4 Container ve Orchestration

- **Docker:** Container runtime
- **Kubernetes (K8s):** Container orchestration
- **kubectl:** K8s CLI tool
- **Helm:** Kubernetes package manager
- **Docker Compose:** Local development environment

### 3.5 CI/CD ve DevOps

- **GitHub Actions:** CI/CD pipeline
- **Git:** Version control
- **GitHub:** Code repository
- **Docker Hub:** Container registry
- **AWS CodeDeploy:** Deployment automation

### 3.6 Monitoring ve Observability

- **Prometheus:** Metrics collection ve storage
- **Grafana:** Data visualization ve dashboards
- **AlertManager:** Alert routing ve management
- **Node Exporter:** Hardware ve OS metrics
- **kube-state-metrics:** Kubernetes cluster metrics

### 3.7 Security

- **Let's Encrypt:** SSL/TLS certificates
- **Cert-Manager:** Kubernetes certificate automation
- **OAuth 2.0:** Google authentication
- **JWT:** Secure token-based auth
- **bcrypt:** Password encryption
- **Helmet.js:** HTTP security headers
- **Rate Limiting:** API abuse prevention

### 3.8 Development Tools

- **Visual Studio Code:** Code editor
- **Postman:** API testing
- **MongoDB Compass:** Database GUI
- **Git Bash:** Terminal
- **Chrome DevTools:** Web debugging
- **Flutter DevTools:** Mobile debugging

---

## 4. SİSTEM MİMARİSİ

### 4.1 Genel Mimari

İşBul platformu, mikroservis mimarisine dayanan modern bir yapıya sahiptir:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
├─────────────────────────────────────────────────────────┤
│  Web Browser (PWA)  │  Mobile App (Flutter/iOS/Android) │
└────────────┬────────────────────────┬───────────────────┘
             │                        │
             └────────────┬───────────┘
                          │
             ┌────────────▼──────────────┐
             │   CloudFront CDN          │
             │   (Static Assets)         │
             └────────────┬──────────────┘
                          │
             ┌────────────▼──────────────┐
             │  AWS Route 53 (DNS)       │
             │  isbul.online             │
             └────────────┬──────────────┘
                          │
             ┌────────────▼──────────────┐
             │  Application Load         │
             │  Balancer (ELB)           │
             └────────────┬──────────────┘
                          │
        ┌─────────────────┴──────────────────┐
        │                                    │
┌───────▼────────┐               ┌──────────▼────────┐
│  Kubernetes    │               │  Kubernetes       │
│  Cluster       │               │  Cluster          │
│  (Production)  │               │  (Staging)        │
└───────┬────────┘               └──────────┬────────┘
        │                                   │
    ┌───▼───────────────────────────────────▼───┐
    │         MICROSERVICES LAYER               │
    ├───────────────────────────────────────────┤
    │  • Auth Service      • User Service       │
    │  • Expert Service    • Job Service        │
    │  • Message Service   • Payment Service    │
    │  • Notification Svc  • File Service       │
    └───────────────────┬───────────────────────┘
                        │
        ┌───────────────┴────────────────┐
        │                                │
┌───────▼────────┐           ┌──────────▼────────┐
│  MongoDB       │           │  Redis Cache      │
│  Replica Set   │           │  Session Store    │
└────────────────┘           └───────────────────┘
        │
┌───────▼────────┐
│  AWS S3        │
│  File Storage  │
└────────────────┘

┌─────────────────────────────────────────────┐
│         MONITORING LAYER                    │
├─────────────────────────────────────────────┤
│  Prometheus → Grafana → AlertManager        │
└─────────────────────────────────────────────┘
```

### 4.2 Mikroservis Bileşenleri

#### 4.2.1 Auth Service
- Kullanıcı kaydı ve girişi
- JWT token yönetimi
- OAuth 2.0 entegrasyonu (Google)
- Password reset işlemleri
- Session yönetimi

#### 4.2.2 User Service
- Kullanıcı profil yönetimi
- Profil güncellemeleri
- Avatar upload
- Kullanıcı arama

#### 4.2.3 Expert Service
- Uzman profil yönetimi
- Portfolyo işlemleri
- Uzman onaylama workflow
- Rating ve review sistemi
- Kategori yönetimi

#### 4.2.4 Job Service
- İş ilanı CRUD işlemleri
- İş arama ve filtreleme
- Teklif yönetimi
- İş durumu takibi

#### 4.2.5 Message Service
- Anlık mesajlaşma
- WebSocket connection
- Mesaj geçmişi
- Bildirim tetikleme

#### 4.2.6 Payment Service
- Ödeme işlemleri
- Stripe/PayPal entegrasyonu
- Transaction history
- Fatura oluşturma

#### 4.2.7 Notification Service
- Push notifications
- Email notifications
- SMS entegrasyonu (gelecek)
- Notification preferences

#### 4.2.8 File Service
- File upload/download
- Image processing
- S3 bucket yönetimi
- CDN integration

### 4.3 Veri Akışı

1. **Request Flow:**
   - Client → CloudFront (static assets)
   - Client → Load Balancer → K8s Ingress → Service → Pod
   - Service → Database/Cache
   - Response ← Pod ← Service ← Ingress ← Load Balancer ← Client

2. **Authentication Flow:**
   - Login request → Auth Service
   - Verify credentials → MongoDB
   - Generate JWT → Return token
   - Subsequent requests → Verify JWT → Access resource

3. **File Upload Flow:**
   - Client → Upload request → File Service
   - Validate file → Process (resize, compress)
   - Upload to S3 → Return CDN URL
   - Store metadata → MongoDB

---

## 5. WEB UYGULAMASI GELİŞTİRME

### 5.1 Sayfa Yapısı

Platform, 22 ana sayfadan oluşmaktadır:

#### 5.1.1 Genel Sayfalar:
- **index.html:** Ana sayfa, hero section, özellikler
- **hakkimizda.html:** Şirket tanıtımı, misyon, vizyon
- **nasil-calisir.html:** Platform kullanım rehberi
- **hizmetler.html:** Sunulan hizmetler
- **blog.html:** Blog yazıları, içerik pazarlama
- **uzmanlar.html:** Uzman listesi ve filtreleme

#### 5.1.2 Kullanıcı İşlemleri:
- **create-account.html:** Kayıt formu
- **login.html:** Giriş sayfası (Email + Google OAuth)
- **forgot-password.html:** Şifre sıfırlama talebi
- **reset-password.html:** Yeni şifre belirleme
- **oauth-callback.html:** Google OAuth callback handler

#### 5.1.3 Kullanıcı Paneli:
- **profil.html:** Kullanıcı profil yönetimi
- **quick-setup.html:** Hızlı profil kurulumu

#### 5.1.4 Uzman İşlemleri:
- **uzman-ol.html:** Uzman başvuru formu
- **make-expert.html:** Uzman profil oluşturma
- **uzman-profil.html:** Uzman detay sayfası
- **uzman-panel.html:** Uzman dashboard
- **activate-expert.html:** Uzman onaylama sayfası

#### 5.1.5 Admin:
- **admin-panel.html:** Admin dashboard, kullanıcı yönetimi

#### 5.1.6 OAuth Setup:
- **google-setup.html:** Google OAuth yapılandırma rehberi

#### 5.1.7 Yasal:
- **gizlilik.html:** Gizlilik politikası
- **kvkk.html:** KVKK metni
- **sartlar.html:** Kullanım şartları

### 5.2 Frontend Mimarisi

#### 5.2.1 Dosya Yapısı:
```
isbul/
├── assets/
│   ├── css/
│   │   ├── styles.css          # Ana stil dosyası
│   │   ├── chatbot.css         # Chatbot stilleri
│   │   └── mobile.css          # Mobil responsive
│   ├── js/
│   │   ├── app.js              # Ana uygulama logic
│   │   ├── api-client.js       # API wrapper
│   │   ├── data.js             # Static data
│   │   ├── analytics.js        # Analytics tracking
│   │   └── chatbot.js          # Chatbot functionality
│   └── img/                    # Görseller
├── *.html                      # 22 HTML sayfası
├── manifest.json               # PWA manifest
├── sw.js                       # Service Worker
└── pwa.js                      # PWA install handler
```

### 5.3 CSS Mimarisi

#### 5.3.1 Tasarım Sistemi:
```css
:root {
  /* Color Palette */
  --primary-color: #4A90E2;
  --secondary-color: #50E3C2;
  --accent-color: #F5A623;
  --dark-bg: #1a1a2e;
  --light-bg: #f8f9fa;
  
  /* Typography */
  --font-primary: 'Inter', 'Segoe UI', sans-serif;
  --font-heading: 'Poppins', sans-serif;
  
  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  
  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 20px rgba(0,0,0,0.15);
}
```

#### 5.3.2 Layout Teknikler:
- **Flexbox:** Navigation, card layouts
- **CSS Grid:** Gallery views, dashboard layouts
- **Media Queries:** Breakpoints (576px, 768px, 992px, 1200px)
- **CSS Variables:** Dynamic theming
- **Animations:** Smooth transitions, hover effects

### 5.4 JavaScript Mimarisi

#### 5.4.1 API Client (api-client.js):
```javascript
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }
  
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
  }
  
  // CRUD methods
  get(endpoint) { return this.request(endpoint); }
  post(endpoint, data) { /* ... */ }
  put(endpoint, data) { /* ... */ }
  delete(endpoint) { /* ... */ }
}
```

#### 5.4.2 State Management:
- LocalStorage: Token, user preferences
- SessionStorage: Temporary data
- In-memory: Runtime state

#### 5.4.3 Event Handling:
- Form validation
- Dynamic content loading
- Real-time search
- Infinite scroll

### 5.5 Responsive Design

#### 5.5.1 Mobile-First Approach:
```css
/* Mobile (default) */
.container { padding: 1rem; }

/* Tablet */
@media (min-width: 768px) {
  .container { padding: 2rem; }
}

/* Desktop */
@media (min-width: 1200px) {
  .container { max-width: 1140px; }
}
```

#### 5.5.2 Touch Optimizations:
- Minimum touch target: 44x44px
- Swipe gestures
- Pull-to-refresh
- Bottom navigation bar (mobile)

---

## 6. MOBİL UYGULAMA GELİŞTİRME

### 6.1 Flutter Proje Yapısı

```
flutter_app/
├── lib/
│   ├── main.dart                    # Entry point
│   ├── models/
│   │   ├── user_model.dart         # User data model
│   │   └── expert_model.dart       # Expert data model
│   ├── services/
│   │   ├── api_client.dart         # HTTP client
│   │   ├── auth_service.dart       # Authentication
│   │   └── expert_service.dart     # Expert operations
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── login_screen.dart
│   │   │   └── register_screen.dart
│   │   ├── home/
│   │   │   └── home_screen.dart
│   │   ├── experts/
│   │   │   ├── experts_screen.dart
│   │   │   └── expert_detail_screen.dart
│   │   └── profile/
│   │       └── profile_screen.dart
│   ├── theme/
│   │   └── app_theme.dart          # Theme configuration
│   └── widgets/
│       └── app_widgets.dart        # Reusable components
├── android/
│   └── app/
│       ├── build.gradle
│       └── src/main/
│           ├── AndroidManifest.xml
│           └── res/
└── pubspec.yaml                    # Dependencies
```

### 6.2 Temel Bağımlılıklar (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  provider: ^6.0.5
  
  # HTTP & API
  http: ^1.1.0
  dio: ^5.3.2
  
  # Local Storage
  shared_preferences: ^2.2.1
  
  # UI Components
  cached_network_image: ^3.3.0
  flutter_spinkit: ^5.2.0
  shimmer: ^3.0.0
  
  # Navigation
  go_router: ^12.0.0
  
  # Utils
  intl: ^0.18.1
  url_launcher: ^6.1.14
```

### 6.3 Tema ve Tasarım

#### 6.3.1 Color Palette:
```dart
class AppColors {
  static const primary = Color(0xFF4A90E2);
  static const secondary = Color(0xFF50E3C2);
  static const accent = Color(0xFFF5A623);
  static const dark = Color(0xFF1A1A2E);
  static const success = Color(0xFF4CAF50);
  static const error = Color(0xFFF44336);
  
  // Gradients
  static const primaryGradient = LinearGradient(
    colors: [Color(0xFF4A90E2), Color(0xFF357ABD)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
```

#### 6.3.2 Typography:
```dart
TextTheme(
  displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
  displayMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
  headlineMedium: TextStyle(fontSize: 24, fontWeight: FontWeight.w600),
  bodyLarge: TextStyle(fontSize: 16, height: 1.5),
  bodyMedium: TextStyle(fontSize: 14, height: 1.4),
)
```

### 6.4 Ekranlar ve İşlevsellik

#### 6.4.1 Splash Screen:
- Animasyonlu logo
- API health check
- Auto-login (token validation)
- 2 saniyelik minimum gösterim

#### 6.4.2 Login Screen:
```dart
Features:
- Email/Password girişi
- Google OAuth button
- Remember me checkbox
- Password visibility toggle
- Form validation
- Loading states
- Error handling
```

#### 6.4.3 Register Screen:
```dart
Features:
- Multi-step form (Personal Info → Preferences)
- Email validation
- Password strength indicator
- Terms acceptance
- Profile picture upload
- Success animation
```

#### 6.4.4 Home Screen:
```dart
Features:
- Search bar
- Category chips
- Featured experts carousel
- Recent jobs list
- Bottom navigation bar
- Pull-to-refresh
```

#### 6.4.5 Experts Screen:
```dart
Features:
- Grid/List view toggle
- Advanced filters (category, rating, price)
- Sort options (popularity, rating, price)
- Infinite scroll pagination
- Search functionality
- Expert card preview
```

#### 6.4.6 Expert Detail Screen:
```dart
Features:
- Hero image animation
- About section
- Skills & services
- Portfolio gallery
- Reviews & ratings
- Contact button
- Share functionality
```

#### 6.4.7 Profile Screen:
```dart
Features:
- Profile picture with upload
- Personal information display
- Edit profile
- My jobs section
- Settings
- Logout
```

### 6.5 State Management (Provider)

```dart
// Auth Provider
class AuthProvider extends ChangeNotifier {
  User? _user;
  String? _token;
  bool _isLoading = false;
  
  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final response = await AuthService.login(email, password);
      _user = response.user;
      _token = response.token;
      await _saveToken(_token);
      notifyListeners();
    } catch (e) {
      throw e;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}

// Usage
Provider.of<AuthProvider>(context, listen: false).login(email, password);
```

### 6.6 API İletişimi

```dart
class ApiClient {
  static const baseUrl = 'https://isbul.online/api';
  final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: Duration(seconds: 10),
    receiveTimeout: Duration(seconds: 10),
  ));
  
  ApiClient() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        // Global error handling
        return handler.next(error);
      },
    ));
  }
  
  Future<Response> get(String path) => _dio.get(path);
  Future<Response> post(String path, dynamic data) => _dio.post(path, data: data);
}
```

### 6.7 Android Konfigürasyonu

#### AndroidManifest.xml:
```xml
<manifest>
  <uses-permission android:name="android.permission.INTERNET"/>
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
  
  <application
    android:label="İşBul"
    android:icon="@mipmap/ic_launcher"
    android:usesCleartextTraffic="true">
    
    <meta-data
      android:name="com.google.android.geo.API_KEY"
      android:value="YOUR_API_KEY"/>
  </application>
</manifest>
```

#### build.gradle:
```gradle
android {
  compileSdkVersion 33
  
  defaultConfig {
    applicationId "com.isbul.app"
    minSdkVersion 21
    targetSdkVersion 33
    versionCode 1
    versionName "1.0.0"
  }
}
```

### 6.8 Network Security

```xml
<!-- network_security_config.xml -->
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">isbul.online</domain>
    <domain includeSubdomains="true">localhost</domain>
  </domain-config>
</network-security-config>
```

---

## 7. BACKEND VE API GELİŞTİRME

### 7.1 Backend Mimarisi

```
server/
├── src/
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   ├── redis.js            # Redis configuration
│   │   └── aws.js              # AWS SDK config
│   ├── models/
│   │   ├── User.js
│   │   ├── Expert.js
│   │   ├── Job.js
│   │   ├── Review.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── expert.routes.js
│   │   ├── job.routes.js
│   │   └── payment.routes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── expertController.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── upload.middleware.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── smsService.js
│   │   ├── storageService.js
│   │   └── paymentService.js
│   ├── utils/
│   │   ├── jwt.util.js
│   │   ├── encryption.util.js
│   │   └── validator.util.js
│   └── app.js
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
└── Dockerfile
```

### 7.2 API Endpoints

#### 7.2.1 Authentication API:
```javascript
POST   /api/auth/register          # Kullanıcı kaydı
POST   /api/auth/login             # Giriş
POST   /api/auth/google            # Google OAuth
POST   /api/auth/refresh-token     # Token yenileme
POST   /api/auth/forgot-password   # Şifre sıfırlama talebi
POST   /api/auth/reset-password    # Şifre sıfırlama
POST   /api/auth/logout            # Çıkış
GET    /api/auth/verify-email      # Email doğrulama
```

#### 7.2.2 User API:
```javascript
GET    /api/users/me               # Profil bilgisi
PUT    /api/users/me               # Profil güncelleme
POST   /api/users/avatar           # Avatar upload
GET    /api/users/:id              # Kullanıcı detay
DELETE /api/users/me               # Hesap silme
```

#### 7.2.3 Expert API:
```javascript
GET    /api/experts                # Uzman listesi
GET    /api/experts/:id            # Uzman detay
POST   /api/experts                # Uzman başvurusu
PUT    /api/experts/:id            # Uzman güncelleme
POST   /api/experts/:id/portfolio  # Portfolyo ekleme
GET    /api/experts/search         # Uzman arama
POST   /api/experts/:id/review     # Değerlendirme
```

#### 7.2.4 Job API:
```javascript
GET    /api/jobs                   # İş ilanları
GET    /api/jobs/:id               # İş detay
POST   /api/jobs                   # İş ilanı oluştur
PUT    /api/jobs/:id               # İş güncelleme
DELETE /api/jobs/:id               # İş silme
POST   /api/jobs/:id/apply         # Başvuru yap
GET    /api/jobs/my-jobs           # Kullanıcının işleri
```

#### 7.2.5 Message API:
```javascript
GET    /api/messages               # Mesaj listesi
POST   /api/messages               # Mesaj gönder
GET    /api/messages/:id           # Konuşma detay
PUT    /api/messages/:id/read      # Okundu işaretle
DELETE /api/messages/:id           # Mesaj sil
```

#### 7.2.6 Payment API:
```javascript
POST   /api/payments/checkout      # Ödeme başlat
POST   /api/payments/webhook       # Stripe webhook
GET    /api/payments/history       # Ödeme geçmişi
GET    /api/payments/invoice/:id   # Fatura indir
```

### 7.3 Database Modelleri

#### 7.3.1 User Model:
```javascript
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() { return !this.googleId; }
  },
  googleId: String,
  name: {
    type: String,
    required: true
  },
  avatar: String,
  phone: String,
  role: {
    type: String,
    enum: ['user', 'expert', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
```

#### 7.3.2 Expert Model:
```javascript
const ExpertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  skills: [String],
  categories: [{
    type: String,
    enum: ['web', 'mobile', 'design', 'writing', 'marketing', 'other']
  }],
  hourlyRate: {
    type: Number,
    min: 0
  },
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends'],
    default: 'part-time'
  },
  portfolio: [{
    title: String,
    description: String,
    images: [String],
    link: String
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});
```

### 7.4 Middleware

#### 7.4.1 Authentication Middleware:
```javascript
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
```

#### 7.4.2 Rate Limiting:
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
});
```

#### 7.4.3 Validation Middleware:
```javascript
const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('name').trim().isLength({ min: 2, max: 50 }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

### 7.5 Services

#### 7.5.1 Email Service:
```javascript
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    
    await this.transporter.sendMail({
      from: '"İşBul" <noreply@isbul.online>',
      to: email,
      subject: 'Email Adresinizi Doğrulayın',
      html: `
        <h1>Hoş Geldiniz!</h1>
        <p>Email adresinizi doğrulamak için aşağıdaki linke tıklayın:</p>
        <a href="${verificationUrl}">Email Doğrula</a>
      `
    });
  }
  
  async sendPasswordReset(email, resetToken) { /* ... */ }
  async sendWelcomeEmail(email, name) { /* ... */ }
}
```

#### 7.5.2 Storage Service (S3):
```javascript
const AWS = require('aws-sdk');

class StorageService {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION
    });
    this.bucket = process.env.S3_BUCKET;
  }
  
  async uploadFile(file, folder = 'uploads') {
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    
    const params = {
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };
    
    const result = await this.s3.upload(params).promise();
    return result.Location;
  }
  
  async deleteFile(fileUrl) { /* ... */ }
}
```

---

## 8. MİKROSERVİS MİMARİSİ

### 8.1 Mikroservis Prensipleri

İşBul platformunda mikroservis mimarisi aşağıdaki prensiplere göre tasarlanmıştır:

#### 8.1.1 Single Responsibility:
Her servis tek bir iş domain'inden sorumludur.
- Auth Service → Kimlik doğrulama
- Expert Service → Uzman yönetimi
- Job Service → İş ilanları
- Payment Service → Ödeme işlemleri

#### 8.1.2 Loose Coupling:
Servisler birbirinden bağımsız çalışır ve deploy edilebilir.

#### 8.1.3 High Cohesion:
İlgili fonksiyonlar aynı serviste toplanır.

#### 8.1.4 Autonomous:
Her servis kendi veritabanına sahiptir (Database per Service pattern).

### 8.2 Servis İletişimi

#### 8.2.1 Synchronous (REST API):
```javascript
// Service-to-Service HTTP Request
const axios = require('axios');

class ServiceClient {
  async getUserDetails(userId) {
    try {
      const response = await axios.get(
        `${process.env.USER_SERVICE_URL}/users/${userId}`,
        {
          headers: {
            'X-Service-Token': process.env.SERVICE_SECRET
          }
        }
      );
      return response.data;
    } catch (error) {
      // Fallback or circuit breaker logic
      return null;
    }
  }
}
```

#### 8.2.2 Asynchronous (Message Queue - RabbitMQ/Kafka):
```javascript
// Publisher (Job Service)
const amqp = require('amqplib');

async function publishJobCreated(jobData) {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  
  await channel.assertQueue('job.created');
  channel.sendToQueue('job.created', Buffer.from(JSON.stringify(jobData)));
  
  console.log('Job created event published');
}

// Consumer (Notification Service)
async function consumeJobCreated() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  
  await channel.assertQueue('job.created');
  channel.consume('job.created', (msg) => {
    const jobData = JSON.parse(msg.content.toString());
    // Send notification to experts
    notifyExperts(jobData);
    channel.ack(msg);
  });
}
```

### 8.3 API Gateway Pattern

```javascript
// API Gateway (Express)
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Route to Auth Service
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/auth' }
}));

// Route to Expert Service
app.use('/api/experts', createProxyMiddleware({
  target: process.env.EXPERT_SERVICE_URL,
  changeOrigin: true
}));

// Rate limiting, authentication at gateway level
app.use(rateLimitMiddleware);
app.use(authMiddleware);
```

### 8.4 Service Discovery

```yaml
# Kubernetes Service Discovery
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  labels:
    app: auth
spec:
  selector:
    app: auth
  ports:
  - port: 8080
    targetPort: 8080
  type: ClusterIP

---
# Services iletişim:
# http://auth-service:8080
# http://expert-service:8080
# DNS-based discovery (K8s internal)
```

### 8.5 Circuit Breaker Pattern

```javascript
const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
};

const breaker = new CircuitBreaker(async (userId) => {
  return await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
}, options);

breaker.fallback(() => {
  return { id: userId, name: 'Unknown', cached: true };
});

breaker.on('open', () => {
  console.log('Circuit breaker opened - too many failures');
});
```

### 8.6 Distributed Tracing

```javascript
// OpenTelemetry Integration
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

const provider = new NodeTracerProvider();
provider.register();

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
  ],
});

// Jaeger Exporter
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const exporter = new JaegerExporter({
  serviceName: 'expert-service',
  endpoint: 'http://jaeger:14268/api/traces',
});
```

### 8.7 Database per Service

```javascript
// Auth Service - PostgreSQL
const authDB = new Pool({
  host: process.env.AUTH_DB_HOST,
  database: 'auth_db',
  user: process.env.DB_USER,
  password: process.env.DB_PASS
});

// Expert Service - MongoDB
const expertDB = mongoose.connect(process.env.EXPERT_MONGODB_URI);

// Message Service - Redis (cache + realtime)
const messageCache = redis.createClient({
  url: process.env.REDIS_URL
});
```

### 8.8 Event Sourcing (Gelecek)

```javascript
// Event Store
const events = [
  {
    type: 'ExpertCreated',
    aggregateId: 'expert-123',
    data: { name: 'John', skills: ['React'] },
    timestamp: '2026-08-18T10:00:00Z'
  },
  {
    type: 'ExpertSkillAdded',
    aggregateId: 'expert-123',
    data: { skill: 'Node.js' },
    timestamp: '2026-08-18T11:00:00Z'
  }
];

// Replay events to rebuild state
function rebuildExpertState(expertId) {
  const expertEvents = events.filter(e => e.aggregateId === expertId);
  let expert = {};
  
  expertEvents.forEach(event => {
    switch(event.type) {
      case 'ExpertCreated':
        expert = event.data;
        break;
      case 'ExpertSkillAdded':
        expert.skills.push(event.data.skill);
        break;
    }
  });
  
  return expert;
}
```

---

## 9. VERİTABANI TASARIMI

### 9.1 MongoDB Koleksiyonları

#### 9.1.1 Users Collection:
```json
{
  "_id": ObjectId("64f2a1b3c4d5e6f7a8b9c0d1"),
  "email": "john@example.com",
  "password": "$2b$12$hashed_password",
  "googleId": null,
  "name": "John Doe",
  "avatar": "https://cdn.isbul.online/avatars/john.jpg",
  "phone": "+90555123456",
  "role": "user",
  "isVerified": true,
  "isActive": true,
  "lastLogin": "2026-08-18T10:30:00Z",
  "createdAt": "2026-08-01T08:00:00Z",
  "updatedAt": "2026-08-18T10:30:00Z"
}
```

#### 9.1.2 Experts Collection:
```json
{
  "_id": ObjectId("64f2a1b3c4d5e6f7a8b9c0d2"),
  "userId": ObjectId("64f2a1b3c4d5e6f7a8b9c0d1"),
  "title": "Full-Stack Developer",
  "bio": "Experienced developer with 5+ years...",
  "skills": ["React", "Node.js", "MongoDB", "AWS"],
  "categories": ["web", "mobile"],
  "hourlyRate": 150,
  "availability": "full-time",
  "portfolio": [
    {
      "title": "E-commerce Platform",
      "description": "Built a scalable...",
      "images": ["url1", "url2"],
      "link": "https://example.com"
    }
  ],
  "rating": {
    "average": 4.8,
    "count": 42
  },
  "completedJobs": 38,
  "status": "approved",
  "approvedAt": "2026-08-05T12:00:00Z",
  "createdAt": "2026-08-05T10:00:00Z"
}
```

#### 9.1.3 Jobs Collection:
```json
{
  "_id": ObjectId("64f2a1b3c4d5e6f7a8b9c0d3"),
  "title": "Build a Mobile App",
  "description": "Need an experienced Flutter developer...",
  "category": "mobile",
  "budget": {
    "min": 5000,
    "max": 10000,
    "currency": "TRY"
  },
  "duration": "2 months",
  "skills": ["Flutter", "Firebase", "REST API"],
  "clientId": ObjectId("64f2a1b3c4d5e6f7a8b9c0d1"),
  "status": "open",
  "applications": [
    {
      "expertId": ObjectId("64f2a1b3c4d5e6f7a8b9c0d2"),
      "proposal": "I can deliver this project...",
      "proposedBudget": 8000,
      "estimatedDuration": "6 weeks",
      "status": "pending",
      "appliedAt": "2026-08-18T09:00:00Z"
    }
  ],
  "assignedTo": null,
  "postedAt": "2026-08-17T14:00:00Z",
  "deadline": "2026-10-17T14:00:00Z"
}
```

#### 9.1.4 Reviews Collection:
```json
{
  "_id": ObjectId("64f2a1b3c4d5e6f7a8b9c0d4"),
  "expertId": ObjectId("64f2a1b3c4d5e6f7a8b9c0d2"),
  "clientId": ObjectId("64f2a1b3c4d5e6f7a8b9c0d1"),
  "jobId": ObjectId("64f2a1b3c4d5e6f7a8b9c0d3"),
  "rating": 5,
  "comment": "Excellent work, delivered on time!",
  "aspects": {
    "communication": 5,
    "quality": 5,
    "professionalism": 5,
    "deadline": 5
  },
  "response": "Thank you for the great feedback!",
  "createdAt": "2026-08-18T16:00:00Z"
}
```

#### 9.1.5 Messages Collection:
```json
{
  "_id": ObjectId("64f2a1b3c4d5e6f7a8b9c0d5"),
  "conversationId": "conv_64f2a1b3c4d5e6f7",
  "senderId": ObjectId("64f2a1b3c4d5e6f7a8b9c0d1"),
  "receiverId": ObjectId("64f2a1b3c4d5e6f7a8b9c0d2"),
  "content": "Hello, I'm interested in your services",
  "attachments": [],
  "read": false,
  "readAt": null,
  "createdAt": "2026-08-18T11:00:00Z"
}
```

### 9.2 İndeksler (Indexes)

```javascript
// Users Collection Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ googleId: 1 }, { sparse: true });
db.users.createIndex({ role: 1, isActive: 1 });
db.users.createIndex({ createdAt: -1 });

// Experts Collection Indexes
db.experts.createIndex({ userId: 1 }, { unique: true });
db.experts.createIndex({ skills: 1 });
db.experts.createIndex({ categories: 1 });
db.experts.createIndex({ "rating.average": -1 });
db.experts.createIndex({ status: 1, "rating.average": -1 });
db.experts.createIndex({ 
  title: "text", 
  bio: "text", 
  skills: "text" 
}); // Full-text search

// Jobs Collection Indexes
db.jobs.createIndex({ clientId: 1, status: 1 });
db.jobs.createIndex({ status: 1, postedAt: -1 });
db.jobs.createIndex({ category: 1, status: 1 });
db.jobs.createIndex({ skills: 1 });
db.jobs.createIndex({ "budget.min": 1, "budget.max": 1 });
db.jobs.createIndex({ 
  title: "text", 
  description: "text" 
});

// Messages Collection Indexes
db.messages.createIndex({ conversationId: 1, createdAt: -1 });
db.messages.createIndex({ senderId: 1, createdAt: -1 });
db.messages.createIndex({ receiverId: 1, read: 1 });
```

### 9.3 Redis Cache Strategy

```javascript
// Cache Keys Structure
const CACHE_KEYS = {
  USER: (id) => `user:${id}`,
  EXPERT: (id) => `expert:${id}`,
  EXPERT_LIST: (page, category) => `experts:${category}:page:${page}`,
  JOB_LIST: (page, status) => `jobs:${status}:page:${page}`,
  SESSION: (token) => `session:${token}`,
  RATE_LIMIT: (ip) => `rate_limit:${ip}`,
};

// Cache Implementation
class CacheService {
  constructor(redisClient) {
    this.redis = redisClient;
    this.DEFAULT_TTL = 3600; // 1 hour
  }
  
  async get(key) {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  async set(key, value, ttl = this.DEFAULT_TTL) {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(pattern) {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
  
  // Cache-Aside Pattern
  async getOrFetch(key, fetchFn, ttl) {
    let data = await this.get(key);
    
    if (!data) {
      data = await fetchFn();
      await this.set(key, data, ttl);
    }
    
    return data;
  }
}

// Usage
const expertData = await cacheService.getOrFetch(
  CACHE_KEYS.EXPERT(expertId),
  () => Expert.findById(expertId),
  3600
);
```

### 9.4 Database Backup Strategy

```bash
# MongoDB Backup Script
#!/bin/bash

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="isbul_production"

# Create backup
mongodump \
  --uri="mongodb://user:pass@host:27017/$DB_NAME" \
  --out="$BACKUP_DIR/$TIMESTAMP" \
  --gzip

# Upload to S3
aws s3 sync "$BACKUP_DIR/$TIMESTAMP" \
  "s3://isbul-backups/mongodb/$TIMESTAMP/"

# Keep only last 7 days locally
find "$BACKUP_DIR" -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $TIMESTAMP"
```

### 9.5 Database Replication (MongoDB Replica Set)

```javascript
// mongod.conf
replication:
  replSetName: "isbul-replica-set"

// Initialize Replica Set
rs.initiate({
  _id: "isbul-replica-set",
  members: [
    { _id: 0, host: "mongodb-primary:27017", priority: 2 },
    { _id: 1, host: "mongodb-secondary-1:27017", priority: 1 },
    { _id: 2, host: "mongodb-secondary-2:27017", priority: 1 }
  ]
});

// Application Connection
mongoose.connect(
  'mongodb://mongodb-primary:27017,mongodb-secondary-1:27017,mongodb-secondary-2:27017/isbul?replicaSet=isbul-replica-set',
  {
    readPreference: 'secondaryPreferred',
    retryWrites: true,
    w: 'majority'
  }
);
```

---

## 10. KİMLİK DOĞRULAMA VE GÜVENLİK

### 10.1 OAuth 2.0 - Google Authentication

#### 10.1.1 Google Cloud Console Konfigürasyonu:
```
Client ID: [GOOGLE_CLIENT_ID].apps.googleusercontent.com
Client Secret: [GOOGLE_CLIENT_SECRET]
Authorized Redirect URIs: 
  - https://isbul.online/oauth-callback.html
  - http://localhost:3000/oauth-callback
```

#### 10.1.2 OAuth Flow Implementation:
```javascript
// Frontend - Login Button
function handleGoogleLogin() {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=openid%20email%20profile&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  window.location.href = googleAuthUrl;
}

// Backend - OAuth Callback Handler
router.post('/auth/google', async (req, res) => {
  const { code } = req.body;
  
  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      }
    );
    
    const { access_token, id_token } = tokenResponse.data;
    
    // Verify and decode ID token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    // Find or create user
    let user = await User.findOne({ googleId });
    
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
      } else {
        user = new User({
          googleId,
          email,
          name,
          avatar: picture,
          isVerified: true
        });
      }
      await user.save();
    }
    
    // Generate JWT
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
});
```

### 10.2 JWT (JSON Web Token)

#### 10.2.1 Token Structure:
```javascript
// Token Generation
const generateToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };
  
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Token Verification
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
};
```

#### 10.2.2 Refresh Token Flow:
```javascript
router.post('/auth/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET
    );
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    const { accessToken, refreshToken: newRefreshToken } = 
      generateToken(user);
    
    res.json({ 
      accessToken, 
      refreshToken: newRefreshToken 
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

### 10.3 Password Security

#### 10.3.1 Password Hashing (bcrypt):
```javascript
const bcrypt = require('bcrypt');

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Usage in login
const user = await User.findOne({ email });
const isMatch = await user.comparePassword(password);
if (!isMatch) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

#### 10.3.2 Password Reset Flow:
```javascript
// Request password reset
router.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  
  if (!user) {
    // Don't reveal if user exists
    return res.json({ 
      message: 'If email exists, reset link sent' 
    });
  }
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 3600000; // 1 hour
  await user.save();
  
  // Send email
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
  await emailService.sendPasswordReset(email, resetUrl);
  
  res.json({ message: 'Reset link sent' });
});

// Reset password
router.post('/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  
  user.password = newPassword; // Will be hashed by pre-save hook
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  
  res.json({ message: 'Password reset successful' });
});
```

### 10.4 Security Headers (Helmet.js)

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'accounts.google.com'],
      connectSrc: ["'self'", 'https://isbul.online'],
      frameSrc: ["'self'", 'accounts.google.com']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true
}));
```

### 10.5 CORS Configuration

```javascript
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      'https://isbul.online',
      'https://www.isbul.online',
      'http://localhost:3000'
    ];
    
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

### 10.6 Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// General API rate limit
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests, please try again later'
    });
  }
});

// Strict rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

### 10.7 Input Validation & Sanitization

```javascript
const { body, query, param, sanitize } = require('express-validator');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

// XSS Protection
app.use(xss());

// NoSQL Injection Prevention
app.use(mongoSanitize());

// Validation Rules
const registerValidation = [
  body('email')
    .isEmail().normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, number, special char'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .escape()
    .withMessage('Name must be 2-50 characters')
];
```

### 10.8 SQL Injection Prevention (PostgreSQL için)

```javascript
const { Pool } = require('pg');

// Parameterized Queries
const getUserByEmail = async (email) => {
  const query = {
    text: 'SELECT * FROM users WHERE email = $1',
    values: [email]
  };
  
  const result = await pool.query(query);
  return result.rows[0];
};

// Avoid string concatenation
// ❌ WRONG: `SELECT * FROM users WHERE email = '${email}'`
// ✅ CORRECT: Use parameterized queries
```

---

## 11. DOMAIN YÖNETİMİ

### 11.1 Domain Satın Alma

**Domain:** isbul.online  
**Registrar:** [Domain sağlayıcı adı]  
**Süre:** 1 yıl  
**Maliyet:** [Tutar] TRY

#### 11.1.1 Domain Seçim Kriterleri:
- Kısa ve akılda kalıcı
- Türkçe karakter içermemesi (.com.tr yerine .online)
- Marka uyumu
- SEO dostu
- Sosyal medya username uygunluğu

### 11.2 DNS Konfigürasyonu (AWS Route 53)

#### 11.2.1 Hosted Zone Oluşturma:
```bash
# AWS CLI ile Hosted Zone oluşturma
aws route53 create-hosted-zone \
  --name isbul.online \
  --caller-reference $(date +%s) \
  --hosted-zone-config Comment="IsBul Production DNS"

# Çıktı: Nameservers
# ns-1234.awsdns-12.com
# ns-5678.awsdns-34.net
# ns-9012.awsdns-56.org
# ns-3456.awsdns-78.co.uk
```

#### 11.2.2 DNS Records:
```
# A Record (Root domain)
isbul.online.  A  300  [ELB IP Address]

# CNAME Records
www.isbul.online.  CNAME  300  isbul.online.
api.isbul.online.  CNAME  300  [API Load Balancer DNS]

# MX Records (Email)
isbul.online.  MX  300  10 mail.isbul.online.

# TXT Records
isbul.online.  TXT  300  "v=spf1 include:_spf.google.com ~all"
isbul.online.  TXT  300  "google-site-verification=kbXZArOhnsekt1hmE0NEmGcfD9jAlAoM8iArzkaIcLM"

# CNAME for SSL validation (Let's Encrypt)
_acme-challenge.isbul.online.  CNAME  300  [validation domain]
```

### 11.3 Subdomain Stratejisi

```
isbul.online          → Main website
www.isbul.online      → WWW redirect to root
api.isbul.online      → API Gateway
cdn.isbul.online      → CloudFront CDN
admin.isbul.online    → Admin panel
staging.isbul.online  → Staging environment
dev.isbul.online      → Development environment
```

### 11.4 Domain Transfer & Management

```bash
# Domain Nameserver güncelleme (Registrar panelinde)
Nameserver 1: ns-1234.awsdns-12.com
Nameserver 2: ns-5678.awsdns-34.net
Nameserver 3: ns-9012.awsdns-56.org
Nameserver 4: ns-3456.awsdns-78.co.uk

# DNS propagation check
dig isbul.online
nslookup isbul.online
```

### 11.5 Email Configuration

```
# Google Workspace MX Records
Priority  Hostname
1         ASPMX.L.GOOGLE.COM
5         ALT1.ASPMX.L.GOOGLE.COM
5         ALT2.ASPMX.L.GOOGLE.COM
10        ALT3.ASPMX.L.GOOGLE.COM
10        ALT4.ASPMX.L.GOOGLE.COM

# DKIM Record
default._domainkey.isbul.online  CNAME  default._domainkey.20230818gke.gappssmtp.com

# DMARC Record
_dmarc.isbul.online  TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@isbul.online"
```

---

## 12. AWS ALTYAPISI VE DEPLOYMENT

### 12.1 AWS Services Kullanımı

#### 12.1.1 EC2 (Elastic Compute Cloud):
```bash
# Instance Details
Instance Type: t3.medium
vCPU: 2
RAM: 4 GB
Storage: 30 GB gp3 SSD
OS: Ubuntu 22.04 LTS
Region: eu-central-1 (Frankfurt)

# Security Group Rules
Inbound:
- Port 22 (SSH): Custom IP (jump host only)
- Port 80 (HTTP): 0.0.0.0/0
- Port 443 (HTTPS): 0.0.0.0/0
- Port 6443 (K8s API): VPC only

Outbound:
- All traffic: 0.0.0.0/0
```

#### 12.1.2 S3 (Simple Storage Service):
```bash
# Bucket Structure
s3://isbul-static/
├── assets/
│   ├── images/
│   ├── css/
│   └── js/
├── avatars/
├── portfolios/
└── documents/

# Bucket Policy (Public Read)
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::isbul-static/*"
  }]
}

# Lifecycle Policy (Auto-delete old backups)
{
  "Rules": [{
    "Id": "DeleteOldBackups",
    "Prefix": "backups/",
    "Status": "Enabled",
    "Expiration": {
      "Days": 30
    }
  }]
}
```

#### 12.1.3 CloudFront (CDN):
```bash
# Distribution Configuration
Origin: isbul-static.s3.eu-central-1.amazonaws.com
Alternate Domain: cdn.isbul.online
SSL Certificate: *.isbul.online (ACM)
Price Class: Use All Edge Locations
Default TTL: 86400 (24 hours)
Min TTL: 0
Max TTL: 31536000 (1 year)

# Cache Behaviors
Path: /images/*     Cache Policy: Optimized
Path: /css/*        Cache Policy: Optimized
Path: /js/*         Cache Policy: Optimized
Path: /api/*        Cache Policy: Disabled

# Invalidation
aws cloudfront create-invalidation \
  --distribution-id E1EXAMPLE \
  --paths "/*"
```

#### 12.1.4 RDS (Relational Database Service):
```bash
# PostgreSQL Instance (Backup için)
Engine: PostgreSQL 15.3
Instance Class: db.t3.micro
Storage: 20 GB gp3
Multi-AZ: No (tek AZ, cost optimization)
Backup Retention: 7 days
Automated Backups: 03:00-04:00 UTC
Publicly Accessible: No
VPC: isbul-vpc
Security Group: db-sg (port 5432, app-tier only)

# Connection String
postgresql://admin:password@isbul-db.c9akciq32.eu-central-1.rds.amazonaws.com:5432/isbul
```

#### 12.1.5 ElastiCache (Redis):
```bash
# Redis Cluster
Node Type: cache.t3.micro
Engine: Redis 7.0
Nodes: 1 (gelecekte scale edilecek)
Port: 6379
Subnet Group: isbul-cache-subnet
Security Group: cache-sg

# Use Cases
- Session storage
- API response caching
- Rate limiting
- Real-time analytics
```

#### 12.1.6 Load Balancer (ALB):
```bash
# Application Load Balancer
Type: Application Load Balancer
Scheme: Internet-facing
IP Address Type: IPv4
Availability Zones: eu-central-1a, eu-central-1b

# Listeners
Protocol: HTTPS (Port 443)
SSL Certificate: *.isbul.online
Default Action: Forward to k8s-ingress-target-group

Protocol: HTTP (Port 80)
Default Action: Redirect to HTTPS

# Target Groups
Name: k8s-ingress-tg
Protocol: HTTP
Port: 30080 (NodePort)
Health Check: /health
Healthy Threshold: 2
Unhealthy Threshold: 3
Timeout: 5s
Interval: 30s
```

#### 12.1.7 VPC (Virtual Private Cloud):
```bash
# Network Architecture
VPC CIDR: 10.0.0.0/16

# Subnets
Public Subnet 1:  10.0.1.0/24 (eu-central-1a)
Public Subnet 2:  10.0.2.0/24 (eu-central-1b)
Private Subnet 1: 10.0.11.0/24 (eu-central-1a)
Private Subnet 2: 10.0.12.0/24 (eu-central-1b)

# Route Tables
Public Route Table:
  - 0.0.0.0/0 → Internet Gateway
  - 10.0.0.0/16 → Local

Private Route Table:
  - 0.0.0.0/0 → NAT Gateway
  - 10.0.0.0/16 → Local

# Internet Gateway: igw-isbul
# NAT Gateway: nat-isbul (public subnet içinde)
```

#### 12.1.8 IAM (Identity and Access Management):
```json
// Service Account Policy (S3 Upload)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::isbul-static/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::isbul-static"
    }
  ]
}

// EC2 Instance Role
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "elasticloadbalancing:Describe*",
        "cloudwatch:PutMetricData",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

### 12.2 SSH Key Pair Management

```bash
# Key Pair Oluşturma
ssh-keygen -t rsa -b 4096 -f ~/.ssh/isbul-keypair -C "isbul-ec2-key"

# Public key'i EC2'ye ekleme
aws ec2 import-key-pair \
  --key-name isbul-keypair \
  --public-key-material fileb://~/.ssh/isbul-keypair.pub

# SSH Connection
ssh -i ~/.ssh/isbul-keypair.pem ubuntu@ec2-3-123-45-67.eu-central-1.compute.amazonaws.com

# Windows için (.pem permissions)
icacls "$env:USERPROFILE\.ssh\isbul-keypair.pem" /inheritance:r
icacls "$env:USERPROFILE\.ssh\isbul-keypair.pem" /grant:r "$env:USERNAME:R"
```

### 12.3 Cost Optimization

```bash
# Monthly Cost Estimation (USD)
EC2 (t3.medium x 2):         $60
RDS (db.t3.micro):           $15
S3 (100 GB):                 $3
CloudFront (1 TB transfer):  $85
Route 53 (Hosted Zone):      $0.50
Data Transfer:               $20
-----------------------------------------
Total (estimated):           $183.50/month

# Cost Saving Strategies
1. Reserved Instances (EC2) → 40% tasarruf
2. S3 Intelligent-Tiering → Auto-optimize
3. CloudFront caching → Reduce origin requests
4. Auto Scaling → Scale down at night
5. Lambda for batch jobs → No idle time cost
```

### 12.4 AWS CLI Deployment Script

```bash
#!/bin/bash
# deploy-to-aws.sh

set -e

# Variables
REGION="eu-central-1"
CLUSTER_NAME="isbul-k8s"
ECR_REPO="123456789012.dkr.ecr.$REGION.amazonaws.com/isbul"
IMAGE_TAG="$(git rev-parse --short HEAD)"

echo "🚀 Deploying to AWS..."

# 1. Build Docker image
echo "📦 Building Docker image..."
docker build -t isbul-api:$IMAGE_TAG .

# 2. Login to ECR
echo "🔐 Logging in to ECR..."
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ECR_REPO

# 3. Tag and push image
echo "⬆️  Pushing to ECR..."
docker tag isbul-api:$IMAGE_TAG $ECR_REPO:$IMAGE_TAG
docker tag isbul-api:$IMAGE_TAG $ECR_REPO:latest
docker push $ECR_REPO:$IMAGE_TAG
docker push $ECR_REPO:latest

# 4. Update kubeconfig
echo "⚙️  Updating kubeconfig..."
aws eks update-kubeconfig --region $REGION --name $CLUSTER_NAME

# 5. Deploy to Kubernetes
echo "☸️  Deploying to Kubernetes..."
kubectl set image deployment/api-deployment \
  api=$ECR_REPO:$IMAGE_TAG \
  --record

# 6. Wait for rollout
echo "⏳ Waiting for rollout..."
kubectl rollout status deployment/api-deployment

echo "✅ Deployment complete!"
echo "🔗 URL: https://isbul.online"
```

---

## 13. KUBERNETES ORCHESTRATION

### 13.1 Kubernetes Cluster Setup

#### 13.1.1 Cluster Mimarisi:
```
┌──────────────────────────────────────────┐
│         Master Node (Control Plane)      │
├──────────────────────────────────────────┤
│  • kube-apiserver                        │
│  • etcd (cluster state)                  │
│  • kube-scheduler                        │
│  • kube-controller-manager               │
│  • cloud-controller-manager              │
└──────────────────────────────────────────┘
              │
    ──────────┴──────────
    │                   │
┌───▼────┐         ┌───▼────┐
│Worker-1│         │Worker-2│
├────────┤         ├────────┤
│kubelet │         │kubelet │
│kube-   │         │kube-   │
│proxy   │         │proxy   │
│        │         │        │
│Pods    │         │Pods    │
└────────┘         └────────┘
```

#### 13.1.2 kubeadm ile Cluster Kurulumu:
```bash
# Master Node
sudo kubeadm init \
  --pod-network-cidr=10.244.0.0/16 \
  --apiserver-advertise-address=10.0.1.10 \
  --control-plane-endpoint=k8s-master.isbul.local

# Configure kubectl
mkdir -p $HOME/.kube
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Install CNI (Calico)
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml

# Worker Node Join
sudo kubeadm join k8s-master.isbul.local:6443 \
  --token abcdef.0123456789abcdef \
  --discovery-token-ca-cert-hash sha256:xxxxx
```

### 13.2 Namespace Organization

```yaml
# namespaces.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: isbul-production
  labels:
    environment: production
---
apiVersion: v1
kind: Namespace
metadata:
  name: isbul-staging
  labels:
    environment: staging
---
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring
  labels:
    environment: shared
```

### 13.3 Deployment Manifests

#### 13.3.1 API Deployment:
```yaml
# api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
  namespace: isbul-production
  labels:
    app: isbul-api
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: isbul-api
  template:
    metadata:
      labels:
        app: isbul-api
        version: v1
    spec:
      containers:
      - name: api
        image: 123456789012.dkr.ecr.eu-central-1.amazonaws.com/isbul:latest
        ports:
        - containerPort: 8080
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: isbul-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: isbul-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
      restartPolicy: Always
```

#### 13.3.2 Service:
```yaml
# api-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: isbul-production
  labels:
    app: isbul-api
spec:
  type: ClusterIP
  selector:
    app: isbul-api
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
    name: http
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 3600
```

#### 13.3.3 Ingress (NGINX):
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: isbul-ingress
  namespace: isbul-production
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - isbul.online
    - api.isbul.online
    secretName: isbul-tls
  rules:
  - host: api.isbul.online
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
```

### 13.4 Secrets Management

```yaml
# secrets.yaml (base64 encoded)
apiVersion: v1
kind: Secret
metadata:
  name: isbul-secrets
  namespace: isbul-production
type: Opaque
data:
  mongodb-uri: bW9uZ29kYjovL3VzZXI6cGFzc0BleGFtcGxlLmNvbS9pc2J1bA==
  jwt-secret: c3VwZXJzZWNyZXRqd3RrZXk=
  aws-access-key: [BASE64_ENCODED_AWS_ACCESS_KEY]
  aws-secret-key: [BASE64_ENCODED_AWS_SECRET_KEY]

# Create from file
kubectl create secret generic isbul-secrets \
  --from-file=mongodb-uri=./secrets/mongodb-uri.txt \
  --from-file=jwt-secret=./secrets/jwt-secret.txt \
  -n isbul-production
```

### 13.5 ConfigMap

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: isbul-config
  namespace: isbul-production
data:
  API_URL: "https://api.isbul.online"
  CDN_URL: "https://cdn.isbul.online"
  MAX_UPLOAD_SIZE: "10485760"
  RATE_LIMIT_WINDOW: "900000"
  RATE_LIMIT_MAX: "100"
  LOG_LEVEL: "info"
```

### 13.6 Horizontal Pod Autoscaler (HPA)

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: isbul-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-deployment
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
```

### 13.7 Site Çökmesine Karşı Önlemler

#### 13.7.1 Pod Disruption Budget:
```yaml
# pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-pdb
  namespace: isbul-production
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: isbul-api
```

#### 13.7.2 Self-Healing (Restart Policy):
```yaml
spec:
  template:
    spec:
      restartPolicy: Always  # Pod crash olursa otomatik restart
      containers:
      - name: api
        livenessProbe:     # Sağlık kontrolü
          httpGet:
            path: /health
            port: 8080
          failureThreshold: 3  # 3 başarısız deneme sonrası restart
```

#### 13.7.3 Readiness Gates:
```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
  # Pod hazır olana kadar traffic almaz
```

### 13.8 SSL Sertifika Otomatik Yenileme (Cert-Manager)

#### 13.8.1 Cert-Manager Kurulumu:
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager
```

#### 13.8.2 ClusterIssuer (Let's Encrypt):
```yaml
# cluster-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@isbul.online
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

#### 13.8.3 Certificate Resource:
```yaml
# certificate.yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: isbul-tls
  namespace: isbul-production
spec:
  secretName: isbul-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - isbul.online
  - www.isbul.online
  - api.isbul.online
  duration: 2160h  # 90 days
  renewBefore: 360h  # 15 days before expiry
```

**Otomatik Yenileme:** Cert-manager sertifika bitiş tarihini takip eder ve otomatik olarak yeniler. Pod restart gerektirmez!

### 13.9 Pod Bozulursa Otomatik Düzeltme

```yaml
# ReplicaSet ensures desired pod count
spec:
  replicas: 3  # Her zaman 3 pod çalışır durumda

# Senaryo:
# 1. Pod crash oldu → kubelet otomatik restart eder
# 2. Node down oldu → kube-controller-manager yeni node'da pod oluşturur
# 3. Health check fail → kubelet pod'u kill edip yenisini başlatır
# 4. OOM (Out of Memory) → kubelet restart eder
```

#### 13.9.1 Node Failure Handling:
```bash
# Node not ready olduğunda
kubectl get nodes
# Node1 - NotReady

# Pod'lar otomatik olarak healthy node'a migrate edilir
kubectl get pods -o wide
# Pod1 - Node2 (yeni)
# Pod2 - Node2 (yeni)
# Pod3 - Node3 (mevcut)
```

### 13.10 Rolling Update (Zero Downtime)

```bash
# Update image
kubectl set image deployment/api-deployment \
  api=isbul:v2.0 \
  -n isbul-production

# Rolling update stratejisi:
# 1. Yeni pod (v2.0) başlatılır
# 2. Readiness probe başarılı olunca traffic alır
# 3. Eski pod (v1.0) terminate edilir
# 4. Bu adımlar tüm pod'lar için tekrarlanır
# Sonuç: Hiç downtime olmadan güncelleme

# Rollback (sorun olursa)
kubectl rollout undo deployment/api-deployment -n isbul-production
```

---

## 14. CI/CD PIPELINE

### 14.1 GitHub Actions Workflow

#### 14.1.1 Pipeline Yapısı:
```
┌──────────────┐
│  Git Push    │
└──────┬───────┘
       │
┌──────▼───────────────────────────────┐
│  GitHub Actions (Trigger)            │
└──────┬───────────────────────────────┘
       │
┌──────▼──────┐    ┌──────────────┐
│  Build      │───▶│  Unit Tests  │
└──────┬──────┘    └──────┬───────┘
       │                  │
┌──────▼──────────────────▼───────┐
│  Lint & Security Scan           │
└──────┬──────────────────────────┘
       │
┌──────▼──────────┐
│  Docker Build   │
└──────┬──────────┘
       │
┌──────▼──────────┐
│  Push to ECR    │
└──────┬──────────┘
       │
┌──────▼────────────┐
│  Deploy to K8s    │
└──────┬────────────┘
       │
┌──────▼────────────┐
│  Integration Test │
└──────┬────────────┘
       │
┌──────▼────────────┐
│  Notify (Slack)   │
└───────────────────┘
```

#### 14.1.2 CI/CD Workflow File:
```yaml
# .github/workflows/ci-cd.yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

env:
  AWS_REGION: eu-central-1
  ECR_REPOSITORY: isbul
  EKS_CLUSTER: isbul-k8s

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

  build-and-push:
    name: Build and Push Docker Image
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:latest .

      - name: Push Docker image to ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Save image tag to output
        id: image
        run: echo "image_tag=${{ github.sha }}" >> $GITHUB_OUTPUT

    outputs:
      image_tag: ${{ steps.image.outputs.image_tag }}

  deploy:
    name: Deploy to Kubernetes
    runs-on: ubuntu-latest
    needs: build-and-push
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER

      - name: Deploy to Kubernetes
        env:
          IMAGE_TAG: ${{ needs.build-and-push.outputs.image_tag }}
        run: |
          kubectl set image deployment/api-deployment \
            api=${{ secrets.ECR_REGISTRY }}/$ECR_REPOSITORY:$IMAGE_TAG \
            -n isbul-production \
            --record

      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/api-deployment \
            -n isbul-production \
            --timeout=5m

      - name: Verify deployment
        run: |
          kubectl get pods -n isbul-production
          kubectl get svc -n isbul-production

  notify:
    name: Notify Team
    runs-on: ubuntu-latest
    needs: [deploy]
    if: always()
    steps:
      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            Deployment ${{ job.status }}!
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
            URL: https://isbul.online
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 14.2 Dockerfile Optimization

```dockerfile
# Multi-stage build for smaller image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application (if needed)
RUN npm run build

# Production stage
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

WORKDIR /app

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js

# Expose port
EXPOSE 8080

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/server.js"]
```

### 14.3 Environment-Specific Deployments

```yaml
# Staging deployment (separate workflow)
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      # ... build steps ...
      
      - name: Deploy to staging namespace
        run: |
          kubectl set image deployment/api-deployment \
            api=$ECR_REGISTRY/$ECR_REPOSITORY:staging-${{ github.sha }} \
            -n isbul-staging

      - name: Run smoke tests
        run: |
          curl -f https://staging.isbul.online/health || exit 1
```

### 14.4 Rollback Strategy

```yaml
# Manual rollback workflow
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      revision:
        description: 'Revision number to rollback to (leave empty for previous)'
        required: false
        default: ''

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1

      - name: Update kubeconfig
        run: aws eks update-kubeconfig --region eu-central-1 --name isbul-k8s

      - name: Rollback deployment
        run: |
          if [ -z "${{ github.event.inputs.revision }}" ]; then
            kubectl rollout undo deployment/api-deployment -n isbul-production
          else
            kubectl rollout undo deployment/api-deployment \
              -n isbul-production \
              --to-revision=${{ github.event.inputs.revision }}
          fi

      - name: Check rollback status
        run: kubectl rollout status deployment/api-deployment -n isbul-production
```

### 14.5 GitOps Approach (Gelecek)

```yaml
# ArgoCD Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: isbul-api
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/Umit-dedeoglu/IsBul.git
    targetRevision: HEAD
    path: k8s/production
  destination:
    server: https://kubernetes.default.svc
    namespace: isbul-production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

---

## 15. MONITORING VE OBSERVABILITY (PROMETHEUS & GRAFANA)

### 15.1 Monitoring Stack

```
┌──────────────────────────────────────────┐
│         Kubernetes Cluster               │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────┐      ┌────────────┐     │
│  │   Pods     │─────▶│  Metrics   │     │
│  └────────────┘      │  Endpoint  │     │
│                      └──────┬─────┘     │
│                             │           │
│  ┌────────────┐      ┌──────▼─────┐     │
│  │   Nodes    │─────▶│ Prometheus │     │
│  └────────────┘      │  (Scrape)  │     │
│                      └──────┬─────┘     │
│                             │           │
│                      ┌──────▼─────┐     │
│                      │  Grafana   │     │
│                      │ (Visualize)│     │
│                      └──────┬─────┘     │
│                             │           │
│                      ┌──────▼────────┐  │
│                      │ AlertManager  │  │
│                      │  (Alerting)   │  │
│                      └───────────────┘  │
└──────────────────────────────────────────┘
```

### 15.2 Prometheus Setup

#### 15.2.1 Prometheus Deployment:
```yaml
# prometheus-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      serviceAccountName: prometheus
      containers:
      - name: prometheus
        image: prom/prometheus:v2.45.0
        args:
          - '--config.file=/etc/prometheus/prometheus.yml'
          - '--storage.tsdb.path=/prometheus'
          - '--storage.tsdb.retention.time=15d'
          - '--web.enable-lifecycle'
        ports:
        - containerPort: 9090
          name: web
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        - name: storage
          mountPath: /prometheus
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 1000m
            memory: 2Gi
      volumes:
      - name: config
        configMap:
          name: prometheus-config
      - name: storage
        persistentVolumeClaim:
          claimName: prometheus-pvc
```

#### 15.2.2 Prometheus Configuration:
```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
      external_labels:
        cluster: 'isbul-production'
        
    # Alertmanager configuration
    alerting:
      alertmanagers:
        - static_configs:
            - targets: ['alertmanager:9093']
    
    # Load rules
    rule_files:
      - '/etc/prometheus/rules/*.yml'
    
    scrape_configs:
      # Prometheus itself
      - job_name: 'prometheus'
        static_configs:
          - targets: ['localhost:9090']
      
      # Kubernetes API server
      - job_name: 'kubernetes-apiservers'
        kubernetes_sd_configs:
          - role: endpoints
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
          - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
            action: keep
            regex: default;kubernetes;https
      
      # Kubernetes nodes
      - job_name: 'kubernetes-nodes'
        kubernetes_sd_configs:
          - role: node
        relabel_configs:
          - action: labelmap
            regex: __meta_kubernetes_node_label_(.+)
      
      # Kubernetes pods
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            action: replace
            regex: ([^:]+)(?::\d+)?;(\d+)
            replacement: $1:$2
            target_label: __address__
      
      # Node Exporter
      - job_name: 'node-exporter'
        kubernetes_sd_configs:
          - role: endpoints
        relabel_configs:
          - source_labels: [__meta_kubernetes_endpoints_name]
            regex: 'node-exporter'
            action: keep
      
      # Application metrics
      - job_name: 'isbul-api'
        kubernetes_sd_configs:
          - role: pod
            namespaces:
              names:
                - isbul-production
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_label_app]
            regex: isbul-api
            action: keep
          - source_labels: [__meta_kubernetes_pod_ip]
            target_label: __address__
            replacement: $1:8080
```

#### 15.2.3 Application Metrics Instrumentation:
```javascript
// Node.js - prom-client
const client = require('prom-client');
const express = require('express');

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);

// Middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
    httpRequestTotal.labels(req.method, req.route?.path || req.path, res.statusCode).inc();
  });
  
  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### 15.3 Grafana Setup

#### 15.3.1 Grafana Deployment:
```yaml
# grafana-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:10.0.0
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: grafana-secrets
              key: admin-password
        - name: GF_SERVER_ROOT_URL
          value: "https://grafana.isbul.online"
        volumeMounts:
        - name: storage
          mountPath: /var/lib/grafana
        - name: datasources
          mountPath: /etc/grafana/provisioning/datasources
        - name: dashboards-config
          mountPath: /etc/grafana/provisioning/dashboards
        - name: dashboards
          mountPath: /var/lib/grafana/dashboards
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
      volumes:
      - name: storage
        persistentVolumeClaim:
          claimName: grafana-pvc
      - name: datasources
        configMap:
          name: grafana-datasources
      - name: dashboards-config
        configMap:
          name: grafana-dashboards-config
      - name: dashboards
        configMap:
          name: grafana-dashboards
```

#### 15.3.2 Datasource Configuration:
```yaml
# grafana-datasources.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-datasources
  namespace: monitoring
data:
  datasources.yaml: |
    apiVersion: 1
    datasources:
      - name: Prometheus
        type: prometheus
        access: proxy
        url: http://prometheus:9090
        isDefault: true
        editable: false
```

#### 15.3.3 Custom Dashboards:

**Dashboard 1: Application Performance**
```json
{
  "dashboard": {
    "title": "İşBul API Performance",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [{
          "expr": "rate(http_requests_total[5m])"
        }]
      },
      {
        "title": "Response Time (p95)",
        "targets": [{
          "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
        }]
      },
      {
        "title": "Error Rate",
        "targets": [{
          "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])"
        }]
      },
      {
        "title": "Active Connections",
        "targets": [{
          "expr": "active_connections"
        }]
      }
    ]
  }
}
```

**Dashboard 2: Kubernetes Cluster**
```json
{
  "dashboard": {
    "title": "Kubernetes Cluster Overview",
    "panels": [
      {
        "title": "CPU Usage",
        "targets": [{
          "expr": "sum(rate(container_cpu_usage_seconds_total[5m])) by (pod)"
        }]
      },
      {
        "title": "Memory Usage",
        "targets": [{
          "expr": "sum(container_memory_usage_bytes) by (pod)"
        }]
      },
      {
        "title": "Pod Status",
        "targets": [{
          "expr": "kube_pod_status_phase"
        }]
      },
      {
        "title": "Network I/O",
        "targets": [{
          "expr": "rate(container_network_receive_bytes_total[5m])"
        }]
      }
    ]
  }
}
```

### 15.4 AlertManager

#### 15.4.1 Alert Rules:
```yaml
# alert-rules.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-rules
  namespace: monitoring
data:
  alerts.yml: |
    groups:
      - name: isbul-alerts
        interval: 30s
        rules:
          # High error rate
          - alert: HighErrorRate
            expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
            for: 5m
            labels:
              severity: critical
            annotations:
              summary: "High error rate detected"
              description: "Error rate is {{ $value }} errors/sec"
          
          # High response time
          - alert: HighResponseTime
            expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High response time"
              description: "95th percentile response time is {{ $value }}s"
          
          # Pod down
          - alert: PodDown
            expr: up{job="isbul-api"} == 0
            for: 1m
            labels:
              severity: critical
            annotations:
              summary: "Pod is down"
              description: "Pod {{ $labels.instance }} is down"
          
          # High memory usage
          - alert: HighMemoryUsage
            expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.9
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High memory usage"
              description: "Memory usage is {{ $value | humanizePercentage }}"
          
          # High CPU usage
          - alert: HighCPUUsage
            expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High CPU usage"
              description: "CPU usage is {{ $value | humanizePercentage }}"
```

#### 15.4.2 AlertManager Configuration:
```yaml
# alertmanager-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: alertmanager-config
  namespace: monitoring
data:
  alertmanager.yml: |
    global:
      resolve_timeout: 5m
      slack_api_url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX'
    
    route:
      receiver: 'slack-notifications'
      group_by: ['alertname', 'cluster', 'service']
      group_wait: 10s
      group_interval: 10s
      repeat_interval: 12h
      routes:
        - match:
            severity: critical
          receiver: 'slack-critical'
          continue: true
        - match:
            severity: warning
          receiver: 'slack-warnings'
    
    receivers:
      - name: 'slack-notifications'
        slack_configs:
          - channel: '#isbul-alerts'
            title: '{{ .Status | toUpper }}: {{ .GroupLabels.alertname }}'
            text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
      
      - name: 'slack-critical'
        slack_configs:
          - channel: '#isbul-critical'
            title: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'
            text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
      
      - name: 'slack-warnings'
        slack_configs:
          - channel: '#isbul-warnings'
            title: '⚠️ WARNING: {{ .GroupLabels.alertname }}'
            text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

### 15.5 Logging (ELK Stack - Gelecek)

```yaml
# Elasticsearch, Logstash, Kibana
# Centralized logging solution
apiVersion: v1
kind: ConfigMap
metadata:
  name: filebeat-config
  namespace: monitoring
data:
  filebeat.yml: |
    filebeat.inputs:
    - type: container
      paths:
        - /var/log/containers/*.log
      processors:
        - add_kubernetes_metadata:
            host: ${NODE_NAME}
    
    output.elasticsearch:
      hosts: ['elasticsearch:9200']
      index: "isbul-logs-%{+yyyy.MM.dd}"
```

---

## 16. SSL/TLS SERTİFİKA YÖNETİMİ

### 16.1 Let's Encrypt Entegrasyonu

Let's Encrypt, ücretsiz SSL/TLS sertifikaları sağlayan bir Certificate Authority'dir. Cert-Manager ile otomatik yönetim sağlanır.

#### 16.1.1 Sertifika Lifecycle:
```
1. Initial Request → Let's Encrypt
2. ACME Challenge (HTTP-01/DNS-01)
3. Verification
4. Certificate Issued (90 days)
5. Auto-Renewal (30 days before expiry)
6. Pod restart NOT required
```

#### 16.1.2 Cert-Manager CRDs:
```bash
# CRD'leri yükle
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.crds.yaml

# Cert-Manager controller
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml

# Verify
kubectl get pods -n cert-manager
# NAME                                       READY   STATUS
# cert-manager-5d7f97b46d-xxxxx             1/1     Running
# cert-manager-cainjector-69d885bf55-xxxxx  1/1     Running
# cert-manager-webhook-54754dcdfd-xxxxx     1/1     Running
```

### 16.2 Otomatik Sertifika Yenileme

```yaml
# Certificate Resource
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: isbul-tls
  namespace: isbul-production
spec:
  secretName: isbul-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - isbul.online
    - www.isbul.online
    - api.isbul.online
  duration: 2160h      # 90 days
  renewBefore: 720h    # Renew 30 days before expiry
  privateKey:
    algorithm: RSA
    size: 2048
    rotationPolicy: Always
  
# Cert-Manager otomatik olarak:
# 1. Sertifika bitiş tarihini izler
# 2. 30 gün kala yenileme başlatır
# 3. ACME challenge gerçekleştirir
# 4. Yeni sertifikayı Secret'a kaydeder
# 5. Ingress otomatik güncellenir
# 6. POD RESTART GEREKMEZi!
```

### 16.3 ACME Challenge Metodları

#### 16.3.1 HTTP-01 Challenge:
```yaml
solvers:
  - http01:
      ingress:
        class: nginx
        
# Let's Encrypt validation:
# 1. Creates: /.well-known/acme-challenge/TOKEN
# 2. Checks: http://isbul.online/.well-known/acme-challenge/TOKEN
# 3. If valid → Issues certificate
```

#### 16.3.2 DNS-01 Challenge (Wildcard için):
```yaml
solvers:
  - dns01:
      route53:
        region: eu-central-1
        accessKeyID: AKIA...
        secretAccessKeySecretRef:
          name: route53-credentials
          key: secret-access-key

# For wildcard certificates:
# *.isbul.online
```

### 16.4 Certificate Monitoring

```yaml
# Alert when certificate expires soon
- alert: CertificateExpiringSoon
  expr: certmanager_certificate_expiration_timestamp_seconds - time() < (21 * 24 * 3600)
  for: 1h
  labels:
    severity: warning
  annotations:
    summary: "Certificate expiring in < 21 days"
    description: "Certificate {{ $labels.name }} expires in {{ $value | humanizeDuration }}"
```

### 16.5 SSH Sertifika Bozulması Senaryosu

```yaml
# Problem: Let's Encrypt rate limit veya network sorunu
# Çözüm: Cert-manager retry mekanizması

# Certificate Status
kubectl describe certificate isbul-tls -n isbul-production

# Events:
# Normal   Issuing    Certificate is being issued
# Warning  Failed     Failed to issue certificate
# Normal   Retry      Retrying in 10m

# Manual force renew
kubectl delete certificaterequest <request-name> -n isbul-production

# Cert-manager yeni istek oluşturur ve otomatik retry yapar
# Pod restart GEREKMEZ, certificate Secret güncellendiğinde
# Ingress controller otomatik yeni sertifikayı kullanır
```

### 16.6 Backup Certificate Strategy

```bash
# Backup certificate secret
kubectl get secret isbul-tls -n isbul-production -o yaml > isbul-tls-backup.yaml

# Restore if needed
kubectl apply -f isbul-tls-backup.yaml

# Velero ile otomatik backup
velero backup create isbul-certs \
  --include-namespaces isbul-production \
  --selector app=cert-manager
```

---

## 17. PROGRESSIVE WEB APP (PWA)

### 17.1 PWA Nedir?

Progressive Web App, web teknolojileri kullanılarak native mobil uygulama deneyimi sunan web uygulamalarıdır.

**Avantajları:**
- Offline çalışma
- Ana ekrana ekleme
- Push notifications
- Hızlı yükleme
- App store gerektirmez
- SEO friendly

### 17.2 Web App Manifest

```json
// manifest.json
{
  "name": "İşBul - Freelance İş Platformu",
  "short_name": "İşBul",
  "description": "Müşteriler ve freelance uzmanları buluşturan platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#4A90E2",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    {
      "src": "/assets/img/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/img/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/img/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/img/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/img/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/img/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/img/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/img/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "productivity"],
  "shortcuts": [
    {
      "name": "Uzmanlar",
      "short_name": "Uzmanlar",
      "description": "Uzman listesine git",
      "url": "/uzmanlar.html",
      "icons": [{ "src": "/assets/img/shortcut-experts.png", "sizes": "96x96" }]
    },
    {
      "name": "Profil",
      "short_name": "Profil",
      "description": "Profilime git",
      "url": "/profil.html",
      "icons": [{ "src": "/assets/img/shortcut-profile.png", "sizes": "96x96" }]
    }
  ],
  "screenshots": [
    {
      "src": "/assets/img/screenshot1.png",
      "sizes": "1280x720",
      "type": "image/png"
    },
    {
      "src": "/assets/img/screenshot2.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ]
}
```

### 17.3 Service Worker

```javascript
// sw.js
const CACHE_NAME = 'isbul-v1.0.0';
const RUNTIME_CACHE = 'isbul-runtime';

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/uzmanlar.html',
  '/profil.html',
  '/assets/css/styles.css',
  '/assets/css/mobile.css',
  '/assets/js/app.js',
  '/assets/js/api-client.js',
  '/manifest.json',
  '/assets/img/icon-192x192.png',
  '/assets/img/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
  
  // Static assets - cache first, network fallback
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          
          return response;
        });
      })
  );
});

// Background sync (future feature)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-jobs') {
    event.waitUntil(syncJobs());
  }
});

// Push notifications (future feature)
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/assets/img/icon-192x192.png',
    badge: '/assets/img/badge.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

### 17.4 PWA Install Prompt

```javascript
// pwa.js
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show custom install button
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'block';
    
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('PWA installed');
          installButton.style.display = 'none';
        }
        
        deferredPrompt = null;
      }
    });
  }
});

// Track installation
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  // Analytics tracking
  if (window.gtag) {
    gtag('event', 'pwa_install', {
      'event_category': 'engagement',
      'event_label': 'PWA Installation'
    });
  }
});

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              showUpdateNotification();
            }
          });
        });
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}

function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <p>Yeni sürüm mevcut!</p>
    <button onclick="window.location.reload()">Güncelle</button>
  `;
  document.body.appendChild(notification);
}
```

### 17.5 Mobil UI Optimizations

```css
/* mobile.css */
/* Bottom Navigation Bar */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
}

.bottom-nav-item.active {
  color: #4A90E2;
}

.bottom-nav-item i {
  font-size: 24px;
  margin-bottom: 4px;
}

.bottom-nav-item span {
  font-size: 11px;
}

/* Touch-friendly buttons */
.btn-mobile {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
  font-size: 16px;
}

/* Pull to refresh */
.ptr-indicator {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  transition: top 0.3s;
}

.ptr-indicator.active {
  top: 10px;
}

/* Safe area for notch devices */
@supports (padding: max(0px)) {
  .bottom-nav {
    padding-bottom: max(0px, env(safe-area-inset-bottom));
  }
}

/* Viewport height fix for mobile browsers */
.full-height {
  height: 100vh;
  height: -webkit-fill-available;
}
```

### 17.6 Offline Support

```javascript
// Offline detection
window.addEventListener('online', () => {
  document.body.classList.remove('offline');
  showToast('İnternet bağlantısı geri geldi');
  syncPendingData();
});

window.addEventListener('offline', () => {
  document.body.classList.add('offline');
  showToast('İnternet bağlantısı yok - Offline modda çalışıyorsunuz');
});

// Queue actions when offline
const offlineQueue = [];

function queueAction(action) {
  if (!navigator.onLine) {
    offlineQueue.push(action);
    saveToIndexedDB('offlineQueue', offlineQueue);
    return true;
  }
  return false;
}

function syncPendingData() {
  loadFromIndexedDB('offlineQueue').then(queue => {
    queue.forEach(action => {
      performAction(action);
    });
    clearIndexedDB('offlineQueue');
  });
}
```

---

## 18. KARŞILAŞILAN ZORLUKLAR VE ÇÖZÜMLER

### 18.1 Google OAuth Entegrasyonu

**Zorluk:** Google OAuth redirect sonrası CORS hatası ve sertifika doğrulama sorunları.

**Çözüm:**
```javascript
// 1. Google Cloud Console'da doğru redirect URI eklendi
Authorized redirect URIs:
- https://isbul.online/oauth-callback.html
- http://localhost:3000/oauth-callback (development)

// 2. Backend CORS konfigürasyonu
const corsOptions = {
  origin: ['https://isbul.online', 'http://localhost:3000'],
  credentials: true
};

// 3. Site verification eklendi
<meta name="google-site-verification" content="kbXZArOhnsekt1hmE0NEmGcfD9jAlAoM8iArzkaIcLM" />
```

### 18.2 Kubernetes Deployment İlk Deneme

**Zorluk:** Pod'lar CrashLoopBackOff durumunda kalıyordu.

**Çözüm:**
```yaml
# 1. Health check endpoints eklendi
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30  # Uygulama başlatma süresi

# 2. Resource limits düzenlendi
resources:
  requests:
    memory: "256Mi"  # Minimum gereksinim
    cpu: "250m"
  limits:
    memory: "512Mi"  # Maximum limit
    cpu: "500m"

# 3. Image pull policy düzeltildi
imagePullPolicy: Always  # Her zaman latest image çek
```

### 18.3 MongoDB Connection Pooling

**Zorluk:** Yüksek trafikte "Too many connections" hatası.

**Çözüm:**
```javascript
// Connection pool konfigürasyonu
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,        // Maximum 10 connection
  minPoolSize: 2,         # Minimum 2 connection
  maxIdleTimeMS: 30000,   // 30 seconds idle timeout
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});

// Connection monitoring
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
```

### 18.4 SSL Certificate Renewal Hatası

**Zorluk:** Let's Encrypt rate limit nedeniyle sertifika yenilenemedi.

**Çözüm:**
```yaml
# 1. Staging issuer ile test edildi
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory

# 2. DNS-01 challenge kullanıldı (HTTP-01 yerine)
solvers:
  - dns01:
      route53:
        region: eu-central-1

# 3. Renewal grace period artırıldı
renewBefore: 720h  # 30 days before expiry
```

### 18.5 Docker Image Boyutu

**Zorluk:** İlk Docker image 1.2 GB'dı, deployment çok yavaştı.

**Çözüm:**
```dockerfile
# Multi-stage build kullanıldı
FROM node:18-alpine AS builder  # Alpine Linux (5MB)
# ... build steps ...

FROM node:18-alpine              # Production stage
# Sadece gerekli dosyalar kopyalandı

# Sonuç: 1.2 GB → 180 MB (%85 azalma)
```

### 18.6 Prometheus Disk Dolması

**Zorluk:** Prometheus metrics 15 GB disk doldurdu.

**Çözüm:**
```yaml
args:
  - '--storage.tsdb.retention.time=15d'  # 90 günden 15 güne düşürüldü
  - '--storage.tsdb.retention.size=10GB' # Maximum 10GB
  
# PVC boyutu artırıldı
resources:
  requests:
    storage: 20Gi  # 10GB'dan 20GB'ye
```

### 18.7 WebSocket Connection Drops

**Zorluk:** Load balancer WebSocket bağlantılarını kesiyordu.

**Çözüm:**
```yaml
# NGINX Ingress annotation
annotations:
  nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
  nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
  nginx.ingress.kubernetes.io/websocket-services: "message-service"

# Session affinity eklendi
sessionAffinity: ClientIP
```

### 18.8 Flutter Build Hataları

**Zorluk:** Flutter build Android için cleartext traffic hatası.

**Çözüm:**
```xml
<!-- AndroidManifest.xml -->
<application
  android:usesCleartextTraffic="true">
  
<!-- network_security_config.xml -->
<domain-config cleartextTrafficPermitted="true">
  <domain includeSubdomains="true">isbul.online</domain>
  <domain includeSubdomains="true">10.0.2.2</domain> <!-- Android emulator -->
</domain-config>
```

### 18.9 Rate Limiting Redis Bağlantı Sorunu

**Zorluk:** Redis connection timeout, rate limiting çalışmıyordu.

**Çözüm:**
```javascript
// Redis client retry stratejisi
const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error('Redis retry limit exceeded');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

// Fallback mechanism
const rateLimitMiddleware = async (req, res, next) => {
  try {
    // Redis-based rate limiting
    await checkRateLimit(req.ip);
    next();
  } catch (error) {
    // Fallback to in-memory rate limiting
    if (memoryRateLimiter.check(req.ip)) {
      next();
    } else {
      res.status(429).json({ error: 'Too many requests' });
    }
  }
};
```

### 18.10 CI/CD Pipeline GitHub Actions Timeout

**Zorluk:** Docker build 10 dakikayı aşıyor, timeout oluşuyordu.

**Çözüm:**
```yaml
# Build cache kullanımı
- name: Build Docker image
  uses: docker/build-push-action@v4
  with:
    context: .
    push: true
    tags: ${{ secrets.ECR_REGISTRY }}/isbul:latest
    cache-from: type=registry,ref=${{ secrets.ECR_REGISTRY }}/isbul:buildcache
    cache-to: type=registry,ref=${{ secrets.ECR_REGISTRY }}/isbul:buildcache,mode=max

# Sonuç: 10 dakika → 2 dakika (%80 iyileşme)
```

---

## 19. GELECEK GELİŞTİRMELER

### 19.1 Kısa Vadeli (1-3 Ay)

#### 19.1.1 Ödeme Entegrasyonu:
- **Stripe/PayPal** entegrasyonu
- Escrow sistemi (güvenli ödeme)
- Otomatik fatura oluşturma
- Ödeme geçmişi ve raporlama

```javascript
// Stripe Integration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount, currency) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // cents
    currency: currency,
    payment_method_types: ['card'],
  });
  
  return paymentIntent.client_secret;
};
```

#### 19.1.2 Gerçek Zamanlı Mesajlaşma:
- **Socket.io** veya **WebSocket** entegrasyonu
- Anlık bildirimler
- Typing indicator
- Read receipts
- File sharing

```javascript
// Socket.io Server
io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });
  
  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });
});
```

#### 19.1.3 Push Notifications:
- **Firebase Cloud Messaging (FCM)**
- Web push notifications
- Email notifications
- SMS notifications (Twilio)

#### 19.1.4 Advanced Search:
- **Elasticsearch** entegrasyonu
- Full-text search
- Fuzzy matching
- Faceted search (filters)
- Auto-complete

```yaml
# Elasticsearch deployment
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: elasticsearch
spec:
  serviceName: elasticsearch
  replicas: 3
  template:
    spec:
      containers:
      - name: elasticsearch
        image: docker.elastic.co/elasticsearch/elasticsearch:8.9.0
        env:
        - name: discovery.type
          value: "zen"
```

### 19.2 Orta Vadeli (3-6 Ay)

#### 19.2.1 Video Call Entegrasyonu:
- **WebRTC** video conferencing
- **Agora/Twilio** video SDK
- Screen sharing
- Recording

#### 19.2.2 AI/ML Özellikleri:
- Uzman önerme sistemi (Recommendation Engine)
- Fiyat tahmini (Price Prediction)
- Fraud detection
- Chatbot (Customer Support)

```python
# Recommendation System
from sklearn.neighbors import NearestNeighbors

def recommend_experts(user_preferences, expert_data):
    model = NearestNeighbors(n_neighbors=5, algorithm='ball_tree')
    model.fit(expert_data)
    distances, indices = model.kneighbors([user_preferences])
    return indices[0]
```

#### 19.2.3 Multi-Language Support:
- i18n (Internationalization)
- English, Turkish, Arabic
- RTL support
- Currency conversion

```javascript
// i18next configuration
import i18n from 'i18next';

i18n.init({
  lng: 'tr',
  resources: {
    tr: { translation: require('./locales/tr.json') },
    en: { translation: require('./locales/en.json') }
  }
});
```

#### 19.2.4 Mobile Apps (Native):
- **React Native** veya **Flutter** production build
- App Store deployment
- Google Play deployment
- Deep linking
- Push notifications

### 19.3 Uzun Vadeli (6-12 Ay)

#### 19.3.1 Multi-Tenancy:
- White-label solution
- Custom domains per tenant
- Isolated databases
- Tenant-specific branding

#### 19.3.2 Advanced Analytics:
- **Apache Kafka** for event streaming
- **Apache Spark** for big data processing
- **Tableau/Metabase** for BI dashboards
- Machine learning insights

```yaml
# Kafka deployment
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: kafka
spec:
  serviceName: kafka
  replicas: 3
  template:
    spec:
      containers:
      - name: kafka
        image: confluentinc/cp-kafka:7.4.0
```

#### 19.3.3 Blockchain Integration:
- Smart contracts (Ethereum/Polygon)
- Cryptocurrency payments
- NFT certificates
- Decentralized identity

#### 19.3.4 API Marketplace:
- Public API documentation
- API keys & rate limiting
- Webhook support
- Third-party integrations

```yaml
# API Gateway with Kong
apiVersion: v1
kind: Service
metadata:
  name: kong-proxy
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8000
    protocol: TCP
  selector:
    app: kong
```

#### 19.3.5 Geographical Expansion:
- Multi-region deployment
- CDN optimization
- Region-specific compliance (GDPR, KVKK)
- Local payment methods

### 19.4 DevOps İyileştirmeleri

#### 19.4.1 GitOps:
- **ArgoCD** for continuous deployment
- Infrastructure as Code (Terraform)
- Config management (Helm charts)

#### 19.4.2 Chaos Engineering:
- **Chaos Mesh** for Kubernetes
- Fault injection testing
- Disaster recovery drills

```yaml
# Chaos Mesh - Pod Failure
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: pod-failure
spec:
  action: pod-failure
  mode: one
  selector:
    namespaces:
      - isbul-production
    labelSelectors:
      app: isbul-api
```

#### 19.4.3 Advanced Monitoring:
- Distributed tracing (Jaeger)
- Log aggregation (ELK stack)
- APM (Application Performance Monitoring)
- Cost monitoring & optimization

#### 19.4.4 Security Enhancements:
- **Vault** for secrets management
- **Falco** for runtime security
- **OPA** (Open Policy Agent) for policy enforcement
- Regular penetration testing

```yaml
# Vault deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vault
spec:
  template:
    spec:
      containers:
      - name: vault
        image: vault:1.14
        env:
        - name: VAULT_DEV_ROOT_TOKEN_ID
          value: root
```

### 19.5 Performans İyileştirmeleri

#### 19.5.1 Database Optimization:
- **MongoDB sharding** for horizontal scaling
- **Read replicas** for read-heavy operations
- **Caching layer** with Redis Cluster
- Query optimization & indexing

#### 19.5.2 Frontend Optimization:
- **Code splitting** (lazy loading)
- **Image optimization** (WebP, AVIF)
- **CDN caching** strategies
- **Server-Side Rendering (SSR)**

```javascript
// Next.js SSR
export async function getServerSideProps(context) {
  const experts = await fetchExperts();
  return {
    props: { experts }
  };
}
```

#### 19.5.3 Backend Optimization:
- **GraphQL** instead of REST (reduce overfetching)
- **gRPC** for microservice communication
- **Async processing** with message queues
- **Database connection pooling**

---

## 20. SONUÇ VE KAZANIMLAR

### 20.1 Proje Özeti

İşBul platformu, modern yazılım geliştirme pratiklerini ve bulut teknolojilerini kullanarak sıfırdan geliştirilmiş, tam kapsamlı bir freelance iş eşleştirme platformudur. Proje kapsamında:

**Geliştirilen Bileşenler:**
- ✅ 22 sayfalık responsive web uygulaması (PWA)
- ✅ Flutter cross-platform mobil uygulama
- ✅ RESTful API ve mikroservis mimarisi
- ✅ Kubernetes orchestration
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Monitoring stack (Prometheus + Grafana)
- ✅ SSL/TLS otomatik yönetimi (Cert-Manager)
- ✅ AWS bulut altyapısı

**Teknik Metrikler:**
- **Kod Satırı:** ~15,000+ LOC
- **Deployment Süresi:** <5 dakika (CI/CD ile)
- **Uptime Hedefi:** %99.9
- **Response Time:** <200ms (p95)
- **Container Images:** 8 adet
- **Kubernetes Pods:** 15+ (production)
- **Monitored Metrics:** 100+

### 20.2 Teknik Kazanımlar

#### 20.2.1 Frontend Development:
- **Modern Web:** HTML5, CSS3, ES6+ JavaScript
- **Responsive Design:** Mobile-first approach, media queries
- **PWA:** Service Workers, offline support, installable
- **UI/UX:** Accessibility, performance optimization
- **Cross-Browser:** Chrome, Firefox, Safari, Edge uyumluluğu

#### 20.2.2 Mobile Development:
- **Flutter:** Widget-based architecture, state management
- **Dart Programming:** Null safety, async/await
- **Material Design:** Component library
- **API Integration:** HTTP client, JSON serialization
- **Platform-Specific:** Android manifest, iOS configuration

#### 20.2.3 Backend Development:
- **Node.js:** Event-driven, non-blocking I/O
- **Express.js:** Routing, middleware, error handling
- **MongoDB:** NoSQL design, indexing, aggregation
- **Redis:** Caching strategies, session management
- **RESTful API:** Resource design, versioning, documentation

#### 20.2.4 Microservices Architecture:
- **Service Design:** Single responsibility, loose coupling
- **Inter-Service Communication:** HTTP, message queues
- **API Gateway:** Request routing, rate limiting
- **Service Discovery:** DNS-based, health checks
- **Circuit Breaker:** Fault tolerance patterns

#### 20.2.5 DevOps & Cloud:
- **Docker:** Containerization, multi-stage builds
- **Kubernetes:** Deployment, services, ingress, HPA
- **AWS:** EC2, S3, RDS, CloudFront, Route 53
- **CI/CD:** GitHub Actions, automated testing & deployment
- **IaC:** YAML manifests, configuration management

#### 20.2.6 Monitoring & Observability:
- **Prometheus:** Metrics collection, alerting
- **Grafana:** Dashboard creation, visualization
- **Logging:** Structured logging, log aggregation
- **Tracing:** Distributed tracing concepts
- **Alerting:** Threshold-based alerts, notification channels

#### 20.2.7 Security:
- **Authentication:** OAuth 2.0, JWT tokens
- **Authorization:** Role-based access control (RBAC)
- **Encryption:** bcrypt password hashing, TLS/SSL
- **Security Headers:** Helmet.js, CORS, CSP
- **Input Validation:** XSS prevention, SQL injection protection

### 20.3 Soft Skills Kazanımları

#### 20.3.1 Problem Çözme:
- Karmaşık sistemleri küçük parçalara bölme
- Root cause analysis
- Alternative çözüm yaklaşımları geliştirme
- Debug ve troubleshooting

#### 20.3.2 Dokümantasyon:
- Teknik dokümantasyon yazımı
- API documentation (OpenAPI/Swagger)
- README ve setup kılavuzları
- Architecture decision records (ADR)

#### 20.3.3 Proje Yönetimi:
- Task breakdown ve prioritization
- Sprint planning
- Timeline estimation
- Risk management

#### 20.3.4 Araştırma ve Öğrenme:
- Yeni teknolojileri hızlı öğrenme
- Official documentation okuma
- Stack Overflow, GitHub Issues araştırma
- Best practices takibi

### 20.4 İş Dünyasına Hazırlık

Bu staj süreci, gerçek dünya yazılım geliştirme süreçlerini deneyimleme fırsatı sundu:

**Production-Ready Skills:**
- Enterprise-level architecture tasarımı
- Scalability ve performance considerations
- Security best practices
- Cost optimization
- High availability design

**Industry Standards:**
- 12-Factor App principles
- RESTful API design guidelines
- Semantic versioning
- Git workflow (branching, PR, code review)
- Agile/Scrum metodolojisi

**Tools & Platforms:**
- AWS cloud services
- Kubernetes container orchestration
- CI/CD automation
- Monitoring ve alerting
- Version control (Git/GitHub)

### 20.5 Öğrenilen Dersler

#### 20.5.1 Mimari Kararlar:
- **Doğru:** Mikroservis mimarisi ölçeklenebilirlik sağladı
- **İyileştirilebilir:** İlk aşamada monolith başlanabilirdi (daha hızlı MVP)

#### 20.5.2 Teknoloji Seçimleri:
- **Doğru:** Kubernetes production-grade stability sağladı
- **Doğru:** PWA ile hem web hem mobil deneyim sunuldu
- **İyileştirilebilir:** TypeScript kullanılabilirdi (type safety)

#### 20.5.3 DevOps Practices:
- **Doğru:** CI/CD erken aşamada kuruldu, deployment hızlandı
- **Doğru:** Monitoring ve alerting baştan planlandı
- **İyileştirilebilir:** Infrastructure as Code (Terraform) kullanılabilirdi

### 20.6 Kişisel Gelişim

**Teknik Yetkinlik:**
- Beginner → Intermediate seviyeye geçiş
- 10+ yeni teknoloji öğrenildi
- Production environment deneyimi kazanıldı

**Özgüven:**
- Karmaşık problemleri çözme becerisi
- Büyük kod tabanlarını yönetme yeteneği
- Yeni teknolojileri hızlı öğrenme güveni

**Kariyer Hedefleri:**
- Full-Stack Developer rolüne hazırlık
- DevOps Engineer yolunda ilk adımlar
- Cloud Architect perspektifi kazanıldı

### 20.7 Teşekkürler

Bu staj sürecinde:
- Yeni teknolojileri özgürce deneme imkanı
- Hata yapma ve öğrenme ortamı
- Modern yazılım geliştirme pratiklerini uygulama fırsatı

sağlandı.

---

## EKLER

### Ek A: Teknoloji Listesi (Tam)

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- PWA (Service Workers, Web App Manifest)
- Flutter, Dart

**Backend:**
- Node.js 18.x, Express.js
- MongoDB, Mongoose, Redis

**Cloud & Infrastructure:**
- AWS (EC2, S3, RDS, CloudFront, Route 53, ELB, VPC, IAM, CloudWatch)
- Docker, Kubernetes
- NGINX Ingress Controller
- Cert-Manager, Let's Encrypt

**CI/CD & DevOps:**
- GitHub, GitHub Actions
- Docker Hub, AWS ECR

**Monitoring:**
- Prometheus, Grafana, AlertManager
- Node Exporter, kube-state-metrics

**Security:**
- OAuth 2.0, JWT, bcrypt
- Helmet.js, CORS, Rate Limiting
- SSL/TLS (Let's Encrypt)

**Development Tools:**
- VS Code, Git, Postman
- MongoDB Compass, Chrome DevTools

### Ek B: Proje Dosya Yapısı

```
isbul/
├── *.html (22 files)           # Web pages
├── assets/
│   ├── css/                    # Stylesheets
│   ├── js/                     # JavaScript
│   └── img/                    # Images
├── flutter_app/                # Mobile app
│   ├── lib/
│   ├── android/
│   └── pubspec.yaml
├── server/                     # Backend API
│   ├── src/
│   ├── tests/
│   └── package.json
├── k8s/                        # Kubernetes manifests
│   ├── deployments/
│   ├── services/
│   └── ingress/
├── .github/workflows/          # CI/CD
├── manifest.json               # PWA manifest
├── sw.js                       # Service Worker
└── README.md
```

### Ek C: Referanslar ve Kaynaklar

**Official Documentation:**
- https://kubernetes.io/docs/
- https://docs.docker.com/
- https://aws.amazon.com/documentation/
- https://flutter.dev/docs
- https://nodejs.org/docs/
- https://mongoosejs.com/docs/
- https://prometheus.io/docs/
- https://grafana.com/docs/

**Community Resources:**
- Stack Overflow
- GitHub Issues & Discussions
- Medium Articles
- Dev.to

**Tools:**
- ChatGPT & AI Assistants
- Postman Documentation
- Docker Hub

---

## RAPOR SONU

**Hazırlayan:** [Adınız Soyadınız]  
**Öğrenci No:** [Öğrenci Numaranız]  
**Tarih:** 18 Ağustos 2026  
**İmza:** _______________

**Staj Yeri Onayı:**  
**Yetkili Adı:** _______________  
**İmza:** _______________  
**Tarih:** _______________

---

*Bu rapor, İşBul platformu geliştirme sürecinde kazanılan deneyimleri ve teknik bilgileri içermektedir. Raporda yer alan tüm bilgiler gerçek proje deneyimlerine dayanmaktadır.*

**Toplam Sayfa:** ~60 sayfa  
**Kelime Sayısı:** ~18,000+ kelime  
**Kod Örneği:** 50+ snippet
