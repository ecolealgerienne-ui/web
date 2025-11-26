# =============================================================================
# Script de Seed - 100 animaux avec données réalistes (2023-2025)
# 1 ferme, bovins/ovins, traitements, vaccins, pesées, reproductions, etc.
# =============================================================================

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = "test-token"
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SEED 100 ANIMAUX - AniTra Backend API" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

# Helper pour extraire l'ID depuis une réponse API (structure variable)
function Get-IdFromResponse {
    param([object]$Response)
    if (-not $Response) { return $null }
    if ($Response.id) { return $Response.id }
    if ($Response.data -and $Response.data.id) { return $Response.data.id }
    if ($Response.data -and $Response.data.data -and $Response.data.data.id) {
        return $Response.data.data.id
    }
    return $null
}

# Helper pour appeler l'API avec Invoke-RestMethod
function Invoke-CurlApi {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Description,
        [switch]$Silent
    )

    $uri = "$BaseUrl$Endpoint"

    if ($Description -and -not $Silent) {
        Write-Host "  [SEED] $Description..." -ForegroundColor Yellow -NoNewline
    }

    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $Token"
    }

    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $jsonBody `
                -DisableKeepAlive -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers `
                -DisableKeepAlive -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
        }

        if (-not $Silent) {
            Write-Host " OK" -ForegroundColor Green
        }
        Start-Sleep -Milliseconds 200
        return $response
    } catch {
        if (-not $Silent) {
            Write-Host " ERROR" -ForegroundColor Red
            Write-Host "    $($_.Exception.Message)" -ForegroundColor Red

            if ($_.ErrorDetails.Message) {
                try {
                    $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
                    if ($errorObj.message -is [array]) {
                        Write-Host "    Details: $($errorObj.message -join ', ')" -ForegroundColor Yellow
                    } else {
                        Write-Host "    Details: $($errorObj | ConvertTo-Json -Compress)" -ForegroundColor Yellow
                    }
                } catch {
                    Write-Host "    Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
                }
            }
        }
        return $null
    }
}

# Helper pour générer une date aléatoire dans une plage
function Get-RandomDate {
    param(
        [DateTime]$Start,
        [DateTime]$End
    )
    $range = ($End - $Start).TotalDays
    $randomDays = Get-Random -Minimum 0 -Maximum $range
    return $Start.AddDays($randomDays).ToString("yyyy-MM-ddT00:00:00.000Z")
}

# =============================================================================
# VARIABLES GLOBALES
# =============================================================================
$globalProductIds = @()
$globalVaccineIds = @()
$nationalCampaignIds = @()
$breedIds = @()
$speciesIds = @()
$farmId = $null
$farmResponse = $null
$vetIds = @()
$lotIds = @()
$animalIds = @()
$medicalProductIds = @()
$customVaccineIds = @()

# Dates de référence (2023-2025)
$startDate = Get-Date "2023-01-01"
$endDate = Get-Date "2025-11-24"

# =============================================================================
# 1. COUNTRIES (5 pays européens)
# =============================================================================
Write-Host ""
Write-Host "1. Countries (5 pays europeens)" -ForegroundColor Cyan

$countries = @(
    @{ code = "FR"; nameFr = "France"; nameEn = "France"; nameAr = "France"; region = "EU" }
    @{ code = "BE"; nameFr = "Belgique"; nameEn = "Belgium"; nameAr = "Belgium"; region = "EU" }
    @{ code = "DE"; nameFr = "Allemagne"; nameEn = "Germany"; nameAr = "Germany"; region = "EU" }
    @{ code = "ES"; nameFr = "Espagne"; nameEn = "Spain"; nameAr = "Spain"; region = "EU" }
    @{ code = "IT"; nameFr = "Italie"; nameEn = "Italy"; nameAr = "Italy"; region = "EU" }
)

foreach ($country in $countries) {
    Invoke-CurlApi -Method POST -Endpoint "/countries" -Body $country `
        -Description "Pays: $($country.nameFr)"
}

# =============================================================================
# 2. ADMINISTRATION ROUTES (5 routes)
# =============================================================================
Write-Host ""
Write-Host "2. Administration Routes (5 voies)" -ForegroundColor Cyan

$routes = @(
    @{ code = "IM"; nameFr = "Intramusculaire"; nameEn = "Intramuscular"; nameAr = "Intramuscular" }
    @{ code = "SC"; nameFr = "Sous-cutanee"; nameEn = "Subcutaneous"; nameAr = "Subcutaneous" }
    @{ code = "IV"; nameFr = "Intraveineuse"; nameEn = "Intravenous"; nameAr = "Intravenous" }
    @{ code = "PO"; nameFr = "Orale"; nameEn = "Oral"; nameAr = "Oral" }
    @{ code = "TOP"; nameFr = "Topique"; nameEn = "Topical"; nameAr = "Topical" }
)

foreach ($route in $routes) {
    Invoke-CurlApi -Method POST -Endpoint "/administration-routes" -Body $route `
        -Description "Route: $($route.nameFr)"
}

# =============================================================================
# 3. GLOBAL MEDICAL PRODUCTS (15 produits)
# =============================================================================
Write-Host ""
Write-Host "3. Global Medical Products (15 produits)" -ForegroundColor Cyan

$products = @(
    @{ code = "IVERM-001"; nameFr = "Ivomec 1%"; nameEn = "Ivomec 1%"; nameAr = "Ivomec 1%"; type = "antiparasitic"; laboratoire = "Boehringer Ingelheim"; principeActif = "Ivermectine" }
    @{ code = "PANACUR-001"; nameFr = "Panacur"; nameEn = "Panacur"; nameAr = "Panacur"; type = "antiparasitic"; laboratoire = "MSD"; principeActif = "Fenbendazole" }
    @{ code = "CLAMOXYL-001"; nameFr = "Clamoxyl LA"; nameEn = "Clamoxyl LA"; nameAr = "Clamoxyl LA"; type = "antibiotic"; laboratoire = "Zoetis"; principeActif = "Amoxicilline" }
    @{ code = "EXCENEL-001"; nameFr = "Excenel RTU"; nameEn = "Excenel RTU"; nameAr = "Excenel RTU"; type = "antibiotic"; laboratoire = "Zoetis"; principeActif = "Ceftiofur" }
    @{ code = "FINADYNE-001"; nameFr = "Finadyne"; nameEn = "Finadyne"; nameAr = "Finadyne"; type = "anti_inflammatory"; laboratoire = "MSD"; principeActif = "Flunixine" }
    @{ code = "METACAM-001"; nameFr = "Metacam"; nameEn = "Metacam"; nameAr = "Metacam"; type = "anti_inflammatory"; laboratoire = "Boehringer Ingelheim"; principeActif = "Meloxicam" }
    @{ code = "CALCIUM-001"; nameFr = "Calcium Injectable"; nameEn = "Calcium Injectable"; nameAr = "Calcium Injectable"; type = "vitamin"; laboratoire = "Vetoquinol"; principeActif = "Calcium borogluconate" }
    @{ code = "VITAD3-001"; nameFr = "Vitamine AD3E"; nameEn = "Vitamin AD3E"; nameAr = "Vitamin AD3E"; type = "vitamin"; laboratoire = "CEVA"; principeActif = "Vitamines A, D3, E" }
    @{ code = "OXYTETRA-001"; nameFr = "Oxytetracycline LA"; nameEn = "Oxytetracycline LA"; nameAr = "Oxytetracycline LA"; type = "antibiotic"; laboratoire = "CEVA"; principeActif = "Oxytetracycline" }
    @{ code = "COLICOLI-001"; nameFr = "Coliprotec"; nameEn = "Coliprotec"; nameAr = "Coliprotec"; type = "antibiotic"; laboratoire = "Hipra"; principeActif = "Colistine" }
    @{ code = "DEXTRO-001"; nameFr = "Dextrose 50%"; nameEn = "Dextrose 50%"; nameAr = "Dextrose 50%"; type = "vitamin"; laboratoire = "Vetoquinol"; principeActif = "Glucose" }
    @{ code = "OXYTOCINE-001"; nameFr = "Oxytocine"; nameEn = "Oxytocin"; nameAr = "Oxytocin"; type = "hormone"; laboratoire = "CEVA"; principeActif = "Oxytocine" }
    @{ code = "PROSTAGLAN-001"; nameFr = "Prostaglandine"; nameEn = "Prostaglandin"; nameAr = "Prostaglandin"; type = "hormone"; laboratoire = "Zoetis"; principeActif = "PGF2alpha" }
    @{ code = "BETADINE-001"; nameFr = "Betadine"; nameEn = "Betadine"; nameAr = "Betadine"; type = "other"; laboratoire = "Vetoquinol"; principeActif = "Povidone iodee" }
    @{ code = "SPRAY-001"; nameFr = "Spray cicatrisant"; nameEn = "Wound spray"; nameAr = "Wound spray"; type = "other"; laboratoire = "Vetoquinol"; principeActif = "Oxytetracycline" }
)

foreach ($product in $products) {
    $productResponse = Invoke-CurlApi -Method POST -Endpoint "/global-medical-products" -Body $product `
        -Description "Produit: $($product.nameFr)"
    $productId = Get-IdFromResponse $productResponse
    if ($productId) {
        $globalProductIds += $productId
    }
}

Write-Host "    -> $($globalProductIds.Count) produits globaux crees" -ForegroundColor Green

# =============================================================================
# 4. GLOBAL VACCINES (10 vaccins)
# =============================================================================
Write-Host ""
Write-Host "4. Global Vaccines (10 vaccins)" -ForegroundColor Cyan

$vaccines = @(
    @{ code = "ENTEROTOX-001"; nameFr = "Vaccin Enterotoxemie"; nameEn = "Enterotoxemia Vaccine"; nameAr = "Enterotoxemia Vaccine"; targetDisease = "enterotoxemia"; laboratoire = "MSD" }
    @{ code = "BRUCELLO-001"; nameFr = "Vaccin Brucellose B19"; nameEn = "Brucellosis B19"; nameAr = "Brucellosis B19"; targetDisease = "brucellosis"; laboratoire = "MSD" }
    @{ code = "BLUETONGUE-001"; nameFr = "Vaccin Fievre Catarrhale"; nameEn = "Bluetongue Vaccine"; nameAr = "Bluetongue Vaccine"; targetDisease = "bluetongue"; laboratoire = "Zoetis" }
    @{ code = "FMD-001"; nameFr = "Vaccin Fievre Aphteuse"; nameEn = "Foot and Mouth Disease"; nameAr = "Foot and Mouth Disease"; targetDisease = "foot_and_mouth"; laboratoire = "CEVA" }
    @{ code = "RABIES-001"; nameFr = "Vaccin Rage"; nameEn = "Rabies Vaccine"; nameAr = "Rabies Vaccine"; targetDisease = "rabies"; laboratoire = "Zoetis" }
    @{ code = "ANTHRAX-001"; nameFr = "Vaccin Charbon"; nameEn = "Anthrax Vaccine"; nameAr = "Anthrax Vaccine"; targetDisease = "anthrax"; laboratoire = "CEVA" }
    @{ code = "PAST-001"; nameFr = "Vaccin Pasteurellose"; nameEn = "Pasteurellosis Vaccine"; nameAr = "Pasteurellosis Vaccine"; targetDisease = "pasteurellosis"; laboratoire = "MSD" }
    @{ code = "PPR-001"; nameFr = "Vaccin Peste Petits Ruminants"; nameEn = "PPR Vaccine"; nameAr = "PPR Vaccine"; targetDisease = "ppr"; laboratoire = "CEVA" }
    @{ code = "SHEEPPOX-001"; nameFr = "Vaccin Variole Ovine"; nameEn = "Sheep Pox Vaccine"; nameAr = "Sheep Pox Vaccine"; targetDisease = "sheep_pox"; laboratoire = "MSD" }
    @{ code = "MULTI-001"; nameFr = "Vaccin Multivalent"; nameEn = "Multivalent Vaccine"; nameAr = "Multivalent Vaccine"; targetDisease = "other"; laboratoire = "Hipra" }
)

foreach ($vaccine in $vaccines) {
    $vaccineResponse = Invoke-CurlApi -Method POST -Endpoint "/vaccines-global" -Body $vaccine `
        -Description "Vaccin: $($vaccine.nameFr)"
    $vaccineId = Get-IdFromResponse $vaccineResponse
    if ($vaccineId) {
        $globalVaccineIds += $vaccineId
    }
}

Write-Host "    -> $($globalVaccineIds.Count) vaccins globaux crees" -ForegroundColor Green

# =============================================================================
# 5. NATIONAL CAMPAIGNS (4 campagnes)
# =============================================================================
Write-Host ""
Write-Host "5. National Campaigns (4 campagnes)" -ForegroundColor Cyan

$campaigns = @(
    @{ code = "vacc-fr-2024"; nameFr = "Campagne Vaccination 2024"; nameEn = "Vaccination Campaign 2024"; nameAr = "Vaccination Campaign 2024"; type = "vaccination"; description = "Campagne nationale de vaccination"; startDate = "2024-01-01T00:00:00.000Z"; endDate = "2024-12-31T23:59:59.999Z"; isActive = $true }
    @{ code = "depara-fr-2024"; nameFr = "Campagne Deparasitage 2024"; nameEn = "Deworming Campaign 2024"; nameAr = "Deworming Campaign 2024"; type = "deworming"; description = "Campagne de deparasitage"; startDate = "2024-03-01T00:00:00.000Z"; endDate = "2024-11-30T23:59:59.999Z"; isActive = $true }
    @{ code = "brucello-fr-2024"; nameFr = "Depistage Brucellose 2024"; nameEn = "Brucellosis Screening 2024"; nameAr = "Brucellosis Screening 2024"; type = "screening"; description = "Depistage brucellose"; startDate = "2024-01-01T00:00:00.000Z"; endDate = "2024-12-31T23:59:59.999Z"; isActive = $true }
    @{ code = "recens-fr-2024"; nameFr = "Recensement 2024"; nameEn = "Census 2024"; nameAr = "Census 2024"; type = "census"; description = "Recensement annuel"; startDate = "2024-09-01T00:00:00.000Z"; endDate = "2024-10-31T23:59:59.999Z"; isActive = $false }
)

foreach ($campaign in $campaigns) {
    $campaignResponse = Invoke-CurlApi -Method POST -Endpoint "/api/national-campaigns" -Body $campaign `
        -Description "Campagne: $($campaign.nameFr)"
    $campaignId = Get-IdFromResponse $campaignResponse
    if ($campaignId) {
        $nationalCampaignIds += $campaignId
    }
}

Write-Host "    -> $($nationalCampaignIds.Count) campagnes nationales creees" -ForegroundColor Green

# =============================================================================
# 6. ALERT TEMPLATES (6 templates)
# =============================================================================
Write-Host ""
Write-Host "6. Alert Templates (6 templates)" -ForegroundColor Cyan

$templates = @(
    @{ code = "vacc-reminder"; nameFr = "Rappel vaccination"; nameEn = "Vaccination reminder"; nameAr = "Vaccination reminder"; descriptionFr = "Rappel pour vaccinations"; descriptionEn = "Vaccination reminder"; category = "vaccination"; isActive = $true }
    @{ code = "treat-reminder"; nameFr = "Rappel traitement"; nameEn = "Treatment reminder"; nameAr = "Treatment reminder"; descriptionFr = "Rappel pour traitements"; descriptionEn = "Treatment reminder"; category = "treatment"; isActive = $true }
    @{ code = "birth-reminder"; nameFr = "Rappel mise bas"; nameEn = "Birth reminder"; nameAr = "Birth reminder"; descriptionFr = "Rappel mise bas prevue"; descriptionEn = "Expected birth"; category = "reproduction"; isActive = $true }
    @{ code = "weight-reminder"; nameFr = "Rappel pesee"; nameEn = "Weight reminder"; nameAr = "Weight reminder"; descriptionFr = "Rappel pesee periodique"; descriptionEn = "Periodic weighing"; category = "health"; isActive = $true }
    @{ code = "health-check"; nameFr = "Controle sanitaire"; nameEn = "Health check"; nameAr = "Health check"; descriptionFr = "Controle sanitaire periodique"; descriptionEn = "Periodic health check"; category = "health"; isActive = $true }
    @{ code = "campaign-reminder"; nameFr = "Rappel campagne"; nameEn = "Campaign reminder"; nameAr = "Campaign reminder"; descriptionFr = "Rappel campagne nationale"; descriptionEn = "National campaign reminder"; category = "administrative"; isActive = $true }
)

foreach ($template in $templates) {
    Invoke-CurlApi -Method POST -Endpoint "/alert-templates" -Body $template `
        -Description "Template: $($template.nameFr)"
}

# =============================================================================
# 7. SPECIES (2 especes: bovins et ovins)
# =============================================================================
Write-Host ""
Write-Host "7. Species (2 especes)" -ForegroundColor Cyan

$species = @(
    @{ id = "bovine"; nameFr = "Bovin"; nameEn = "Bovine"; nameAr = "Bovine"; icon = "cow" }
    @{ id = "ovine"; nameFr = "Ovin"; nameEn = "Ovine"; nameAr = "Ovine"; icon = "sheep" }
)

foreach ($specie in $species) {
    $speciesResponse = Invoke-CurlApi -Method POST -Endpoint "/api/v1/species" -Body $specie `
        -Description "Espece: $($specie.nameFr)"
    if ($speciesResponse) {
        $speciesIds += $specie.id
    }
}

Write-Host "    -> $($speciesIds.Count) especes creees" -ForegroundColor Green

# =============================================================================
# 8. BREEDS (8 races: 5 bovines + 3 ovines)
# =============================================================================
Write-Host ""
Write-Host "8. Breeds (8 races)" -ForegroundColor Cyan

$breeds = @(
    # Races bovines
    @{ code = "prim-holstein"; speciesId = "bovine"; nameFr = "Prim'Holstein"; nameEn = "Holstein"; nameAr = "Holstein"; description = "Race laitiere" }
    @{ code = "montbeliarde"; speciesId = "bovine"; nameFr = "Montbeliarde"; nameEn = "Montbeliarde"; nameAr = "Montbeliarde"; description = "Race mixte" }
    @{ code = "charolaise"; speciesId = "bovine"; nameFr = "Charolaise"; nameEn = "Charolais"; nameAr = "Charolais"; description = "Race a viande" }
    @{ code = "limousine"; speciesId = "bovine"; nameFr = "Limousine"; nameEn = "Limousin"; nameAr = "Limousin"; description = "Race a viande" }
    @{ code = "blonde-aquitaine"; speciesId = "bovine"; nameFr = "Blonde d'Aquitaine"; nameEn = "Blonde d'Aquitaine"; nameAr = "Blonde d'Aquitaine"; description = "Race a viande" }
    # Races ovines
    @{ code = "ile-de-france"; speciesId = "ovine"; nameFr = "Ile-de-France"; nameEn = "Ile-de-France"; nameAr = "Ile-de-France"; description = "Race a viande" }
    @{ code = "lacaune"; speciesId = "ovine"; nameFr = "Lacaune"; nameEn = "Lacaune"; nameAr = "Lacaune"; description = "Race laitiere" }
    @{ code = "merinos"; speciesId = "ovine"; nameFr = "Merinos"; nameEn = "Merino"; nameAr = "Merino"; description = "Race a laine" }
)

foreach ($breed in $breeds) {
    # Envoyer un ID temporaire pour passer la validation
    $tempBreedId = [guid]::NewGuid().ToString()
    $breed.id = $tempBreedId

    $breedResponse = Invoke-CurlApi -Method POST -Endpoint "/api/v1/breeds" -Body $breed `
        -Description "Race: $($breed.nameFr)"

    # Capturer l'ID généré par le serveur
    $breedId = Get-IdFromResponse $breedResponse
    if ($breedId) {
        $breedIds += $breedId
    }
}

Write-Host "    -> $($breedIds.Count) races creees" -ForegroundColor Green
Start-Sleep -Seconds 1

# =============================================================================
# 9. FARM (1 ferme principale)
# =============================================================================
Write-Host ""
Write-Host "9. Farm (1 ferme)" -ForegroundColor Cyan

$farmId = "550e8400-e29b-41d4-a716-446655440000"
$farm = @{
    id = $farmId
    name = "GAEC de la Vallee Verte"
    ownerId = "owner-gaec-001"
    location = "Lyon, Rhone-Alpes, France"
    address = "125 Chemin des Pres, 69100 Villeurbanne"
    commune = "69266"
    city = "Villeurbanne"
    postalCode = "69100"
    country = "FR"
    department = "69"
}

$farmResponse = Invoke-CurlApi -Method POST -Endpoint "/api/farms" -Body $farm `
    -Description "Ferme: $($farm.name)"

# =============================================================================
# 10. VETERINARIANS (5 veterinaires)
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "10. Veterinarians (5 veterinaires)" -ForegroundColor Cyan

    $vets = @(
        @{ firstName = "Marie"; lastName = "Martin"; title = "Dr."; phone = "0612345678"; email = "m.martin@vetfrance.fr"; licenseNumber = "VET-FR-001"; specialties = "Bovins laitiers" }
        @{ firstName = "Pierre"; lastName = "Dubois"; title = "Dr."; phone = "0623456789"; email = "p.dubois@vetfrance.fr"; licenseNumber = "VET-FR-002"; specialties = "Bovins viande" }
        @{ firstName = "Sophie"; lastName = "Bernard"; title = "Dr."; phone = "0634567890"; email = "s.bernard@vetfrance.fr"; licenseNumber = "VET-FR-003"; specialties = "Ovins" }
        @{ firstName = "Luc"; lastName = "Petit"; title = "Dr."; phone = "0645678901"; email = "l.petit@vetfrance.fr"; licenseNumber = "VET-FR-004"; specialties = "Chirurgie" }
        @{ firstName = "Claire"; lastName = "Moreau"; title = "Dr."; phone = "0656789012"; email = "c.moreau@vetfrance.fr"; licenseNumber = "VET-FR-005"; specialties = "Reproduction" }
    )

    foreach ($vet in $vets) {
        $vetResponse = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/veterinarians" -Body $vet `
            -Description "Veterinaire: Dr. $($vet.lastName)"
        $vetId = Get-IdFromResponse $vetResponse
        if ($vetId) {
            $vetIds += $vetId
        }
    }

    Write-Host "    -> $($vetIds.Count) veterinaires crees" -ForegroundColor Green
}

# =============================================================================
# 11. BREED COUNTRIES (Lier toutes les races a la France)
# =============================================================================
Write-Host ""
Write-Host "11. Breed Countries (Races disponibles en France)" -ForegroundColor Cyan

$breedCountryCount = 0
foreach ($breedId in $breedIds) {
    $breedCountry = @{
        breedId = $breedId
        countryCode = "FR"
    }
    $response = Invoke-CurlApi -Method POST -Endpoint "/api/v1/breed-countries" -Body $breedCountry -Silent
    if ($response) { $breedCountryCount++ }
}
Write-Host "    -> $breedCountryCount liaisons race-pays creees" -ForegroundColor Green

# =============================================================================
# 12. CAMPAIGN COUNTRIES (Lier campagnes a la France)
# =============================================================================
Write-Host ""
Write-Host "12. Campaign Countries (Campagnes en France)" -ForegroundColor Cyan

$campaignCountryCount = 0
foreach ($campaignId in $nationalCampaignIds) {
    $campaignCountry = @{
        campaignId = $campaignId
        countryCode = "FR"
    }
    $response = Invoke-CurlApi -Method POST -Endpoint "/api/v1/campaign-countries" -Body $campaignCountry -Silent
    if ($response) { $campaignCountryCount++ }
}
Write-Host "    -> $campaignCountryCount liaisons campagne-pays creees" -ForegroundColor Green

# =============================================================================
# 13. PRODUCT COUNTRIES (Lier produits a plusieurs pays)
# =============================================================================
Write-Host ""
Write-Host "13. Product Countries (Produits disponibles par pays)" -ForegroundColor Cyan

$productCountryCount = 0
foreach ($productId in $globalProductIds) {
    # Lier chaque produit a 2-3 pays europeens
    $countryCodes = @("FR", "BE", "DE") | Get-Random -Count (Get-Random -Minimum 2 -Maximum 4)
    foreach ($countryCode in $countryCodes) {
        $productCountry = @{
            productId = $productId
            countryCode = $countryCode
            isActive = $true
        }
        $response = Invoke-CurlApi -Method POST -Endpoint "/api/v1/product-countries" -Body $productCountry -Silent
        if ($response) { $productCountryCount++ }
    }
}
Write-Host "    -> $productCountryCount liaisons produit-pays creees" -ForegroundColor Green

# =============================================================================
# 14. VACCINE COUNTRIES (Lier vaccins a plusieurs pays)
# =============================================================================
Write-Host ""
Write-Host "14. Vaccine Countries (Vaccins disponibles par pays)" -ForegroundColor Cyan

$vaccineCountryCount = 0
foreach ($vaccineId in $globalVaccineIds) {
    $countryCodes = @("FR", "BE", "ES") | Get-Random -Count (Get-Random -Minimum 2 -Maximum 4)
    foreach ($countryCode in $countryCodes) {
        $vaccineCountry = @{
            vaccineId = $vaccineId
            countryCode = $countryCode
            isActive = $true
        }
        $response = Invoke-CurlApi -Method POST -Endpoint "/api/v1/vaccine-countries" -Body $vaccineCountry -Silent
        if ($response) { $vaccineCountryCount++ }
    }
}
Write-Host "    -> $vaccineCountryCount liaisons vaccin-pays creees" -ForegroundColor Green

# =============================================================================
# 15. FARM CONFIGURATION
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "15. Alert Configuration & Farm Preferences" -ForegroundColor Cyan

    # Alert Configuration
    $alertConfig = @{
        enableEmailAlerts = $true
        enableSmsAlerts = $false
        enablePushAlerts = $true
        vaccinationReminderDays = 7
        treatmentReminderDays = 3
        healthCheckReminderDays = 30
    }
    Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/alert-configuration" -Body $alertConfig `
        -Description "  Configuration alertes"

    # Farm Preferences
    $farmPreferences = @{
        weightUnit = "kg"
        currency = "EUR"
        language = "fr"
        dateFormat = "DD/MM/YYYY"
        enableNotifications = $true
        defaultVeterinarianId = if ($vetIds.Count -gt 0) { $vetIds[0] } else { $null }
        defaultBreedId = if ($breedIds.Count -gt 0) { $breedIds[0] } else { $null }
        defaultSpeciesId = "bovine"
    }
    Invoke-CurlApi -Method PUT -Endpoint "/farms/$farmId/preferences" -Body $farmPreferences `
        -Description "  Preferences ferme"
}

# =============================================================================
# 16. FARM PREFERENCES (Produits, Vaccins, Vétérinaires, Races, Campagnes)
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "16. Farm Preferences (Favoris de la ferme)" -ForegroundColor Cyan

    # Farm Product Preferences (5 produits favoris)
    # Note: Uses productId (unified MedicalProduct table with Master Table Pattern)
    $productPrefCount = 0
    for ($i = 0; $i -lt [Math]::Min(5, $globalProductIds.Count); $i++) {
        $productPref = @{
            productId = $globalProductIds[$i]
            displayOrder = $i + 1
            isActive = $true
        }
        $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/product-preferences" -Body $productPref -Silent
        if ($response) { $productPrefCount++ }
    }

    # Farm Vaccine Preferences (4 vaccins favoris)
    # Note: Uses vaccineId (unified Vaccine table with Master Table Pattern)
    $vaccinePrefCount = 0
    for ($i = 0; $i -lt [Math]::Min(4, $globalVaccineIds.Count); $i++) {
        $vaccinePref = @{
            vaccineId = $globalVaccineIds[$i]
            displayOrder = $i + 1
            isActive = $true
        }
        $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/vaccine-preferences" -Body $vaccinePref -Silent
        if ($response) { $vaccinePrefCount++ }
    }

    # Farm Veterinarian Preferences (3 vétérinaires favoris)
    $vetPrefCount = 0
    for ($i = 0; $i -lt [Math]::Min(3, $vetIds.Count); $i++) {
        $vetPref = @{
            veterinarianId = $vetIds[$i]
            displayOrder = $i + 1
            isActive = $true
        }
        $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/veterinarian-preferences" -Body $vetPref -Silent
        if ($response) { $vetPrefCount++ }
    }

    # Farm Breed Preferences (3 races favorites)
    $breedPrefCount = 0
    for ($i = 0; $i -lt [Math]::Min(3, $breedIds.Count); $i++) {
        $breedPref = @{
            breedId = $breedIds[$i]
        }
        $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/breed-preferences" -Body $breedPref -Silent
        if ($response) { $breedPrefCount++ }
    }

    # Farm Campaign Preferences (Inscription a 2 campagnes)
    $campaignPrefCount = 0
    for ($i = 0; $i -lt [Math]::Min(2, $nationalCampaignIds.Count); $i++) {
        $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/campaign-preferences/$($nationalCampaignIds[$i])/enroll" -Body @{} -Silent
        if ($response) { $campaignPrefCount++ }
    }

    Write-Host "    -> Produits favoris: $productPrefCount" -ForegroundColor Green
    Write-Host "    -> Vaccins favoris: $vaccinePrefCount" -ForegroundColor Green
    Write-Host "    -> Veterinaires favoris: $vetPrefCount" -ForegroundColor Green
    Write-Host "    -> Races favorites: $breedPrefCount" -ForegroundColor Green
    Write-Host "    -> Campagnes inscrites: $campaignPrefCount" -ForegroundColor Green
}

# =============================================================================
# 17. MEDICAL PRODUCTS (Produits de la ferme - 12 produits)
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "17. Medical Products (Stock ferme - 12 produits)" -ForegroundColor Cyan

    # Note: Uses nameFr field (Master Table Pattern with i18n support)
    $farmProducts = @(
        @{ nameFr = "Ivomec 1% Stock"; nameEn = "Ivomec 1% Stock"; commercialName = "Ivomec Injectable"; category = "antiparasitic"; activeIngredient = "Ivermectine"; manufacturer = "Boehringer Ingelheim"; withdrawalPeriodMeat = 28; withdrawalPeriodMilk = 0; currentStock = 15; minStock = 5; stockUnit = "flacon"; unitPrice = 25.50; batchNumber = "IV2024-001"; expiryDate = "2026-12-31T23:59:59.999Z"; type = "treatment"; targetSpecies = "bovine"; isActive = $true }
        @{ nameFr = "Clamoxyl LA Stock"; nameEn = "Clamoxyl LA Stock"; commercialName = "Clamoxyl LA"; category = "antibiotic"; activeIngredient = "Amoxicilline"; manufacturer = "Zoetis"; withdrawalPeriodMeat = 14; withdrawalPeriodMilk = 60; currentStock = 20; minStock = 8; stockUnit = "flacon"; unitPrice = 45.00; batchNumber = "CL2024-002"; expiryDate = "2026-06-30T23:59:59.999Z"; type = "treatment"; targetSpecies = "bovine"; isActive = $true }
        @{ nameFr = "Finadyne Stock"; nameEn = "Finadyne Stock"; commercialName = "Finadyne"; category = "anti_inflammatory"; activeIngredient = "Flunixine"; manufacturer = "MSD"; withdrawalPeriodMeat = 7; withdrawalPeriodMilk = 24; currentStock = 10; minStock = 5; stockUnit = "flacon"; unitPrice = 32.00; batchNumber = "FI2024-003"; expiryDate = "2026-09-30T23:59:59.999Z"; type = "treatment"; targetSpecies = "bovine"; isActive = $true }
        @{ nameFr = "Panacur Stock"; nameEn = "Panacur Stock"; commercialName = "Panacur"; category = "antiparasitic"; activeIngredient = "Fenbendazole"; manufacturer = "MSD"; withdrawalPeriodMeat = 14; withdrawalPeriodMilk = 0; currentStock = 25; minStock = 10; stockUnit = "sachet"; unitPrice = 8.50; batchNumber = "PA2024-004"; expiryDate = "2027-03-31T23:59:59.999Z"; type = "treatment"; targetSpecies = "bovine"; isActive = $true }
        @{ nameFr = "Calcium Injectable"; nameEn = "Injectable Calcium"; commercialName = "Calcium"; category = "vitamin_mineral"; activeIngredient = "Calcium borogluconate"; manufacturer = "Vetoquinol"; withdrawalPeriodMeat = 0; withdrawalPeriodMilk = 0; currentStock = 12; minStock = 5; stockUnit = "flacon"; unitPrice = 18.00; batchNumber = "CA2024-005"; expiryDate = "2026-11-30T23:59:59.999Z"; type = "treatment"; targetSpecies = "bovine"; isActive = $true }
        @{ nameFr = "Vitamine AD3E"; nameEn = "Vitamin AD3E"; commercialName = "Vitamine AD3E"; category = "vitamin_mineral"; activeIngredient = "Vitamines A, D3, E"; manufacturer = "CEVA"; withdrawalPeriodMeat = 0; withdrawalPeriodMilk = 0; currentStock = 8; minStock = 3; stockUnit = "flacon"; unitPrice = 22.00; batchNumber = "VI2024-006"; expiryDate = "2026-08-31T23:59:59.999Z"; type = "treatment"; targetSpecies = "bovine"; isActive = $true }
        @{ nameFr = "Oxytetracycline LA"; nameEn = "Oxytetracycline LA"; commercialName = "Oxytet"; category = "antibiotic"; activeIngredient = "Oxytetracycline"; manufacturer = "CEVA"; withdrawalPeriodMeat = 21; withdrawalPeriodMilk = 96; currentStock = 18; minStock = 8; stockUnit = "flacon"; unitPrice = 38.00; batchNumber = "OX2024-007"; expiryDate = "2026-07-31T23:59:59.999Z"; type = "treatment"; targetSpecies = "bovine"; isActive = $true }
        @{ nameFr = "Metacam Stock"; nameEn = "Metacam Stock"; commercialName = "Metacam"; category = "anti_inflammatory"; activeIngredient = "Meloxicam"; manufacturer = "Boehringer Ingelheim"; withdrawalPeriodMeat = 15; withdrawalPeriodMilk = 120; currentStock = 14; minStock = 6; stockUnit = "flacon"; unitPrice = 42.00; batchNumber = "ME2024-008"; expiryDate = "2026-10-31T23:59:59.999Z"; type = "treatment"; targetSpecies = "bovine"; isActive = $true }
        @{ nameFr = "Betadine Stock"; nameEn = "Betadine Stock"; commercialName = "Betadine"; category = "antiseptic"; activeIngredient = "Povidone iodee"; manufacturer = "Vetoquinol"; withdrawalPeriodMeat = 0; withdrawalPeriodMilk = 0; currentStock = 30; minStock = 10; stockUnit = "flacon"; unitPrice = 12.00; batchNumber = "BE2024-009"; expiryDate = "2027-12-31T23:59:59.999Z"; type = "treatment"; targetSpecies = "bovine"; isActive = $true }
        @{ nameFr = "Spray Cicatrisant"; nameEn = "Healing Spray"; commercialName = "Spray Oxy"; category = "antiseptic"; activeIngredient = "Oxytetracycline"; manufacturer = "Vetoquinol"; withdrawalPeriodMeat = 7; withdrawalPeriodMilk = 0; currentStock = 22; minStock = 8; stockUnit = "bombe"; unitPrice = 16.00; batchNumber = "SP2024-010"; expiryDate = "2027-06-30T23:59:59.999Z"; type = "treatment"; targetSpecies = "bovine"; isActive = $true }
        @{ nameFr = "Oxytocine Stock"; nameEn = "Oxytocin Stock"; commercialName = "Oxytocine"; category = "hormone"; activeIngredient = "Oxytocine"; manufacturer = "CEVA"; withdrawalPeriodMeat = 0; withdrawalPeriodMilk = 12; currentStock = 10; minStock = 5; stockUnit = "flacon"; unitPrice = 28.00; batchNumber = "OT2024-011"; expiryDate = "2026-04-30T23:59:59.999Z"; type = "treatment"; targetSpecies = "bovine"; isActive = $true }
        @{ nameFr = "Prostaglandine Stock"; nameEn = "Prostaglandin Stock"; commercialName = "PGF2alpha"; category = "hormone"; activeIngredient = "Prostaglandine"; manufacturer = "Zoetis"; withdrawalPeriodMeat = 0; withdrawalPeriodMilk = 24; currentStock = 8; minStock = 4; stockUnit = "flacon"; unitPrice = 52.00; batchNumber = "PG2024-012"; expiryDate = "2026-05-31T23:59:59.999Z"; type = "treatment"; targetSpecies = "bovine"; isActive = $true }
    )

    foreach ($product in $farmProducts) {
        $productResponse = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/medical-products" -Body $product -Silent
        $productId = Get-IdFromResponse $productResponse
        if ($productId) {
            $medicalProductIds += $productId
        }
    }
    Write-Host "    -> $($medicalProductIds.Count) produits en stock crees" -ForegroundColor Green
}

# =============================================================================
# 18. CUSTOM VACCINES (Vaccins personnalises - 3 vaccins)
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "18. Custom Vaccines (3 vaccins personnalises)" -ForegroundColor Cyan

    # Note: Uses nameFr field (Master Table Pattern with i18n support)
    $customVaccines = @(
        @{ nameFr = "Vaccin Brucellose B19 Local"; nameEn = "Brucellosis B19 Local"; description = "Vaccin contre la brucellose bovine - formule locale"; targetDisease = "Brucellose"; laboratoire = "Laboratoire Regional"; dosage = "2ml par animal" }
        @{ nameFr = "Vaccin Enterotoxemie Ovins"; nameEn = "Sheep Enterotoxemia"; description = "Vaccin enterotoxemie specifique ovins"; targetDisease = "Enterotoxemie"; laboratoire = "Labo Ovins"; dosage = "1ml par animal" }
        @{ nameFr = "Vaccin Multivalent Ferme"; nameEn = "Farm Multivalent"; description = "Vaccin multivalent formule ferme"; targetDisease = "Multiple"; laboratoire = "Production Locale"; dosage = "2.5ml par animal" }
    )

    foreach ($vaccine in $customVaccines) {
        $vaccineResponse = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/vaccines" -Body $vaccine -Silent
        $vaccineId = Get-IdFromResponse $vaccineResponse
        if ($vaccineId) {
            $customVaccineIds += $vaccineId
        }
    }
    Write-Host "    -> $($customVaccineIds.Count) vaccins personnalises crees" -ForegroundColor Green
}

# =============================================================================
# 19. LOTS (10 lots varies)
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "19. Lots (10 lots)" -ForegroundColor Cyan

    $lots = @(
        @{ name = "Lot Vaches Laitieres"; type = "production"; status = "open" }
        @{ name = "Lot Genisses 2024"; type = "reproduction"; status = "open" }
        @{ name = "Lot Vente Automne 2024"; type = "sale"; status = "closed" }
        @{ name = "Lot Traitement Parasites Mars"; type = "treatment"; status = "completed" }
        @{ name = "Lot Vaccination Printemps"; type = "vaccination"; status = "completed" }
        @{ name = "Lot Brebis Laitieres"; type = "production"; status = "open" }
        @{ name = "Lot Agneaux Printemps 2024"; type = "birth"; status = "open" }
        @{ name = "Lot Reforme 2024"; type = "sale"; status = "open" }
        @{ name = "Lot Quarantaine"; type = "quarantine"; status = "open" }
        @{ name = "Lot Engraissement"; type = "fattening"; status = "open" }
    )

    foreach ($lot in $lots) {
        $lotResponse = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/lots" -Body $lot -Silent
        $lotId = Get-IdFromResponse $lotResponse
        if ($lotId) {
            $lotIds += $lotId
        }
    }
    Write-Host "    -> $($lotIds.Count) lots crees" -ForegroundColor Green
}

# =============================================================================
# 20. ANIMAUX (100 animaux: 70% bovins, 30% ovins)
# =============================================================================
if ($farmResponse -and $breedIds.Count -gt 0) {
    Write-Host ""
    Write-Host "20. Animals (100 animaux: ~70 bovins, ~30 ovins)" -ForegroundColor Cyan
    Write-Host "    Statuts: 70-75 vivants, 10-12 vendus, 5-8 morts, 5-8 abattus" -ForegroundColor Gray
    Write-Host ""

    # Races bovines et ovines
    $bovineBreeds = $breedIds[0..4]  # 5 premieres races = bovins
    $ovineBreeds = $breedIds[5..7]   # 3 dernieres races = ovins

    # Statuts et leur répartition
    $animalStatuses = @(
        @{ status = "alive"; count = 72 }
        @{ status = "sold"; count = 11 }
        @{ status = "dead"; count = 7 }
        @{ status = "slaughtered"; count = 10 }
    )

    $animalCounter = 0
    $birthStartDate = Get-Date "2020-01-01"
    $birthEndDate = Get-Date "2025-06-01"

    foreach ($statusGroup in $animalStatuses) {
        $status = $statusGroup.status
        $count = $statusGroup.count

        for ($i = 0; $i -lt $count; $i++) {
            $animalCounter++

            # 70% bovins, 30% ovins
            $isBovine = ($animalCounter % 10) -le 6
            $speciesId = if ($isBovine) { "bovine" } else { "ovine" }
            $breedId = if ($isBovine) {
                $bovineBreeds | Get-Random
            } else {
                $ovineBreeds | Get-Random
            }

            # Sexe aléatoire
            $sex = if ((Get-Random -Minimum 0 -Maximum 2) -eq 0) { "male" } else { "female" }

            # Date de naissance aléatoire (entre 6 mois et 5 ans)
            $birthDate = Get-RandomDate -Start $birthStartDate -End $birthEndDate

            # Générer ID électronique et numéro
            $eidNumber = "2502690" + ("{0:D8}" -f (Get-Random -Minimum 1 -Maximum 99999999))
            $officialNumber = "FR-{0}-{1:D5}" -f (Get-Date $birthDate -Format "yyyy"), (Get-Random -Minimum 1 -Maximum 99999)
            $visualId = if ($isBovine) {
                @("Belle", "Marguerite", "Duchesse", "Fauvette", "Iris", "Lilas", "Noisette", "Pivoine", "Rose", "Tulipe",
                  "Cesar", "Django", "Elliot", "Faust", "Gaspard", "Hugo", "Igor", "Jules", "Lancelot", "Nestor") | Get-Random
            } else {
                @("Blanchette", "Cannelle", "Doucette", "Etoile", "Flocon", "Grisette", "Lulu", "Noisette", "Perle", "Violette",
                  "Alphonse", "Basile", "Caramel", "Dominique", "Edmond", "Felix", "Gaston", "Leon", "Marius", "Oscar") | Get-Random
            }
            $visualId += "-" + $animalCounter.ToString("D3")

            $animal = @{
                id = [guid]::NewGuid().ToString()
                birthDate = $birthDate
                sex = $sex
                currentEid = $eidNumber
                officialNumber = $officialNumber
                visualId = $visualId
                speciesId = $speciesId
                breedId = $breedId
                status = $status
                notes = "Animal de test - Statut: $status"
            }

            # Si animal mort/abattu/vendu, ajouter date
            if ($status -eq "dead") {
                $deathDate = Get-RandomDate -Start (Get-Date $birthDate).AddMonths(6) -End $endDate
                $animal.deathDate = $deathDate
                $animal.deathReason = @("maladie", "accident", "vieillesse") | Get-Random
            } elseif ($status -eq "slaughtered") {
                $slaughterDate = Get-RandomDate -Start (Get-Date $birthDate).AddYears(1) -End $endDate
                $animal.slaughterDate = $slaughterDate
            } elseif ($status -eq "sold") {
                $saleDate = Get-RandomDate -Start (Get-Date $birthDate).AddMonths(8) -End $endDate
                $animal.saleDate = $saleDate
            }

            $animalResponse = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/animals" -Body $animal -Silent
            $animalIdResult = Get-IdFromResponse $animalResponse

            if ($animalIdResult) {
                $animalIds += $animal.id  # Stocker l'ID qu'on a envoyé

                # Afficher progression tous les 10 animaux
                if ($animalCounter % 10 -eq 0) {
                    Write-Host "    -> Animaux: $animalCounter/100 crees..." -ForegroundColor Cyan
                }
            }
        }
    }

    Write-Host ""
    Write-Host "    -> TOTAL: $($animalIds.Count) animaux crees avec succes!" -ForegroundColor Green
}

# =============================================================================
# 21. LOT-ANIMALS (Affecter animaux aux lots)
# =============================================================================
if ($farmResponse -and $lotIds.Count -gt 0 -and $animalIds.Count -gt 0) {
    Write-Host ""
    Write-Host "21. Lot-Animals (Affectation aux lots)" -ForegroundColor Cyan

    $lotAnimalCount = 0
    # Affecter chaque animal a 1-2 lots aleatoires
    foreach ($animalId in $animalIds) {
        $numLots = Get-Random -Minimum 1 -Maximum 3
        $selectedLots = $lotIds | Get-Random -Count $numLots

        foreach ($lotId in $selectedLots) {
            $lotAnimalDto = @{
                animalIds = @($animalId)
            }
            $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/lots/$lotId/animals" -Body $lotAnimalDto -Silent
            if ($response) { $lotAnimalCount++ }
        }
    }
    Write-Host "    -> $lotAnimalCount affectations animal-lot creees" -ForegroundColor Green
}

# =============================================================================
# 22. VACCINATIONS (~250-300 vaccinations)
# =============================================================================
if ($farmResponse -and $animalIds.Count -gt 0 -and $globalVaccineIds.Count -gt 0) {
    Write-Host ""
    Write-Host "22. Vaccinations (~250-300 vaccinations)" -ForegroundColor Cyan

    $vaccinationCount = 0
    $vaccineNames = @("Enterotoxemie", "Brucellose", "Bluetongue", "Fievre Aphteuse", "Rage", "Charbon", "Pasteurellose", "PPR", "Variole", "Multivalent")

    # 2-3 vaccinations par animal
    foreach ($animalId in $animalIds) {
        $numVaccinations = Get-Random -Minimum 2 -Maximum 4

        for ($i = 0; $i -lt $numVaccinations; $i++) {
            $vaccineDate = Get-RandomDate -Start (Get-Date "2023-01-01") -End $endDate
            $nextDueDate = (Get-Date $vaccineDate).AddYears(1).ToString("yyyy-MM-ddT00:00:00.000Z")

            $vaccination = @{
                animalId = $animalId
                vaccineName = $vaccineNames | Get-Random
                type = @("obligatoire", "recommandee", "preventive") | Get-Random
                disease = @("enterotoxemia", "brucellosis", "bluetongue", "foot_and_mouth", "rabies", "pasteurellosis", "other") | Get-Random
                vaccinationDate = $vaccineDate
                nextDueDate = $nextDueDate
                dose = @("1ml", "2ml", "2.5ml", "3ml", "5ml") | Get-Random
                administrationRoute = @("IM", "SC") | Get-Random
                withdrawalPeriodDays = Get-Random -Minimum 0 -Maximum 30
                batchNumber = "VAC2024-" + (Get-Random -Minimum 100 -Maximum 999)
                expiryDate = "2026-12-31T23:59:59.999Z"
                cost = Get-Random -Minimum 8.0 -Maximum 25.0
                notes = "Vaccination de routine"
            }

            if ($vetIds.Count -gt 0) {
                $vaccination.veterinarianId = $vetIds | Get-Random
                $vaccination.veterinarianName = "Dr. Veterinaire"
            }

            $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/vaccinations" -Body $vaccination -Silent
            if ($response) { $vaccinationCount++ }

            # Afficher progression tous les 50
            if ($vaccinationCount % 50 -eq 0) {
                Write-Host "    -> Vaccinations: $vaccinationCount creees..." -ForegroundColor Cyan
            }
        }
    }
    Write-Host ""
    Write-Host "    -> TOTAL: $vaccinationCount vaccinations creees" -ForegroundColor Green
}

# =============================================================================
# 23. TREATMENTS (~200-250 traitements)
# =============================================================================
if ($farmResponse -and $animalIds.Count -gt 0 -and $medicalProductIds.Count -gt 0) {
    Write-Host ""
    Write-Host "23. Treatments (~200-250 traitements)" -ForegroundColor Cyan

    $treatmentCount = 0
    $productNames = @("Ivomec", "Clamoxyl", "Finadyne", "Panacur", "Calcium", "Vitamine", "Oxytetracycline", "Metacam", "Betadine", "Spray", "Oxytocine", "Prostaglandine")

    # 2-3 traitements par animal
    foreach ($animalId in $animalIds) {
        $numTreatments = Get-Random -Minimum 2 -Maximum 4

        for ($i = 0; $i -lt $numTreatments; $i++) {
            $treatmentDate = Get-RandomDate -Start (Get-Date "2023-01-01") -End $endDate
            $withdrawalDays = Get-Random -Minimum 0 -Maximum 60
            $withdrawalEndDate = (Get-Date $treatmentDate).AddDays($withdrawalDays).ToString("yyyy-MM-ddT00:00:00.000Z")

            $treatment = @{
                animalId = $animalId
                productId = $medicalProductIds | Get-Random
                productName = $productNames | Get-Random
                treatmentDate = $treatmentDate
                dose = (Get-Random -Minimum 1.0 -Maximum 10.0)
                dosage = (Get-Random -Minimum 1.0 -Maximum 10.0)
                dosageUnit = @("ml", "mg", "g", "comprime") | Get-Random
                duration = Get-Random -Minimum 1 -Maximum 7
                status = @("completed", "in_progress", "planned") | Get-Random
                withdrawalEndDate = $withdrawalEndDate
                diagnosis = @("Infection respiratoire", "Parasitose", "Boiterie", "Mammite", "Diarrhee", "Fievre", "Plaie", "Reproduction") | Get-Random
                cost = Get-Random -Minimum 15.0 -Maximum 80.0
                notes = "Traitement therapeutique"
            }

            if ($vetIds.Count -gt 0) {
                $treatment.veterinarianId = $vetIds | Get-Random
                $treatment.veterinarianName = "Dr. Veterinaire"
            }

            $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/treatments" -Body $treatment -Silent
            if ($response) { $treatmentCount++ }

            if ($treatmentCount % 50 -eq 0) {
                Write-Host "    -> Traitements: $treatmentCount crees..." -ForegroundColor Cyan
            }
        }
    }
    Write-Host ""
    Write-Host "    -> TOTAL: $treatmentCount traitements crees" -ForegroundColor Green
}

# =============================================================================
# 24. MOVEMENTS (~150-200 mouvements)
# =============================================================================
if ($farmResponse -and $animalIds.Count -gt 0) {
    Write-Host ""
    Write-Host "24. Movements (~150-200 mouvements)" -ForegroundColor Cyan

    $movementCount = 0

    # 1-2 mouvements par animal
    foreach ($animalId in $animalIds) {
        $numMovements = Get-Random -Minimum 1 -Maximum 3

        for ($i = 0; $i -lt $numMovements; $i++) {
            $movementDate = Get-RandomDate -Start (Get-Date "2023-01-01") -End $endDate
            $movementType = @("entry", "exit", "transfer", "birth", "purchase") | Get-Random

            $movement = @{
                movementType = $movementType
                movementDate = $movementDate
                animalIds = @($animalId)
                reason = switch ($movementType) {
                    "entry" { @("Achat", "Naissance", "Retour") | Get-Random }
                    "exit" { @("Vente", "Reforme", "Abattage") | Get-Random }
                    "transfer" { "Changement de batiment" }
                    "birth" { "Naissance a la ferme" }
                    "purchase" { "Achat en elevage" }
                }
                notes = "Mouvement type $movementType"
            }

            $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/movements" -Body $movement -Silent
            if ($response) { $movementCount++ }

            if ($movementCount % 50 -eq 0) {
                Write-Host "    -> Mouvements: $movementCount crees..." -ForegroundColor Cyan
            }
        }
    }
    Write-Host ""
    Write-Host "    -> TOTAL: $movementCount mouvements crees" -ForegroundColor Green
}

# =============================================================================
# 25. WEIGHTS (~400-500 pesees)
# =============================================================================
if ($farmResponse -and $animalIds.Count -gt 0) {
    Write-Host ""
    Write-Host "25. Weights (~400-500 pesees)" -ForegroundColor Cyan

    $weightCount = 0

    # 4-5 pesees par animal (suivi de croissance)
    foreach ($animalId in $animalIds) {
        $numWeights = Get-Random -Minimum 4 -Maximum 6
        $baseWeight = Get-Random -Minimum 250 -Maximum 500  # Poids de base

        for ($i = 0; $i -lt $numWeights; $i++) {
            $weightDate = Get-RandomDate -Start (Get-Date "2023-01-01") -End $endDate
            $weightValue = $baseWeight + ($i * (Get-Random -Minimum 20 -Maximum 60))  # Croissance

            $weight = @{
                animalId = $animalId
                weight = [Math]::Round($weightValue, 1)
                weightDate = $weightDate
                source = @("manual", "automatic", "weighbridge") | Get-Random
                notes = "Pesee periodique #$($i + 1)"
            }

            $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/weights" -Body $weight -Silent
            if ($response) { $weightCount++ }

            if ($weightCount % 100 -eq 0) {
                Write-Host "    -> Pesees: $weightCount creees..." -ForegroundColor Cyan
            }
        }
    }
    Write-Host ""
    Write-Host "    -> TOTAL: $weightCount pesees creees" -ForegroundColor Green
}

# =============================================================================
# 26. BREEDINGS (~40-50 reproductions)
# =============================================================================
if ($farmResponse -and $animalIds.Count -gt 0) {
    Write-Host ""
    Write-Host "26. Breedings (~40-50 reproductions)" -ForegroundColor Cyan

    $breedingCount = 0

    # Reproductions pour environ 40-50% des animaux (femelles)
    $numBreedings = [Math]::Min(50, ($animalIds.Count * 0.45))
    $selectedAnimals = $animalIds | Get-Random -Count $numBreedings

    foreach ($animalId in $selectedAnimals) {
        $breedingDate = Get-RandomDate -Start (Get-Date "2023-01-01") -End (Get-Date "2024-12-31")
        $expectedBirthDate = (Get-Date $breedingDate).AddMonths(9).ToString("yyyy-MM-ddT00:00:00.000Z")

        $breeding = @{
            motherId = $animalId
            fatherName = @("Taureau Elite", "Taureau Limousin", "Belier Ile-de-France", "Reproducteur IA") | Get-Random
            method = @("artificial_insemination", "natural_mating") | Get-Random
            breedingDate = $breedingDate
            expectedBirthDate = $expectedBirthDate
            expectedOffspringCount = Get-Random -Minimum 1 -Maximum 3
            status = @("planned", "confirmed", "delivered", "failed") | Get-Random
            notes = "Saillie IA ou monte naturelle"
        }

        if ($vetIds.Count -gt 0) {
            $breeding.veterinarianId = $vetIds | Get-Random
            $breeding.veterinarianName = "Dr. Veterinaire"
        }

        $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/breedings" -Body $breeding -Silent
        if ($response) { $breedingCount++ }

        if ($breedingCount % 10 -eq 0) {
            Write-Host "    -> Reproductions: $breedingCount creees..." -ForegroundColor Cyan
        }
    }
    Write-Host ""
    Write-Host "    -> TOTAL: $breedingCount reproductions creees" -ForegroundColor Green
}

# =============================================================================
# 27. DOCUMENTS (~100-120 documents)
# =============================================================================
if ($farmResponse -and $animalIds.Count -gt 0) {
    Write-Host ""
    Write-Host "27. Documents (~100-120 documents)" -ForegroundColor Cyan

    $documentCount = 0

    # 1 document par animal
    foreach ($animalId in $animalIds) {
        $uploadDate = Get-RandomDate -Start (Get-Date "2023-01-01") -End $endDate
        $issueDate = $uploadDate
        $expiryDate = (Get-Date $issueDate).AddYears(1).ToString("yyyy-MM-ddT00:00:00.000Z")

        $docType = @("health_certificate", "movement_permit", "test_results", "pedigree", "insurance", "other") | Get-Random
        $docTitle = switch ($docType) {
            "health_certificate" { "Certificat sanitaire" }
            "movement_permit" { "Autorisation de mouvement" }
            "test_results" { "Resultats d'analyses" }
            "pedigree" { "Certificat de genealogie" }
            "insurance" { "Attestation d'assurance" }
            "other" { "Document divers" }
        }

        $document = @{
            animalId = $animalId
            type = $docType
            title = $docTitle
            fileName = $docTitle.Replace(" ", "-").ToLower() + "-" + (Get-Random -Minimum 1000 -Maximum 9999) + ".pdf"
            fileUrl = "https://example.com/documents/animal-$animalId/" + $docTitle.Replace(" ", "-").ToLower() + ".pdf"
            fileSizeBytes = Get-Random -Minimum 50000 -Maximum 500000
            mimeType = "application/pdf"
            uploadDate = $uploadDate
            documentNumber = "DOC-FR-" + (Get-Date $issueDate -Format "yyyy") + "-" + (Get-Random -Minimum 10000 -Maximum 99999)
            issueDate = $issueDate
            expiryDate = $expiryDate
            notes = "Document officiel"
        }

        $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/documents" -Body $document -Silent
        if ($response) { $documentCount++ }

        if ($documentCount % 25 -eq 0) {
            Write-Host "    -> Documents: $documentCount crees..." -ForegroundColor Cyan
        }
    }
    Write-Host ""
    Write-Host "    -> TOTAL: $documentCount documents crees" -ForegroundColor Green
}

# =============================================================================
# 28. PERSONAL CAMPAIGNS (4 campagnes personnelles)
# =============================================================================
if ($farmResponse -and $animalIds.Count -gt 0 -and $medicalProductIds.Count -gt 0) {
    Write-Host ""
    Write-Host "28. Personal Campaigns (4 campagnes personnelles)" -ForegroundColor Cyan

    $campaigns = @(
        @{ name = "Campagne Deparasitage Printemps 2024"; type = "deworming"; campaignDate = "2024-03-15T00:00:00.000Z"; withdrawalEndDate = "2024-04-15T00:00:00.000Z"; targetCount = 80 }
        @{ name = "Campagne Vaccination Automne 2024"; type = "vaccination"; campaignDate = "2024-09-01T00:00:00.000Z"; withdrawalEndDate = "2024-10-01T00:00:00.000Z"; targetCount = 95 }
        @{ name = "Traitement Antiparasitaire Ete"; type = "treatment"; campaignDate = "2024-06-15T00:00:00.000Z"; withdrawalEndDate = "2024-07-15T00:00:00.000Z"; targetCount = 70 }
        @{ name = "Campagne Depistage Brucellose"; type = "screening"; campaignDate = "2024-05-01T00:00:00.000Z"; withdrawalEndDate = "2024-05-31T00:00:00.000Z"; targetCount = 100 }
    )

    $campaignCount = 0
    foreach ($campaignData in $campaigns) {
        # Selectionner des animaux aleatoires pour la campagne
        $targetAnimals = $animalIds | Get-Random -Count ([Math]::Min($campaignData.targetCount, $animalIds.Count))

        $personalCampaign = @{
            name = $campaignData.name
            description = "Campagne personnalisee de la ferme"
            productId = $medicalProductIds | Get-Random
            productName = "Produit medical"
            type = $campaignData.type
            campaignDate = $campaignData.campaignDate
            withdrawalEndDate = $campaignData.withdrawalEndDate
            animalIdsJson = ($targetAnimals | ConvertTo-Json -Compress)
            targetCount = $campaignData.targetCount
            status = @("planned", "in_progress", "completed") | Get-Random
            notes = "Campagne de gestion sanitaire"
        }

        if ($vetIds.Count -gt 0) {
            $personalCampaign.veterinarianId = $vetIds | Get-Random
            $personalCampaign.veterinarianName = "Dr. Veterinaire"
        }

        $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/personal-campaigns" -Body $personalCampaign `
            -Description "  Campagne: $($campaignData.name)"
        if ($response) { $campaignCount++ }
    }
    Write-Host "    -> $campaignCount campagnes personnelles creees" -ForegroundColor Green
}

# =============================================================================
# RESUME FINAL
# =============================================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  SEED 100 ANIMAUX - TERMINE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resume complet:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tables de reference:" -ForegroundColor Yellow
Write-Host "  - 5 pays europeens" -ForegroundColor White
Write-Host "  - 5 routes d'administration" -ForegroundColor White
Write-Host "  - 15 produits globaux" -ForegroundColor White
Write-Host "  - 10 vaccins globaux" -ForegroundColor White
Write-Host "  - 4 campagnes nationales" -ForegroundColor White
Write-Host "  - 6 templates d'alertes" -ForegroundColor White
Write-Host "  - 2 especes (bovine, ovine)" -ForegroundColor White
Write-Host "  - 8 races (5 bovines + 3 ovines)" -ForegroundColor White
Write-Host ""
Write-Host "Ferme et configuration:" -ForegroundColor Yellow
Write-Host "  - 1 ferme (GAEC de la Vallee Verte)" -ForegroundColor White
Write-Host "  - 5 veterinaires" -ForegroundColor White
Write-Host "  - Alert configuration complete" -ForegroundColor White
Write-Host "  - Farm preferences (langue, unite, devise)" -ForegroundColor White
Write-Host "  - Favoris: 5 produits, 4 vaccins, 3 vets, 3 races" -ForegroundColor White
Write-Host "  - 2 inscriptions aux campagnes nationales" -ForegroundColor White
Write-Host ""
Write-Host "Produits et lots:" -ForegroundColor Yellow
Write-Host "  - 12 produits medicaux en stock" -ForegroundColor White
Write-Host "  - 3 vaccins personnalises" -ForegroundColor White
Write-Host "  - 10 lots varies" -ForegroundColor White
Write-Host ""
Write-Host "Animaux et donnees transactionnelles:" -ForegroundColor Yellow
Write-Host "  - $($animalIds.Count) animaux (70% bovins, 30% ovins)" -ForegroundColor Green
Write-Host "    * 72 vivants, 11 vendus, 7 morts, 10 abattus" -ForegroundColor White
Write-Host "  - ~100 affectations lot-animaux" -ForegroundColor Green
Write-Host "  - ~250-300 vaccinations" -ForegroundColor Green
Write-Host "  - ~200-250 traitements" -ForegroundColor Green
Write-Host "  - ~150-200 mouvements" -ForegroundColor Green
Write-Host "  - ~400-500 pesees" -ForegroundColor Green
Write-Host "  - ~40-50 reproductions" -ForegroundColor Green
Write-Host "  - ~100 documents" -ForegroundColor Green
Write-Host "  - 4 campagnes personnelles" -ForegroundColor Green
Write-Host ""
Write-Host "Donnees etalees sur la periode 2023-2025" -ForegroundColor Gray
Write-Host ""
Write-Host "Base de donnees prete pour les tests!" -ForegroundColor Green
Write-Host ""
