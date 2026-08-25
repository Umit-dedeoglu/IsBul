# İŞBUL PRODUCTION DEPLOYMENT SCRIPT
# ═══════════════════════════════════════════════════

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 İŞBUL PRODUCTION DEPLOYMENT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# AWS bilgileri
$SERVER = "34.239.191.168"
$USER = "ubuntu"
$KEY = "C:\Users\umity\.ssh\isbul-keypair.pem"
$REMOTE_PATH = "/var/www/isbul"

# Değişen dosyalar
$FILES = @(
    "uzmanlar.html",
    "uzman-profil.html",
    "uzman-ol.html",
    "uzman-panel.html",
    "profil.html",
    "blog.html",
    "hakkimizda.html",
    "gizlilik.html",
    "kvkk.html",
    "create-account.html",
    "forgot-password.html",
    "reset-password.html",
    "nasil-calisir.html"
)

Write-Host "📋 Deploy Bilgileri:" -ForegroundColor Yellow
Write-Host "   • Sunucu: $SERVER" -ForegroundColor Gray
Write-Host "   • Kullanıcı: $USER" -ForegroundColor Gray
Write-Host "   • Dosya Sayısı: $($FILES.Count)" -ForegroundColor Gray
Write-Host ""

# SSH key kontrolü
if (-not (Test-Path $KEY)) {
    Write-Host "❌ SSH key bulunamadı: $KEY" -ForegroundColor Red
    Write-Host "   Lütfen key'in yolunu kontrol edin." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ SSH key bulundu" -ForegroundColor Green
Write-Host ""

$BACKUP_NAME = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Backup oluştur
Write-Host "📦 Backup oluşturuluyor..." -ForegroundColor Yellow

$backupCmd = "ssh -i `"$KEY`" -o StrictHostKeyChecking=no $USER@$SERVER `"cd $REMOTE_PATH; mkdir -p backups; tar -czf backups/$BACKUP_NAME.tar.gz $($FILES -join ' ')`""
try {
    Invoke-Expression $backupCmd
    Write-Host "✅ Backup oluşturuldu: $BACKUP_NAME.tar.gz" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backup oluşturulamadı (devam ediliyor)" -ForegroundColor Yellow
}
Write-Host ""

# Dosyaları upload et
Write-Host "📤 Dosyalar yükleniyor..." -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($file in $FILES) {
    Write-Host "   [$($successCount + $failCount + 1)/$($FILES.Count)] $file" -NoNewline
    
    $localFile = Join-Path $PSScriptRoot $file
    
    if (-not (Test-Path $localFile)) {
        Write-Host " ❌ Dosya bulunamadı" -ForegroundColor Red
        $failCount++
        continue
    }
    
    try {
        # SCP ile dosya yükle
        $scpCmd = "scp -i `"$KEY`" -o StrictHostKeyChecking=no `"$localFile`" $USER@${SERVER}:${REMOTE_PATH}/$file"
        $result = Invoke-Expression $scpCmd 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " ❌ $result" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host " ❌ $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 DEPLOYMENT ÖZET" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Başarılı: $successCount/$($FILES.Count)" -ForegroundColor Green
Write-Host "❌ Başarısız: $failCount/$($FILES.Count)" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($successCount -eq $FILES.Count) {
    Write-Host "🎉 TÜM DOSYALAR BAŞARIYLA YÜKLENDI!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Site URL: https://isbul.online" -ForegroundColor Cyan
    Write-Host "   Değişiklikleri kontrol edin!" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Bazı dosyalar yüklenemedi!" -ForegroundColor Yellow
    Write-Host "   Hataları kontrol edin ve tekrar deneyin." -ForegroundColor Gray
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Test önerisi
Write-Host "💡 Deployment sonrasi test:" -ForegroundColor Yellow
Write-Host "   cd autonomous-tests" -ForegroundColor Gray
Write-Host "   python test_now.py" -ForegroundColor Gray
Write-Host ""
