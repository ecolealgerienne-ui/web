# API Signatures V2 - Livestock Management System (PAPS2)

**Version:** 2.0
**Last Updated:** 2025-11-29
**Purpose:** Complete API specifications including new modules (Animal Status, Treatment Alerts, Farmer Product Lots)

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Response Format](#2-response-format)
3. [Enums Reference](#3-enums-reference)
4. [Farm-Scoped Endpoints](#4-farm-scoped-endpoints)
   - 4.1 [Animals](#41-animals)
   - 4.2 [Animal Status History](#42-animal-status-history-new)
   - 4.3 [Treatments](#43-treatments)
   - 4.4 [Treatment Alerts](#44-treatment-alerts-new)
   - 4.5 [Products](#45-products)
   - 4.6 [Farm Product Preferences](#46-farm-product-preferences-new)
   - 4.7 [Farmer Product Lots](#47-farmer-product-lots-new)
   - 4.8 [Weights](#48-weights)
   - 4.9 [Movements](#49-movements)
   - 4.10 [Breedings](#410-breedings)
   - 4.11 [Lots](#411-lots)
   - 4.12 [Veterinarians](#412-veterinarians)
   - 4.13 [Documents](#413-documents)
5. [Global/Admin Endpoints](#5-globaladmin-endpoints)
6. [Reference Data Endpoints](#6-reference-data-endpoints)
7. [Error Response Format](#7-error-response-format)

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

### Farm Scope Pattern
All farm endpoints use pattern: `/farms/:farmId/{resource}`

---

## 2. Response Format

### Success Response (Single Entity)
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp: string; // ISO 8601
}
```

### Success Response (List with Pagination)
```typescript
interface ApiPaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp: string;
}
```

### Example Response
```json
{
  "success": true,
  "data": { /* entity */ },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  },
  "timestamp": "2025-11-29T10:30:00.000Z"
}
```

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

### AnimalStatusType (NEW)
```typescript
enum AnimalStatusType {
  WEIGHT = 'WEIGHT',
  GESTATION = 'GESTATION',
  LACTATION = 'LACTATION',
  VET_CHECK = 'VET_CHECK',
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
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
```

### TreatmentType
```typescript
enum TreatmentType {
  TREATMENT = 'treatment',
  VACCINATION = 'vaccination',
}
```

### ProductType
```typescript
enum ProductType {
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

### DoseUnitType (NEW)
```typescript
enum DoseUnitType {
  ML_PER_KG = 'ML_PER_KG',
  ML_PER_HEAD = 'ML_PER_HEAD',
  MG_PER_KG = 'MG_PER_KG',
  G_PER_HEAD = 'G_PER_HEAD',
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

---

## 4. Farm-Scoped Endpoints

---

### 4.1 Animals

#### POST `/farms/:farmId/animals` - Create Animal

**Request Body:**
```typescript
interface CreateAnimalDto {
  id?: string;                    // UUID (optional, auto-generated)
  birthDate: string;              // ISO 8601 date (required)
  sex: 'male' | 'female';         // required
  currentEid?: string;            // max 15 chars
  officialNumber?: string;
  visualId?: string;
  speciesId?: string;
  breedId?: string;
  motherId?: string;              // UUID
  status?: AnimalStatus;          // default: 'draft'
  photoUrl?: string;
  notes?: string;                 // max 1000 chars
}
```

**Response Type:**
```typescript
interface AnimalEntity {
  id: string;
  farmId: string;
  birthDate: Date;
  sex: string;
  currentEid: string | null;
  officialNumber: string | null;
  visualId: string | null;
  speciesId: string | null;
  breedId: string | null;
  motherId: string | null;
  status: string;
  photoUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  // Relations (when included)
  species?: SpeciesEntity;
  breed?: BreedEntity;
  mother?: AnimalEntity;
}
```

#### GET `/farms/:farmId/animals` - List Animals

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Items per page (default: 50) |
| `page` | number | Page number (default: 1) |
| `speciesId` | string | Filter by species |
| `breedId` | string | Filter by breed |
| `status` | AnimalStatus | Filter by status |
| `sex` | string | Filter by sex |

**Response:** `ApiPaginatedResponse<AnimalEntity>`

#### GET `/farms/:farmId/animals/:id` - Get Animal

**Response:** `ApiResponse<AnimalEntity>`

#### PUT `/farms/:farmId/animals/:id` - Update Animal

**Request Body:** Same as CreateAnimalDto (all fields optional)

**Response:** `ApiResponse<AnimalEntity>`

#### DELETE `/farms/:farmId/animals/:id` - Soft Delete Animal

**Response:** `ApiResponse<{ deleted: true }>`

---

### 4.2 Animal Status History (NEW)

Tracks physiological states of animals (gestation, lactation, etc.)

#### POST `/farms/:farmId/animals/:animalId/status-history` - Create Status

**Request Body:**
```typescript
interface CreateAnimalStatusDto {
  statusType: AnimalStatusType;   // required: WEIGHT, GESTATION, LACTATION, VET_CHECK
  startDate: string;              // ISO 8601 date (required)
  endDate?: string;               // ISO 8601 date (null = status still active)
  value: string;                  // required (weight in kg, gestation stage, etc.)
  notes?: string;
}
```

**Response Type:**
```typescript
interface AnimalStatusHistoryEntity {
  id: string;
  animalId: string;
  statusType: AnimalStatusType;
  startDate: Date;
  endDate: Date | null;
  value: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

**Errors:**
- `409` - Active status of same type already exists

#### GET `/farms/:farmId/animals/:animalId/status-history` - List Statuses

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `statusType` | AnimalStatusType | Filter by type |
| `isActive` | boolean | Filter active only (endDate = null) |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:** `ApiPaginatedResponse<AnimalStatusHistoryEntity>`

#### GET `/farms/:farmId/animals/:animalId/status-history/active` - Get Active Statuses

Returns all currently active statuses (endDate = null)

**Response:** `ApiResponse<AnimalStatusHistoryEntity[]>`

#### GET `/farms/:farmId/animals/:animalId/status-history/:id` - Get Status

**Response:** `ApiResponse<AnimalStatusHistoryEntity>`

#### PUT `/farms/:farmId/animals/:animalId/status-history/:id` - Update Status

**Request Body:**
```typescript
interface UpdateAnimalStatusDto {
  startDate?: string;
  endDate?: string;
  value?: string;
  notes?: string;
}
```

**Response:** `ApiResponse<AnimalStatusHistoryEntity>`

#### PATCH `/farms/:farmId/animals/:animalId/status-history/:id/close` - Close Status

**Request Body:**
```typescript
interface CloseAnimalStatusDto {
  endDate: string;   // ISO 8601 date (required)
  notes?: string;
}
```

**Response:** `ApiResponse<AnimalStatusHistoryEntity>`

**Errors:**
- `400` - Status already closed or invalid date (endDate < startDate)

#### DELETE `/farms/:farmId/animals/:animalId/status-history/:id` - Soft Delete

**Response:** `ApiResponse<{ deleted: true }>`

---

### 4.3 Treatments

#### POST `/farms/:farmId/treatments` - Create Treatment

**Request Body:**
```typescript
interface CreateTreatmentDto {
  id?: string;                       // UUID (optional)
  type?: TreatmentType;              // default: 'treatment'

  // Animal selection (XOR - exactly one required)
  animalId?: string;                 // Single animal
  animal_ids?: string[];             // Batch treatment

  // Product info
  productId: string;                 // required
  productName: string;               // required
  packagingId?: string;              // NEW: Product packaging ID
  indicationId?: string;             // NEW: Therapeutic indication ID

  // Veterinarian
  veterinarianId?: string;
  veterinarianName?: string;

  // Treatment details
  campaignId?: string;
  routeId?: string;                  // Administration route ID
  diagnosis?: string;
  treatmentDate: string;             // ISO 8601 date (required)
  animalWeightKg?: number;           // NEW: Animal weight at treatment
  dose: number;                      // required
  dosage?: number;
  dosageUnit?: string;               // 'ml', 'mg', 'g'
  quantityAdministered?: number;     // NEW
  quantityUnitId?: string;           // NEW

  // Lot tracking (NEW - recommended approach)
  farmerLotId?: string;              // Reference to FarmerProductLot

  // Legacy lot tracking (DEPRECATED)
  batchNumber?: string;              // @deprecated - use farmerLotId
  batchExpiryDate?: string;          // @deprecated - use farmerLotId

  // Other
  duration?: number;                 // days
  status?: TreatmentStatus;          // default: 'completed'
  withdrawalEndDate?: string;        // Legacy withdrawal date
  autoCalculateWithdrawal?: boolean; // NEW: Auto-calc from indication
  cost?: number;
  notes?: string;
}
```

**Response Type:**
```typescript
interface TreatmentEntity {
  id: string;
  farmId: string;
  animalId: string;
  type: TreatmentType;
  productId: string | null;
  productName: string | null;
  packagingId: string | null;
  indicationId: string | null;
  veterinarianId: string | null;
  veterinarianName: string | null;
  campaignId: string | null;
  routeId: string | null;
  diagnosis: string | null;
  treatmentDate: Date;
  animalWeightKg: number | null;
  dose: number | null;
  dosage: number | null;
  dosageUnit: string | null;
  quantityAdministered: number | null;
  quantityUnitId: string | null;
  farmerLotId: string | null;
  batchNumber: string | null;
  batchExpiryDate: Date | null;
  duration: number | null;
  status: TreatmentStatus;
  withdrawalEndDate: Date | null;
  withdrawalMeatEndDate: Date | null;
  withdrawalMilkEndDate: Date | null;
  cost: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  // Relations
  animal?: AnimalEntity;
  product?: ProductEntity;
  veterinarian?: VeterinarianEntity;
  farmerLot?: FarmerProductLotEntity;
}
```

#### GET `/farms/:farmId/treatments` - List Treatments

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `animalId` | string | Filter by animal |
| `status` | TreatmentStatus | Filter by status |
| `fromDate` | string | ISO date - from |
| `toDate` | string | ISO date - to |

**Response:** `ApiPaginatedResponse<TreatmentEntity>`

#### GET `/farms/:farmId/treatments/:id` - Get Treatment

**Response:** `ApiResponse<TreatmentEntity>`

#### PUT `/farms/:farmId/treatments/:id` - Update Treatment

**Response:** `ApiResponse<TreatmentEntity>`

#### DELETE `/farms/:farmId/treatments/:id` - Soft Delete

**Response:** `ApiResponse<{ deleted: true }>`

---

### 4.4 Treatment Alerts (NEW)

Provides alerts for contraindications, withdrawal periods, and expiring lots.

#### GET `/farms/:farmId/alerts/check-contraindication` - Check Contraindication

Checks if an animal has a contraindication (e.g., gestation) for a product.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `animalId` | string | Yes | Animal UUID |
| `productId` | string | Yes | Product UUID |

**Response Type:**
```typescript
interface ContraindicationCheckDto {
  animalId: string;
  productId: string;
  hasContraindication: boolean;
  contraindicationType?: string;     // e.g., 'GESTATION'
  message?: string;                  // e.g., 'Animal en gestation - Produit contre-indiqué'
  gestationStartDate?: Date;
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "animalId": "123e4567-...",
    "productId": "789e4567-...",
    "hasContraindication": true,
    "contraindicationType": "GESTATION",
    "message": "Animal en gestation - Produit contre-indiqué",
    "gestationStartDate": "2025-01-15T00:00:00.000Z"
  },
  "timestamp": "2025-11-29T10:30:00.000Z"
}
```

#### GET `/farms/:farmId/alerts/check-withdrawal/:animalId` - Check Withdrawal Periods

Returns all active withdrawal periods (meat and milk) for an animal.

**Response Type:**
```typescript
interface WithdrawalCheckDto {
  animalId: string;
  hasActiveWithdrawal: boolean;
  activeWithdrawals: ActiveWithdrawalDto[];
}

interface ActiveWithdrawalDto {
  treatmentId: string;
  treatmentDate: Date;
  productName: string;
  meatWithdrawalEndDate?: Date;
  milkWithdrawalEndDate?: Date;
  meatDaysRemaining: number;         // 0 if ended
  milkDaysRemaining: number;         // 0 if ended
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "animalId": "123e4567-...",
    "hasActiveWithdrawal": true,
    "activeWithdrawals": [
      {
        "treatmentId": "abc-123",
        "treatmentDate": "2025-11-20T00:00:00.000Z",
        "productName": "Ampicilline 20%",
        "meatWithdrawalEndDate": "2025-12-05T00:00:00.000Z",
        "milkWithdrawalEndDate": "2025-11-25T00:00:00.000Z",
        "meatDaysRemaining": 6,
        "milkDaysRemaining": 0
      }
    ]
  },
  "timestamp": "2025-11-29T10:30:00.000Z"
}
```

#### GET `/farms/:farmId/alerts/expiring-lots` - Get Expiring Lots

Returns medication lots that are expiring soon or already expired.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `daysThreshold` | number | 30 | Days before expiry to include in alert |

**Response Type:**
```typescript
interface ExpiringLotsResponseDto {
  expiring: ExpiringLotDto[];        // Lots expiring within threshold
  expired: ExpiringLotDto[];         // Already expired lots
  totalAlerts: number;
}

interface ExpiringLotDto {
  lotId: string;
  nickname: string;                  // e.g., 'Lot Janvier 2025'
  officialLotNumber: string;         // e.g., 'C4567-9A'
  expiryDate: Date;
  daysUntilExpiry: number;           // negative if expired
  isExpired: boolean;
  productName: string;
  productId: string;
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "expiring": [
      {
        "lotId": "lot-123",
        "nickname": "Lot Janvier 2025",
        "officialLotNumber": "C4567-9A",
        "expiryDate": "2025-12-15T00:00:00.000Z",
        "daysUntilExpiry": 16,
        "isExpired": false,
        "productName": "Ivermectine 1%",
        "productId": "prod-456"
      }
    ],
    "expired": [],
    "totalAlerts": 1
  },
  "timestamp": "2025-11-29T10:30:00.000Z"
}
```

---

### 4.5 Products

#### POST `/farms/:farmId/products` - Create Local Product

**Request Body:**
```typescript
interface CreateProductDto {
  id?: string;
  nameFr: string;                    // required
  nameEn?: string;
  nameAr?: string;
  commercialName?: string;
  code?: string;
  description?: string;
  type?: ProductType;
  categoryId?: string;
  principeActif?: string;
  activeIngredient?: string;
  laboratoire?: string;
  manufacturer?: string;
  withdrawalPeriodMeat?: number;     // days
  withdrawalPeriodMilk?: number;     // days
  contraindicatedDuringGestation?: boolean;
  isActive?: boolean;                // default: true
}
```

**Response Type:**
```typescript
interface ProductEntity {
  id: string;
  scope: 'global' | 'local';
  farmId: string | null;
  nameFr: string;
  nameEn: string | null;
  nameAr: string | null;
  commercialName: string | null;
  code: string | null;
  description: string | null;
  type: ProductType | null;
  categoryId: string | null;
  principeActif: string | null;
  laboratoire: string | null;
  withdrawalPeriodMeat: number | null;
  withdrawalPeriodMilk: number | null;
  contraindicatedDuringGestation: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  // Relations
  category?: ProductCategoryEntity;
  packagings?: ProductPackagingEntity[];
  therapeuticIndications?: TherapeuticIndicationEntity[];
}
```

#### GET `/farms/:farmId/products` - List Products

Returns both global and local products for the farm.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name |
| `scope` | string | `global`, `local`, or `all` (default: all) |
| `type` | ProductType | Filter by type |
| `categoryId` | string | Filter by category |
| `isActive` | boolean | Filter active products |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:** `ApiPaginatedResponse<ProductEntity>`

#### GET `/farms/:farmId/products/vaccines` - List Vaccines Only

**Response:** `ApiPaginatedResponse<ProductEntity>` (where type = 'vaccine')

#### GET `/farms/:farmId/products/search` - Search Products

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search term (required) |
| `limit` | number | Max results (default: 10) |

**Response:** `ApiResponse<ProductEntity[]>`

#### GET `/farms/:farmId/products/type/:type` - Get Products by Type

**Response:** `ApiResponse<ProductEntity[]>`

#### GET `/farms/:farmId/products/:id` - Get Product

**Response:** `ApiResponse<ProductEntity>`

#### PATCH `/farms/:farmId/products/:id` - Update Local Product

**Errors:**
- `403` - Cannot modify global products

**Response:** `ApiResponse<ProductEntity>`

#### DELETE `/farms/:farmId/products/:id` - Soft Delete Local Product

**Errors:**
- `403` - Cannot delete global products

**Response:** 204 No Content

---

### 4.6 Farm Product Preferences (NEW)

Manages farm-specific product configurations with custom dosages and withdrawal periods.

#### POST `/farms/:farmId/product-preferences` - Create Preference

**Request Body:**
```typescript
interface CreateFarmProductPreferenceDto {
  productId: string;                 // required (Product UUID)
  displayOrder?: number;             // default: 0
  isActive?: boolean;                // default: true
}
```

**Response Type:**
```typescript
interface FarmProductPreferenceEntity {
  id: string;
  farmId: string;
  productId: string;
  displayOrder: number;
  isActive: boolean;

  // User-defined overrides (AMM/RCP)
  packagingId: string | null;
  userDefinedDose: number | null;
  userDefinedDoseUnit: DoseUnitType | null;
  userDefinedMeatWithdrawal: number | null;    // days
  userDefinedMilkWithdrawal: number | null;    // hours

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  // Relations
  product?: ProductEntity;
  packaging?: ProductPackagingEntity;
  farmerLots?: FarmerProductLotEntity[];
}
```

#### GET `/farms/:farmId/product-preferences` - List Preferences

Returns preferences ordered by displayOrder.

**Response:** `ApiResponse<FarmProductPreferenceEntity[]>`

#### GET `/farms/:farmId/product-preferences/:id` - Get Preference

**Response:** `ApiResponse<FarmProductPreferenceEntity>`

#### PUT `/farms/:farmId/product-preferences/:id` - Update Preference

**Request Body:**
```typescript
interface UpdateFarmProductPreferenceDto {
  displayOrder?: number;
  isActive?: boolean;
}
```

**Response:** `ApiResponse<FarmProductPreferenceEntity>`

#### PATCH `/farms/:farmId/product-preferences/:id/toggle-active` - Toggle Active

**Request Body:**
```json
{ "isActive": true }
```

**Response:** `ApiResponse<FarmProductPreferenceEntity>`

#### DELETE `/farms/:farmId/product-preferences/:id` - Delete Preference

**Response:** `ApiResponse<{ deleted: true }>`

#### GET `/farms/:farmId/product-preferences/:id/config` - Get Custom Config

Returns configuration with packaging, lots and userDefined fields.

**Response:**
```typescript
interface ProductConfigResponse {
  id: string;
  productId: string;
  product: ProductEntity;
  packaging: ProductPackagingEntity | null;
  userDefinedDose: number | null;
  userDefinedDoseUnit: DoseUnitType | null;
  userDefinedMeatWithdrawal: number | null;
  userDefinedMilkWithdrawal: number | null;
  farmerLots: FarmerProductLotEntity[];
}
```

#### PUT `/farms/:farmId/product-preferences/:id/config` - Update Custom Config

Override AMM/RCP values for this farm.

**Request Body:**
```typescript
interface UpdateProductConfigDto {
  packagingId?: string | null;                 // ProductPackaging UUID
  userDefinedDose?: number | null;             // e.g., 1.5
  userDefinedDoseUnit?: DoseUnitType | null;   // e.g., 'ML_PER_KG'
  userDefinedMeatWithdrawal?: number | null;   // days
  userDefinedMilkWithdrawal?: number | null;   // hours
}
```

**Validation:**
- If `userDefinedDose` is set, `userDefinedDoseUnit` is required

**Response:** `ApiResponse<FarmProductPreferenceEntity>`

#### DELETE `/farms/:farmId/product-preferences/:id/config` - Reset Config

Resets all custom config values to NULL.

**Response:** `ApiResponse<FarmProductPreferenceEntity>`

---

### 4.7 Farmer Product Lots (NEW)

Manages medication lot tracking for farms.

**Base URL:** `/farms/:farmId/product-configs/:configId/lots`

Where `configId` is a FarmProductPreference UUID.

#### POST `/farms/:farmId/product-configs/:configId/lots` - Create Lot

**Request Body:**
```typescript
interface CreateFarmerProductLotDto {
  nickname: string;                  // required, max 100 chars (e.g., 'Lot Janvier 2025')
  officialLotNumber: string;         // required, max 50 chars (e.g., 'C4567-9A')
  expiryDate: string;                // ISO 8601 date, required, must be in future
  isActive?: boolean;                // default: true
}
```

**Response Type:**
```typescript
interface FarmerProductLotEntity {
  id: string;
  configId: string;                  // FarmProductPreference ID
  nickname: string;
  officialLotNumber: string;
  expiryDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  // Relations
  config?: FarmProductPreferenceEntity;
  treatments?: TreatmentEntity[];
}
```

**Errors:**
- `400` - Expiry date must be in the future
- `404` - Config not found
- `409` - Lot with same official number already exists for this config

#### GET `/farms/:farmId/product-configs/:configId/lots` - List Lots

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `isActive` | boolean | Filter by active status |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:** `ApiPaginatedResponse<FarmerProductLotEntity>`

#### GET `/farms/:farmId/product-configs/:configId/lots/active` - Get Active Non-Expired Lots

Returns only active lots that are not expired.

**Response:** `ApiResponse<FarmerProductLotEntity[]>`

#### GET `/farms/:farmId/product-configs/:configId/lots/:id` - Get Lot

Returns lot with recent treatments.

**Response:** `ApiResponse<FarmerProductLotEntity>`

#### PUT `/farms/:farmId/product-configs/:configId/lots/:id` - Update Lot

**Request Body:**
```typescript
interface UpdateFarmerProductLotDto {
  nickname?: string;
  officialLotNumber?: string;
  expiryDate?: string;
  isActive?: boolean;
}
```

**Response:** `ApiResponse<FarmerProductLotEntity>`

#### PATCH `/farms/:farmId/product-configs/:configId/lots/:id/activate` - Activate Lot

**Response:** `ApiResponse<FarmerProductLotEntity>`

#### PATCH `/farms/:farmId/product-configs/:configId/lots/:id/deactivate` - Deactivate Lot

**Response:** `ApiResponse<FarmerProductLotEntity>`

#### DELETE `/farms/:farmId/product-configs/:configId/lots/:id` - Soft Delete Lot

**Response:** `ApiResponse<{ deleted: true }>`

---

### 4.8 Weights

#### POST `/farms/:farmId/weights` - Create Weight

**Request Body:**
```typescript
interface CreateWeightDto {
  animalId: string;                  // required
  weight: number;                    // required (kg)
  weightDate: string;                // ISO 8601 date (required)
  source?: 'manual' | 'scale' | 'estimated';
  notes?: string;
}
```

**Response Type:**
```typescript
interface WeightEntity {
  id: string;
  farmId: string;
  animalId: string;
  weight: number;
  weightDate: Date;
  source: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 4.9 Movements

#### POST `/farms/:farmId/movements` - Create Movement

**Request Body:**
```typescript
interface CreateMovementDto {
  movementType: MovementType;        // required
  movementDate: string;              // ISO 8601 date (required)
  animalIds: string[];               // required
  reason?: string;
  notes?: string;
}
```

---

### 4.10 Breedings

#### POST `/farms/:farmId/breedings` - Create Breeding

**Request Body:**
```typescript
interface CreateBreedingDto {
  motherId: string;                  // required
  fatherId?: string;
  fatherName?: string;               // when fatherId is null
  method: BreedingMethod;            // required
  breedingDate: string;              // ISO 8601 date (required)
  expectedBirthDate: string;         // ISO 8601 date (required)
  expectedOffspringCount?: number;
  status?: BreedingStatus;           // default: 'planned'
  veterinarianId?: string;
  veterinarianName?: string;
  notes?: string;
}
```

---

### 4.11 Lots

Animal grouping lots (not medication lots).

#### POST `/farms/:farmId/lots` - Create Lot

**Request Body:**
```typescript
interface CreateLotDto {
  name: string;                      // required
  type?: 'production' | 'reproduction' | 'sale' | 'treatment' | 'vaccination' | 'birth' | 'quarantine' | 'fattening';
  status?: 'open' | 'closed' | 'completed';
}
```

#### POST `/farms/:farmId/lots/:lotId/animals` - Add Animals to Lot

**Request Body:**
```typescript
interface AddAnimalsToLotDto {
  animalIds: string[];               // required
}
```

---

### 4.12 Veterinarians

#### POST `/farms/:farmId/veterinarians` - Create Veterinarian

**Request Body:**
```typescript
interface CreateVeterinarianDto {
  id?: string;
  firstName: string;                 // required
  lastName: string;                  // required
  title?: string;
  licenseNumber: string;             // required
  specialties?: string;
  clinic?: string;
  phone: string;                     // required
  mobile?: string;
  email?: string;                    // email format
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isAvailable?: boolean;             // default: true
  emergencyService?: boolean;        // default: false
  workingHours?: string;
  consultationFee?: number;
  emergencyFee?: number;
  currency?: string;
  notes?: string;
  isPreferred?: boolean;
  isDefault?: boolean;
  isActive?: boolean;                // default: true
}
```

---

### 4.13 Documents

#### POST `/farms/:farmId/documents` - Create Document

**Request Body:**
```typescript
interface CreateDocumentDto {
  animalId?: string;
  type: 'health_certificate' | 'movement_permit' | 'test_results' | 'pedigree' | 'insurance' | 'other';
  title: string;                     // required
  fileName: string;                  // required
  fileUrl: string;                   // required
  fileSizeBytes?: number;
  mimeType?: string;
  uploadDate: string;                // ISO 8601 date (required)
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  notes?: string;
}
```

---

## 5. Global/Admin Endpoints

### Global Products

#### GET `/api/v1/products` - List All Global Products

**Response:** `ApiPaginatedResponse<ProductEntity>`

#### GET `/api/v1/products/search?q={term}` - Search Global Products

**Response:** `ApiResponse<ProductEntity[]>`

#### GET `/api/v1/products/:id` - Get Global Product

**Response:** `ApiResponse<ProductEntity>`

#### POST `/api/v1/admin/products` - Create Global Product (Admin)

**Request Body:**
```typescript
interface CreateGlobalProductDto {
  code: string;                      // required, unique
  nameFr: string;                    // required
  nameEn?: string;
  nameAr?: string;
  type: ProductType;                 // required
  principeActif?: string;
  laboratoire?: string;
  withdrawalPeriodMeat: number;      // required (days)
  withdrawalPeriodMilk: number;      // required (days)
  contraindicatedDuringGestation?: boolean;
}
```

---

## 6. Reference Data Endpoints

### Species

- `GET /api/v1/species` - List species
- `POST /api/v1/species` - Create species

### Breeds

- `GET /api/v1/breeds` - List breeds
- `GET /api/v1/breeds?speciesId={id}` - Filter by species
- `POST /api/v1/breeds` - Create breed

### Countries

- `GET /countries` - List countries
- `POST /countries` - Create country

### Administration Routes

- `GET /administration-routes` - List routes
- `POST /administration-routes` - Create route

### Product Categories

- `GET /api/v1/product-categories` - List categories
- `POST /api/v1/product-categories` - Create category

### Therapeutic Indications

- `GET /api/v1/products/:productId/indications` - List indications for product
- `POST /api/v1/products/:productId/indications` - Create indication

### Product Packagings

- `GET /api/v1/products/:productId/packagings` - List packagings for product
- `POST /api/v1/products/:productId/packagings` - Create packaging

### Units

- `GET /api/v1/units` - List units
- `POST /api/v1/units` - Create unit

### National Campaigns

- `GET /api/national-campaigns` - List campaigns
- `POST /api/national-campaigns` - Create campaign

---

## 7. Error Response Format

### Standard Error Response

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;                    // Error code for i18n
    statusCode: number;              // HTTP status
    message: string;                 // Human-readable message
    errors?: ValidationError[];      // Validation details
    context?: Record<string, any>;   // Additional context
  };
  timestamp: string;
}

interface ValidationError {
  field: string;
  message: string;
}
```

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "statusCode": 400,
    "message": "Validation failed",
    "errors": [
      "nickname must be shorter than or equal to 100 characters",
      "expiryDate must be a valid ISO 8601 date string"
    ]
  },
  "timestamp": "2025-11-29T10:30:00.000Z"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_FAILED` | 400 | Request validation failed |
| `ENTITY_NOT_FOUND` | 404 | Entity not found |
| `ANIMAL_NOT_FOUND` | 404 | Animal not found |
| `ANIMAL_MUST_BE_FEMALE` | 400 | Mother must be female |
| `TREATMENT_NOT_FOUND` | 404 | Treatment not found |
| `PRODUCT_NOT_FOUND` | 404 | Product not found |
| `LOT_NOT_FOUND` | 404 | Farmer product lot not found |
| `CONFIG_NOT_FOUND` | 404 | Product preference config not found |
| `STATUS_ALREADY_CLOSED` | 400 | Animal status already closed |
| `DUPLICATE_LOT_NUMBER` | 409 | Lot with same official number exists |
| `ACTIVE_STATUS_EXISTS` | 409 | Active status of same type exists |
| `CANNOT_MODIFY_GLOBAL` | 403 | Cannot modify global resources |
| `VERSION_CONFLICT` | 409 | Optimistic locking conflict |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FARM_ACCESS_DENIED` | 403 | No access to this farm |

---

## Appendix A: New Modules Summary

| Module | Base Path | Description |
|--------|-----------|-------------|
| Animal Status | `/farms/:farmId/animals/:animalId/status-history` | Track physiological states (gestation, lactation) |
| Treatment Alerts | `/farms/:farmId/alerts` | Check contraindications, withdrawal periods, expiring lots |
| Farm Product Preferences | `/farms/:farmId/product-preferences` | Custom product configurations per farm |
| Farmer Product Lots | `/farms/:farmId/product-configs/:configId/lots` | Medication lot tracking |

---

## Appendix B: Breaking Changes from V1

| Change | Before (V1) | After (V2) |
|--------|-------------|------------|
| Treatment batch field | `batchNumber`, `batchExpiryDate` | `farmerLotId` (recommended) |
| Product config | N/A | New `product-preferences` module |
| Animal physiological status | N/A | New `status-history` module |
| Treatment alerts | N/A | New `alerts` module |
| Withdrawal calculation | Manual `withdrawalEndDate` | Auto-calc with `autoCalculateWithdrawal` |

---

**End of Document**
