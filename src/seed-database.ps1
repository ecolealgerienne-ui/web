# Script d'initialisation de la base de donnees avec des donnees de test realistes
# Cree 3 fermes algeriennes avec 50 animaux chacune (vaches, moutons, chevres)

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = "test-token"
)

# Configuration
$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

$global:CreatedIds = @{
    Farms = @()
    Species = @()
    Breeds = @()
    Products = @()
    Vaccines = @()
    Vets = @()
    Animals = @()
    Lots = @()
}

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
# PHASE 1: NETTOYAGE DE LA BASE DE DONNEES
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Red
Write-Host "         NETTOYAGE DE LA BASE DE DONNEES                   " -ForegroundColor Red
Write-Host "============================================================`n" -ForegroundColor Red

Write-Host "[WARNING] Cette operation va supprimer toutes les donnees existantes..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Note: L'ordre de suppression est important (dependances)
$entitiesToClean = @(
    @{Name="Documents"; Endpoint="/api/documents"},
    @{Name="Breedings"; Endpoint="/api/breedings"},
    @{Name="Weights"; Endpoint="/api/weights"},
    @{Name="Movements"; Endpoint="/api/movements"},
    @{Name="Vaccinations"; Endpoint="/api/vaccinations"},
    @{Name="Treatments"; Endpoint="/api/treatments"},
    @{Name="Lots"; Endpoint="/api/lots"},
    @{Name="Animals"; Endpoint="/api/animals"},
    @{Name="Campaigns"; Endpoint="/api/campaigns"},
    @{Name="Vaccines"; Endpoint="/api/vaccines"},
    @{Name="Products"; Endpoint="/api/products"},
    @{Name="Veterinarians"; Endpoint="/api/veterinarians"},
    @{Name="Breeds"; Endpoint="/api/breeds"},
    @{Name="Species"; Endpoint="/api/species"},
    @{Name="Farms"; Endpoint="/api/farms"}
)

foreach ($entity in $entitiesToClean) {
    Write-Host "[DELETE] Suppression des $($entity.Name)..." -ForegroundColor Yellow

    # Recuperer tous les elements
    $items = Invoke-ApiCall -Method "GET" -Endpoint $entity.Endpoint

    if ($items -and $items.data) {
        $count = 0
        foreach ($item in $items.data) {
            $deleteResult = Invoke-ApiCall -Method "DELETE" -Endpoint "$($entity.Endpoint)/$($item.id)"
            if ($deleteResult) { $count++ }
        }
        Write-Host "   [OK] $count $($entity.Name) supprime(s)" -ForegroundColor Gray
    } elseif ($items -and $items.PSObject.Properties.Name -contains 'id') {
        # Si c'est un tableau direct
        foreach ($item in $items) {
            Invoke-ApiCall -Method "DELETE" -Endpoint "$($entity.Endpoint)/$($item.id)" | Out-Null
        }
    }
}

Write-Host "[SUCCESS] Base de donnees nettoyee !`n" -ForegroundColor Green

# ============================================================================
# PHASE 2: CREATION DES DONNEES DE REFERENCE
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "         CREATION DES DONNEES DE REFERENCE                 " -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# --- ESPECES ---
Write-Host "[CREATE] Creation des especes..." -ForegroundColor Green

$speciesData = @(
    @{name="Bovin"; name_en="Cattle"; name_ar="Abqar"; description="Bovins d'elevage"},
    @{name="Ovin"; name_en="Sheep"; name_ar="Aghnam"; description="Ovins d'elevage"},
    @{name="Caprin"; name_en="Goat"; name_ar="Ma'iz"; description="Caprins d'elevage"}
)

foreach ($species in $speciesData) {
    $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/species" -Body $species
    if ($created) {
        $global:CreatedIds.Species += $created
        Write-Host "   [OK] $($species.name)" -ForegroundColor Gray
    }
}

# --- RACES ---
Write-Host "`n[CREATE] Creation des races algeriennes..." -ForegroundColor Green

# Recuperer les IDs des especes creees
$bovineId = ($global:CreatedIds.Species | Where-Object { $_.name_en -eq "Cattle" }).id
$ovineId = ($global:CreatedIds.Species | Where-Object { $_.name_en -eq "Sheep" }).id
$caprineId = ($global:CreatedIds.Species | Where-Object { $_.name_en -eq "Goat" }).id

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
    $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/breeds" -Body $breed
    if ($created) {
        $global:CreatedIds.Breeds += $created
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
    @{name="Tylosine 20%"; name_en="Tylosin 20%"; category="Antibiotique"; manufacturer="SAIDAL"; withdrawalPeriodDays=21; unit="ml"},

    # Antiparasitaires
    @{name="Ivermectine 1%"; name_en="Ivermectin 1%"; category="Antiparasitaire"; manufacturer="Biopharm"; withdrawalPeriodDays=35; unit="ml"},
    @{name="Albendazole 10%"; name_en="Albendazole 10%"; category="Antiparasitaire"; manufacturer="SAIDAL"; withdrawalPeriodDays=14; unit="ml"},
    @{name="Closantel 5%"; name_en="Closantel 5%"; category="Antiparasitaire"; manufacturer="Biopharm"; withdrawalPeriodDays=28; unit="ml"},
    @{name="Levamisole 7.5%"; name_en="Levamisole 7.5%"; category="Antiparasitaire"; manufacturer="SAIDAL"; withdrawalPeriodDays=7; unit="ml"},

    # Vitamines
    @{name="Vitamine AD3E"; name_en="Vitamin AD3E"; category="Vitamine"; manufacturer="SAIDAL"; withdrawalPeriodDays=0; unit="ml"},
    @{name="Complexe B"; name_en="B-Complex"; category="Vitamine"; manufacturer="Biopharm"; withdrawalPeriodDays=0; unit="ml"},
    @{name="Calcium Borogluconate"; name_en="Calcium Borogluconate"; category="Mineral"; manufacturer="SAIDAL"; withdrawalPeriodDays=0; unit="ml"},

    # Anti-inflammatoires
    @{name="Flunixine Meglumine"; name_en="Flunixin Meglumine"; category="Anti-inflammatoire"; manufacturer="Biopharm"; withdrawalPeriodDays=21; unit="ml"},
    @{name="Meloxicam 2%"; name_en="Meloxicam 2%"; category="Anti-inflammatoire"; manufacturer="SAIDAL"; withdrawalPeriodDays=15; unit="ml"},

    # Autres
    @{name="Ocytocine"; name_en="Oxytocin"; category="Hormone"; manufacturer="SAIDAL"; withdrawalPeriodDays=1; unit="ml"},
    @{name="Serum Anti-Tetanique"; name_en="Tetanus Antitoxin"; category="Serum"; manufacturer="Institut Pasteur"; withdrawalPeriodDays=28; unit="ml"}
)

foreach ($product in $productsData) {
    $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/products" -Body $product
    if ($created) {
        $global:CreatedIds.Products += $created
        Write-Host "   [OK] $($product.name)" -ForegroundColor Gray
    }
}

# --- VACCINS ---
Write-Host "`n[CREATE] Creation des vaccins..." -ForegroundColor Green

$vaccinesData = @(
    @{name="Enterotoxemie"; name_en="Enterotoxemia"; disease="Enterotoxemie"; manufacturer="Institut Pasteur"; type="obligatoire"; withdrawalPeriodDays=0},
    @{name="Pasteurellose"; name_en="Pasteurellosis"; disease="Pasteurellose"; manufacturer="Institut Pasteur"; type="recommandee"; withdrawalPeriodDays=0},
    @{name="Fievre Aphteuse"; name_en="Foot-and-Mouth Disease"; disease="Fievre aphteuse"; manufacturer="SAIDAL"; type="obligatoire"; withdrawalPeriodDays=0},
    @{name="Brucellose"; name_en="Brucellosis"; disease="Brucellose"; manufacturer="Institut Pasteur"; type="obligatoire"; withdrawalPeriodDays=0},
    @{name="Rage"; name_en="Rabies"; disease="Rage"; manufacturer="Institut Pasteur"; type="recommandee"; withdrawalPeriodDays=0},
    @{name="Clavelee"; name_en="Sheep Pox"; disease="Variole ovine"; manufacturer="SAIDAL"; type="obligatoire"; withdrawalPeriodDays=0},
    @{name="Charbon Symptomatique"; name_en="Blackleg"; disease="Charbon"; manufacturer="Institut Pasteur"; type="recommandee"; withdrawalPeriodDays=0},
    @{name="Agalaxie Contagieuse"; name_en="Contagious Agalactia"; disease="Agalaxie"; manufacturer="Biopharm"; type="optionnelle"; withdrawalPeriodDays=0}
)

foreach ($vaccine in $vaccinesData) {
    $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/vaccines" -Body $vaccine
    if ($created) {
        $global:CreatedIds.Vaccines += $created
        Write-Host "   [OK] $($vaccine.name)" -ForegroundColor Gray
    }
}

# --- VETERINAIRES ---
Write-Host "`n[CREATE] Creation des veterinaires..." -ForegroundColor Green

$vetsData = @(
    @{
        firstName="Ahmed"; lastName="Benali";
        phone="+213550123456"; email="a.benali@vetalgeria.dz"
        licenseNumber="VET-ALG-001234"; specialization="Grands animaux"
    },
    @{
        firstName="Fatima"; lastName="Khelifa"
        phone="+213551234567"; email="f.khelifa@vetalgeria.dz"
        licenseNumber="VET-ALG-002345"; specialization="Reproduction"
    },
    @{
        firstName="Karim"; lastName="Mezouar"
        phone="+213552345678"; email="k.mezouar@vetalgeria.dz"
        licenseNumber="VET-ALG-003456"; specialization="Sante animale"
    },
    @{
        firstName="Samira"; lastName="Boumediene"
        phone="+213553456789"; email="s.boumediene@vetalgeria.dz"
        licenseNumber="VET-ALG-004567"; specialization="Nutrition"
    }
)

foreach ($vet in $vetsData) {
    $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/veterinarians" -Body $vet
    if ($created) {
        $global:CreatedIds.Vets += $created
        Write-Host "   [OK] Dr. $($vet.firstName) $($vet.lastName)" -ForegroundColor Gray
    }
}

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

foreach ($farm in $farmsData) {
    Write-Host "[CREATE] Creation de $($farm.name)..." -ForegroundColor Green

    $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/farms" -Body $farm
    if ($created) {
        $global:CreatedIds.Farms += $created
        Write-Host "   [OK] Ferme creee (ID: $($created.id))" -ForegroundColor Gray

        # Creer les preferences de la ferme
        $preferences = @{
            farmId = $created.id
            language = "fr"
            currency = "DZD"
            dateFormat = "DD/MM/YYYY"
            weightUnit = "kg"
            temperatureUnit = "celsius"
        }

        Invoke-ApiCall -Method "POST" -Endpoint "/api/preferences" -Body $preferences | Out-Null

        # Creer des configurations d'alertes
        $alertConfigs = @(
            @{farmId=$created.id; alertType="vaccination_due"; enabled=$true; thresholdDays=7; priority="high"},
            @{farmId=$created.id; alertType="treatment_withdrawal"; enabled=$true; thresholdDays=3; priority="high"},
            @{farmId=$created.id; alertType="document_expiry"; enabled=$true; thresholdDays=30; priority="medium"}
        )

        foreach ($config in $alertConfigs) {
            Invoke-ApiCall -Method "POST" -Endpoint "/api/alert-configurations" -Body $config | Out-Null
        }
    }
}

# ============================================================================
# PHASE 4: CREATION DES ANIMAUX (50 par ferme)
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "         CREATION DES ANIMAUX (150 total)                  " -ForegroundColor Yellow
Write-Host "============================================================`n" -ForegroundColor Yellow

$farmConfigs = @(
    @{
        Farm = $global:CreatedIds.Farms[0]
        SheepCount = 30
        GoatCount = 10
        CattleCount = 10
    },
    @{
        Farm = $global:CreatedIds.Farms[1]
        SheepCount = 10
        GoatCount = 10
        CattleCount = 30
    },
    @{
        Farm = $global:CreatedIds.Farms[2]
        SheepCount = 10
        GoatCount = 30
        CattleCount = 10
    }
)

$animalCounter = 1

foreach ($config in $farmConfigs) {
    $farmName = $config.Farm.name
    Write-Host "`n[FARM] $farmName" -ForegroundColor Cyan

    # Ovins
    if ($config.SheepCount -gt 0) {
        Write-Host "  [CREATE] Creation de $($config.SheepCount) moutons..." -ForegroundColor Green
        $sheepBreeds = $global:CreatedIds.Breeds | Where-Object { $_.name -in @("Ouled Djellal", "Rembi", "D'Man", "Barbarine") }

        for ($i = 1; $i -le $config.SheepCount; $i++) {
            $sex = if ((Get-Random -Minimum 1 -Maximum 100) -le 80) { "female" } else { "male" }
            $breed = $sheepBreeds | Get-Random

            $animal = @{
                id = New-Guid
                farmId = $config.Farm.id
                eid = "250{0:D12}" -f (Get-Random -Minimum 100000000000 -Maximum 999999999999)
                officialNumber = "DZ-OV-{0:D6}" -f $animalCounter
                visualId = "M{0:D3}" -f $i
                birthDate = Get-RandomDate -MinDaysAgo 180 -MaxDaysAgo 2555
                sex = $sex
                speciesId = $ovineId
                breedId = $breed.id
                status = if ((Get-Random -Minimum 1 -Maximum 100) -le 95) { "alive" } else { @("sold", "dead") | Get-Random }
            }

            $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/animals" -Body $animal
            if ($created) {
                $global:CreatedIds.Animals += $created
                $animalCounter++
            }
        }
    }

    # Caprins
    if ($config.GoatCount -gt 0) {
        Write-Host "  [CREATE] Creation de $($config.GoatCount) chevres..." -ForegroundColor Green
        $goatBreeds = $global:CreatedIds.Breeds | Where-Object { $_.name -in @("Arabia", "Kabyle", "M'Zabite", "Naine de Kabylie") }

        for ($i = 1; $i -le $config.GoatCount; $i++) {
            $sex = if ((Get-Random -Minimum 1 -Maximum 100) -le 80) { "female" } else { "male" }
            $breed = $goatBreeds | Get-Random

            $animal = @{
                id = New-Guid
                farmId = $config.Farm.id
                eid = "250{0:D12}" -f (Get-Random -Minimum 100000000000 -Maximum 999999999999)
                officialNumber = "DZ-CP-{0:D6}" -f $animalCounter
                visualId = "C{0:D3}" -f $i
                birthDate = Get-RandomDate -MinDaysAgo 180 -MaxDaysAgo 2555
                sex = $sex
                speciesId = $caprineId
                breedId = $breed.id
                status = if ((Get-Random -Minimum 1 -Maximum 100) -le 95) { "alive" } else { @("sold", "dead") | Get-Random }
            }

            $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/animals" -Body $animal
            if ($created) {
                $global:CreatedIds.Animals += $created
                $animalCounter++
            }
        }
    }

    # Bovins
    if ($config.CattleCount -gt 0) {
        Write-Host "  [CREATE] Creation de $($config.CattleCount) vaches..." -ForegroundColor Green
        $cattleBreeds = $global:CreatedIds.Breeds | Where-Object { $_.name -in @("Brune de l'Atlas", "Guelmoise", "Cheurfa") }

        for ($i = 1; $i -le $config.CattleCount; $i++) {
            $sex = if ((Get-Random -Minimum 1 -Maximum 100) -le 80) { "female" } else { "male" }
            $breed = $cattleBreeds | Get-Random

            $animal = @{
                id = New-Guid
                farmId = $config.Farm.id
                eid = "250{0:D12}" -f (Get-Random -Minimum 100000000000 -Maximum 999999999999)
                officialNumber = "DZ-BV-{0:D6}" -f $animalCounter
                visualId = "V{0:D3}" -f $i
                birthDate = Get-RandomDate -MinDaysAgo 365 -MaxDaysAgo 2920
                sex = $sex
                speciesId = $bovineId
                breedId = $breed.id
                status = if ((Get-Random -Minimum 1 -Maximum 100) -le 95) { "alive" } else { @("sold", "dead") | Get-Random }
            }

            $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/animals" -Body $animal
            if ($created) {
                $global:CreatedIds.Animals += $created
                $animalCounter++
            }
        }
    }
}

Write-Host "`n[SUCCESS] $($global:CreatedIds.Animals.Count) animaux crees !" -ForegroundColor Green

# ============================================================================
# PHASE 5: CREATION DES DONNEES OPERATIONNELLES
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Blue
Write-Host "       CREATION DES DONNEES OPERATIONNELLES                 " -ForegroundColor Blue
Write-Host "============================================================`n" -ForegroundColor Blue

# --- LOTS ---
Write-Host "[CREATE] Creation des lots par ferme..." -ForegroundColor Green

foreach ($farm in $global:CreatedIds.Farms) {
    $farmAnimals = $global:CreatedIds.Animals | Where-Object { $_.farmId -eq $farm.id }

    # Lot des males
    $males = $farmAnimals | Where-Object { $_.sex -eq "male" }
    if ($males.Count -gt 0) {
        $lot = @{
            name = "Reproducteurs - $($farm.name)"
            farmId = $farm.id
            description = "Males reproducteurs"
            animalIds = @($males.id)
        }
        $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/lots" -Body $lot
        if ($created) { $global:CreatedIds.Lots += $created }
    }

    # Lot des femelles
    $females = $farmAnimals | Where-Object { $_.sex -eq "female" }
    if ($females.Count -gt 0) {
        $lot = @{
            name = "Femelles reproductrices - $($farm.name)"
            farmId = $farm.id
            description = "Femelles en production"
            animalIds = @($females.id)
        }
        $created = Invoke-ApiCall -Method "POST" -Endpoint "/api/lots" -Body $lot
        if ($created) { $global:CreatedIds.Lots += $created }
    }
}

Write-Host "   [OK] $($global:CreatedIds.Lots.Count) lots crees" -ForegroundColor Gray

# --- POIDS ---
Write-Host "`n[CREATE] Creation de l'historique de poids..." -ForegroundColor Green

$weightCount = 0
foreach ($animal in $global:CreatedIds.Animals) {
    # Recuperer la species pour determiner le poids de base
    $species = $global:CreatedIds.Species | Where-Object { $_.id -eq $animal.speciesId }

    $baseWeight = switch ($species.name_en) {
        "Cattle" { Get-Random -Minimum 350 -Maximum 550 }
        "Sheep" { Get-Random -Minimum 45 -Maximum 75 }
        "Goat" { Get-Random -Minimum 35 -Maximum 55 }
        default { 50 }
    }

    # Creer 3-5 pesees historiques
    $numWeights = Get-Random -Minimum 3 -Maximum 6
    for ($i = $numWeights; $i -ge 1; $i--) {
        $weight = @{
            animalId = $animal.id
            weight = [math]::Round($baseWeight - ($i * (Get-Random -Minimum 5 -Maximum 15)), 1)
            weightDate = Get-RandomPastDate -DaysAgo (30 * $i)
            notes = "Pesee de routine"
        }

        Invoke-ApiCall -Method "POST" -Endpoint "/api/weights" -Body $weight | Out-Null
        $weightCount++
    }
}

Write-Host "   [OK] $weightCount pesees creees" -ForegroundColor Gray

# --- TRAITEMENTS ---
Write-Host "`n[CREATE] Creation des traitements..." -ForegroundColor Green

$treatmentCount = 0
$antiparasiticProducts = $global:CreatedIds.Products | Where-Object { $_.category -eq "Antiparasitaire" }

foreach ($farm in $global:CreatedIds.Farms) {
    $farmAnimals = $global:CreatedIds.Animals | Where-Object { $_.farmId -eq $farm.id -and $_.status -eq "alive" }

    if ($farmAnimals.Count -gt 0) {
        # Traitement antiparasitaire de groupe
        $product = $antiparasiticProducts | Get-Random
        $treatmentDate = Get-RandomPastDate -DaysAgo 60

        $treatments = @()
        foreach ($animal in $farmAnimals) {
            $treatments += @{
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
        }

        # Envoyer par batch de 20
        for ($i = 0; $i -lt $treatments.Count; $i += 20) {
            $batch = $treatments[$i..[math]::Min($i + 19, $treatments.Count - 1)]
            foreach ($treatment in $batch) {
                Invoke-ApiCall -Method "POST" -Endpoint "/api/treatments" -Body $treatment | Out-Null
                $treatmentCount++
            }
        }
    }
}

Write-Host "   [OK] $treatmentCount traitements crees" -ForegroundColor Gray

# --- VACCINATIONS ---
Write-Host "`n[CREATE] Creation des vaccinations..." -ForegroundColor Green

$vaccinationCount = 0
$vaccines = $global:CreatedIds.Vaccines

foreach ($farm in $global:CreatedIds.Farms) {
    $farmAnimals = $global:CreatedIds.Animals | Where-Object { $_.farmId -eq $farm.id -and $_.status -eq "alive" }

    if ($farmAnimals.Count -gt 0) {
        # Campagne de vaccination (2-3 vaccins par ferme)
        $selectedVaccines = $vaccines | Get-Random -Count (Get-Random -Minimum 2 -Maximum 4)

        foreach ($vaccine in $selectedVaccines) {
            $vaccinationDate = Get-RandomPastDate -DaysAgo 90

            foreach ($animal in $farmAnimals) {
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

                Invoke-ApiCall -Method "POST" -Endpoint "/api/vaccinations" -Body $vaccination | Out-Null
                $vaccinationCount++
            }
        }
    }
}

Write-Host "   [OK] $vaccinationCount vaccinations creees" -ForegroundColor Gray

# --- MOUVEMENTS ---
Write-Host "`n[CREATE] Creation des mouvements..." -ForegroundColor Green

$movementCount = 0
foreach ($farm in $global:CreatedIds.Farms) {
    $farmAnimals = $global:CreatedIds.Animals | Where-Object { $_.farmId -eq $farm.id -and $_.status -eq "alive" }

    # Quelques mouvements internes (10% des animaux)
    $movedAnimals = $farmAnimals | Get-Random -Count ([math]::Floor($farmAnimals.Count * 0.1))

    foreach ($animal in $movedAnimals) {
        $movement = @{
            animalId = $animal.id
            movementType = "internal"
            movementDate = Get-RandomPastDate -DaysAgo 45
            fromLocation = "Paddock A"
            toLocation = "Paddock B"
            reason = "Rotation des paturages"
        }

        Invoke-ApiCall -Method "POST" -Endpoint "/api/movements" -Body $movement | Out-Null
        $movementCount++
    }
}

Write-Host "   [OK] $movementCount mouvements crees" -ForegroundColor Gray

# --- REPRODUCTIONS ---
Write-Host "`n[CREATE] Creation des evenements de reproduction..." -ForegroundColor Green

$breedingCount = 0
foreach ($farm in $global:CreatedIds.Farms) {
    $females = $global:CreatedIds.Animals | Where-Object {
        $_.farmId -eq $farm.id -and $_.sex -eq "female" -and $_.status -eq "alive"
    }

    # 30% des femelles ont un evenement de reproduction
    $breededFemales = $females | Get-Random -Count ([math]::Floor($females.Count * 0.3))

    foreach ($female in $breededFemales) {
        $breedingDate = Get-RandomPastDate -DaysAgo 120

        $breeding = @{
            animalId = $female.id
            breedingDate = $breedingDate
            breedingType = "natural"
            expectedBirthDate = (Get-Date $breedingDate).AddDays(150).ToString("yyyy-MM-dd")
            notes = "Saillie naturelle"
        }

        Invoke-ApiCall -Method "POST" -Endpoint "/api/breedings" -Body $breeding | Out-Null
        $breedingCount++
    }
}

Write-Host "   [OK] $breedingCount evenements de reproduction crees" -ForegroundColor Gray

# --- DOCUMENTS ---
Write-Host "`n[CREATE] Creation des documents..." -ForegroundColor Green

$documentCount = 0
foreach ($farm in $global:CreatedIds.Farms) {
    $documents = @(
        @{
            farmId = $farm.id
            documentType = "health_certificate"
            title = "Certificat Sanitaire $($farm.name)"
            description = "Certificat sanitaire annuel"
            issueDate = (Get-Date).AddMonths(-6).ToString("yyyy-MM-dd")
            expiryDate = (Get-Date).AddMonths(6).ToString("yyyy-MM-dd")
            fileUrl = "/documents/cert_sanitaire_$(New-Guid).pdf"
        },
        @{
            farmId = $farm.id
            documentType = "registration"
            title = "Registre d'elevage $($farm.name)"
            description = "Registre officiel"
            issueDate = (Get-Date).AddYears(-1).ToString("yyyy-MM-dd")
            fileUrl = "/documents/registre_$(New-Guid).pdf"
        }
    )

    foreach ($doc in $documents) {
        Invoke-ApiCall -Method "POST" -Endpoint "/api/documents" -Body $doc | Out-Null
        $documentCount++
    }
}

Write-Host "   [OK] $documentCount documents crees" -ForegroundColor Gray

# ============================================================================
# RESUME FINAL
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "                    RESUME FINAL                            " -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Green

Write-Host "[SUCCESS] Base de donnees initialisee avec succes !`n" -ForegroundColor Green

Write-Host "[STATS] DONNEES DE REFERENCE:" -ForegroundColor Cyan
Write-Host "   - Especes: $($global:CreatedIds.Species.Count)" -ForegroundColor White
Write-Host "   - Races: $($global:CreatedIds.Breeds.Count)" -ForegroundColor White
Write-Host "   - Produits medicaux: $($global:CreatedIds.Products.Count)" -ForegroundColor White
Write-Host "   - Vaccins: $($global:CreatedIds.Vaccines.Count)" -ForegroundColor White
Write-Host "   - Veterinaires: $($global:CreatedIds.Vets.Count)" -ForegroundColor White

Write-Host "`n[STATS] FERMES:" -ForegroundColor Cyan
foreach ($farm in $global:CreatedIds.Farms) {
    $farmAnimals = $global:CreatedIds.Animals | Where-Object { $_.farmId -eq $farm.id }
    Write-Host "   - $($farm.name): $($farmAnimals.Count) animaux" -ForegroundColor White
}

Write-Host "`n[STATS] ANIMAUX (Total: $($global:CreatedIds.Animals.Count)):" -ForegroundColor Cyan
$bovins = $global:CreatedIds.Animals | Where-Object { $_.speciesId -eq $bovineId }
$ovins = $global:CreatedIds.Animals | Where-Object { $_.speciesId -eq $ovineId }
$caprins = $global:CreatedIds.Animals | Where-Object { $_.speciesId -eq $caprineId }
Write-Host "   - Bovins: $($bovins.Count)" -ForegroundColor White
Write-Host "   - Ovins: $($ovins.Count)" -ForegroundColor White
Write-Host "   - Caprins: $($caprins.Count)" -ForegroundColor White

Write-Host "`n[STATS] DONNEES OPERATIONNELLES:" -ForegroundColor Cyan
Write-Host "   - Lots: $($global:CreatedIds.Lots.Count)" -ForegroundColor White
Write-Host "   - Pesees: ~$weightCount" -ForegroundColor White
Write-Host "   - Traitements: ~$treatmentCount" -ForegroundColor White
Write-Host "   - Vaccinations: ~$vaccinationCount" -ForegroundColor White
Write-Host "   - Mouvements: ~$movementCount" -ForegroundColor White
Write-Host "   - Reproductions: ~$breedingCount" -ForegroundColor White
Write-Host "   - Documents: ~$documentCount" -ForegroundColor White

Write-Host "`n[SUCCESS] La base de donnees est prete pour les tests !`n" -ForegroundColor Green
