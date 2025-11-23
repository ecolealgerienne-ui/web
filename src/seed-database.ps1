# Script d'initialisation de la base de donnees avec des donnees de test realistes
# Cree 3 fermes algeriennes avec 50 animaux chacune (vaches, moutons, chevres)
# Architecture hybride: donnees de reference globales + donnees par ferme

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = "test-token"
)

# Configuration
$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

$global:ReferenceData = @{
    Species = @()
    Breeds = @()
    Products = @()
    Vaccines = @()
    Vets = @()
}

$global:CreatedFarms = @()

# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================

function Wait-RateLimit {
    Start-Sleep -Milliseconds 350
}

function New-Guid {
    return [guid]::NewGuid().ToString()
}

function Invoke-ApiCall {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )

    $uri = "$BaseUrl$Endpoint"

    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $jsonBody
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
        }
        Wait-RateLimit
        return $response
    } catch {
        Write-Host "[ERROR] $Method $Endpoint : $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Get-RandomDate {
    param(
        [int]$MinDaysAgo = 180,
        [int]$MaxDaysAgo = 2920  # ~8 ans
    )
    $daysAgo = Get-Random -Minimum $MinDaysAgo -Maximum $MaxDaysAgo
    return (Get-Date).AddDays(-$daysAgo).ToString("yyyy-MM-dd")
}

function Get-RandomPastDate {
    param(
        [int]$DaysAgo = 30
    )
    $days = Get-Random -Minimum 1 -Maximum $DaysAgo
    return (Get-Date).AddDays(-$days).ToString("yyyy-MM-dd")
}

# ============================================================================
# PHASE 1: NETTOYAGE
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Red
Write-Host "         NETTOYAGE DE LA BASE DE DONNEES                   " -ForegroundColor Red
Write-Host "============================================================`n" -ForegroundColor Red

Write-Host "[WARNING] Cette operation va supprimer toutes les donnees existantes..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Supprimer toutes les fermes (ce qui supprimera aussi toutes les donnees associees)
Write-Host "[DELETE] Suppression des fermes existantes..." -ForegroundColor Yellow
$existingFarms = Invoke-ApiCall -Method "GET" -Endpoint "/api/farms"

if ($existingFarms -and $existingFarms.data) {
    foreach ($farm in $existingFarms.data) {
        Write-Host "   [DELETE] $($farm.name) ($($farm.id))" -ForegroundColor Yellow
        Invoke-ApiCall -Method "DELETE" -Endpoint "/api/farms/$($farm.id)" | Out-Null
    }
    Write-Host "[OK] Fermes supprimees`n" -ForegroundColor Green
} else {
    Write-Host "[INFO] Aucune ferme a supprimer`n" -ForegroundColor Gray
}

# ============================================================================
# PHASE 2: CREATION DES DONNEES DE REFERENCE GLOBALES
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "         CREATION DES DONNEES DE REFERENCE (GLOBALES)       " -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# --- ESPECES (hardcodees dans le code) ---
Write-Host "[INFO] Les especes sont hardcodees: sheep, goat, cattle" -ForegroundColor Gray

# Les IDs des especes sont des strings fixes (non stockees en BD)
$bovineId = "cattle"
$ovineId = "sheep"
$caprineId = "goat"

# --- RACES (globales) ---
Write-Host "`n[CREATE] Creation des races algeriennes..." -ForegroundColor Green

$breedsData = @(
    # Bovins
    @{nameFr="Brune de l'Atlas"; nameEn="Atlas Brown"; nameAr="Boniya Al-Atlas"; speciesId=$bovineId; description="Race rustique des montagnes"},
    @{nameFr="Guelmoise"; nameEn="Guelmoise"; nameAr="Al-Qalmiya"; speciesId=$bovineId; description="Race laitiere de l'Est algerien"},
    @{nameFr="Cheurfa"; nameEn="Cheurfa"; nameAr="Al-Sharfa"; speciesId=$bovineId; description="Race locale de l'Ouest"},

    # Ovins
    @{nameFr="Ouled Djellal"; nameEn="Ouled Djellal"; nameAr="Awlad Djallal"; speciesId=$ovineId; description="Race ovine la plus repandue en Algerie"},
    @{nameFr="Rembi"; nameEn="Rembi"; nameAr="Al-Rambi"; speciesId=$ovineId; description="Race de l'Ouest algerien"},
    @{nameFr="D'Man"; nameEn="D'Man"; nameAr="Daman"; speciesId=$ovineId; description="Race prolifique du Sahara"},
    @{nameFr="Barbarine"; nameEn="Barbarine"; nameAr="Al-Barbariya"; speciesId=$ovineId; description="Race a queue grasse"},

    # Caprins
    @{nameFr="Arabia"; nameEn="Arabia"; nameAr="Al-Arabiya"; speciesId=$caprineId; description="Race caprine laitiere"},
    @{nameFr="Kabyle"; nameEn="Kabyle"; nameAr="Al-Qaba'iliya"; speciesId=$caprineId; description="Chevre de Kabylie"},
    @{nameFr="M'Zabite"; nameEn="M'Zabite"; nameAr="Al-Mozabiya"; speciesId=$caprineId; description="Race du M'Zab"},
    @{nameFr="Naine de Kabylie"; nameEn="Kabyle Dwarf"; nameAr="Al-Qaba'iliya Al-Qazma"; speciesId=$caprineId; description="Petite race locale"}
)

foreach ($breed in $breedsData) {
    $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/v1/breeds" -Body $breed
    if ($created) {
        $global:ReferenceData.Breeds += $created
        Write-Host "   [OK] $($breed.nameFr)" -ForegroundColor Gray
    }
}

# --- PRODUITS MEDICAUX (globaux) ---
Write-Host "`n[CREATE] Creation des produits medicaux..." -ForegroundColor Green

$productsData = @(
    # Antibiotiques
    @{nameFr="Oxytetracycline 20%"; nameEn="Oxytetracycline 20%"; category="Antibiotique"; manufacturer="SAIDAL"; withdrawalPeriodDays=28; unit="ml"},
    @{nameFr="Penicilline G"; nameEn="Penicillin G"; category="Antibiotique"; manufacturer="SAIDAL"; withdrawalPeriodDays=14; unit="ml"},

    # Antiparasitaires
    @{nameFr="Ivermectine 1%"; nameEn="Ivermectin 1%"; category="Antiparasitaire"; manufacturer="Biopharm"; withdrawalPeriodDays=35; unit="ml"},
    @{nameFr="Albendazole 10%"; nameEn="Albendazole 10%"; category="Antiparasitaire"; manufacturer="SAIDAL"; withdrawalPeriodDays=14; unit="ml"},

    # Vitamines
    @{nameFr="Vitamine AD3E"; nameEn="Vitamin AD3E"; category="Vitamine"; manufacturer="SAIDAL"; withdrawalPeriodDays=0; unit="ml"}
)

foreach ($product in $productsData) {
    $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/v1/products" -Body $product
    if ($created) {
        $global:ReferenceData.Products += $created
        Write-Host "   [OK] $($product.nameFr)" -ForegroundColor Gray
    }
}

# --- VACCINS (globaux) ---
Write-Host "`n[CREATE] Creation des vaccins..." -ForegroundColor Green

$vaccinesData = @(
    @{nameFr="Enterotoxemie"; nameEn="Enterotoxemia"; disease="Enterotoxemie"; manufacturer="Institut Pasteur"; type="obligatoire"; withdrawalPeriodDays=0},
    @{nameFr="Fievre Aphteuse"; nameEn="Foot-and-Mouth Disease"; disease="Fievre aphteuse"; manufacturer="SAIDAL"; type="obligatoire"; withdrawalPeriodDays=0},
    @{nameFr="Brucellose"; nameEn="Brucellosis"; disease="Brucellose"; manufacturer="Institut Pasteur"; type="obligatoire"; withdrawalPeriodDays=0}
)

foreach ($vaccine in $vaccinesData) {
    $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/v1/vaccines" -Body $vaccine
    if ($created) {
        $global:ReferenceData.Vaccines += $created
        Write-Host "   [OK] $($vaccine.nameFr)" -ForegroundColor Gray
    }
}

Write-Host "`n[SUCCESS] Donnees de reference globales creees !" -ForegroundColor Green

# ============================================================================
# PHASE 3: CREATION DES FERMES
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Magenta
Write-Host "              CREATION DES 3 FERMES                         " -ForegroundColor Magenta
Write-Host "============================================================`n" -ForegroundColor Magenta

$farmsData = @(
    @{
        name="Ferme El Baraka"
        address="Route de Medea, Berrouaghia"
        city="Medea"
        postalCode="26000"
        phone="+213550111222"
        email="contact@elbaraka.dz"
        taxId="26123456789"
        mainActivity="Elevage ovin (Ouled Djellal)"
    },
    @{
        name="Ferme Essalem"
        address="Zone agricole, Ain Defla"
        city="Ain Defla"
        postalCode="44000"
        phone="+213550333444"
        email="info@essalem.dz"
        taxId="44234567890"
        mainActivity="Elevage bovin laitier"
    },
    @{
        name="Ferme Errahma"
        address="Commune de Bouira"
        city="Bouira"
        postalCode="10000"
        phone="+213550555666"
        email="contact@errahma.dz"
        taxId="10345678901"
        mainActivity="Elevage caprin laitier"
    }
)

foreach ($farmData in $farmsData) {
    Write-Host "[CREATE] $($farmData.name)..." -ForegroundColor Green

    $farm = Invoke-ApiCall -Method "POST" -Endpoint "/api/farms" -Body $farmData

    if ($farm) {
        Write-Host "   [OK] ID: $($farm.id)" -ForegroundColor Gray
        $global:CreatedFarms += @{
            Farm = $farm
            Animals = @()
        }
    }
}

Write-Host "`n[SUCCESS] $($global:CreatedFarms.Count) fermes creees !`n" -ForegroundColor Green

# ============================================================================
# PHASE 4: CREATION DES ANIMAUX PAR FERME
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "         CREATION DES ANIMAUX PAR FERME                     " -ForegroundColor Yellow
Write-Host "============================================================`n" -ForegroundColor Yellow

$farmConfigs = @(
    @{Index=0; SheepCount=30; GoatCount=10; CattleCount=10},
    @{Index=1; SheepCount=10; GoatCount=10; CattleCount=30},
    @{Index=2; SheepCount=10; GoatCount=30; CattleCount=10}
)

foreach ($config in $farmConfigs) {
    $farmContext = $global:CreatedFarms[$config.Index]
    $farm = $farmContext.Farm
    $farmId = $farm.id

    Write-Host "`n[FARM] $($farm.name)" -ForegroundColor Cyan

    $animalCounter = 1

    # Ovins
    if ($config.SheepCount -gt 0) {
        Write-Host "  [CREATE] $($config.SheepCount) moutons..." -ForegroundColor Green
        $sheepBreeds = $global:ReferenceData.Breeds | Where-Object { $_.nameFr -in @("Ouled Djellal", "Rembi", "D'Man", "Barbarine") }

        for ($i = 1; $i -le $config.SheepCount; $i++) {
            $sex = if ((Get-Random -Minimum 1 -Maximum 100) -le 80) { "female" } else { "male" }
            $breed = $sheepBreeds | Get-Random

            $animal = @{
                eid = "250{0:D12}" -f (Get-Random -Minimum 100000000000 -Maximum 999999999999)
                internalId = "M{0:D3}" -f $i
                species = "sheep"
                breedId = $breed.id
                sex = $sex
                birthDate = Get-RandomDate -MinDaysAgo 180 -MaxDaysAgo 2555
                acquisitionDate = Get-RandomDate -MinDaysAgo 180 -MaxDaysAgo 2555
                acquisitionType = "birth"
            }

            $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/animals" -Body $animal
            if ($created) {
                $farmContext.Animals += $created
                $animalCounter++
            }
        }
    }

    # Caprins
    if ($config.GoatCount -gt 0) {
        Write-Host "  [CREATE] $($config.GoatCount) chevres..." -ForegroundColor Green
        $goatBreeds = $global:ReferenceData.Breeds | Where-Object { $_.nameFr -in @("Arabia", "Kabyle", "M'Zabite", "Naine de Kabylie") }

        for ($i = 1; $i -le $config.GoatCount; $i++) {
            $sex = if ((Get-Random -Minimum 1 -Maximum 100) -le 80) { "female" } else { "male" }
            $breed = $goatBreeds | Get-Random

            $animal = @{
                eid = "250{0:D12}" -f (Get-Random -Minimum 100000000000 -Maximum 999999999999)
                internalId = "C{0:D3}" -f $i
                species = "goat"
                breedId = $breed.id
                sex = $sex
                birthDate = Get-RandomDate -MinDaysAgo 180 -MaxDaysAgo 2555
                acquisitionDate = Get-RandomDate -MinDaysAgo 180 -MaxDaysAgo 2555
                acquisitionType = "birth"
            }

            $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/animals" -Body $animal
            if ($created) {
                $farmContext.Animals += $created
                $animalCounter++
            }
        }
    }

    # Bovins
    if ($config.CattleCount -gt 0) {
        Write-Host "  [CREATE] $($config.CattleCount) vaches..." -ForegroundColor Green
        $cattleBreeds = $global:ReferenceData.Breeds | Where-Object { $_.nameFr -in @("Brune de l'Atlas", "Guelmoise", "Cheurfa") }

        for ($i = 1; $i -le $config.CattleCount; $i++) {
            $sex = if ((Get-Random -Minimum 1 -Maximum 100) -le 80) { "female" } else { "male" }
            $breed = $cattleBreeds | Get-Random

            $animal = @{
                eid = "250{0:D12}" -f (Get-Random -Minimum 100000000000 -Maximum 999999999999)
                internalId = "V{0:D3}" -f $i
                species = "cattle"
                breedId = $breed.id
                sex = $sex
                birthDate = Get-RandomDate -MinDaysAgo 365 -MaxDaysAgo 2920
                acquisitionDate = Get-RandomDate -MinDaysAgo 365 -MaxDaysAgo 2920
                acquisitionType = "birth"
            }

            $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/animals" -Body $animal
            if ($created) {
                $farmContext.Animals += $created
                $animalCounter++
            }
        }
    }

    Write-Host "  [OK] $($farmContext.Animals.Count) animaux crees" -ForegroundColor Gray
}

# ============================================================================
# RESUME FINAL
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "                    RESUME FINAL                            " -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Green

Write-Host "[SUCCESS] Base de donnees initialisee avec succes !`n" -ForegroundColor Green

Write-Host "[STATS] DONNEES DE REFERENCE (GLOBALES):" -ForegroundColor Cyan
Write-Host "   - Especes: 3 (hardcodees: sheep, goat, cattle)" -ForegroundColor White
Write-Host "   - Races: $($global:ReferenceData.Breeds.Count)" -ForegroundColor White
Write-Host "   - Produits medicaux: $($global:ReferenceData.Products.Count)" -ForegroundColor White
Write-Host "   - Vaccins: $($global:ReferenceData.Vaccines.Count)" -ForegroundColor White

Write-Host "`n[STATS] FERMES ET ANIMAUX:" -ForegroundColor Cyan
$totalAnimals = 0
foreach ($farmContext in $global:CreatedFarms) {
    $farm = $farmContext.Farm
    Write-Host "   - $($farm.name): $($farmContext.Animals.Count) animaux" -ForegroundColor White
    $totalAnimals += $farmContext.Animals.Count
}

Write-Host "`n[STATS] TOTAL:" -ForegroundColor Cyan
Write-Host "   - Fermes: $($global:CreatedFarms.Count)" -ForegroundColor White
Write-Host "   - Animaux: $totalAnimals" -ForegroundColor White

Write-Host "`n[SUCCESS] La base de donnees est prete pour les tests !`n" -ForegroundColor Green
