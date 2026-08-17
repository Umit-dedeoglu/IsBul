# Apple butonlarını kaldır ve Google butonunu düzelt

$googleIcon = @'
<svg width="18" height="18" viewBox="0 0 18 18" style="margin-right:8px">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
'@

$files = Get-ChildItem -Path . -Filter "*.html" -Recurse -Exclude "node_modules","backup*"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    # Apple ile Giriş butonlarını kaldır
    $patterns = @(
        '<button class="auth-social-btn" onclick="handleOAuth\(''apple''\)">[^<]*Apple ile Giriş</button>',
        '<button class="auth-social-btn" onclick="handleOAuth\(''apple''\)">[^<]*Apple ile Kayıt</button>'
    )
    
    foreach ($pattern in $patterns) {
        if ($content -match $pattern) {
            $content = $content -replace $pattern, ''
            $modified = $true
        }
    }
    
    # Google butonlarını düzelt (tüm varyasyonlar)
    $googlePatterns = @{
        '<button class="auth-social-btn" onclick="handleOAuth\(''google''\)">[^<]*Google ile Giriş</button>' = "<button class=""auth-social-btn"" onclick=""handleOAuth('google')"">$googleIcon Google ile Giriş</button>"
        '<button class="auth-social-btn" onclick="handleOAuth\(''google''\)">[^<]*Google ile Kayıt</button>' = "<button class=""auth-social-btn"" onclick=""handleOAuth('google')"">$googleIcon Google ile Kayıt</button>"
    }
    
    foreach ($pattern in $googlePatterns.Keys) {
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $googlePatterns[$pattern]
            $modified = $true
        }
    }
    
    if ($modified) {
        $content | Set-Content $file.FullName -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nDone!"
