@echo off
echo Deploying all label fixes...
cd /d "c:\xampp\htdocs\gamezone-frontend-clean"
git add -A
git commit -m "Fix-all-invisible-labels-complete-v2"
git push origin main
echo.
echo Done! Vercel rebuilding...
pause
