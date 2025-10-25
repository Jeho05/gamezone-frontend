@echo off
git commit --allow-empty -m "force vercel redeploy"
git push origin main
echo.
echo Vercel va rebuilder dans 1-2 minutes !
pause
