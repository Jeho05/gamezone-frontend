# PowerShell script to push fixes
Set-Location -Path "c:\xampp\htdocs\gamezone-frontend-clean"

# Add all changes
git add .

# Commit with message
git commit -m "fix: Force Vercel cache refresh to resolve duplicate import issue" --allow-empty

# Push to origin
git push origin main

Write-Host "Push completed successfully!" -ForegroundColor Green
