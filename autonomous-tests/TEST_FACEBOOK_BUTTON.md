# 🧪 FACEBOOK BUTONU TEST REHBERİ

## 📍 Facebook Butonu Nerede?

### ✅ Bulunan Sayfalar:
1. **uzmanlar.html** ← En kolay test
2. **uzman-profil.html**
3. **uzman-ol.html**
4. **profil.html**
5. **nasil-calisir.html**
6. **hakkimizda.html**
7. **gizlilik.html**
8. **blog.html**

### 🔍 Buton Formatı:
```html
<button class="auth-social-btn" onclick="handleOAuth('facebook')">
  ✓ Facebook ile Kayıt
</button>
```

**Nerede Görünüyor:**
- "Ücretsiz Kaydol" butonuna tıklayınca
- Login/Register modalında
- Google butonunun yanında

---

## 🚀 HIZLI TEST (Manuel)

### Adım 1: Playwright Kur
```powershell
cd c:\Users\umity\Desktop\ufakisler\isbul\autonomous-tests

# Paketleri yükle
pip install playwright python-dotenv

# Tarayıcıyı yükle
playwright install chromium
```

### Adım 2: Hızlı Test Çalıştır
```powershell
# Uzmanlar sayfasını test et (Facebook butonu VAR)
python quick_test.py uzmanlar.html

# Başka sayfaları test et
python quick_test.py uzman-ol.html
python quick_test.py profil.html
```

### Ne Olur:
1. ✅ Tarayıcı açılır (headless=False)
2. ✅ Sayfayı yükler
3. ✅ HTML'de "facebook" arar
4. ✅ DOM'da Facebook butonlarını listeler
5. ✅ "Ücretsiz Kaydol" butonuna tıklar (modal açar)
6. ✅ Modal'da Facebook butonunu gösterir
7. ✅ Screenshot alır
8. ✅ 5 saniye açık kalır (inceleyebilirsin)

---

## 🔬 MANUEL TEST (Tarayıcıda)

### Adım 1: Sayfayı Aç
```
https://isbul.online/uzmanlar.html
```

### Adım 2: Login Modal'ını Aç
1. Sağ üstteki **"Giriş Yap"** butonuna tıkla
2. Veya **"Ücretsiz Kaydol"** butonuna tıkla

### Adım 3: Facebook Butonunu Gör
Modal açılınca göreceksin:
```
┌─────────────────────────────┐
│   Google ile Kayıt          │ ← Google butonu
├─────────────────────────────┤
│ ✓ Facebook ile Kayıt        │ ← Facebook butonu (OLMAMALI!)
└─────────────────────────────┘
```

---

## 🤖 OTONOM TEST (LLM ile)

### Tam Kurulum:
```powershell
# 1. Setup script çalıştır
.\setup.ps1

# 2. API key zaten ekli (.env dosyasında)

# 3. Testi çalıştır
python autonomous_tester.py
```

### Menüden Seç:
```
1. Login sayfası analizi       → Tek sayfa test
4. TÜM sayfalarda Facebook     → 8 sayfa toplu test
```

### LLM Ne Yapar:
```python
# 1. Sayfayı görsel olarak inceler
# 2. DOM'u analiz eder
# 3. "Facebook ile Kayıt" text'ini okur
# 4. JSON rapor üretir:
{
  "facebook_button_found": true,
  "google_button_found": true,
  "critical_issues": [
    "Facebook butonu bulundu (olmamalı!)"
  ]
}
```

---

## 📊 BEKLENEN SONUÇLAR

### ❌ Şu Anki Durum:
```
SAYFA: uzmanlar.html
SONUÇ: ❌ BAŞARISIZ
SEBEP: Facebook butonu bulundu
DETAY: "✓ Facebook ile Kayıt" butonu modal'da görünüyor
```

### ✅ Hedef Durum:
```
SAYFA: uzmanlar.html
SONUÇ: ✅ BAŞARILI
SEBEP: Facebook butonu yok
DETAY: Sadece "Google ile Kayıt" butonu var
```

---

## 🎯 TEST SONUÇLARI

### Hızlı Test Çıktısı:
```
🧪 HIZLI TEST: uzmanlar.html
════════════════════════════════════════════

🌐 Sayfa açılıyor: https://isbul.online/uzmanlar.html
✅ Sayfa yüklendi

📊 'facebook' kelimesi sayısı: 5
   ✅ 'Facebook ile Kayıt' bulundu (2 adet)
   ✅ '✓ Facebook' bulundu (2 adet)

🔍 DOM'da Facebook butonları aranıyor...
   🔴 Buton bulundu: '✓ Facebook ile Kayıt'

🚨 SONUÇ: 1 ADET FACEBOOK BUTONU BULUNDU!
   ❌ Bu butonlar OLMAMALI!

📸 Screenshot kaydedildi: quick_test_uzmanlar.png

🔓 Modal açılmaya çalışılıyor...
   ✅ 'Ücretsiz Kaydol' butonuna tıklandı
   🔴 Modal'da buton: '✓ Facebook ile Kayıt'

🚨 MODAL SONUCU: 1 ADET FACEBOOK BUTONU GÖRÜNÜR!
📸 Modal screenshot: quick_test_uzmanlar_modal.png

════════════════════════════════════════════
📊 FINAL SONUÇ
════════════════════════════════════════════
❌ TEST BAŞARISIZ!
   Facebook butonu bulundu: 2 adet
   Bu butonlar kaldırılmalı!

⏰ Tarayıcı 5 saniye açık kalacak, inceleyebilirsin...
```

---

## 🔧 FACEBOOK BUTONUNU KALDIR

### Çözüm 1: HTML'den Kaldır
**Dosya:** `uzmanlar.html` (satır 190)

```html
<!-- ❌ KALDIR: -->
<button class="auth-social-btn" onclick="handleOAuth('facebook')">
  ✓ Facebook ile Kayıt
</button>
```

### Çözüm 2: JavaScript'te Devre Dışı Bırak
**Dosya:** `assets/js/app.js` veya ilgili JS

```javascript
// handleOAuth fonksiyonunda:
function handleOAuth(provider) {
  if (provider === 'facebook') {
    console.error('Facebook login disabled');
    return; // Facebook'u blokla
  }
  
  if (provider === 'google') {
    // Google devam etsin
  }
}
```

### Çözüm 3: CSS ile Gizle (Geçici)
```css
button[onclick*="facebook"] {
  display: none !important;
}
```

---

## 🎬 SCREENSHOT'LAR

### Test çalıştırınca oluşacak:
- `quick_test_uzmanlar.png` - Sayfa yüklendiğinde
- `quick_test_uzmanlar_modal.png` - Modal açıldığında

Bu screenshot'larda Facebook butonunu göreceksin!

---

## ⚡ EN HIZLI TEST

Hiçbir şey kurmadan:

1. Tarayıcıda aç: `https://isbul.online/uzmanlar.html`
2. F12 bas (Developer Tools)
3. Console'a yapıştır:
```javascript
// Facebook butonlarını bul
const fbButtons = Array.from(document.querySelectorAll('button'))
  .filter(btn => btn.textContent.includes('Facebook'));

console.log('Facebook butonları:', fbButtons.length);
fbButtons.forEach(btn => console.log('Buton:', btn.textContent));

// Modalı aç
document.querySelector('button').click(); // İlk butona tıkla

// Tekrar kontrol et
setTimeout(() => {
  const fbInModal = Array.from(document.querySelectorAll('button'))
    .filter(btn => btn.textContent.includes('Facebook') && btn.offsetParent);
  console.log('Modal\'da Facebook:', fbInModal.length);
  fbInModal.forEach(btn => console.log('Modal buton:', btn.textContent));
}, 2000);
```

Çıktı:
```
Facebook butonları: 2
Buton: ✓ Facebook ile Kayıt
Modal'da Facebook: 1
Modal buton: ✓ Facebook ile Kayıt
```

---

## 🎯 ÖZET

### Facebook Butonu:
- ✅ **VAR** (8 sayfada)
- ❌ **OLMAMALI** (requirements'a göre)
- 🔍 **Nerede:** Login/Register modalında
- 🎨 **Görünüm:** "✓ Facebook ile Kayıt" veya "📘 Facebook ile Kayıt"

### Test Yöntemleri:
1. **En Hızlı:** Tarayıcıda manuel bak (30 saniye)
2. **Basit:** `quick_test.py` çalıştır (2 dakika)
3. **Kapsamlı:** `autonomous_tester.py` ile LLM testi (15 dakika)

### Hangisini Seçmeli:
- **Sadece doğrula:** Manuel test
- **Screenshot + rapor:** quick_test.py
- **Tüm sayfalarda + AI analizi:** autonomous_tester.py

---

**Şimdi ne yapmak istersin?**
1. Manuel test (tarayıcıda)
2. Hızlı test (quick_test.py)
3. Tam otonom test (autonomous_tester.py)
4. Facebook butonunu kaldır
