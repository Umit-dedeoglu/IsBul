# 🚀 GitHub Actions CI/CD Pipeline

Bu klasör İşBul projesinin CI/CD pipeline'larını içerir.

## 📋 Workflows

### 1. 🚀 CI - Continuous Integration (`ci.yml`)

**Tetiklenir:** Push ve Pull Request olaylarında

**İşler:**
- ✅ Code quality & linting
- 🔒 Security scan
- 🧪 Backend tests
- 🎨 Frontend tests
- 🏗️ Build check
- 🔗 Integration tests
- 🔍 Deployment preview (PR'larda)

**Çalışma süresi:** ~5-8 dakika

### 2. 🚢 CD - Continuous Deployment (`cd.yml`)

**Tetiklenir:** Main branch'e push veya manuel

**İşler:**
- 🚀 Deploy to Render (Backend)
- 🎨 Deploy Frontend
- 💨 Smoke tests
- 📢 Notifications
- 🏷️ Release creation (version tags için)

**Çalışma süresi:** ~3-5 dakika

### 3. 🔍 PR Check (`pr-check.yml`)

**Tetiklenir:** Pull Request açıldığında/güncellendiğinde

**İşler:**
- 📋 PR bilgi analizi
- 🔎 Kod değişiklik analizi
- 📦 Dependency kontrolü
- 🔒 Security review
- 👥 Auto-assign reviewers
- 🏷️ Auto-labeling
- 📏 PR boyut kontrolü

**Çalışma süresi:** ~2-3 dakika

### 4. ⏰ Scheduled Maintenance (`scheduled.yml`)

**Tetiklenir:** Her gün saat 03:00 UTC (Türkiye 06:00)

**İşler:**
- 📦 Dependency update kontrolü
- 🏥 Production health check
- 💾 Backup kontrolü
- 📊 Code quality raporu
- ⚡ Performance monitoring
- 🧹 Old branch cleanup
- 📋 Daily report

**Çalışma süresi:** ~3-5 dakika

## 🔧 Gerekli GitHub Secrets

Aşağıdaki secret'ları GitHub repository ayarlarından ekleyin:

```
Settings > Secrets and variables > Actions > New repository secret
```

### Backend Deployment
- `RENDER_SERVICE_ID` - Render backend service ID
- `RENDER_DEPLOY_HOOK` - Render deploy hook URL
- `RENDER_FRONTEND_DEPLOY_HOOK` - Render frontend deploy hook URL (opsiyonel)

### Notifications (Opsiyonel)
- `SLACK_WEBHOOK_URL` - Slack bildirim URL'i
- `DISCORD_WEBHOOK_URL` - Discord bildirim URL'i

## 📊 Status Badges

Projenizin README.md dosyasına ekleyebileceğiniz badge'ler:

```markdown
![CI Status](https://github.com/Umit-dedeoglu/IsBul/workflows/CI/badge.svg)
![CD Status](https://github.com/Umit-dedeoglu/IsBul/workflows/CD/badge.svg)
![PR Check](https://github.com/Umit-dedeoglu/IsBul/workflows/PR%20Check/badge.svg)
```

## 🎯 Workflow Kullanımı

### Manuel Deployment

1. GitHub repository'ye gidin
2. Actions sekmesini açın
3. "CD - Continuous Deployment" workflow'unu seçin
4. "Run workflow" butonuna tıklayın
5. Environment seçin (production/staging)
6. "Run workflow" ile başlatın

### PR Oluşturma

```bash
# Feature branch oluştur
git checkout -b feature/yeni-ozellik

# Değişiklikleri commit et
git add .
git commit -m "feat: yeni özellik eklendi"

# GitHub'a push et
git push origin feature/yeni-ozellik

# GitHub'da PR oluştur
# CI ve PR Check otomatik çalışacak
```

### Version Release

```bash
# Tag oluştur
git tag -a v1.0.0 -m "Release v1.0.0"

# Tag'i push et
git push origin v1.0.0

# CD workflow otomatik deployment yapacak
# GitHub Release otomatik oluşturulacak
```

## 🔍 Workflow Monitoring

### GitHub Actions Dashboard

```
https://github.com/Umit-dedeoglu/IsBul/actions
```

### Logları Görüntüleme

1. Actions sekmesine gidin
2. İlgili workflow run'ı seçin
3. Job'ları genişletin
4. Step loglarını inceleyin

### Failed Workflow

Bir workflow başarısız olursa:

1. **Log'ları kontrol edin**
   - Hangi step başarısız oldu?
   - Hata mesajı nedir?

2. **Yerel olarak test edin**
   ```bash
   # Backend tests
   cd server
   npm test
   
   # Linting
   npm run lint
   
   # Security audit
   npm audit
   ```

3. **Düzelt ve tekrar dene**
   ```bash
   git add .
   git commit -m "fix: workflow hatası düzeltildi"
   git push
   ```

## 🛠️ Workflow Özelleştirme

### Yeni Job Ekleme

```yaml
jobs:
  custom-job:
    name: 🎯 Custom Job
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v4
        
      - name: 🔧 Your custom step
        run: |
          echo "Custom logic here"
```

### Environment Variables

Workflow içinde env kullanımı:

```yaml
env:
  NODE_VERSION: '18.x'
  CUSTOM_VAR: 'value'
  
jobs:
  job-name:
    steps:
      - run: echo ${{ env.CUSTOM_VAR }}
```

### Conditional Execution

```yaml
steps:
  - name: Only on main
    if: github.ref == 'refs/heads/main'
    run: echo "Main branch"
    
  - name: Only on PR
    if: github.event_name == 'pull_request'
    run: echo "Pull request"
```

## 📈 Performance Tips

### Cache Dependencies

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '18.x'
    cache: 'npm'  # Bağımlılıkları cache'le
```

### Paralel Execution

Jobs varsayılan olarak paraleldir:

```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
  job2:
    runs-on: ubuntu-latest  # job1 ile aynı anda çalışır
  job3:
    needs: [job1, job2]      # job1 ve job2 bittikten sonra
```

### Matrix Strategy

Birden fazla versiyonda test:

```yaml
strategy:
  matrix:
    node: [16, 18, 20]
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node }}
```

## 🔒 Security Best Practices

1. **Secret'ları asla commit etmeyin**
2. **GitHub Secrets kullanın**
3. **Minimal permissions verin**
4. **Third-party actions'ları pin edin** (örn: `@v4` yerine `@v4.1.2`)
5. **Dependency scanning aktif tutun**

## 📚 Kaynaklar

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

## 🆘 Destek

Sorularınız için:
- GitHub Issues açın
- Team slack kanalı: #devops
- Documentation: `/docs/ci-cd.md`

---

**Son güncelleme:** 2026-08-25
**Yazar:** İşBul Dev Team
