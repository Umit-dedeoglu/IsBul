# 🔧 GitHub Actions Sorun Giderme Rehberi

## 📊 Mevcut Durum

**Son 5 Commit:**
- ✅ `c2a952d` - fix: boş services bloğu kaldırıldı
- ✅ `765f092` - fix: workflow YAML emoji encoding hatası düzeltildi  
- ✅ `0464520` - trigger: GitHub Actions pipeline test
- ✅ `936511d` - docs: workflow düzeltme raporu eklendi
- ✅ `25c115c` - fix: smoke test endpoint hatası düzeltildi

**Workflow Durumu:**
- ❌ Tüm workflow'lar "Failure" gösteriyor
- 🔍 Detaylı hata mesajı gerekli

## 🎯 Yapılması Gerekenler

### 1. GitHub Actions Settings Kontrolü

#### Adım 1: Actions'ı Aktif Edin

```
GitHub Repository → Settings → Actions → General
```

**Yapılması gereken ayarlar:**

1. **Actions permissions:**
   - ✅ `Allow all actions and reusable workflows` seçin

2. **Workflow permissions:**
   - ✅ `Read and write permissions` seçin
   - ✅ `Allow GitHub Actions to create and approve pull requests` işaretleyin

3. **Save** butonuna tıklayın

#### Adım 2: Branch Protection Kontrol

```
Settings → Branches → Branch protection rules
```

Eğer `main` veya `sonhafta_pazartesi_gunsonu` için protection rule varsa:
- ✅ "Require status checks to pass before merging" kapalı olmalı (ya da workflow'ları ekleyin)

### 2. Workflow Detaylı Log İnceleme

#### En Son Başarısız Workflow'a Tıklayın

1. **Actions sekmesine gidin**
2. **En üstteki başarısız workflow'a tıklayın**
3. **Herhangi bir job'a tıklayın** (örn: "lint", "security", vb.)
4. **Hata mesajını kopyalayın**

#### Beklenen Hatalar:

**A) Permission Hatası**
```
Error: Resource not accessible by integration
```
**Çözüm:** Settings → Actions → Workflow permissions → Read and write

**B) Secrets Hatası**
```
Error: Secret RENDER_DEPLOY_HOOK not found
```
**Çözüm:** Settings → Secrets → Actions → RENDER_DEPLOY_HOOK ekleyin

**C) Branch Hatası**
```
Error: Branch not found
```
**Çözüm:** Workflow'daki branch isimlerini kontrol edin

### 3. Manuel Workflow Çalıştırma Testi

```
Actions → CI - Continuous Integration → Run workflow
→ Branch: sonhafta_pazartesi_gunsonu
→ Run workflow
```

Bu şekilde manuel test edebilirsiniz.

### 4. YAML Syntax Validation (Yerel)

```powershell
# Online validator kullanın
# https://www.yamllint.com/

# Ya da Node.js ile:
npx yaml-lint .github/workflows/*.yml
```

## 🔍 Debug Komutları

### Workflow Dosyalarını Kontrol

```powershell
# YAML syntax check (basit)
cd .github/workflows
Get-Content ci.yml | Select-String -Pattern ":\s*$"

# Dosya boyutları
Get-ChildItem *.yml | Select-Object Name, Length

# Son değişiklikler
git diff HEAD~1 HEAD -- .github/workflows/
```

### GitHub CLI ile Workflow Durumu

```bash
# GitHub CLI kuruluysa
gh workflow list
gh run list --limit 5
gh run view [run-id]
```

## 📋 Kontrol Listesi

### ✅ Yerel Kontroller (Tamamlandı)
- [x] YAML syntax temiz
- [x] Emoji encoding düzeltildi
- [x] Boş keys kaldırıldı
- [x] Endpoint hataları düzeltildi
- [x] Commit'ler başarılı
- [x] Push başarılı

### ⏳ GitHub Kontroller (Yapılacak)
- [ ] Actions permissions aktif mi?
- [ ] Workflow permissions doğru mu?
- [ ] Branch protection engel değil mi?
- [ ] Secrets tanımlı mı? (CD için)
- [ ] Detaylı log incelendi mi?

## 🎬 Video Tutorial

Eğer görsel olarak görmek isterseniz:

1. **Actions Sekmesi**
   - Repository ana sayfa → Actions tab
   - Workflow listesi görünmeli

2. **Settings → Actions**
   - Sol menüden Actions
   - General → Permissions ayarları
   - Secrets and variables → Actions secrets

3. **Workflow Run Details**
   - Actions → Başarısız workflow
   - Job'a tıkla → Step'lere bak
   - Kırmızı X'li step'e tıkla → Log oku

## 🆘 Hızlı Çözümler

### Sorun: "Workflow disabled"
```
Actions → All workflows → CI - Continuous Integration
→ Enable workflow butonu varsa tıklayın
```

### Sorun: "No workflows found"
```
.github/workflows/ klasörü doğru yerde mi kontrol edin
Git push başarılı mı kontrol edin
```

### Sorun: "Invalid workflow"
```
YAML syntax hatası var
En son commit'teki workflow dosyalarını kontrol edin
```

## 📞 Sonraki Adım

**Şu anda yapmanız gereken:**

1. ✅ GitHub → Repository → Settings → Actions → General
2. ✅ "Allow all actions" seçin
3. ✅ "Read and write permissions" seçin
4. ✅ Save
5. ✅ Actions sekmesine dön
6. ✅ Herhangi bir başarısız workflow'a tıkla
7. ✅ Detaylı hata mesajını bana gösterin

Ben o hata mesajını görünce tam çözümü verebilirim!

---

**Not:** GitHub Actions ücretsiz plan limitler:
- Public repo: Sınırsız
- Private repo: 2000 dakika/ay

Repository public ise sorun yok. Private ise dakika limitini kontrol edin.
