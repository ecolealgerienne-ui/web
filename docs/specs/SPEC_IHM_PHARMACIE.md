# Spécification IHM - Module Pharmacie Simplifié

**Version:** 1.1
**Date:** 2025-12-13
**Statut:** Draft

---

## 1. Contexte et Objectifs

### 1.1 Problématique actuelle
Le système actuel de gestion des médicaments est trop complexe avec 8+ tables de référentiels admin :
- Substances actives
- Voies d'administration
- Catégories de produits
- Conditionnements
- Indications thérapeutiques
- Unités

Cette complexité rend la maintenance difficile et n'apporte pas de valeur ajoutée pour les petites/moyennes fermes (<200 têtes).

### 1.2 Structures existantes à conserver

| Table/Entité | Rôle | Statut |
|--------------|------|--------|
| `Product` | Référentiel produits (global) | ✅ GARDER - simplifier |
| `FarmProductPreference` | Produits sélectionnés par ferme + config custom | ✅ GARDER - adapter |
| `FarmerProductLot` | Lots/Batches (stock réel) | ✅ GARDER |
| `Treatment` | Traitements administrés | ✅ GARDER (déjà complet) |

### 1.3 Benchmark concurrence
| Application | Approche |
|------------|----------|
| Herdwatch | "Remedy Cabinet" - Simple liste d'achats avec scan code-barres |
| Troup'O | Saisie libre avec suggestions, pas de référentiel complexe |
| BAOBA | Base ANMV optionnelle, saisie manuelle prioritaire |

---

## 2. Pages à Supprimer (Admin)

### 2.1 Liste des pages admin à supprimer

Ces pages gèrent des référentiels trop granulaires qui ne sont pas utilisés directement par les fermiers.

| Page | Chemin | Raison |
|------|--------|--------|
| Substances actives | `/admin/active-substances` | Référentiel inutile - info dans ANMV |
| Voies d'administration | `/admin/administration-routes` | Trop granulaire - champ texte suffit |
| Catégories produits | `/admin/product-categories` | Simplifier en enum |
| Conditionnements | `/admin/product-packagings` | Intégrer dans table Product |
| Indications thérapeutiques | `/admin/therapeutic-indications` | Non utilisé par fermiers |

### 2.2 Fichiers à supprimer

```
src/app/(app)/admin/
├── active-substances/
│   └── page.tsx                    ❌ SUPPRIMER
├── administration-routes/
│   └── page.tsx                    ❌ SUPPRIMER
├── product-categories/
│   └── page.tsx                    ❌ SUPPRIMER
├── product-packagings/
│   └── page.tsx                    ❌ SUPPRIMER
└── therapeutic-indications/
    └── page.tsx                    ❌ SUPPRIMER

src/components/admin/
├── active-substances/              ❌ SUPPRIMER dossier
├── administration-routes/          ❌ SUPPRIMER dossier
├── product-categories/             ❌ SUPPRIMER dossier
├── product-packagings/             ❌ SUPPRIMER dossier
└── therapeutic-indications/        ❌ SUPPRIMER dossier

src/lib/types/admin/
├── active-substance.ts             ❌ SUPPRIMER
├── administration-route.ts         ❌ SUPPRIMER
├── product-category.ts             ❌ SUPPRIMER
├── product-packaging.ts            ❌ SUPPRIMER
└── therapeutic-indication.ts       ❌ SUPPRIMER

src/lib/services/admin/
├── active-substances.ts            ❌ SUPPRIMER
├── administration-routes.ts        ❌ SUPPRIMER
├── product-categories.ts           ❌ SUPPRIMER
├── product-packagings.ts           ❌ SUPPRIMER
└── therapeutic-indications.ts      ❌ SUPPRIMER
```

### 2.3 Page Products (Admin) - À ADAPTER

La page `/admin/products` doit être **simplifiée** (pas supprimée) pour :
- Permettre l'import ANMV
- Afficher les produits globaux
- Simplifier le formulaire (moins de champs)

---

## 3. Pages Existantes à Conserver

### 3.1 Page Traitements (`/treatments`)

✅ **GARDER TELLE QUELLE** - Déjà fonctionnelle avec :
- Liste des traitements avec filtres
- CRUD complet
- Lien avec animaux et lots
- Délais d'attente calculés
- Support vaccination

### 3.2 Types existants (treatment.ts)

La structure `Treatment` existante supporte déjà :
```typescript
interface Treatment {
  // Animal ou Lot
  animalId: string;
  lotId?: string;
  farmerLotId?: string;  // Lien vers FarmerProductLot (stock)

  // Produit
  productId?: string;
  packagingId?: string;
  productName?: string;

  // Dosage
  quantityAdministered?: number;
  dose?: number;
  dosageUnit?: string;

  // Délais calculés
  computedWithdrawalMeatDate?: string;
  computedWithdrawalMilkDate?: string;

  // Vétérinaire
  veterinarianId?: string;
  veterinarianName?: string;
  // ...
}
```

---

## 4. Nouvelles Interfaces

### 4.1 Architecture des pages

```
src/app/(app)/
├── treatments/
│   └── page.tsx                    ✅ EXISTANT (garder)
├── pharmacy/                       ✅ NOUVEAU (ou adapter existant)
│   ├── page.tsx                    # Vue stock de la ferme
│   └── products/
│       └── page.tsx                # Sélection produits (catalogue)
└── admin/
    └── products/
        └── page.tsx                ✅ ADAPTER (simplifier)
```

### 4.2 Page: Stock Pharmacie (`/pharmacy`)

**But:** Afficher le stock réel de la ferme basé sur `FarmerProductLot`.

#### Maquette

```
┌─────────────────────────────────────────────────────────────────┐
│ 💊 Pharmacie                                   [+ Nouvel achat] │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │    12    │ │    3     │ │    2     │ │    847€  │            │
│ │ Produits │ │ Stock bas│ │ Périmés  │ │ Valeur   │            │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
├─────────────────────────────────────────────────────────────────┤
│ 🔍 [Rechercher...          ] [Statut ▼] [Catégorie ▼]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ AMOXIVAL 500mg - Virbac                              [Config ⚙️]│
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🟢 Lot ABC123                          Exp: 15/06/26        │ │
│ │    Acheté: 01/12/2024                                       │ │
│ │                                   [Traiter] [Voir détails]  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🟡 Lot DEF456                          Exp: 01/03/25        │ │
│ │    Acheté: 15/09/2024                  ⚠️ Expire bientôt    │ │
│ │                                   [Traiter] [Voir détails]  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ [+ Ajouter un lot]                                              │
│                                                                 │
│ IVOMEC Injectable - Merial                           [Config ⚙️]│
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🟢 Lot XYZ789                          Exp: 01/12/25        │ │
│ │    Acheté: 10/11/2024                                       │ │
│ │                                   [Traiter] [Voir détails]  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ [+ Ajouter un lot]                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Structure des données

Utilise les entités existantes :
- `FarmProductPreference` → Produit sélectionné par la ferme
- `FarmerProductLot` → Lots en stock

#### Composants

| Composant | Description |
|-----------|-------------|
| `PharmacyKPICards` | KPIs: nb produits, lots expirant, valeur |
| `ProductPreferenceCard` | Groupe les lots par produit |
| `FarmerLotCard` | Carte d'un lot avec statut |
| `LotStatusIndicator` | Indicateur expiration (vert/jaune/rouge) |
| `AddLotDialog` | Formulaire ajout lot (utilise API existante) |
| `ProductConfigDialog` | Config custom (dose, délais) |

#### Actions utilisateur

1. **Ajouter produit** : Sélectionner depuis catalogue → crée `FarmProductPreference`
2. **Ajouter lot** : Saisir lot pour un produit → crée `FarmerProductLot`
3. **Configurer** : Personnaliser dose/délais → update `FarmProductPreference`
4. **Traiter** : Ouvre dialog traitement pré-rempli → crée `Treatment`

---

### 4.3 Page: Sélection Produits (`/pharmacy/products`)

**But:** Permettre au fermier de sélectionner les produits qu'il utilise.

#### Maquette

```
┌─────────────────────────────────────────────────────────────────┐
│ Catalogue Produits                                              │
├─────────────────────────────────────────────────────────────────┤
│ 🔍 [Rechercher un produit...                    ] [Catégorie ▼] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Mes produits sélectionnés (5)                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☑️ AMOXIVAL 500mg Injectable                      [Retirer] │ │
│ │    Virbac • Antibiotique                                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☑️ IVOMEC Injectable                              [Retirer] │ │
│ │    Merial • Antiparasitaire                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ Catalogue complet                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☐ BORGAL 24%                                     [Ajouter]  │ │
│ │    Virbac • Antibiotique                                    │ │
│ │    Délai viande: 10j | Délai lait: 48h                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☐ METACAM 20mg/ml                                [Ajouter]  │ │
│ │    Boehringer • Anti-inflammatoire                          │ │
│ │    Délai viande: 15j | Délai lait: 5j                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Affichage 1-10 sur 156                    [< 1 2 3 4 5 ... >]  │
└─────────────────────────────────────────────────────────────────┘
```

#### Flux

1. Rechercher dans le catalogue global (`Product`)
2. Ajouter à "mes produits" → crée `FarmProductPreference`
3. Retirer → supprime `FarmProductPreference`

---

### 4.4 Dialog: Nouveau Lot

Utilise l'API existante : `POST /farms/:farmId/product-configs/:configId/lots`

```
┌─────────────────────────────────────────────────────────────────┐
│ Nouveau Lot - AMOXIVAL 500mg                              [X]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Surnom du lot *                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Lot Décembre 2024                                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ N° de lot officiel *                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ABC123-9A                                                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Date de péremption *                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📅 15/06/2026                                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│                                    [Annuler]  [✓ Enregistrer]  │
└─────────────────────────────────────────────────────────────────┘
```

**Note:** L'API existante `FarmerProductLot` ne gère pas la quantité/stock. Si nécessaire, ajouter ces champs.

---

### 4.5 Dialog: Configuration Produit

Utilise l'API existante : `PUT /farms/:farmId/product-preferences/:id/config`

```
┌─────────────────────────────────────────────────────────────────┐
│ Configuration - AMOXIVAL 500mg                            [X]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ℹ️ Ces valeurs remplacent les valeurs par défaut du produit    │
│                                                                 │
│ Dose personnalisée                                              │
│ ┌───────────────────┐             ┌───────────────────┐         │
│ │ 1.5               │             │ ml/kg         ▼   │         │
│ └───────────────────┘             └───────────────────┘         │
│ (Défaut: 1 ml/10kg)                                             │
│                                                                 │
│ Délai d'attente viande (jours)                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 28                                                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ (Défaut: 28 jours)                                              │
│                                                                 │
│ Délai d'attente lait (heures)                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 96                                                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ (Défaut: 96 heures)                                             │
│                                                                 │
│ [Réinitialiser aux valeurs par défaut]                          │
│                                                                 │
│                                    [Annuler]  [✓ Enregistrer]  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Navigation et Menu

### 5.1 Mise à jour du menu latéral

**Avant (menu admin complexe):**
```
Données de référence
├── Substances actives      ❌ SUPPRIMER
├── Voies d'administration  ❌ SUPPRIMER
├── Catégories produits     ❌ SUPPRIMER
├── Conditionnements        ❌ SUPPRIMER
├── Indications             ❌ SUPPRIMER
└── Produits                ⚠️ SIMPLIFIER
```

**Après (simplifié):**
```
Administration
└── Produits                ✅ /admin/products (simplifié)

Ferme
├── Traitements             ✅ /treatments (existant)
└── Pharmacie               ✅ /pharmacy (nouveau)
    └── Catalogue           ✅ /pharmacy/products
```

---

## 6. Flux Utilisateur

### 6.1 Flux: Configuration initiale pharmacie

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Pharmacie  │ ──► │ Catalogue   │ ──► │ Recherche   │
│  (vide)     │     │ produits    │     │ produit     │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                   ┌─────────────────────┐
                                   │ Ajouter à mes       │
                                   │ produits            │
                                   │ (FarmProductPref)   │
                                   └─────────────────────┘
                                               │
                                               ▼
                                   ┌─────────────────────┐
                                   │ Retour pharmacie    │
                                   │ Produit visible     │
                                   └─────────────────────┘
```

### 6.2 Flux: Ajout d'un lot

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Pharmacie  │ ──► │ + Ajouter   │ ──► │ Formulaire  │
│             │     │   lot       │     │ lot         │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                   ┌─────────────────────┐
                                   │ Saisie:             │
                                   │ - Surnom            │
                                   │ - N° lot officiel   │
                                   │ - Date péremption   │
                                   └─────────────────────┘
                                               │
                                               ▼
                                   ┌─────────────────────┐
                                   │ FarmerProductLot    │
                                   │ créé ✓              │
                                   └─────────────────────┘
```

### 6.3 Flux: Traitement depuis pharmacie

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Pharmacie  │ ──► │ [Traiter]   │ ──► │ Dialog      │
│  Lot ABC123 │     │ sur un lot  │     │ Traitement  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                   ┌─────────────────────┐
                                   │ Pré-rempli:         │
                                   │ - Produit           │
                                   │ - Lot (farmerLotId) │
                                   │ - Dose (si config)  │
                                   └─────────────────────┘
                                               │
                                               ▼
                                   ┌─────────────────────┐
                                   │ Saisie:             │
                                   │ - Animal(s)         │
                                   │ - Quantité          │
                                   │ - Date              │
                                   └─────────────────────┘
                                               │
                                               ▼
                                   ┌─────────────────────┐
                                   │ Treatment créé ✓    │
                                   │ (délais calculés)   │
                                   └─────────────────────┘
```

---

## 7. Évolutions futures suggérées

### 7.1 Ajouter gestion du stock quantitatif

L'entité `FarmerProductLot` actuelle ne gère pas :
- `initialQuantity` (quantité achetée)
- `currentStock` (stock restant)
- `stockUnit` (ml, comprimés, etc.)

**Option A:** Ajouter ces champs à `FarmerProductLot`
**Option B:** Créer une nouvelle entité `FarmMedicineStock`

### 7.2 Import ANMV automatique

- Import hebdomadaire de la base ANMV
- Produits avec `scope: 'global'`
- Code GTIN pour scan code-barres

### 7.3 Alertes stock

- Notification produits périmés
- Notification stock bas
- Dashboard avec KPIs pharmacie

---

## 8. Responsive Design

### 8.1 Mobile (< 640px)

- Cards en full-width
- Actions dans menu contextuel (...)
- Dialog en plein écran

### 8.2 Tablet (640px - 1024px)

- Grille 2 colonnes pour KPIs
- Cards produits en full-width

### 8.3 Desktop (> 1024px)

- Grille 4 colonnes pour KPIs
- Sidebar catalogue / détail

---

## 9. Priorité d'implémentation

| Phase | Fonctionnalité | Priorité |
|-------|----------------|----------|
| 1 | Suppression pages admin inutiles | Haute |
| 1 | Page Pharmacie (vue stock par produit) | Haute |
| 1 | Dialog ajout lot | Haute |
| 2 | Page catalogue produits | Haute |
| 2 | Dialog configuration produit | Moyenne |
| 3 | Simplification page admin/products | Moyenne |
| 3 | Lien "Traiter" → dialog traitement | Moyenne |
| 4 | KPIs et alertes | Basse |
| 4 | Gestion stock quantitatif | Basse |

---

## 10. Questions ouvertes

1. **Stock quantitatif** : Ajouter `currentStock` à `FarmerProductLot` ?
2. **Scan code-barres** : Priorité pour la V1 mobile ?
3. **Prix achat** : Tracker le coût des lots ?
