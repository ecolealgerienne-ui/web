# Spécification Backend - Module Pharmacie Simplifié

**Version:** 1.0
**Date:** 2025-12-13
**Statut:** Draft

---

## 1. Vue d'ensemble

### 1.1 Objectifs
- Simplifier le modèle de données de 8+ tables à 3 tables principales
- Supporter les produits globaux (ANMV) et locaux (ferme)
- Calculer automatiquement les délais d'attente
- Maintenir la traçabilité des traitements

### 1.2 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Base de données                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │   Product   │    │ FarmMedicineStock│   │    Treatment    │  │
│  │ (global/    │◄───│   (per lot)      │◄──│ (per treatment) │  │
│  │  local)     │    │                  │   │                 │  │
│  └─────────────┘    └─────────────────┘    └─────────────────┘  │
│                              │                     │            │
│                              ▼                     ▼            │
│                        ┌─────────┐          ┌──────────┐       │
│                        │  Farm   │          │ Animal/  │       │
│                        │         │          │   Lot    │       │
│                        └─────────┘          └──────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Schéma Base de Données

### 2.1 Tables à supprimer

```sql
-- Tables à supprimer (migration)
DROP TABLE IF EXISTS product_active_substances;
DROP TABLE IF EXISTS product_therapeutic_indications;
DROP TABLE IF EXISTS active_substances;
DROP TABLE IF EXISTS administration_routes;
DROP TABLE IF EXISTS product_categories;
DROP TABLE IF EXISTS product_packagings;
DROP TABLE IF EXISTS therapeutic_indications;
DROP TABLE IF EXISTS products; -- Remplacée par nouvelle structure
```

### 2.2 Table: Product (nouvelle)

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Scope: global (ANMV) ou local (ferme)
    scope VARCHAR(10) NOT NULL CHECK (scope IN ('global', 'local')),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    -- Contrainte: farm_id NULL si global, NOT NULL si local

    -- Identification ANMV (optionnel)
    anmv_code VARCHAR(20),           -- Code AMM ANMV
    gtin VARCHAR(14),                -- Code-barres EAN/GTIN

    -- Informations produit
    name VARCHAR(255) NOT NULL,
    commercial_name VARCHAR(255),
    laboratory VARCHAR(255),

    -- Composition et dosage (info seulement)
    composition TEXT,                -- Ex: "Amoxicilline trihydratée 150mg/ml"
    dosage_info TEXT,                -- Ex: "1ml pour 10kg de poids vif"
    dosage_per_kg DECIMAL(10,4),     -- Dose numérique (optionnel)
    dosage_unit VARCHAR(20),         -- ml, mg, etc.

    -- Délais d'attente (jours)
    withdrawal_meat INTEGER,         -- Délai viande en jours
    withdrawal_milk INTEGER,         -- Délai lait en jours

    -- Conditionnement standard
    packaging_size DECIMAL(10,2),    -- Ex: 100, 250, 500
    packaging_unit VARCHAR(20),      -- ml, comprimés, sachets

    -- Classification
    category VARCHAR(50),            -- antibiotic, antiparasitic, etc.
    administration_route VARCHAR(50),-- injectable, oral, topical, etc.
    target_species TEXT[],           -- ['bovine', 'ovine', 'caprine']

    -- Réglementation
    prescription_required BOOLEAN DEFAULT false,

    -- Statut
    is_active BOOLEAN DEFAULT true,

    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    -- Contraintes
    CONSTRAINT check_scope_farm CHECK (
        (scope = 'global' AND farm_id IS NULL) OR
        (scope = 'local' AND farm_id IS NOT NULL)
    ),
    CONSTRAINT unique_anmv_code UNIQUE (anmv_code)
);

-- Index
CREATE INDEX idx_products_scope ON products(scope);
CREATE INDEX idx_products_farm_id ON products(farm_id) WHERE farm_id IS NOT NULL;
CREATE INDEX idx_products_anmv_code ON products(anmv_code) WHERE anmv_code IS NOT NULL;
CREATE INDEX idx_products_gtin ON products(gtin) WHERE gtin IS NOT NULL;
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('french', name));
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
```

### 2.3 Table: FarmMedicineStock

```sql
CREATE TABLE farm_medicine_stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,

    -- Identification lot
    batch_number VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,

    -- Stock
    initial_quantity DECIMAL(10,2) NOT NULL,
    current_stock DECIMAL(10,2) NOT NULL,
    stock_unit VARCHAR(20) NOT NULL,  -- ml, comprimés, sachets, etc.

    -- Informations achat
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    purchase_price DECIMAL(10,2),     -- Prix TTC en euros
    supplier VARCHAR(255),

    -- Statut
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'empty', 'expired', 'disposed')),
    disposed_at TIMESTAMP WITH TIME ZONE,
    disposed_reason VARCHAR(255),

    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    -- Contraintes
    CONSTRAINT check_stock_positive CHECK (current_stock >= 0),
    CONSTRAINT check_initial_positive CHECK (initial_quantity > 0),
    CONSTRAINT unique_farm_product_batch UNIQUE (farm_id, product_id, batch_number)
);

-- Index
CREATE INDEX idx_farm_medicine_stocks_farm ON farm_medicine_stocks(farm_id);
CREATE INDEX idx_farm_medicine_stocks_product ON farm_medicine_stocks(product_id);
CREATE INDEX idx_farm_medicine_stocks_expiry ON farm_medicine_stocks(expiry_date);
CREATE INDEX idx_farm_medicine_stocks_status ON farm_medicine_stocks(status);
```

### 2.4 Table: Treatment

```sql
CREATE TABLE treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,

    -- Cible du traitement (animal OU lot)
    animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    lot_id UUID REFERENCES lots(id) ON DELETE SET NULL,
    animals_count INTEGER,  -- Nombre d'animaux si traitement par lot

    -- Médicament utilisé
    medicine_stock_id UUID NOT NULL REFERENCES farm_medicine_stocks(id) ON DELETE RESTRICT,

    -- Dosage (SAISIE MANUELLE - responsabilité fermier)
    dose_given DECIMAL(10,2) NOT NULL,
    dose_unit VARCHAR(20) NOT NULL,

    -- Date/heure du traitement
    treatment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    treatment_time TIME,

    -- Délais d'attente calculés automatiquement
    withdrawal_end_meat DATE,
    withdrawal_end_milk DATE,

    -- Informations complémentaires
    reason VARCHAR(500),             -- Motif du traitement
    notes TEXT,

    -- Prescription (optionnel)
    prescription_required BOOLEAN DEFAULT false,
    prescription_number VARCHAR(100),
    veterinarian_name VARCHAR(255),
    veterinarian_id UUID REFERENCES veterinarians(id),

    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    -- Contraintes
    CONSTRAINT check_animal_or_lot CHECK (
        (animal_id IS NOT NULL AND lot_id IS NULL) OR
        (animal_id IS NULL AND lot_id IS NOT NULL)
    ),
    CONSTRAINT check_dose_positive CHECK (dose_given > 0)
);

-- Index
CREATE INDEX idx_treatments_farm ON treatments(farm_id);
CREATE INDEX idx_treatments_animal ON treatments(animal_id) WHERE animal_id IS NOT NULL;
CREATE INDEX idx_treatments_lot ON treatments(lot_id) WHERE lot_id IS NOT NULL;
CREATE INDEX idx_treatments_stock ON treatments(medicine_stock_id);
CREATE INDEX idx_treatments_date ON treatments(treatment_date);
CREATE INDEX idx_treatments_withdrawal_meat ON treatments(withdrawal_end_meat) WHERE withdrawal_end_meat IS NOT NULL;
CREATE INDEX idx_treatments_withdrawal_milk ON treatments(withdrawal_end_milk) WHERE withdrawal_end_milk IS NOT NULL;
```

### 2.5 Triggers

```sql
-- Trigger: Mise à jour stock après traitement
CREATE OR REPLACE FUNCTION update_stock_after_treatment()
RETURNS TRIGGER AS $$
BEGIN
    -- Décrémenter le stock
    UPDATE farm_medicine_stocks
    SET current_stock = current_stock - NEW.dose_given,
        updated_at = NOW(),
        status = CASE
            WHEN current_stock - NEW.dose_given <= 0 THEN 'empty'
            ELSE status
        END
    WHERE id = NEW.medicine_stock_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_after_treatment
AFTER INSERT ON treatments
FOR EACH ROW
EXECUTE FUNCTION update_stock_after_treatment();

-- Trigger: Calculer délais d'attente automatiquement
CREATE OR REPLACE FUNCTION calculate_withdrawal_dates()
RETURNS TRIGGER AS $$
DECLARE
    v_withdrawal_meat INTEGER;
    v_withdrawal_milk INTEGER;
BEGIN
    -- Récupérer les délais du produit
    SELECT p.withdrawal_meat, p.withdrawal_milk
    INTO v_withdrawal_meat, v_withdrawal_milk
    FROM farm_medicine_stocks fms
    JOIN products p ON p.id = fms.product_id
    WHERE fms.id = NEW.medicine_stock_id;

    -- Calculer les dates de fin de délai
    IF v_withdrawal_meat IS NOT NULL THEN
        NEW.withdrawal_end_meat := NEW.treatment_date + v_withdrawal_meat;
    END IF;

    IF v_withdrawal_milk IS NOT NULL THEN
        NEW.withdrawal_end_milk := NEW.treatment_date + v_withdrawal_milk;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_withdrawal_dates
BEFORE INSERT ON treatments
FOR EACH ROW
EXECUTE FUNCTION calculate_withdrawal_dates();

-- Trigger: Marquer stocks expirés automatiquement (cron job recommandé)
CREATE OR REPLACE FUNCTION mark_expired_stocks()
RETURNS void AS $$
BEGIN
    UPDATE farm_medicine_stocks
    SET status = 'expired',
        updated_at = NOW()
    WHERE expiry_date < CURRENT_DATE
      AND status = 'active';
END;
$$ LANGUAGE plpgsql;
```

---

## 3. Types TypeScript

### 3.1 Product

```typescript
// src/lib/types/pharmacy/product.ts

export type ProductScope = 'global' | 'local';

export type ProductCategory =
  | 'antibiotic'
  | 'antiparasitic'
  | 'anti_inflammatory'
  | 'vitamin_mineral'
  | 'hormone'
  | 'antiseptic'
  | 'vaccine'
  | 'other';

export type AdministrationRoute =
  | 'injectable'
  | 'oral'
  | 'topical'
  | 'intramammary'
  | 'intrauterine'
  | 'other';

export interface Product {
  id: string;
  scope: ProductScope;
  farmId?: string;

  // Identification ANMV
  anmvCode?: string;
  gtin?: string;

  // Informations produit
  name: string;
  commercialName?: string;
  laboratory?: string;

  // Composition et dosage
  composition?: string;
  dosageInfo?: string;
  dosagePerKg?: number;
  dosageUnit?: string;

  // Délais d'attente
  withdrawalMeat?: number;
  withdrawalMilk?: number;

  // Conditionnement
  packagingSize?: number;
  packagingUnit?: string;

  // Classification
  category?: ProductCategory;
  administrationRoute?: AdministrationRoute;
  targetSpecies?: string[];

  // Réglementation
  prescriptionRequired: boolean;

  // Statut
  isActive: boolean;

  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  scope: ProductScope;
  farmId?: string;
  name: string;
  commercialName?: string;
  laboratory?: string;
  composition?: string;
  dosageInfo?: string;
  dosagePerKg?: number;
  dosageUnit?: string;
  withdrawalMeat?: number;
  withdrawalMilk?: number;
  packagingSize?: number;
  packagingUnit?: string;
  category?: ProductCategory;
  administrationRoute?: AdministrationRoute;
  targetSpecies?: string[];
  prescriptionRequired?: boolean;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  commercialName?: string;
  laboratory?: string;
  composition?: string;
  dosageInfo?: string;
  dosagePerKg?: number;
  dosageUnit?: string;
  withdrawalMeat?: number;
  withdrawalMilk?: number;
  packagingSize?: number;
  packagingUnit?: string;
  category?: ProductCategory;
  administrationRoute?: AdministrationRoute;
  targetSpecies?: string[];
  prescriptionRequired?: boolean;
  isActive?: boolean;
}

export interface ProductFilters {
  search?: string;
  scope?: ProductScope | 'all';
  category?: ProductCategory;
  administrationRoute?: AdministrationRoute;
  targetSpecies?: string;
  prescriptionRequired?: boolean;
  isActive?: boolean;
}
```

### 3.2 FarmMedicineStock

```typescript
// src/lib/types/pharmacy/stock.ts

import type { Product } from './product';

export type StockStatus = 'active' | 'empty' | 'expired' | 'disposed';

export interface FarmMedicineStock {
  id: string;
  farmId: string;
  productId: string;
  product?: Product;

  // Lot
  batchNumber: string;
  expiryDate: string;

  // Stock
  initialQuantity: number;
  currentStock: number;
  stockUnit: string;

  // Achat
  purchaseDate: string;
  purchasePrice?: number;
  supplier?: string;

  // Statut
  status: StockStatus;
  disposedAt?: string;
  disposedReason?: string;

  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

export interface CreateStockDto {
  productId: string;
  batchNumber: string;
  expiryDate: string;
  initialQuantity: number;
  stockUnit: string;
  purchaseDate?: string;
  purchasePrice?: number;
  supplier?: string;
}

export interface UpdateStockDto {
  currentStock?: number;
  status?: StockStatus;
  disposedReason?: string;
}

export interface AdjustStockDto {
  adjustment: number;  // Positif ou négatif
  reason: string;
}

export interface StockFilters {
  search?: string;
  status?: StockStatus | 'all';
  category?: string;
  expiringWithinDays?: number;
  lowStock?: boolean;
}

export interface StockStats {
  totalProducts: number;
  lowStockCount: number;
  expiredCount: number;
  expiringWithin30Days: number;
  totalValue: number;
}
```

### 3.3 Treatment

```typescript
// src/lib/types/pharmacy/treatment.ts

import type { FarmMedicineStock } from './stock';
import type { Animal } from '../animal';
import type { Lot } from '../lot';

export interface Treatment {
  id: string;
  farmId: string;

  // Cible
  animalId?: string;
  animal?: Animal;
  lotId?: string;
  lot?: Lot;
  animalsCount?: number;

  // Médicament
  medicineStockId: string;
  medicineStock?: FarmMedicineStock;

  // Dosage (manuel)
  doseGiven: number;
  doseUnit: string;

  // Date/heure
  treatmentDate: string;
  treatmentTime?: string;

  // Délais calculés
  withdrawalEndMeat?: string;
  withdrawalEndMilk?: string;

  // Infos
  reason?: string;
  notes?: string;

  // Prescription
  prescriptionRequired: boolean;
  prescriptionNumber?: string;
  veterinarianName?: string;
  veterinarianId?: string;

  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

export interface CreateTreatmentDto {
  animalId?: string;
  lotId?: string;
  animalsCount?: number;
  medicineStockId: string;
  doseGiven: number;
  doseUnit: string;
  treatmentDate?: string;
  treatmentTime?: string;
  reason?: string;
  notes?: string;
  prescriptionNumber?: string;
  veterinarianName?: string;
  veterinarianId?: string;
}

export interface TreatmentFilters {
  search?: string;
  animalId?: string;
  lotId?: string;
  productId?: string;
  fromDate?: string;
  toDate?: string;
  hasActiveWithdrawal?: boolean;
}

export interface TreatmentStats {
  totalThisMonth: number;
  animalsUnderWithdrawalMeat: number;
  animalsUnderWithdrawalMilk: number;
  upcomingWithdrawalEnd: number;
}

export interface WithdrawalAlert {
  treatmentId: string;
  animalId?: string;
  animalIdentifier?: string;
  lotId?: string;
  lotName?: string;
  productName: string;
  type: 'meat' | 'milk';
  endDate: string;
  daysRemaining: number;
}
```

---

## 4. API Endpoints

### 4.1 Products (Catalogue)

```
Base URL: /api/v1/products
```

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Liste tous les produits (global + local ferme) | User |
| GET | `/:id` | Détail d'un produit | User |
| POST | `/` | Créer un produit local | User |
| PUT | `/:id` | Modifier un produit local | User |
| DELETE | `/:id` | Supprimer un produit local | User |
| GET | `/search` | Recherche full-text | User |
| GET | `/by-gtin/:gtin` | Recherche par code-barres | User |

#### GET /api/v1/products

**Query params:**
```typescript
{
  search?: string;          // Recherche nom, labo
  scope?: 'global' | 'local' | 'all';
  category?: ProductCategory;
  administrationRoute?: AdministrationRoute;
  targetSpecies?: string;   // Ex: 'bovine'
  prescriptionRequired?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "scope": "global",
      "name": "AMOXIVAL 500mg",
      "laboratory": "Virbac",
      "category": "antibiotic",
      "withdrawalMeat": 28,
      "withdrawalMilk": 4,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

#### POST /api/v1/products (Produit local)

**Body:**
```json
{
  "scope": "local",
  "name": "Mon produit custom",
  "category": "antiparasitic",
  "withdrawalMeat": 14,
  "withdrawalMilk": 2,
  "dosageInfo": "1ml pour 10kg",
  "targetSpecies": ["bovine", "ovine"]
}
```

**Note:** `farmId` est automatiquement ajouté depuis le contexte utilisateur.

---

### 4.2 Stock Pharmacie

```
Base URL: /api/v1/farms/{farmId}/pharmacy/stocks
```

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Liste le stock de la ferme | User |
| GET | `/stats` | Statistiques du stock | User |
| GET | `/:id` | Détail d'un stock | User |
| POST | `/` | Nouvel achat (ajout stock) | User |
| PUT | `/:id` | Modifier un stock | User |
| POST | `/:id/adjust` | Ajuster le stock | User |
| POST | `/:id/dispose` | Éliminer un lot | User |
| GET | `/:id/history` | Historique utilisations | User |

#### GET /api/v1/farms/{farmId}/pharmacy/stocks

**Query params:**
```typescript
{
  search?: string;
  status?: 'active' | 'empty' | 'expired' | 'disposed' | 'all';
  category?: ProductCategory;
  expiringWithinDays?: number;  // Ex: 30 pour péremption < 30j
  lowStock?: boolean;           // Stock < 20% initial
  page?: number;
  limit?: number;
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "productId": "uuid",
      "product": {
        "name": "AMOXIVAL 500mg",
        "laboratory": "Virbac",
        "category": "antibiotic"
      },
      "batchNumber": "ABC123",
      "expiryDate": "2026-06-15",
      "initialQuantity": 500,
      "currentStock": 450,
      "stockUnit": "ml",
      "status": "active",
      "purchaseDate": "2024-12-01",
      "purchasePrice": 45.00
    }
  ],
  "pagination": { ... }
}
```

#### GET /api/v1/farms/{farmId}/pharmacy/stocks/stats

**Response:**
```json
{
  "totalProducts": 12,
  "lowStockCount": 3,
  "expiredCount": 2,
  "expiringWithin30Days": 1,
  "totalValue": 847.50
}
```

#### POST /api/v1/farms/{farmId}/pharmacy/stocks

**Body:**
```json
{
  "productId": "uuid",
  "batchNumber": "ABC123",
  "expiryDate": "2026-06-15",
  "initialQuantity": 500,
  "stockUnit": "ml",
  "purchaseDate": "2024-12-13",
  "purchasePrice": 45.00,
  "supplier": "Coopérative agricole"
}
```

#### POST /api/v1/farms/{farmId}/pharmacy/stocks/:id/adjust

**Body:**
```json
{
  "adjustment": -50,
  "reason": "Perte - flacon cassé"
}
```

#### POST /api/v1/farms/{farmId}/pharmacy/stocks/:id/dispose

**Body:**
```json
{
  "reason": "Produit périmé - éliminé conformément réglementation"
}
```

---

### 4.3 Traitements

```
Base URL: /api/v1/farms/{farmId}/pharmacy/treatments
```

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Liste des traitements | User |
| GET | `/stats` | Statistiques traitements | User |
| GET | `/withdrawals` | Alertes délais d'attente | User |
| GET | `/:id` | Détail d'un traitement | User |
| POST | `/` | Nouveau traitement | User |
| PUT | `/:id` | Modifier un traitement | User |
| DELETE | `/:id` | Supprimer un traitement | User |

#### GET /api/v1/farms/{farmId}/pharmacy/treatments

**Query params:**
```typescript
{
  search?: string;
  animalId?: string;
  lotId?: string;
  productId?: string;
  fromDate?: string;        // ISO 8601
  toDate?: string;
  hasActiveWithdrawal?: boolean;
  page?: number;
  limit?: number;
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "animalId": "uuid",
      "animal": {
        "identifier": "FR1234567890",
        "name": "Marguerite"
      },
      "medicineStock": {
        "product": {
          "name": "AMOXIVAL 500mg"
        },
        "batchNumber": "ABC123"
      },
      "doseGiven": 15,
      "doseUnit": "ml",
      "treatmentDate": "2024-12-13",
      "treatmentTime": "09:30",
      "withdrawalEndMeat": "2025-01-10",
      "withdrawalEndMilk": "2024-12-17",
      "reason": "Mammite"
    }
  ],
  "pagination": { ... }
}
```

#### GET /api/v1/farms/{farmId}/pharmacy/treatments/stats

**Response:**
```json
{
  "totalThisMonth": 45,
  "animalsUnderWithdrawalMeat": 8,
  "animalsUnderWithdrawalMilk": 3,
  "upcomingWithdrawalEnd": 5
}
```

#### GET /api/v1/farms/{farmId}/pharmacy/treatments/withdrawals

**Query params:**
```typescript
{
  type?: 'meat' | 'milk' | 'all';
  daysRemaining?: number;  // Alertes < N jours
}
```

**Response:**
```json
{
  "data": [
    {
      "treatmentId": "uuid",
      "animalId": "uuid",
      "animalIdentifier": "FR1234567890",
      "productName": "AMOXIVAL 500mg",
      "type": "meat",
      "endDate": "2025-01-10",
      "daysRemaining": 28
    },
    {
      "treatmentId": "uuid",
      "lotId": "uuid",
      "lotName": "Génisses 2024",
      "productName": "IVOMEC",
      "type": "meat",
      "endDate": "2024-12-27",
      "daysRemaining": 14
    }
  ]
}
```

#### POST /api/v1/farms/{farmId}/pharmacy/treatments

**Body (animal unique):**
```json
{
  "animalId": "uuid",
  "medicineStockId": "uuid",
  "doseGiven": 15,
  "doseUnit": "ml",
  "treatmentDate": "2024-12-13",
  "treatmentTime": "09:30",
  "reason": "Mammite"
}
```

**Body (lot entier):**
```json
{
  "lotId": "uuid",
  "animalsCount": 12,
  "medicineStockId": "uuid",
  "doseGiven": 24,
  "doseUnit": "ml",
  "treatmentDate": "2024-12-13",
  "reason": "Traitement préventif parasites"
}
```

**Note:** `withdrawalEndMeat` et `withdrawalEndMilk` sont calculés automatiquement par le backend.

---

## 5. Import ANMV

### 5.1 Source des données

**Base ANMV (ANSES):**
- URL: https://www.data.gouv.fr/fr/datasets/base-de-donnees-publique-des-medicaments-veterinaires-autorises-en-france/
- Format: XML ou Excel
- Mise à jour: Hebdomadaire

### 5.2 Structure ANMV

```typescript
interface AnmvProduct {
  // Identifiants
  codeAmm: string;           // Code AMM unique
  gtin?: string;             // Code-barres EAN-13

  // Informations produit
  denomination: string;      // Nom du médicament
  titulaire: string;         // Laboratoire

  // Composition
  substancesActives: string[];

  // Classification
  formePharmaceutique: string;
  voieAdministration: string;
  especesCibles: string[];

  // Délais
  tempsAttenteViande?: number;
  tempsAttenteLait?: number;

  // Conditionnements (présentations)
  presentations: {
    code: string;
    libelle: string;        // Ex: "Flacon de 100 ml"
    gtin?: string;
  }[];

  // Statut
  dateAmm: string;
  statutAmm: string;        // "Valide", "Suspendu", etc.
}
```

### 5.3 Logique d'import

```typescript
// src/lib/services/anmv-import.ts

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

async function importAnmvProducts(): Promise<ImportResult> {
  const result: ImportResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };

  // 1. Télécharger le fichier ANMV
  const anmvData = await downloadAnmvFile();

  // 2. Parser les données
  const products = parseAnmvData(anmvData);

  // 3. Pour chaque produit
  for (const anmvProduct of products) {
    try {
      // Vérifier si le produit existe déjà
      const existing = await findProductByAnmvCode(anmvProduct.codeAmm);

      if (existing) {
        // Mise à jour si changement
        if (hasChanges(existing, anmvProduct)) {
          await updateProduct(existing.id, mapAnmvToProduct(anmvProduct));
          result.updated++;
        } else {
          result.skipped++;
        }
      } else {
        // Création
        await createProduct(mapAnmvToProduct(anmvProduct));
        result.created++;
      }
    } catch (error) {
      result.errors.push(`${anmvProduct.codeAmm}: ${error.message}`);
    }
  }

  return result;
}

function mapAnmvToProduct(anmv: AnmvProduct): CreateProductDto {
  return {
    scope: 'global',
    anmvCode: anmv.codeAmm,
    gtin: anmv.presentations[0]?.gtin,
    name: anmv.denomination,
    laboratory: anmv.titulaire,
    composition: anmv.substancesActives.join(', '),
    administrationRoute: mapVoieAdministration(anmv.voieAdministration),
    targetSpecies: anmv.especesCibles.map(mapEspece),
    withdrawalMeat: anmv.tempsAttenteViande,
    withdrawalMilk: anmv.tempsAttenteLait,
    prescriptionRequired: true, // Par défaut pour médicaments vétérinaires
    isActive: anmv.statutAmm === 'Valide'
  };
}
```

### 5.4 Cron Job

```typescript
// Exécution hebdomadaire (dimanche 3h00)
// 0 3 * * 0

import { importAnmvProducts } from '@/lib/services/anmv-import';

export async function runAnmvImport() {
  console.log('Starting ANMV import...');

  try {
    const result = await importAnmvProducts();

    console.log('ANMV Import completed:', result);

    // Notification admin si erreurs
    if (result.errors.length > 0) {
      await notifyAdmin('ANMV Import Errors', result.errors);
    }
  } catch (error) {
    console.error('ANMV Import failed:', error);
    await notifyAdmin('ANMV Import Failed', [error.message]);
  }
}
```

---

## 6. Validation et Règles Métier

### 6.1 Validation Product

```typescript
const productSchema = z.object({
  scope: z.enum(['global', 'local']),
  farmId: z.string().uuid().optional(),
  name: z.string().min(2).max(255),
  commercialName: z.string().max(255).optional(),
  laboratory: z.string().max(255).optional(),
  composition: z.string().optional(),
  dosageInfo: z.string().optional(),
  dosagePerKg: z.number().positive().optional(),
  dosageUnit: z.string().max(20).optional(),
  withdrawalMeat: z.number().int().min(0).max(365).optional(),
  withdrawalMilk: z.number().int().min(0).max(365).optional(),
  packagingSize: z.number().positive().optional(),
  packagingUnit: z.string().max(20).optional(),
  category: z.enum([...PRODUCT_CATEGORIES]).optional(),
  administrationRoute: z.enum([...ADMINISTRATION_ROUTES]).optional(),
  targetSpecies: z.array(z.string()).optional(),
  prescriptionRequired: z.boolean().default(false),
  isActive: z.boolean().default(true)
}).refine(
  data => (data.scope === 'global' && !data.farmId) ||
          (data.scope === 'local' && data.farmId),
  { message: 'farmId required for local scope, forbidden for global' }
);
```

### 6.2 Validation Stock

```typescript
const stockSchema = z.object({
  productId: z.string().uuid(),
  batchNumber: z.string().min(1).max(100),
  expiryDate: z.string().refine(
    date => new Date(date) > new Date(),
    { message: 'Expiry date must be in the future' }
  ),
  initialQuantity: z.number().positive(),
  stockUnit: z.string().min(1).max(20),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().min(0).optional(),
  supplier: z.string().max(255).optional()
});
```

### 6.3 Validation Treatment

```typescript
const treatmentSchema = z.object({
  animalId: z.string().uuid().optional(),
  lotId: z.string().uuid().optional(),
  animalsCount: z.number().int().positive().optional(),
  medicineStockId: z.string().uuid(),
  doseGiven: z.number().positive(),
  doseUnit: z.string().min(1).max(20),
  treatmentDate: z.string(),
  treatmentTime: z.string().optional(),
  reason: z.string().max(500).optional(),
  notes: z.string().optional(),
  prescriptionNumber: z.string().max(100).optional(),
  veterinarianName: z.string().max(255).optional(),
  veterinarianId: z.string().uuid().optional()
}).refine(
  data => (data.animalId && !data.lotId) || (!data.animalId && data.lotId),
  { message: 'Either animalId or lotId must be provided, but not both' }
).refine(
  data => !data.lotId || (data.lotId && data.animalsCount && data.animalsCount > 0),
  { message: 'animalsCount required when treating a lot' }
);
```

### 6.4 Règles métier

1. **Stock insuffisant**: Bloquer traitement si `dose > currentStock`
2. **Produit périmé**: Avertissement si stock expiré, bloquer traitement
3. **Délai d'attente actif**: Alerter si animal vendu/abattu pendant délai
4. **Prescription obligatoire**: Champs prescription requis si `prescriptionRequired = true`

---

## 7. Migration

### 7.1 Script de migration

```sql
-- Migration: Simplification module pharmacie
-- Version: 001
-- Date: 2024-12-13

BEGIN;

-- 1. Créer nouvelles tables (voir section 2)
-- [Inclure CREATE TABLE statements]

-- 2. Migrer les données existantes
INSERT INTO products (
  id, scope, name, commercial_name, laboratory,
  category, is_active, created_at, updated_at
)
SELECT
  id,
  'global' as scope,
  commercial_name as name,
  commercial_name,
  laboratory_name as laboratory,
  NULL as category,
  is_active,
  created_at,
  updated_at
FROM old_products
WHERE is_active = true;

-- 3. Supprimer anciennes tables
DROP TABLE IF EXISTS product_active_substances;
DROP TABLE IF EXISTS product_therapeutic_indications;
DROP TABLE IF EXISTS active_substances;
DROP TABLE IF EXISTS administration_routes;
DROP TABLE IF EXISTS product_categories;
DROP TABLE IF EXISTS product_packagings;
DROP TABLE IF EXISTS therapeutic_indications;
DROP TABLE IF EXISTS old_products;

COMMIT;
```

### 7.2 Rollback

```sql
-- Rollback script available in migrations/rollback/001_pharmacy_simplification.sql
```

---

## 8. Tests

### 8.1 Tests unitaires

```typescript
// __tests__/pharmacy/product.test.ts

describe('Product Service', () => {
  describe('createProduct', () => {
    it('should create a local product with farmId', async () => {
      const dto: CreateProductDto = {
        scope: 'local',
        name: 'Mon produit',
        category: 'antiparasitic'
      };

      const result = await productService.create(dto, farmId);

      expect(result.scope).toBe('local');
      expect(result.farmId).toBe(farmId);
    });

    it('should reject global product creation by user', async () => {
      const dto: CreateProductDto = {
        scope: 'global',
        name: 'Produit global'
      };

      await expect(productService.create(dto, farmId))
        .rejects.toThrow('Only admins can create global products');
    });
  });
});

describe('Treatment Service', () => {
  describe('createTreatment', () => {
    it('should calculate withdrawal dates automatically', async () => {
      const dto: CreateTreatmentDto = {
        animalId: 'animal-uuid',
        medicineStockId: 'stock-uuid',
        doseGiven: 15,
        doseUnit: 'ml',
        treatmentDate: '2024-12-13'
      };

      const result = await treatmentService.create(dto, farmId);

      expect(result.withdrawalEndMeat).toBe('2025-01-10'); // +28 days
      expect(result.withdrawalEndMilk).toBe('2024-12-17'); // +4 days
    });

    it('should decrement stock after treatment', async () => {
      const stockBefore = await stockService.get('stock-uuid');
      expect(stockBefore.currentStock).toBe(500);

      await treatmentService.create({
        animalId: 'animal-uuid',
        medicineStockId: 'stock-uuid',
        doseGiven: 15,
        doseUnit: 'ml'
      }, farmId);

      const stockAfter = await stockService.get('stock-uuid');
      expect(stockAfter.currentStock).toBe(485);
    });
  });
});
```

---

## 9. Sécurité

### 9.1 Autorisations

| Action | Rôle requis |
|--------|-------------|
| Voir produits globaux | Tous utilisateurs |
| Créer produit global | Admin système |
| Créer produit local | Membre ferme |
| Modifier produit local | Membre ferme (propriétaire) |
| Supprimer produit local | Membre ferme (propriétaire) |
| Gérer stock | Membre ferme |
| Créer traitement | Membre ferme |

### 9.2 Validation farmId

```typescript
// Middleware: vérifier appartenance à la ferme
async function validateFarmAccess(req, res, next) {
  const { farmId } = req.params;
  const userId = req.user.id;

  const isMember = await farmService.isMember(farmId, userId);

  if (!isMember) {
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
}
```

---

## 10. Performance

### 10.1 Index recommandés

Voir section 2 pour les index créés sur chaque table.

### 10.2 Pagination

Toutes les listes utilisent la pagination avec:
- `page`: numéro de page (défaut: 1)
- `limit`: éléments par page (défaut: 20, max: 100)

### 10.3 Cache

- Catalogue produits globaux: Cache Redis 1h
- Stats pharmacie: Cache Redis 5min

---

## 11. Questions ouvertes

1. **Historique modifications**: Faut-il auditer toutes les modifications de stock ?
2. **Multi-ferme**: Un produit local peut-il être partagé entre fermes du même groupe ?
3. **Prescription numérique**: Intégration future avec système ordonnance électronique ?
4. **Alertes push**: Notifications mobile pour stocks bas et péremptions ?
