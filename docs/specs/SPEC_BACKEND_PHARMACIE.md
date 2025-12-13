# Spécification Backend - Module Pharmacie Simplifié

**Version:** 1.1
**Date:** 2025-12-13
**Statut:** Draft

---

## 1. Vue d'ensemble

### 1.1 Objectifs
- Simplifier le modèle de données en supprimant les tables de référentiels inutiles
- Conserver et adapter les structures existantes
- Ajouter la gestion du stock quantitatif (optionnel)

### 1.2 Structures existantes

| Entité | Table | Rôle | Statut |
|--------|-------|------|--------|
| `Product` | `products` | Référentiel produits (global) | ✅ GARDER - simplifier |
| `FarmProductPreference` | `farm_product_preferences` | Produits sélectionnés par ferme | ✅ GARDER |
| `FarmerProductLot` | `farmer_product_lots` | Lots/Batches (stock) | ✅ GARDER - enrichir |
| `Treatment` | `treatments` | Traitements administrés | ✅ GARDER (complet) |

### 1.3 Architecture actuelle

```
┌─────────────────────────────────────────────────────────────────┐
│                        Base de données                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────────────┐    ┌─────────────┐  │
│  │   Product   │◄───│ FarmProductPreference│───►│    Farm     │  │
│  │  (global)   │    │  (ferme config)      │    │             │  │
│  └─────────────┘    └─────────────────────┘    └─────────────┘  │
│                              │                                  │
│                              ▼                                  │
│                    ┌─────────────────────┐                      │
│                    │  FarmerProductLot   │                      │
│                    │  (lots/batches)     │                      │
│                    └─────────────────────┘                      │
│                              │                                  │
│                              ▼                                  │
│                    ┌─────────────────────┐    ┌─────────────┐  │
│                    │     Treatment       │───►│   Animal    │  │
│                    │  (via farmerLotId)  │    │    /Lot     │  │
│                    └─────────────────────┘    └─────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Tables à Supprimer

### 2.1 Tables de référentiels à supprimer

```sql
-- Migration: Suppression des tables de référentiels inutiles

-- 1. Supprimer les tables de liaison
DROP TABLE IF EXISTS product_active_substances CASCADE;
DROP TABLE IF EXISTS product_therapeutic_indications CASCADE;

-- 2. Supprimer les tables de référentiels
DROP TABLE IF EXISTS active_substances CASCADE;
DROP TABLE IF EXISTS administration_routes CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS product_packagings CASCADE;
DROP TABLE IF EXISTS therapeutic_indications CASCADE;
```

### 2.2 Impact sur la table Products

Les colonnes faisant référence aux tables supprimées doivent être adaptées :

```sql
-- Colonnes à supprimer/adapter dans products
ALTER TABLE products DROP COLUMN IF EXISTS category_id;
ALTER TABLE products DROP COLUMN IF EXISTS administration_route_id;

-- Ajouter des colonnes simples à la place
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS administration_route VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS composition TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dosage_info TEXT;
```

---

## 3. Structures Existantes à Conserver

### 3.1 Table: Product (simplifiée)

La table `products` existe déjà. Voici les modifications suggérées :

```sql
-- Structure simplifiée de products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identifiants
    code VARCHAR(50) UNIQUE,           -- Code interne
    anmv_code VARCHAR(20),             -- Code AMM ANMV (nouveau)
    gtin VARCHAR(14),                  -- Code-barres EAN/GTIN (nouveau)

    -- Informations produit
    commercial_name VARCHAR(255) NOT NULL,
    laboratory_name VARCHAR(255),

    -- Composition et dosage (simplifié)
    therapeutic_form VARCHAR(100),     -- Ex: "Solution injectable"
    dosage VARCHAR(255),               -- Ex: "500mg/ml"
    composition TEXT,                  -- Ex: "Amoxicilline trihydratée 150mg/ml"
    dosage_info TEXT,                  -- Ex: "1ml pour 10kg de poids vif"

    -- Classification (simplifié - pas de FK)
    category VARCHAR(50),              -- enum: antibiotic, antiparasitic, etc.
    administration_route VARCHAR(50),  -- enum: injectable, oral, topical, etc.
    target_species TEXT[],             -- ['bovine', 'ovine', 'caprine']

    -- Délais d'attente par défaut
    withdrawal_meat_days INTEGER,      -- Délai viande en jours
    withdrawal_milk_hours INTEGER,     -- Délai lait en heures

    -- Réglementation
    prescription_required BOOLEAN DEFAULT true,

    -- Statut
    is_active BOOLEAN DEFAULT true,

    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_anmv_code ON products(anmv_code) WHERE anmv_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_gtin ON products(gtin) WHERE gtin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('french', commercial_name));
```

### 3.2 Table: FarmProductPreference (existante)

```sql
-- Structure existante - pas de modification majeure
CREATE TABLE IF NOT EXISTS farm_product_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,

    -- Ordre d'affichage
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    -- Configuration personnalisée (override AMM/RCP)
    packaging_id UUID REFERENCES product_packagings(id),  -- À supprimer si packagings supprimé
    user_defined_dose DECIMAL(10,4),
    user_defined_dose_unit VARCHAR(20),
    user_defined_meat_withdrawal INTEGER,   -- jours
    user_defined_milk_withdrawal INTEGER,   -- heures

    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Contraintes
    CONSTRAINT unique_farm_product UNIQUE (farm_id, product_id)
);
```

### 3.3 Table: FarmerProductLot (existante - à enrichir)

```sql
-- Structure existante avec ajouts suggérés pour gestion stock
CREATE TABLE IF NOT EXISTS farmer_product_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL REFERENCES farm_product_preferences(id) ON DELETE CASCADE,

    -- Identification lot
    nickname VARCHAR(100) NOT NULL,        -- Ex: "Lot Janvier 2025"
    official_lot_number VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,

    -- === NOUVEAUX CHAMPS SUGGÉRÉS POUR STOCK ===
    initial_quantity DECIMAL(10,2),        -- Quantité achetée
    current_stock DECIMAL(10,2),           -- Stock restant
    stock_unit VARCHAR(20),                -- ml, comprimés, sachets
    purchase_date DATE,                    -- Date d'achat
    purchase_price DECIMAL(10,2),          -- Prix en euros
    supplier VARCHAR(255),                 -- Fournisseur
    -- ============================================

    -- Statut
    is_active BOOLEAN DEFAULT true,

    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Contraintes
    CONSTRAINT unique_config_lot_number UNIQUE (config_id, official_lot_number)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_farmer_lots_config ON farmer_product_lots(config_id);
CREATE INDEX IF NOT EXISTS idx_farmer_lots_expiry ON farmer_product_lots(expiry_date);
CREATE INDEX IF NOT EXISTS idx_farmer_lots_active ON farmer_product_lots(is_active);
```

### 3.4 Table: Treatment (existante - complète)

La table `treatments` est déjà complète et supporte :

```sql
-- Colonnes pertinentes existantes dans treatments
CREATE TABLE IF NOT EXISTS treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id),

    -- Cible
    animal_id UUID REFERENCES animals(id),
    lot_id UUID REFERENCES lots(id),              -- Lot d'animaux
    farmer_lot_id UUID REFERENCES farmer_product_lots(id),  -- Lot produit (stock)

    -- Produit
    product_id UUID REFERENCES products(id),
    packaging_id UUID,
    product_name VARCHAR(255),                    -- Fallback si pas de product_id

    -- Dosage
    quantity_administered DECIMAL(10,2),
    quantity_unit_id UUID,
    dose DECIMAL(10,4),
    dosage VARCHAR(100),
    dosage_unit VARCHAR(20),

    -- Délais calculés
    withdrawal_end_date DATE,                     -- Délai générique
    computed_withdrawal_meat_date DATE,           -- Délai viande calculé
    computed_withdrawal_milk_date DATE,           -- Délai lait calculé

    -- Dates
    treatment_date DATE NOT NULL,
    next_due_date DATE,

    -- Vétérinaire
    veterinarian_id UUID REFERENCES veterinarians(id),
    veterinarian_name VARCHAR(255),

    -- Diagnostic
    diagnosis TEXT,
    target_disease VARCHAR(255),
    duration INTEGER,

    -- Vaccination
    type VARCHAR(20) CHECK (type IN ('treatment', 'vaccination')),
    vaccination_type VARCHAR(100),
    protocol_step INTEGER,
    campaign_id UUID,

    -- Statut et coût
    status VARCHAR(20) DEFAULT 'completed',
    cost DECIMAL(10,2),
    notes TEXT,

    -- Métadonnées
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

---

## 4. Types TypeScript

### 4.1 Product (simplifié)

```typescript
// src/lib/types/admin/product.ts (à simplifier)

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
  code?: string;
  anmvCode?: string;
  gtin?: string;

  commercialName: string;
  laboratoryName?: string;

  therapeuticForm?: string;
  dosage?: string;
  composition?: string;
  dosageInfo?: string;

  category?: ProductCategory;
  administrationRoute?: AdministrationRoute;
  targetSpecies?: string[];

  withdrawalMeatDays?: number;
  withdrawalMilkHours?: number;

  prescriptionRequired: boolean;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  category?: ProductCategory;
  administrationRoute?: AdministrationRoute;
  isActive?: boolean;
}
```

### 4.2 FarmProductPreference (existant)

```typescript
// src/lib/types/product-preference.ts (existant)

export interface ProductPreference {
  id: string;
  farmId: string;
  productId: string;
  displayOrder: number;
  isActive: boolean;

  // Config personnalisée
  packagingId?: string;
  userDefinedDose?: number;
  userDefinedDoseUnit?: string;
  userDefinedMeatWithdrawal?: number;   // jours
  userDefinedMilkWithdrawal?: number;   // heures

  createdAt: string;
  updatedAt: string;

  // Relations
  product: Product;
  farmerLots?: FarmerProductLot[];
}
```

### 4.3 FarmerProductLot (à enrichir)

```typescript
// src/lib/types/farmer-product-lot.ts (à créer/adapter)

export interface FarmerProductLot {
  id: string;
  configId: string;                    // FarmProductPreference ID

  // Identification
  nickname: string;
  officialLotNumber: string;
  expiryDate: string;

  // Stock (nouveaux champs suggérés)
  initialQuantity?: number;
  currentStock?: number;
  stockUnit?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  supplier?: string;

  // Statut
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  // Relations
  config?: ProductPreference;
  treatments?: Treatment[];
}

export interface CreateFarmerProductLotDto {
  nickname: string;
  officialLotNumber: string;
  expiryDate: string;
  isActive?: boolean;

  // Nouveaux champs optionnels
  initialQuantity?: number;
  stockUnit?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  supplier?: string;
}

export interface UpdateFarmerProductLotDto {
  nickname?: string;
  officialLotNumber?: string;
  expiryDate?: string;
  isActive?: boolean;
  currentStock?: number;    // Pour ajustements manuels
}
```

### 4.4 Treatment (existant - pas de modification)

Le type `Treatment` dans `src/lib/types/treatment.ts` est déjà complet.

---

## 5. API Endpoints

### 5.1 Endpoints existants à conserver

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/farms/:farmId/product-preferences` | Liste préférences ferme |
| POST | `/api/v1/farms/:farmId/product-preferences` | Ajouter produit |
| DELETE | `/api/v1/farms/:farmId/product-preferences/:id` | Retirer produit |
| PUT | `/api/v1/farms/:farmId/product-preferences/:id/config` | Config personnalisée |
| GET | `/api/v1/farms/:farmId/product-configs/:configId/lots` | Liste lots |
| POST | `/api/v1/farms/:farmId/product-configs/:configId/lots` | Créer lot |
| PUT | `/api/v1/farms/:farmId/product-configs/:configId/lots/:id` | Modifier lot |
| DELETE | `/api/v1/farms/:farmId/product-configs/:configId/lots/:id` | Supprimer lot |
| GET | `/api/v1/farms/:farmId/treatments` | Liste traitements |
| POST | `/api/v1/farms/:farmId/treatments` | Créer traitement |

### 5.2 Nouveaux endpoints suggérés

#### GET `/api/v1/farms/:farmId/pharmacy/stats`

Statistiques pharmacie de la ferme.

**Response:**
```json
{
  "totalProducts": 12,
  "totalActiveLots": 15,
  "expiringWithin30Days": 3,
  "expiredLots": 2,
  "totalValue": 847.50
}
```

#### GET `/api/v1/farms/:farmId/pharmacy/alerts`

Alertes pharmacie.

**Response:**
```json
{
  "alerts": [
    {
      "type": "expiring_soon",
      "lotId": "uuid",
      "productName": "AMOXIVAL 500mg",
      "expiryDate": "2025-01-15",
      "daysRemaining": 33
    },
    {
      "type": "expired",
      "lotId": "uuid",
      "productName": "IVOMEC",
      "expiryDate": "2024-12-01"
    }
  ]
}
```

#### PUT `/api/v1/farms/:farmId/product-configs/:configId/lots/:id/adjust-stock`

Ajuster le stock d'un lot (si gestion quantitative implémentée).

**Request:**
```json
{
  "adjustment": -50,
  "reason": "Perte - flacon cassé"
}
```

---

## 6. Logique Métier

### 6.1 Calcul des délais d'attente (existant)

Le backend calcule déjà les délais dans `treatments` :

```typescript
// Pseudo-code existant
function calculateWithdrawalDates(treatment: CreateTreatmentDto) {
  const preference = await getFarmProductPreference(treatment.farmerId, treatment.productId);
  const product = preference.product;

  // Priorité: userDefined > product default
  const meatDays = preference.userDefinedMeatWithdrawal ?? product.withdrawalMeatDays;
  const milkHours = preference.userDefinedMilkWithdrawal ?? product.withdrawalMilkHours;

  return {
    computedWithdrawalMeatDate: addDays(treatment.treatmentDate, meatDays),
    computedWithdrawalMilkDate: addHours(treatment.treatmentDate, milkHours)
  };
}
```

### 6.2 Décrément stock automatique (à implémenter)

Si la gestion quantitative est activée :

```typescript
// Trigger ou service lors de création traitement
async function decrementStockAfterTreatment(treatment: Treatment) {
  if (!treatment.farmerLotId || !treatment.quantityAdministered) return;

  const lot = await getFarmerProductLot(treatment.farmerLotId);

  if (lot.currentStock !== null) {
    lot.currentStock -= treatment.quantityAdministered;

    if (lot.currentStock < 0) {
      throw new Error('Stock insuffisant');
    }

    await updateFarmerProductLot(lot.id, { currentStock: lot.currentStock });
  }
}
```

### 6.3 Alertes péremption (cron job)

```typescript
// Exécution quotidienne à 6h00
async function checkExpiringLots() {
  const today = new Date();
  const in30Days = addDays(today, 30);

  // Lots qui expirent dans les 30 jours
  const expiringLots = await FarmerProductLot.findAll({
    where: {
      expiryDate: { [Op.between]: [today, in30Days] },
      isActive: true
    },
    include: [{ model: FarmProductPreference, include: [Product, Farm] }]
  });

  // Envoyer notifications
  for (const lot of expiringLots) {
    await sendNotification(lot.config.farm.ownerId, {
      type: 'lot_expiring_soon',
      lotId: lot.id,
      productName: lot.config.product.commercialName,
      expiryDate: lot.expiryDate,
      daysRemaining: differenceInDays(lot.expiryDate, today)
    });
  }
}
```

---

## 7. Import ANMV (optionnel)

### 7.1 Source des données

**Base ANMV (ANSES):**
- URL: https://www.data.gouv.fr/fr/datasets/base-de-donnees-publique-des-medicaments-veterinaires-autorises-en-france/
- Format: XML ou Excel
- Mise à jour: Hebdomadaire

### 7.2 Mapping ANMV → Product

```typescript
interface AnmvProduct {
  codeAmm: string;
  denomination: string;
  titulaire: string;
  formePharmaceutique: string;
  voieAdministration: string;
  especesCibles: string[];
  tempsAttenteViande?: number;
  tempsAttenteLait?: number;
  presentations: {
    gtin?: string;
    libelle: string;
  }[];
}

function mapAnmvToProduct(anmv: AnmvProduct): Partial<Product> {
  return {
    anmvCode: anmv.codeAmm,
    gtin: anmv.presentations[0]?.gtin,
    commercialName: anmv.denomination,
    laboratoryName: anmv.titulaire,
    therapeuticForm: anmv.formePharmaceutique,
    administrationRoute: mapVoieAdministration(anmv.voieAdministration),
    targetSpecies: anmv.especesCibles.map(mapEspece),
    withdrawalMeatDays: anmv.tempsAttenteViande,
    withdrawalMilkHours: anmv.tempsAttenteLait ? anmv.tempsAttenteLait * 24 : null,
    prescriptionRequired: true,
    isActive: true
  };
}
```

### 7.3 Cron Job Import

```typescript
// Exécution hebdomadaire (dimanche 3h00)
async function importAnmvProducts() {
  const anmvData = await downloadAnmvFile();
  const products = parseAnmvData(anmvData);

  let created = 0, updated = 0, skipped = 0;

  for (const anmvProduct of products) {
    const existing = await Product.findOne({
      where: { anmvCode: anmvProduct.codeAmm }
    });

    if (existing) {
      if (hasChanges(existing, anmvProduct)) {
        await existing.update(mapAnmvToProduct(anmvProduct));
        updated++;
      } else {
        skipped++;
      }
    } else {
      await Product.create(mapAnmvToProduct(anmvProduct));
      created++;
    }
  }

  console.log(`ANMV Import: ${created} created, ${updated} updated, ${skipped} skipped`);
}
```

---

## 8. Migration

### 8.1 Script de migration

```sql
-- Migration: Simplification module pharmacie
-- Version: 001
-- Date: 2024-12-13

BEGIN;

-- 1. Sauvegarder les données des tables à supprimer (si nécessaire)
CREATE TABLE IF NOT EXISTS _backup_product_categories AS SELECT * FROM product_categories;
CREATE TABLE IF NOT EXISTS _backup_administration_routes AS SELECT * FROM administration_routes;

-- 2. Ajouter les nouvelles colonnes à products
ALTER TABLE products ADD COLUMN IF NOT EXISTS anmv_code VARCHAR(20);
ALTER TABLE products ADD COLUMN IF NOT EXISTS gtin VARCHAR(14);
ALTER TABLE products ADD COLUMN IF NOT EXISTS composition TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dosage_info TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS administration_route VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS target_species TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS withdrawal_meat_days INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS withdrawal_milk_hours INTEGER;

-- 3. Migrer les données des FK vers les nouveaux champs
UPDATE products p
SET category = (SELECT code FROM product_categories WHERE id = p.category_id)
WHERE p.category_id IS NOT NULL;

UPDATE products p
SET administration_route = (SELECT code FROM administration_routes WHERE id = p.administration_route_id)
WHERE p.administration_route_id IS NOT NULL;

-- 4. Supprimer les anciennes colonnes FK
ALTER TABLE products DROP COLUMN IF EXISTS category_id;
ALTER TABLE products DROP COLUMN IF EXISTS administration_route_id;

-- 5. Ajouter les champs stock à farmer_product_lots
ALTER TABLE farmer_product_lots ADD COLUMN IF NOT EXISTS initial_quantity DECIMAL(10,2);
ALTER TABLE farmer_product_lots ADD COLUMN IF NOT EXISTS current_stock DECIMAL(10,2);
ALTER TABLE farmer_product_lots ADD COLUMN IF NOT EXISTS stock_unit VARCHAR(20);
ALTER TABLE farmer_product_lots ADD COLUMN IF NOT EXISTS purchase_date DATE;
ALTER TABLE farmer_product_lots ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2);
ALTER TABLE farmer_product_lots ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);

-- 6. Supprimer les tables de référentiels
-- Note: Exécuter APRÈS vérification que la migration des données est OK
-- DROP TABLE IF EXISTS product_active_substances CASCADE;
-- DROP TABLE IF EXISTS product_therapeutic_indications CASCADE;
-- DROP TABLE IF EXISTS active_substances CASCADE;
-- DROP TABLE IF EXISTS administration_routes CASCADE;
-- DROP TABLE IF EXISTS product_categories CASCADE;
-- DROP TABLE IF EXISTS product_packagings CASCADE;
-- DROP TABLE IF EXISTS therapeutic_indications CASCADE;

COMMIT;
```

### 8.2 Rollback

```sql
-- Rollback: Restaurer les tables supprimées
-- Note: Utiliser les tables _backup_* créées pendant la migration
```

---

## 9. Tests

### 9.1 Tests unitaires

```typescript
describe('Pharmacy Module', () => {
  describe('FarmProductPreference', () => {
    it('should create preference with product', async () => {
      const preference = await productPreferencesService.create(farmId, {
        productId: testProduct.id
      });

      expect(preference.productId).toBe(testProduct.id);
      expect(preference.farmId).toBe(farmId);
    });
  });

  describe('FarmerProductLot', () => {
    it('should create lot for preference', async () => {
      const lot = await farmerLotsService.create(preference.id, {
        nickname: 'Lot Test',
        officialLotNumber: 'ABC123',
        expiryDate: '2026-06-15'
      });

      expect(lot.configId).toBe(preference.id);
      expect(lot.isActive).toBe(true);
    });

    it('should flag lot as expired', async () => {
      const expiredLot = await farmerLotsService.create(preference.id, {
        nickname: 'Lot Expiré',
        officialLotNumber: 'OLD001',
        expiryDate: '2024-01-01'  // Date passée
      });

      // Le système devrait flaguer ce lot
      expect(expiredLot.isActive).toBe(true);  // Toujours actif mais alerté
    });
  });

  describe('Treatment with FarmerLot', () => {
    it('should link treatment to farmer lot', async () => {
      const treatment = await treatmentsService.create({
        animalId: testAnimal.id,
        productId: testProduct.id,
        farmerLotId: testLot.id,
        treatmentDate: '2024-12-13',
        quantityAdministered: 15,
        dosageUnit: 'ml'
      });

      expect(treatment.farmerLotId).toBe(testLot.id);
      expect(treatment.computedWithdrawalMeatDate).toBeDefined();
    });
  });
});
```

---

## 10. Sécurité

### 10.1 Autorisations

| Action | Rôle requis |
|--------|-------------|
| Voir produits (catalogue) | Tous utilisateurs authentifiés |
| Créer/modifier produit | Admin système |
| Voir préférences ferme | Membre ferme |
| Gérer préférences ferme | Membre ferme |
| Gérer lots | Membre ferme |
| Créer traitement | Membre ferme |

### 10.2 Validation

```typescript
// Validation FarmProductPreference
const createPreferenceSchema = z.object({
  productId: z.string().uuid()
});

// Validation FarmerProductLot
const createLotSchema = z.object({
  nickname: z.string().min(1).max(100),
  officialLotNumber: z.string().min(1).max(50),
  expiryDate: z.string().refine(
    date => new Date(date) > new Date(),
    { message: 'La date de péremption doit être dans le futur' }
  ),
  isActive: z.boolean().optional(),
  initialQuantity: z.number().positive().optional(),
  stockUnit: z.string().max(20).optional(),
  purchasePrice: z.number().min(0).optional()
});
```

---

## 11. Priorité d'implémentation

| Phase | Tâche | Priorité |
|-------|-------|----------|
| 1 | Migration: ajouter colonnes simplifiées à products | Haute |
| 1 | Supprimer les tables de référentiels inutiles | Haute |
| 2 | Ajouter champs stock à farmer_product_lots | Moyenne |
| 2 | Endpoint stats pharmacie | Moyenne |
| 3 | Import ANMV automatique | Basse |
| 3 | Alertes péremption (cron) | Basse |

---

## 12. Questions ouvertes

1. **Gestion stock** : Implémenter maintenant ou V2 ?
2. **Décrément automatique** : À la création du traitement ou manuel ?
3. **Import ANMV** : Fréquence et mode (automatique/manuel) ?
4. **Historique ajustements** : Table d'audit pour les modifications de stock ?
