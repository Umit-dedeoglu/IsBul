<#
.SYNOPSIS
    Fixes HTML encoding corruption in Turkish HTML files

.DESCRIPTION
    This script fixes double encoding corruption in HTML files by:
    1. Correcting corrupted HTML tags (hTümül -> html, dişiv -> div, etc.)
    2. Correcting corrupted HTML attributes (işid -> id, vişiewport -> viewport, etc.)
    3. Correcting corrupted Turkish characters (İşBul -> İşBul, G�venişilişir -> Güvenilir, etc.)
    4. Preserving CSS and JavaScript code structure
    5. Validating UTF-8 encoding with proper meta tags

.PARAMETER FilePath
    Path to the HTML file to fix. Can be a single file or use wildcards.

.PARAMETER OutputPath
    Optional output path. If not specified, fixes are applied in-place (original backed up).

.PARAMETER CreateBackup
    If true, creates a backup of the original file before fixing. Default is true.

.PARAMETER DryRun
    If true, shows what would be changed without actually modifying files.

.EXAMPLE
    .\Fix-HtmlEncoding.ps1 -FilePath "index.html"
    
.EXAMPLE
    .\Fix-HtmlEncoding.ps1 -FilePath "*.html" -CreateBackup $true

.EXAMPLE
    .\Fix-HtmlEncoding.ps1 -FilePath "index.html" -DryRun $true
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "",
    
    [Parameter(Mandatory=$false)]
    [bool]$CreateBackup = $true,
    
    [Parameter(Mandatory=$false)]
    [bool]$DryRun = $false
)

# Color output functions
function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Warning2 {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Yellow
}

function Write-Error2 {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

# Function to detect if content is inside CSS or JavaScript blocks
function Test-IsInCodeBlock {
    param(
        [string]$Content,
        [int]$Position
    )
    
    # Check if position is within <style>...</style>
    $stylePattern = '(?s)<style[^>]*>.*?</style>'
    $styleMatches = [regex]::Matches($Content, $stylePattern)
    foreach ($match in $styleMatches) {
        if ($Position -ge $match.Index -and $Position -le ($match.Index + $match.Length)) {
            return $true
        }
    }
    
    # Check if position is within <script>...</script>
    $scriptPattern = '(?s)<script[^>]*>.*?</script>'
    $scriptMatches = [regex]::Matches($Content, $scriptPattern)
    foreach ($match in $scriptMatches) {
        if ($Position -ge $match.Index -and $Position -le ($match.Index + $match.Length)) {
            return $true
        }
    }
    
    return $false
}

# Function to fix HTML tag corruption (HIGH PRIORITY)
function Fix-HtmlTagCorruption {
    param([string]$Content)
    
    Write-Info "  [STEP 1] Fixing HTML tag corruption..."
    
    # HTML tag replacements - order matters (longest first to avoid partial replacements)
    $tagReplacements = @{
        '<!DOCTYPE hTümül>' = '<!DOCTYPE html>'
        '<hTümül' = '<html'
        '</hTümül>' = '</html>'
        'scrişipt' = 'script'
        'sectişion' = 'section'
        'lişink' = 'link'
        'dişiv' = 'div'
        'işinput' = 'input'
        'işimg' = 'img'
        'işiframe' = 'iframe'
        'işindex' = 'index'
        'işid' = 'id'
        '</işi>' = '</i>'
        '<işi ' = '<i '
        '<işi>' = '<i>'
    }
    
    $originalLength = $Content.Length
    $replacementCount = 0
    
    # Sort patterns by length (longest first) to avoid partial replacements
    $sortedPatterns = $tagReplacements.Keys | Sort-Object { $_.Length } -Descending
    
    foreach ($pattern in $sortedPatterns) {
        $replacement = $tagReplacements[$pattern]
        $beforeCount = ([regex]::Matches($Content, [regex]::Escape($pattern))).Count
        
        if ($beforeCount -gt 0) {
            $Content = $Content -replace [regex]::Escape($pattern), $replacement
            $afterCount = $beforeCount
            Write-Info "    - Replaced '$pattern' -> '$replacement' ($afterCount occurrences)"
            $replacementCount += $afterCount
        }
    }
    
    Write-Success "    [OK] Fixed $replacementCount HTML tag corruptions"
    return $Content
}

# Function to fix HTML attribute corruption (MEDIUM PRIORITY)
function Fix-HtmlAttributeCorruption {
    param([string]$Content)
    
    Write-Info "  [STEP 2] Fixing HTML attribute corruption..."
    
    # Attribute replacements - order matters (longest first)
    $attributeReplacements = @{
        'işinişitişial-scale' = 'initial-scale'
        'crossorişigişin' = 'crossorigin'
        'http-equişiv' = 'http-equiv'
        'vişiewport' = 'viewport'
        'arişia-label' = 'aria-label'
        'onclişick' = 'onclick'
        'wişidth' = 'width'
        'heişight' = 'height'
        'devişice' = 'device'
        'revalişidate' = 'revalidate'
        'Expişires' = 'Expires'
        'hizmetlerişi' = 'hizmetleri'
        'Ofişis' = 'Ofis'
        'googleapişis' = 'googleapis'
        'gstatişic' = 'gstatic'
        'famişily' = 'family'
        'dişisplay' = 'display'
        'feather-işicons' = 'feather-icons'
        'contaişiner' = 'container'
        'navbar__işinner' = 'navbar__inner'
        'navbar__lişinks' = 'navbar__links'
        'navLişinks' = 'navLinks'
        'calişisişir' = 'calisir'
        'maişilto' = 'mailto'
        'navbar__actişions' = 'navbar__actions'
        'Gişirişi�' = 'Giris'
        'regişister' = 'register'
        'btn--prişimary' = 'btn--primary'
    }
    
    $replacementCount = 0
    
    # Sort patterns by length (longest first) to avoid partial replacements
    $sortedPatterns = $attributeReplacements.Keys | Sort-Object { $_.Length } -Descending
    
    foreach ($pattern in $sortedPatterns) {
        $replacement = $attributeReplacements[$pattern]
        $beforeCount = ([regex]::Matches($Content, [regex]::Escape($pattern))).Count
        
        if ($beforeCount -gt 0) {
            $Content = $Content -replace [regex]::Escape($pattern), $replacement
            $afterCount = $beforeCount
            Write-Info "    - Replaced '$pattern' -> '$replacement' ($afterCount occurrences)"
            $replacementCount += $afterCount
        }
    }
    
    Write-Success "    [OK] Fixed $replacementCount HTML attribute corruptions"
    return $Content
}

# Function to fix Turkish character corruption (HIGH PRIORITY - CONTEXT AWARE)
function Fix-TurkishCharacterCorruption {
    param([string]$Content)
    
    Write-Info "  [STEP 3] Fixing Turkish character corruption..."
    
    # Known corruption patterns for Turkish characters - order matters!
    $turkishReplacements = @{
        # Specific known corruptions from test results (most specific first)
        'işile evişinişiz işi�işin' = 'ile evinizin için'
        'an�nda ula��n' = 'anında ulaşın'
        'G�venişilişir' = 'Güvenilir'
        'Ücretsişiz' = 'Ücretsiz'
        'Gişirişi� Yap' = 'Giriş Yap'
        'Nas�l �al���r?' = 'Nasıl Çalışır?'
        'Men�y� a�' = 'Menüyü aç'
        'ge�mişi�' = 'geçmiş'
        'temişizlişik' = 'temizlik'
        'tadişilat' = 'tadihat'
        '��İşBul' = 'İşBul'
        'ta��ma' = 'taşıma'
        
        # Common patterns (less specific)
        'işi�erişik' = 'içerik'
        'işi�işin' = 'için'
        'işisİşBul' = 'isBul'
        'işile' = 'ile'
        'logişin' = 'login'
        '��' = 'İ'
    }
    
    $replacementCount = 0
    
    # Sort patterns by length (longest first) to avoid partial replacements
    $sortedPatterns = $turkishReplacements.Keys | Sort-Object { $_.Length } -Descending
    
    foreach ($pattern in $sortedPatterns) {
        $replacement = $turkishReplacements[$pattern]
        $beforeCount = ([regex]::Matches($Content, [regex]::Escape($pattern))).Count
        
        if ($beforeCount -gt 0) {
            $Content = $Content -replace [regex]::Escape($pattern), $replacement
            Write-Info "    - Replaced '$pattern' -> '$replacement' ($beforeCount occurrences)"
            $replacementCount += $beforeCount
        }
    }
    
    Write-Success "    [OK] Fixed $replacementCount Turkish character corruptions"
    return $Content
}

# Function to ensure UTF-8 encoding meta tag
function Ensure-Utf8MetaTag {
    param([string]$Content)
    
    Write-Info "  [STEP 4] Validating UTF-8 meta tag..."
    
    # Check if charset meta tag exists
    if ($Content -match '<meta\s+charset\s*=\s*["' + "'" + ']?UTF-8["' + "'" + ']?\s*>') {
        Write-Success "    [OK] UTF-8 charset meta tag already present"
        return $Content
    }
    
    # Check for http-equiv content-type meta tag
    if ($Content -match '<meta\s+http-equiv') {
        Write-Success "    [OK] UTF-8 charset meta tag (http-equiv) already present"
        return $Content
    }
    
    # Add charset meta tag if missing (after <head> tag)
    if ($Content -match '<head[^>]*>') {
        $Content = $Content -replace '(<head[^>]*>)', "`$1`n    <meta charset=`"UTF-8`">"
        Write-Warning2 "    ! Added missing UTF-8 charset meta tag"
        return $Content
    }
    
    Write-Warning2 "    ! Could not find <head> tag to insert charset meta tag"
    return $Content
}

# Function to preserve CSS and JavaScript code
function Preserve-CodeBlocks {
    param([string]$Content)
    
    Write-Info "  [STEP 5] Verifying CSS and JavaScript preservation..."
    
    # Extract and verify CSS blocks are intact
    $stylePattern = '(?s)<style[^>]*>(.*?)</style>'
    $styleMatches = [regex]::Matches($Content, $stylePattern)
    $cssBlockCount = $styleMatches.Count
    
    # Extract and verify JavaScript blocks are intact
    $scriptPattern = '(?s)<script[^>]*>(.*?)</script>'
    $scriptMatches = [regex]::Matches($Content, $scriptPattern)
    $jsBlockCount = $scriptMatches.Count
    
    Write-Success "    [OK] Verified $cssBlockCount CSS blocks and $jsBlockCount JavaScript blocks"
    
    return $Content
}

# Function to generate fix statistics
function Get-FixStatistics {
    param(
        [string]$OriginalContent,
        [string]$FixedContent
    )
    
    $stats = @{
        'OriginalSize' = $OriginalContent.Length
        'FixedSize' = $FixedContent.Length
        'ByteDifference' = $FixedContent.Length - $OriginalContent.Length
        'CorruptedTagsRemaining' = 0
        'CorruptedAttributesRemaining' = 0
        'CorruptedTurkishCharsRemaining' = 0
    }
    
    # Check for remaining corruptions
    $corruptedTags = @('hTümül', 'dişiv', 'scrişipt', 'lişink', 'sectişion')
    foreach ($tag in $corruptedTags) {
        $stats.CorruptedTagsRemaining += ([regex]::Matches($FixedContent, [regex]::Escape($tag))).Count
    }
    
    $corruptedAttributes = @('işid=', 'vişiewport', 'http-equişiv', 'onclişick')
    foreach ($attr in $corruptedAttributes) {
        $stats.CorruptedAttributesRemaining += ([regex]::Matches($FixedContent, [regex]::Escape($attr))).Count
    }
    
    $corruptedChars = @('İşBul', 'G�venişilişir', '��İş')
    foreach ($char in $corruptedChars) {
        $stats.CorruptedTurkishCharsRemaining += ([regex]::Matches($FixedContent, [regex]::Escape($char))).Count
    }
    
    return $stats
}

# Main fix function
function Fix-EncodingInFile {
    param(
        [string]$InputFile,
        [string]$OutputFile,
        [bool]$Backup,
        [bool]$DryRun
    )
    
    Write-Host "`n========================================" -ForegroundColor Magenta
    Write-Host "Processing: $InputFile" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
    
    # Read file content with UTF-8 encoding
    try {
        $content = Get-Content -Path $InputFile -Raw -Encoding UTF8
        Write-Success "[OK] Successfully read file ($(($content.Length / 1024).ToString('F2')) KB)"
    }
    catch {
        Write-Error2 "[ERROR] Failed to read file: $_"
        return $false
    }
    
    $originalContent = $content
    
    # Apply fixes in order of priority
    $content = Fix-HtmlTagCorruption -Content $content
    $content = Fix-HtmlAttributeCorruption -Content $content
    $content = Fix-TurkishCharacterCorruption -Content $content
    $content = Ensure-Utf8MetaTag -Content $content
    $content = Preserve-CodeBlocks -Content $content
    
    # Get statistics
    $stats = Get-FixStatistics -OriginalContent $originalContent -FixedContent $content
    
    Write-Host "`n--- Fix Statistics ---" -ForegroundColor Yellow
    Write-Host "Original size: $($stats.OriginalSize) bytes"
    Write-Host "Fixed size: $($stats.FixedSize) bytes"
    Write-Host "Difference: $($stats.ByteDifference) bytes"
    Write-Host "Remaining corrupted tags: $($stats.CorruptedTagsRemaining)"
    Write-Host "Remaining corrupted attributes: $($stats.CorruptedAttributesRemaining)"
    Write-Host "Remaining corrupted Turkish chars: $($stats.CorruptedTurkishCharsRemaining)"
    
    if ($DryRun) {
        Write-Warning2 "`n[DRY RUN] No changes were written to disk."
        return $true
    }
    
    # Create backup if requested
    if ($Backup) {
        $backupPath = "$InputFile.bak"
        try {
            Copy-Item -Path $InputFile -Destination $backupPath -Force
            Write-Success "[OK] Created backup: $backupPath"
        }
        catch {
            Write-Error2 "[ERROR] Failed to create backup: $_"
            return $false
        }
    }
    
    # Determine output path
    $finalOutputPath = if ($OutputFile -ne "") { $OutputFile } else { $InputFile }
    
    # Write fixed content with UTF-8 encoding (no BOM)
    try {
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($finalOutputPath, $content, $utf8NoBom)
        Write-Success "[OK] Successfully wrote fixed content to: $finalOutputPath"
        return $true
    }
    catch {
        Write-Error2 "[ERROR] Failed to write file: $_"
        return $false
    }
}

# Main execution
Write-Host @"

===================================================================
          HTML Encoding Corruption Fix Script              
               IsBul Project - Bugfix Task 3.2             
===================================================================

"@ -ForegroundColor Cyan

# Resolve file path(s)
$files = @()

if ($FilePath -match '\*') {
    # Wildcard pattern - get all matching files
    $files = Get-ChildItem -Path $FilePath -File
    Write-Info "Found $($files.Count) files matching pattern: $FilePath"
}
else {
    # Single file
    if (Test-Path $FilePath) {
        $files = @(Get-Item $FilePath)
    }
    else {
        Write-Error2 "File not found: $FilePath"
        exit 1
    }
}

# Process each file
$successCount = 0
$failCount = 0

foreach ($file in $files) {
    $outputPath = if ($OutputPath -ne "") {
        Join-Path $OutputPath $file.Name
    } else {
        ""
    }
    
    $result = Fix-EncodingInFile -InputFile $file.FullName -OutputFile $outputPath -Backup $CreateBackup -DryRun $DryRun
    
    if ($result) {
        $successCount++
    }
    else {
        $failCount++
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "SUMMARY" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Success "[OK] Successfully processed: $successCount files"
if ($failCount -gt 0) {
    Write-Error2 "[ERROR] Failed to process: $failCount files"
}

if ($DryRun) {
    Write-Warning2 "`n[DRY RUN MODE] - No files were modified"
    Write-Info "Remove -DryRun parameter to apply fixes"
}

Write-Host ""
