# ⚡ HIZLI BAŞLANGIÇ

## 🚀 3 Dakikada Kurulum

### 1️⃣ Kurulum Scriptini Çalıştır:
```powershell
cd c:\Users\umity\Desktop\ufakisler\isbul\autonomous-tests
.\setup.ps1
```

Bu script:
- ✅ Python'u kontrol eder
- ✅ Virtual environment oluşturur
- ✅ Tüm paketleri yükler
- ✅ Playwright tarayıcılarını indirir
- ✅ .env dosyası oluşturur

### 2️⃣ API Key Ekle:
```powershell
notepad .env
```

İçeriği düzenle:
```env
GROQ_API_KEY=gsk_YOUR_ACTUAL_API_KEY_HERE
SITE_URL=https://isbul.online
```

**Groq API Key Nasıl Alınır?**
1. https://console.groq.com/ adresine git
2. Ücretsiz hesap aç
3. API Keys bölümünden key oluştur
4. Kopyala ve .env'ye yapıştır

### 3️⃣ İlk Testi Çalıştır:
```powershell
python autonomous_tester.py
```

---

## 🎯 Hızlı Test Komutları

### Login Sayfası Analizi (30 saniye):
```powershell
.\run_test.ps1 -Test login
```

### Kayıt Formu Testi (45 saniye):
```powershell
.\run_test.ps1 -Test register
```

### TÜM Sayfalarda Facebook Taraması (3 dakika):
```powershell
.\run_test.ps1 -Test all-pages
```

### Hepsini Çalıştır:
```powershell
.\run_test.ps1 -Test full
```

---

## 📸 Sonuçlar Nerede?

Test tamamlandığında mevcut klasörde:

- `test_result_[timestamp].png` - Screenshot
- `test_report_[timestamp].json` - Detaylı rapor

---

## 🔥 İlk Test Senaryosu

İşte ilk testini çalıştırmak için gereken tek komut:

```powershell
# 1. Kurulum (sadece ilk seferde)
.\setup.ps1

# 2. API key ekle
notepad .env  # Groq API key'ini yapıştır

# 3. Testi çalıştır
python autonomous_tester.py
```

Menüden "1" seç → Facebook butonu kontrolü başlasın! 🚀

---

## ❓ Sorun mu Yaşıyorsun?

### "Python bulunamadı"
```powershell
# Python yükle:
winget install Python.Python.3.11
```

### "Groq API hatası"
```powershell
# API key kontrolü:
Get-Content .env
# GROQ_API_KEY doğru mu?
```

### "Playwright bulunamadı"
```powershell
# Tekrar yükle:
.\venv\Scripts\Activate.ps1
pip install playwright
playwright install chromium
```

---

## 🎓 Öğretici Video

Adım adım kurulum için `README.md` dosyasına bak!

---

## 💡 İpuçları

1. **İlk test yavaş:** LLM ilk seferde biraz yavaş olabilir, normal!
2. **Headless mod:** Daha hızlı test için `headless=True` yap
3. **Rate limit:** Free tier 25 req/min, otomatik bekler
4. **Screenshot:** Her test sonunda otomatik alınır

---

## 🎉 Başarı!

Kurulum tamamlandıysa:

```powershell
python -c "import playwright; import groq; print('✅ Hazırsın!')"
```

Çıktı: `✅ Hazırsın!`

Şimdi `python autonomous_tester.py` ile başla! 🚀
