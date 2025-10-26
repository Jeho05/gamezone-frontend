@echo off
echo Committing Railway URL update...
git commit -m "Update API base to Railway backend"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo Done! Vercel will redeploy automatically.
pause
