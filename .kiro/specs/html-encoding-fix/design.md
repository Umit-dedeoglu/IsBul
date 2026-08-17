# HTML Encoding Bozulması Bugfix Tasarımı

## Genel Bakış

İşBul projesindeki tüm HTML dosyaları karakter encoding bozulmasından etkilenmiştir. Bu bozulma iki farklı seviyede gerçekleşmiştir:

1. **Ana Klasördeki Dosyalar**: Hem HTML tagları hem de Türkçe karakterler bozulmuş (örn: `html→hTümül`, `div→dişiv`, `İş→İş`, `ü→ü`)
2. **Backup Klasöründeki Dosyalar**: HTML tagları düzgün ancak Türkçe karakterler bozulmuş (örn: `İş→��`, `ü→�`)

Bu tasarım, bozulmuş karakterleri sistematik olarak düzeltmek, yeni temiz bir backup oluşturmak ve CSS/JavaScript/URL'lerin korunmasını sağlamak için bir strateji sunmaktadır.

## Sözlük

- **Bug_Condition (C)**: Bir HTML dosyasının encoding bozulması nedeniyle okunamaz hale gelmesi durumu
- **Property (P)**: Dosyanın düzeltilmesi sonrası geçerli HTML söz dizimi ve doğru Türkçe karakter encodingi içermesi
- **Preservation**: CSS kodları, JavaScript kodları, URL'ler ve dosya yapısının değişmeden korunması
- **Encoding Bozulması**: UTF-8 karakterlerin yanlış byte sekanslarıyla yorumlanması sonucu hatalı karakter görüntülenmesi
- **HTML Tag Corruption**: HTML etiketlerinin (html, div, script, etc.) karakter dönüşümü nedeniyle bozulması
- **Turkish Character Corruption**: Türkçe özel karakterlerin (ç, ğ, ı, ö, ş, ü ve büyük harfleri) hatalı görüntülenmesi

## Bug Detayları

### Bug Condition

Bug, bir HTML dosyasının karakter encoding bozulması nedeniyle HTML tarayıcıları tarafından doğru şekilde ayrıştırılamaz hale gelmesi durumunda ortaya çıkar. Bu durum iki farklı bozulma paternini içerir:

**Formal Specification:**
```
FUNCTION isBugCondition(file)
  INPUT: file of type HTMLFile
  OUTPUT: boolean
  
  content := file.readContent()
  
  hasCorruptedHTMLTags := (
    content.contains("hTümül") OR
    content.contains("dişiv") OR
    content.contains("scrişipt") OR
    content.contains("lişink") OR
    content.contains("işid") OR
    content.contains("işinişitişial") OR
    content.contains("vişiewport") OR
    content.contains("equişiv")
  )
  
  hasCorruptedTurkishChars := (
    content.contains("İşBul") OR
    content.contains("G�venişilişir") OR
    content.contains("��") OR
    content.contains("�") OR
    content.contains("Türkçe karakterlerde encoding hatası")
  )
  
  RETURN (hasCorruptedHTMLTags OR hasCorruptedTurkishChars) AND
         file.extension == ".html" AND
         file.location IN [mainFolder, backupFolder]
END FUNCTION
```

### Örnekler

**Ana Klasör Bozulma Örnekleri:**
- `<!DOCTYPE html>` → `<!DOCTYPE hTümül>` (HTML tag bozulması)
- `<html lang="tr">` → `<hTümül lang="tr">` (HTML tag bozulması)
- `<div class="container">` → `<dişiv class="contaişiner">` (HTML tag + attribute bozulması)
- `<script src="...">` → `<scrişipt src="...">` (HTML tag bozulması)
- `<link rel="stylesheet">` → `<lişink rel="stylesheet">` (HTML tag bozulması)
- `id="navbar"` → `işid="navbar"` (Attribute bozulması)
- `İşBul` → `��İşBul` (Türkçe karakter bozulması)
- `Güvenilir` → `G�venişilişir` (Türkçe karakter bozulması)
- `içerik` → `işi�erişik` (Türkçe karakter bozulması)

**Backup Klasör Bozulma Örnekleri:**
- `<!DOCTYPE html>` → `<!DOCTYPE html>` ✓ (HTML tag düzgün)
- `<div class="container">` → `<div class="container">` ✓ (HTML tag düzgün)
- `İşBul` → `��Bul` (Sadece Türkçe karakter bozulması)
- `Güvenilir` → `G�venilir` (Sadece Türkçe karakter bozulması)

**Edge Case:**
- CSS içinde Türkçe yorum satırları: `/* İçerik stili */` → doğru şekilde düzeltilmeli
- JavaScript içinde Türkçe string'ler: `alert("Türkçe mesaj")` → doğru şekilde düzeltilmeli
- URL parametrelerinde Türkçe: `href="sayfa.html?kategori=temizlik"` → korunmalı (bozulmamış)

## Beklenen Davranış

### Korunması Gereken Davranışlar

**Değişmeden Kalması Gereken Öğeler:**
- CSS kod yapısı ve selector'lar (sadece içindeki Türkçe karakterler düzeltilecek)
- JavaScript kod mantığı ve fonksiyonlar (sadece içindeki Türkçe string'ler düzeltilecek)
- HTML attribute değerleri (`class`, `id`, `href`, `src` - yalnızca bozulmuş olanlar düzeltilecek)
- Dosya adları ve URL yapıları
- HTML belge yapısı ve DOM hiyerarşisi
- Meta tag'ler ve SEO bilgileri (sadece içindeki bozuk karakterler düzeltilecek)

**Kapsam:**
Bug condition'a uymayan tüm içerik tamamen etkilenmeden korunmalıdır. Bu şunları içerir:
- Düzgün olan HTML tag'leri (değiştirilmemeli)
- Doğru encoding'e sahip Türkçe karakterler (değiştirilmemeli)
- İngilizce metin içeriği
- Sayısal değerler ve URL'ler
- CSS class isimleri ve JavaScript değişken adları

## Kök Neden Hipotezi

Bug açıklamasına dayanarak, en olası nedenler şunlardır:

1. **Yanlış Encoding Dönüşümü**: Dosyalar UTF-8 yerine farklı bir encoding ile (muhtemelen Windows-1254 veya ISO-8859-9) okunmuş ve yeniden kaydedilmiştir.
   - Ana klasördeki dosyalar: Çoklu encoding dönüşümünden geçmiş (birden fazla kez yanlış encoding ile kaydetme)
   - Backup klasöründeki dosyalar: Tek bir encoding dönüşümünden etkilenmiş

2. **Karakter Replacement Operasyonu Hatası**: Bir kod veya editör, karakterleri yanlış bir şekilde replace etmiş olabilir.
   - Latin karakterler Türkçe karakterlerle karıştırılmış
   - `i` → `işi`, `l` → `lişi`, `v` → `vişi` gibi sistematik hatalı dönüşümler

3. **Metin Editörü Encoding Ayarı**: Dosyalar yanlış encoding ayarına sahip bir editörde açılıp kaydedilmiş olabilir.
   - Windows Notepad veya başka bir editör UTF-8 BOM olmadan kaydetmiş olabilir
   - Veya ANSI/Windows-1252 formatında yanlış bir şekilde yorumlanmış

4. **Toplu Dosya İşleme Hatası**: Bir script veya otomasyon aracı dosyaları işlerken encoding'i bozmuş olabilir.
   - Backup işlemi sırasında yanlış encoding kullanılmış
   - Find-replace işlemi yanlış karakter mapping ile yapılmış

## Correctness Properties

Property 1: Bug Condition - HTML Encoding Düzeltme

_For any_ HTML dosyası encoding bozulması içeriyorsa (isBugCondition true döner), düzeltilmiş dosya geçerli HTML söz dizimi VE doğru Türkçe UTF-8 karakterler İÇERMELİDİR.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - CSS ve JavaScript Kod Yapısı Korunumu

_For any_ HTML dosyasında CSS veya JavaScript kodu varsa (isBugCondition durumundan bağımsız), düzeltilmiş dosya bu kodların yapısını, mantığını ve çalışma şeklini AYNEN KORUMALDIR; yalnızca içindeki bozuk karakterler düzeltilmelidir.

**Validates: Requirements 3.1, 3.2, 3.3**

## Fix Implementation

### Gerekli Değişiklikler

Kök neden analizimizin doğru olduğunu varsayarsak:

**Etkilenen Dosyalar**: Tüm `.html` dosyaları ana klasörde (22 dosya)

**İki Aşamalı Düzeltme Stratejisi**:

#### Aşama 1: Ana Klasör Düzeltme (Çoklu Bozulma)

**Dosya**: Ana klasördeki tüm `.html` dosyaları

**Specific Changes**:

1. **HTML Tag Corruption Düzeltme**: Bozuk HTML tag'lerini orijinallerine dönüştür
   - `hTümül` → `html`
   - `dişiv` → `div`
   - `scrişipt` → `script`
   - `lişink` → `link`
   - `sectişion` → `section`
   - `işimg` → `img`
   - `işinput` → `input`
   - `button` → `button` (pattern'e uymuyorsa değiştirme)

2. **HTML Attribute Corruption Düzeltme**: Bozuk attribute'ları düzelt
   - `işid=` → `id=`
   - `vişiewport` → `viewport`
   - `equişiv` → `equiv`
   - `işinişitişial` → `initial`
   - `wişidth` → `width`
   - `heişight` → `height`
   - `crossorişigişin` → `crossorigin`
   - `onclişick` → `onclick`
   - `arişia-label` → `aria-label`

3. **Turkish Character Corruption Düzeltme (Complex Pattern)**: Çoklu bozulmuş karakterleri düzelt
   - `İş` → `İş` (büyük İ)
   - `işi` → `i` (küçük i)
   - `�` → uygun Türkçe karakter (context'e göre: ı, ü, ğ, ş, ç, ö)
   - `G�venişilişir` → `Güvenilir`
   - Pattern tabanlı düzeltme gerekli (context-aware)

4. **CSS ve JavaScript İçerik Korunumu**: Style ve script blokları içindeki kodları korurken Türkçe karakterleri düzelt
   - CSS selector'ları ve property'leri değiştirme
   - JavaScript fonksiyon adlarını ve değişkenleri değiştirme
   - Sadece string literal'lerdeki ve comment'lerdeki Türkçe karakterleri düzelt

5. **UTF-8 BOM ve Meta Tag Doğrulama**: Her düzeltilmiş dosyada encoding garantisini sağla
   - `<meta charset="UTF-8">` tag'inin varlığını kontrol et
   - Dosyayı UTF-8 BOM olmadan kaydet (modern standart)

#### Aşama 2: Yeni Temiz Backup Oluşturma

**Düzeltme Sonrası**: Düzeltilen dosyaların yeni bir backup'ını oluştur

**Backup Stratejisi**:
- Backup klasörü adı: `backup_html_clean_YYYYMMDD_HHMMSS`
- Sadece düzeltilmiş dosyaları kopyala
- Backup meta bilgisi içeren `README.txt` oluştur

### Encoding Düzeltme Haritası

**Kritik Bozulma Pattern'leri** (öncelik sırasına göre):

```
# HTML Tag Patterns (Yüksek Öncelik)
hTümül → html
dişiv → div
scrişipt → script
lişink → link
sectişion → section
işimg → img

# Attribute Patterns (Orta Öncelik)
işid → id
vişiewport → viewport
http-equişiv → http-equiv
işinişitişial-scale → initial-scale
crossorişigişin → crossorigin

# Turkish Character Patterns - Context Aware (Yüksek Öncelik)
İşBul → İşBul
G�venişilişir → Güvenilir
Türkçe → Türkçe
içerik → içerik
şu → şu
ğ → ğ
ç → ç
ö → ö

# Genel Pattern (Düşük Öncelik - Dikkatli Kullan)
işi → i (sadece HTML tag context'inde)
lişi → li (sadece HTML tag context'inde)
vişi → vi (sadece HTML tag context'inde)
```

## Testing Strategy

### Doğrulama Yaklaşımı

Test stratejisi iki aşamalı bir yaklaşım izler: önce bozuk dosyalarda bug'ı göster (counterexample), sonra düzeltme işleminin doğruluğunu ve korunması gereken davranışların değişmediğini doğrula.

### Exploratory Bug Condition Checking

**Amaç**: Düzeltme yapılmadan ÖNCE bozulma durumunu counterexample'larla göster. Kök neden analizini doğrula veya çürüt. Çürütülürse yeniden hipotez oluştur.

**Test Planı**: Bozuk dosyaları oku ve bozulma pattern'lerini manuel ve otomatik olarak tespit et. Bu testler DÜZELTME YAPILMADAN bozuk kod üzerinde çalıştırılacak ve hataları gözlemleyecek.

**Test Cases**:
1. **HTML Tag Corruption Detection**: index.html dosyasında `hTümül`, `dişiv` pattern'lerini ara (bozuk kod üzerinde bulunacak)
2. **Turkish Character Detection**: profil.html dosyasında `İşBul`, `G�venişilişir` pattern'lerini ara (bozuk kod üzerinde bulunacak)
3. **Backup Corruption Level**: backup klasöründeki index.html'de HTML tag'lerin düzgün olduğunu ama Türkçe karakterlerin bozuk olduğunu doğrula
4. **CSS Preservation Need**: CSS bloklarında sadece yorum ve string içindeki Türkçe karakterlerin bozuk olduğunu, kod yapısının sağlam olduğunu göster

**Beklenen Counterexample'lar**:
- HTML parser dosyayı doğru ayrıştıramayacak (geçersiz tag isimleri nedeniyle)
- Türkçe metin kullanıcıya okunamaz şekilde görüntülenecek
- Olası nedenler: encoding dönüşüm hatası, yanlış character mapping, toplu işlem hatası

### Fix Checking

**Amaç**: Bug condition'ın geçerli olduğu tüm dosyalar için, düzeltilmiş dosyanın beklenen davranışı sağladığını doğrula.

**Pseudocode:**
```
FOR ALL file WHERE isBugCondition(file) DO
  fixedContent := applyEncodingFix(file)
  ASSERT isValidHTML(fixedContent)
  ASSERT hasTurkishUTF8Chars(fixedContent)
  ASSERT NOT hasCorruptedTags(fixedContent)
  ASSERT NOT hasCorruptedTurkishChars(fixedContent)
END FOR
```

**Test Plan**:

1. **HTML Validity Test**: Her düzeltilmiş dosyayı HTML validator'dan geçir
   - W3C HTML Validator veya benzer tool kullan
   - Tüm tag'lerin geçerli olduğunu doğrula
   - Attribute syntax'ının doğru olduğunu kontrol et

2. **Turkish Character UTF-8 Test**: Türkçe karakterlerin doğru encoding'e sahip olduğunu doğrula
   - Dosyayı hex editor ile aç ve UTF-8 byte sequence'lerini kontrol et
   - İ, ş, ğ, ü, ö, ç karakterlerinin doğru byte değerlerine sahip olduğunu doğrula

3. **Visual Comparison Test**: Düzeltilmiş dosyaları tarayıcıda açıp görsel olarak kontrol et
   - Türkçe metinlerin okunabilir olduğunu doğrula
   - HTML sayfanın düzgün render edildiğini gözlemle

4. **Diff Comparison Test**: Düzeltilmiş dosyaları bozuk versiyonlarla karşılaştır
   - Sadece beklenen değişikliklerin yapıldığını doğrula
   - İstenmeyen değişiklik olmadığını kontrol et

### Preservation Checking

**Amaç**: Bug condition'dan bağımsız olarak, tüm dosyalarda CSS, JavaScript ve URL yapılarının korunduğunu doğrula.

**Pseudocode:**
```
FOR ALL file IN allHTMLFiles DO
  originalCSS := extractCSS(file.original)
  fixedCSS := extractCSS(file.fixed)
  
  originalJS := extractJavaScript(file.original)
  fixedJS := extractJavaScript(file.fixed)
  
  ASSERT cssStructureEqual(originalCSS, fixedCSS)
  ASSERT jsStructureEqual(originalJS, fixedJS)
  ASSERT urlsEqual(file.original, file.fixed)
END FOR
```

**Testing Approach**: Property-based testing preservation checking için önerilir çünkü:
- Tüm dosyalar için otomatik test case'leri üretir
- Manuel unit test'lerin kaçırabileceği edge case'leri yakalar
- Tüm non-buggy içeriğin değişmediğine dair güçlü garantiler sağlar

**Test Plan**: Önce BOZUK kod üzerinde CSS/JavaScript davranışını gözlemle, sonra property-based testler ile bu davranışı yakalayan testler yaz.

**Test Cases**:

1. **CSS Selector Preservation**: CSS selector'ların değişmediğini doğrula
   - Orijinal dosyada: `.navbar__logo`, `.btn--primary`
   - Düzeltilmiş dosyada: Aynı selector'lar korunmuş olmalı
   - Test: Her iki versiyondaki tüm CSS selector'ları extract et ve karşılaştır

2. **JavaScript Function Name Preservation**: JavaScript fonksiyon adlarının korunduğunu doğrula
   - Orijinal dosyada: `openAuthModal`, `handleKeyPress`
   - Düzeltilmiş dosyada: Aynı fonksiyon adları korunmuş olmalı
   - Test: Her iki versiyondaki fonksiyon declarationlarını parse et ve karşılaştır

3. **URL and Href Preservation**: Tüm link ve resource URL'lerinin korunduğunu doğrula
   - Orijinal dosyada: `href="hizmetler.html"`, `src="assets/css/styles.css"`
   - Düzeltilmiş dosyada: Aynı URL'ler korunmuş olmalı
   - Test: Her iki versiyondaki tüm href ve src attribute değerlerini extract et ve karşılaştır

4. **HTML Class and ID Preservation**: HTML element'lerinin class ve id değerlerinin korunduğunu doğrula
   - Orijinal dosyada: `class="container navbar__inner"`, `id="navbar"`
   - Düzeltilmiş dosyada: Aynı değerler korunmuş olmalı (sadece bozuk olanlar düzeltilmiş)
   - Test: Her iki versiyondaki tüm class ve id değerlerini extract et ve karşılaştır

5. **CSS Property Preservation**: CSS property değerlerinin korunduğunu doğrula
   - Orijinal dosyada: `font-size: 14px`, `color: var(--primary)`
   - Düzeltilmiş dosyada: Aynı değerler korunmuş olmalı
   - Test: CSS parser ile her iki versiyonu parse et ve property değerlerini karşılaştır

### Unit Tests

- Her bir bozulma pattern'i için ayrı unit test (HTML tag, attribute, Turkish char)
- Edge case'ler: CSS içinde Türkçe yorum, JavaScript string'inde Türkçe
- Farklı bozulma seviyelerini test et (backup vs main folder)
- UTF-8 encoding doğrulaması için byte-level test

### Property-Based Tests

- Random HTML dosyası seç ve encoding fix uygula, sonucu doğrula
- Random bozulma pattern kombinasyonu oluştur ve fix işlemini test et
- Farklı dosya boyutları ile test et (küçük/orta/büyük HTML dosyaları)
- CSS ve JavaScript bloklarının korunumunu çok sayıda scenario ile test et

### Integration Tests

- Tüm 22 HTML dosyasını toplu olarak düzelt ve sonuçları doğrula
- Düzeltilmiş dosyaları tarayıcıda açıp görsel kontrolden geçir
- Site navigation'ını test et (linkler çalışıyor mu?)
- Backup oluşturma ve geri yükleme sürecini test et
- Cross-browser test (Chrome, Firefox, Edge) düzeltilmiş dosyalarla

### Manuel Test Checklist

**Düzeltme Sonrası Yapılacak Manuel Kontroller**:

1. ✓ Her HTML dosyasını tarayıcıda aç
2. ✓ Türkçe karakterlerin doğru görüntülendiğini kontrol et
3. ✓ Sayfaların doğru şekilde render edildiğini gözlemle
4. ✓ Navigation linklerinin çalıştığını test et
5. ✓ Button'ların ve form element'lerinin çalıştığını test et
6. ✓ CSS styling'in korunduğunu doğrula
7. ✓ JavaScript interactivity'sinin çalıştığını test et
8. ✓ Browser console'da hata olmadığını kontrol et
9. ✓ Mobile responsive görünümü test et
10. ✓ Kaynak kodda beklenmedik değişiklik olmadığını incele

## Önerilen Araçlar ve Teknolojiler

**Encoding Düzeltme İçin**:
- Python script (recommended): `codecs` ve `re` modülleri ile pattern matching
- PowerShell script: Regex-based replacement
- Node.js script: `fs` ve regex ile dosya işleme

**Doğrulama İçin**:
- HTML Validator: W3C Markup Validation Service
- Encoding Detection: `chardet` (Python) veya `file` command (Linux/Mac)
- Hex Editor: HxD veya 010 Editor (byte-level verification)
- Browser DevTools: Console ve Elements tab

**Backup ve Version Control İçin**:
- Git: Değişiklikleri commit olarak kaydet
- Timestamped folders: Her düzeltme için tarih-saat damgalı backup

## Risk Değerlendirmesi

**Yüksek Risk Alanları**:
1. CSS ve JavaScript içindeki Türkçe string'lerin yanlış düzeltilmesi
2. URL ve path'lerin bozulması
3. HTML attribute değerlerinin yanlış değiştirilmesi
4. Context-aware olmayan pattern matching nedeniyle false positive düzeltmeler

**Risk Azaltma Stratejileri**:
1. Her düzeltme öncesi yeni bir backup oluştur
2. Önce tek bir dosyada test et, başarılıysa diğerlerine geç
3. Regex pattern'lerini dikkatli tasarla (context-aware)
4. Manuel review sonrası otomasyona geç
5. Git kullanarak her aşamayı commit'le (geri dönülebilir)

## Başarı Kriterleri

Düzeltme işlemi başarılı sayılır eğer:

1. ✓ Tüm HTML dosyaları geçerli HTML syntax'ına sahipse
2. ✓ Türkçe karakterler doğru UTF-8 encoding ile görüntüleniyorsa
3. ✓ CSS styling ve layout bozulmadıysa
4. ✓ JavaScript fonksiyonlar çalışmaya devam ediyorsa
5. ✓ Site navigation ve linkler düzgün çalışıyorsa
6. ✓ Browser console'da encoding hatası yoksa
7. ✓ Manuel görsel kontrol başarılıysa
8. ✓ Temiz bir backup oluşturulmuşsa
9. ✓ Tüm testler geçiyorsa
10. ✓ User acceptance test başarılıysa
