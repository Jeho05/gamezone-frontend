# Script pour redéployer sur Vercel après activation SSL

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                               ║" -ForegroundColor Cyan
Write-Host "║         🚀 Redéploiement Vercel - HTTPS Activé              ║" -ForegroundColor Cyan
Write-Host "║                                                               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Variables d'environnement mises à jour:" -ForegroundColor Green
Write-Host "   NEXT_PUBLIC_API_BASE=https://ismo.gamer.gd/api" -ForegroundColor White
Write-Host ""

Write-Host "📋 Options de déploiement:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Via Git Push (si repo configuré)" -ForegroundColor Cyan
Write-Host "2️⃣  Via Vercel CLI" -ForegroundColor Cyan
Write-Host "3️⃣  Via Dashboard Vercel (manuel)" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Choisissez une option (1/2/3)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "🔄 Déploiement via Git..." -ForegroundColor Cyan
    Write-Host ""
    
    git add .
    git commit -m "Switch backend to HTTPS - SSL activated"
    git push
    
    Write-Host ""
    Write-Host "✅ Push effectué! Vercel déploiera automatiquement." -ForegroundColor Green
    Write-Host "   Suivez le déploiement sur: https://vercel.com/dashboard" -ForegroundColor Gray
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "🔄 Déploiement via Vercel CLI..." -ForegroundColor Cyan
    Write-Host ""
    
    # Vérifier si Vercel CLI est installé
    $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
    
    if ($vercelInstalled) {
        vercel --prod
        Write-Host ""
        Write-Host "✅ Déploiement lancé!" -ForegroundColor Green
    } else {
        Write-Host "❌ Vercel CLI non installé" -ForegroundColor Red
        Write-Host ""
        Write-Host "Installez-le avec:" -ForegroundColor Yellow
        Write-Host "   npm install -g vercel" -ForegroundColor White
        Write-Host ""
        Write-Host "Puis relancez ce script." -ForegroundColor Yellow
    }
    
} elseif ($choice -eq "3") {
    Write-Host ""
    Write-Host "📱 Déploiement Manuel via Dashboard:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Allez sur: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "2. Sélectionnez votre projet 'gamezone'" -ForegroundColor White
    Write-Host "3. Onglet 'Settings' > 'Environment Variables'" -ForegroundColor White
    Write-Host "4. Modifiez NEXT_PUBLIC_API_BASE:" -ForegroundColor White
    Write-Host "   https://ismo.gamer.gd/api" -ForegroundColor Green
    Write-Host "5. Retournez à 'Deployments'" -ForegroundColor White
    Write-Host "6. Cliquez '...' sur le dernier déploiement" -ForegroundColor White
    Write-Host "7. Cliquez 'Redeploy'" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Le déploiement prendra 2-3 minutes" -ForegroundColor Green
    
    $open = Read-Host "Ouvrir le dashboard Vercel? (o/n)"
    if ($open -eq "o") {
        Start-Process "https://vercel.com/dashboard"
    }
} else {
    Write-Host ""
    Write-Host "❌ Choix invalide" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host ""
Write-Host "🧪 TESTS À EFFECTUER APRÈS LE DÉPLOIEMENT:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Backend HTTPS:" -ForegroundColor Cyan
Write-Host "   https://ismo.gamer.gd/api/health.php" -ForegroundColor White
Write-Host ""
Write-Host "2. Frontend Vercel:" -ForegroundColor Cyan
Write-Host "   https://gamezoneismo.vercel.app/" -ForegroundColor White
Write-Host ""
Write-Host "3. Login depuis Vercel (F12 pour voir les requêtes)" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Plus d'erreur 'Mixed Content' !" -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host ""
