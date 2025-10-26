@echo off
echo ============================================
echo   DEPLOIEMENT CORRECTIONS ADMIN COMPLETES
echo ============================================
echo.

echo [1/4] Adding all admin fixes...
git add src\app\admin\ src\components\AdminProtected.jsx src\hooks\useAdminAuth.js
echo.

echo [2/4] Committing changes...
git commit -m "Fix: Add auth check and fix labels across ALL admin pages"
echo.

echo [3/4] Pushing to GitHub (Vercel will auto-deploy)...
git push origin main
echo.

echo [4/4] Done!
echo.
echo ============================================
echo   PAGES CORRIGEES
echo ============================================
echo.
echo Auth Check Ajoute:
echo   - shop/page.jsx
echo   - content/page.jsx
echo   - dashboard/page.jsx
echo   - players/page.jsx
echo   - rewards/page.jsx
echo   - points/page.jsx
echo   - bonuses/page.jsx
echo.
echo Labels Invisibles Corriges:
echo   - content/page.jsx (tous les labels)
echo   - shop/page.jsx (tous les labels)
echo.
echo Nouveaux Composants:
echo   - AdminProtected.jsx (wrapper reutilisable)
echo   - useAdminAuth.js (hook reutilisable)
echo.
echo ============================================
echo.
echo Vercel va redeployer automatiquement (2-3 min).
echo.
pause
