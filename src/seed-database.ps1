# Script d'initialisation - 1 ferme avec 50 animaux
# Usage: .\seed-database.ps1

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = "test-token",
    [int]$TotalAnimals = 50
)

$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

$global:Data = @{
    Breeds = @()
    Farm = $null
    Animals = @()
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
        Start-Sleep -Milliseconds 350
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
Write-Host "  INITIALISATION BD - 1 FERME + 50 ANIMAUX" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# ============================================================================
# PHASE 1: CREER LES RACES FRANCAISES
# ============================================================================

Write-Host "[1/3] Creation des races francaises..." -ForegroundColor Green

$breedsData = @(
    # Bovins
    @{speciesId="cattle"; nameFr="Charolaise"; nameEn="Charolais"; nameAr="Charolaise"; description="Race a viande blanche tres repandue"},
    @{speciesId="cattle"; nameFr="Limousine"; nameEn="Limousin"; nameAr="Limousine"; description="Race a viande rousse rustique"},
    @{speciesId="cattle"; nameFr="Normande"; nameEn="Norman"; nameAr="Normande"; description="Race laitiere normande"},
    @{speciesId="cattle"; nameFr="Montbeliarde"; nameEn="Montbeliard"; nameAr="Montbeliarde"; description="Race laitiere de montagne"},

    # Ovins
    @{speciesId="sheep"; nameFr="Lacaune"; nameEn="Lacaune"; nameAr="Lacaune"; description="Race laitiere pour le Roquefort"},
    @{speciesId="sheep"; nameFr="Merinos d'Arles"; nameEn="Arles Merino"; nameAr="Merinos d'Arles"; description="Race a laine fine"},
    @{speciesId="sheep"; nameFr="Ile-de-France"; nameEn="Ile-de-France"; nameAr="Ile-de-France"; description="Race bouchere"},
    @{speciesId="sheep"; nameFr="Prealpes du Sud"; nameEn="South Prealpes"; nameAr="Prealpes"; description="Race rustique de montagne"},

    # Caprins
    @{speciesId="goat"; nameFr="Alpine"; nameEn="Alpine"; nameAr="Alpine"; description="Race laitiere chamoisee"},
    @{speciesId="goat"; nameFr="Saanen"; nameEn="Saanen"; nameAr="Saanen"; description="Race laitiere blanche"},
    @{speciesId="goat"; nameFr="Angora"; nameEn="Angora"; nameAr="Angora"; description="Race a poil mohair"},
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
# PHASE 2: CREER LA FERME
# ============================================================================

Write-Host "[2/3] Creation de la ferme..." -ForegroundColor Green

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
# PHASE 3: CREER 50 ANIMAUX
# ============================================================================

Write-Host "[3/3] Creation de $TotalAnimals animaux..." -ForegroundColor Green

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
# RESUME
# ============================================================================

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "                  INITIALISATION TERMINEE" -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Green

Write-Host "[FERME]" -ForegroundColor Cyan
Write-Host "  - Nom: $($global:Data.Farm.Name)" -ForegroundColor White
Write-Host "  - ID: $($global:Data.Farm.Id)" -ForegroundColor White

Write-Host "`n[RACES]" -ForegroundColor Cyan
Write-Host "  - Total: $($global:Data.Breeds.Count)" -ForegroundColor White

Write-Host "`n[ANIMAUX]" -ForegroundColor Cyan
Write-Host "  - Total: $($global:Data.Animals.Count)" -ForegroundColor White
$sheepTotal = ($global:Data.Animals | Where-Object { $_.speciesId -eq "sheep" }).Count
$goatTotal = ($global:Data.Animals | Where-Object { $_.speciesId -eq "goat" }).Count
$cattleTotal = ($global:Data.Animals | Where-Object { $_.speciesId -eq "cattle" }).Count
Write-Host "  - Moutons: $sheepTotal" -ForegroundColor White
Write-Host "  - Chevres: $goatTotal" -ForegroundColor White
Write-Host "  - Vaches: $cattleTotal" -ForegroundColor White

Write-Host "`n[SUCCESS] Base de donnees prete pour les tests !`n" -ForegroundColor Green

