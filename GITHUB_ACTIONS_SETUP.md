# 🚀 GitHub Actions CI/CD Pipeline Kurulum Rehberi

## ✅ Yapılanlar

### 1. **CI/CD Pipeline Oluşturuldu**

Toplam 4 workflow:
- ✅ `ci.yml` - Continuous Integration (Test, lint, build)
- ✅ `cd.yml` - Continuous Deployment (Render deployment)
- ✅ `pr-check.yml` - Pull Request otomatik kontroller
- ✅ `scheduled.yml` - Günlük bakım görevleri

### 2. **Merkezi Component Sistemi**

- ✅ `components/auth-modal.html` - Tek merkezi auth modal
- ✅ `components/component-loader.js` - Otomatik yükleyici
- ✅ `index.html` component sistemine geçirildi

### 3. **Dokümantasyon**

- ✅ `.github/README.md` - Pipeline detaylı açıklaması
- ✅ `COMPONENT_SYSTEM_README.md` - Component sistem rehberi
- ✅ Bu dosya - Kurulum rehberi

## 🎯 GitHub Actions Aktif Etme

### Adım 1: Repository Ayarları

1. **GitHub'a gidin:**
   ```
   https://github.com/Umit-dedeoglu/IsBul
   ```

2. **Settings > Actions > General**
   - ✅ "Allow all actions and reusable workflows" seçin
   - ✅ "Read and write permissions" seçin
   - ✅ "Allow GitHub Actions to create and approve pull requests" işaretleyin
   - **Save** butonuna tıklayın

### Adım 2: Secrets Ekleyin

**Settings > Secrets and variables > Actions**

#### Render Deployment İçin:

```
New repository secret → Add secret
```

**Gerekli Secrets:**

1. **RENDER_DEPLOY_HOOK**
   - Render Dashboard'a gidin
   - Backend service'inizi seçin
   - Settings > Deploy Hook
   - URL'i kopyalayın
   - GitHub'da secret olarak ekleyin

2. **RENDER_SERVICE_ID** (Opsiyonel)
   - Render service ID'nizi ekleyin
   - URL'deki service ID: `https://dashboard.render.com/web/srv-xxxxx`

3. **RENDER_FRONTEND_DEPLOY_HOOK** (Opsiyonel)
   - Frontend için ayrı bir static site varsa ekleyin

#### Notification İçin (Opsiyonel):

4. **SLACK_WEBHOOK_URL**
   - Slack workspace webhook URL'i

5. **DISCORD_WEBHOOK_URL**
   - Discord server webhook URL'i

### Adım 3: İlk Workflow'u Test Edin

#### Otomatik Test (Push ile):

```bash
# Küçük bir değişiklik yapın
echo "# Test" >> README.md

# Commit ve push
git add README.md
git commit -m "test: GitHub Actions test"
git push origin sonhafta_pazartesi_gunsonu
```

#### Manuel Test:

1. **GitHub'da Actions sekmesine gidin**
2. **"CD - Continuous Deployment" seçin**
3. **"Run workflow" butonuna tıklayın**
4. **Environment:** production
5. **"Run workflow" butonuna tıklayın**

### Adım 4: Workflow Durumunu Kontrol Edin

```
https://github.com/Umit-dedeoglu/IsBul/actions
```

## 📊 Pipeline Özellikleri

### CI Pipeline (Otomatik)

**Ne zaman çalışır:** Her push ve PR'da

**Ne yapar:**
1. ✅ Code quality check (ESLint)
2. 🔒 Security scan (npm audit, secrets)
3. 🧪 Backend tests
4. 🎨 Frontend validation
5. 🏗️ Build check
6. 🔗 Integration tests
7. 📊 Test summary

**Süre:** ~5-8 dakika

### CD Pipeline (Manuel/Otomatik)

**Ne zaman çalışır:** Main branch push veya manuel

**Ne yapar:**
1. 🚀 Render'a deploy
2. ⏳ Health check (30 saniye bekleme)
3. 💨 Smoke tests
4. 📢 Notification
5. 🏷️ Release creation (tag varsa)

**Süre:** ~3-5 dakika

### PR Check (Otomatik)

**Ne zaman çalışır:** PR açıldığında/güncellendiğinde

**Ne yapar:**
1. 📋 PR analizi (değişiklikler, boyut)
2. 👥 Auto-assign reviewers
3. 🏷️ Auto-labeling
4. 🔒 Security review
5. 💬 PR comment

**Süre:** ~2-3 dakika

### Scheduled (Günlük)

**Ne zaman çalışır:** Her gün 03:00 UTC (Türkiye 06:00)

**Ne yapar:**
1. 📦 Dependency updates kontrolü
2. 🏥 Production health check
3. 💾 Backup durumu
4. 📊 Code statistics
5. ⚡ Performance metrics
6. 🧹 Old branch cleanup
7. 🚨 Issue creation (sorun varsa)

**Süre:** ~3-5 dakika

## 🎨 README Badge'leri

Ana README.md dosyanıza ekleyebilirsiniz:

```markdown
# İşBul

![CI Status](https://github.com/Umit-dedeoglu/IsBul/workflows/🚀%20CI%20-%20Continuous%20Integration/badge.svg)
![CD Status](https://github.com/Umit-dedeoglu/IsBul/workflows/🚢%20CD%20-%20Continuous%20Deployment/badge.svg)
![PR Check](https://github.com/Umit-dedeoglu/IsBul/workflows/🔍%20PR%20-%20Pull%20Request%20Checks/badge.svg)

Türkiye'nin güvenilir ev ve ofis hizmetleri platformu.
```

## 🔧 Render Deploy Hook Alma

### Backend (Node.js Service)

1. **Render Dashboard'a gidin:** https://dashboard.render.com
2. **Backend service'inizi seçin** (isbul-backend)
3. **Settings sekmesine tıklayın**
4. **"Deploy Hook" bölümünü bulun**
5. **"Create Deploy Hook" butonuna tıklayın**
6. **URL'i kopyalayın** (örn: `https://api.render.com/deploy/srv-xxxxx?key=xxxxx`)
7. **GitHub'da secret olarak ekleyin:**
   - Name: `RENDER_DEPLOY_HOOK`
   - Value: kopyaladığınız URL

### Frontend (Static Site - Opsiyonel)

Eğer frontend için ayrı bir Render static site varsa:

1. **Frontend service'i seçin**
2. **Aynı adımları takip edin**
3. **Secret name:** `RENDER_FRONTEND_DEPLOY_HOOK`

## 🧪 Test Senaryoları

### Senaryo 1: Feature Branch

```bash
# Feature branch oluştur
git checkout -b feature/yeni-ozellik

# Değişiklik yap
echo "Yeni özellik" >> feature.txt
git add feature.txt
git commit -m "feat: yeni özellik eklendi"

# Push et
git push origin feature/yeni-ozellik

# Sonuç: CI pipeline otomatik çalışır
```

### Senaryo 2: Pull Request

```bash
# GitHub'da PR oluştur
# feature/yeni-ozellik → main

# Sonuç: 
# - CI pipeline çalışır
# - PR check çalışır
# - Auto-label eklenir
# - Reviewers assign edilir
```

### Senaryo 3: Production Deployment

```bash
# Main branch'e merge
git checkout main
git merge feature/yeni-ozellik
git push origin main

# Sonuç:
# - CI pipeline çalışır
# - CD pipeline çalışır (otomatik deploy)
# - Smoke tests çalışır
```

### Senaryo 4: Version Release

```bash
# Tag oluştur
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Sonuç:
# - CD pipeline çalışır
# - GitHub Release oluşturulur
# - Deployment yapılır
```

## 🚨 Sorun Giderme

### Workflow Çalışmıyor

**Kontrol listesi:**
- ✅ Actions Settings'de "Allow all actions" seçili mi?
- ✅ Workflow dosyası `.github/workflows/` klasöründe mi?
- ✅ YAML syntax hatası var mı?
- ✅ Branch koruması workflow'u engelliyor mu?

**Çözüm:**
```bash
# YAML syntax kontrol
yamllint .github/workflows/*.yml

# Dosya konumu kontrol
ls -la .github/workflows/
```

### Deployment Başarısız

**Kontrol listesi:**
- ✅ `RENDER_DEPLOY_HOOK` secret doğru mu?
- ✅ Render service çalışıyor mu?
- ✅ Health check endpoint (`/api/health`) çalışıyor mu?

**Çözüm:**
```bash
# Health check manuel test
curl https://isbul-backend.onrender.com/api/health

# Render logs kontrol
# Render Dashboard > Service > Logs
```

### Secret Bulunamıyor

**Hata:** `secret.RENDER_DEPLOY_HOOK is not defined`

**Çözüm:**
1. GitHub Settings > Secrets
2. Secret'ın adını kontrol edin (büyük/küçük harf)
3. Repository seviyesinde mi, environment seviyesinde mi?
4. Workflow'da doğru referans edilmiş mi: `${{ secrets.RENDER_DEPLOY_HOOK }}`

## 📈 Gelecek İyileştirmeler

### Kısa Vadeli
- [ ] Test coverage tracking (Codecov integration)
- [ ] Performance budgets
- [ ] Visual regression testing
- [ ] E2E tests (Playwright/Cypress)

### Orta Vadeli
- [ ] Staging environment
- [ ] Canary deployments
- [ ] Rollback mechanism
- [ ] Multi-region deployment

### Uzun Vadeli
- [ ] Kubernetes deployment
- [ ] Auto-scaling policies
- [ ] Advanced monitoring (Grafana, Prometheus)
- [ ] Cost optimization

## 📚 Ek Kaynaklar

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Render Docs:** https://render.com/docs
- **Workflow Examples:** `.github/workflows/` klasörü
- **Component System:** `COMPONENT_SYSTEM_README.md`

## 🆘 Destek

Sorularınız için:
- 📧 Email: umityakupdedeoglu0@gmail.com
- 🐛 Issues: https://github.com/Umit-dedeoglu/IsBul/issues
- 📖 Documentation: `.github/README.md`

---

**✅ Kurulum Tamamlandı!**

Artık profesyonel bir CI/CD pipeline'ınız var. Her commit otomatik test edilecek, her deployment güvenli şekilde yapılacak.

**İyi çalışmalar! 🚀**
