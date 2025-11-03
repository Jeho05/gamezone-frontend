@echo off
cd /d "%~dp0"
git add .
git commit -m "Quick update" --allow-empty
git push origin main
pause
