@echo off
echo ========================================
echo   DEPLOIEMENT MANUEL GITHUB PAGES
echo ========================================
echo.

cd build\client

git init
git add -A
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages
git remote add origin https://github.com/Jeho05/gamezone.git
git push -f origin gh-pages

echo.
echo ========================================
echo   DEPLOIEMENT TERMINE !
echo ========================================
echo.
echo Votre site sera accessible dans 2-3 minutes à :
echo https://Jeho05.github.io/gamezone
echo.
pause
