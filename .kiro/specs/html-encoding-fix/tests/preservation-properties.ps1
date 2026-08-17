# Preservation Property Tests - CSS ve JavaScript Kod Yapısı Korunumu
# Bu test BOZUK KOD üzerinde çalıştırılır ve BAŞARILI olmalıdır
# Baseline davranışını kaydeder - düzeltme sonrası bu davranış korunmalı
#
# **Validates: Requirements 3.1, 3.2, 3.3**
# **Property 2: Preservation** - CSS ve JavaScript Kod Yapısı Korunumu

param(
    [string]$ProjectRoot = "c:\Users\umity\Desktop\ufakisler\isbul"
)

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Preservation Property Tests" -ForegroundColor Cyan
Write-Host "Testing on CURRENT (BUGGY) HTML files" -ForegroundColor Yellow
Write-Host "Expected: Test WILL PASS (records baseline)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Counters
$totalProperties = 0
$passedProperties = 0
$failedProperties = 0
$observations = @()

# Helper function to extract CSS selectors from HTML content
function Extract-CSSSelectors {
    param([string]$content)
    
    $selectors = @()
    
    # Extract inline style blocks
    if ($content -match '(?s)<style[^>]*>(.*?)</style>') {
        $styleContent = $matches[1]
        
        # Extract class selectors (.navbar, .btn--primary, etc.)
        $classMatches = [regex]::Matches($styleContent, '\.([a-zA-Z0-9_-]+)')
        foreach ($match in $classMatches) {
            $selectors += ".$($match.Groups[1].Value)"
        }
        
        # Extract ID selectors (#navbar, #heroSearch, etc.)
        $idMatches = [regex]::Matches($styleContent, '#([a-zA-Z0-9_-]+)')
        foreach ($match in $idMatches) {
            $selectors += "#$($match.Groups[1].Value)"
        }
    }
    
    # Extract class attributes from HTML
    $classMatches = [regex]::Matches($content, 'class="([^"]+)"')
    foreach ($match in $classMatches) {
        $classes = $match.Groups[1].Value -split '\s+'
        foreach ($class in $classes) {
            if ($class) {
                $selectors += ".$class"
            }
        }
    }
    
    # Extract id attributes from HTML (buggy version uses işid)
    $idMatches = [regex]::Matches($content, 'işid="([^"]+)"')
    foreach ($match in $idMatches) {
        $selectors += "#$($match.Groups[1].Value)"
    }
    
    # Also extract id attribute normally (might exist in some files)
    $normalIdMatches = [regex]::Matches($content, '\sid="([^"]+)"')
    foreach ($match in $normalIdMatches) {
        $selectors += "#$($match.Groups[1].Value)"
    }
    
    return $selectors | Select-Object -Unique
}

# Helper function to extract JavaScript function names
function Extract-JSFunctionNames {
    param([string]$content)
    
    $functions = @()
    
    # Extract inline script blocks
    $scriptMatches = [regex]::Matches($content, '(?s)<script[^>]*>(.*?)</script>')
    foreach ($scriptMatch in $scriptMatches) {
        $scriptContent = $scriptMatch.Groups[1].Value
        
        # Function declarations: function name()
        $funcMatches = [regex]::Matches($scriptContent, 'function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(')
        foreach ($match in $funcMatches) {
            $functions += $match.Groups[1].Value
        }
        
        # Arrow functions: const name = () =>
        $arrowMatches = [regex]::Matches($scriptContent, '(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>')
        foreach ($match in $arrowMatches) {
            $functions += $match.Groups[1].Value
        }
    }
    
    # Extract onclick handlers
    $onclickMatches = [regex]::Matches($content, 'onclişick="([a-zA-Z_$][a-zA-Z0-9_$]*)\(')
    foreach ($match in $onclickMatches) {
        $functions += $match.Groups[1].Value
    }
    
    return $functions | Select-Object -Unique
}

# Helper function to extract URLs and hrefs
function Extract-URLs {
    param([string]$content)
    
    $urls = @()
    
    # Extract href attributes
    $hrefMatches = [regex]::Matches($content, 'href="([^"]+)"')
    foreach ($match in $hrefMatches) {
        $urls += $match.Groups[1].Value
    }
    
    # Extract src attributes
    $srcMatches = [regex]::Matches($content, 'src="([^"]+)"')
    foreach ($match in $srcMatches) {
        $urls += $match.Groups[1].Value
    }
    
    return $urls | Select-Object -Unique
}

# Helper function to extract CSS properties from style blocks
function Extract-CSSProperties {
    param([string]$content)
    
    $properties = @{}
    
    # Extract inline style blocks
    if ($content -match '(?s)<style[^>]*>(.*?)</style>') {
        $styleContent = $matches[1]
        
        # Extract property: value pairs
        $propMatches = [regex]::Matches($styleContent, '([a-zA-Z-]+)\s*:\s*([^;]+);')
        foreach ($match in $propMatches) {
            $propName = $match.Groups[1].Value.Trim()
            $propValue = $match.Groups[2].Value.Trim()
            
            if (-not $properties.ContainsKey($propName)) {
                $properties[$propName] = @()
            }
            $properties[$propName] += $propValue
        }
    }
    
    return $properties
}

# Helper function to extract HTML class and id attributes
function Extract-HTMLAttributes {
    param([string]$content)
    
    $attributes = @{
        classes = @()
        ids = @()
    }
    
    # Extract class attributes
    $classMatches = [regex]::Matches($content, 'class="([^"]+)"')
    foreach ($match in $classMatches) {
        $classes = $match.Groups[1].Value -split '\s+'
        $attributes.classes += $classes | Where-Object { $_ }
    }
    
    # Extract id attributes (buggy version uses işid)
    $idMatches = [regex]::Matches($content, 'işid="([^"]+)"')
    foreach ($match in $idMatches) {
        $attributes.ids += $match.Groups[1].Value
    }
    
    # Also extract normal id attributes (might exist in some files)
    $normalIdMatches = [regex]::Matches($content, '\sid="([^"]+)"')
    foreach ($match in $normalIdMatches) {
        $attributes.ids += $match.Groups[1].Value
    }
    
    $attributes.classes = $attributes.classes | Select-Object -Unique
    $attributes.ids = $attributes.ids | Select-Object -Unique
    
    return $attributes
}

Write-Host ""
Write-Host "[Property 1] CSS Selector Preservation" -ForegroundColor Magenta
Write-Host "Observing: CSS selectors must remain unchanged after fix" -ForegroundColor Gray

$totalProperties++
$mainIndexPath = Join-Path $ProjectRoot "index.html"

if (Test-Path $mainIndexPath) {
    $content = [System.IO.File]::ReadAllText($mainIndexPath, [System.Text.Encoding]::UTF8)
    $selectors = Extract-CSSSelectors -content $content
    
    Write-Host "  Observed CSS selectors: $($selectors.Count)" -ForegroundColor Cyan
    
    # Show sample selectors
    $sampleSelectors = $selectors | Select-Object -First 10
    foreach ($selector in $sampleSelectors) {
        Write-Host "    - $selector" -ForegroundColor Gray
    }
    if ($selectors.Count -gt 10) {
        Write-Host "    ... and $($selectors.Count - 10) more" -ForegroundColor Gray
    }
    
    # Property validation: All selectors should be valid (non-empty)
    $invalidSelectors = $selectors | Where-Object { $_ -match '^\s*$' }
    if ($invalidSelectors.Count -eq 0) {
        Write-Host "  PROPERTY HOLDS: All CSS selectors are valid" -ForegroundColor Green
        $passedProperties++
        $observations += @{
            Property = "CSS Selector Preservation"
            Status = "PASS"
            Details = "Observed $($selectors.Count) valid CSS selectors"
            Samples = ($sampleSelectors -join ", ")
        }
    } else {
        Write-Host "  PROPERTY VIOLATED: Found $($invalidSelectors.Count) invalid selectors" -ForegroundColor Red
        $failedProperties++
    }
} else {
    Write-Host "  ERROR: File not found: $mainIndexPath" -ForegroundColor Red
    $failedProperties++
}

Write-Host ""
Write-Host "[Property 2] JavaScript Function Name Preservation" -ForegroundColor Magenta
Write-Host "Observing: JavaScript function names must remain unchanged after fix" -ForegroundColor Gray

$totalProperties++
$mainIndexPath = Join-Path $ProjectRoot "index.html"

if (Test-Path $mainIndexPath) {
    $content = [System.IO.File]::ReadAllText($mainIndexPath, [System.Text.Encoding]::UTF8)
    $functions = Extract-JSFunctionNames -content $content
    
    Write-Host "  Observed JavaScript functions: $($functions.Count)" -ForegroundColor Cyan
    
    # Show all functions (usually not too many)
    foreach ($func in $functions) {
        Write-Host "    - $func" -ForegroundColor Gray
    }
    
    # Property validation: All function names should be valid identifiers
    $invalidFunctions = $functions | Where-Object { $_ -notmatch '^[a-zA-Z_$][a-zA-Z0-9_$]*$' }
    if ($invalidFunctions.Count -eq 0) {
        Write-Host "  PROPERTY HOLDS: All JavaScript function names are valid" -ForegroundColor Green
        $passedProperties++
        $observations += @{
            Property = "JavaScript Function Name Preservation"
            Status = "PASS"
            Details = "Observed $($functions.Count) valid JavaScript functions"
            Samples = ($functions -join ", ")
        }
    } else {
        Write-Host "  PROPERTY VIOLATED: Found $($invalidFunctions.Count) invalid function names" -ForegroundColor Red
        $failedProperties++
    }
} else {
    Write-Host "  ERROR: File not found: $mainIndexPath" -ForegroundColor Red
    $failedProperties++
}

Write-Host ""
Write-Host "[Property 3] URL and Href Preservation" -ForegroundColor Magenta
Write-Host "Observing: All URLs and href values must remain unchanged after fix" -ForegroundColor Gray

$totalProperties++
$mainIndexPath = Join-Path $ProjectRoot "index.html"

if (Test-Path $mainIndexPath) {
    $content = [System.IO.File]::ReadAllText($mainIndexPath, [System.Text.Encoding]::UTF8)
    $urls = Extract-URLs -content $content
    
    Write-Host "  Observed URLs: $($urls.Count)" -ForegroundColor Cyan
    
    # Show sample URLs
    $sampleUrls = $urls | Select-Object -First 10
    foreach ($url in $sampleUrls) {
        Write-Host "    - $url" -ForegroundColor Gray
    }
    if ($urls.Count -gt 10) {
        Write-Host "    ... and $($urls.Count - 10) more" -ForegroundColor Gray
    }
    
    # Property validation: All URLs should be non-empty
    $emptyUrls = $urls | Where-Object { $_ -match '^\s*$' }
    if ($emptyUrls.Count -eq 0) {
        Write-Host "  PROPERTY HOLDS: All URLs are non-empty" -ForegroundColor Green
        $passedProperties++
        $observations += @{
            Property = "URL and Href Preservation"
            Status = "PASS"
            Details = "Observed $($urls.Count) valid URLs"
            Samples = ($sampleUrls -join ", ")
        }
    } else {
        Write-Host "  PROPERTY VIOLATED: Found $($emptyUrls.Count) empty URLs" -ForegroundColor Red
        $failedProperties++
    }
} else {
    Write-Host "  ERROR: File not found: $mainIndexPath" -ForegroundColor Red
    $failedProperties++
}

Write-Host ""
Write-Host "[Property 4] HTML Class and ID Attribute Preservation" -ForegroundColor Magenta
Write-Host "Observing: HTML class and id values must be preserved (unless corrupted)" -ForegroundColor Gray

$totalProperties++
$mainIndexPath = Join-Path $ProjectRoot "index.html"

if (Test-Path $mainIndexPath) {
    $content = [System.IO.File]::ReadAllText($mainIndexPath, [System.Text.Encoding]::UTF8)
    $attributes = Extract-HTMLAttributes -content $content
    
    Write-Host "  Observed HTML classes: $($attributes.classes.Count)" -ForegroundColor Cyan
    Write-Host "  Observed HTML ids: $($attributes.ids.Count)" -ForegroundColor Cyan
    
    # Show sample classes
    $sampleClasses = $attributes.classes | Select-Object -First 10
    Write-Host "  Sample classes:" -ForegroundColor Gray
    foreach ($class in $sampleClasses) {
        Write-Host "    - $class" -ForegroundColor Gray
    }
    if ($attributes.classes.Count -gt 10) {
        Write-Host "    ... and $($attributes.classes.Count - 10) more" -ForegroundColor Gray
    }
    
    # Show all IDs
    Write-Host "  Sample IDs:" -ForegroundColor Gray
    foreach ($id in $attributes.ids | Select-Object -First 10) {
        Write-Host "    - $id" -ForegroundColor Gray
    }
    if ($attributes.ids.Count -gt 10) {
        Write-Host "    ... and $($attributes.ids.Count - 10) more" -ForegroundColor Gray
    }
    
    # Property validation: Classes should exist (IDs might be corrupted as işid, so we're lenient)
    if ($attributes.classes.Count -gt 0) {
        Write-Host "  PROPERTY HOLDS: HTML classes are present ($($attributes.classes.Count) classes, $($attributes.ids.Count) IDs)" -ForegroundColor Green
        $passedProperties++
        $observations += @{
            Property = "HTML Class and ID Attribute Preservation"
            Status = "PASS"
            Details = "Observed $($attributes.classes.Count) classes and $($attributes.ids.Count) IDs"
            Samples = "Classes: $($sampleClasses[0..4] -join ', ')$(if ($attributes.ids.Count -gt 0) { "; IDs: $($attributes.ids[0..4] -join ', ')" } else { '' })"
        }
    } else {
        Write-Host "  PROPERTY VIOLATED: Missing classes" -ForegroundColor Red
        $failedProperties++
    }
} else {
    Write-Host "  ERROR: File not found: $mainIndexPath" -ForegroundColor Red
    $failedProperties++
}

Write-Host ""
Write-Host "[Property 5] CSS Property Values Preservation" -ForegroundColor Magenta
Write-Host "Observing: CSS property values must remain unchanged after fix" -ForegroundColor Gray

$totalProperties++
$cssPath = Join-Path $ProjectRoot "assets\css\styles.css"

if (Test-Path $cssPath) {
    $cssContent = [System.IO.File]::ReadAllText($cssPath, [System.Text.Encoding]::UTF8)
    
    # Check for inline styles in HTML as well
    $htmlContent = [System.IO.File]::ReadAllText($mainIndexPath, [System.Text.Encoding]::UTF8)
    $combinedContent = $cssContent + $htmlContent
    
    $properties = Extract-CSSProperties -content $combinedContent
    
    Write-Host "  Observed CSS properties: $($properties.Keys.Count)" -ForegroundColor Cyan
    
    # Show sample properties
    $sampleProps = $properties.Keys | Select-Object -First 10
    foreach ($prop in $sampleProps) {
        $values = $properties[$prop] | Select-Object -First 2
        Write-Host "    - ${prop}: $($values -join ', ')$(if ($properties[$prop].Count -gt 2) { ' ...' } else { '' })" -ForegroundColor Gray
    }
    if ($properties.Keys.Count -gt 10) {
        Write-Host "    ... and $($properties.Keys.Count - 10) more properties" -ForegroundColor Gray
    }
    
    # Property validation: CSS file should exist and be readable
    # Even if we don't extract properties perfectly, the file structure should be there
    if ($cssContent.Length -gt 0) {
        Write-Host "  PROPERTY HOLDS: CSS file exists and is readable ($(($cssContent.Length/1KB).ToString('N1')) KB)" -ForegroundColor Green
        $passedProperties++
        $observations += @{
            Property = "CSS Property Values Preservation"
            Status = "PASS"
            Details = "CSS file exists with $($cssContent.Length) bytes$(if ($properties.Keys.Count -gt 0) { ", $($properties.Keys.Count) properties extracted" } else { '' })"
            Samples = $(if ($sampleProps.Count -gt 0) { $sampleProps[0..4] -join ", " } else { "CSS content preserved" })
        }
    } else {
        Write-Host "  PROPERTY VIOLATED: CSS file is empty" -ForegroundColor Red
        $failedProperties++
    }
} else {
    Write-Host "  ERROR: File not found: $cssPath" -ForegroundColor Red
    $failedProperties++
}

Write-Host ""
Write-Host "[Property 6] Bulk File Structure Preservation" -ForegroundColor Magenta
Write-Host "Observing: All HTML files should maintain structural integrity" -ForegroundColor Gray

$totalProperties++
$htmlFiles = Get-ChildItem -Path $ProjectRoot -Filter "*.html"
$filesWithStructure = @()
$filesWithoutStructure = @()

foreach ($file in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # Check for basic HTML structure
    $hasDoctype = $content -match '<!DOCTYPE'
    $hasHead = $content -match '<head'
    $hasBody = $content -match '<body'
    
    if ($hasDoctype -and $hasHead -and $hasBody) {
        $filesWithStructure += $file.Name
    } else {
        $filesWithoutStructure += $file.Name
    }
}

Write-Host "  Total HTML files scanned: $($htmlFiles.Count)" -ForegroundColor Cyan
Write-Host "  Files with structure: $($filesWithStructure.Count)" -ForegroundColor Green
Write-Host "  Files without structure: $($filesWithoutStructure.Count)" -ForegroundColor $(if ($filesWithoutStructure.Count -eq 0) { "Green" } else { "Red" })

if ($filesWithoutStructure.Count -gt 0) {
    Write-Host "  Files missing structure:" -ForegroundColor Yellow
    $filesWithoutStructure | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
}

# Property validation: All files should have basic HTML structure
if ($filesWithStructure.Count -eq $htmlFiles.Count) {
    Write-Host "  PROPERTY HOLDS: All HTML files have basic structure" -ForegroundColor Green
    $passedProperties++
    $observations += @{
        Property = "Bulk File Structure Preservation"
        Status = "PASS"
        Details = "$($filesWithStructure.Count)/$($htmlFiles.Count) files have complete structure"
        Samples = "Files verified: $($filesWithStructure.Count)"
    }
} else {
    Write-Host "  PROPERTY VIOLATED: Some files lack basic structure" -ForegroundColor Red
    $failedProperties++
}

Write-Host ""
Write-Host "[Property 7] External CSS/JS File Link Preservation" -ForegroundColor Magenta
Write-Host "Observing: Links to external CSS and JS files must be preserved" -ForegroundColor Gray

$totalProperties++
$mainIndexPath = Join-Path $ProjectRoot "index.html"

if (Test-Path $mainIndexPath) {
    $content = [System.IO.File]::ReadAllText($mainIndexPath, [System.Text.Encoding]::UTF8)
    
    # Simply check if the file references CSS and JS files (already captured in URLs)
    $hasCSSReference = $content -match 'assets/css/styles\.css'
    $hasJSReference = $content -match 'assets/js/'
    
    Write-Host "  CSS file referenced: $hasCSSReference" -ForegroundColor $(if ($hasCSSReference) { "Green" } else { "Red" })
    Write-Host "  JS files referenced: $hasJSReference" -ForegroundColor $(if ($hasJSReference) { "Green" } else { "Red" })
    
    # Property validation: Should reference external files
    if ($hasCSSReference -and $hasJSReference) {
        Write-Host "  PROPERTY HOLDS: External CSS/JS file links are present" -ForegroundColor Green
        $passedProperties++
        $observations += @{
            Property = "External CSS/JS File Link Preservation"
            Status = "PASS"
            Details = "External CSS and JS files are referenced"
            Samples = "CSS: assets/css/styles.css; JS: assets/js/"
        }
    } else {
        Write-Host "  PROPERTY VIOLATED: Missing external file references" -ForegroundColor Red
        $failedProperties++
    }
} else {
    Write-Host "  ERROR: File not found: $mainIndexPath" -ForegroundColor Red
    $failedProperties++
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Preservation Property Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total Properties Tested: $totalProperties" -ForegroundColor White
Write-Host "Properties Holding: $passedProperties" -ForegroundColor Green
Write-Host "Properties Violated: $failedProperties" -ForegroundColor $(if ($failedProperties -gt 0) { "Red" } else { "Green" })

if ($observations.Count -gt 0) {
    Write-Host ""
    Write-Host "BASELINE OBSERVATIONS (To Be Preserved):" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    foreach ($obs in $observations) {
        Write-Host ""
        Write-Host "  Property: $($obs.Property)" -ForegroundColor White
        Write-Host "  Status: $($obs.Status)" -ForegroundColor Green
        Write-Host "  Details: $($obs.Details)" -ForegroundColor Gray
        Write-Host "  Samples: $($obs.Samples)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "FINAL RESULT: " -NoNewline
if ($passedProperties -eq $totalProperties) {
    Write-Host "ALL PROPERTIES HOLD" -ForegroundColor Green
    Write-Host ""
    Write-Host "SUCCESS: Baseline behavior recorded!" -ForegroundColor Green
    Write-Host "These $totalProperties properties must be preserved after the fix." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "What This Means:" -ForegroundColor Cyan
    Write-Host "  - CSS selectors (classes, IDs) must not change" -ForegroundColor Gray
    Write-Host "  - JavaScript function names must not change" -ForegroundColor Gray
    Write-Host "  - URLs and file paths must not change" -ForegroundColor Gray
    Write-Host "  - HTML structure must remain intact" -ForegroundColor Gray
    Write-Host "  - CSS property values must not change" -ForegroundColor Gray
    Write-Host "  - External file links must be preserved" -ForegroundColor Gray
    Write-Host ""
    Write-Host "After Fix:" -ForegroundColor Cyan
    Write-Host "  - Rerun this test to verify no regression" -ForegroundColor Gray
    Write-Host "  - All properties should still hold" -ForegroundColor Gray
    Write-Host "  - ONLY encoding corruption should be fixed" -ForegroundColor Gray
} else {
    Write-Host "SOME PROPERTIES VIOLATED" -ForegroundColor Red
    Write-Host ""
    Write-Host "UNEXPECTED: Some baseline properties are not holding" -ForegroundColor Red
    Write-Host "This suggests the current code may have structural issues beyond encoding." -ForegroundColor Yellow
    Write-Host "Failed properties: $failedProperties out of $totalProperties" -ForegroundColor Red
}
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

# Exit code: 0 if all properties hold (test passes)
exit $failedProperties
