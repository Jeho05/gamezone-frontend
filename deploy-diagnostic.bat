@echo off
echo ========================================
echo   DEPLOIEMENT DIAGNOSTIC TOOL
echo ========================================
echo.

cd build\client

rem Copier diagnostic.html si pas déjà là
if not exist diagnostic.html (
    echo Copie de diagnostic.html...
    copy ..\..\diagnostic.html .
)

rem Ajouter au git local
git add diagnostic.html
git commit -m "Add diagnostic tool"
git push -f origin gh-pages

echo.
echo ========================================
echo   DEPLOIEMENT TERMINE !
echo ========================================
echo.
echo Le diagnostic sera accessible à :
echo https://Jeho05.github.io/gamezone/diagnostic.html
echo.
pause
