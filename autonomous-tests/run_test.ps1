# 🚀 HIZLI TEST ÇALIŞTIRMA

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("login", "register", "expert", "all-pages", "full")]
    [string]$Test = "login"
)

Write-Host "🤖 Otonom Test Sistemi Başlatılıyor..." -ForegroundColor Cyan
Write-Host ""

# Virtual environment'ı aktif et
if (Test-Path "venv\Scripts\Activate.ps1") {
    & .\venv\Scripts\Activate.ps1
    Write-Host "✅ Virtual environment aktif" -ForegroundColor Green
} else {
    Write-Host "❌ Virtual environment bulunamadı!" -ForegroundColor Red
    Write-Host "Lütfen önce setup.ps1 çalıştırın:" -ForegroundColor Yellow
    Write-Host "   .\setup.ps1" -ForegroundColor White
    exit 1
}

# .env kontrolü
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env dosyası bulunamadı!" -ForegroundColor Red
    Write-Host "Lütfen .env dosyası oluşturun ve GROQ_API_KEY ekleyin" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Test Tipi: $Test" -ForegroundColor Yellow
Write-Host ""

# Test seçimine göre Python komutunu oluştur
switch ($Test) {
    "login" {
        Write-Host "🔐 Login sayfası analizi başlatılıyor..." -ForegroundColor Cyan
        $testCommand = "from autonomous_tester import test_login_page_analysis; test_login_page_analysis()"
    }
    "register" {
        Write-Host "📝 Kayıt akışı testi başlatılıyor..." -ForegroundColor Cyan
        $testCommand = "from autonomous_tester import test_registration_flow; test_registration_flow()"
    }
    "expert" {
        Write-Host "👔 Uzman başvurusu testi başlatılıyor..." -ForegroundColor Cyan
        $testCommand = "from autonomous_tester import test_expert_application; test_expert_application()"
    }
    "all-pages" {
        Write-Host "🔍 TÜM sayfalarda Facebook taraması başlatılıyor..." -ForegroundColor Cyan
        $testCommand = "from autonomous_tester import test_all_pages_for_facebook_button; test_all_pages_for_facebook_button()"
    }
    "full" {
        Write-Host "🎯 TÜM testler çalıştırılıyor..." -ForegroundColor Cyan
        python autonomous_tester.py
        exit
    }
}

# Testi çalıştır
python -c $testCommand

Write-Host ""
Write-Host "✅ Test tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "📸 Screenshot ve raporlar mevcut klasörde oluşturuldu" -ForegroundColor Yellow
Write-Host ""
