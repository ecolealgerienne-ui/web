# API REST - Spécifications Web

**Version:** 1.0
**Date:** 2025-11-22
**Base URL:** `http://localhost:3000`

---

## Table des matières

1. [Authentication](#1-authentication)
2. [Entités Transactionnelles](#2-entités-transactionnelles)
   - [2.1 Animals](#21-animals)
   - [2.2 Treatments](#22-treatments)
   - [2.3 Vaccinations](#23-vaccinations)
   - [2.4 Movements](#24-movements)
   - [2.5 Lots](#25-lots)
   - [2.6 Weights](#26-weights)
   - [2.7 Breedings](#27-breedings)
   - [2.8 Documents](#28-documents)
3. [Données de Référence](#3-données-de-référence)
   - [3.1 Species](#31-species)
   - [3.2 Breeds](#32-breeds)
   - [3.3 Medical Products](#33-medical-products)
   - [3.4 Vaccines](#34-vaccines)
   - [3.5 Veterinarians](#35-veterinarians)
   - [3.6 Campaigns](#36-campaigns)
   - [3.7 Farm Preferences](#37-farm-preferences)
   - [3.8 Alert Configurations](#38-alert-configurations)
   - [3.9 Farms](#39-farms)
4. [Enums & Types](#4-enums--types)
5. [Codes d'erreur](#5-codes-derreur)

---

## 1. Authentication

Tous les endpoints nécessitent un token Bearer dans le header:

```
Authorization: Bearer {access_token}
```

**Obtenir un token:** Utiliser Keycloak (voir API_SIGNATURES.md section 3)

---

## 2. Entités Transactionnelles

### 2.1 Animals

#### Créer un animal

```
POST /farms/{farmId}/animals
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "currentEid": "250269801234567",
  "officialNumber": "FR1234567890",
  "visualId": "Rouge-42",
  "birthDate": "2024-03-15T00:00:00Z",
  "sex": "female",
  "motherId": null,
  "speciesId": "cattle",
  "breedId": "holstein",
  "status": "alive",
  "notes": "Animal en bonne santé"
}
```

**Champs requis:**
- `id` (UUID généré par le client)
- `birthDate` (ISO 8601)
- `sex` (`male` | `female`)

**Champs optionnels:**
- `currentEid` (string, max 15)
- `officialNumber` (string, max 50)
- `visualId` (string, max 50)
- `motherId` (UUID)
- `speciesId` (string)
- `breedId` (string)
- `status` (enum, default: `alive`)
- `notes` (string, max 1000)
- `photoUrl` (string)
- `currentLocationFarmId` (UUID)
- `eidHistory` (array)
- `validatedAt` (ISO 8601)
- `days` (number, calculé)

**Réponse 201 Created:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "farmId": "farm-uuid-123",
  "currentEid": "250269801234567",
  "officialNumber": "FR1234567890",
  "visualId": "Rouge-42",
  "birthDate": "2024-03-15T00:00:00.000Z",
  "sex": "female",
  "status": "alive",
  "speciesId": "cattle",
  "breedId": "holstein",
  "days": 252,
  "createdAt": "2025-11-22T12:00:00.000Z",
  "updatedAt": "2025-11-22T12:00:00.000Z"
}
```

**Erreurs:**
- `400` - Données invalides
- `401` - Non authentifié
- `403` - Accès refusé à cette ferme
- `409` - Animal existe déjà

---

#### Liste des animaux

```
GET /farms/{farmId}/animals?status=alive&species_id=cattle&limit=50&offset=0
```

**Query Parameters:**
- `status` (enum) - Filtrer par statut
- `speciesId` (string) - Filtrer par espèce
- `breedId` (string) - Filtrer par race
- `sex` (enum) - Filtrer par sexe
- `search` (string) - Recherche dans EID, official_number, visual_id
- `page` (number) - Numéro de page (default: 1)
- `limit` (number) - Éléments par page (default: 50, max: 100)
- `sort` (string) - Champ de tri (default: `createdAt`)
- `order` (`asc` | `desc`) - Ordre de tri (default: `desc`)

**Réponse 200 OK:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "farmId": "farm-uuid-123",
      "currentEid": "250269801234567",
      "visualId": "Rouge-42",
      "sex": "female",
      "status": "alive",
      "days": 252,
      "createdAt": "2025-11-22T12:00:00.000Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

#### Détail d'un animal

```
GET /farms/{farmId}/animals/{animalId}
```

**Réponse 200 OK:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "farmId": "farm-uuid-123",
  "currentEid": "250269801234567",
  "eidHistory": [
    {
      "id": "history-uuid",
      "oldEid": "250269801111111",
      "newEid": "250269801234567",
      "changedAt": "2024-06-15T10:00:00.000Z",
      "reason": "Perte de puce",
      "notes": null
    }
  ],
  "officialNumber": "FR1234567890",
  "birthDate": "2024-03-15T00:00:00.000Z",
  "sex": "female",
  "status": "alive",
  "speciesId": "cattle",
  "breedId": "holstein",
  "visualId": "Rouge-42",
  "days": 252,
  "createdAt": "2025-11-22T12:00:00.000Z",
  "updatedAt": "2025-11-22T12:00:00.000Z"
}
```

**Erreurs:**
- `404` - Animal non trouvé

---

#### Modifier un animal

```
PUT /farms/{farmId}/animals/{animalId}
```

**Body (tous les champs optionnels):**
```json
{
  "visualId": "Rouge-43",
  "notes": "Mise à jour",
  "status": "sold"
}
```

**Réponse 200 OK:**
Retourne l'animal mis à jour (même format que GET détail)

---

#### Supprimer un animal

```
DELETE /farms/{farmId}/animals/{animalId}
```

**Réponse 204 No Content**

---

### 2.2 Treatments

#### Créer un traitement

```
POST /farms/{farmId}/treatments
```

**Body:**
```json
{
  "id": "treatment-uuid",
  "animalId": "animal-uuid",
  "productId": "product-uuid",
  "productName": "Antibiotique X",
  "dose": 10.5,
  "treatmentDate": "2025-11-20T10:00:00Z",
  "withdrawalEndDate": "2025-11-27T10:00:00Z",
  "veterinarianId": "vet-uuid",
  "veterinarianName": "Dr. Martin",
  "notes": "Traitement pour infection"
}
```

**Champs requis:**
- `productId` (UUID)
- `productName` (string)
- `dose` (number)
- `treatmentDate` (ISO 8601)
- `withdrawalEndDate` (ISO 8601)

**Champs optionnels:**
- `id` (UUID, généré si absent)
- `animalId` (UUID) - Pour un animal unique
- `animal_ids` (array) - Pour un lot d'animaux
- `veterinarianId` (UUID)
- `veterinarianName` (string)
- `campaignId` (UUID)
- `routeId` (string)
- `diagnosis` (string)
- `dosage` (number)
- `dosageUnit` (string)
- `duration` (number, jours)
- `status` (enum, default: `scheduled`)
- `cost` (number)
- `notes` (string)

**Réponse 201 Created:**
```json
{
  "id": "treatment-uuid",
  "farmId": "farm-uuid",
  "animalId": "animal-uuid",
  "productId": "product-uuid",
  "productName": "Antibiotique X",
  "dose": 10.5,
  "treatmentDate": "2025-11-20T10:00:00.000Z",
  "withdrawalEndDate": "2025-11-27T10:00:00.000Z",
  "status": "scheduled",
  "createdAt": "2025-11-22T12:00:00.000Z"
}
```

---

#### Liste des traitements

```
GET /farms/{farmId}/treatments?animalId={uuid}&status=completed
```

**Query Parameters:**
- `animalId` (UUID) - Filtrer par animal
- `status` (enum) - Filtrer par statut
- `fromDate` (ISO 8601) - Date de début
- `toDate` (ISO 8601) - Date de fin

**Réponse 200 OK:**
```json
{
  "data": [
    {
      "id": "treatment-uuid",
      "animalId": "animal-uuid",
      "productName": "Antibiotique X",
      "dose": 10.5,
      "treatmentDate": "2025-11-20T10:00:00.000Z",
      "status": "completed"
    }
  ]
}
```

---

#### Détail d'un traitement

```
GET /farms/{farmId}/treatments/{treatmentId}
```

---

#### Modifier un traitement

```
PUT /farms/{farmId}/treatments/{treatmentId}
```

---

#### Supprimer un traitement

```
DELETE /farms/{farmId}/treatments/{treatmentId}
```

---

### 2.3 Vaccinations

#### Créer une vaccination

```
POST /farms/{farmId}/vaccinations
```

**Body:**
```json
{
  "id": "vaccination-uuid",
  "animalId": "animal-uuid",
  "vaccineName": "Vaccin Rage",
  "type": "obligatoire",
  "disease": "Rage",
  "vaccinationDate": "2025-11-20T10:00:00Z",
  "nextDueDate": "2026-11-20T10:00:00Z",
  "batchNumber": "BATCH-2025-001",
  "dose": "1ml",
  "administrationRoute": "Sous-cutanée",
  "withdrawalPeriodDays": 0
}
```

**Champs requis:**
- `vaccineName` (string)
- `type` (string: `obligatoire`, `recommandee`, `optionnelle`)
- `disease` (string)
- `vaccinationDate` (ISO 8601)
- `dose` (string)
- `administrationRoute` (string)
- `withdrawalPeriodDays` (number)

**Champs optionnels:**
- `id` (UUID)
- `animalId` (UUID) - Pour un animal unique
- `animal_ids` (array) - Pour plusieurs animaux
- `veterinarianId` (UUID)
- `veterinarianName` (string)
- `nextDueDate` (ISO 8601)
- `batchNumber` (string)
- `expiryDate` (ISO 8601)
- `dosage` (number)
- `cost` (number)
- `notes` (string)

**Réponse 201 Created:**
```json
{
  "id": "vaccination-uuid",
  "farmId": "farm-uuid",
  "animalId": "animal-uuid",
  "vaccineName": "Vaccin Rage",
  "type": "obligatoire",
  "disease": "Rage",
  "vaccinationDate": "2025-11-20T10:00:00.000Z",
  "nextDueDate": "2026-11-20T10:00:00.000Z"
}
```

---

#### Liste des vaccinations

```
GET /farms/{farmId}/vaccinations?animalId={uuid}&type=obligatoire
```

**Query Parameters:**
- `animalId` (UUID)
- `type` (string)
- `fromDate` (ISO 8601)
- `toDate` (ISO 8601)

---

#### Détail, Modifier, Supprimer

```
GET    /farms/{farmId}/vaccinations/{vaccinationId}
PUT    /farms/{farmId}/vaccinations/{vaccinationId}
DELETE /farms/{farmId}/vaccinations/{vaccinationId}
```

---

### 2.4 Movements

#### Créer un mouvement

```
POST /farms/{farmId}/movements
```

**Body:**
```json
{
  "id": "movement-uuid",
  "movementType": "sale",
  "movementDate": "2025-11-20T10:00:00Z",
  "animalIds": ["animal-uuid-1", "animal-uuid-2"],
  "buyerName": "Acheteur SA",
  "buyerType": "farm",
  "salePrice": 1500.00,
  "notes": "Vente à la ferme voisine"
}
```

**Champs requis:**
- `movementType` (enum)
- `movementDate` (ISO 8601)
- `animalIds` (array de UUID)

**Champs optionnels (selon le type):**
- `id` (UUID)
- `reason` (string)
- **Pour Sale:**
  - `buyerName` (string)
  - `buyerType` (enum)
  - `buyerContact` (string)
  - `salePrice` (number)
- **Pour Purchase:**
  - `sellerName` (string)
  - `purchasePrice` (number)
- **Pour Transfer:**
  - `destinationFarmId` (UUID)
  - `originFarmId` (UUID)
- **Pour Temporary:**
  - `temporaryType` (enum)
  - `expectedReturnDate` (ISO 8601)
- `documentNumber` (string)
- `notes` (string)

**Réponse 201 Created:**
```json
{
  "id": "movement-uuid",
  "farmId": "farm-uuid",
  "movementType": "sale",
  "movementDate": "2025-11-20T10:00:00.000Z",
  "animalIds": ["animal-uuid-1", "animal-uuid-2"],
  "buyerName": "Acheteur SA",
  "salePrice": 1500.00
}
```

---

#### Liste des mouvements

```
GET /farms/{farmId}/movements?movementType=sale&fromDate=2025-01-01
```

**Query Parameters:**
- `movementType` (enum)
- `status` (string)
- `fromDate` (ISO 8601)
- `toDate` (ISO 8601)
- `animalId` (UUID)
- `page` (number)
- `limit` (number)

---

#### Statistiques des mouvements

```
GET /farms/{farmId}/movements/statistics?fromDate=2025-01-01&toDate=2025-12-31
```

**Réponse 200 OK:**
```json
{
  "totalMovements": 45,
  "byType": {
    "sale": 12,
    "purchase": 8,
    "birth": 20,
    "death": 5
  },
  "totalSales": 18000.00,
  "totalPurchases": 12000.00
}
```

---

#### Détail, Modifier, Supprimer

```
GET    /farms/{farmId}/movements/{movementId}
PUT    /farms/{farmId}/movements/{movementId}
DELETE /farms/{farmId}/movements/{movementId}
```

---

### 2.5 Lots

#### Créer un lot

```
POST /farms/{farmId}/lots
```

**Body:**
```json
{
  "id": "lot-uuid",
  "name": "Lot Engraissement Automne 2025",
  "type": "fattening",
  "status": "open",
  "animalIds": ["animal-uuid-1", "animal-uuid-2"],
  "notes": "Lot pour engraissement"
}
```

**Champs requis:**
- `name` (string)

**Champs optionnels:**
- `id` (UUID)
- `animalIds` (array) - Animaux initiaux
- `type` (enum)
- `status` (string: `open`, `closed`, `archived`)
- `productId` (UUID)
- `productName` (string)
- `treatmentDate` (ISO 8601)
- `withdrawalEndDate` (ISO 8601)
- `veterinarianId` (UUID)
- `veterinarianName` (string)
- `priceTotal` (number)
- `buyerName` (string)
- `sellerName` (string)
- `description` (string)
- `notes` (string)
- `isActive` (boolean, default: true)

**Réponse 201 Created:**
```json
{
  "id": "lot-uuid",
  "farmId": "farm-uuid",
  "name": "Lot Engraissement Automne 2025",
  "type": "fattening",
  "status": "open",
  "animalCount": 2,
  "createdAt": "2025-11-22T12:00:00.000Z"
}
```

---

#### Liste des lots

```
GET /farms/{farmId}/lots?type=fattening&status=open
```

**Query Parameters:**
- `type` (enum)
- `status` (string)
- `completed` (boolean)
- `isActive` (boolean)
- `search` (string) - Recherche par nom

---

#### Détail d'un lot (avec animaux)

```
GET /farms/{farmId}/lots/{lotId}
```

**Réponse 200 OK:**
```json
{
  "id": "lot-uuid",
  "name": "Lot Engraissement Automne 2025",
  "type": "fattening",
  "status": "open",
  "animals": [
    {
      "id": "animal-uuid-1",
      "visualId": "Rouge-42",
      "currentEid": "250269801234567"
    }
  ],
  "animalCount": 2
}
```

---

#### Ajouter des animaux au lot

```
POST /farms/{farmId}/lots/{lotId}/animals
```

**Body:**
```json
{
  "animalIds": ["animal-uuid-3", "animal-uuid-4"]
}
```

**Réponse 200 OK:**
```json
{
  "message": "Animals added successfully",
  "addedCount": 2,
  "totalCount": 4
}
```

---

#### Retirer des animaux du lot

```
DELETE /farms/{farmId}/lots/{lotId}/animals
```

**Body:**
```json
{
  "animalIds": ["animal-uuid-3"]
}
```

---

#### Modifier, Supprimer un lot

```
PUT    /farms/{farmId}/lots/{lotId}
DELETE /farms/{farmId}/lots/{lotId}
```

---

### 2.6 Weights

#### Créer une pesée

```
POST /farms/{farmId}/weights
```

**Body:**
```json
{
  "id": "weight-uuid",
  "animalId": "animal-uuid",
  "weight": 450.5,
  "weightDate": "2025-11-20T10:00:00Z",
  "source": "scale",
  "notes": "Pesée de routine"
}
```

**Champs requis:**
- `animalId` (UUID)
- `weight` (number, kg)
- `weightDate` (ISO 8601)

**Champs optionnels:**
- `id` (UUID)
- `source` (enum: `manual`, `scale`, `estimated`, default: `manual`)
- `notes` (string)

**Réponse 201 Created:**
```json
{
  "id": "weight-uuid",
  "farmId": "farm-uuid",
  "animalId": "animal-uuid",
  "weight": 450.5,
  "weightDate": "2025-11-20T10:00:00.000Z",
  "source": "scale",
  "createdAt": "2025-11-22T12:00:00.000Z"
}
```

---

#### Liste des pesées

```
GET /farms/{farmId}/weights?animalId={uuid}&source=scale
```

**Query Parameters:**
- `animalId` (UUID)
- `source` (enum)
- `fromDate` (ISO 8601)
- `toDate` (ISO 8601)

---

#### Historique des pesées d'un animal

```
GET /farms/{farmId}/weights/animal/{animalId}/history
```

**Réponse 200 OK:**
```json
{
  "animalId": "animal-uuid",
  "weights": [
    {
      "id": "weight-uuid-1",
      "weight": 420.0,
      "weightDate": "2025-10-01T10:00:00.000Z",
      "source": "scale"
    },
    {
      "id": "weight-uuid-2",
      "weight": 450.5,
      "weightDate": "2025-11-20T10:00:00.000Z",
      "source": "scale"
    }
  ],
  "averageWeight": 435.25,
  "weightGain": 30.5,
  "dailyGain": 0.61
}
```

---

#### Détail, Modifier, Supprimer

```
GET    /farms/{farmId}/weights/{weightId}
PUT    /farms/{farmId}/weights/{weightId}
DELETE /farms/{farmId}/weights/{weightId}
```

---

### 2.7 Breedings

#### Créer une reproduction

```
POST /farms/{farmId}/breedings
```

**Body:**
```json
{
  "id": "breeding-uuid",
  "motherId": "animal-uuid-female",
  "fatherId": "animal-uuid-male",
  "method": "natural",
  "breedingDate": "2025-11-01T10:00:00Z",
  "expectedBirthDate": "2026-08-15T00:00:00Z",
  "expectedOffspringCount": 1,
  "veterinarianId": "vet-uuid",
  "status": "planned"
}
```

**Champs requis:**
- `motherId` (UUID)
- `method` (enum: `natural`, `artificial_insemination`, `embryo_transfer`)
- `breedingDate` (ISO 8601)
- `expectedBirthDate` (ISO 8601)

**Champs optionnels:**
- `id` (UUID)
- `fatherId` (UUID) - Si le père est dans la ferme
- `fatherName` (string) - Si le père est externe
- `expectedOffspringCount` (number)
- `veterinarianId` (UUID)
- `veterinarianName` (string)
- `status` (enum, default: `planned`)
- `notes` (string)

**Réponse 201 Created:**
```json
{
  "id": "breeding-uuid",
  "farmId": "farm-uuid",
  "motherId": "animal-uuid-female",
  "fatherId": "animal-uuid-male",
  "method": "natural",
  "breedingDate": "2025-11-01T10:00:00.000Z",
  "expectedBirthDate": "2026-08-15T00:00:00.000Z",
  "status": "planned"
}
```

---

#### Liste des reproductions

```
GET /farms/{farmId}/breedings?status=planned&motherId={uuid}
```

**Query Parameters:**
- `motherId` (UUID)
- `fatherId` (UUID)
- `status` (enum)
- `fromDate` (ISO 8601)
- `toDate` (ISO 8601)

---

#### Naissances prévues

```
GET /farms/{farmId}/breedings/upcoming?days=30
```

**Query Parameters:**
- `days` (number, default: 30) - Prochains X jours

**Réponse 200 OK:**
```json
{
  "upcoming": [
    {
      "id": "breeding-uuid",
      "motherId": "animal-uuid",
      "motherVisualId": "Rouge-42",
      "expectedBirthDate": "2025-12-15T00:00:00.000Z",
      "daysUntilBirth": 23,
      "status": "confirmed"
    }
  ],
  "total": 1
}
```

---

#### Modifier une reproduction

```
PUT /farms/{farmId}/breedings/{breedingId}
```

**Body (pour enregistrer une naissance):**
```json
{
  "actualBirthDate": "2026-08-14T10:30:00Z",
  "offspringIds": ["newborn-uuid-1"],
  "status": "delivered"
}
```

---

#### Détail, Supprimer

```
GET    /farms/{farmId}/breedings/{breedingId}
DELETE /farms/{farmId}/breedings/{breedingId}
```

---

### 2.8 Documents

#### Créer un document

```
POST /farms/{farmId}/documents
```

**Body:**
```json
{
  "id": "document-uuid",
  "animalId": "animal-uuid",
  "type": "health_certificate",
  "title": "Certificat sanitaire",
  "fileName": "certificat_2025.pdf",
  "fileUrl": "https://storage.example.com/docs/cert.pdf",
  "fileSizeBytes": 245678,
  "mimeType": "application/pdf",
  "uploadDate": "2025-11-20T10:00:00Z",
  "documentNumber": "CERT-2025-001",
  "issueDate": "2025-11-15T00:00:00Z",
  "expiryDate": "2026-11-15T00:00:00Z",
  "uploadedBy": "user-uuid"
}
```

**Champs requis:**
- `type` (enum)
- `fileName` (string)
- `fileUrl` (string)
- `uploadDate` (ISO 8601)

**Champs optionnels:**
- `id` (UUID)
- `animalId` (UUID) - null pour documents de la ferme
- `title` (string)
- `fileSizeBytes` (number)
- `mimeType` (string)
- `uploadedBy` (string)
- `documentNumber` (string)
- `issueDate` (ISO 8601)
- `expiryDate` (ISO 8601)
- `notes` (string)

**Réponse 201 Created:**
```json
{
  "id": "document-uuid",
  "farmId": "farm-uuid",
  "type": "health_certificate",
  "fileName": "certificat_2025.pdf",
  "fileUrl": "https://storage.example.com/docs/cert.pdf",
  "expiryDate": "2026-11-15T00:00:00.000Z"
}
```

---

#### Liste des documents

```
GET /farms/{farmId}/documents?type=health_certificate
```

**Query Parameters:**
- `type` (enum)
- `search` (string) - Recherche par titre
- `expiringSoon` (boolean) - Documents qui expirent bientôt

---

#### Documents qui expirent bientôt

```
GET /farms/{farmId}/documents/expiring?days=30
```

**Réponse 200 OK:**
```json
{
  "documents": [
    {
      "id": "document-uuid",
      "title": "Certificat sanitaire",
      "expiryDate": "2025-12-20T00:00:00.000Z",
      "daysUntilExpiry": 28
    }
  ],
  "total": 1
}
```

---

#### Documents expirés

```
GET /farms/{farmId}/documents/expired
```

---

#### Détail, Modifier, Supprimer

```
GET    /farms/{farmId}/documents/{documentId}
PUT    /farms/{farmId}/documents/{documentId}
DELETE /farms/{farmId}/documents/{documentId}
```

---

## 3. Données de Référence

### 3.1 Species

#### Liste des espèces

```
GET /api/v1/species
```

**Réponse 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cattle",
      "name_fr": "Bovin",
      "name_en": "Cattle",
      "name_ar": "أبقار",
      "icon": "🐄",
      "display_order": 1
    },
    {
      "id": "sheep",
      "name_fr": "Ovin",
      "name_en": "Sheep",
      "name_ar": "غنم",
      "icon": "🐑",
      "display_order": 2
    }
  ]
}
```

---

#### Détail d'une espèce

```
GET /api/v1/species/{speciesId}
```

**Réponse 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "cattle",
    "name_fr": "Bovin",
    "name_en": "Cattle",
    "name_ar": "أبقار",
    "icon": "🐄",
    "display_order": 1
  }
}
```

---

#### Créer une espèce (Admin)

```
POST /api/v1/species
```

**Body:**
```json
{
  "id": "camel",
  "nameFr": "Chameau",
  "nameEn": "Camel",
  "nameAr": "جمل",
  "icon": "🐪",
  "displayOrder": 4
}
```

**Champs requis:**
- `id` (string) - Identifiant unique
- `nameFr` (string)
- `nameEn` (string)
- `nameAr` (string)

**Champs optionnels:**
- `icon` (string)
- `displayOrder` (number, default: 0)

**Réponse 201 Created:**
```json
{
  "success": true,
  "data": {
    "id": "camel",
    "name_fr": "Chameau",
    "name_en": "Camel",
    "name_ar": "جمل",
    "icon": "🐪",
    "display_order": 4
  }
}
```

---

#### Modifier une espèce (Admin)

```
PUT /api/v1/species/{speciesId}
```

**Body (tous champs optionnels):**
```json
{
  "nameFr": "Chameau dromadaire",
  "displayOrder": 5
}
```

---

#### Supprimer une espèce (Admin)

```
DELETE /api/v1/species/{speciesId}
```

**Réponse 204 No Content**

---

### 3.2 Breeds

#### Liste des races

```
GET /api/v1/breeds?speciesId=cattle
```

**Query Parameters:**
- `speciesId` (string) - Filtrer par espèce

**Réponse 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": "holstein",
      "species_id": "cattle",
      "name_fr": "Holstein",
      "name_en": "Holstein",
      "name_ar": "هولشتاين",
      "description": "Race laitière",
      "display_order": 1,
      "is_active": true
    }
  ]
}
```

---

#### Créer une race (Admin)

```
POST /api/v1/breeds
```

**Body:**
```json
{
  "id": "montbeliarde",
  "speciesId": "cattle",
  "nameFr": "Montbéliarde",
  "nameEn": "Montbeliarde",
  "nameAr": "مونبيليارد",
  "description": "Race mixte lait/viande",
  "displayOrder": 2,
  "isActive": true
}
```

**Champs requis:**
- `id` (string)
- `speciesId` (string)
- `nameFr` (string)
- `nameEn` (string)
- `nameAr` (string)

---

#### Détail, Modifier, Supprimer

```
GET    /api/v1/breeds/{breedId}
PUT    /api/v1/breeds/{breedId}  (Admin)
DELETE /api/v1/breeds/{breedId}  (Admin)
```

---

### 3.3 Medical Products

#### Liste des produits médicaux

```
GET /farms/{farmId}/medical-products?category=antibiotic&isActive=true
```

**Query Parameters:**
- `search` (string) - Recherche par nom
- `category` (string) - Filtrer par catégorie
- `type` (string) - Filtrer par type
- `isActive` (boolean)

**Réponse 200 OK:**
```json
{
  "data": [
    {
      "id": "product-uuid",
      "farmId": "farm-uuid",
      "name": "Antibiotique X",
      "commercialName": "CommerX",
      "category": "antibiotic",
      "activeIngredient": "Pénicilline",
      "manufacturer": "PharmaCo",
      "withdrawalPeriodMeat": 28,
      "withdrawalPeriodMilk": 72,
      "currentStock": 50,
      "stockUnit": "ml",
      "isActive": true
    }
  ]
}
```

---

#### Créer un produit médical

```
POST /farms/{farmId}/medical-products
```

**Body:**
```json
{
  "name": "Antibiotique X",
  "commercialName": "CommerX",
  "category": "antibiotic",
  "activeIngredient": "Pénicilline",
  "manufacturer": "PharmaCo",
  "dosage": 100,
  "withdrawalPeriodMeat": 28,
  "withdrawalPeriodMilk": 72,
  "currentStock": 50,
  "minStock": 10,
  "stockUnit": "ml",
  "unitPrice": 15.50,
  "type": "treatment",
  "targetSpecies": "cattle",
  "isActive": true
}
```

**Champs requis:**
- `name` (string)
- `category` (string)
- `withdrawalPeriodMeat` (number, jours)
- `withdrawalPeriodMilk` (number, jours)
- `stockUnit` (string)

---

#### Détail, Modifier, Supprimer

```
GET    /farms/{farmId}/medical-products/{productId}
PUT    /farms/{farmId}/medical-products/{productId}
DELETE /farms/{farmId}/medical-products/{productId}
```

---

### 3.4 Vaccines

#### Liste des vaccins

```
GET /farms/{farmId}/vaccines?isActive=true
```

**Query Parameters:**
- `search` (string)
- `isActive` (boolean)

**Réponse 200 OK:**
```json
{
  "data": [
    {
      "id": "vaccine-uuid",
      "farmId": "farm-uuid",
      "name": "Vaccin Rage",
      "description": "Protection contre la rage",
      "manufacturer": "VetPharma",
      "targetSpecies": ["cattle", "sheep"],
      "targetDiseases": ["Rage"],
      "standardDose": 1,
      "injectionsRequired": 1,
      "meatWithdrawalDays": 0,
      "milkWithdrawalDays": 0,
      "isActive": true
    }
  ]
}
```

---

#### Créer un vaccin

```
POST /farms/{farmId}/vaccines
```

**Body:**
```json
{
  "name": "Vaccin Rage",
  "description": "Protection contre la rage",
  "manufacturer": "VetPharma",
  "targetSpecies": ["cattle", "sheep"],
  "targetDiseases": ["Rage"],
  "standardDose": 1,
  "injectionsRequired": 1,
  "injectionIntervalDays": 0,
  "meatWithdrawalDays": 0,
  "milkWithdrawalDays": 0,
  "administrationRoute": "Sous-cutanée",
  "isActive": true
}
```

**Champs requis:**
- `name` (string)

---

#### Détail, Modifier, Supprimer

```
GET    /farms/{farmId}/vaccines/{vaccineId}
PUT    /farms/{farmId}/vaccines/{vaccineId}
DELETE /farms/{farmId}/vaccines/{vaccineId}
```

---

### 3.5 Veterinarians

#### Liste des vétérinaires

```
GET /farms/{farmId}/veterinarians?isActive=true
```

**Query Parameters:**
- `search` (string) - Recherche par nom
- `isActive` (boolean)
- `isAvailable` (boolean)
- `emergencyService` (boolean)

**Réponse 200 OK:**
```json
{
  "data": [
    {
      "id": "vet-uuid",
      "farmId": "farm-uuid",
      "firstName": "Jean",
      "lastName": "Martin",
      "title": "Dr.",
      "licenseNumber": "VET-2025-001",
      "specialties": ["Bovins", "Ovins"],
      "clinic": "Clinique Vétérinaire Rurale",
      "phone": "+33123456789",
      "email": "j.martin@vet.com",
      "isAvailable": true,
      "emergencyService": true,
      "consultationFee": 80.00,
      "isActive": true
    }
  ]
}
```

---

#### Créer un vétérinaire

```
POST /farms/{farmId}/veterinarians
```

**Body:**
```json
{
  "firstName": "Jean",
  "lastName": "Martin",
  "title": "Dr.",
  "licenseNumber": "VET-2025-001",
  "specialties": "Bovins,Ovins",
  "clinic": "Clinique Vétérinaire Rurale",
  "phone": "+33123456789",
  "mobile": "+33987654321",
  "email": "j.martin@vet.com",
  "address": "123 Rue de la Ferme",
  "city": "Ville",
  "postalCode": "75000",
  "country": "France",
  "isAvailable": true,
  "emergencyService": true,
  "workingHours": "Lun-Ven 8h-18h",
  "consultationFee": 80.00,
  "emergencyFee": 150.00,
  "currency": "EUR",
  "isPreferred": false,
  "isDefault": false,
  "isActive": true
}
```

**Champs requis:**
- `firstName` (string)
- `lastName` (string)
- `licenseNumber` (string)
- `specialties` (string)
- `phone` (string)

---

#### Détail, Modifier, Supprimer

```
GET    /farms/{farmId}/veterinarians/{vetId}
PUT    /farms/{farmId}/veterinarians/{vetId}
DELETE /farms/{farmId}/veterinarians/{vetId}
```

---

### 3.6 Campaigns

#### Liste des campagnes

```
GET /farms/{farmId}/campaigns?status=in_progress&type=vaccination
```

**Query Parameters:**
- `type` (enum)
- `status` (enum)
- `fromDate` (ISO 8601)
- `toDate` (ISO 8601)

**Réponse 200 OK:**
```json
{
  "data": [
    {
      "id": "campaign-uuid",
      "farmId": "farm-uuid",
      "name": "Campagne Vaccination Automne 2025",
      "type": "vaccination",
      "productId": "vaccine-uuid",
      "productName": "Vaccin Rage",
      "campaignDate": "2025-11-20T00:00:00.000Z",
      "status": "in_progress",
      "targetCount": 50,
      "completedCount": 35
    }
  ]
}
```

---

#### Campagnes actives

```
GET /farms/{farmId}/campaigns/active
```

---

#### Détail d'une campagne (avec vaccinations)

```
GET /farms/{farmId}/campaigns/{campaignId}
```

**Réponse 200 OK:**
```json
{
  "id": "campaign-uuid",
  "name": "Campagne Vaccination Automne 2025",
  "type": "vaccination",
  "status": "in_progress",
  "targetCount": 50,
  "completedCount": 35,
  "vaccinations": [
    {
      "id": "vacc-uuid-1",
      "animalId": "animal-uuid-1",
      "vaccinationDate": "2025-11-20T10:00:00.000Z"
    }
  ]
}
```

---

#### Progression d'une campagne

```
GET /farms/{farmId}/campaigns/{campaignId}/progress
```

**Réponse 200 OK:**
```json
{
  "campaignId": "campaign-uuid",
  "targetCount": 50,
  "completedCount": 35,
  "progressPercentage": 70,
  "remainingCount": 15
}
```

---

#### Créer, Modifier, Supprimer

```
POST   /farms/{farmId}/campaigns
PUT    /farms/{farmId}/campaigns/{campaignId}
DELETE /farms/{farmId}/campaigns/{campaignId}
```

---

### 3.7 Farm Preferences

#### Obtenir les préférences

```
GET /farms/{farmId}/preferences
```

**Réponse 200 OK:**
```json
{
  "id": "pref-uuid",
  "farmId": "farm-uuid",
  "defaultVeterinarianId": "vet-uuid",
  "defaultSpeciesId": "cattle",
  "defaultBreedId": "holstein",
  "weightUnit": "kg",
  "currency": "EUR",
  "language": "fr",
  "dateFormat": "DD/MM/YYYY",
  "enableNotifications": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-11-22T12:00:00.000Z"
}
```

---

#### Modifier les préférences

```
PUT /farms/{farmId}/preferences
```

**Body (tous champs optionnels):**
```json
{
  "defaultVeterinarianId": "vet-uuid",
  "defaultSpeciesId": "sheep",
  "weightUnit": "kg",
  "currency": "EUR",
  "language": "fr",
  "enableNotifications": true
}
```

---

### 3.8 Alert Configurations

#### Liste des configurations d'alertes

```
GET /farms/{farmId}/alert-configurations?enabled=true&type=urgent
```

**Query Parameters:**
- `type` (string: `urgent`, `important`, `routine`)
- `category` (string)
- `enabled` (boolean)

**Réponse 200 OK:**
```json
{
  "data": [
    {
      "id": "alert-config-uuid",
      "farmId": "farm-uuid",
      "evaluationType": "vaccination",
      "type": "urgent",
      "category": "health",
      "titleKey": "alert.vaccination.due.title",
      "messageKey": "alert.vaccination.due.message",
      "severity": 8,
      "iconName": "syringe",
      "colorHex": "#FF5722",
      "enabled": true,
      "daysBeforeDue": 7,
      "priority": "high"
    }
  ]
}
```

---

#### Détail d'une configuration

```
GET /farms/{farmId}/alert-configurations/{alertId}
```

---

#### Créer une configuration (Admin)

```
POST /farms/{farmId}/alert-configurations
```

**Body:**
```json
{
  "farmId": "farm-uuid",
  "evaluationType": "weighing",
  "type": "routine",
  "category": "monitoring",
  "titleKey": "alert.weighing.due.title",
  "messageKey": "alert.weighing.due.message",
  "severity": 5,
  "iconName": "scale",
  "colorHex": "#2196F3",
  "enabled": true,
  "daysBeforeDue": 30,
  "priority": "medium"
}
```

---

#### Modifier une configuration

```
PUT /farms/{farmId}/alert-configurations/{alertId}
```

**Body:**
```json
{
  "enabled": false,
  "daysBeforeDue": 14,
  "priority": "low"
}
```

---

### 3.9 Farms

#### Liste des fermes

```
GET /api/farms?ownerId={userId}&isDefault=true
```

**Query Parameters:**
- `search` (string) - Recherche par nom ou localisation
- `ownerId` (UUID) - Filtrer par propriétaire
- `groupId` (UUID) - Filtrer par groupe
- `isDefault` (boolean)

**Réponse 200 OK:**
```json
{
  "data": [
    {
      "id": "farm-uuid",
      "name": "Ferme du Val",
      "location": "Normandie, France",
      "ownerId": "user-uuid",
      "cheptelNumber": "FR-75-001",
      "groupId": "group-uuid",
      "groupName": "Groupe Agricole Nord",
      "isDefault": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-11-22T12:00:00.000Z"
    }
  ]
}
```

---

#### Détail d'une ferme

```
GET /api/farms/{farmId}?includeStats=true
```

**Query Parameters:**
- `includeStats` (boolean) - Inclure les statistiques

**Réponse 200 OK (avec stats):**
```json
{
  "id": "farm-uuid",
  "name": "Ferme du Val",
  "location": "Normandie, France",
  "ownerId": "user-uuid",
  "cheptelNumber": "FR-75-001",
  "isDefault": true,
  "stats": {
    "totalAnimals": 125,
    "animalsBySpecies": {
      "cattle": 80,
      "sheep": 45
    },
    "animalsByStatus": {
      "alive": 120,
      "sold": 5
    }
  },
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

#### Créer une ferme

```
POST /api/farms
```

**Body:**
```json
{
  "id": "farm-uuid",
  "name": "Ferme du Val",
  "location": "Normandie, France",
  "ownerId": "user-uuid",
  "cheptelNumber": "FR-75-001",
  "groupId": "group-uuid",
  "groupName": "Groupe Agricole Nord",
  "isDefault": true
}
```

**Champs requis:**
- `id` (UUID)
- `name` (string)
- `location` (string)
- `ownerId` (UUID)

---

#### Modifier, Supprimer

```
PUT    /api/farms/{farmId}
DELETE /api/farms/{farmId}
```

---

## 4. Enums & Types

### AnimalStatus
```
alive | sold | dead | slaughtered | draft | onTemporaryMovement
```

### Sex
```
male | female
```

### LotType
```
reproduction | fattening | weaning | quarantine | sale | other
```

### MovementType
```
entry | exit | birth | death | sale | purchase |
transfer_in | transfer_out | temporary_out | temporary_return
```

### TemporaryMovementType
```
veterinary | exhibition | breeding | grazing | other
```

### BuyerType
```
individual | farm | market | slaughterhouse | export | other
```

### TreatmentStatus
```
scheduled | in_progress | completed | cancelled
```

### VaccinationType
```
obligatoire | recommandee | optionnelle
```

### WeightSource
```
manual | scale | estimated
```

### BreedingMethod
```
natural | artificial_insemination | embryo_transfer
```

### BreedingStatus
```
planned | in_progress | confirmed | failed | aborted | delivered
```

### CampaignType
```
vaccination | treatment | weighing | identification
```

### CampaignStatus
```
planned | in_progress | completed | cancelled
```

### DocumentType
```
health_certificate | movement_permit | sale_invoice |
purchase_invoice | vaccination_record | other
```

### AlertPriority
```
low | medium | high | critical
```

---

## 5. Codes d'erreur

### Codes HTTP standards

| Code | Description | Exemple |
|------|-------------|---------|
| **200** | OK | Requête réussie |
| **201** | Created | Ressource créée |
| **204** | No Content | Suppression réussie |
| **400** | Bad Request | Données invalides |
| **401** | Unauthorized | Token manquant/invalide |
| **403** | Forbidden | Accès refusé à la ressource |
| **404** | Not Found | Ressource non trouvée |
| **409** | Conflict | Conflit (ex: ID déjà existant) |
| **422** | Unprocessable Entity | Erreur de validation métier |
| **500** | Internal Server Error | Erreur serveur |

### Format des erreurs

**Erreur de validation (400, 422):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "birthDate",
      "message": "Birth date cannot be in the future"
    },
    {
      "field": "sex",
      "message": "sex must be one of: male, female"
    }
  ]
}
```

**Erreur simple (404, 403):**
```json
{
  "statusCode": 404,
  "message": "Animal not found"
}
```

**Erreur de conflit (409):**
```json
{
  "statusCode": 409,
  "message": "Animal with this ID already exists",
  "existingId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Notes importantes

### Multi-tenancy
Toutes les entités transactionnelles sont isolées par `farmId`. Un utilisateur ne peut accéder qu'aux données des fermes auxquelles il a accès.

### Soft Delete
Les suppressions sont des soft deletes (champ `deletedAt`). Les données ne sont pas physiquement supprimées de la base.

### Pagination
La plupart des endpoints de liste supportent la pagination:
- `page` (default: 1)
- `limit` (default: 50, max: 100)

### Tri
Endpoints de liste avec tri:
- `sort` (nom du champ)
- `order` (`asc` | `desc`)

### Timestamps
Tous les records ont:
- `createdAt` (ISO 8601)
- `updatedAt` (ISO 8601)
- `deletedAt` (ISO 8601, null si non supprimé)

### UUIDs
Les IDs sont des UUIDs v4 générés côté client pour supporter le mode offline.

---

**Fin du document**
