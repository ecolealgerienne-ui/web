# API Signatures V1 - Livestock Management System (PAPS2)

**Version:** 2.0
**Last Updated:** 2025-11-26
**Purpose:** Accurate API specifications after Master Table Pattern migration

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Master Table Pattern](#2-master-table-pattern)
3. [Enums Reference](#3-enums-reference)
4. [Farm-Scoped Endpoints](#4-farm-scoped-endpoints)
5. [Global/Admin Endpoints](#5-globaladmin-endpoints)
6. [Reference Data Endpoints](#6-reference-data-endpoints)
7. [Validation Rules](#7-validation-rules)
8. [Error Response Format](#8-error-response-format)

---

## 1. Overview & Architecture

### Base URL
```
Development: http://localhost:3000
```

### Authentication
All API requests require:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Response Format
All successful responses follow this structure:
```json
{
  "success": true,
  "data": { /* entity or array */ },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  },
  "timestamp": "2025-11-26T10:30:00.000Z"
}
```

---

## 2. Master Table Pattern

### Concept
Tables use `scope` field to distinguish between admin-created (global) and farm-specific (local) records.

| Scope | Description | farmId |
|-------|-------------|--------|
| `global` | Admin-created, available to all farms | `NULL` |
| `local` | Farm-specific, only visible to that farm | `UUID` |

### Unified Tables (After Migration)

| Old Tables | New Unified Table |
|------------|-------------------|
| `GlobalMedicalProduct` + `CustomMedicalProduct` | `MedicalProduct` |
| `VaccineGlobal` + `CustomVaccine` | `Vaccine` |
| `Veterinarian` | `Veterinarian` (with scope) |

---

## 3. Enums Reference

### AnimalStatus
```typescript
enum AnimalStatus {
  ALIVE = 'alive',
  SOLD = 'sold',
  DEAD = 'dead',
  SLAUGHTERED = 'slaughtered',
  DRAFT = 'draft',
}
```

### Sex
```typescript
enum Sex {
  MALE = 'male',
  FEMALE = 'female',
}
```

### TreatmentStatus
```typescript
enum TreatmentStatus {
  SCHEDULED = 'scheduled',      // NOT 'planned'
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
```

### MedicalProductType
```typescript
enum MedicalProductType {
  antibiotic = 'antibiotic',
  anti_inflammatory = 'anti_inflammatory',
  antiparasitic = 'antiparasitic',
  vitamin = 'vitamin',
  mineral = 'mineral',
  vaccine = 'vaccine',
  anesthetic = 'anesthetic',
  hormone = 'hormone',
  other = 'other',
}
```

### VaccineTargetDisease
```typescript
enum VaccineTargetDisease {
  brucellosis = 'brucellosis',
  bluetongue = 'bluetongue',
  foot_and_mouth = 'foot_and_mouth',
  rabies = 'rabies',
  anthrax = 'anthrax',
  lumpy_skin = 'lumpy_skin',
  ppr = 'ppr',                    // Peste Petits Ruminants
  sheep_pox = 'sheep_pox',
  enterotoxemia = 'enterotoxemia',
  pasteurellosis = 'pasteurellosis',
  other = 'other',
}
```

### MovementType
```typescript
enum MovementType {
  ENTRY = 'entry',
  EXIT = 'exit',
  BIRTH = 'birth',
  DEATH = 'death',
  SALE = 'sale',
  PURCHASE = 'purchase',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  TEMPORARY_OUT = 'temporary_out',
  TEMPORARY_RETURN = 'temporary_return',
}
```

### BreedingStatus
```typescript
enum BreedingStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  ABORTED = 'aborted',
  DELIVERED = 'delivered',
}
```

### BreedingMethod
```typescript
enum BreedingMethod {
  NATURAL = 'natural',
  ARTIFICIAL_INSEMINATION = 'artificial_insemination',
  EMBRYO_TRANSFER = 'embryo_transfer',
}
```

### WeightSource
```typescript
enum WeightSource {
  MANUAL = 'manual',
  SCALE = 'scale',
  ESTIMATED = 'estimated',
}
```

---

## 4. Farm-Scoped Endpoints

All farm endpoints use pattern: `/farms/:farmId/{resource}`

---

### 4.1 Animals

**Endpoint:** `POST /farms/:farmId/animals`

**Request Body:**
```json
{
  "id": "uuid (required)",
  "birthDate": "ISO 8601 date (required)",
  "sex": "male | female (required)",
  "currentEid": "string (optional, max 15 chars)",
  "officialNumber": "string (optional)",
  "visualId": "string (optional)",
  "speciesId": "string (optional)",
  "breedId": "string (optional)",
  "motherId": "uuid (optional)",
  "status": "draft | alive | sold | dead | slaughtered (optional, default: draft)",
  "photoUrl": "string (optional)",
  "notes": "string (optional, max 1000 chars)"
}
```

**Endpoint:** `GET /farms/:farmId/animals?limit=50&page=1`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Items per page (default: 50) |
| `page` | number | Page number (default: 1) |
| `speciesId` | string | Filter by species |
| `breedId` | string | Filter by breed |
| `status` | string | Filter by status |
| `sex` | string | Filter by sex |

---

### 4.2 Medical Products (Unified Table)

**Endpoint:** `GET /farms/:farmId/medical-products`

Returns both **global** (scope=global) and **local** (scope=local, farmId=:farmId) products.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name |
| `scope` | string | `global`, `local`, or `all` (default: all) |
| `category` | string | Filter by category |
| `type` | MedicalProductType | Filter by type |
| `isActive` | boolean | Filter active products |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Endpoint:** `POST /farms/:farmId/medical-products`

Creates a **local** product (scope=local) for this farm.

**Request Body:**
```json
{
  "id": "uuid (optional)",
  "nameFr": "string (required)",
  "nameEn": "string (optional)",
  "nameAr": "string (optional)",
  "commercialName": "string (optional)",
  "code": "string (optional)",
  "description": "string (optional)",
  "type": "MedicalProductType (optional)",
  "category": "string (optional)",
  "principeActif": "string (optional)",
  "activeIngredient": "string (optional)",
  "laboratoire": "string (optional)",
  "manufacturer": "string (optional)",
  "withdrawalPeriodMeat": "number (optional, days)",
  "withdrawalPeriodMilk": "number (optional, days)",
  "currentStock": "number (optional, default: 0)",
  "minStock": "number (optional, default: 0)",
  "stockUnit": "string (optional)",
  "unitPrice": "number (optional)",
  "batchNumber": "string (optional)",
  "expiryDate": "ISO 8601 date (optional)",
  "targetSpecies": "string (optional)",
  "isActive": "boolean (optional, default: true)"
}
```

---

### 4.3 Vaccines (Unified Table)

**Endpoint:** `GET /farms/:farmId/vaccines`

Returns both **global** and **local** vaccines.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name |
| `scope` | string | `global`, `local`, or `all` |
| `targetDisease` | VaccineTargetDisease | Filter by disease |
| `isActive` | boolean | Filter active vaccines |

**Endpoint:** `POST /farms/:farmId/vaccines`

Creates a **local** vaccine (scope=local) for this farm.

**Request Body:**
```json
{
  "id": "uuid (optional)",
  "nameFr": "string (required)",
  "nameEn": "string (optional)",
  "nameAr": "string (optional)",
  "code": "string (optional)",
  "description": "string (optional)",
  "targetDisease": "VaccineTargetDisease (optional)",
  "laboratoire": "string (optional)",
  "numeroAMM": "string (optional)",
  "dosage": "string (optional)",
  "dosageRecommande": "string (optional)",
  "dureeImmunite": "number (optional, days)",
  "isActive": "boolean (optional, default: true)"
}
```

---

### 4.4 Veterinarians

**Endpoint:** `GET /farms/:farmId/veterinarians`

**Endpoint:** `POST /farms/:farmId/veterinarians`

**Request Body:**
```json
{
  "id": "uuid (optional)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "title": "string (optional)",
  "licenseNumber": "string (required)",
  "specialties": "string (optional)",
  "clinic": "string (optional)",
  "phone": "string (required)",
  "mobile": "string (optional)",
  "email": "email (optional)",
  "address": "string (optional)",
  "city": "string (optional)",
  "postalCode": "string (optional)",
  "country": "string (optional)",
  "isAvailable": "boolean (optional, default: true)",
  "emergencyService": "boolean (optional, default: false)",
  "workingHours": "string (optional)",
  "consultationFee": "number (optional)",
  "emergencyFee": "number (optional)",
  "currency": "string (optional)",
  "notes": "string (optional)",
  "isPreferred": "boolean (optional)",
  "isDefault": "boolean (optional)",
  "isActive": "boolean (optional, default: true)"
}
```

---

### 4.5 Treatments

**Endpoint:** `GET /farms/:farmId/treatments`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `animalId` | uuid | Filter by animal |
| `status` | TreatmentStatus | Filter by status |
| `fromDate` | ISO date | Filter from date |
| `toDate` | ISO date | Filter to date |

**Endpoint:** `POST /farms/:farmId/treatments`

**Request Body:**
```json
{
  "id": "uuid (optional)",
  "animalId": "uuid (required - XOR with animal_ids)",
  "animal_ids": ["uuid"] (optional - XOR with animalId, for batch),
  "productId": "uuid (required)",
  "productName": "string (required)",
  "treatmentDate": "ISO 8601 date (required)",
  "dose": "number (required)",
  "withdrawalEndDate": "ISO 8601 date (required, must be >= treatmentDate)",
  "veterinarianId": "uuid (optional)",
  "veterinarianName": "string (optional)",
  "campaignId": "uuid (optional)",
  "routeId": "uuid (optional)",
  "diagnosis": "string (optional)",
  "dosage": "number (optional)",
  "dosageUnit": "string (optional, e.g. 'ml', 'mg', 'g')",
  "duration": "number (optional, days)",
  "status": "TreatmentStatus (optional, default: completed)",
  "cost": "number (optional)",
  "notes": "string (optional)"
}
```

**Important:** Either `animalId` OR `animal_ids` must be provided, not both (XOR validation).

---

### 4.6 Vaccinations

**Endpoint:** `GET /farms/:farmId/vaccinations`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `animalId` | uuid | Filter by animal |
| `type` | string | Filter by type |
| `fromDate` | ISO date | Filter from date |
| `toDate` | ISO date | Filter to date |

**Endpoint:** `POST /farms/:farmId/vaccinations`

**Request Body:**
```json
{
  "id": "uuid (optional)",
  "animalId": "uuid (required - XOR with animal_ids)",
  "animalIds": "string (legacy - comma-separated)",
  "animal_ids": ["uuid"] (optional - XOR with animalId, for batch),
  "vaccineName": "string (required)",
  "type": "string (required: obligatoire | recommandee | preventive)",
  "disease": "string (required)",
  "vaccinationDate": "ISO 8601 date (required)",
  "nextDueDate": "ISO 8601 date (optional, must be >= vaccinationDate)",
  "dose": "string (required)",
  "administrationRoute": "string (required, e.g. 'IM', 'SC')",
  "withdrawalPeriodDays": "number (required)",
  "veterinarianId": "uuid (optional)",
  "veterinarianName": "string (optional)",
  "batchNumber": "string (optional)",
  "expiryDate": "ISO 8601 date (optional)",
  "dosage": "number (optional)",
  "cost": "number (optional)",
  "notes": "string (optional)"
}
```

**Important:** Exactly ONE of `animalId`, `animalIds`, or `animal_ids` must be provided (XOR validation).

---

### 4.7 Weights

**Endpoint:** `POST /farms/:farmId/weights`

**Request Body:**
```json
{
  "animalId": "uuid (required)",
  "weight": "number (required, kg)",
  "weightDate": "ISO 8601 date (required)",
  "source": "manual | automatic | weighbridge (optional)",
  "notes": "string (optional)"
}
```

---

### 4.8 Movements

**Endpoint:** `POST /farms/:farmId/movements`

**Request Body:**
```json
{
  "movementType": "MovementType (required)",
  "movementDate": "ISO 8601 date (required)",
  "animalIds": ["uuid"] (required),
  "reason": "string (optional)",
  "notes": "string (optional)"
}
```

---

### 4.9 Breedings

**Endpoint:** `POST /farms/:farmId/breedings`

**Request Body:**
```json
{
  "motherId": "uuid (required)",
  "fatherId": "uuid (optional)",
  "fatherName": "string (optional, when fatherId is null)",
  "method": "BreedingMethod (required)",
  "breedingDate": "ISO 8601 date (required)",
  "expectedBirthDate": "ISO 8601 date (required)",
  "expectedOffspringCount": "number (optional)",
  "status": "BreedingStatus (optional, default: planned)",
  "veterinarianId": "uuid (optional)",
  "veterinarianName": "string (optional)",
  "notes": "string (optional)"
}
```

---

### 4.10 Lots

**Endpoint:** `POST /farms/:farmId/lots`

**Request Body:**
```json
{
  "name": "string (required)",
  "type": "string (optional: production | reproduction | sale | treatment | vaccination | birth | quarantine | fattening)",
  "status": "string (optional: open | closed | completed)"
}
```

**Endpoint:** `POST /farms/:farmId/lots/:lotId/animals`

**Request Body:**
```json
{
  "animalIds": ["uuid"] (required)
}
```

---

### 4.11 Documents

**Endpoint:** `POST /farms/:farmId/documents`

**Request Body:**
```json
{
  "animalId": "uuid (optional)",
  "type": "string (required: health_certificate | movement_permit | test_results | pedigree | insurance | other)",
  "title": "string (required)",
  "fileName": "string (required)",
  "fileUrl": "string (required)",
  "fileSizeBytes": "number (optional)",
  "mimeType": "string (optional)",
  "uploadDate": "ISO 8601 date (required)",
  "documentNumber": "string (optional)",
  "issueDate": "ISO 8601 date (optional)",
  "expiryDate": "ISO 8601 date (optional)",
  "notes": "string (optional)"
}
```

---

## 5. Global/Admin Endpoints

These endpoints create records with `scope=global`.

---

### 5.1 Global Medical Products

**Endpoint:** `POST /global-medical-products`

**Request Body:**
```json
{
  "code": "string (required, unique)",
  "nameFr": "string (required)",
  "nameEn": "string (optional)",
  "nameAr": "string (optional)",
  "type": "MedicalProductType (required)",
  "principeActif": "string (optional)",
  "laboratoire": "string (optional)",
  "withdrawalPeriodMeat": "number (required, days)",
  "withdrawalPeriodMilk": "number (required, days)"
}
```

---

### 5.2 Global Vaccines

**Endpoint:** `POST /vaccines-global`

**Request Body:**
```json
{
  "code": "string (required, unique)",
  "nameFr": "string (required)",
  "nameEn": "string (optional)",
  "nameAr": "string (optional)",
  "targetDisease": "VaccineTargetDisease (required)",
  "laboratoire": "string (optional)"
}
```

---

## 6. Reference Data Endpoints

### 6.1 Countries

**Endpoint:** `POST /countries`

```json
{
  "code": "string (required, 2-letter ISO)",
  "nameFr": "string (required)",
  "nameEn": "string (optional)",
  "nameAr": "string (optional)",
  "region": "string (optional)"
}
```

---

### 6.2 Administration Routes

**Endpoint:** `POST /administration-routes`

```json
{
  "code": "string (required)",
  "nameFr": "string (required)",
  "nameEn": "string (optional)",
  "nameAr": "string (optional)"
}
```

---

### 6.3 Species

**Endpoint:** `POST /api/v1/species`

```json
{
  "id": "string (required)",
  "nameFr": "string (required)",
  "nameEn": "string (optional)",
  "nameAr": "string (optional)",
  "icon": "string (optional)"
}
```

---

### 6.4 Breeds

**Endpoint:** `POST /api/v1/breeds`

```json
{
  "id": "uuid (required)",
  "code": "string (required)",
  "speciesId": "string (required)",
  "nameFr": "string (required)",
  "nameEn": "string (optional)",
  "nameAr": "string (optional)",
  "description": "string (optional)"
}
```

---

### 6.5 National Campaigns

**Endpoint:** `POST /api/national-campaigns`

```json
{
  "code": "string (required)",
  "nameFr": "string (required)",
  "nameEn": "string (optional)",
  "nameAr": "string (optional)",
  "type": "vaccination | deworming | screening | treatment | census",
  "description": "string (optional)",
  "startDate": "ISO 8601 date (required)",
  "endDate": "ISO 8601 date (required)",
  "isActive": "boolean (optional)"
}
```

---

### 6.6 Farms

**Endpoint:** `POST /api/farms`

```json
{
  "id": "uuid (required)",
  "name": "string (required)",
  "ownerId": "string (required)",
  "location": "string (optional)",
  "address": "string (optional)",
  "city": "string (optional)",
  "postalCode": "string (optional)",
  "country": "string (optional)",
  "department": "string (optional)",
  "commune": "string (optional)"
}
```

---

## 7. Validation Rules

### 7.1 XOR Fields (Exactly One Required)

| Entity | Fields | Rule |
|--------|--------|------|
| Treatment | `animalId`, `animal_ids` | Exactly one must be provided |
| Vaccination | `animalId`, `animalIds`, `animal_ids` | Exactly one must be provided |

### 7.2 Date Validations

| Entity | Rule |
|--------|------|
| Treatment | `withdrawalEndDate` >= `treatmentDate` |
| Vaccination | `nextDueDate` >= `vaccinationDate` |
| Animal | `birthDate` cannot be in the future |

### 7.3 Mother Must Be Female

When creating an animal with `motherId`, the referenced animal must have `sex='female'`.

---

## 8. Error Response Format

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "statusCode": 400,
    "message": "Human-readable message",
    "errors": [
      {
        "field": "fieldName",
        "message": "Validation error detail"
      }
    ],
    "context": {
      "entityId": "uuid",
      "additionalInfo": "value"
    }
  },
  "timestamp": "2025-11-26T10:30:00.000Z"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_FAILED` | 400 | Request validation failed |
| `ANIMAL_NOT_FOUND` | 404 | Animal not found |
| `ANIMAL_MUST_BE_FEMALE` | 400 | Mother must be female |
| `TREATMENT_NOT_FOUND` | 404 | Treatment not found |
| `VACCINATION_NOT_FOUND` | 404 | Vaccination not found |
| `VERSION_CONFLICT` | 409 | Optimistic locking conflict |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FARM_ACCESS_DENIED` | 403 | No access to this farm |

---

## Appendix A: Breaking Changes from API_SIGNATURES.md

| Change | Before | After |
|--------|--------|-------|
| **Product name field** | `name` | `nameFr` |
| **Vaccine name field** | `name` | `nameFr` |
| **Treatment status** | `planned` | `scheduled` |
| **Medical Products endpoint** | `/custom-medical-products` | `/farms/:farmId/medical-products` |
| **Vaccines endpoint** | `/custom-vaccines` | `/farms/:farmId/vaccines` |
| **Global products** | Separate tables | Unified with `scope` field |
| **Vaccine type enum** | `VaccineType` | `VaccineTargetDisease` |

---

## Appendix B: Working Script Reference

See `scripts/seed-database-100-animals-fr.ps1` for a working example of all API calls.

Key patterns:
- Farm-scoped: `/farms/:farmId/{resource}`
- Global admin: `/global-medical-products`, `/vaccines-global`
- Reference data: `/countries`, `/api/v1/species`, `/api/v1/breeds`

---

**End of Document**
