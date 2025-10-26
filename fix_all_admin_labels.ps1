# Script PowerShell pour corriger tous les labels invisibles dans les pages admin

$adminDir = "src\app\admin"
$pattern = 'className="block text-sm font-semibold mb-2"'
$replacement = 'className="block text-sm font-semibold text-gray-900 mb-2"'

$fixedCount = 0
$fileCount = 0

Get-ChildItem -Path $adminDir -Filter "*.jsx" -Recurse | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw
    
    if ($content -match [regex]::Escape($pattern)) {
        $newContent = $content -replace [regex]::Escape($pattern), $replacement
        Set-Content -Path $file -Value $newContent -NoNewline
        Write-Host "✅ Fixed: $($_.Name)" -ForegroundColor Green
        $fixedCount++
    }
    $fileCount++
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RÉSULTATS:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fichiers scannés: $fileCount" -ForegroundColor Yellow
Write-Host "Fichiers corrigés: $fixedCount" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
