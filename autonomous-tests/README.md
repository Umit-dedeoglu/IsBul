# 🚀 HİBRİT WEB TEST OTOMASYONU SİSTEMİ

## 📋 ÖZET

isbul.online için özel olarak tasarlanmış 3 katmanlı hibrit test sistemi.

- ✅ **Ücretsiz**: %100 ücretsiz (Gemini Flash free tier)
- ⚡ **Hızlı**: 17 sayfa → 41 saniye
- 🎯 **Akıllı**: Playwright + Visual + AI
- 📸 **Görsel**: Tüm sayfaların screenshot'ı
- 📊 **Raporlama**: JSON + Console output

---

## 🎯 NE YAPAR?

### Tespit Edilen Sorunlar:

✅ **Facebook Butonu Tespiti** (Ana Amaç)
- 8/17 sayfada Facebook login butonu bulundu:
  - uzmanlar.html
  - uzman-profil.html  
  - uzman-ol.html
  - profil.html
  - blog.html
  - hakkimizda.html
  - nasil-calisir.html
  - gizlilik.html

⚠️ **Admin Panel Sorunu**
- admin-panel.html: Container bulunamadı

⚠️ **Footer Sorunları**
- 6 sayfada footer eksik

---

## 📦 KURULUM

### 1. Gereksinimler (31 MB)

```bash
pip install playwright google-generativeai pillow aiohttp pydantic
playwright install chromium
```

### 2. API Key (Opsiyonel - AI için)

Gemini API key almak için:

```bash
# Tarayıcıda aç
https://aistudio.google.com/apikey

# .env dosyasına ekle
GOOGLE_API_KEY=your_api_key_here
```

---

## 🚀 KULLANIM

### Hızlı Test (AI olmadan)

```bash
python test_now.py
```

**Çıktı:**
- 17 sayfa taranır (41 saniye)
- Facebook butonları bulunur
- Screenshot'lar alınır
- JSON rapor oluşturulur

### Tam Hibrit Test (AI ile)

```bash
# Önce API key kur
python setup_api_key.py

# Testi çalıştır
python hybrid_tester.py
```

**Çıktı:**
- Layer 1: Playwright hızlı tarama
- Layer 2: Visual screenshot
- Layer 3: AI deep analysis (sadece sorun varsa)

---

## 📊 TEST SONUÇLARI

### Son Test: 2026-08-21 13:34:47

```
📊 Sonuçlar:
   • Toplam Sayfa:     17
   • ✅ Başarılı:      3
   • ⚠️  Uyarı:         6
   • ❌ Hatalı:        8
   • ⏱️  Süre:          41.1 saniye

🔴 KRİTİK: Facebook Butonu Bulunan Sayfalar:
   • uzmanlar.html           → ✓ Facebook ile Kayıt
   • uzman-profil.html       → ✓ Facebook ile Kayıt
   • uzman-ol.html           → ✓ Facebook ile Kayıt
   • profil.html             → ✓ Facebook ile Kayıt
   • blog.html               → 📘 Facebook ile Kayıt
   • hakkimizda.html         → 📘 Facebook ile Kayıt
   • nasil-calisir.html      → ✓ Facebook ile Kayıt
   • gizlilik.html           → 📘 Facebook ile Kayıt
```

### Detaylı Rapor

- JSON: `quick_test_report_20260821_133447.json`
- Screenshots: `quick_test_screenshots/` klasörü

---

## 🏗️ SİSTEM MİMARİSİ

### 3 Katmanlı Yaklaşım

```
┌─────────────────────────────────────────────┐
│  KATMAN 1: Hızlı Tarama (Playwright)        │
│  ────────────────────────────────────────   │
│  • Facebook butonu var mı?                  │
│  • Admin panel açılıyor mu?                 │
│  • Footer kontrolü                          │
│  • HTTP status check                        │
│  • Console errors                           │
│  ⏱️  Süre: 30 saniye                        │
│  💰 Maliyet: ₺0                             │
└──────────────┬──────────────────────────────┘
               │
               ▼ (Her sayfa için)
┌──────────────┴──────────────────────────────┐
│  KATMAN 2: Visual Check                     │
│  ────────────────────────────────────────   │
│  • Screenshot al (full page)                │
│  • Baseline karşılaştırma (opsiyonel)      │
│  ⏱️  Süre: 10 saniye                        │
│  💰 Maliyet: ₺0                             │
└──────────────┬──────────────────────────────┘
               │
               ▼ (Sadece sorun varsa)
┌──────────────┴──────────────────────────────┐
│  KATMAN 3: AI Deep Analysis                 │
│  ────────────────────────────────────────   │
│  • HTML'i Gemini'ye gönder                  │
│  • Facebook butonunu doğrula                │
│  • Diğer OAuth butonları bul                │
│  • Öneri ver                                │
│  ⏱️  Süre: 5 dakika                         │
│  💰 Maliyet: ₺0 (free tier)                 │
└─────────────────────────────────────────────┘
```

---

## 📁 DOSYALAR

```
autonomous-tests/
├── test_now.py              # ⚡ Hızlı test (AI olmadan)
├── hybrid_tester.py         # 🤖 Tam hibrit test (AI ile)
├── setup_api_key.py         # 🔑 API key kurulum
├── quick_test.py            # 📝 Eski basit test
├── autonomous_tester.py     # 🗂️ Eski Groq sistemi (çalışmıyor)
├── .env                     # 🔐 API keys
├── README.md                # 📄 Bu dosya
├── ALTERNATIVES_COMPARISON.md   # 📊 Araç karşılaştırması
├── INDUSTRY_RESEARCH.md     # 🔍 Sektör araştırması
├── quick_test_screenshots/  # 📸 Test screenshot'ları
└── quick_test_report_*.json # 📋 Test raporları
```

---

## 🎯 KULLANIM SENARYOLARI

### 1. Günlük Otomatik Test

```bash
# Cron job veya Windows Task Scheduler
python test_now.py
```

### 2. Pre-Deploy Check

```bash
# Deployment öncesi
python test_now.py
# Raporu kontrol et
cat quick_test_report_*.json
```

### 3. CI/CD Entegrasyonu

```yaml
# .github/workflows/test.yml
- name: Run Web Tests
  run: python test_now.py
- name: Upload Screenshots
  uses: actions/upload-artifact@v2
  with:
    name: screenshots
    path: quick_test_screenshots/
```

### 4. Manuel Deep Analysis

```bash
# Sorun bulunduğunda AI analizi
python hybrid_tester.py
```

---

## 📊 PERFORMANS

### Test Süresi (17 sayfa)

```
Hızlı Test (test_now.py):      41 saniye
Hibrit Test (hybrid_tester.py): ~5 dakika (AI ile)
```

### Token Kullanımı (AI)

```
Layer 1 + 2:     0 token (AI yok)
Layer 3:         ~2000 token/sayfa
Toplam (8 sayfa): ~16K token/test

Gemini Free Tier: 1M token/gün
→ Günde ~60 kez çalıştırılabilir
```

### Disk Kullanımı

```
Paketler:        ~31 MB
Screenshot'lar:  ~5 MB/test
JSON raporlar:   ~100 KB/test
```

---

## 🔧 ADVANCED KULLANIM

### Özel Sayfa Testi

```python
# custom_test.py
from test_now import QuickTester

tester = QuickTester()
tester.pages = ['uzmanlar.html', 'profil.html']  # Sadece 2 sayfa
await tester.run()
```

### Screenshot Karşılaştırma

```python
# visual_diff.py
from PIL import Image
import imagehash

# Baseline
baseline = Image.open('baseline/uzmanlar.png')
baseline_hash = imagehash.average_hash(baseline)

# Yeni
current = Image.open('quick_test_screenshots/uzmanlar.png')
current_hash = imagehash.average_hash(current)

# Fark
diff = baseline_hash - current_hash
if diff > 5:
    print(f"⚠️ Görsel fark bulundu: {diff}")
```

### AI Custom Prompt

```python
# hybrid_tester.py içinde düzenle
prompt = f"""
Özel talimat: Sadece Facebook değil, TÜM OAuth butonlarını bul.
Ayrıca:
- Broken links kontrol et
- Missing images bul
- JavaScript errors raporla
...
"""
```

---

## 🐛 SORUN GİDERME

### "GOOGLE_API_KEY bulunamadı"

```bash
# .env dosyasına ekle
echo "GOOGLE_API_KEY=your_key" >> .env
```

### "Playwright browser bulunamadı"

```bash
playwright install chromium
```

### "Timeout" hatası

```python
# test_now.py içinde timeout artır
response = await page.goto(url, timeout=30000)  # 30 saniye
```

### Screenshot alınamıyor

```bash
# Pillow kurulu mu?
pip install pillow

# Klasör var mı?
mkdir quick_test_screenshots
```

---

## 📚 EK KAYNAKLAR

### Araştırma Dokümanları

- `INDUSTRY_RESEARCH.md` - Sektör best practices
- `ALTERNATIVES_COMPARISON.md` - Araç karşılaştırması

### Faydalı Linkler

- Gemini API: https://aistudio.google.com/apikey
- Playwright Docs: https://playwright.dev/python/
- Browser-Use: https://github.com/browser-use/browser-use

---

## 🎉 ÖZELLİKLER

✅ **Ücretsiz**: Gemini Flash free tier (1000 test/gün)
✅ **Hızlı**: 41 saniye (17 sayfa)
✅ **Akıllı**: Hibrit yaklaşım (Playwright + AI)
✅ **Görsel**: Full page screenshot'lar
✅ **Raporlama**: JSON + Console
✅ **Otonom**: Beklenmeyen hataları bulur
✅ **Genişletilebilir**: Custom testler eklenebilir
✅ **CI/CD Ready**: GitHub Actions entegrasyonu

---

## 📞 DESTEK

Sorularınız için:
- Issues: GitHub
- Email: [your-email]
- Docs: README.md

---

## 📝 LİSANS

MIT License - İstediğiniz gibi kullanabilirsiniz

---

## 🚀 HEMEN BAŞLAYIN

```bash
# 1. Test et (AI olmadan)
python test_now.py

# 2. Raporu kontrol et
cat quick_test_report_*.json

# 3. Screenshot'lara bak
ls quick_test_screenshots/

# 4. (Opsiyonel) AI ekle
python setup_api_key.py
python hybrid_tester.py
```

**✨ İyi testler!**
