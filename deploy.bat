@echo off
echo ========================================
echo Deploying Frontend to GitHub
echo ========================================

git add .
git commit -m "add index.html template"
git push origin main

echo ========================================
echo Done! Check Vercel dashboard
echo ========================================
pause
