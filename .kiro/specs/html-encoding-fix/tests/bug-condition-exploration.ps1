# Bug Condition Exploration Test - HTML Encoding Corruption
# This test runs on BUGGY CODE and will FAIL
# Failure proves the bug exists (counterexample)
# 
# **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

param(
    [string]$ProjectRoot = "c:\Users\umity\Desktop\ufakisler\isbul"
)

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Bug Condition Exploration Test" -ForegroundColor Cyan
Write-Host "Testing UNCORRECTED (BUGGY) HTML files" -ForegroundColor Yellow
Write-Host "Expected: Test WILL FAIL (proves bug exists)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Counters
$totalTests = 0
$passedTests = 0
$failedTests = 0
$counterExamples = @()

# Helper function to check for corruptions using ASCII-safe patterns
function Test-HasCorruption {
    param([string]$content)
    
    $found = @{
        CorruptedTags = @()
        CorruptedAttrs = @()
        CorruptedTurkish = @()
    }
    
    # Pattern 1: DOCTYPE corruption (should be "<!DOCTYPE html>" not "<!DOCTYPE hT...l>")
    if ($content -match "<!DOCTYPE hT.*?l>") {
        $found.CorruptedTags += "DOCTYPE corrupted"
    }
    
    # Pattern 2: Opening html tag corruption (should be "<html" not "<hT...l")
    if ($content -match "<hT.*?l\s+lang=") {
        $found.CorruptedTags += "html tag corrupted"
    }
    
    # Pattern 3: div tag corruption (look for "dişiv" or similar patterns)
    if ($content -match "<d.{2,4}iv\s+class=") {
        $found.CorruptedTags += "div tag corrupted"
    }
    
    # Pattern 4: script tag corruption
    if ($content -match "<scr.{2,6}pt\s+") {
        $found.CorruptedTags += "script tag corrupted"
    }
    
    # Pattern 5: link tag corruption
    if ($content -match "<l.{2,4}nk\s+rel=") {
        $found.CorruptedTags += "link tag corrupted"
    }
    
    # Pattern 6: id attribute corruption
    if ($content -match ".{1,3}id=") {
        $found.CorruptedAttrs += "id attribute corrupted"
    }
    
    # Pattern 7: onclick corruption
    if ($content -match "oncl.{2,4}ck=") {
        $found.CorruptedAttrs += "onclick attribute corrupted"
    }
    
    # Pattern 8: viewport corruption
    if ($content -match "v.{2,4}ewport") {
        $found.CorruptedAttrs += "viewport corrupted"
    }
    
    # Pattern 9: Turkish char corruption - look for placeholder chars
    if ($content -match "[^\x00-\x7F]{2,}Bul") {
        $found.CorruptedTurkish += "Turkish chars in brand name corrupted"
    }
    
    # Pattern 10: Look for obviously broken encoding (multiple special chars in a row)
    if ($content -match "[^\x00-\x7F]{3,}") {
        $found.CorruptedTurkish += "Multiple non-ASCII chars (possible corruption)"
    }
    
    return $found
}

Write-Host ""
Write-Host "[Test 1] HTML Tag Corruption Detection - Main Folder" -ForegroundColor Magenta
Write-Host "Testing: index.html for corrupted HTML tags" -ForegroundColor Gray

$totalTests++
$mainIndexPath = Join-Path $ProjectRoot "index.html"

if (Test-Path $mainIndexPath) {
    $content = [System.IO.File]::ReadAllText($mainIndexPath, [System.Text.Encoding]::UTF8)
    $result = Test-HasCorruption -content $content
    
    $foundTags = $result.CorruptedTags.Count
    $foundAttrs = $result.CorruptedAttrs.Count
    
    Write-Host "  Found corrupted HTML tags: $foundTags" -ForegroundColor $(if ($foundTags -gt 0) { "Yellow" } else { "Green" })
    if ($foundTags -gt 0) {
        $result.CorruptedTags | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
    }
    
    Write-Host "  Found corrupted attributes: $foundAttrs" -ForegroundColor $(if ($foundAttrs -gt 0) { "Yellow" } else { "Green" })
    if ($foundAttrs -gt 0) {
        $result.CorruptedAttrs | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
    }
    
    # Expected: Should find corruption
    if ($foundTags -gt 0 -and $foundAttrs -gt 0) {
        Write-Host "  RESULT: DETECTED CORRUPTION [EXPECTED]" -ForegroundColor Yellow
        Write-Host "  This confirms the bug exists" -ForegroundColor Yellow
        $failedTests++
        $counterExamples += @{
            File = "index.html"
            Type = "HTML Tag Corruption"
            Evidence = "Tags: $($result.CorruptedTags -join ', '); Attrs: $($result.CorruptedAttrs -join ', ')"
        }
    } else {
        Write-Host "  RESULT: NO CORRUPTION FOUND [UNEXPECTED]" -ForegroundColor Red
        $passedTests++
    }
} else {
    Write-Host "  ERROR: File not found: $mainIndexPath" -ForegroundColor Red
    $failedTests++
}

Write-Host ""
Write-Host "[Test 2] Turkish Character Corruption Detection - Main Folder" -ForegroundColor Magenta
Write-Host "Testing: profil.html for corrupted Turkish characters" -ForegroundColor Gray

$totalTests++
$mainProfilPath = Join-Path $ProjectRoot "profil.html"

if (Test-Path $mainProfilPath) {
    $content = [System.IO.File]::ReadAllText($mainProfilPath, [System.Text.Encoding]::UTF8)
    $result = Test-HasCorruption -content $content
    
    $foundTurkish = $result.CorruptedTurkish.Count
    
    Write-Host "  Found corrupted Turkish patterns: $foundTurkish" -ForegroundColor $(if ($foundTurkish -gt 0) { "Yellow" } else { "Green" })
    if ($foundTurkish -gt 0) {
        $result.CorruptedTurkish | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
    }
    
    # Expected: Should find corruption
    if ($foundTurkish -gt 0) {
        Write-Host "  RESULT: DETECTED CORRUPTION [EXPECTED]" -ForegroundColor Yellow
        Write-Host "  This confirms the bug exists" -ForegroundColor Yellow
        $failedTests++
        $counterExamples += @{
            File = "profil.html"
            Type = "Turkish Character Corruption"
            Evidence = "Patterns: $($result.CorruptedTurkish -join ', ')"
        }
    } else {
        Write-Host "  RESULT: NO CORRUPTION FOUND [UNEXPECTED]" -ForegroundColor Red
        $passedTests++
    }
} else {
    Write-Host "  ERROR: File not found: $mainProfilPath" -ForegroundColor Red
    $failedTests++
}

Write-Host ""
Write-Host "[Test 3] Backup Folder Corruption Level Check" -ForegroundColor Magenta
Write-Host "Testing: backup/index.html - HTML tags clean, Turkish chars corrupted" -ForegroundColor Gray

$totalTests++
$backupIndexPath = Join-Path $ProjectRoot "backup_html_20260816_141559\index.html"

if (Test-Path $backupIndexPath) {
    $content = [System.IO.File]::ReadAllText($backupIndexPath, [System.Text.Encoding]::UTF8)
    $result = Test-HasCorruption -content $content
    
    $foundTags = $result.CorruptedTags.Count
    $foundTurkish = $result.CorruptedTurkish.Count
    
    Write-Host "  Found corrupted HTML tags: $foundTags (should be 0)" -ForegroundColor $(if ($foundTags -eq 0) { "Green" } else { "Red" })
    Write-Host "  Found corrupted Turkish chars: $foundTurkish (should be >0)" -ForegroundColor $(if ($foundTurkish -gt 0) { "Yellow" } else { "Red" })
    
    if ($foundTurkish -gt 0) {
        $result.CorruptedTurkish | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
    }
    
    # Expected: HTML tags clean, Turkish chars corrupted
    if ($foundTags -eq 0 -and $foundTurkish -gt 0) {
        Write-Host "  RESULT: DETECTED DIFFERENT CORRUPTION LEVEL [EXPECTED]" -ForegroundColor Yellow
        Write-Host "  Backup has clean HTML tags but corrupted Turkish chars" -ForegroundColor Yellow
        $failedTests++
        $counterExamples += @{
            File = "backup/index.html"
            Type = "Partial Corruption (Turkish chars only)"
            Evidence = "HTML tags clean, Turkish patterns: $($result.CorruptedTurkish -join ', ')"
        }
    } else {
        Write-Host "  RESULT: UNEXPECTED CORRUPTION PATTERN [UNEXPECTED]" -ForegroundColor Red
        $passedTests++
    }
} else {
    Write-Host "  ERROR: File not found: $backupIndexPath" -ForegroundColor Red
    $failedTests++
}

Write-Host ""
Write-Host "[Test 4] Bulk Corruption Detection - All Main Folder HTML Files" -ForegroundColor Magenta
Write-Host "Testing: All HTML files in main folder for any corruption" -ForegroundColor Gray

$totalTests++
$htmlFiles = Get-ChildItem -Path $ProjectRoot -Filter "*.html"
$corruptedFiles = @()
$cleanFiles = @()

foreach ($file in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $result = Test-HasCorruption -content $content
    
    $hasCorruption = ($result.CorruptedTags.Count -gt 0) -or ($result.CorruptedAttrs.Count -gt 0) -or ($result.CorruptedTurkish.Count -gt 0)
    
    if ($hasCorruption) {
        $corruptedFiles += $file.Name
    } else {
        $cleanFiles += $file.Name
    }
}

Write-Host "  Total HTML files scanned: $($htmlFiles.Count)" -ForegroundColor Gray
Write-Host "  Files with corruption: $($corruptedFiles.Count)" -ForegroundColor $(if ($corruptedFiles.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "  Files without corruption: $($cleanFiles.Count)" -ForegroundColor $(if ($cleanFiles.Count -eq 0) { "Green" } else { "Red" })

if ($corruptedFiles.Count -gt 5) {
    Write-Host ""
    Write-Host "  First 5 corrupted files:" -ForegroundColor Yellow
    $corruptedFiles[0..4] | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
    Write-Host "    ... and $($corruptedFiles.Count - 5) more" -ForegroundColor Yellow
} elseif ($corruptedFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "  Corrupted files:" -ForegroundColor Yellow
    $corruptedFiles | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
}

if ($cleanFiles.Count -gt 0 -and $cleanFiles.Count -le 5) {
    Write-Host ""
    Write-Host "  Clean files (unexpected):" -ForegroundColor Red
    $cleanFiles | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
}

# Expected: All files should have corruption
if ($corruptedFiles.Count -eq $htmlFiles.Count) {
    Write-Host ""
    Write-Host "  RESULT: ALL FILES CORRUPTED [EXPECTED]" -ForegroundColor Yellow
    Write-Host "  This confirms widespread bug condition" -ForegroundColor Yellow
    $failedTests++
    $counterExamples += @{
        File = "All main folder HTML files"
        Type = "Widespread corruption"
        Evidence = "$($corruptedFiles.Count)/$($htmlFiles.Count) files affected"
    }
} else {
    Write-Host ""
    Write-Host "  RESULT: NOT ALL FILES CORRUPTED [UNEXPECTED]" -ForegroundColor Red
    $passedTests++
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Bug Condition Exploration Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Corruption Detected: $failedTests (expected result)" -ForegroundColor Yellow
Write-Host "No Corruption Found: $passedTests (unexpected result)" -ForegroundColor $(if ($passedTests -gt 0) { "Red" } else { "Green" })

if ($counterExamples.Count -gt 0) {
    Write-Host ""
    Write-Host "COUNTEREXAMPLES FOUND (Proof of Bug):" -ForegroundColor Yellow
    Write-Host "======================================" -ForegroundColor Yellow
    foreach ($example in $counterExamples) {
        Write-Host ""
        Write-Host "  File: $($example.File)" -ForegroundColor White
        Write-Host "  Type: $($example.Type)" -ForegroundColor Yellow
        Write-Host "  Evidence: $($example.Evidence)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "FINAL RESULT: " -NoNewline
if ($failedTests -gt 0) {
    Write-Host "BUG CONDITION CONFIRMED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "The test FAILED as expected - this PROVES the bug exists!" -ForegroundColor Yellow
    Write-Host "Found $($counterExamples.Count) counterexample(s) demonstrating the encoding corruption." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Root Cause Analysis:" -ForegroundColor Cyan
    Write-Host "  - Main folder: Double encoding corruption (HTML tags + Turkish chars)" -ForegroundColor Gray
    Write-Host "  - Backup folder: Single encoding corruption (Turkish chars only)" -ForegroundColor Gray
    Write-Host "  - Likely cause: Multiple incorrect encoding conversions" -ForegroundColor Gray
} else {
    Write-Host "NO BUG DETECTED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Unexpected result: No corruption found in files!" -ForegroundColor Red
    Write-Host "This suggests either:" -ForegroundColor Gray
    Write-Host "  - The bug has already been fixed" -ForegroundColor Gray
    Write-Host "  - The root cause hypothesis is incorrect" -ForegroundColor Gray
    Write-Host "  - Test patterns need adjustment" -ForegroundColor Gray
}
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

# Exit code: Non-zero if bug detected (test failed as expected)
exit $failedTests
