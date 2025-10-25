# ============================================
#  DIAGNOSTIC COMPLET GAMEZONE
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   DIAGNOSTIC GAMEZONE - DÉMARRAGE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()
$success = @()

function Test-Item-Status {
    param(
        [string]$Name,
        [bool]$Condition,
        [string]$SuccessMsg,
        [string]$ErrorMsg
    )
    
    if ($Condition) {
        Write-Host "[OK] $Name : $SuccessMsg" -ForegroundColor Green
        $script:success += "$Name : $SuccessMsg"
    } else {
        Write-Host "[ERROR] $Name : $ErrorMsg" -ForegroundColor Red
        $script:errors += "$Name : $ErrorMsg"
    }
}

function Test-Warning {
    param(
        [string]$Name,
        [string]$Message
    )
    
    Write-Host "[WARNING] $Name : $Message" -ForegroundColor Yellow
    $script:warnings += "$Name : $Message"
}

# ============================================
# 1. TEST STRUCTURE DU PROJET
# ============================================
Write-Host "`n[1/7] TEST STRUCTURE DU PROJET" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Gray

Test-Item-Status -Name "Dossier source" `
    -Condition (Test-Path "src") `
    -SuccessMsg "Dossier src trouvé" `
    -ErrorMsg "Dossier src manquant"

Test-Item-Status -Name "Dossier build" `
    -Condition (Test-Path "build\client") `
    -SuccessMsg "Dossier build/client trouvé" `
    -ErrorMsg "Dossier build/client manquant (exécutez 'npm run build')"

Test-Item-Status -Name "package.json" `
    -Condition (Test-Path "package.json") `
    -SuccessMsg "package.json trouvé" `
    -ErrorMsg "package.json manquant"

Test-Item-Status -Name "vite.config.production.ts" `
    -Condition (Test-Path "vite.config.production.ts") `
    -SuccessMsg "Configuration Vite trouvée" `
    -ErrorMsg "vite.config.production.ts manquant"

# ============================================
# 2. TEST FICHIERS CRITIQUES
# ============================================
Write-Host "`n[2/7] TEST FICHIERS CRITIQUES" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Gray

$criticalFiles = @(
    "src\entry.client.tsx",
    "src\FullApp.tsx",
    "src\app\page-minimal.jsx",
    "index.html"
)

foreach ($file in $criticalFiles) {
    Test-Item-Status -Name $file `
        -Condition (Test-Path $file) `
        -SuccessMsg "Trouvé" `
        -ErrorMsg "Manquant"
}

# ============================================
# 3. TEST BUILD OUTPUT
# ============================================
Write-Host "`n[3/7] TEST BUILD OUTPUT" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Gray

if (Test-Path "build\client\index.html") {
    $indexContent = Get-Content "build\client\index.html" -Raw
    
    # Vérifier basename
    if ($indexContent -match '/gamezone/') {
        Write-Host "[OK] index.html : Basename '/gamezone/' détecté" -ForegroundColor Green
        $success += "index.html : Basename correct"
    } else {
        Write-Host "[ERROR] index.html : Basename '/gamezone/' non trouvé" -ForegroundColor Red
        $errors += "index.html : Basename incorrect"
    }
    
    # Vérifier root element
    if ($indexContent -match 'id="root"') {
        Write-Host "[OK] index.html : Element root trouvé" -ForegroundColor Green
        $success += "index.html : Root element OK"
    } else {
        Write-Host "[ERROR] index.html : Element root manquant" -ForegroundColor Red
        $errors += "index.html : Root element manquant"
    }
    
    # Vérifier scripts
    if ($indexContent -match 'script.*src="/gamezone/assets/') {
        Write-Host "[OK] index.html : Scripts avec bon chemin" -ForegroundColor Green
        $success += "index.html : Scripts OK"
    } else {
        Write-Host "[ERROR] index.html : Scripts avec mauvais chemin" -ForegroundColor Red
        $errors += "index.html : Scripts incorrect"
    }
} else {
    Write-Host "[ERROR] build\client\index.html : Fichier manquant" -ForegroundColor Red
    $errors += "build\client\index.html manquant"
}

# Vérifier assets
$assetsPath = "build\client\assets"
if (Test-Path $assetsPath) {
    $jsFiles = (Get-ChildItem $assetsPath -Filter "*.js").Count
    $cssFiles = (Get-ChildItem $assetsPath -Filter "*.css").Count
    
    Write-Host "[OK] Assets : $jsFiles fichiers JS, $cssFiles fichiers CSS" -ForegroundColor Green
    $success += "Assets : $jsFiles JS, $cssFiles CSS"
    
    if ($jsFiles -lt 5) {
        Test-Warning -Name "Assets JS" -Message "Peu de fichiers JS ($jsFiles), build peut être incomplet"
    }
} else {
    Write-Host "[ERROR] Dossier assets manquant" -ForegroundColor Red
    $errors += "Dossier assets manquant"
}

# ============================================
# 4. TEST CONFIGURATION
# ============================================
Write-Host "`n[4/7] TEST CONFIGURATION" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Gray

if (Test-Path "vite.config.production.ts") {
    $viteConfig = Get-Content "vite.config.production.ts" -Raw
    
    if ($viteConfig -match "base:\s*['""]\/gamezone\/['""]") {
        Write-Host "[OK] vite.config : base '/gamezone/' configuré" -ForegroundColor Green
        $success += "vite.config : base OK"
    } else {
        Write-Host "[ERROR] vite.config : base '/gamezone/' non trouvé" -ForegroundColor Red
        $errors += "vite.config : base manquant"
    }
}

if (Test-Path "src\FullApp.tsx") {
    $fullAppContent = Get-Content "src\FullApp.tsx" -Raw
    
    if ($fullAppContent -match 'basename="/gamezone"') {
        Write-Host "[OK] FullApp.tsx : basename '/gamezone' configuré" -ForegroundColor Green
        $success += "FullApp.tsx : basename OK"
    } else {
        Write-Host "[ERROR] FullApp.tsx : basename '/gamezone' non trouvé" -ForegroundColor Red
        $errors += "FullApp.tsx : basename manquant"
    }
    
    if ($fullAppContent -match 'page-minimal') {
        Write-Host "[OK] FullApp.tsx : Utilise page-minimal" -ForegroundColor Green
        $success += "FullApp.tsx : page-minimal OK"
    } else {
        Test-Warning -Name "FullApp.tsx" -Message "N'utilise pas page-minimal (peut causer erreurs)"
    }
}

# ============================================
# 5. TEST DÉPENDANCES
# ============================================
Write-Host "`n[5/7] TEST DÉPENDANCES" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Gray

if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    
    $requiredDeps = @("react", "react-dom", "react-router-dom")
    foreach ($dep in $requiredDeps) {
        if ($packageJson.dependencies.$dep) {
            Write-Host "[OK] Dépendance : $dep installée" -ForegroundColor Green
            $success += "Dépendance $dep OK"
        } else {
            Write-Host "[ERROR] Dépendance : $dep manquante" -ForegroundColor Red
            $errors += "Dépendance $dep manquante"
        }
    }
    
    if ($packageJson.scripts.build) {
        Write-Host "[OK] Script build configuré" -ForegroundColor Green
        $success += "Script build OK"
    } else {
        Write-Host "[ERROR] Script build manquant" -ForegroundColor Red
        $errors += "Script build manquant"
    }
    
    if ($packageJson.homepage -match "github.io/gamezone") {
        Write-Host "[OK] Homepage configuré pour GitHub Pages" -ForegroundColor Green
        $success += "Homepage OK"
    } else {
        Test-Warning -Name "Homepage" -Message "Pas configuré pour GitHub Pages"
    }
}

# ============================================
# 6. TEST GITHUB PAGES
# ============================================
Write-Host "`n[6/7] TEST GITHUB PAGES" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "https://Jeho05.github.io/gamezone/" -Method Head -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] Site GitHub Pages accessible" -ForegroundColor Green
        $success += "GitHub Pages accessible"
    }
} catch {
    Test-Warning -Name "GitHub Pages" -Message "Site non accessible ou timeout"
}

# ============================================
# 7. TEST GIT
# ============================================
Write-Host "`n[7/7] TEST GIT" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Gray

try {
    $gitStatus = git status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Git : Repository initialisé" -ForegroundColor Green
        $success += "Git repository OK"
        
        $gitRemote = git remote get-url origin 2>&1
        if ($gitRemote -match "Jeho05/gamezone") {
            Write-Host "[OK] Git : Remote origin configuré" -ForegroundColor Green
            $success += "Git remote OK"
        } else {
            Test-Warning -Name "Git remote" -Message "Remote origin non configuré ou incorrect"
        }
        
        $gitBranch = git branch --show-current
        Write-Host "[INFO] Branche actuelle : $gitBranch" -ForegroundColor Cyan
    } else {
        Test-Warning -Name "Git" -Message "Repository non initialisé"
    }
} catch {
    Test-Warning -Name "Git" -Message "Git non installé ou erreur"
}

# ============================================
# RÉSUMÉ FINAL
# ============================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   RÉSUMÉ DU DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`n✅ SUCCÈS : $($success.Count)" -ForegroundColor Green
Write-Host "❌ ERREURS : $($errors.Count)" -ForegroundColor Red
Write-Host "⚠️  AVERTISSEMENTS : $($warnings.Count)" -ForegroundColor Yellow

if ($errors.Count -gt 0) {
    Write-Host "`n❌ ERREURS DÉTECTÉES:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   - $error" -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️  AVERTISSEMENTS:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   - $warning" -ForegroundColor Yellow
    }
}

# Taux de succès
$total = $success.Count + $errors.Count + $warnings.Count
if ($total -gt 0) {
    $successRate = [math]::Round(($success.Count / $total) * 100, 2)
    Write-Host "`n📊 TAUX DE SUCCÈS : $successRate%" -ForegroundColor Cyan
    
    if ($successRate -ge 90) {
        Write-Host "`n🎉 EXCELLENT ! Le projet est en très bon état." -ForegroundColor Green
    } elseif ($successRate -ge 70) {
        Write-Host "`n👍 BON. Quelques améliorations possibles." -ForegroundColor Yellow
    } else {
        Write-Host "`n⚠️  ATTENTION. Plusieurs problèmes à corriger." -ForegroundColor Red
    }
}

# Sauvegarder rapport
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = "diagnostic-report-$timestamp.txt"
$currentDate = Get-Date
$report = @"
==============================================
  RAPPORT DIAGNOSTIC GAMEZONE
==============================================
Date: $currentDate

STATISTIQUES:
-------------
✅ Succès: $($success.Count)
❌ Erreurs: $($errors.Count)
⚠️  Avertissements: $($warnings.Count)
📊 Taux succès: $successRate%

"@

if ($errors.Count -gt 0) {
    $report += "`nERREURS:`n"
    foreach ($error in $errors) {
        $report += "- $error`n"
    }
}

if ($warnings.Count -gt 0) {
    $report += "`nAVERTISSEMENTS:`n"
    foreach ($warning in $warnings) {
        $report += "- $warning`n"
    }
}

if ($success.Count -gt 0) {
    $report += "`nSUCCÈS:`n"
    foreach ($succ in $success) {
        $report += "- $succ`n"
    }
}

$report | Out-File $reportPath -Encoding UTF8
Write-Host "`n📄 Rapport sauvegardé : $reportPath" -ForegroundColor Cyan

Write-Host "`n============================================`n" -ForegroundColor Cyan
