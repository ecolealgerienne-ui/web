# Admin Reference Data - UI Specifications

**Date:** 2025-11-30
**Version:** 1.0
**API Base URL:** `http://localhost:3000/api/v1`
**Documentation:** `/api/docs` (Swagger)

---

## 📋 Table des Matières

- [A. Vue d'ensemble](#a-vue-densemble)
- [B. Patterns de Composants Réutilisables](#b-patterns-de-composants-réutilisables)
- [C. Spécifications Détaillées par Entité](#c-spécifications-détaillées-par-entité)
- [D. Wireframes](#d-wireframes)
- [E. User Flows](#e-user-flows)
- [F. Mapping i18n](#f-mapping-i18n)
- [G. Checklist Développement Frontend](#g-checklist-développement-frontend)

---

## A. Vue d'ensemble

### Architecture Globale

L'interface d'administration des données de référence est composée de **16 sections** correspondant aux 16 entités migrées au standard 33 points.

**Menu de Navigation:**
```
📋 Administration
  ├─ 🧪 Substances Actives (Active-Substances)
  ├─ 💊 Catégories de Produits (Product-Categories)
  ├─ 📏 Unités de Mesure (Units)
  ├─ 💉 Voies d'Administration (Administration-Routes)
  ├─ 🐾 Espèces (Species)
  ├─ 🐕 Races (Breeds)
  ├─ 📅 Catégories d'Âge (Age-Categories)
  ├─ 🌍 Pays (Countries)
  ├─ 🔗 Races-Pays (Breed-Countries)
  ├─ 💊 Produits (Products)
  ├─ 📦 Conditionnements (Product-Packagings)
  ├─ 💉 Indications Thérapeutiques (Therapeutic-Indications)
  ├─ 👨‍⚕️ Vétérinaires (Veterinarians)
  ├─ 📢 Campagnes Nationales (National-Campaigns)
  ├─ 🔗 Campagnes-Pays (Campaign-Countries)
  └─ 🔔 Modèles d'Alertes (Alert-Templates)
```

**Permissions:**
- ✅ Toutes les pages nécessitent `AdminGuard` (rôle ADMIN uniquement)
- ❌ Utilisateurs simples n'ont pas accès à ces pages

**Layout Commun:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo AniTra]  Admin   User: Jean Dupont [👤 ▼]  [🔔]     │
├─────────────────────────────────────────────────────────────┤
│ 📋 Admin > Substances Actives                               │
├──────────────┬──────────────────────────────────────────────┤
│  Navigation  │  Contenu Principal                           │
│              │                                              │
│  Dashboard   │  [Composant spécifique à la page]           │
│  Référentiels│                                              │
│    > SA      │                                              │
│    > Produits│                                              │
│  Élevages    │                                              │
│  Campagnes   │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

**Headers HTTP Requis:**
- `Authorization: Bearer {token}` (JWT en mode production)
- `X-Request-ID: {uuid}` (optionnel, pour traçage)

---

## B. Patterns de Composants Réutilisables

### Pattern 1: Simple Reference Data (10 entités)

**Entités concernées:**
- Active-Substances
- Product-Categories
- Units
- Administration-Routes
- Species
- Alert-Templates
- Countries (sans dépendances UI)
- Products
- Veterinarians
- National-Campaigns

**Caractéristiques:**
- ✅ CRUD complet (Create, Read, Update, Delete)
- ✅ Soft delete + Restore
- ✅ Versioning optimiste
- ✅ Dependency checks avant suppression
- ✅ Recherche full-text
- ✅ Pagination
- ✅ Filtres (Actif/Supprimé)

**Composants nécessaires:**

#### 1.1. Liste (DataTable)

**Props:**
```typescript
interface DataTableProps {
  entityName: string;           // 'active-substances'
  apiEndpoint: string;          // '/api/v1/active-substances'
  columns: ColumnDef[];         // Configuration des colonnes
  canCreate: boolean;           // Afficher bouton "Créer"
  canEdit: boolean;             // Afficher action "Modifier"
  canDelete: boolean;           // Afficher action "Supprimer"
  canRestore: boolean;          // Afficher action "Restaurer"
  searchPlaceholder: string;    // i18n key
  filters?: FilterDef[];        // Filtres additionnels
}

interface ColumnDef {
  key: string;                  // 'code', 'name', etc.
  label: string;                // i18n key
  sortable: boolean;
  render?: (value: any) => JSX.Element;
}
```

**API Call:**
```typescript
GET /api/v1/active-substances?page=1&limit=25&search=amox&includeDeleted=false&sortBy=code&sortOrder=asc
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-1",
      "code": "AMX",
      "name": "Amoxicilline",
      "description": "Antibiotique...",
      "deletedAt": null,
      "version": 1
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 25,
    "totalPages": 2
  }
}
```

**État UI:**
- `loading`: true/false
- `data`: Array d'entités
- `error`: Message d'erreur si échec
- `page`: Numéro de page actuel
- `search`: Terme de recherche
- `filters`: Filtres actifs

**Actions par ligne:**
```typescript
[
  { icon: '✏️', label: 'Modifier', action: onEdit, visible: !row.deletedAt },
  { icon: '🗑️', label: 'Supprimer', action: onDelete, visible: !row.deletedAt },
  { icon: '♻️', label: 'Restaurer', action: onRestore, visible: !!row.deletedAt }
]
```

#### 1.2. Formulaire de Création/Édition (EntityForm)

**Props:**
```typescript
interface EntityFormProps {
  mode: 'create' | 'edit';
  entityId?: string;            // En mode edit uniquement
  apiEndpoint: string;
  fields: FieldDef[];
  onSuccess: () => void;
  onCancel: () => void;
}

interface FieldDef {
  name: string;                 // 'code', 'name'
  type: 'text' | 'textarea' | 'select' | 'number' | 'date';
  label: string;                // i18n key
  required: boolean;
  validation?: ValidationRule[];
  placeholder?: string;
  maxLength?: number;
}
```

**Validation temps réel:**
```typescript
// Exemple pour Active-Substance
const validationRules = {
  code: [
    { type: 'required', message: 'activeSubstance.validation.code.required' },
    { type: 'maxLength', value: 50, message: 'activeSubstance.validation.code.maxLength' },
    { type: 'pattern', value: /^[A-Z0-9_-]+$/, message: 'activeSubstance.validation.code.pattern' },
    { type: 'unique', endpoint: '/api/v1/active-substances/check-code', message: 'activeSubstance.error.codeAlreadyExists' }
  ],
  name: [
    { type: 'required', message: 'activeSubstance.validation.name.required' },
    { type: 'maxLength', value: 200, message: 'activeSubstance.validation.name.maxLength' }
  ]
}
```

**API Calls:**
```typescript
// Création
POST /api/v1/active-substances
Body: { code: "AMX", name: "Amoxicilline", description: "..." }

// Édition
PATCH /api/v1/active-substances/{id}
Body: { name: "Amoxicilline (mise à jour)", version: 1 }
```

**Gestion des erreurs:**
```typescript
// 400 - Validation error
{
  "statusCode": 400,
  "message": ["Le code est requis", "Le nom est trop long"],
  "error": "Bad Request"
}

// 409 - Version conflict
{
  "statusCode": 409,
  "message": "Conflit de version : les données ont été modifiées par un autre utilisateur",
  "error": "Conflict"
}

// 409 - Unique constraint
{
  "statusCode": 409,
  "message": "Le code 'AMX' existe déjà",
  "error": "Conflict"
}
```

**Affichage UI des erreurs:**
- Erreurs de champ: Sous le champ concerné (rouge)
- Erreurs globales: Bannière en haut du formulaire
- Version conflict: Proposer de recharger et réessayer

#### 1.3. Modale de Suppression (DeleteConfirmModal)

**Props:**
```typescript
interface DeleteConfirmModalProps {
  entity: any;                  // L'entité à supprimer
  entityName: string;           // 'active-substance'
  displayField: string;         // 'name' (champ à afficher)
  apiEndpoint: string;
  checkDependencies: boolean;   // true = vérifier avant
  onSuccess: () => void;
  onCancel: () => void;
}
```

**Workflow:**
1. Modale s'ouvre
2. Si `checkDependencies=true`, appeler `DELETE` (dry-run) pour vérifier
3. API retourne 409 si dépendances existent
4. Afficher liste des dépendances
5. Désactiver bouton "Supprimer" si dépendances

**API Call:**
```typescript
DELETE /api/v1/active-substances/{id}
```

**Responses:**
```typescript
// 200 - Succès
{
  "id": "uuid-1",
  "code": "AMX",
  "name": "Amoxicilline",
  "deletedAt": "2025-11-30T10:30:00.000Z",
  "version": 2
}

// 409 - Dépendances existent
{
  "statusCode": 409,
  "message": "Impossible de supprimer : 12 indication(s) thérapeutique(s) dépendent de cette substance",
  "error": "Conflict",
  "dependencies": {
    "therapeuticIndications": 12
  }
}
```

**UI:**
```
┌─────────────────────────────────────────────────┐
│ ⚠️  Supprimer Substance Active            [✖]  │
├─────────────────────────────────────────────────┤
│                                                 │
│ Êtes-vous sûr de vouloir supprimer :           │
│                                                 │
│ 📦 Amoxicilline (AMX)                          │
│                                                 │
│ ⚠️ Cette substance est utilisée dans :         │
│ • 12 indication(s) thérapeutique(s)            │
│                                                 │
│ Vous devez d'abord supprimer ces dépendances.  │
│                                                 │
│              [Annuler]  [Supprimer] (disabled) │
└─────────────────────────────────────────────────┘
```

#### 1.4. Toast Notifications

**Types:**
```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  type: ToastType;
  message: string;              // i18n key
  duration?: number;            // ms (default: 3000)
}
```

**Messages standards:**
```typescript
// Succès
toast.success('activeSubstance.success.created');
toast.success('activeSubstance.success.updated');
toast.success('activeSubstance.success.deleted');
toast.success('activeSubstance.success.restored');

// Erreurs
toast.error('activeSubstance.error.notFound');
toast.error('activeSubstance.error.versionConflict');
toast.error('common.error.network');
```

---

### Pattern 2: Scoped Reference Data (3 entités)

**Entités concernées:**
- Breeds (scope: Species)
- Age-Categories (scope: Species)
- Product-Packagings (scope: Product)

**Différences avec Pattern 1:**
- ✅ Sélecteur de scope parent (dropdown)
- ✅ Liste filtrée par scope parent
- ✅ Breadcrumb contextuel
- ✅ Foreign key requise à la création

**Composant additionnel: ScopeSelector**

```typescript
interface ScopeSelectorProps {
  label: string;                // "Sélectionner une espèce"
  apiEndpoint: string;          // "/api/v1/species"
  value?: string;               // ID du scope sélectionné
  onChange: (scopeId: string) => void;
}
```

**Exemple UI (Breeds):**
```
┌─────────────────────────────────────────────────────────────┐
│ Admin > Espèces > Races                                     │
├─────────────────────────────────────────────────────────────┤
│ Espèce: [Chat (CAT)        ▼]               [+ Nouvelle]   │
├─────────────────────────────────────────────────────────────┤
│ Code │ Nom           │ Pays autorisés │ Statut │ Actions   │
├──────┼───────────────┼─────────────────┼────────┼───────────┤
│ PER  │ Persan        │ FR, DZ          │ ✅     │ ✏️ 🗑️    │
│ SIA  │ Siamois       │ FR              │ ✅     │ ✏️ 🗑️    │
└─────────────────────────────────────────────────────────────┘
```

**API Call avec scope:**
```typescript
GET /api/v1/breeds?speciesId=CAT&page=1&limit=25
```

**Formulaire de création avec scope:**
```typescript
// Le scope parent est pré-rempli et readonly
{
  speciesId: "CAT",  // ✅ Readonly, pré-rempli
  code: "",          // User input
  name: ""           // User input
}
```

---

### Pattern 3: Junction Tables (3 entités)

**Entités concernées:**
- Breed-Countries (Breed ↔ Country)
- Campaign-Countries (NationalCampaign ↔ Country)

**Caractéristiques spéciales:**
- ❌ Pas de champ `deletedAt`
- ✅ Champ `isActive` pour activer/désactiver les liens
- ✅ Opérations: Link, Unlink, Toggle Active
- ✅ Contrainte unique composite

**Composant spécial: JunctionMatrix**

```typescript
interface JunctionMatrixProps {
  leftEntity: string;           // 'breeds'
  rightEntity: string;          // 'countries'
  apiEndpoint: string;          // '/api/v1/breed-countries'
  leftApiEndpoint: string;      // '/api/v1/breeds'
  rightApiEndpoint: string;     // '/api/v1/countries'
}
```

**UI Matrice:**
```
┌─────────────────────────────────────────────────────────────┐
│ Admin > Races > Pays Autorisés                             │
├─────────────────────────────────────────────────────────────┤
│           │ FR      │ DZ      │ TN      │ MA      │        │
├───────────┼─────────┼─────────┼─────────┼─────────┼────────┤
│ Persan    │ ✅ Actif│ ✅ Actif│ ⬜ Inactif│ —       │        │
│ Siamois   │ ✅ Actif│ —       │ —       │ —       │        │
│ Maine Coon│ ✅ Actif│ ✅ Actif│ ✅ Actif│ ✅ Actif│        │
└─────────────────────────────────────────────────────────────┘

Légende:
✅ Actif  : Lien existe et isActive=true
⬜ Inactif: Lien existe et isActive=false
—        : Pas de lien
```

**Interactions:**
- Click sur `—` → Créer le lien (isActive=true)
- Click sur `✅` → Toggle à inactif (PATCH isActive=false)
- Click sur `⬜` → Toggle à actif (PATCH isActive=true)
- Clic droit → "Supprimer définitivement" (DELETE)

**API Calls:**
```typescript
// Créer un lien
POST /api/v1/breed-countries/link
Body: { breedId: "PER", countryCode: "TN" }

// Délier (supprimer)
POST /api/v1/breed-countries/unlink
Body: { breedId: "PER", countryCode: "TN" }

// Toggle isActive
PATCH /api/v1/breed-countries/{id}
Body: { isActive: false }

// Liste tous les liens
GET /api/v1/breed-countries?page=1&limit=100
```

**Alternative UI (Liste simple):**
```
┌─────────────────────────────────────────────────────────────┐
│ Race: [Persan ▼]                             [+ Lier Pays]  │
├─────────────────────────────────────────────────────────────┤
│ Pays  │ Code │ Statut  │ Date liaison    │ Actions         │
├───────┼──────┼─────────┼─────────────────┼─────────────────┤
│ France│ FR   │ ✅ Actif│ 2025-01-15      │ ⬜ 🗑️          │
│ Algérie│ DZ  │ ✅ Actif│ 2025-01-15      │ ⬜ 🗑️          │
│ Tunisie│ TN │ ⬜ Inactif│ 2025-02-10     │ ✅ 🗑️          │
└─────────────────────────────────────────────────────────────┘
```

---

## C. Spécifications Détaillées par Entité

### 1. Active-Substances (Substances Actives)

**Pattern:** Simple Reference Data
**URL:** `/admin/active-substances`
**Permission:** Admin uniquement

#### Liste

**Colonnes:**
| Colonne | Champ API | Sortable | Filtrable | Render |
|---------|-----------|----------|-----------|--------|
| Code | `code` | ✅ | ✅ | Text |
| Nom (DCI) | `name` | ✅ | ✅ | Text |
| Description | `description` | ❌ | ✅ | Truncate(50) |
| Statut | `deletedAt` | ✅ | ✅ | Badge (Actif/Supprimé) |
| Actions | - | ❌ | ❌ | ActionButtons |

**Filtres:**
```typescript
{
  search: '',                   // Recherche dans code, name, description
  includeDeleted: false,        // Toggle "Inclure supprimés"
  sortBy: 'code',              // code, name, createdAt
  sortOrder: 'asc'             // asc, desc
}
```

**API Endpoint:**
```
GET /api/v1/active-substances?page=1&limit=25&search=amox&includeDeleted=false&sortBy=code&sortOrder=asc
```

#### Formulaire

**Champs:**
```typescript
{
  code: {
    type: 'text',
    label: 'activeSubstance.fields.code',
    required: true,
    maxLength: 50,
    pattern: /^[A-Z0-9_-]+$/,
    placeholder: 'AMX',
    validation: [
      'required',
      'maxLength:50',
      'pattern',
      'unique:/api/v1/active-substances/check-code'
    ]
  },
  name: {
    type: 'text',
    label: 'activeSubstance.fields.name',
    required: true,
    maxLength: 200,
    placeholder: 'Amoxicilline'
  },
  nameFr: {
    type: 'text',
    label: 'activeSubstance.fields.nameFr',
    required: false,
    maxLength: 200,
    placeholder: 'Amoxicilline (français)'
  },
  nameEn: {
    type: 'text',
    label: 'activeSubstance.fields.nameEn',
    required: false,
    maxLength: 200,
    placeholder: 'Amoxicillin (english)'
  },
  nameAr: {
    type: 'text',
    label: 'activeSubstance.fields.nameAr',
    required: false,
    maxLength: 200,
    placeholder: 'أموكسيسيلين (عربي)',
    dir: 'rtl'
  },
  description: {
    type: 'textarea',
    label: 'activeSubstance.fields.description',
    required: false,
    maxLength: 1000,
    rows: 4
  },
  atcCode: {
    type: 'text',
    label: 'activeSubstance.fields.atcCode',
    required: false,
    maxLength: 20,
    placeholder: 'J01CA04'
  }
}
```

**API Endpoints:**
```
POST /api/v1/active-substances       # Création
PATCH /api/v1/active-substances/:id  # Édition
```

#### Suppression

**Dépendances vérifiées:**
- TherapeuticIndications (activeSubstanceId)

**API Endpoint:**
```
DELETE /api/v1/active-substances/:id
```

**Message d'erreur si dépendances:**
```
"Impossible de supprimer : 12 indication(s) thérapeutique(s) dépendent de cette substance"
```

**Affichage UI:**
```
┌─────────────────────────────────────────────────┐
│ ⚠️  Supprimer Substance Active            [✖]  │
├─────────────────────────────────────────────────┤
│ Êtes-vous sûr de vouloir supprimer :           │
│                                                 │
│ 📦 Amoxicilline (AMX)                          │
│                                                 │
│ ⚠️ Cette substance est utilisée dans :         │
│ • 12 indication(s) thérapeutique(s)            │
│   [Voir les indications →]                     │
│                                                 │
│ Vous devez d'abord supprimer ces dépendances.  │
│                                                 │
│              [Annuler]  [Supprimer] (disabled) │
└─────────────────────────────────────────────────┘
```

#### Restauration

**API Endpoint:**
```
POST /api/v1/active-substances/:id/restore
```

**Toast:**
```
"Substance active 'Amoxicilline' restaurée avec succès"
```

---

### 2. Product-Categories (Catégories de Produits)

**Pattern:** Simple Reference Data
**URL:** `/admin/product-categories`

Identique à Active-Substances avec ces différences:

**Colonnes:**
- Code
- Nom
- Description
- Statut
- Actions

**Dépendances:**
- Products (categoryId)

---

### 3. Units (Unités de Mesure)

**Pattern:** Simple Reference Data
**URL:** `/admin/units`

**Colonnes:**
- Code
- Nom
- Symbole (ex: "mg", "ml", "kg")
- Type (WEIGHT, VOLUME, CONCENTRATION)
- Statut
- Actions

**Dépendances:**
- ProductPackagings (concentrationUnitId, volumeUnitId)
- TherapeuticIndications (doseUnitId)

**Message d'erreur complexe:**
```
"Impossible de supprimer : utilisé dans 5 conditionnement(s) (concentration), 3 conditionnement(s) (volume), et 8 indication(s) thérapeutique(s)"
```

---

### 4. Breeds (Races)

**Pattern:** Scoped Reference Data (Scope: Species)
**URL:** `/admin/breeds`

**UI avec scope:**
```
┌─────────────────────────────────────────────────────────────┐
│ Admin > Espèces > Races                                     │
├─────────────────────────────────────────────────────────────┤
│ Espèce: [Chat (CAT) ▼]                      [+ Nouvelle]   │
├─────────────────────────────────────────────────────────────┤
│ Code │ Nom      │ Pays autorisés │ Statut │ Actions        │
├──────┼──────────┼─────────────────┼────────┼────────────────┤
│ PER  │ Persan   │ FR, DZ, TN      │ ✅     │ ✏️ 🗑️ 🌍      │
│ SIA  │ Siamois  │ FR              │ ✅     │ ✏️ 🗑️ 🌍      │
└─────────────────────────────────────────────────────────────┘
```

**Breadcrumb:**
```
Admin > Espèces > Chat > Races
```

**Action spéciale "🌍" (Gérer pays):**
- Ouvre la page Junction Table Breed-Countries
- Pré-filtrée sur la race sélectionnée

**API Endpoint:**
```
GET /api/v1/breeds?speciesId=CAT&page=1&limit=25
```

**Formulaire:**
```typescript
{
  speciesId: 'CAT',  // ✅ Readonly, pré-rempli depuis le scope selector
  code: '',          // User input (ex: PER)
  name: ''           // User input (ex: Persan)
}
```

**Dépendances:**
- Animals (breedId)
- BreedCountries (breedId)
- FarmBreedPreferences (breedId)

---

### 5. Breed-Countries (Races × Pays)

**Pattern:** Junction Table
**URL:** `/admin/breed-countries`

**Option 1: Vue Matrice**
```
┌─────────────────────────────────────────────────────────────┐
│ Admin > Races > Pays Autorisés                             │
├─────────────────────────────────────────────────────────────┤
│ Espèce: [Chat ▼]                                           │
├─────────────────────────────────────────────────────────────┤
│           │ FR      │ DZ      │ TN      │ MA      │ ...    │
├───────────┼─────────┼─────────┼─────────┼─────────┼────────┤
│ Persan    │ ✅ Actif│ ✅ Actif│ ⬜ Inactif│ —       │        │
│ Siamois   │ ✅ Actif│ —       │ —       │ —       │        │
│ Maine Coon│ ✅ Actif│ ✅ Actif│ ✅ Actif│ ✅ Actif│        │
└─────────────────────────────────────────────────────────────┘
```

**Option 2: Vue Liste (par race)**
```
┌─────────────────────────────────────────────────────────────┐
│ Race: [Persan ▼]                             [+ Lier Pays]  │
├─────────────────────────────────────────────────────────────┤
│ Pays    │ Code │ Statut    │ Date liaison │ Actions        │
├─────────┼──────┼───────────┼──────────────┼────────────────┤
│ France  │ FR   │ ✅ Actif  │ 2025-01-15   │ ⬜ 🗑️         │
│ Algérie │ DZ   │ ✅ Actif  │ 2025-01-15   │ ⬜ 🗑️         │
│ Tunisie │ TN   │ ⬜ Inactif│ 2025-02-10   │ ✅ 🗑️         │
└─────────────────────────────────────────────────────────────┘
```

**Actions:**
- ✅ → ⬜ : Désactiver le lien (PATCH isActive=false)
- ⬜ → ✅ : Activer le lien (PATCH isActive=true)
- 🗑️ : Supprimer définitivement le lien (DELETE)
- [+ Lier Pays] : Ouvrir modale de sélection multiple de pays

**Modale "Lier Pays":**
```
┌─────────────────────────────────────────────────┐
│ Lier des pays à la race "Persan"          [✖]  │
├─────────────────────────────────────────────────┤
│ 🔍 Rechercher un pays...                        │
│                                                 │
│ ☐ Maroc (MA)                                   │
│ ☐ Espagne (ES)                                 │
│ ☐ Italie (IT)                                  │
│ ☐ Allemagne (DE)                               │
│ ...                                             │
│                                                 │
│              [Annuler]  [Lier 0 pays] (disabled)│
└─────────────────────────────────────────────────┘
```

**API Endpoints:**
```
POST /api/v1/breed-countries/link
Body: { breedId: "PER", countryCode: "MA" }

POST /api/v1/breed-countries/unlink
Body: { breedId: "PER", countryCode: "TN" }

PATCH /api/v1/breed-countries/:id
Body: { isActive: false }

GET /api/v1/breed-countries?breedId=PER
GET /api/v1/breed-countries?countryCode=FR
GET /api/v1/breed-countries  # Toutes les associations
```

**Pas de dépendances** (junction tables n'ont généralement pas de dépendances sortantes)

---

### 6. Products (Produits Vétérinaires)

**Pattern:** Simple Reference Data
**URL:** `/admin/products`

**Colonnes:**
- Nom Commercial
- Catégorie
- Fabriquant
- AMM
- Statut
- Actions

**Champs du formulaire:**
```typescript
{
  commercialName: string;       // Required
  categoryId: string;           // Required, Select from Product-Categories
  manufacturer: string;
  marketingAuthNumber: string;  // AMM (Autorisation de Mise sur le Marché)
  composition: string;          // Textarea
  contraindications: string;    // Textarea
  warnings: string;             // Textarea
}
```

**Dépendances:**
- ProductPackagings (productId)
- Treatments (productId) - via packaging
- FarmProductPreferences (productId) - via packaging

**Note:** Produit complexe, peut avoir beaucoup de dépendances

---

### 7. Therapeutic-Indications (Indications Thérapeutiques)

**Pattern:** Simple Reference Data
**URL:** `/admin/therapeutic-indications`

**Caractéristique:** Entité la plus complexe

**Colonnes:**
- Code
- Pathologie
- Espèce
- Catégorie d'âge
- Substance active
- Posologie
- Statut
- Actions

**Champs du formulaire (nombreux):**
```typescript
{
  code: string;                 // Required, unique
  pathology: string;            // Required
  speciesId: string;            // Required, Select
  ageCategoryId?: string;       // Optional, Select (filtered by species)
  activeSubstanceId?: string;   // Optional, Select
  administrationRouteId?: string; // Optional, Select

  // Posologie
  dosage: number;               // Optional
  doseUnitId?: string;          // Optional, Select from Units
  frequency: string;            // Optional (ex: "2 fois par jour")
  duration: string;             // Optional (ex: "5 jours")

  // Délais
  withdrawalMeat?: number;      // Jours (délai viande)
  withdrawalMilk?: number;      // Jours (délai lait)
  withdrawalEggs?: number;      // Jours (délai œufs)

  // Textes
  instructions: string;         // Textarea
  contraindications: string;    // Textarea
  warnings: string;             // Textarea
}
```

**Dépendances:**
- Aucune (entité feuille dans le graphe de dépendances)

**Formulaire en sections:**
```
┌─────────────────────────────────────────────────┐
│ Nouvelle Indication Thérapeutique         [✖]  │
├─────────────────────────────────────────────────┤
│                                                 │
│ 📋 Informations Générales                      │
│ ────────────────────────────────────────────    │
│  Code *        [_______________]                │
│  Pathologie *  [_______________]                │
│                                                 │
│ 🐾 Ciblage                                     │
│ ────────────────────────────────────────────    │
│  Espèce *      [Chat ▼]                        │
│  Catégorie âge [Adulte ▼]                      │
│                                                 │
│ 💊 Traitement                                  │
│ ────────────────────────────────────────────    │
│  Substance     [Amoxicilline ▼]                │
│  Voie admin    [Orale ▼]                       │
│                                                 │
│ 📏 Posologie                                   │
│ ────────────────────────────────────────────    │
│  Dosage        [___] [mg/kg ▼]                 │
│  Fréquence     [2 fois par jour]               │
│  Durée         [5 jours]                       │
│                                                 │
│ ⏰ Délais d'Attente                            │
│ ────────────────────────────────────────────    │
│  Viande        [___] jours                     │
│  Lait          [___] jours                     │
│  Œufs          [___] jours                     │
│                                                 │
│              [Annuler]  [Créer]                │
└─────────────────────────────────────────────────┘
```

**115 clés i18n disponibles** (voir I18N_KEYS.md)

---

## D. Wireframes

### D.1. Page Liste Standard

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo] AniTra Admin            User: Jean Dupont [👤▼]  [🔔]   │
├──────────────────────────────────────────────────────────────────┤
│ 📋 Admin > Substances Actives                                   │
├────────────┬─────────────────────────────────────────────────────┤
│            │                                                     │
│ 📊 Dashboard│ ┌─────────────────────────────────────────────┐  │
│            │ │ Substances Actives          [+ Nouvelle]    │  │
│ 🔧 Admin   │ └─────────────────────────────────────────────┘  │
│  > SA ◀    │                                                     │
│  > Produits│ 🔍 [Rechercher...]  [Statut: Tous ▼] [50 ▼]     │
│  > Catég.  │                                                     │
│  > Unités  │ ┌────┬──────────┬─────────────┬────────┬───────┐ │
│            │ │Code│ Nom      │ Description │ Statut │Actions│ │
│ 🐾 Élevages│ ├────┼──────────┼─────────────┼────────┼───────┤ │
│  > Espèces │ │AMX │Amoxicil..│Antibiotiq...│ ✅     │✏️ 🗑️ │ │
│  > Races   │ │CTC │Tétra...  │Antibiotiq...│ ✅     │✏️ 🗑️ │ │
│            │ │IVM │Ivermec.. │Antiparas....│ ❌ 🗑️  │♻️    │ │
│            │ └────┴──────────┴─────────────┴────────┴───────┘ │
│            │                                                     │
│            │ Affichage 1-25 sur 42      [◀] 1 2 [3] 4 [▶]    │
│            │                                                     │
└────────────┴─────────────────────────────────────────────────────┘
```

### D.2. Modale Création/Édition

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Nouvelle Substance Active                         [✖]  │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │                                                         │    │
│  │  Code *                                                 │    │
│  │  [____________]  (ex: AMX)                             │    │
│  │  ✅ Code disponible                                     │    │
│  │                                                         │    │
│  │  Nom International (DCI) *                             │    │
│  │  [________________________________]                    │    │
│  │                                                         │    │
│  │  Nom Français                                          │    │
│  │  [________________________________]                    │    │
│  │                                                         │    │
│  │  Nom Anglais                                           │    │
│  │  [________________________________]                    │    │
│  │                                                         │    │
│  │  Nom Arabe                                             │    │
│  │  [________________________________]  ◀ RTL             │    │
│  │                                                         │    │
│  │  Description                                           │    │
│  │  [________________________________]                    │
│  │  [________________________________]                    │    │
│  │  [________________________________]                    │    │
│  │                                                         │    │
│  │  Code ATC                                              │    │
│  │  [____________]  (ex: J01CA04)                         │    │
│  │                                                         │    │
│  │                              [Annuler]  [Créer]        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### D.3. Modale Suppression avec Dépendances

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ ⚠️  Supprimer Substance Active                   [✖]  │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │                                                         │    │
│  │ Êtes-vous sûr de vouloir supprimer :                   │    │
│  │                                                         │    │
│  │ ┌─────────────────────────────────────────────────┐   │    │
│  │ │ 📦 Amoxicilline (AMX)                           │   │    │
│  │ └─────────────────────────────────────────────────┘   │    │
│  │                                                         │    │
│  │ ⚠️  Cette substance est utilisée dans :                │    │
│  │                                                         │    │
│  │ • 12 indication(s) thérapeutique(s)                    │    │
│  │   [Voir la liste →]                                    │    │
│  │                                                         │    │
│  │ ⚠️  Vous devez d'abord supprimer ou modifier ces      │    │
│  │    dépendances avant de pouvoir supprimer cette        │    │
│  │    substance active.                                   │    │
│  │                                                         │    │
│  │              [Annuler]  [Supprimer] (disabled)         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### D.4. Page Junction Table (Matrice)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo] AniTra Admin            User: Jean Dupont [👤▼]  [🔔]   │
├──────────────────────────────────────────────────────────────────┤
│ 📋 Admin > Races > Pays Autorisés                               │
├────────────┬─────────────────────────────────────────────────────┤
│            │                                                     │
│ 🔧 Admin   │ ┌─────────────────────────────────────────────┐  │
│  > SA      │ │ Associations Races × Pays                   │  │
│  > Races ◀ │ └─────────────────────────────────────────────┘  │
│                                                                 │
│            │ Espèce: [Chat (CAT) ▼]                            │
│            │                                                     │
│            │ ┌────────┬────────┬────────┬────────┬────────┐   │
│            │ │        │ 🇫🇷 FR  │ 🇩🇿 DZ  │ 🇹🇳 TN  │ 🇲🇦 MA  │   │
│            │ ├────────┼────────┼────────┼────────┼────────┤   │
│            │ │ Persan │ ✅     │ ✅     │ ⬜     │ —      │   │
│            │ │ Siamois│ ✅     │ —      │ —      │ —      │   │
│            │ │ Maine C│ ✅     │ ✅     │ ✅     │ ✅     │   │
│            │ │ Ragdoll│ ✅     │ ⬜     │ —      │ —      │   │
│            │ └────────┴────────┴────────┴────────┴────────┘   │
│            │                                                     │
│            │ ✅ Actif   ⬜ Inactif   — Pas de lien              │
│            │                                                     │
│            │ 💡 Cliquez sur une case pour créer/modifier       │
│            │    le lien entre une race et un pays.             │
│            │                                                     │
└────────────┴─────────────────────────────────────────────────────┘
```

---

## E. User Flows

### E.1. Création d'une Substance Active

```
[Page Liste]
    │
    ├─ User clique "➕ Nouvelle"
    │
    ▼
[Modale Formulaire Création]
    │
    ├─ User remplit "Code" (ex: "AMX")
    │   ├─ Validation temps réel (pattern ^[A-Z0-9_-]+$)
    │   └─ Check unicité (debounced 500ms)
    │       └─ API: GET /api/v1/active-substances/check-code?code=AMX
    │           ├─ ✅ Disponible → Afficher ✅ "Code disponible"
    │           └─ ❌ Existe → Afficher ❌ "Code déjà utilisé"
    │
    ├─ User remplit "Nom" (ex: "Amoxicilline")
    │   └─ Validation: min 2 caractères, max 200
    │
    ├─ User remplit champs optionnels (description, etc.)
    │
    ├─ User clique "Créer"
    │
    ▼
[API Call]
    POST /api/v1/active-substances
    Body: { code: "AMX", name: "Amoxicilline", ... }
    │
    ├─ ✅ 201 Created
    │   ├─ Modale se ferme
    │   ├─ Toast success: "Substance active créée avec succès"
    │   └─ Liste se rafraîchit (nouvelle substance apparaît)
    │
    ├─ ❌ 400 Bad Request (validation)
    │   ├─ Afficher erreurs sous les champs concernés
    │   └─ Formulaire reste ouvert
    │
    ├─ ❌ 409 Conflict (code existe déjà)
    │   ├─ Afficher erreur sous champ "Code"
    │   └─ Formulaire reste ouvert
    │
    └─ ❌ 500 Server Error
        ├─ Toast error: "Une erreur est survenue"
        └─ Formulaire reste ouvert
```

### E.2. Suppression avec Vérification de Dépendances

```
[Page Liste]
    │
    ├─ User clique "🗑️" sur Amoxicilline
    │
    ▼
[Modale Suppression]
    │
    ├─ Affichage: "Êtes-vous sûr de vouloir supprimer Amoxicilline (AMX) ?"
    │
    ├─ API Call (check dependencies)
    │   DELETE /api/v1/active-substances/{id} (dry-run via HEAD?)
    │   OU
    │   GET /api/v1/active-substances/{id}/dependencies
    │
    ▼
[API Response]
    │
    ├─── ✅ Pas de dépendances
    │    │
    │    ├─ Bouton "Supprimer" actif
    │    │
    │    ├─ User clique "Supprimer"
    │    │
    │    ▼
    │   [API Call DELETE]
    │    DELETE /api/v1/active-substances/{id}
    │    │
    │    ├─ ✅ 200 OK (soft delete)
    │    │   ├─ Modale se ferme
    │    │   ├─ Toast success: "Substance active supprimée"
    │    │   └─ Liste se rafraîchit (ligne devient grisée ou disparaît)
    │    │
    │    └─ ❌ Erreur
    │        ├─ Toast error
    │        └─ Modale reste ouverte
    │
    └─── ❌ Dépendances existent
         │
         ├─ Response: { dependencies: { therapeuticIndications: 12 } }
         │
         ├─ Affichage:
         │   "⚠️ Cette substance est utilisée dans :"
         │   "• 12 indication(s) thérapeutique(s)"
         │   "[Voir la liste →]"
         │
         ├─ Bouton "Supprimer" désactivé (disabled)
         │
         ├─ User clique "Voir la liste"
         │   └─ Ouvre panneau latéral ou nouvelle page:
         │       Liste des 12 indications avec liens cliquables
         │
         └─ User clique "Annuler"
             └─ Modale se ferme
```

### E.3. Édition avec Conflit de Version (Optimistic Locking)

```
[Page Liste]
    │
    ├─ User clique "✏️" sur Amoxicilline (version: 1)
    │
    ▼
[Modale Formulaire Édition]
    │
    ├─ API Call: GET /api/v1/active-substances/{id}
    │   Response: { id, code: "AMX", name: "Amoxicilline", version: 1 }
    │
    ├─ Formulaire pré-rempli
    │
    ├─ User modifie "name" → "Amoxicilline (nouvelle formulation)"
    │
    ├─ User clique "Enregistrer"
    │
    ▼
[API Call]
    PATCH /api/v1/active-substances/{id}
    Body: { name: "Amoxicilline (nouvelle formulation)", version: 1 }
    │
    ├─── ✅ 200 OK
    │    Response: { id, name: "...", version: 2 }
    │    │
    │    ├─ Modale se ferme
    │    ├─ Toast success: "Substance active mise à jour"
    │    └─ Liste se rafraîchit
    │
    └─── ❌ 409 Conflict (version mismatch)
         Response: {
           statusCode: 409,
           message: "Conflit de version : les données ont été modifiées par un autre utilisateur"
         }
         │
         ├─ Afficher bannière d'avertissement dans le formulaire:
         │   ┌────────────────────────────────────────────────┐
         │   │ ⚠️  Conflit de Version                         │
         │   │                                                │
         │   │ Les données ont été modifiées par un autre     │
         │   │ utilisateur pendant votre édition.             │
         │   │                                                │
         │   │ [Recharger les données]  [Ignorer et forcer]  │
         │   └────────────────────────────────────────────────┘
         │
         ├─ User clique "Recharger"
         │   ├─ Recharge les données depuis l'API (version: 2)
         │   ├─ PERTE des modifications de l'utilisateur
         │   └─ Afficher message: "Vos modifications ont été perdues"
         │
         └─ User clique "Ignorer et forcer" (dangereux)
             └─ Retry PATCH sans vérifier la version
                 (à implémenter avec précaution ou désactiver)
```

### E.4. Restauration d'un Élément Supprimé

```
[Page Liste - Filtre "Inclure supprimés" activé]
    │
    ├─ Affichage des éléments supprimés (grisés)
    │   ┌──────┬────────────┬─────────────┬────────┬───────┐
    │   │ Code │ Nom        │ Description │ Statut │Actions│
    │   ├──────┼────────────┼─────────────┼────────┼───────┤
    │   │ IVM  │Ivermectine │...          │ ❌ 🗑️  │ ♻️    │ ← Grisé
    │   └──────┴────────────┴─────────────┴────────┴───────┘
    │
    ├─ User clique "♻️" (Restaurer) sur Ivermectine
    │
    ▼
[Modale Confirmation Restauration]
    │
    ├─ "Êtes-vous sûr de vouloir restaurer Ivermectine (IVM) ?"
    │
    ├─ User clique "Restaurer"
    │
    ▼
[API Call]
    POST /api/v1/active-substances/{id}/restore
    │
    ├─ ✅ 200 OK
    │   Response: { id, code: "IVM", deletedAt: null, version: 3 }
    │   │
    │   ├─ Modale se ferme
    │   ├─ Toast success: "Substance active restaurée avec succès"
    │   └─ Liste se rafraîchit (ligne redevient normale)
    │
    └─ ❌ 404 Not Found
        └─ Toast error: "Substance active non trouvée"
```

### E.5. Liaison Race × Pays (Junction Table)

```
[Page Breed-Countries - Vue Liste]
    │
    ├─ Race sélectionnée: "Persan"
    │   Pays liés: France (actif), Algérie (actif), Tunisie (inactif)
    │
    ├─ User clique "➕ Lier Pays"
    │
    ▼
[Modale Sélection Multiple]
    │
    ├─ Affichage liste des pays NON ENCORE LIÉS
    │   API: GET /api/v1/countries?excludeBreedId=PER
    │
    ├─ User coche:
    │   ☑️ Maroc (MA)
    │   ☑️ Espagne (ES)
    │
    ├─ Bouton "Lier 2 pays" devient actif
    │
    ├─ User clique "Lier 2 pays"
    │
    ▼
[API Calls - Batch]
    POST /api/v1/breed-countries/link
    Body: { breedId: "PER", countryCode: "MA" }

    POST /api/v1/breed-countries/link
    Body: { breedId: "PER", countryCode: "ES" }
    │
    ├─ ✅ Tous réussis
    │   ├─ Modale se ferme
    │   ├─ Toast success: "2 pays liés avec succès"
    │   └─ Liste se rafraîchit (2 nouvelles lignes)
    │
    ├─ ⚠️ Partiellement réussi (1/2)
    │   ├─ Toast warning: "1 pays lié, 1 échec"
    │   └─ Liste se rafraîchit (1 nouvelle ligne)
    │
    └─ ❌ Tous échoués
        └─ Toast error: "Échec de liaison"

---

[User Toggle isActive sur Tunisie]
    │
    ├─ Ligne: Tunisie │ TN │ ⬜ Inactif │ ...
    │
    ├─ User clique sur ⬜ (toggle à actif)
    │
    ▼
[API Call]
    PATCH /api/v1/breed-countries/{id}
    Body: { isActive: true }
    │
    ├─ ✅ 200 OK
    │   ├─ Icône change: ⬜ → ✅
    │   └─ Toast success: "Lien activé"
    │
    └─ ❌ Erreur
        └─ Toast error

---

[User Suppression Définitive]
    │
    ├─ User clique "🗑️" sur Tunisie
    │
    ▼
[Modale Confirmation]
    │
    ├─ "⚠️ Supprimer définitivement le lien Persan × Tunisie ?"
    │   "Cette action est irréversible."
    │
    ├─ User clique "Supprimer définitivement"
    │
    ▼
[API Call]
    POST /api/v1/breed-countries/unlink
    Body: { breedId: "PER", countryCode: "TN" }
    │
    ├─ ✅ 200 OK
    │   ├─ Ligne disparaît de la liste
    │   └─ Toast success: "Lien supprimé définitivement"
    │
    └─ ❌ Erreur
        └─ Toast error
```

---

## F. Mapping i18n

### Structure des Clés

Toutes les clés i18n suivent la convention :
```
{entityName}.{category}.{subcategory}.{key}
```

**Catégories:**
- `fields` - Labels de champs
- `validation` - Messages de validation
- `error` - Erreurs métier
- `success` - Messages de succès
- `actions` - Labels d'actions
- `filters` - Labels de filtres
- `status` - Labels de statut

### Exemple pour Active-Substances

**Fichier:** `src/active-substances/I18N_KEYS.md` (18 clés)

**Mapping UI → i18n:**

```typescript
// Titre de page
'activeSubstance.title.plural'              → "Substances Actives"
'activeSubstance.title.singular'            → "Substance Active"

// Labels de champs (formulaire)
'activeSubstance.fields.code'               → "Code"
'activeSubstance.fields.name'               → "Nom International (DCI)"
'activeSubstance.fields.nameFr'             → "Nom Français"
'activeSubstance.fields.nameEn'             → "Nom Anglais"
'activeSubstance.fields.nameAr'             → "Nom Arabe"
'activeSubstance.fields.description'        → "Description"
'activeSubstance.fields.atcCode'            → "Code ATC"

// Messages de validation (temps réel)
'activeSubstance.validation.code.required'  → "Le code est requis"
'activeSubstance.validation.code.maxLength' → "Le code ne doit pas dépasser 50 caractères"
'activeSubstance.validation.name.required'  → "Le nom international est requis"

// Erreurs métier
'activeSubstance.error.notFound'            → "Substance active non trouvée"
'activeSubstance.error.codeAlreadyExists'   → "Le code existe déjà"
'activeSubstance.error.versionConflict'     → "Conflit de version : les données ont été modifiées"
'activeSubstance.error.inUse'               → "Impossible de supprimer : {count} produits actifs dépendent de cette substance"

// Messages de succès (toasts)
'activeSubstance.success.created'           → "Substance active créée avec succès"
'activeSubstance.success.updated'           → "Substance active mise à jour avec succès"
'activeSubstance.success.deleted'           → "Substance active supprimée avec succès"
'activeSubstance.success.restored'          → "Substance active restaurée avec succès"

// Actions (boutons)
'activeSubstance.actions.create'            → "Créer une substance active"
'activeSubstance.actions.edit'              → "Modifier"
'activeSubstance.actions.delete'            → "Supprimer"
'activeSubstance.actions.restore'           → "Restaurer"

// Filtres
'activeSubstance.filters.status'            → "Statut"
'activeSubstance.filters.search'            → "Rechercher par code, nom..."

// Statuts
'activeSubstance.status.active'             → "✅ Actif"
'activeSubstance.status.deleted'            → "❌ Supprimé"
```

### Clés Communes (utilisées par toutes les entités)

```typescript
// Navigation
'common.admin'                              → "Administration"
'common.referenceData'                      → "Données de Référence"

// Actions génériques
'common.actions.create'                     → "Créer"
'common.actions.edit'                       → "Modifier"
'common.actions.delete'                     → "Supprimer"
'common.actions.restore'                    → "Restaurer"
'common.actions.cancel'                     → "Annuler"
'common.actions.save'                       → "Enregistrer"
'common.actions.confirm'                    → "Confirmer"

// Filtres génériques
'common.filters.search'                     → "Rechercher..."
'common.filters.status'                     → "Statut"
'common.filters.all'                        → "Tous"
'common.filters.active'                     → "Actifs uniquement"
'common.filters.deleted'                    → "Supprimés uniquement"

// Pagination
'common.pagination.showing'                 → "Affichage {from}-{to} sur {total}"
'common.pagination.itemsPerPage'           → "Éléments par page"

// Messages d'erreur génériques
'common.error.network'                      → "Erreur réseau : impossible de contacter le serveur"
'common.error.unauthorized'                 → "Vous n'êtes pas autorisé à effectuer cette action"
'common.error.forbidden'                    → "Accès refusé"
'common.error.notFound'                     → "Ressource non trouvée"
'common.error.serverError'                  → "Erreur serveur : veuillez réessayer plus tard"

// Modales
'common.modal.confirmDelete.title'          → "Confirmer la suppression"
'common.modal.confirmDelete.message'        → "Êtes-vous sûr de vouloir supprimer {name} ?"
'common.modal.confirmRestore.title'         → "Confirmer la restauration"
'common.modal.confirmRestore.message'       → "Êtes-vous sûr de vouloir restaurer {name} ?"

// Statuts génériques
'common.status.active'                      → "✅ Actif"
'common.status.inactive'                    → "⬜ Inactif"
'common.status.deleted'                     → "❌ Supprimé"

// Champs communs
'common.fields.createdAt'                   → "Date de création"
'common.fields.updatedAt'                   → "Date de modification"
'common.fields.deletedAt'                   → "Date de suppression"
'common.fields.version'                     → "Version"
```

### Interpolation de Variables

**TypeScript:**
```typescript
// Avec count
t('activeSubstance.error.inUse', { count: 12 })
// → "Impossible de supprimer : 12 indication(s) thérapeutique(s) dépendent de cette substance"

// Avec name
t('common.modal.confirmDelete.message', { name: 'Amoxicilline' })
// → "Êtes-vous sûr de vouloir supprimer Amoxicilline ?"

// Pagination
t('common.pagination.showing', { from: 1, to: 25, total: 42 })
// → "Affichage 1-25 sur 42"
```

### Pluralisation

**Fichier i18n (exemple en français):**
```json
{
  "therapeuticIndication": {
    "dependencies": {
      "none": "Aucune dépendance",
      "one": "1 indication thérapeutique dépend de cette substance",
      "other": "{{count}} indications thérapeutiques dépendent de cette substance"
    }
  }
}
```

---

## G. Checklist Développement Frontend

### G.1. Setup Projet

- [ ] Initialiser projet React/Vue/Angular
- [ ] Installer dépendances:
  - [ ] Axios ou Fetch pour API calls
  - [ ] React Query / SWR pour cache & state management
  - [ ] React Router / Vue Router pour navigation
  - [ ] i18next pour internationalisation
  - [ ] Tailwind CSS / Material-UI pour styles
  - [ ] React Hook Form / Formik pour formulaires
  - [ ] Zod / Yup pour validation
- [ ] Configurer variables d'environnement:
  ```env
  VITE_API_BASE_URL=http://localhost:3000/api/v1
  VITE_API_TIMEOUT=10000
  ```

### G.2. Architecture

- [ ] Créer structure de dossiers:
  ```
  src/
  ├─ components/
  │  ├─ common/
  │  │  ├─ DataTable.tsx          # Composant table réutilisable
  │  │  ├─ EntityForm.tsx          # Formulaire générique
  │  │  ├─ DeleteConfirmModal.tsx  # Modale suppression
  │  │  ├─ Toast.tsx               # Notifications
  │  │  └─ Pagination.tsx          # Pagination
  │  ├─ admin/
  │  │  ├─ ActiveSubstances/
  │  │  │  ├─ ActiveSubstancesList.tsx
  │  │  │  ├─ ActiveSubstanceForm.tsx
  │  │  │  └─ useActiveSubstances.ts  # Custom hook
  │  │  ├─ Products/
  │  │  └─ ...
  ├─ services/
  │  ├─ api.ts                    # Axios instance
  │  └─ activeSubstances.service.ts
  ├─ types/
  │  └─ entities.ts               # Types TypeScript
  ├─ i18n/
  │  ├─ fr.json
  │  ├─ en.json
  │  └─ ar.json
  └─ utils/
     └─ validators.ts
  ```

### G.3. Composants Génériques

#### DataTable Component
- [ ] Props: columns, data, loading, error
- [ ] Features:
  - [ ] Tri par colonne (client ou serveur)
  - [ ] Recherche full-text
  - [ ] Filtres (Actif/Supprimé)
  - [ ] Actions par ligne (Modifier, Supprimer, Restaurer)
  - [ ] Empty state ("Aucun résultat")
  - [ ] Loading state (skeleton)
  - [ ] Error state

#### EntityForm Component
- [ ] Props: mode (create/edit), fields, onSubmit, onCancel
- [ ] Features:
  - [ ] Validation temps réel (champ par champ)
  - [ ] Affichage erreurs backend
  - [ ] Gestion version optimiste
  - [ ] Debounce pour vérification unicité
  - [ ] Support RTL (arabe)
  - [ ] States: idle, submitting, success, error

#### DeleteConfirmModal Component
- [ ] Props: entity, onConfirm, onCancel, checkDependencies
- [ ] Features:
  - [ ] Vérification dépendances avant affichage
  - [ ] Liste dépendances avec liens cliquables
  - [ ] Bouton "Supprimer" désactivé si dépendances
  - [ ] Loading state pendant vérification

#### Toast Component
- [ ] Types: success, error, warning, info
- [ ] Auto-dismiss après 3 secondes
- [ ] Queue de notifications
- [ ] Position: top-right

### G.4. Services API

#### Base API Service
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add JWT token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### Entity Service Example
```typescript
// src/services/activeSubstances.service.ts
import api from './api';
import { ActiveSubstance, PaginatedResponse, CreateActiveSubstanceDto } from '../types';

export const activeSubstancesService = {
  // Liste
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    includeDeleted?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<ActiveSubstance>> {
    const { data } = await api.get('/active-substances', { params });
    return data;
  },

  // Détail
  async findOne(id: string): Promise<ActiveSubstance> {
    const { data } = await api.get(`/active-substances/${id}`);
    return data;
  },

  // Création
  async create(dto: CreateActiveSubstanceDto): Promise<ActiveSubstance> {
    const { data } = await api.post('/active-substances', dto);
    return data;
  },

  // Édition
  async update(id: string, dto: Partial<ActiveSubstance>): Promise<ActiveSubstance> {
    const { data } = await api.patch(`/active-substances/${id}`, dto);
    return data;
  },

  // Suppression
  async remove(id: string): Promise<void> {
    await api.delete(`/active-substances/${id}`);
  },

  // Restauration
  async restore(id: string): Promise<ActiveSubstance> {
    const { data } = await api.post(`/active-substances/${id}/restore`);
    return data;
  },

  // Check unicité code
  async checkCodeUnique(code: string): Promise<boolean> {
    try {
      await api.get(`/active-substances/check-code`, { params: { code } });
      return true;
    } catch {
      return false;
    }
  },
};
```

### G.5. Custom Hooks (React)

```typescript
// src/components/admin/ActiveSubstances/useActiveSubstances.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activeSubstancesService } from '../../../services/activeSubstances.service';
import { toast } from '../../../components/common/Toast';

export function useActiveSubstances(params: {
  page: number;
  limit: number;
  search: string;
  includeDeleted: boolean;
}) {
  const queryClient = useQueryClient();

  // Liste
  const { data, isLoading, error } = useQuery({
    queryKey: ['active-substances', params],
    queryFn: () => activeSubstancesService.findAll(params),
  });

  // Création
  const createMutation = useMutation({
    mutationFn: activeSubstancesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-substances'] });
      toast.success('activeSubstance.success.created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'common.error.serverError');
    },
  });

  // Suppression
  const deleteMutation = useMutation({
    mutationFn: activeSubstancesService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-substances'] });
      toast.success('activeSubstance.success.deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'common.error.serverError');
    },
  });

  // Restauration
  const restoreMutation = useMutation({
    mutationFn: activeSubstancesService.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-substances'] });
      toast.success('activeSubstance.success.restored');
    },
  });

  return {
    activeSubstances: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    create: createMutation.mutate,
    delete: deleteMutation.mutate,
    restore: restoreMutation.mutate,
  };
}
```

### G.6. Types TypeScript

```typescript
// src/types/entities.ts

export interface ActiveSubstance {
  id: string;
  code: string;
  name: string;
  nameFr?: string;
  nameEn?: string;
  nameAr?: string;
  description?: string;
  atcCode?: string;
  isActive: boolean;
  deletedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActiveSubstanceDto {
  code: string;
  name: string;
  nameFr?: string;
  nameEn?: string;
  nameAr?: string;
  description?: string;
  atcCode?: string;
}

export interface UpdateActiveSubstanceDto extends Partial<CreateActiveSubstanceDto> {
  version: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  dependencies?: Record<string, number>;
}
```

### G.7. Validation (Zod)

```typescript
// src/utils/validators.ts
import { z } from 'zod';

export const activeSubstanceSchema = z.object({
  code: z.string()
    .min(1, 'activeSubstance.validation.code.required')
    .max(50, 'activeSubstance.validation.code.maxLength')
    .regex(/^[A-Z0-9_-]+$/, 'activeSubstance.validation.code.pattern'),

  name: z.string()
    .min(1, 'activeSubstance.validation.name.required')
    .max(200, 'activeSubstance.validation.name.maxLength'),

  nameFr: z.string().max(200).optional(),
  nameEn: z.string().max(200).optional(),
  nameAr: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  atcCode: z.string().max(20).optional(),
});

export type ActiveSubstanceFormData = z.infer<typeof activeSubstanceSchema>;
```

### G.8. i18n Configuration

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './fr.json';
import en from './en.json';
import ar from './ar.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

```json
// src/i18n/fr.json
{
  "activeSubstance": {
    "title": {
      "singular": "Substance Active",
      "plural": "Substances Actives"
    },
    "fields": {
      "code": "Code",
      "name": "Nom International (DCI)",
      "nameFr": "Nom Français",
      "nameEn": "Nom Anglais",
      "nameAr": "Nom Arabe",
      "description": "Description",
      "atcCode": "Code ATC"
    },
    "validation": {
      "code": {
        "required": "Le code est requis",
        "maxLength": "Le code ne doit pas dépasser 50 caractères",
        "pattern": "Le code doit contenir uniquement des lettres majuscules, chiffres, tirets et underscores"
      },
      "name": {
        "required": "Le nom international est requis",
        "maxLength": "Le nom ne doit pas dépasser 200 caractères"
      }
    },
    "error": {
      "notFound": "Substance active non trouvée",
      "codeAlreadyExists": "Le code existe déjà",
      "versionConflict": "Conflit de version : les données ont été modifiées par un autre utilisateur",
      "inUse": "Impossible de supprimer : {{count}} indication(s) thérapeutique(s) dépendent de cette substance"
    },
    "success": {
      "created": "Substance active créée avec succès",
      "updated": "Substance active mise à jour avec succès",
      "deleted": "Substance active supprimée avec succès",
      "restored": "Substance active restaurée avec succès"
    }
  },
  "common": {
    "actions": {
      "create": "Créer",
      "edit": "Modifier",
      "delete": "Supprimer",
      "restore": "Restaurer",
      "cancel": "Annuler",
      "save": "Enregistrer"
    }
  }
}
```

### G.9. Tests

#### Tests Unitaires (Vitest + Testing Library)
- [ ] Composant DataTable
  - [ ] Affiche les données correctement
  - [ ] Tri fonctionne
  - [ ] Recherche filtre les résultats
  - [ ] Actions appellent les bonnes fonctions
- [ ] Composant EntityForm
  - [ ] Validation temps réel fonctionne
  - [ ] Soumission appelle onSubmit avec bonnes données
  - [ ] Affichage erreurs backend
- [ ] Services API
  - [ ] Mocking Axios
  - [ ] findAll retourne données paginées
  - [ ] create envoie bon payload
  - [ ] Gestion erreurs 409, 404, 500

#### Tests E2E (Playwright / Cypress)
- [ ] Scénario création substance active
- [ ] Scénario suppression avec dépendances
- [ ] Scénario conflit de version
- [ ] Scénario restauration

### G.10. Déploiement

- [ ] Build production: `npm run build`
- [ ] Variables d'environnement:
  ```env
  VITE_API_BASE_URL=https://api.anitra.dz/api/v1
  ```
- [ ] Docker (optionnel):
  ```dockerfile
  FROM node:20-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --production
  COPY . .
  RUN npm run build
  EXPOSE 3000
  CMD ["npm", "run", "preview"]
  ```

---

## 📚 Annexes

### Annexe A: Liste Complète des Entités

| # | Entité | Pattern | API Endpoint | i18n Keys | Tests |
|---|--------|---------|--------------|-----------|-------|
| 1 | Active-Substances | Simple | `/active-substances` | 18 | 89 |
| 2 | Product-Categories | Simple | `/product-categories` | 18 | 89 |
| 3 | Units | Simple | `/units` | 20 | 89 |
| 4 | Administration-Routes | Simple | `/administration-routes` | 18 | 89 |
| 5 | Species | Simple | `/species` | 18 | 89 |
| 6 | Alert-Templates | Simple | `/alert-templates` | 25 | 89 |
| 7 | Countries | Simple | `/countries` | 20 | 89 |
| 8 | Breeds | Scoped | `/breeds` | 20 | 100 |
| 9 | Age-Categories | Scoped | `/age-categories` | 20 | 100 |
| 10 | Breed-Countries | Junction | `/breed-countries` | 79 | 89 |
| 11 | Campaign-Countries | Junction | `/campaign-countries` | 79 | 89 |
| 12 | Products | Simple | `/products` | 35 | 120 |
| 13 | Product-Packagings | Scoped | `/product-packagings` | 45 | 130 |
| 14 | Therapeutic-Indications | Simple | `/therapeutic-indications` | 115 | 145 |
| 15 | Veterinarians | Simple | `/veterinarians` | 40 | 110 |
| 16 | National-Campaigns | Simple | `/national-campaigns` | 115 | 145 |

**Total:** 1500+ clés i18n, 1200+ tests documentés

### Annexe B: Endpoints API Complets

Tous les endpoints suivent le pattern REST standard :

```
GET    /api/v1/{entity}           # Liste paginée
GET    /api/v1/{entity}/:id       # Détail
POST   /api/v1/{entity}           # Création
PATCH  /api/v1/{entity}/:id       # Mise à jour
DELETE /api/v1/{entity}/:id       # Suppression (soft delete)
POST   /api/v1/{entity}/:id/restore # Restauration
```

**Junction tables uniquement:**
```
POST /api/v1/{entity}/link        # Créer lien
POST /api/v1/{entity}/unlink      # Supprimer lien
```

### Annexe C: Codes de Statut HTTP

| Code | Signification | Usage UI |
|------|---------------|----------|
| 200 | OK | Succès (GET, PATCH, DELETE, restore) |
| 201 | Created | Succès création (POST) |
| 400 | Bad Request | Erreurs de validation → Afficher sous champs |
| 401 | Unauthorized | Token manquant/invalide → Redirect login |
| 403 | Forbidden | Pas les droits → Toast error |
| 404 | Not Found | Entité introuvable → Toast error |
| 409 | Conflict | Contrainte unique, version conflict, dépendances → Afficher message spécifique |
| 500 | Server Error | Erreur serveur → Toast error générique |

### Annexe D: Bonnes Pratiques

**Performance:**
- ✅ Debounce recherche (500ms)
- ✅ Cache API avec React Query (staleTime: 5min)
- ✅ Pagination serveur (ne pas charger tout)
- ✅ Lazy loading des composants (React.lazy)

**UX:**
- ✅ Loading states (skeleton, spinner)
- ✅ Empty states ("Aucun résultat")
- ✅ Error states avec retry
- ✅ Confirmation avant suppression
- ✅ Toast notifications (succès/erreur)
- ✅ Breadcrumbs pour navigation

**Accessibilité:**
- ✅ Labels ARIA
- ✅ Navigation clavier (Tab, Enter, Esc)
- ✅ Focus management (modales)
- ✅ Contraste couleurs (WCAG AA)

**Sécurité:**
- ✅ JWT dans Authorization header
- ✅ Pas de données sensibles dans localStorage
- ✅ XSS protection (échapper HTML)
- ✅ CSRF protection (si cookies)

---

## 🎯 Résumé

Ce document fournit **toutes les spécifications nécessaires** pour implémenter les interfaces web d'administration des 16 entités de référence :

✅ **3 Patterns réutilisables** (Simple, Scoped, Junction)
✅ **Specs détaillées par entité** (colonnes, formulaires, dépendances)
✅ **Wireframes ASCII** pour chaque type de page
✅ **User flows complets** avec gestion d'erreurs
✅ **Mapping i18n** (1500+ clés)
✅ **Checklist développement** (setup, composants, services, tests)
✅ **Code samples** (TypeScript, React, Zod, React Query)

**L'équipe frontend peut commencer immédiatement l'implémentation** avec ces specs ! 🚀

---

**Dernière mise à jour :** 2025-11-30
**Auteur :** Claude (Assistant IA)
**Basé sur :** MIGRATION_SUMMARY.md, ARCHITECTURE_BEST_PRACTICES_ANALYSIS.md, 16× I18N_KEYS.md, 16× TESTS_PLAN.md
