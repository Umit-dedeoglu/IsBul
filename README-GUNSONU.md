# İşBul - Canlısonrası Gün Sonu Yedeği

**Tarih:** 18 Ağustos 2026  
**Branch:** canlisonrasi_gunsonu  
**Durum:** Günün sonunda tam yedek

---

## 📦 İçerik

### 🌐 Web Uygulaması (PWA)
- ✅ 22 HTML sayfası (Ana sayfa, Uzmanlar, Profil, Admin vb.)
- ✅ PWA desteği (manifest.json, service worker)
- ✅ Mobil uyumlu (bottom nav, responsive)
- ✅ Google OAuth entegrasyonu
- ✅ Backend: isbul.online

### 📱 Flutter Mobil Uygulaması
**Klasör:** `flutter_app/`

**Tamamlanan Ekranlar:**
- ✅ Splash & Navigation
- ✅ Login & Register
- ✅ Ana Sayfa (Home)
- ✅ Uzmanlar Listesi & Detay
- ✅ Profil Ekranı

**Özellikler:**
- Modern gradient tasarım
- API entegrasyonu (isbul.online)
- Provider state management
- Shared Preferences (local storage)
- HTTP istemcisi

**Dosya Yapısı:**
```
flutter_app/
├── lib/
│   ├── main.dart
│   ├── models/ (User, Expert)
│   ├── services/ (API, Auth, Expert)
│   ├── screens/ (Auth, Home, Experts, Profile)
│   ├── theme/ (AppColors, Gradients)
│   └── widgets/ (Reusable components)
├── android/ (Manifest, Build config)
└── pubspec.yaml
```

### 🗂️ Diğer
- ✅ AWS deployment kılavuzu
- ✅ Backup klasörleri
- ✅ Git geçmişi

---

## 🚀 Kurulum (Flutter)

### Gereksinimler
- Flutter SDK (3.x+)
- Android Studio / VS Code
- Dart SDK

### Adımlar
```bash
cd flutter_app
flutter pub get
flutter run
```

---

## 🔗 Linkler
- **Backend API:** https://isbul.online
- **GitHub Repo:** https://github.com/Umit-dedeoglu/IsBul
- **Branch:** canlisonrasi_gunsonu

---

## 📝 Notlar
- Flutter uygulaması henüz test edilmedi (Flutter SDK kurulumu bekliyor)
- Web PWA canlıda test edildi
- Backend API hazır ve çalışıyor

---

**Yedekleme Zamanı:** 2026-08-18 (Gün Sonu)
