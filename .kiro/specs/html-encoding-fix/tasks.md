# HTML Encoding Bozulması Düzeltme - Implementation Plan

## İş Akışı Özeti

Bu plan, bug condition metodolojisini takip eder:
1. **Explore**: Bug condition test'i yazılır (test BAŞARISIZ olacak - bug'ı gösterir)
2. **Preserve**: Preservation test'leri yazılır (test BAŞARILI olacak - mevcut davranışı kaydeder)
3. **Implement**: Düzeltme uygulanır
4. **Validate**: Testlerin başarılı olduğu doğrulanır

---

## Görevler

- [x] 1. Bug condition exploration test'ini yaz (DÜZELTMEDEN ÖNCE)
  - **Property 1: Bug Condition** - HTML Encoding Bozulması Tespiti
  - **KRİTİK**: Bu test BOZUK KOD üzerinde çalıştırılacak ve BAŞARISIZ olacak
  - **DÜZELTMEYİ veya TESTİ düzeltmeye ÇALIŞMA - başarısızlık bug'ın varlığını kanıtlar**
  - **NOT**: Bu test expected behavior'ı encode eder - düzeltmeden sonra geçtiğinde fix'i doğrular
  - **AMAÇ**: Bug'ı gösteren counterexample'ları ortaya çıkar
  - **Scoped PBT Yaklaşımı**: Deterministik bug için property'yi somut başarısız case'lere odakla
  - Test implementasyonu Bug Condition spesifikasyonundan:
    - Ana klasör dosyalarında `hTümül`, `dişiv`, `scrişipt` gibi bozuk HTML tag'leri ara
    - Ana klasör dosyalarında `İşBul`, `G�venişilişir` gibi bozuk Türkçe karakterler ara
    - Backup klasör dosyalarında HTML tag'lerin düzgün olduğunu ama Türkçe karakterlerin bozuk olduğunu doğrula
  - Test assertion'ları design'daki Expected Behavior Properties ile eşleşmeli:
    - ASSERT NOT isValidHTML(file.content) - çünkü bozuk tag'ler var
    - ASSERT hasCorruptedHTMLTags(file.content) - expected: TRUE on buggy code
    - ASSERT hasCorruptedTurkishChars(file.content) - expected: TRUE on buggy code
  - Testi BOZUK KOD üzerinde çalıştır
  - **BEKLENİLEN SONUÇ**: Test BAŞARISIZ olacak (bu doğru - bug'ın varlığını kanıtlar)
  - Bulunan counterexample'ları dokümante et (örn: "index.html'de `<hTümül>` bulundu", "profil.html'de `İşBul` bulundu")
  - Kök nedeni anlamak için başarısızlıkları incele
  - Test yazıldığında, çalıştırıldığında ve başarısızlık dokümante edildiğinde görevi tamamlanmış say
  - _Requirements: Bug Condition spesifikasyonundan - 2.1, 2.2, 2.3, 2.4_

- [x] 2. Preservation property test'lerini yaz (DÜZELTMEDEN ÖNCE)
  - **Property 2: Preservation** - CSS ve JavaScript Kod Yapısı Korunumu
  - **ÖNEMLİ**: Observation-first metodolojisini takip et
  - BOZUK KOD üzerinde non-buggy input'lar için davranışı gözlemle:
    - CSS selector'ların yapısını gözlemle (örn: `.navbar__logo`, `.btn--primary`)
    - JavaScript fonksiyon adlarını gözlemle (örn: `openAuthModal`, `handleKeyPress`)
    - URL ve href değerlerini gözlemle (örn: `href="hizmetler.html"`)
    - HTML class ve id değerlerini gözlemle (örn: `class="container"`, `id="navbar"`)
    - CSS property değerlerini gözlemle (örn: `font-size: 14px`)
  - Preservation Requirements'tan gözlemlenen davranış pattern'lerini yakalayan property-based test'ler yaz:
    - Property: Tüm CSS selector'lar değişmeden korunmalı
    - Property: Tüm JavaScript fonksiyon adları korunmalı
    - Property: Tüm URL ve href değerleri korunmalı
    - Property: HTML class ve id değerleri korunmalı (sadece bozuk olanlar düzeltilecek)
    - Property: CSS property değerleri korunmalı
  - Property-based testing daha güçlü preservation garantileri sağlar
  - Testleri BOZUK KOD üzerinde çalıştır
  - **BEKLENİLEN SONUÇ**: Testler BAŞARILI olacak (baseline davranışı kaydeder)
  - Testler yazıldığında, çalıştırıldığında ve bozuk kod üzerinde başarılı olduğunda görevi tamamlanmış say
  - _Requirements: Preservation Requirements spesifikasyonundan - 3.1, 3.2, 3.3_

- [x] 3. HTML Encoding Bozulmasını Düzelt

  - [x] 3.1 Hazırlık ve backup oluştur
    - Düzeltme öncesi yeni bir backup klasörü oluştur: `backup_html_pre_fix_YYYYMMDD_HHMMSS`
    - Tüm HTML dosyalarını bu backup klasörüne kopyala
    - Backup meta bilgisi içeren `README.txt` oluştur (backup tarihi, neden, kapsam)
    - _Bug_Condition: isBugCondition(file) - design'daki Bug Condition spesifikasyonundan_
    - _Expected_Behavior: expectedBehavior(result) - design'daki Expected Behavior spesifikasyonundan_
    - _Preservation: Preservation Requirements - design'daki Preservation spesifikasyonundan_
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_

  - [x] 3.2 Encoding düzeltme script'ini oluştur
    - PowerShell veya Python script hazırla (design'daki "Önerilen Araçlar" bölümüne göre)
    - Encoding düzeltme pattern'lerini tanımla (design'daki "Encoding Düzeltme Haritası" bölümünden):
      - **HTML Tag Patterns** (Yüksek Öncelik): `hTümül→html`, `dişiv→div`, `scrişipt→script`, `lişink→link`, `sectişion→section`, `işimg→img`
      - **Attribute Patterns** (Orta Öncelik): `işid→id`, `vişiewport→viewport`, `http-equişiv→http-equiv`, `işinişitişial-scale→initial-scale`, `crossorişigişin→crossorigin`
      - **Turkish Character Patterns** (Yüksek Öncelik - Context Aware): `İşBul→İşBul`, `G�venişilişir→Güvenilir`, `Türkçe→Türkçe`, `içerik→içerik`, `şu→şu`, `ğ→ğ`, `ç→ç`, `ö→ö`
    - HTML tag düzeltme fonksiyonu yaz (context-aware regex kullan)
    - Türkçe karakter düzeltme fonksiyonu yaz (complex pattern için context analizi)
    - CSS/JavaScript içerik koruma mantığı ekle (sadece string literal ve comment'lerdeki Türkçe karakterleri düzelt)
    - UTF-8 encoding doğrulama fonksiyonu ekle (`<meta charset="UTF-8">` kontrolü)
    - _Bug_Condition: isBugCondition(file) where hasCorruptedHTMLTags OR hasCorruptedTurkishChars_
    - _Expected_Behavior: isValidHTML(fixedContent) AND hasTurkishUTF8Chars(fixedContent) AND NOT hasCorruptedTags(fixedContent)_
    - _Preservation: cssStructureEqual(original, fixed) AND jsStructureEqual(original, fixed) AND urlsEqual(original, fixed)_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_

  - [x] 3.3 Tek dosyada test et
    - index.html dosyasını seç (test case olarak)
    - Script'i sadece bu dosyaya uygula
    - Sonucu manuel olarak incele:
      - HTML tag'lerin düzeldiğini kontrol et (`<!DOCTYPE html>`, `<html>`, `<div>`, `<script>`)
      - Türkçe karakterlerin düzeldiğini kontrol et (`İşBul`, `Güvenilir`)
      - CSS selector'ların korunduğunu doğrula
      - JavaScript fonksiyon adlarının korunduğunu doğrula
      - URL'lerin korunduğunu doğrula
    - HTML validator'dan geçir (W3C Markup Validation Service)
    - Tarayıcıda aç ve görsel kontrol yap
    - Başarılıysa devam et, değilse script'i düzelt
    - _Bug_Condition: isBugCondition(index.html) == TRUE_
    - _Expected_Behavior: isValidHTML(fixed_index.html) AND hasTurkishUTF8Chars(fixed_index.html)_
    - _Preservation: CSS/JS/URLs preserved in fixed_index.html_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_

  - [x] 3.4 Tüm HTML dosyalarına uygula
    - Script'i ana klasördeki tüm 22 HTML dosyasına uygula
    - Her dosya için düzeltme işlemini logla (başarılı/başarısız, değişiklik sayısı)
    - Hata oluşan dosyaları işaretle ve logla
    - İşlem sonrası özet rapor oluştur (kaç dosya düzeltildi, kaç hata oluştu)
    - _Bug_Condition: FOR ALL file WHERE isBugCondition(file) == TRUE_
    - _Expected_Behavior: FOR ALL fixed_file: isValidHTML(fixed_file) AND hasTurkishUTF8Chars(fixed_file)_
    - _Preservation: FOR ALL file: cssStructureEqual(original, fixed) AND jsStructureEqual(original, fixed)_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_

  - [x] 3.5 HTML validator'dan geçir
    - Her düzeltilmiş dosyayı HTML validator'dan geçir (W3C Markup Validation Service veya benzer tool)
    - Validation hatalarını logla
    - Critical hataları düzelt, minor warning'ler için not al
    - Tüm dosyalar geçerli HTML syntax'ına sahip olmalı
    - _Expected_Behavior: FOR ALL fixed_file: isValidHTML(fixed_file) == TRUE_
    - _Requirements: 2.1, 2.4_

  - [x] 3.6 UTF-8 encoding doğrulama
    - Her düzeltilmiş dosyanın encoding'ini kontrol et (chardet library veya file command kullan)
    - Türkçe karakterlerin doğru byte sequence'lerine sahip olduğunu hex editor ile doğrula
    - Örneklem olarak 3-5 dosyada İ, ş, ğ, ü, ö, ç karakterlerinin UTF-8 byte değerlerini kontrol et
    - `<meta charset="UTF-8">` tag'inin tüm dosyalarda var olduğunu doğrula
    - _Expected_Behavior: FOR ALL fixed_file: hasTurkishUTF8Chars(fixed_file) == TRUE_
    - _Requirements: 2.2, 2.3_

  - [x] 3.7 Bug condition exploration test'ini yeniden çalıştır
    - **Property 1: Expected Behavior** - HTML Encoding Düzeltildi
    - **ÖNEMLİ**: Görev 1'deki AYNI test'i çalıştır - yeni test YAZMA
    - Görev 1'deki test expected behavior'ı encode eder
    - Bu test başarılı olduğunda, expected behavior'ın sağlandığını doğrular
    - Görev 1'deki bug condition exploration test'ini çalıştır
    - **BEKLENİLEN SONUÇ**: Test BAŞARILI olacak (bug'ın düzeltildiğini doğrular)
    - Assertion'lar şimdi başarılı olmalı:
      - ASSERT isValidHTML(file.content) - şimdi TRUE dönmeli
      - ASSERT NOT hasCorruptedHTMLTags(file.content) - şimdi TRUE dönmeli
      - ASSERT NOT hasCorruptedTurkishChars(file.content) - şimdi TRUE dönmeli
    - Tüm assertion'lar geçerse bug düzeltilmiş demektir
    - _Requirements: Expected Behavior Properties - design'dan 2.1, 2.2, 2.3, 2.4_

  - [x] 3.8 Preservation test'lerini yeniden çalıştır
    - **Property 2: Preservation** - CSS ve JavaScript Korundu
    - **ÖNEMLİ**: Görev 2'deki AYNI testleri çalıştır - yeni testler YAZMA
    - Görev 2'deki preservation property test'lerini çalıştır
    - **BEKLENİLEN SONUÇ**: Testler BAŞARILI olacak (regression olmadığını doğrular)
    - Tüm property'ler hala geçerli olmalı:
      - CSS selector'lar korunmuş
      - JavaScript fonksiyon adları korunmuş
      - URL ve href değerleri korunmuş
      - HTML class ve id değerleri korunmuş
      - CSS property değerleri korunmuş
    - Tüm testler geçerse regression olmadığı doğrulanmış demektir
    - _Requirements: Preservation Requirements - design'dan 3.1, 3.2, 3.3_

- [x] 4. Manuel doğrulama ve görsel test

  - [x] 4.1 Tarayıcıda görsel kontrol
    - Her HTML dosyasını Chrome, Firefox, Edge tarayıcılarında aç
    - Türkçe karakterlerin doğru görüntülendiğini kontrol et
    - Sayfaların doğru şekilde render edildiğini gözlemle
    - Layout'un bozulmadığını doğrula
    - CSS styling'in korunduğunu kontrol et
    - _Preservation: Visual layout and styling preserved_
    - _Requirements: 3.1, 3.2_

  - [x] 4.2 Fonksiyonel test
    - Navigation linklerinin çalıştığını test et (sayfa geçişleri)
    - Button'ların ve form element'lerinin çalıştığını test et
    - JavaScript interactivity'sinin çalıştığını doğrula (modal açma, dropdown, vb.)
    - Browser console'da hata olmadığını kontrol et
    - Mobile responsive görünümü test et (farklı ekran boyutları)
    - _Preservation: JavaScript functionality preserved_
    - _Requirements: 3.2, 3.3_

  - [x] 4.3 Diff comparison
    - Git diff veya diff tool ile düzeltilmiş dosyaları bozuk versiyonlarla karşılaştır
    - Sadece beklenen değişikliklerin yapıldığını doğrula:
      - HTML tag düzeltmeleri (hTümül→html, dişiv→div, vb.)
      - Türkçe karakter düzeltmeleri (İşBul→İşBul, G�venişilişir→Güvenilir)
      - CSS/JavaScript/URL'lerde SADECE Türkçe karakter düzeltmeleri
    - İstenmeyen değişiklik olmadığını kontrol et
    - Beklenmedik satır silme/ekleme olmadığını doğrula
    - _Preservation: No unexpected changes_
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Temiz backup oluştur ve dokümantasyon

  - [x] 5.1 Yeni temiz backup klasörü oluştur
    - Backup klasörü adı: `backup_html_clean_YYYYMMDD_HHMMSS`
    - Düzeltilmiş tüm HTML dosyalarını bu klasöre kopyala
    - Backup meta bilgisi içeren `README.txt` oluştur:
      - Backup tarihi ve saati
      - Backup nedeni: "HTML encoding bozulması düzeltmesi sonrası temiz kopya"
      - İçerik: "22 HTML dosyası - geçerli HTML syntax ve doğru UTF-8 Türkçe karakterler"
      - Script versiyonu ve kullanılan pattern'ler
    - _Requirements: 1.1_

  - [x] 5.2 Eski backup'ı arşivle
    - Eski backup klasörünü (`backup_html_20260816_141559`) arşiv klasörüne taşı
    - Arşiv klasörü adı: `archive_backups`
    - README.txt ekle: "Eski backup - encoding bozulması içerir"
    - _Requirements: 1.1_

  - [x] 5.3 Düzeltme raporu yaz
    - Rapor dosyası: `encoding_fix_report_YYYYMMDD.md`
    - Rapor içeriği:
      - Düzeltme tarihi ve saati
      - Düzeltilen dosya sayısı (22)
      - Uygulanan düzeltme pattern'leri (HTML tag, attribute, Turkish char)
      - Bulunan ve düzeltilen encoding hataları özeti
      - Test sonuçları (HTML validation, UTF-8 check, visual test, functional test)
      - Karşılaşılan sorunlar ve çözümleri (varsa)
      - Başarı kriterleri değerlendirmesi (design'daki 10 kriter)
    - Raporu `.kiro/specs/html-encoding-fix/` klasörüne kaydet
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_

- [x] 6. Checkpoint - Tüm testlerin başarılı olduğundan emin ol
  - Tüm property-based testlerin başarılı olduğunu doğrula
  - Tüm manuel testlerin tamamlandığını kontrol et
  - Design'daki 10 başarı kriterini gözden geçir ve hepsinin sağlandığını doğrula
  - Kullanıcıya raporu sun ve sorular varsa sor
  - _Requirements: Tüm requirements - 1.1, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_

---

## Notlar

- **Test-First Yaklaşımı**: Düzeltme yapmadan ÖNCE testler yazılmalı (Görev 1 ve 2)
- **Observation-First**: Preservation testleri bozuk kod üzerinde davranışı gözlemleyerek yazılmalı
- **Incremental Approach**: Önce tek dosyada test et, sonra hepsine uygula
- **Backup Strategy**: Her aşamada backup al, geri dönülebilir ol
- **Context-Aware Patterns**: Regex pattern'ler context-aware olmalı (CSS/JS içeriğini bozmamalı)
- **Manual Verification**: Otomatik testlerden sonra manuel görsel kontrol şart
