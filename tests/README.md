# 🤖 İsBul Hibrit Test Sistemi

**Playwright + Groq AI Vision** - Otomatik web test aracı

## 🎯 Özellikler

### 🔧 Playwright Teknikleri Testler:
- ✅ Sayfa yükleme süreleri
- ✅ HTTP status kontrolleri
- ✅ Console hatalarını yakala
- ✅ Network hatalarını tespit et
- ✅ Accessibility kontrolleri (WCAG)
- ✅ Kırık resim tespiti
- ✅ Küçük buton kontrolü (< 44x44px)
- ✅ Link kontrast analizi
- ✅ H1 heading kontrolü
- ✅ Facebook login butonu tespiti (olmamalı)
- ✅ Google login varlığı
- ✅ Error mesajları sayfada var mı?
- ✅ Sonsuz loading tespiti

### 🧠 Groq AI Vision Analizleri:
- ✅ İnsan gibi görsel analiz
- ✅ Layout bozuklukları
- ✅ Renk kontrastı değerlendirmesi
- ✅ UX sorunları
- ✅ Yazım hataları
- ✅ Tasarım tutarsızlıkları
- ✅ Mobile responsive sorunları
- ✅ Buton ve link listesi çıkarma
- ✅ Footer analizi

### 📸 Ekran Görüntüleri:
- 🖥️ Desktop (1920x1080)
- 📱 Mobile (375x667)
- 💾 PNG formatında kayıt

### 📊 Raporlar:
- 📄 JSON rapor (otomatik işleme için)
- 🌐 HTML rapor (görsel inceleme için)
- 📈 Özet istatistikler
- 🎯 Kritik sorun işaretlemesi

---

## 🚀 Kurulum

```powershell
# 1. Klasöre git
cd c:\Users\umity\Desktop\ufakisler\isbul\tests

# 2. Paketleri yükle (ilk seferde)
npm install

# 3. Playwright tarayıcısını yükle (ilk seferde)
npm run install-browsers
```

---

## ⚡ Kullanım

### Tek Komutla Çalıştır:
```powershell
npm test
```

### Test Süresi:
- **Playwright testleri:** ~2-3 dakika (17 sayfa)
- **Groq AI analizi:** ~8-10 dakika (her sayfa ~30-45 saniye)
- **TOPLAM:** ~10-15 dakika

---

## 📂 Çıktılar

### Klasör Yapısı:
```
tests/
├── screenshots/          # Tüm ekran görüntüleri
│   ├── index-desktop.png
│   ├── index-mobile.png
│   ├── admin-panel-desktop.png
│   └── ...
├── reports/              # Test raporları
│   ├── test-report-[timestamp].html  # Görsel rapor
│   └── test-report-[timestamp].json  # JSON rapor
└── hybrid-tester.js      # Ana test dosyası
```

### Raporları Açma:
```powershell
# HTML raporunu aç (tarayıcıda)
explorer reports\test-report-[timestamp].html

# Screenshots klasörünü aç
explorer screenshots
```

---

## 🎨 HTML Rapor İçeriği

Raporlarda şunlar bulunur:

### 📊 Özet Kartları:
- ✅ Başarılı testler
- ❌ Hatalı testler  
- ⚠️ Uyarılar
- 📈 Toplam test sayısı

### Her Sayfa için:
1. **Teknik Metrikler:**
   - Yükleme süresi
   - HTTP status
   - Console hataları
   - Network hataları

2. **Accessibility Sorunları:**
   - Eksik alt text
   - Label sorunları
   - Küçük butonlar
   - Kontrast sorunları

3. **Groq AI Analizi:**
   - Kritik hatalar
   - Uyarılar
   - Olumlu gözlemler
   - Genel değerlendirme

4. **Ekran Görüntüleri:**
   - Desktop görünüm
   - Mobile görünüm

---

## 🔧 Yapılandırma

### .env Dosyası:
```env
GROQ_API_KEY=your_api_key_here
SITE_URL=https://isbul.online
```

### Test Edilecek Sayfalar:
`hybrid-tester.js` dosyasındaki `PAGES` array'ini düzenle:

```javascript
const PAGES = [
  { name: 'Ana Sayfa', path: 'index.html', critical: true },
  { name: 'Yeni Sayfa', path: 'yeni-sayfa.html', critical: false },
  // ...
];
```

### Viewport Boyutları:
```javascript
const CONFIG = {
  viewports: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  }
};
```

---

## 🐛 Yaygın Sorunlar

### 1. Groq AI timeout:
**Sorun:** AI analizi çok uzun sürüyor
**Çözüm:** `AI_TIMEOUT` değerini artır (varsayılan: 45 saniye)

### 2. "Model decommissioned" hatası:
**Sorun:** Groq modeli kaldırılmış
**Çözüm:** `model: "qwen/qwen3.6-27b"` güncel modeli kullan

### 3. Screenshot alamıyor:
**Sorun:** Playwright tarayıcısı yüklü değil
**Çözüm:** `npm run install-browsers` çalıştır

### 4. API 503 hatası:
**Sorun:** Backend sunucusu çalışmıyor
**Çözüm:** API sunucusunu başlat veya bu hatayı görmezden gel

---

## 📝 Test Sonuçlarını Yorumlama

### Status Seviyeleri:

#### ✅ SUCCESS (Başarılı):
- HTTP 200
- Sıfır console hatası
- AI analizi pozitif
- Kritik sorun yok

#### ⚠️ WARNING (Uyarı):
- Console hatası var (1-3 adet)
- Network hatası var
- Accessibility sorunları
- AI minor uyarıları

#### ❌ ERROR (Hatalı):
- HTTP 4xx/5xx
- Çok fazla console hatası (>3)
- Kritik AI hatası
- Sayfa açılmıyor

---

## 💡 Kullanım Senaryoları

### 1. Deployment Öncesi Test:
```powershell
# Production'a geçmeden önce
npm test
# Raporları incele, hataları düzelt
```

### 2. Düzenli Kalite Kontrolü:
```powershell
# Her hafta Pazartesi sabahı
npm test
# Sonuçları ekiple paylaş
```

### 3. Bug Hunting:
```powershell
npm test
# Screenshots ile bugları görselleştir
# JSON rapordan detaylı bilgi al
```

### 4. Accessibility Audit:
```powershell
npm test
# HTML rapordan Accessibility bölümünü incele
# WCAG uyumluluğu için düzeltmeler yap
```

---

## 🎯 Ne Buluyor?

### Gerçek Örnekler:

#### ❌ Bulduğu Hatalar:
- "Admin Panel açılmıyor - içerik yok"
- "Facebook login butonu var (olmamalı!)"
- "10 input'ta label eksik"
- "5 buton çok küçük (< 44x44px)"
- "API 503 hatası - sunucu down"
- "2 kırık resim bulundu"
- "Loading indicator sonsuz dönüyor"

#### ⚠️ Bulduğu Uyarılar:
- "Renk kontrastı düşük"
- "H1 başlığı yok (SEO sorunu)"
- "3 console error var"
- "Yazım hatası: 'Uzaman' yerine 'Uzman'"
- "Footer linki yanlış sayfaya gidiyor"

#### ✅ Olumlu Bulgular:
- "Sayfanın tasarımı modern ve tutarlı"
- "Google login düzgün çalışıyor"
- "Mobile responsive tasarım iyi"
- "Yükleme süresi hızlı (< 1000ms)"

---

## 🔄 Otomatik Çalıştırma

### Windows Task Scheduler ile:
1. Task Scheduler'ı aç
2. "Create Basic Task"
3. Trigger: Haftalık / Günlük
4. Action: Start Program
5. Program: `powershell.exe`
6. Arguments: `-File "C:\Users\umity\Desktop\ufakisler\isbul\tests\run-test.ps1"`

### run-test.ps1:
```powershell
cd "C:\Users\umity\Desktop\ufakisler\isbul\tests"
npm test
# Raporları email ile gönder (opsiyonel)
```

---

## 📞 Destek

Sorularınız için:
- GitHub Issues
- Email: [destek email]
- Docs: Bu README

---

## 📜 Lisans

Bu proje İsBul için özel olarak geliştirilmiştir.

---

## 🎉 Katkıda Bulunanlar

- **Geliştirici:** Kiro AI
- **Tarih:** Ağustos 2026
- **Versiyon:** 1.0.0

---

**Not:** Bu sistem sürekli geliştirilmektedir. Yeni özellik önerileri için lütfen iletişime geçin!
