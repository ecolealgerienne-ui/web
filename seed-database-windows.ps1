# Script d'initialisation de la base de donnees avec des donnees de test realistes
# Cree 3 fermes algeriennes avec 50 animaux chacune (vaches, moutons, chevres)
# Architecture multi-tenant: /farms/{farmId}/resource

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = "test-token"
)

# Configuration
$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
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
# PHASE 1: NETTOYAGE - Supprimer toutes les fermes existantes
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Red
Write-Host "         NETTOYAGE DE LA BASE DE DONNEES                   " -ForegroundColor Red
Write-Host "============================================================`n" -ForegroundColor Red

Write-Host "[WARNING] Cette operation va supprimer toutes les donnees existantes..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Recuperer toutes les fermes existantes
Write-Host "[DELETE] Recuperation des fermes existantes..." -ForegroundColor Yellow
$existingFarms = Invoke-ApiCall -Method "GET" -Endpoint "/farms"

if ($existingFarms) {
    $farmsList = if ($existingFarms.data) { $existingFarms.data } else { $existingFarms }

    foreach ($farm in $farmsList) {
        Write-Host "[DELETE] Suppression de la ferme: $($farm.name) ($($farm.id))" -ForegroundColor Yellow
        Invoke-ApiCall -Method "DELETE" -Endpoint "/farms/$($farm.id)" | Out-Null
    }
    Write-Host "[SUCCESS] Fermes supprimees !`n" -ForegroundColor Green
} else {
    Write-Host "[INFO] Aucune ferme a supprimer`n" -ForegroundColor Gray
}

# ============================================================================
# PHASE 2: CREATION DES 3 FERMES
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
    Write-Host "[CREATE] Creation de $($farmData.name)..." -ForegroundColor Green

    $farm = Invoke-ApiCall -Method "POST" -Endpoint "/farms" -Body $farmData

    if ($farm) {
        Write-Host "   [OK] Ferme creee (ID: $($farm.id))" -ForegroundColor Gray

        # Ajouter a la liste des fermes creees
        $global:CreatedFarms += @{
            Farm = $farm
            Species = @()
            Breeds = @()
            Products = @()
            Vaccines = @()
            Vets = @()
            Animals = @()
            Lots = @()
        }
    }
}

Write-Host "`n[SUCCESS] $($global:CreatedFarms.Count) fermes creees !`n" -ForegroundColor Green

# ============================================================================
# PHASE 3: CREATION DES DONNEES POUR CHAQUE FERME
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "         CREATION DES DONNEES PAR FERME                     " -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# Configuration du nombre d'animaux par ferme
$farmConfigs = @(
    @{Index=0; SheepCount=30; GoatCount=10; CattleCount=10},
    @{Index=1; SheepCount=10; GoatCount=10; CattleCount=30},
    @{Index=2; SheepCount=10; GoatCount=30; CattleCount=10}
)

foreach ($config in $farmConfigs) {
    $farmContext = $global:CreatedFarms[$config.Index]
    $farm = $farmContext.Farm
    $farmId = $farm.id

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "FERME: $($farm.name)" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan

    # --- ESPECES ---
    Write-Host "[CREATE] Creation des especes..." -ForegroundColor Green

    $speciesData = @(
        @{name="Bovin"; name_en="Cattle"; name_ar="Abqar"; description="Bovins d'elevage"},
        @{name="Ovin"; name_en="Sheep"; name_ar="Aghnam"; description="Ovins d'elevage"},
        @{name="Caprin"; name_en="Goat"; name_ar="Ma'iz"; description="Caprins d'elevage"}
    )

    foreach ($species in $speciesData) {
        $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/species" -Body $species
        if ($created) {
            $farmContext.Species += $created
            Write-Host "   [OK] $($species.name)" -ForegroundColor Gray
        }
    }

    # Recuperer les IDs des especes
    $bovineId = ($farmContext.Species | Where-Object { $_.name_en -eq "Cattle" }).id
    $ovineId = ($farmContext.Species | Where-Object { $_.name_en -eq "Sheep" }).id
    $caprineId = ($farmContext.Species | Where-Object { $_.name_en -eq "Goat" }).id

    # --- RACES ---
    Write-Host "`n[CREATE] Creation des races algeriennes..." -ForegroundColor Green

    $breedsData = @(
        # Bovins
        @{name="Brune de l'Atlas"; name_en="Atlas Brown"; name_ar="Boniya Al-Atlas"; speciesId=$bovineId; description="Race rustique des montagnes"},
        @{name="Guelmoise"; name_en="Guelmoise"; name_ar="Al-Qalmiya"; speciesId=$bovineId; description="Race laitiere de l'Est algerien"},
        @{name="Cheurfa"; name_en="Cheurfa"; name_ar="Al-Sharfa"; speciesId=$bovineId; description="Race locale de l'Ouest"},

        # Ovins
        @{name="Ouled Djellal"; name_en="Ouled Djellal"; name_ar="Awlad Djallal"; speciesId=$ovineId; description="Race ovine la plus repandue en Algerie"},
        @{name="Rembi"; name_en="Rembi"; name_ar="Al-Rambi"; speciesId=$ovineId; description="Race de l'Ouest algerien"},
        @{name="D'Man"; name_en="D'Man"; name_ar="Daman"; speciesId=$ovineId; description="Race prolifique du Sahara"},
        @{name="Barbarine"; name_en="Barbarine"; name_ar="Al-Barbariya"; speciesId=$ovineId; description="Race a queue grasse"},

        # Caprins
        @{name="Arabia"; name_en="Arabia"; name_ar="Al-Arabiya"; speciesId=$caprineId; description="Race caprine laitiere"},
        @{name="Kabyle"; name_en="Kabyle"; name_ar="Al-Qaba'iliya"; speciesId=$caprineId; description="Chevre de Kabylie"},
        @{name="M'Zabite"; name_en="M'Zabite"; name_ar="Al-Mozabiya"; speciesId=$caprineId; description="Race du M'Zab"},
        @{name="Naine de Kabylie"; name_en="Kabyle Dwarf"; name_ar="Al-Qaba'iliya Al-Qazma"; speciesId=$caprineId; description="Petite race locale"}
    )

    foreach ($breed in $breedsData) {
        $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/breeds" -Body $breed
        if ($created) {
            $farmContext.Breeds += $created
            Write-Host "   [OK] $($breed.name)" -ForegroundColor Gray
        }
    }

    # --- PRODUITS MEDICAUX ---
    Write-Host "`n[CREATE] Creation des produits medicaux..." -ForegroundColor Green

    $productsData = @(
        # Antibiotiques
        @{name="Oxytetracycline 20%"; name_en="Oxytetracycline 20%"; category="Antibiotique"; manufacturer="SAIDAL"; withdrawalPeriodDays=28; unit="ml"},
        @{name="Penicilline G"; name_en="Penicillin G"; category="Antibiotique"; manufacturer="SAIDAL"; withdrawalPeriodDays=14; unit="ml"},
        @{name="Enrofloxacine 10%"; name_en="Enrofloxacin 10%"; category="Antibiotique"; manufacturer="Biopharm"; withdrawalPeriodDays=21; unit="ml"},

        # Antiparasitaires
        @{name="Ivermectine 1%"; name_en="Ivermectin 1%"; category="Antiparasitaire"; manufacturer="Biopharm"; withdrawalPeriodDays=35; unit="ml"},
        @{name="Albendazole 10%"; name_en="Albendazole 10%"; category="Antiparasitaire"; manufacturer="SAIDAL"; withdrawalPeriodDays=14; unit="ml"},

        # Vitamines
        @{name="Vitamine AD3E"; name_en="Vitamin AD3E"; category="Vitamine"; manufacturer="SAIDAL"; withdrawalPeriodDays=0; unit="ml"},
        @{name="Calcium Borogluconate"; name_en="Calcium Borogluconate"; category="Mineral"; manufacturer="SAIDAL"; withdrawalPeriodDays=0; unit="ml"}
    )

    foreach ($product in $productsData) {
        $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/products" -Body $product
        if ($created) {
            $farmContext.Products += $created
            Write-Host "   [OK] $($product.name)" -ForegroundColor Gray
        }
    }

    # --- VACCINS ---
    Write-Host "`n[CREATE] Creation des vaccins..." -ForegroundColor Green

    $vaccinesData = @(
        @{name="Enterotoxemie"; name_en="Enterotoxemia"; disease="Enterotoxemie"; manufacturer="Institut Pasteur"; type="obligatoire"; withdrawalPeriodDays=0},
        @{name="Fievre Aphteuse"; name_en="Foot-and-Mouth Disease"; disease="Fievre aphteuse"; manufacturer="SAIDAL"; type="obligatoire"; withdrawalPeriodDays=0},
        @{name="Brucellose"; name_en="Brucellosis"; disease="Brucellose"; manufacturer="Institut Pasteur"; type="obligatoire"; withdrawalPeriodDays=0}
    )

    foreach ($vaccine in $vaccinesData) {
        $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/vaccines" -Body $vaccine
        if ($created) {
            $farmContext.Vaccines += $created
            Write-Host "   [OK] $($vaccine.name)" -ForegroundColor Gray
        }
    }

    # --- VETERINAIRES ---
    Write-Host "`n[CREATE] Creation des veterinaires..." -ForegroundColor Green

    $vetsData = @(
        @{
            firstName="Ahmed"; lastName="Benali"
            phone="+213550123456"; email="a.benali@vetalgeria.dz"
            licenseNumber="VET-ALG-001234"; specialization="Grands animaux"
        },
        @{
            firstName="Fatima"; lastName="Khelifa"
            phone="+213551234567"; email="f.khelifa@vetalgeria.dz"
            licenseNumber="VET-ALG-002345"; specialization="Reproduction"
        }
    )

    foreach ($vet in $vetsData) {
        $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/veterinarians" -Body $vet
        if ($created) {
            $farmContext.Vets += $created
            Write-Host "   [OK] Dr. $($vet.firstName) $($vet.lastName)" -ForegroundColor Gray
        }
    }

    # --- ANIMAUX ---
    Write-Host "`n[CREATE] Creation des animaux ($($config.SheepCount + $config.GoatCount + $config.CattleCount) total)..." -ForegroundColor Green

    $animalCounter = 1

    # Ovins
    if ($config.SheepCount -gt 0) {
        Write-Host "  [CREATE] $($config.SheepCount) moutons..." -ForegroundColor Green
        $sheepBreeds = $farmContext.Breeds | Where-Object { $_.name -in @("Ouled Djellal", "Rembi", "D'Man", "Barbarine") }

        for ($i = 1; $i -le $config.SheepCount; $i++) {
            $sex = if ((Get-Random -Minimum 1 -Maximum 100) -le 80) { "female" } else { "male" }
            $breed = $sheepBreeds | Get-Random

            $animal = @{
                id = New-Guid
                farmId = $farmId
                eid = "250{0:D12}" -f (Get-Random -Minimum 100000000000 -Maximum 999999999999)
                officialNumber = "DZ-OV-{0:D6}" -f $animalCounter
                visualId = "M{0:D3}" -f $i
                birthDate = Get-RandomDate -MinDaysAgo 180 -MaxDaysAgo 2555
                sex = $sex
                speciesId = $ovineId
                breedId = $breed.id
                status = if ((Get-Random -Minimum 1 -Maximum 100) -le 95) { "alive" } else { @("sold", "dead") | Get-Random }
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
        $goatBreeds = $farmContext.Breeds | Where-Object { $_.name -in @("Arabia", "Kabyle", "M'Zabite", "Naine de Kabylie") }

        for ($i = 1; $i -le $config.GoatCount; $i++) {
            $sex = if ((Get-Random -Minimum 1 -Maximum 100) -le 80) { "female" } else { "male" }
            $breed = $goatBreeds | Get-Random

            $animal = @{
                id = New-Guid
                farmId = $farmId
                eid = "250{0:D12}" -f (Get-Random -Minimum 100000000000 -Maximum 999999999999)
                officialNumber = "DZ-CP-{0:D6}" -f $animalCounter
                visualId = "C{0:D3}" -f $i
                birthDate = Get-RandomDate -MinDaysAgo 180 -MaxDaysAgo 2555
                sex = $sex
                speciesId = $caprineId
                breedId = $breed.id
                status = if ((Get-Random -Minimum 1 -Maximum 100) -le 95) { "alive" } else { @("sold", "dead") | Get-Random }
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
        $cattleBreeds = $farmContext.Breeds | Where-Object { $_.name -in @("Brune de l'Atlas", "Guelmoise", "Cheurfa") }

        for ($i = 1; $i -le $config.CattleCount; $i++) {
            $sex = if ((Get-Random -Minimum 1 -Maximum 100) -le 80) { "female" } else { "male" }
            $breed = $cattleBreeds | Get-Random

            $animal = @{
                id = New-Guid
                farmId = $farmId
                eid = "250{0:D12}" -f (Get-Random -Minimum 100000000000 -Maximum 999999999999)
                officialNumber = "DZ-BV-{0:D6}" -f $animalCounter
                visualId = "V{0:D3}" -f $i
                birthDate = Get-RandomDate -MinDaysAgo 365 -MaxDaysAgo 2920
                sex = $sex
                speciesId = $bovineId
                breedId = $breed.id
                status = if ((Get-Random -Minimum 1 -Maximum 100) -le 95) { "alive" } else { @("sold", "dead") | Get-Random }
            }

            $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/animals" -Body $animal
            if ($created) {
                $farmContext.Animals += $created
                $animalCounter++
            }
        }
    }

    Write-Host "  [OK] $($farmContext.Animals.Count) animaux crees" -ForegroundColor Gray

    # --- LOTS ---
    Write-Host "`n[CREATE] Creation des lots..." -ForegroundColor Green

    $males = $farmContext.Animals | Where-Object { $_.sex -eq "male" }
    if ($males.Count -gt 0) {
        $lot = @{
            name = "Reproducteurs - $($farm.name)"
            farmId = $farmId
            description = "Males reproducteurs"
            animalIds = @($males.id)
        }
        $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/lots" -Body $lot
        if ($created) {
            $farmContext.Lots += $created
            Write-Host "   [OK] Lot males cree" -ForegroundColor Gray
        }
    }

    $females = $farmContext.Animals | Where-Object { $_.sex -eq "female" }
    if ($females.Count -gt 0) {
        $lot = @{
            name = "Femelles reproductrices - $($farm.name)"
            farmId = $farmId
            description = "Femelles en production"
            animalIds = @($females.id)
        }
        $created = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/lots" -Body $lot
        if ($created) {
            $farmContext.Lots += $created
            Write-Host "   [OK] Lot femelles cree" -ForegroundColor Gray
        }
    }

    # --- POIDS ---
    Write-Host "`n[CREATE] Creation des poids..." -ForegroundColor Green

    $weightCount = 0
    foreach ($animal in $farmContext.Animals) {
        $species = $farmContext.Species | Where-Object { $_.id -eq $animal.speciesId }

        $baseWeight = switch ($species.name_en) {
            "Cattle" { Get-Random -Minimum 350 -Maximum 550 }
            "Sheep" { Get-Random -Minimum 45 -Maximum 75 }
            "Goat" { Get-Random -Minimum 35 -Maximum 55 }
            default { 50 }
        }

        # 2-3 pesees par animal
        $numWeights = Get-Random -Minimum 2 -Maximum 4
        for ($w = $numWeights; $w -ge 1; $w--) {
            $weight = @{
                animalId = $animal.id
                weight = [math]::Round($baseWeight - ($w * (Get-Random -Minimum 5 -Maximum 15)), 1)
                weightDate = Get-RandomPastDate -DaysAgo (30 * $w)
                notes = "Pesee de routine"
            }

            Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/weights" -Body $weight | Out-Null
            $weightCount++
        }
    }

    Write-Host "   [OK] $weightCount pesees creees" -ForegroundColor Gray

    # --- TRAITEMENTS ---
    Write-Host "`n[CREATE] Creation des traitements..." -ForegroundColor Green

    $antiparasiticProducts = $farmContext.Products | Where-Object { $_.category -eq "Antiparasitaire" }
    if ($antiparasiticProducts.Count -gt 0) {
        $product = $antiparasiticProducts | Get-Random
        $treatmentDate = Get-RandomPastDate -DaysAgo 60
        $treatmentCount = 0

        foreach ($animal in ($farmContext.Animals | Where-Object { $_.status -eq "alive" })) {
            $treatment = @{
                animalId = $animal.id
                productId = $product.id
                productName = $product.name
                dose = [math]::Round((Get-Random -Minimum 1 -Maximum 5), 1)
                unit = "ml"
                treatmentDate = $treatmentDate
                withdrawalEndDate = (Get-Date $treatmentDate).AddDays($product.withdrawalPeriodDays).ToString("yyyy-MM-dd")
                administrationRoute = "sous-cutanee"
                reason = "Deparasitage preventif"
                status = "completed"
            }

            Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/treatments" -Body $treatment | Out-Null
            $treatmentCount++
        }

        Write-Host "   [OK] $treatmentCount traitements crees" -ForegroundColor Gray
    }

    # --- VACCINATIONS ---
    Write-Host "`n[CREATE] Creation des vaccinations..." -ForegroundColor Green

    $vaccinationCount = 0
    $selectedVaccines = $farmContext.Vaccines | Get-Random -Count ([math]::Min(2, $farmContext.Vaccines.Count))

    foreach ($vaccine in $selectedVaccines) {
        $vaccinationDate = Get-RandomPastDate -DaysAgo 90

        foreach ($animal in ($farmContext.Animals | Where-Object { $_.status -eq "alive" })) {
            $vaccination = @{
                animalId = $animal.id
                vaccineId = $vaccine.id
                vaccineName = $vaccine.name
                disease = $vaccine.disease
                vaccinationDate = $vaccinationDate
                dose = "1"
                unit = "dose"
                administrationRoute = "intramusculaire"
                batchNumber = "LOT-2024-{0:D4}" -f (Get-Random -Minimum 1000 -Maximum 9999)
                expiryDate = (Get-Date).AddYears(2).ToString("yyyy-MM-dd")
                type = $vaccine.type
                withdrawalPeriodDays = 0
            }

            Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/vaccinations" -Body $vaccination | Out-Null
            $vaccinationCount++
        }
    }

    Write-Host "   [OK] $vaccinationCount vaccinations creees" -ForegroundColor Gray

    Write-Host "`n[SUCCESS] Ferme $($farm.name) completee !" -ForegroundColor Green
}

# ============================================================================
# RESUME FINAL
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "                    RESUME FINAL                            " -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Green

Write-Host "[SUCCESS] Base de donnees initialisee avec succes !`n" -ForegroundColor Green

$totalAnimals = 0
$totalSpecies = 0
$totalBreeds = 0
$totalProducts = 0
$totalVaccines = 0

foreach ($farmContext in $global:CreatedFarms) {
    $farm = $farmContext.Farm
    Write-Host "`n[FARM] $($farm.name):" -ForegroundColor Cyan
    Write-Host "   - Animaux: $($farmContext.Animals.Count)" -ForegroundColor White
    Write-Host "   - Especes: $($farmContext.Species.Count)" -ForegroundColor White
    Write-Host "   - Races: $($farmContext.Breeds.Count)" -ForegroundColor White
    Write-Host "   - Produits medicaux: $($farmContext.Products.Count)" -ForegroundColor White
    Write-Host "   - Vaccins: $($farmContext.Vaccines.Count)" -ForegroundColor White
    Write-Host "   - Lots: $($farmContext.Lots.Count)" -ForegroundColor White

    $totalAnimals += $farmContext.Animals.Count
    $totalSpecies += $farmContext.Species.Count
    $totalBreeds += $farmContext.Breeds.Count
    $totalProducts += $farmContext.Products.Count
    $totalVaccines += $farmContext.Vaccines.Count
}

Write-Host "`n[STATS] TOTAUX:" -ForegroundColor Cyan
Write-Host "   - Fermes: $($global:CreatedFarms.Count)" -ForegroundColor White
Write-Host "   - Animaux: $totalAnimals" -ForegroundColor White
Write-Host "   - Especes: $totalSpecies" -ForegroundColor White
Write-Host "   - Races: $totalBreeds" -ForegroundColor White
Write-Host "   - Produits medicaux: $totalProducts" -ForegroundColor White
Write-Host "   - Vaccins: $totalVaccines" -ForegroundColor White

Write-Host "`n[SUCCESS] La base de donnees est prete pour les tests !`n" -ForegroundColor Green
