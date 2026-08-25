# 🚀 OTONOM TEST SİSTEMİ - HIZLI KURULUM

Write-Host "🤖 Otonom Self-Healing Test Sistemi Kurulumu Başlıyor..." -ForegroundColor Cyan
Write-Host ""

# 1. Python kontrolü
Write-Host "1️⃣ Python kontrolü..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Python bulundu: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Python bulunamadı! Lütfen Python 3.8+ yükleyin." -ForegroundColor Red
    Write-Host "   İndirme: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# 2. Virtual environment
Write-Host ""
Write-Host "2️⃣ Virtual environment oluşturuluyor..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "   ⚠️ venv zaten var, siliniyor..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force venv
}

python -m venv venv

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Virtual environment oluşturuldu" -ForegroundColor Green
} else {
    Write-Host "   ❌ Virtual environment oluşturulamadı!" -ForegroundColor Red
    exit 1
}

# 3. Virtual environment'ı aktif et
Write-Host ""
Write-Host "3️⃣ Virtual environment aktif ediliyor..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# 4. Paketleri yükle
Write-Host ""
Write-Host "4️⃣ Python paketleri yükleniyor..." -ForegroundColor Yellow
pip install -q --upgrade pip
pip install -q -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Paketler yüklendi" -ForegroundColor Green
} else {
    Write-Host "   ❌ Paketler yüklenemedi!" -ForegroundColor Red
    exit 1
}

# 5. Playwright tarayıcılarını yükle
Write-Host ""
Write-Host "5️⃣ Playwright tarayıcıları yükleniyor (bu biraz sürebilir)..." -ForegroundColor Yellow
playwright install chromium

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Tarayıcılar yüklendi" -ForegroundColor Green
} else {
    Write-Host "   ❌ Tarayıcılar yüklenemedi!" -ForegroundColor Red
    exit 1
}

# 6. .env kontrolü
Write-Host ""
Write-Host "6️⃣ Konfigürasyon kontrol ediliyor..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✅ .env dosyası mevcut" -ForegroundColor Green
    
    # API key kontrolü
    $envContent = Get-Content .env -Raw
    if ($envContent -match "GROQ_API_KEY=gsk_") {
        Write-Host "   ✅ Groq API key bulundu" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ .env dosyasında geçerli API key bulunamadı" -ForegroundColor Yellow
        Write-Host "   Lütfen .env dosyasını düzenleyin: GROQ_API_KEY=your_key_here" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️ .env dosyası bulunamadı!" -ForegroundColor Yellow
    Write-Host "   Örnek .env oluşturuluyor..." -ForegroundColor Yellow
    
    $envTemplate = @"
GROQ_API_KEY=your_groq_api_key_here
SITE_URL=https://isbul.online
"@
    
    $envTemplate | Out-File -FilePath .env -Encoding UTF8
    Write-Host "   ✅ .env dosyası oluşturuldu - Lütfen API key'inizi ekleyin!" -ForegroundColor Green
}

# 7. Test
Write-Host ""
Write-Host "7️⃣ Sistem testi yapılıyor..." -ForegroundColor Yellow
$testResult = python -c "import playwright; import groq; print('OK')" 2>&1

if ($testResult -match "OK") {
    Write-Host "   ✅ Tüm modüller yüklü" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Modül testi başarısız: $testResult" -ForegroundColor Yellow
}

# Başarı mesajı
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🎉 KURULUM TAMAMLANDI!                                ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Testi çalıştırmak için:" -ForegroundColor Green
Write-Host "   python autonomous_tester.py" -ForegroundColor White
Write-Host ""
Write-Host "📚 Dokümantasyon:" -ForegroundColor Green
Write-Host "   README.md dosyasına bakın" -ForegroundColor White
Write-Host ""
Write-Host "⚙️ Konfigürasyon:" -ForegroundColor Green
Write-Host "   .env dosyasını düzenleyin (GROQ_API_KEY)" -ForegroundColor White
Write-Host ""
