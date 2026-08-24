# ISBUL DEPLOYMENT SCRIPT
Write-Host "Deploying to AWS..." -ForegroundColor Green

$SERVER = "34.239.191.168"
$USER = "ubuntu"
$KEY = "C:\Users\umity\.ssh\isbul-keypair.pem"
$REMOTE_PATH = "/var/www/isbul"

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

Write-Host "Files to deploy: $($FILES.Count)"
Write-Host ""

$count = 0
foreach ($file in $FILES) {
    $count++
    Write-Host "[$count/$($FILES.Count)] Uploading $file..." -NoNewline
    
    $localFile = Join-Path $PSScriptRoot $file
    
    if (Test-Path $localFile) {
        & scp -i $KEY -o StrictHostKeyChecking=no $localFile "${USER}@${SERVER}:${REMOTE_PATH}/$file" 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " OK" -ForegroundColor Green
        } else {
            Write-Host " FAILED" -ForegroundColor Red
        }
    } else {
        Write-Host " NOT FOUND" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Test: python autonomous-tests/test_now.py"
