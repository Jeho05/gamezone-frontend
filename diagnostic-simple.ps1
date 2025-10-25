# ============================================
#  DIAGNOSTIC GAMEZONE - VERSION SIMPLE
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   DIAGNOSTIC GAMEZONE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()
$success = @()

# ============================================
# 1. STRUCTURE DU PROJET
# ============================================
Write-Host "[1/7] STRUCTURE DU PROJET" -ForegroundColor Yellow

if (Test-Path "src") {
    Write-Host "[OK] Dossier src trouve" -ForegroundColor Green
    $success += "Dossier src OK"
} else {
    Write-Host "[ERROR] Dossier src manquant" -ForegroundColor Red
    $errors += "Dossier src manquant"
}

if (Test-Path "build\client") {
    Write-Host "[OK] Dossier build/client trouve" -ForegroundColor Green
    $success += "Build directory OK"
} else {
    Write-Host "[ERROR] Dossier build/client manquant - Executez 'npm run build'" -ForegroundColor Red
    $errors += "Build directory manquant"
}

if (Test-Path "package.json") {
    Write-Host "[OK] package.json trouve" -ForegroundColor Green
    $success += "package.json OK"
} else {
    Write-Host "[ERROR] package.json manquant" -ForegroundColor Red
    $errors += "package.json manquant"
}

# ============================================
# 2. FICHIERS CRITIQUES
# ============================================
Write-Host "`n[2/7] FICHIERS CRITIQUES" -ForegroundColor Yellow

$criticalFiles = @(
    "src\entry.client.tsx",
    "src\FullApp.tsx",
    "src\app\page-minimal.jsx",
    "index.html"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "[OK] $file trouve" -ForegroundColor Green
        $success += "$file OK"
    } else {
        Write-Host "[ERROR] $file manquant" -ForegroundColor Red
        $errors += "$file manquant"
    }
}

# ============================================
# 3. BUILD OUTPUT
# ============================================
Write-Host "`n[3/7] BUILD OUTPUT" -ForegroundColor Yellow

if (Test-Path "build\client\index.html") {
    Write-Host "[OK] index.html genere" -ForegroundColor Green
    $success += "index.html genere"
    
    $indexContent = Get-Content "build\client\index.html" -Raw
    
    if ($indexContent -match "/gamezone/") {
        Write-Host "[OK] Basename '/gamezone/' present" -ForegroundColor Green
        $success += "Basename OK"
    } else {
        Write-Host "[ERROR] Basename '/gamezone/' absent" -ForegroundColor Red
        $errors += "Basename manquant"
    }
} else {
    Write-Host "[ERROR] build\client\index.html manquant" -ForegroundColor Red
    $errors += "index.html manquant"
}

if (Test-Path "build\client\assets") {
    $jsFiles = (Get-ChildItem "build\client\assets" -Filter "*.js").Count
    $cssFiles = (Get-ChildItem "build\client\assets" -Filter "*.css").Count
    Write-Host "[OK] Assets: $jsFiles JS, $cssFiles CSS" -ForegroundColor Green
    $success += "Assets OK"
} else {
    Write-Host "[ERROR] Dossier assets manquant" -ForegroundColor Red
    $errors += "Assets manquant"
}

# ============================================
# 4. CONFIGURATION
# ============================================
Write-Host "`n[4/7] CONFIGURATION" -ForegroundColor Yellow

if (Test-Path "vite.config.production.ts") {
    $viteConfig = Get-Content "vite.config.production.ts" -Raw
    
    if ($viteConfig -match "base:\s*[""']/gamezone/[""']") {
        Write-Host "[OK] vite.config: base '/gamezone/' OK" -ForegroundColor Green
        $success += "Vite config OK"
    } else {
        Write-Host "[ERROR] vite.config: base '/gamezone/' absent" -ForegroundColor Red
        $errors += "Vite base manquant"
    }
}

if (Test-Path "src\FullApp.tsx") {
    $fullAppContent = Get-Content "src\FullApp.tsx" -Raw
    
    if ($fullAppContent -match 'basename="/gamezone"') {
        Write-Host "[OK] FullApp.tsx: basename OK" -ForegroundColor Green
        $success += "FullApp basename OK"
    } else {
        Write-Host "[ERROR] FullApp.tsx: basename manquant" -ForegroundColor Red
        $errors += "FullApp basename manquant"
    }
    
    if ($fullAppContent -match "page-minimal") {
        Write-Host "[OK] FullApp.tsx: utilise page-minimal" -ForegroundColor Green
        $success += "page-minimal OK"
    } else {
        Write-Host "[WARNING] FullApp.tsx: n'utilise pas page-minimal" -ForegroundColor Yellow
        $warnings += "page-minimal non utilise"
    }
}

# ============================================
# 5. DEPENDENCIES
# ============================================
Write-Host "`n[5/7] DEPENDENCIES" -ForegroundColor Yellow

if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    
    $requiredDeps = @("react", "react-dom", "react-router-dom")
    foreach ($dep in $requiredDeps) {
        if ($packageJson.dependencies.$dep) {
            Write-Host "[OK] $dep installe" -ForegroundColor Green
            $success += "$dep OK"
        } else {
            Write-Host "[ERROR] $dep manquant" -ForegroundColor Red
            $errors += "$dep manquant"
        }
    }
}

# ============================================
# 6. GIT
# ============================================
Write-Host "`n[6/7] GIT" -ForegroundColor Yellow

try {
    $gitStatus = git status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Git repository OK" -ForegroundColor Green
        $success += "Git OK"
        
        $gitRemote = git remote get-url origin 2>&1
        if ($gitRemote -match "Jeho05/gamezone") {
            Write-Host "[OK] Remote origin configure" -ForegroundColor Green
            $success += "Git remote OK"
        }
    }
} catch {
    Write-Host "[WARNING] Git non disponible" -ForegroundColor Yellow
    $warnings += "Git non disponible"
}

# ============================================
# 7. GITHUB PAGES
# ============================================
Write-Host "`n[7/7] GITHUB PAGES" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://Jeho05.github.io/gamezone/" -Method Head -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] Site accessible" -ForegroundColor Green
        $success += "GitHub Pages OK"
    }
} catch {
    Write-Host "[WARNING] Site non accessible ou timeout" -ForegroundColor Yellow
    $warnings += "GitHub Pages timeout"
}

# ============================================
# RESUME
# ============================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   RESUME" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`nSucces: $($success.Count)" -ForegroundColor Green
Write-Host "Erreurs: $($errors.Count)" -ForegroundColor Red
Write-Host "Avertissements: $($warnings.Count)" -ForegroundColor Yellow

if ($errors.Count -gt 0) {
    Write-Host "`nERREURS DETECTEES:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "`nAVERTISSEMENTS:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  - $warning" -ForegroundColor Yellow
    }
}

$total = $success.Count + $errors.Count + $warnings.Count
if ($total -gt 0) {
    $successRate = [math]::Round(($success.Count / $total) * 100, 2)
    Write-Host "`nTAUX DE SUCCES: $successRate%" -ForegroundColor Cyan
    
    if ($successRate -ge 90) {
        Write-Host "`nEXCELLENT! Projet en bon etat." -ForegroundColor Green
    } elseif ($successRate -ge 70) {
        Write-Host "`nBON. Quelques ameliorations possibles." -ForegroundColor Yellow
    } else {
        Write-Host "`nATTENTION. Plusieurs problemes a corriger." -ForegroundColor Red
    }
}

# Sauvegarder rapport
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = "diagnostic-report-$timestamp.txt"
$currentDate = Get-Date

$report = "=============================================="
$report += "`nRAPPORT DIAGNOSTIC GAMEZONE"
$report += "`n=============================================="
$report += "`nDate: $currentDate"
$report += "`n`nSTATISTIQUES:"
$report += "`nSucces: $($success.Count)"
$report += "`nErreurs: $($errors.Count)"
$report += "`nAvertissements: $($warnings.Count)"
$report += "`nTaux succes: $successRate%"
$report += "`n"

if ($errors.Count -gt 0) {
    $report += "`n`nERREURS:"
    foreach ($error in $errors) {
        $report += "`n- $error"
    }
}

if ($warnings.Count -gt 0) {
    $report += "`n`nAVERTISSEMENTS:"
    foreach ($warning in $warnings) {
        $report += "`n- $warning"
    }
}

$report | Out-File $reportPath -Encoding UTF8
Write-Host "`nRapport sauvegarde: $reportPath" -ForegroundColor Cyan
Write-Host "`n============================================`n" -ForegroundColor Cyan
