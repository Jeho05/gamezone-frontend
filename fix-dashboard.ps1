# PowerShell script to fix admin dashboard import issue
Write-Host "Stopping any running vim processes..." -ForegroundColor Yellow
Stop-Process -Name "vim" -Force -ErrorAction SilentlyContinue

Write-Host "Checking out the file from git to restore clean version..." -ForegroundColor Yellow
Set-Location -Path "c:\xampp\htdocs\gamezone-frontend-clean"
git checkout -- "src\app\admin\dashboard\page.jsx"

Write-Host "Adding correct imports..." -ForegroundColor Yellow
# Read the file content
$content = Get-Content "src\app\admin\dashboard\page.jsx"

# Find the line after the first import
$index = 0
for ($i = 0; $i -lt $content.Length; $i++) {
    if ($content[$i] -match "^import.*from.*react.*;") {
        $index = $i + 1
        break
    }
}

# Insert the useState, useEffect import after the first import
$newContent = @()
for ($i = 0; $i -lt $content.Length; $i++) {
    $newContent += $content[$i]
    if ($i -eq $index - 1) {
        $newContent += "import { useState, useEffect } from 'react';"
    }
}

# Write the fixed content back to the file
$newContent | Set-Content "src\app\admin\dashboard\page.jsx"

Write-Host "Fix applied successfully!" -ForegroundColor Green
Write-Host "Please run simple-push.bat to push the changes" -ForegroundColor Cyan
