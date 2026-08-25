# Auth Modal'ları Merkezi Component'e Çevirme Scripti
# Bu script tüm HTML dosyalarındaki auth modal bloklarını kaldırır
# ve merkezi component loader'ı ekler

$files = @(
    "blog.html",
    "gizlilik.html",
    "hakkimizda.html",
    "hizmetler.html",
    "kvkk.html",
    "nasil-calisir.html",
    "profil.html",
    "sartlar.html",
    "uzman-ol.html",
    "uzman-panel.html",
    "uzman-profil.html",
    "uzmanlar.html"
)

Write-Host "🔧 Auth Modal Güncelleme Başlıyor..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    $filePath = "c:\Users\umity\Desktop\ufakisler\isbul\$file"
    
    if (-not (Test-Path $filePath)) {
        Write-Host "⚠️  $file bulunamadı, atlanıyor..." -ForegroundColor Yellow
        continue
    }
    
    Write-Host "📝 İşleniyor: $file" -ForegroundColor White
    
    # Yedek al
    $backupPath = "$filePath.backup-auth-component"
    Copy-Item $filePath $backupPath -Force
    Write-Host "   ✅ Yedek alındı: $($file).backup-auth-component" -ForegroundColor Green
    
    # Dosyayı oku
    $content = Get-Content $filePath -Raw -Encoding UTF8
    
    # AUTH MODAL bloğunu bul ve kaldır
    # Farklı varyasyonları kapsamak için regex kullan
    $patterns = @(
        '<!--\s*=+\s*AUTH MODAL\s*=+\s*-->\s*<div class="modal-overlay" id="authModal">.*?</div>\s*</div>\s*</div>',
        '<!--\s*AUTH MODAL\s*-->\s*<div class="modal-overlay" id="authModal">.*?</div>\s*</div>\s*</div>'
    )
    
    $modified = $false
    foreach ($pattern in $patterns) {
        if ($content -match $pattern) {
            $content = $content -replace $pattern, '<!-- Auth Modal buraya component olarak yüklenecek -->'
            $modified = $true
            Write-Host "   ✅ Auth modal bloğu kaldırıldı" -ForegroundColor Green
            break
        }
    }
    
    if (-not $modified) {
        Write-Host "   ⚠️  Auth modal bloğu bulunamadı (manuel kontrol gerekebilir)" -ForegroundColor Yellow
    }
    
    # Component loader ekle (eğer yoksa)
    if ($content -notmatch 'component-loader\.js') {
        # app.js'ten sonra ekle
        $content = $content -replace '(<script src="assets/js/app\.js"></script>)', "`$1`n  <!-- Merkezi Component Loader -->`n  <script src=`"components/component-loader.js`"></script>"
        Write-Host "   ✅ Component loader eklendi" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Component loader zaten mevcut" -ForegroundColor Cyan
    }
    
    # Dosyayı kaydet
    $content | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
    Write-Host "   ✅ Dosya güncellendi" -ForegroundColor Green
    Write-Host ""
}

Write-Host "✅ Tamamlandı! Toplam $($files.Count) dosya işlendi." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Sonraki Adımlar:" -ForegroundColor Yellow
Write-Host "1. test-component.html sayfasını açarak test edin" -ForegroundColor White
Write-Host "2. İndex.html ve diğer sayfaları test edin" -ForegroundColor White
Write-Host "3. Sorun yoksa yedek dosyaları silebilirsiniz: Get-ChildItem *.backup-auth-component | Remove-Item" -ForegroundColor White
