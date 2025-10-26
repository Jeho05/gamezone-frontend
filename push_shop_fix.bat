@echo off
echo Committing shop page fixes...
git commit -m "Fix admin shop: add auth check and make labels visible"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo Done! Vercel will redeploy automatically.
echo.
echo Fixes:
echo - Added authentication check (redirects to login if not logged in)
echo - Fixed invisible labels (added text-gray-900)
pause
