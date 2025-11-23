# Script d'initialisation - Donnees de test (max 10 par type)
# Usage: .\seed-database-final.ps1

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = "test-token",
    [int]$TotalAnimals = 10
)

$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

$global:Data = @{
    Breeds = @()
    Products = @()
    Vaccines = @()
    Farm = $null
    Animals = @()
    Lots = @()
    Vaccinations = @()
    Treatments = @()
    Weights = @()
    Movements = @()
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
        Start-Sleep -Seconds 1
        return $response
    } catch {
        Write-Host "[ERROR] $Method $Endpoint : $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Get-RandomDate {
    param([int]$MinDaysAgo = 180, [int]$MaxDaysAgo = 2555)
    $daysAgo = Get-Random -Minimum $MinDaysAgo -Maximum $MaxDaysAgo
    return (Get-Date).AddDays(-$daysAgo).ToString("yyyy-MM-dd")
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  INITIALISATION BD - DONNEES DE TEST (MAX 10 PAR TYPE)" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# ============================================================================
# PHASE 1: CREER LES RACES FRANCAISES
# ============================================================================

Write-Host "[1/10] Creation des races francaises..." -ForegroundColor Green

$breedsData = @(
    # Bovins (3 races)
    @{speciesId="cattle"; nameFr="Charolaise"; nameEn="Charolais"; nameAr="Charolaise"; description="Race a viande blanche tres repandue"},
    @{speciesId="cattle"; nameFr="Limousine"; nameEn="Limousin"; nameAr="Limousine"; description="Race a viande rousse rustique"},
    @{speciesId="cattle"; nameFr="Normande"; nameEn="Norman"; nameAr="Normande"; description="Race laitiere normande"},

    # Ovins (4 races)
    @{speciesId="sheep"; nameFr="Lacaune"; nameEn="Lacaune"; nameAr="Lacaune"; description="Race laitiere pour le Roquefort"},
    @{speciesId="sheep"; nameFr="Merinos d'Arles"; nameEn="Arles Merino"; nameAr="Merinos d'Arles"; description="Race a laine fine"},
    @{speciesId="sheep"; nameFr="Ile-de-France"; nameEn="Ile-de-France"; nameAr="Ile-de-France"; description="Race bouchere"},
    @{speciesId="sheep"; nameFr="Prealpes du Sud"; nameEn="South Prealpes"; nameAr="Prealpes"; description="Race rustique de montagne"},

    # Caprins (3 races)
    @{speciesId="goat"; nameFr="Alpine"; nameEn="Alpine"; nameAr="Alpine"; description="Race laitiere chamoisee"},
    @{speciesId="goat"; nameFr="Saanen"; nameEn="Saanen"; nameAr="Saanen"; description="Race laitiere blanche"},
    @{speciesId="goat"; nameFr="Poitevine"; nameEn="Poitevine"; nameAr="Poitevine"; description="Race rustique du Poitou"}
)

$counter = 1
foreach ($breedData in $breedsData) {
    $breed = @{
        id = [guid]::NewGuid().ToString()
        speciesId = $breedData.speciesId
        nameFr = $breedData.nameFr
        nameEn = $breedData.nameEn
        nameAr = $breedData.nameAr
        description = $breedData.description
        displayOrder = $counter
        isActive = $true
    }

    $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/v1/breeds" -Body $breed
    if ($created) {
        $breedId = if ($created.id) { $created.id } else { $breed.id }
        $global:Data.Breeds += @{
            Id = $breedId
            SpeciesId = $breedData.speciesId
            Name = $breedData.nameFr
        }
        Write-Host "  [OK] $($breedData.nameFr)" -ForegroundColor Gray
    }
    $counter++
}

Write-Host "`n  -> $($global:Data.Breeds.Count) races creees`n" -ForegroundColor Green

# ============================================================================
# PHASE 2: CREER LES PRODUITS MEDICAUX
# ============================================================================

Write-Host "[2/10] Creation des produits medicaux..." -ForegroundColor Green

$productsData = @(
    # Antibiotiques
    @{nameFr="Oxytetracycline 20%"; nameEn="Oxytetracycline 20%"; nameAr="Oksitatrasikleen 20%"; category="Antibiotique"; manufacturer="Vetoquinol"; withdrawalPeriodDays=28; unit="ml"},
    @{nameFr="Penicilline G"; nameEn="Penicillin G"; nameAr="Benisilin G"; category="Antibiotique"; manufacturer="MSD"; withdrawalPeriodDays=14; unit="ml"},
    @{nameFr="Amoxicilline"; nameEn="Amoxicillin"; nameAr="Amouksisillin"; category="Antibiotique"; manufacturer="Ceva"; withdrawalPeriodDays=21; unit="ml"},

    # Antiparasitaires
    @{nameFr="Ivermectine 1%"; nameEn="Ivermectin 1%"; nameAr="Ivermektine 1%"; category="Antiparasitaire"; manufacturer="Merial"; withdrawalPeriodDays=35; unit="ml"},
    @{nameFr="Albendazole 10%"; nameEn="Albendazole 10%"; nameAr="Albendazol 10%"; category="Antiparasitaire"; manufacturer="Virbac"; withdrawalPeriodDays=14; unit="ml"},
    @{nameFr="Moxidectine 1%"; nameEn="Moxidectin 1%"; nameAr="Moksiditine 1%"; category="Antiparasitaire"; manufacturer="Zoetis"; withdrawalPeriodDays=28; unit="ml"},

    # Vitamines et supplements
    @{nameFr="Vitamine AD3E"; nameEn="Vitamin AD3E"; nameAr="Fitamin AD3E"; category="Vitamine"; manufacturer="Vetoquinol"; withdrawalPeriodDays=0; unit="ml"},
    @{nameFr="Selenium + Vitamine E"; nameEn="Selenium + Vitamin E"; nameAr="Silinyoum + Fitamin E"; category="Vitamine"; manufacturer="Ceva"; withdrawalPeriodDays=0; unit="ml"},

    # Anti-inflammatoires
    @{nameFr="Flunixine 50mg/ml"; nameEn="Flunixin 50mg/ml"; nameAr="Flouniksine 50mg/ml"; category="Anti-inflammatoire"; manufacturer="MSD"; withdrawalPeriodDays=7; unit="ml"},
    @{nameFr="Meloxicam 20mg/ml"; nameEn="Meloxicam 20mg/ml"; nameAr="Meloksikam 20mg/ml"; category="Anti-inflammatoire"; manufacturer="Boehringer"; withdrawalPeriodDays=5; unit="ml"}
)

$counter = 1
foreach ($productData in $productsData) {
    $product = @{
        id = [guid]::NewGuid().ToString()
        nameFr = $productData.nameFr
        nameEn = $productData.nameEn
        nameAr = $productData.nameAr
        category = $productData.category
        manufacturer = $productData.manufacturer
        withdrawalPeriodDays = $productData.withdrawalPeriodDays
        unit = $productData.unit
        displayOrder = $counter
        isActive = $true
    }

    $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/v1/products" -Body $product
    if ($created) {
        $productId = if ($created.id) { $created.id } else { $product.id }
        $global:Data.Products += @{
            Id = $productId
            Name = $productData.nameFr
        }
        Write-Host "  [OK] $($productData.nameFr)" -ForegroundColor Gray
    }
    $counter++
}

Write-Host "`n  -> $($global:Data.Products.Count) produits crees`n" -ForegroundColor Green

# ============================================================================
# PHASE 3: CREER LES VACCINS
# ============================================================================

Write-Host "[3/10] Creation des vaccins..." -ForegroundColor Green

$vaccinesData = @(
    @{nameFr="Enterotoxemie"; nameEn="Enterotoxemia"; nameAr="Antarotoksimiya"; disease="Enterotoxemie"; manufacturer="Merial"; type="obligatoire"; withdrawalPeriodDays=0},
    @{nameFr="Fievre Aphteuse"; nameEn="Foot-and-Mouth Disease"; nameAr="Al-Houmma Al-Qala'iya"; disease="Fievre aphteuse"; manufacturer="Ceva"; type="obligatoire"; withdrawalPeriodDays=0},
    @{nameFr="Brucellose"; nameEn="Brucellosis"; nameAr="Dawaa Al-Bourossila"; disease="Brucellose"; manufacturer="Merial"; type="obligatoire"; withdrawalPeriodDays=0},
    @{nameFr="Pasteurellose"; nameEn="Pasteurellosis"; nameAr="Bastoriloze"; disease="Pasteurellose"; manufacturer="Zoetis"; type="recommande"; withdrawalPeriodDays=0},
    @{nameFr="Charbon Symptomatique"; nameEn="Blackleg"; nameAr="Charbon"; disease="Charbon symptomatique"; manufacturer="Virbac"; type="recommande"; withdrawalPeriodDays=0},
    @{nameFr="Rage"; nameEn="Rabies"; nameAr="Dawaa Al-Kalab"; disease="Rage"; manufacturer="MSD"; type="obligatoire"; withdrawalPeriodDays=0}
)

$counter = 1
foreach ($vaccineData in $vaccinesData) {
    $vaccine = @{
        id = [guid]::NewGuid().ToString()
        nameFr = $vaccineData.nameFr
        nameEn = $vaccineData.nameEn
        nameAr = $vaccineData.nameAr
        disease = $vaccineData.disease
        manufacturer = $vaccineData.manufacturer
        type = $vaccineData.type
        withdrawalPeriodDays = $vaccineData.withdrawalPeriodDays
        displayOrder = $counter
        isActive = $true
    }

    $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/v1/vaccines" -Body $vaccine
    if ($created) {
        $vaccineId = if ($created.id) { $created.id } else { $vaccine.id }
        $global:Data.Vaccines += @{
            Id = $vaccineId
            Name = $vaccineData.nameFr
        }
        Write-Host "  [OK] $($vaccineData.nameFr)" -ForegroundColor Gray
    }
    $counter++
}

Write-Host "`n  -> $($global:Data.Vaccines.Count) vaccins crees`n" -ForegroundColor Green

# ============================================================================
# PHASE 4: CREER LA FERME
# ============================================================================

Write-Host "[4/10] Creation de la ferme..." -ForegroundColor Green

$farm = @{
    id = [guid]::NewGuid().ToString()
    name = "Ferme du Val Fleuri"
    location = "Normandie, France"
    ownerId = "00000000-0000-0000-0000-000000000001"
    cheptelNumber = "FR-14-98765"
    isDefault = $false
}

$createdFarm = Invoke-ApiCall -Method "POST" -Endpoint "/api/farms" -Body $farm
if ($createdFarm) {
    $farmId = if ($createdFarm.id) { $createdFarm.id } else { $farm.id }
    $global:Data.Farm = @{ Id = $farmId; Name = $farm.name }
    Write-Host "  [OK] $($farm.name) (ID: $farmId)`n" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Impossible de creer la ferme" -ForegroundColor Red
    exit 1
}

# ============================================================================
# PHASE 5: CREER LES ANIMAUX
# ============================================================================

Write-Host "[5/10] Creation de $TotalAnimals animaux..." -ForegroundColor Green

# Repartition: 40% moutons, 35% chevres, 25% vaches
$sheepCount = [math]::Floor($TotalAnimals * 0.4)
$goatCount = [math]::Floor($TotalAnimals * 0.35)
$cattleCount = $TotalAnimals - $sheepCount - $goatCount

Write-Host "  Repartition: $sheepCount moutons, $goatCount chevres, $cattleCount vaches" -ForegroundColor Gray

$animalCounter = 1

# Moutons
$sheepBreeds = $global:Data.Breeds | Where-Object { $_.SpeciesId -eq "sheep" }
for ($i = 1; $i -le $sheepCount; $i++) {
    $breed = $sheepBreeds | Get-Random
    $sex = if ((Get-Random -Minimum 1 -Maximum 100) -le 70) { "female" } else { "male" }

    $animal = @{
        id = [guid]::NewGuid().ToString()
        visualId = "M{0:D3}" -f $animalCounter
        speciesId = "sheep"
        breedId = $breed.Id
        sex = $sex
        birthDate = Get-RandomDate -MinDaysAgo 180 -MaxDaysAgo 2555
    }

    $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/animals" -Body $animal
    if ($created) {
        $global:Data.Animals += $created
        $animalCounter++
    }
}

# Chevres
$goatBreeds = $global:Data.Breeds | Where-Object { $_.SpeciesId -eq "goat" }
for ($i = 1; $i -le $goatCount; $i++) {
    $breed = $goatBreeds | Get-Random
    $sex = if ((Get-Random -Minimum 1 -Maximum 100) -le 70) { "female" } else { "male" }

    $animal = @{
        id = [guid]::NewGuid().ToString()
        visualId = "C{0:D3}" -f $animalCounter
        speciesId = "goat"
        breedId = $breed.Id
        sex = $sex
        birthDate = Get-RandomDate -MinDaysAgo 180 -MaxDaysAgo 2555
    }

    $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/animals" -Body $animal
    if ($created) {
        $global:Data.Animals += $created
        $animalCounter++
    }
}

# Vaches
$cattleBreeds = $global:Data.Breeds | Where-Object { $_.SpeciesId -eq "cattle" }
for ($i = 1; $i -le $cattleCount; $i++) {
    $breed = $cattleBreeds | Get-Random
    $sex = if ((Get-Random -Minimum 1 -Maximum 100) -le 70) { "female" } else { "male" }

    $animal = @{
        id = [guid]::NewGuid().ToString()
        visualId = "V{0:D3}" -f $animalCounter
        speciesId = "cattle"
        breedId = $breed.Id
        sex = $sex
        birthDate = Get-RandomDate -MinDaysAgo 365 -MaxDaysAgo 2920
    }

    $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/animals" -Body $animal
    if ($created) {
        $global:Data.Animals += $created
        $animalCounter++
    }
}

Write-Host "`n  -> $($global:Data.Animals.Count) animaux crees`n" -ForegroundColor Green

# ============================================================================
# PHASE 6: CREER LES LOTS
# ============================================================================

Write-Host "[6/10] Creation des lots..." -ForegroundColor Green

if ($global:Data.Animals.Count -ge 3) {
    $lotsData = @(
        @{name="Lot Engraissement Hiver"; nameFr="Lot Engraissement Hiver"; nameEn="Winter Fattening Batch"; nameAr="Majmou'at Al-Tasmin Al-Shita'i"; type="fattening"; status="open"},
        @{name="Lot Reproduction Printemps"; nameFr="Lot Reproduction Printemps"; nameEn="Spring Breeding Batch"; nameAr="Majmou'at Al-Takathur Al-Rabi'i"; type="breeding"; status="open"},
        @{name="Lot Agnelage 2025"; nameFr="Lot Agnelage 2025"; nameEn="Lambing Batch 2025"; nameAr="Majmou'at Al-Wilada 2025"; type="breeding"; status="open"}
    )

    $counter = 0
    foreach ($lotData in $lotsData) {
        if ($counter -ge 10) { break }

        # Prendre 2-3 animaux aléatoires
        $lotAnimals = $global:Data.Animals | Get-Random -Count ([math]::Min(3, $global:Data.Animals.Count))
        $animalIds = $lotAnimals | ForEach-Object { if ($_.id) { $_.id } else { $_.data.id } }

        $lot = @{
            id = [guid]::NewGuid().ToString()
            name = $lotData.name
            type = $lotData.type
            status = $lotData.status
            animalIds = @($animalIds)
            notes = "Cree automatiquement"
        }

        $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/lots" -Body $lot
        if ($created) {
            $lotId = if ($created.id) { $created.id } elseif ($created.data.id) { $created.data.id } else { $lot.id }
            $global:Data.Lots += @{
                Id = $lotId
                Name = $lotData.name
            }
            Write-Host "  [OK] $($lotData.name)" -ForegroundColor Gray
        }
        $counter++
    }
}

Write-Host "`n  -> $($global:Data.Lots.Count) lots crees`n" -ForegroundColor Green

# ============================================================================
# PHASE 7: CREER LES VACCINATIONS
# ============================================================================

Write-Host "[7/10] Creation des vaccinations..." -ForegroundColor Green

if ($global:Data.Animals.Count -gt 0 -and $global:Data.Vaccines.Count -gt 0) {
    $counter = 0
    foreach ($animal in $global:Data.Animals) {
        if ($counter -ge 10) { break }

        $animalId = if ($animal.id) { $animal.id } elseif ($animal.data.id) { $animal.data.id } else { $null }
        if (-not $animalId) { continue }

        $vaccine = $global:Data.Vaccines | Get-Random
        $daysAgo = Get-Random -Minimum 30 -Maximum 365
        $vaccinationDate = (Get-Date).AddDays(-$daysAgo).ToString("yyyy-MM-ddT10:00:00Z")
        $nextDueDate = (Get-Date).AddDays(-$daysAgo + 365).ToString("yyyy-MM-ddT10:00:00Z")

        $vaccination = @{
            id = [guid]::NewGuid().ToString()
            animalId = $animalId
            vaccineName = $vaccine.Name
            type = "obligatoire"
            disease = $vaccine.Name
            vaccinationDate = $vaccinationDate
            nextDueDate = $nextDueDate
            dose = "2ml"
            administrationRoute = "Sous-cutanee"
            withdrawalPeriodDays = 0
            batchNumber = "BATCH-2025-$(Get-Random -Minimum 100 -Maximum 999)"
        }

        $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/vaccinations" -Body $vaccination
        if ($created) {
            $global:Data.Vaccinations += $created
            Write-Host "  [OK] Vaccination $($vaccine.Name) pour animal $animalId" -ForegroundColor Gray
        }
        $counter++
    }
}

Write-Host "`n  -> $($global:Data.Vaccinations.Count) vaccinations creees`n" -ForegroundColor Green

# ============================================================================
# PHASE 8: CREER LES TRAITEMENTS
# ============================================================================

Write-Host "[8/10] Creation des traitements medicaux..." -ForegroundColor Green

if ($global:Data.Animals.Count -gt 0 -and $global:Data.Products.Count -gt 0) {
    $counter = 0
    foreach ($animal in $global:Data.Animals) {
        if ($counter -ge 10) { break }

        $animalId = if ($animal.id) { $animal.id } elseif ($animal.data.id) { $animal.data.id } else { $null }
        if (-not $animalId) { continue }

        $product = $global:Data.Products | Get-Random
        $daysAgo = Get-Random -Minimum 7 -Maximum 180
        $treatmentDate = (Get-Date).AddDays(-$daysAgo).ToString("yyyy-MM-ddT10:00:00Z")
        $withdrawalEndDate = (Get-Date).AddDays(-$daysAgo + 28).ToString("yyyy-MM-ddT10:00:00Z")

        $treatment = @{
            id = [guid]::NewGuid().ToString()
            animalId = $animalId
            productId = $product.Id
            productName = $product.Name
            dose = [math]::Round((Get-Random -Minimum 5 -Maximum 20) + (Get-Random) * 0.9, 1)
            treatmentDate = $treatmentDate
            withdrawalEndDate = $withdrawalEndDate
            notes = "Traitement preventif"
        }

        $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/treatments" -Body $treatment
        if ($created) {
            $global:Data.Treatments += $created
            Write-Host "  [OK] Traitement $($product.Name) pour animal $animalId" -ForegroundColor Gray
        }
        $counter++
    }
}

Write-Host "`n  -> $($global:Data.Treatments.Count) traitements crees`n" -ForegroundColor Green

# ============================================================================
# PHASE 9: CREER LES PESEES
# ============================================================================

Write-Host "[9/10] Creation des pesees..." -ForegroundColor Green

if ($global:Data.Animals.Count -gt 0) {
    $counter = 0
    foreach ($animal in $global:Data.Animals) {
        if ($counter -ge 10) { break }

        $animalId = if ($animal.id) { $animal.id } elseif ($animal.data.id) { $animal.data.id } else { $null }
        if (-not $animalId) { continue }

        # Déterminer le poids selon l'espèce
        $speciesId = if ($animal.speciesId) { $animal.speciesId } else { "sheep" }
        $baseWeight = switch ($speciesId) {
            "cattle" { Get-Random -Minimum 350 -Maximum 650 }
            "sheep" { Get-Random -Minimum 40 -Maximum 80 }
            "goat" { Get-Random -Minimum 30 -Maximum 60 }
            default { Get-Random -Minimum 40 -Maximum 80 }
        }

        $daysAgo = Get-Random -Minimum 1 -Maximum 90
        $weightDate = (Get-Date).AddDays(-$daysAgo).ToString("yyyy-MM-ddT10:00:00Z")

        $weight = @{
            id = [guid]::NewGuid().ToString()
            animalId = $animalId
            weight = [math]::Round($baseWeight + (Get-Random) * 10, 1)
            weightDate = $weightDate
            source = "scale"
            notes = "Pesee de routine"
        }

        $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/weights" -Body $weight
        if ($created) {
            $global:Data.Weights += $created
            Write-Host "  [OK] Pesee $($weight.weight)kg pour animal $animalId" -ForegroundColor Gray
        }
        $counter++
    }
}

Write-Host "`n  -> $($global:Data.Weights.Count) pesees creees`n" -ForegroundColor Green

# ============================================================================
# PHASE 10: CREER LES MOUVEMENTS
# ============================================================================

Write-Host "[10/10] Creation des mouvements..." -ForegroundColor Green

if ($global:Data.Animals.Count -ge 2) {
    $movementsData = @(
        @{type="purchase"; buyerSellerName="Ferme Dupont"; price=1500; desc="Achat de reproducteurs"},
        @{type="sale"; buyerSellerName="Cooperative Agricole"; price=2200; desc="Vente d'agneaux"},
        @{type="death"; buyerSellerName=""; price=0; desc="Mort naturelle"}
    )

    $counter = 0
    foreach ($movementData in $movementsData) {
        if ($counter -ge 10) { break }
        if ($global:Data.Animals.Count -eq 0) { break }

        # Prendre 1-2 animaux aléatoires
        $movementAnimals = $global:Data.Animals | Get-Random -Count ([math]::Min(2, $global:Data.Animals.Count))
        $animalIds = $movementAnimals | ForEach-Object { if ($_.id) { $_.id } elseif ($_.data.id) { $_.data.id } else { $null } } | Where-Object { $_ -ne $null }

        if ($animalIds.Count -eq 0) { continue }

        $daysAgo = Get-Random -Minimum 7 -Maximum 180
        $movementDate = (Get-Date).AddDays(-$daysAgo).ToString("yyyy-MM-ddT10:00:00Z")

        $movement = @{
            id = [guid]::NewGuid().ToString()
            movementType = $movementData.type
            movementDate = $movementDate
            animalIds = @($animalIds)
            notes = $movementData.desc
        }

        # Ajouter les champs spécifiques selon le type
        switch ($movementData.type) {
            "purchase" {
                $movement.sellerName = $movementData.buyerSellerName
                $movement.purchasePrice = $movementData.price
            }
            "sale" {
                $movement.buyerName = $movementData.buyerSellerName
                $movement.buyerType = "cooperative"
                $movement.salePrice = $movementData.price
            }
        }

        $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/movements" -Body $movement
        if ($created) {
            $global:Data.Movements += $created
            Write-Host "  [OK] Mouvement $($movementData.type) - $($movementData.desc)" -ForegroundColor Gray
        }
        $counter++
    }
}

Write-Host "`n  -> $($global:Data.Movements.Count) mouvements crees`n" -ForegroundColor Green

# ============================================================================
# RESUME
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "                  INITIALISATION TERMINEE" -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Green

Write-Host "=== DONNEES DE REFERENCE ===" -ForegroundColor Yellow

Write-Host "`n[RACES]" -ForegroundColor Cyan
Write-Host "  - Total: $($global:Data.Breeds.Count)" -ForegroundColor White

Write-Host "`n[PRODUITS MEDICAUX]" -ForegroundColor Cyan
Write-Host "  - Total: $($global:Data.Products.Count)" -ForegroundColor White

Write-Host "`n[VACCINS]" -ForegroundColor Cyan
Write-Host "  - Total: $($global:Data.Vaccines.Count)" -ForegroundColor White

Write-Host "`n`n=== DONNEES TRANSACTIONNELLES ===" -ForegroundColor Yellow

Write-Host "`n[FERME]" -ForegroundColor Cyan
Write-Host "  - Nom: $($global:Data.Farm.Name)" -ForegroundColor White
Write-Host "  - ID: $($global:Data.Farm.Id)" -ForegroundColor White

Write-Host "`n[ANIMAUX]" -ForegroundColor Cyan
Write-Host "  - Total: $($global:Data.Animals.Count)" -ForegroundColor White
$sheepTotal = ($global:Data.Animals | Where-Object { $_.speciesId -eq "sheep" }).Count
$goatTotal = ($global:Data.Animals | Where-Object { $_.speciesId -eq "goat" }).Count
$cattleTotal = ($global:Data.Animals | Where-Object { $_.speciesId -eq "cattle" }).Count
Write-Host "  - Moutons: $sheepTotal" -ForegroundColor White
Write-Host "  - Chevres: $goatTotal" -ForegroundColor White
Write-Host "  - Vaches: $cattleTotal" -ForegroundColor White

Write-Host "`n[LOTS]" -ForegroundColor Cyan
Write-Host "  - Total: $($global:Data.Lots.Count)" -ForegroundColor White

Write-Host "`n[VACCINATIONS]" -ForegroundColor Cyan
Write-Host "  - Total: $($global:Data.Vaccinations.Count)" -ForegroundColor White

Write-Host "`n[TRAITEMENTS]" -ForegroundColor Cyan
Write-Host "  - Total: $($global:Data.Treatments.Count)" -ForegroundColor White

Write-Host "`n[PESEES]" -ForegroundColor Cyan
Write-Host "  - Total: $($global:Data.Weights.Count)" -ForegroundColor White

Write-Host "`n[MOUVEMENTS]" -ForegroundColor Cyan
Write-Host "  - Total: $($global:Data.Movements.Count)" -ForegroundColor White

Write-Host "`n============================================================" -ForegroundColor Green
$totalEntities = $global:Data.Breeds.Count + $global:Data.Products.Count + $global:Data.Vaccines.Count + $global:Data.Animals.Count + $global:Data.Lots.Count + $global:Data.Vaccinations.Count + $global:Data.Treatments.Count + $global:Data.Weights.Count + $global:Data.Movements.Count + 1
Write-Host "[SUCCESS] $totalEntities entites creees avec succes !`n" -ForegroundColor Green
