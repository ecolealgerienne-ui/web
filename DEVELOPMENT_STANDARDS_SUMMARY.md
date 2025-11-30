# Résumé des Standards de Développement - AniTra Web

**Document complet :** `DEVELOPMENT_STANDARDS.md`

---

## 🚫 LES 7 INTERDICTIONS ABSOLUES

### 1. ❌ AUCUNE VALEUR EN DUR
```typescript
// ❌ INTERDIT
const title = "Substances Actives"
const url = "http://localhost:3000/api/v1/substances"

// ✅ OBLIGATOIRE
const title = t('activeSubstance.title.plural')
const url = `${API_BASE_URL}/api/v1/active-substances`
```

### 2. ❌ JAMAIS fetch() DIRECTEMENT
```typescript
// ❌ INTERDIT
const response = await fetch('/api/v1/endpoint')

// ✅ OBLIGATOIRE
import { apiClient } from '@/lib/api/client'
const response = await apiClient.get('/api/v1/endpoint')
```

### 3. ❌ JAMAIS RECRÉER LES COMPOSANTS GÉNÉRIQUES ADMIN
```typescript
// ❌ INTERDIT - Créer son propre tableau paginé
const MyCustomTable = () => { /* ... */ }

// ✅ OBLIGATOIRE - Utiliser les composants génériques
import { DataTable } from '@/components/admin/common/DataTable'
import { Pagination } from '@/components/admin/common/Pagination'
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'

// Ces 3 composants DOIVENT être utilisés pour TOUTES les pages admin
// Voir section 7.2 du DEVELOPMENT_STANDARDS.md
```

### 4. ❌ JAMAIS IGNORER LES TYPES ET PATTERNS COMMUNS (PHASE 1)
```typescript
// ❌ INTERDIT - Recréer BaseEntity
export interface MyEntity {
  id: string
  createdAt: string  // ❌ Déjà dans BaseEntity
}

// ✅ OBLIGATOIRE - Étendre BaseEntity
import { BaseEntity } from '@/lib/types/common/api'
export interface MyEntity extends BaseEntity {
  code: string
  name: string
}

// ❌ INTERDIT - Magic numbers HTTP
if (response.status === 200) { /* ... */ }
if (error.status === 404) { /* ... */ }

// ✅ OBLIGATOIRE - Constantes HTTP_STATUS
import { HTTP_STATUS } from '@/lib/constants/http-status'
if (response.status === HTTP_STATUS.OK) { /* ... */ }
if (error.status === HTTP_STATUS.NOT_FOUND) { /* ... */ }

// ✅ OBLIGATOIRE - PaginatedResponse pour listes
const result: PaginatedResponse<MyEntity> = await service.getAll()

// ✅ OBLIGATOIRE - CrudService pour services
class MyService implements CrudService<MyEntity, CreateDto, UpdateDto> {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<MyEntity>>
  async getById(id: string): Promise<MyEntity>
  // ...
}
```

### 5. ❌ JAMAIS COMMIT SANS BUILD RÉUSSI
```bash
# TOUJOURS avant commit :
npm run build
# Si erreur → corriger AVANT de commit
```

### 6. ❌ JAMAIS DE TEXTE SANS i18n
```typescript
// ❌ INTERDIT
<Button>Créer</Button>
toast.success("Créé avec succès")

// ✅ OBLIGATOIRE
<Button>{t('common.actions.create')}</Button>
toast.success(t('entity.success.created'))
```

### 7. ❌ JAMAIS D'ERREUR NON LOGGÉE
```typescript
// ❌ INTERDIT
try {
  await service.create(data)
} catch (error) {
  // silence...
}

// ✅ OBLIGATOIRE
try {
  await service.create(data)
} catch (error) {
  logger.error('Failed to create', { error })
  throw error
}
```

---

## ✅ LES 10 OBLIGATIONS

### 1. ✅ TOUJOURS UTILISER apiClient
```typescript
import { apiClient } from '@/lib/api/client'

const data = await apiClient.get<MyType>('/endpoint')
const created = await apiClient.post<MyType>('/endpoint', body)
const updated = await apiClient.patch<MyType>('/endpoint/:id', body)
await apiClient.delete('/endpoint/:id')
```

### 2. ✅ TOUJOURS LOGGER
```typescript
import { logger } from '@/lib/utils/logger'

// Succès
logger.info('Active substances fetched', { count: items.length })

// Erreurs
logger.error('Failed to fetch', { error, params })

// HTTP errors (automatique dans services)
logger.httpError('GET', url, status, errorData)
```

### 3. ✅ TOUJOURS TOAST
```typescript
import { useToast } from '@/contexts/toast-context'

const toast = useToast()

// Succès
toast.success(t('common.messages.success'), t('entity.messages.created'))

// Erreurs (utiliser le helper)
import { handleApiError } from '@/lib/utils/api-error-handler'
handleApiError(error, 'create entity', toast)
```

### 4. ✅ TOUJOURS i18n (FR/EN/AR)
```json
// /src/lib/i18n/messages/fr.json
{
  "activeSubstance": {
    "title": { "plural": "Substances Actives" },
    "fields": { "code": "Code" },
    "validation": { "code": { "required": "Le code est requis" } },
    "success": { "created": "Créé avec succès" }
  }
}
```

### 5. ✅ TOUJOURS VALIDER avec Zod
```typescript
// /src/lib/validation/schemas/admin/active-substance.schema.ts
import { z } from 'zod'

export const activeSubstanceSchema = z.object({
  code: z.string()
    .min(1, 'activeSubstance.validation.code.required')
    .max(50, 'activeSubstance.validation.code.maxLength')
    .regex(/^[A-Z0-9_-]+$/, 'activeSubstance.validation.code.pattern'),
  name: z.string()
    .min(1, 'activeSubstance.validation.name.required')
    .max(200, 'activeSubstance.validation.name.maxLength'),
})

export type ActiveSubstanceFormData = z.infer<typeof activeSubstanceSchema>
```

### 6. ✅ TOUJOURS TYPER (TypeScript Strict)
```typescript
// 3 types par entité MINIMUM
export interface ActiveSubstance extends BaseEntity {
  id: string
  code: string
  name: string
  version: number
  deletedAt: string | null
}

export interface CreateActiveSubstanceDto {
  code: string
  name: string
}

export interface UpdateActiveSubstanceDto {
  code?: string
  name?: string
  version: number // Pour versioning optimiste
}
```

### 7. ✅ TOUJOURS TESTER BUILD
```bash
# AVANT CHAQUE COMMIT
npm run build

# Vérifier :
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# ✓ Generating static pages
```

### 8. ✅ TOUJOURS TESTER (Code Critique)
```typescript
// Tests OBLIGATOIRES pour :
// - Services API
// - Composants réutilisables
// - Hooks personnalisés
// - Logique métier complexe

// /src/lib/services/admin/__tests__/active-substances.service.test.ts
describe('ActiveSubstancesService', () => {
  it('should fetch all', async () => {
    // ...
  })
})
```

### 9. ✅ TOUJOURS COMMITS CONVENTIONNELS
```bash
# Format : <type>(<scope>): <description>

git commit -m "feat(admin): add ActiveSubstances CRUD page"
git commit -m "fix(components): handle null values in DataTable"
git commit -m "refactor(services): extract pagination logic"
git commit -m "i18n(admin): add ActiveSubstances translations (FR/EN/AR)"
git commit -m "test(services): add ActiveSubstances tests"
```

### 10. ✅ TOUJOURS DOCUMENTER (Fonctions Complexes)
```typescript
/**
 * Récupère toutes les substances actives avec pagination
 *
 * @param params - Paramètres de pagination et filtres
 * @returns Liste paginée de substances actives
 * @throws {ApiError} Si l'API retourne une erreur
 */
async getAll(params?: PaginationParams): Promise<PaginatedResponse<ActiveSubstance>> {
  // ...
}
```

---

## 📐 ARCHITECTURE OBLIGATOIRE

### Structure des Dossiers
```
/src
├── app/(app)/admin/[entity]/    # Pages admin
├── components/admin/
│   ├── common/                  # Réutilisables (DataTable, etc.)
│   └── [entity]/                # Spécifiques entité
├── lib/
│   ├── api/client.ts            # ⚠️ API CLIENT (TOUJOURS UTILISER)
│   ├── services/admin/          # Services API
│   ├── types/admin/             # Types TypeScript
│   ├── validation/schemas/admin/# Schémas Zod
│   ├── hooks/admin/             # Custom hooks
│   ├── i18n/                    # ⚠️ I18N (TOUJOURS UTILISER)
│   └── utils/
│       ├── logger.ts            # ⚠️ LOGGER (TOUJOURS UTILISER)
│       └── api-error-handler.ts
└── contexts/
    └── toast-context.tsx        # ⚠️ TOAST (TOUJOURS UTILISER)
```

### Flux de Données
```
Service API (apiClient + logger)
    ↓
Custom Hook (state management)
    ↓
Component (i18n + toast + validation)
    ↓
User
```

---

## 🎯 WORKFLOW TYPE POUR UNE FONCTIONNALITÉ

### 1. Setup (1h)
```bash
# Créer branche
git checkout -b feature/admin-active-substances

# Créer structure dossiers
mkdir -p src/lib/types/admin
mkdir -p src/lib/services/admin
mkdir -p src/lib/validation/schemas/admin
mkdir -p src/lib/hooks/admin
mkdir -p src/app/(app)/admin/active-substances
mkdir -p src/components/admin/active-substances
```

### 2. Types (30min)
```typescript
// /src/lib/types/admin/active-substance.ts
export interface ActiveSubstance { ... }
export interface CreateActiveSubstanceDto { ... }
export interface UpdateActiveSubstanceDto { ... }
```

### 3. Validation (30min)
```typescript
// /src/lib/validation/schemas/admin/active-substance.schema.ts
export const activeSubstanceSchema = z.object({ ... })
export type ActiveSubstanceFormData = z.infer<...>
```

### 4. Service (1-2h)
```typescript
// /src/lib/services/admin/active-substances.service.ts
class ActiveSubstancesService {
  async getAll() { ... }
  async create() { ... }
  async update() { ... }
  async delete() { ... }
}
export const activeSubstancesService = new ActiveSubstancesService()
```

### 5. i18n (1h)
```json
// Ajouter dans fr.json, en.json, ar.json
{
  "activeSubstance": {
    "title": { ... },
    "fields": { ... },
    "validation": { ... },
    "success": { ... },
    "error": { ... }
  }
}
```

### 6. Hook (1h)
```typescript
// /src/lib/hooks/admin/useActiveSubstances.ts
export function useActiveSubstances() {
  // data, loading, error, refetch, create, update, delete
}
```

### 7. Composants (3-4h)
```typescript
// Page liste
// /src/app/(app)/admin/active-substances/page.tsx

// Composant formulaire
// /src/components/admin/active-substances/ActiveSubstanceForm.tsx

// Modale suppression
// /src/components/admin/active-substances/DeleteConfirmModal.tsx
```

### 8. Tests (1-2h)
```typescript
// Service tests
// Hook tests (optionnel)
// Component tests (optionnel)
```

### 9. Build & Test (30min)
```bash
# Build
npm run build
# ✓ Doit réussir

# Test manuel en dev
npm run dev
# Créer, modifier, supprimer, restaurer
```

### 10. Commit & Push (15min)
```bash
git status
git add .
git commit -m "feat(admin): add ActiveSubstances CRUD page with full i18n support"
git push -u origin feature/admin-active-substances
```

**TEMPS TOTAL : ~10-14h par entité**

---

## 📋 CHECKLIST RAPIDE AVANT COMMIT

```bash
☐ Build réussi (npm run build) ?
☐ Aucune valeur en dur ?
☐ Toutes les traductions FR/EN/AR ?
☐ Composants génériques admin utilisés (DataTable/Pagination/DeleteConfirmModal) ?
☐ Types communs utilisés (BaseEntity/PaginatedResponse/CrudService) ?
☐ Constantes HTTP_STATUS utilisées (pas de magic numbers) ?
☐ Validation Zod en place ?
☐ Tous les types TypeScript définis ?
☐ Service utilise apiClient + logger ?
☐ Composant utilise i18n + toast ?
☐ Tests écrits pour code critique ?
☐ Commit message conventionnel ?
☐ Code review (par pair si possible) ?
```

**Si une case n'est pas cochée → NE PAS COMMIT**

---

## 🔧 OUTILS CENTRALISÉS (NE JAMAIS CONTOURNER)

| Outil | Chemin | Usage |
|-------|--------|-------|
| **API Client** | `/src/lib/api/client.ts` | `apiClient.get/post/patch/delete` |
| **Logger** | `/src/lib/utils/logger.ts` | `logger.info/error/warn` |
| **Toast** | `/src/contexts/toast-context.tsx` | `toast.success/error/warning` |
| **i18n** | `/src/lib/i18n/` | `t('key')` |
| **Error Handler** | `/src/lib/utils/api-error-handler.ts` | `handleApiError()` |
| **DataTable** | `/src/components/admin/common/DataTable.tsx` | `<DataTable<T> />` |
| **Pagination** | `/src/components/admin/common/Pagination.tsx` | `<Pagination />` |
| **DeleteConfirmModal** | `/src/components/admin/common/DeleteConfirmModal.tsx` | `<DeleteConfirmModal />` |
| **BaseEntity** | `/src/lib/types/common/api.ts` | `extends BaseEntity` |
| **PaginatedResponse** | `/src/lib/types/common/api.ts` | `PaginatedResponse<T>` |
| **CrudService** | `/src/lib/types/common/api.ts` | `implements CrudService<T, C, U>` |
| **HTTP_STATUS** | `/src/lib/constants/http-status.ts` | `HTTP_STATUS.OK` |

**Ces outils, types et composants sont OBLIGATOIRES et CENTRALISÉS.**
**Ne jamais créer d'alternative ou de bypass.**

---

## 🚀 COMMANDES ESSENTIELLES

```bash
# Développement
npm run dev              # Dev server (port 4000)
npm run build            # Build production (AVANT COMMIT)
npm run start            # Start production

# Tests
npm test                 # Run tests
npm run test:watch       # Watch mode

# Git
git checkout -b feature/[name]    # Nouvelle branche
git add .                         # Add fichiers
git commit -m "type(scope): desc" # Commit conventionnel
git push -u origin [branch]       # Push

# Vérifications
npm run lint             # Lint code
```

---

## 💡 CONSEILS RAPIDES

### DOs ✅
- ✅ Copier un composant existant similaire comme base
- ✅ Réutiliser les patterns existants
- ✅ Demander review avant de push
- ✅ Tester en FR, EN et AR
- ✅ Vérifier responsive (mobile/desktop)

### DON'Ts ❌
- ❌ Recréer DataTable, Pagination ou DeleteConfirmModal
- ❌ Recréer BaseEntity ou ne pas l'étendre
- ❌ Utiliser magic numbers HTTP (200, 404, etc.)
- ❌ Réinventer la roue (réutiliser composants existants)
- ❌ Modifier les fichiers core (apiClient, logger, etc.)
- ❌ Ignorer les erreurs TypeScript
- ❌ Commit code non buildable
- ❌ Oublier les traductions AR

---

## 📞 EN CAS DE DOUTE

1. **Lire ce document**
2. **Consulter `DEVELOPMENT_STANDARDS.md` (version complète)**
3. **Regarder le code existant similaire**
4. **Demander à l'équipe**

---

**Document de référence rapide - Toujours à portée de main !**

**Dernière mise à jour :** 2025-11-30
