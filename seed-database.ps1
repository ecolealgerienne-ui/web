# Script minimal pour tester la creation d'une race et d'un animal
# Usage: .\test-seed-minimal.ps1

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = "test-token"
)

$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
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
            Write-Host "[DEBUG] $Method $Endpoint" -ForegroundColor Cyan
            Write-Host "[DEBUG] Body: $jsonBody" -ForegroundColor Gray
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $jsonBody
        } else {
            Write-Host "[DEBUG] $Method $Endpoint" -ForegroundColor Cyan
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
        }
        Write-Host "[SUCCESS] Response received" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "[ERROR] Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        return $null
    }
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "TEST MINIMAL - 1 RACE + 1 ANIMAL" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# ============================================================================
# TEST 1: CREER UNE RACE (donnee de reference globale)
# ============================================================================

Write-Host "`n[TEST 1] Creation d'une race..." -ForegroundColor Cyan

$breedId = [guid]::NewGuid().ToString()
$breed = @{
    id = $breedId
    speciesId = "sheep"
    nameFr = "Ouled Djellal"
    nameEn = "Ouled Djellal"
    nameAr = "Awlad Djallal"
    description = "Race ovine la plus repandue en Algerie"
    displayOrder = 1
    isActive = $true
}

$createdBreed = Invoke-ApiCall -Method "POST" -Endpoint "/api/v1/breeds" -Body $breed

if ($createdBreed) {
    # Extraire l'ID (peut etre dans .id ou .data.id)
    $createdBreedId = if ($createdBreed.id) { $createdBreed.id } elseif ($createdBreed.data.id) { $createdBreed.data.id } else { $breedId }
    Write-Host "[OK] Race creee avec ID: $createdBreedId" -ForegroundColor Green

    # Test GET
    Write-Host "`n[TEST 1.1] Recuperation de la race..." -ForegroundColor Cyan
    $fetchedBreed = Invoke-ApiCall -Method "GET" -Endpoint "/api/v1/breeds"

    # Test DELETE
    Write-Host "`n[TEST 1.2] Suppression de la race..." -ForegroundColor Cyan
    Invoke-ApiCall -Method "DELETE" -Endpoint "/api/v1/breeds/$createdBreedId"
} else {
    Write-Host "[FAIL] Impossible de creer la race" -ForegroundColor Red
    exit 1
}

# ============================================================================
# TEST 2: CREER UNE FERME
# ============================================================================

Write-Host "`n`n[TEST 2] Creation d'une ferme..." -ForegroundColor Cyan

$farm = @{
    id = [guid]::NewGuid().ToString()
    name = "Ferme Test"
    location = "Medea, Algerie"
    ownerId = "00000000-0000-0000-0000-000000000001"
    cheptelNumber = "DZ-26-12345"
    isDefault = $false
}

$createdFarm = Invoke-ApiCall -Method "POST" -Endpoint "/api/farms" -Body $farm

if ($createdFarm) {
    # Extraire l'ID
    $farmId = if ($createdFarm.id) { $createdFarm.id } elseif ($createdFarm.data.id) { $createdFarm.data.id } else { $farm.id }
    Write-Host "[OK] Ferme creee avec ID: $farmId" -ForegroundColor Green

    # ============================================================================
    # TEST 3: CREER UN ANIMAL (donnee transactionnelle par ferme)
    # ============================================================================

    Write-Host "`n[TEST 3] Creation d'un animal pour la ferme $farmId..." -ForegroundColor Cyan

    # D'abord recreer la race pour avoir un breedId valide
    $breedForAnimal = @{
        id = [guid]::NewGuid().ToString()
        speciesId = "sheep"
        nameFr = "Test Breed"
        nameEn = "Test Breed"
        nameAr = "Test"
        description = "Pour test"
        displayOrder = 1
        isActive = $true
    }
    $testBreed = Invoke-ApiCall -Method "POST" -Endpoint "/api/v1/breeds" -Body $breedForAnimal
    $testBreedId = if ($testBreed.id) { $testBreed.id } elseif ($testBreed.data.id) { $testBreed.data.id } else { $breedForAnimal.id }

    $animal = @{
        eid = "250123456789012"
        internalId = "M001"
        name = "Mouton Test"
        species = "sheep"
        breedId = $testBreedId
        sex = "female"
        birthDate = "2023-01-15"
        acquisitionDate = "2023-01-15"
        acquisitionType = "birth"
        currentWeight = 45.5
    }

    $createdAnimal = Invoke-ApiCall -Method "POST" -Endpoint "/farms/$farmId/animals" -Body $animal

    if ($createdAnimal) {
        $animalId = if ($createdAnimal.id) { $createdAnimal.id } elseif ($createdAnimal.data.id) { $createdAnimal.data.id } else { $null }
        Write-Host "[OK] Animal cree avec ID: $animalId" -ForegroundColor Green

        # Test GET
        Write-Host "`n[TEST 3.1] Recuperation de l'animal..." -ForegroundColor Cyan
        $fetchedAnimal = Invoke-ApiCall -Method "GET" -Endpoint "/farms/$farmId/animals/$animalId"

        # Test UPDATE
        Write-Host "`n[TEST 3.2] Mise a jour de l'animal..." -ForegroundColor Cyan
        $updateData = @{
            name = "Mouton Test Modifie"
            currentWeight = 50.0
        }
        $updatedAnimal = Invoke-ApiCall -Method "PUT" -Endpoint "/farms/$farmId/animals/$animalId" -Body $updateData

        # Test DELETE
        Write-Host "`n[TEST 3.3] Suppression de l'animal..." -ForegroundColor Cyan
        Invoke-ApiCall -Method "DELETE" -Endpoint "/farms/$farmId/animals/$animalId"
    } else {
        Write-Host "[FAIL] Impossible de creer l'animal" -ForegroundColor Red
    }

    # Cleanup: supprimer la ferme
    Write-Host "`n[CLEANUP] Suppression de la ferme de test..." -ForegroundColor Cyan
    Invoke-ApiCall -Method "DELETE" -Endpoint "/api/farms/$farmId"

    # Cleanup: supprimer la race de test
    Write-Host "[CLEANUP] Suppression de la race de test..." -ForegroundColor Cyan
    Invoke-ApiCall -Method "DELETE" -Endpoint "/api/v1/breeds/$testBreedId"

} else {
    Write-Host "[FAIL] Impossible de creer la ferme" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TESTS TERMINES" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
