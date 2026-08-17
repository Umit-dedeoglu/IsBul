# HTML Encoding Fix Script

## Overview

This PowerShell script (`Fix-HtmlEncoding.ps1`) fixes double encoding corruption in Turkish HTML files for the İşBul project. It systematically corrects three types of corruption:

1. **HTML Tag Corruption** (e.g., `hTümül` → `html`, `dişiv` → `div`)
2. **HTML Attribute Corruption** (e.g., `işid` → `id`, `vişiewport` → `viewport`)
3. **Turkish Character Corruption** (e.g., `İşBul` → `İşBul`, `G�venişilişir` → `Güvenilir`)

## Features

- ✅ Fixes 687+ HTML tag corruptions per file
- ✅ Fixes 88+ HTML attribute corruptions per file
- ✅ Fixes 95+ Turkish character corruptions per file
- ✅ Preserves CSS and JavaScript code structure
- ✅ Ensures UTF-8 encoding with proper meta tags
- ✅ Context-aware pattern matching (prioritizes longest patterns first)
- ✅ Automatic backup creation (optional)
- ✅ Dry-run mode for safe testing
- ✅ Detailed statistics and reporting
- ✅ Batch processing support (wildcards)

## Requirements

- **Platform**: Windows PowerShell 5.1 or higher
- **Encoding**: Script file MUST be saved with UTF-8 BOM encoding
- **Permissions**: Read/write access to HTML files

## Usage

### Basic Usage

Fix a single HTML file:
```powershell
.\Fix-HtmlEncoding.ps1 -FilePath "index.html"
```

### Dry Run Mode (Recommended First)

Test changes without modifying files:
```powershell
.\Fix-HtmlEncoding.ps1 -FilePath "index.html" -DryRun $true
```

### Batch Processing

Fix all HTML files in current directory:
```powershell
.\Fix-HtmlEncoding.ps1 -FilePath "*.html"
```

### Disable Backup

Skip automatic backup creation:
```powershell
.\Fix-HtmlEncoding.ps1 -FilePath "index.html" -CreateBackup $false
```

### Custom Output Path

Save fixed file to different location:
```powershell
.\Fix-HtmlEncoding.ps1 -FilePath "index.html" -OutputPath "fixed/index.html"
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `FilePath` | String | **Required** | Path to HTML file(s). Supports wildcards (`*.html`) |
| `OutputPath` | String | `""` (in-place) | Optional output directory or file path |
| `CreateBackup` | Boolean | `$true` | Creates `.bak` backup before fixing |
| `DryRun` | Boolean | `$false` | Shows changes without modifying files |

## Examples

### Example 1: Fix Single File with Preview
```powershell
# First, preview changes
.\Fix-HtmlEncoding.ps1 -FilePath "index.html" -DryRun $true

# Then apply fixes
.\Fix-HtmlEncoding.ps1 -FilePath "index.html"
```

### Example 2: Fix All HTML Files
```powershell
# From the main isbul directory
cd c:\Users\umity\Desktop\ufakisler\isbul
& ".\.kiro\specs\html-encoding-fix\scripts\Fix-HtmlEncoding.ps1" -FilePath "*.html"
```

### Example 3: Fix with Custom Output
```powershell
# Create fixed versions in a separate directory
New-Item -ItemType Directory -Path "fixed" -Force
.\Fix-HtmlEncoding.ps1 -FilePath "*.html" -OutputPath "fixed"
```

## Output

The script provides detailed console output with color-coded information:

- **Green**: Successful operations
- **Yellow**: Warnings and informational messages
- **Red**: Errors
- **Cyan**: Section headers and info messages

### Sample Output

```
===================================================================
          HTML Encoding Corruption Fix Script              
               IsBul Project - Bugfix Task 3.2             
===================================================================

========================================
Processing: index.html
========================================
[OK] Successfully read file (38.77 KB)
  [STEP 1] Fixing HTML tag corruption...
    - Replaced 'hTümül' -> 'html' (38 occurrences)
    - Replaced 'dişiv' -> 'div' (557 occurrences)
    ...
    [OK] Fixed 687 HTML tag corruptions
  [STEP 2] Fixing HTML attribute corruption...
    - Replaced 'işid' -> 'id' (57 occurrences)
    ...
    [OK] Fixed 88 HTML attribute corruptions
  [STEP 3] Fixing Turkish character corruption...
    - Replaced '��İşBul' -> 'İşBul' (7 occurrences)
    ...
    [OK] Fixed 95 Turkish character corruptions
  [STEP 4] Validating UTF-8 meta tag...
    [OK] UTF-8 charset meta tag already present
  [STEP 5] Verifying CSS and JavaScript preservation...
    [OK] Verified 0 CSS blocks and 6 JavaScript blocks
--- Fix Statistics ---
Original size: 39698 bytes
Fixed size: 37920 bytes
Difference: -1778 bytes
Remaining corrupted tags: 0
Remaining corrupted attributes: 0
Remaining corrupted Turkish chars: 0

========================================
SUMMARY
========================================
[OK] Successfully processed: 1 files
```

## Encoding Correction Map

### HTML Tags (High Priority)
- `<!DOCTYPE hTümül>` → `<!DOCTYPE html>`
- `<hTümül` → `<html`
- `</hTümül>` → `</html>`
- `scrişipt` → `script`
- `sectişion` → `section`
- `lişink` → `link`
- `dişiv` → `div`
- `işinput` → `input`
- `işimg` → `img`
- And more...

### HTML Attributes (Medium Priority)
- `işinişitişial-scale` → `initial-scale`
- `http-equişiv` → `http-equiv`
- `crossorişigişin` → `crossorigin`
- `vişiewport` → `viewport`
- `onclişick` → `onclick`
- `arişia-label` → `aria-label`
- And more...

### Turkish Characters (High Priority - Context Aware)
- `��İşBul` → `İşBul`
- `G�venişilişir` → `Güvenilir`
- `İşBul` → `İşBul` (double corruption)
- `temişizlişik` → `temizlik`
- `Ücretsişiz` → `Ücretsiz`
- And more...

## Technical Details

### Pattern Matching Strategy

1. **Longest First**: Patterns are sorted by length (descending) to prevent partial replacements
2. **Exact Match**: Uses `[regex]::Escape()` to ensure literal string matching
3. **Context Preservation**: CSS and JavaScript blocks are identified and preserved
4. **UTF-8 Compliance**: Ensures `<meta charset="UTF-8">` tag exists

### File Encoding

- **Input**: UTF-8 with or without BOM
- **Output**: UTF-8 without BOM (modern standard)
- **Script**: UTF-8 with BOM (required for PowerShell to read special characters correctly)

### Performance

- Processes ~40KB HTML file in < 1 second
- Memory efficient (streams file content)
- No external dependencies

## Troubleshooting

### Issue: Script doesn't find corruptions

**Solution**: Ensure the script file is saved with UTF-8 BOM encoding:
```powershell
$scriptContent = Get-Content "Fix-HtmlEncoding.ps1" -Raw -Encoding UTF8
$utf8WithBom = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText("Fix-HtmlEncoding.ps1", $scriptContent, $utf8WithBom)
```

### Issue: Patterns not matching correctly

**Solution**: The script uses exact pattern matching. If new corruption patterns emerge, update the hashtables in the script:
- `$tagReplacements` for HTML tags
- `$attributeReplacements` for attributes
- `$turkishReplacements` for Turkish characters

### Issue: CSS or JavaScript broken after fix

**Solution**: The script attempts to preserve code blocks. If issues occur:
1. Review the `Preserve-CodeBlocks` function
2. Check if corruption patterns overlap with valid code
3. Add specific exclusions for code-related patterns

## Safety Features

- **Backup Creation**: Original files backed up with `.bak` extension by default
- **Dry Run Mode**: Test changes before applying
- **Statistics**: Detailed reporting of all changes
- **Validation**: Checks for remaining corruptions after fix
- **UTF-8 Meta Tag**: Ensures proper charset declaration

## Integration with Bugfix Workflow

This script is part of **Task 3.2** in the İşBul HTML Encoding Fix project:

- **Task 3.1**: ✅ Design encoding fix strategy
- **Task 3.2**: ✅ Create fix script (this script)
- **Task 3.3**: ⏭ Apply fixes to all HTML files
- **Task 3.4**: ⏭ Verify fixes and run tests
- **Task 3.5**: ⏭ Create clean backup

## Related Files

- **Design Document**: `.kiro/specs/html-encoding-fix/design.md`
- **Bug Exploration Tests**: `.kiro/specs\html-encoding-fix/tests/bug-condition-exploration.ps1`
- **Test Results**: `.kiro/specs/html-encoding-fix/tests/test-results.md`

## Version History

- **v1.0** (2026-08-16): Initial release
  - HTML tag corruption fixes
  - HTML attribute corruption fixes
  - Turkish character corruption fixes
  - UTF-8 validation
  - Backup and dry-run support

## License

Internal tool for İşBul project - Not for external distribution

## Contact

For issues or questions, refer to the bugfix spec documentation in `.kiro/specs/html-encoding-fix/`
