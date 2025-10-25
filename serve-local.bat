@echo off
echo Démarrage du serveur local sur http://localhost:3000
echo.
echo Testez : http://localhost:3000/gamezone/
echo.
cd build\client
python -m http.server 3000
pause
