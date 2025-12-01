# Context Continuation Prompt - Admin UI Development

## 🎯 Current Mission
Continue implementing the remaining 11 admin entities following the sprint plan organized by dependency complexity.

## 📊 Project State

**Project:** AniTra Web - Admin Reference Data UI
**Tech Stack:** Next.js 15.5.6, TypeScript (strict), React 19, Tailwind CSS, next-intl
**Current Branch:** `claude/review-admin-ui-specs-018EWY8FVmADVGdM8UxLtM5d`
**Standards Version:** DEVELOPMENT_STANDARDS.md v1.5
**Build Status:** ✅ Clean (0 TypeScript errors)

## ✅ Completed Entities (5/16)

All following entities have been fully implemented with CRUD, i18n (FR/EN/AR), and DetailSheet:

1. **Active-Substances** ✅ - Pilot entity (Phase 3)
2. **Products** ✅ - Complex entity with many-to-many relations
3. **Product-Categories** ✅ - Simple reference data
4. **Units** ✅ - Simple reference data with enum type
5. **Species** ✅ - Animal species reference

All 5 entities follow:
- Rule 8.3.16: Row click detail view with DetailSheet
- Rule 8.3.17: Relational fields rendering with Badges
- Rule 8.3.18: Numeric fields with translated units
- Rule 4.5: i18n preparation workflow

## 🎯 Sprint Plan for Remaining 11 Entities

### **Sprint 1 - ENTITÉS INDÉPENDANTES** (30-32h, 5 entities)
**Objectif:** Implémenter les entités sans dépendances qui servent de fondation

1. **Countries** (5h) - Pays
   - Fields: code, nameFr, nameEn, nameAr, isoCode2, isoCode3, isActive
   - Pattern: Simple reference data
   - Dépendances: Aucune
   - **RECOMMENDED FIRST** (le plus simple)

2. **Administration-Routes** (5-6h) - Voies d'administration
   - Fields: code, name, description, isActive
   - Pattern: Simple reference data
   - Dépendances: Aucune

3. **Veterinarians** (7h) - Vétérinaires
   - Fields: title, firstName, lastName, licenseNumber, specialties[], contactInfo
   - Pattern: Medium complexity (arrays)
   - Dépendances: Aucune

4. **National-Campaigns** (7h) - Campagnes nationales
   - Fields: code, name, startDate, endDate, targetSpeciesIds[], description, status
   - Pattern: Medium complexity (dates + arrays)
   - Dépendances: Aucune (targetSpeciesIds référence Species déjà fait ✅)

5. **Alert-Templates** (6-7h) - Modèles d'alertes
   - Fields: code, name, severity, defaultMessage, triggerConditions, isActive
   - Pattern: Medium complexity (JSON field)
   - Dépendances: Aucune

---

### **Sprint 2 - DÉPENDANCES SIMPLES** (24-26h, 4 entities)
**Objectif:** Entités avec relations one-to-many simples

6. **Breeds** (6h) - Races/Sélections
   - Fields: code, nameFr, nameEn, nameAr, speciesId, origin, characteristics, isActive
   - Pattern: Simple one-to-many
   - Dépend de: Species ✅

7. **Age-Categories** (5h) - Catégories d'âge
   - Fields: code, name, speciesId, ageMin, ageMax, unit, description, isActive
   - Pattern: Simple one-to-many
   - Dépend de: Species ✅

8. **Product-Packagings** (6-7h) - Conditionnements produits
   - Fields: productId, packagingType, quantity, unitId, barcode, price, isActive
   - Pattern: Medium (two foreign keys)
   - Dépend de: Products ✅, Units ✅

9. **Therapeutic-Indications** (7-8h) - Indications thérapeutiques
   - Fields: code, name, description, targetSpecies[], productIds[], isActive
   - Pattern: Medium (many-to-many via arrays)
   - Dépend de: Products ✅

---

### **Sprint 3 - DÉPENDANCES COMPLEXES** (10h, 2 entities)
**Objectif:** Tables de jonction many-to-many

10. **Breed-Countries** (5h) - Races par pays
    - Fields: breedId, countryId, registrationNumber, isRecognized, metadata
    - Pattern: Junction table
    - Dépend de: Breeds (Sprint 2), Countries (Sprint 1)

11. **Campaign-Countries** (5h) - Campagnes par pays
    - Fields: campaignId, countryId, budget, coordinatorName, status, metadata
    - Pattern: Junction table
    - Dépend de: National-Campaigns (Sprint 1), Countries (Sprint 1)

---

## 📚 Key Rules to Follow (DEVELOPMENT_STANDARDS.md v1.5)

### **Rule 4.5 - i18n Preparation Workflow**
**TOUJOURS suivre cet ordre:**
1. Analyser tous les champs qui seront affichés
2. Créer TOUTES les clés i18n dans FR/EN/AR AVANT l'implémentation UI
3. Vérifier la complétude des traductions
4. Implémenter l'UI en utilisant les clés créées

### **Rule 8.3.16 - Row Click Detail View Pattern**
```typescript
// Handler
const handleRowClick = (item: Entity) => {
  setSelectedItem(item)
  setDetailOpen(true)
}

// Dans DataTable
<DataTable<Entity>
  onRowClick={handleRowClick}
  // ... autres props
/>

// DetailSheet
<DetailSheet<Entity>
  open={detailOpen}
  onOpenChange={setDetailOpen}
  item={selectedItem}
  title={t('title.singular')}
  description={selectedItem?.name}
  fields={[...]}
  actions={<>Edit/Delete buttons</>}
/>
```

### **Rule 8.3.17 - Relational Fields in DetailSheet**
```typescript
// Pattern pour collections (many-to-many)
{
  key: 'activeSubstances',
  label: t('fields.activeSubstances'),
  render: (value) => value && value.length > 0 ? (
    <div className="flex flex-wrap gap-1">
      {value.map((item: any) => (
        <Badge key={item.id} variant="default" className="text-xs">
          {item.code} - {item.name}
        </Badge>
      ))}
    </div>
  ) : '-'
}
```

### **Rule 8.3.18 - Numeric Fields with Units**
```typescript
{
  key: 'withdrawalPeriodMeat',
  label: t('fields.withdrawalPeriodMeat'),
  render: (value) => value ? `${value} ${t('fields.days')}` : '-'
}
```

### **Rule 8.3.13 - Defensive i18n for Enums**
```typescript
// Toujours vérifier que la valeur existe avant d'accéder à la traduction
render: (value) => value ? t(`types.${value}`) : '-'
```

---

## 🎯 Template Pattern (Copy-Paste-Adapt)

**Pour chaque nouvelle entité, suivre CET ORDRE EXACT:**

### 1. Types (30min)
```bash
/src/lib/types/admin/{entity}.ts
```
- Export Entity, CreateEntityDto, UpdateEntityDto, EntityListParams
- Hériter de BaseEntity (id, createdAt, updatedAt, deletedAt, version, isActive)

### 2. Validation Zod (30min)
```bash
/src/lib/validation/schemas/admin/{entity}.schema.ts
```
- createEntitySchema, updateEntitySchema
- Utiliser z.string().min(), z.enum(), z.array(), etc.

### 3. Service CRUD (1-2h)
```bash
/src/lib/services/admin/{entity}.service.ts
```
- getAll, getById, create, update, delete
- Gérer version pour optimistic locking
- Gérer erreurs 409 (conflict), 404, 500

### 4. i18n FR/EN/AR (1h) ⚠️ AVANT L'UI
```bash
/src/lib/i18n/messages/{fr,en,ar}.json
```
Ajouter namespace complet:
```json
"entity": {
  "title": { "singular": "...", "plural": "..." },
  "fields": { "code": "...", "name": "...", ... },
  "actions": { "create": "...", "edit": "...", "delete": "..." },
  "messages": { "noResults": "...", "deleteSuccess": "...", ... }
}
```

### 5. Hook (1h)
```bash
/src/lib/hooks/admin/use{Entity}.ts
```
- useState pour data, total, loading, params
- useEffect pour fetch
- Fonctions create, update, delete avec refetch
- Gestion erreurs avec toast

### 6. Form Dialog (1-2h)
```bash
/src/components/admin/{entity}/{Entity}FormDialog.tsx
```
- useForm avec zodResolver
- Mode création/édition basé sur prop entity
- Tous les champs avec Label + Input/Select/Textarea
- Gestion erreurs avec setError
- Boutons Annuler/Soumettre avec loading state

### 7. Page Liste (1-2h)
```bash
/src/app/(app)/admin/{entity}/page.tsx
```
- Import tous les composants
- useState pour modales (formOpen, deleteDialogOpen, detailOpen)
- Définir columns: ColumnDef<Entity>[]
- Handlers: handleCreate, handleRowClick, handleEdit, handleDeleteClick, handleSubmit, handleDeleteConfirm
- Render: Header + DataTable + FormDialog + DetailSheet + DeleteConfirmModal

### 8. Vérifications (30min)
```bash
npx tsc --noEmit
npm run build
git add . && git commit -m "feat(admin): add {Entity} CRUD (Sprint X - Y/Z)"
```

---

## 🚀 Next Actions

**OPTION 1 - Commencer Sprint 1 avec Countries (RECOMMANDÉ):**
```bash
# Countries est la plus simple, sert de fondation pour Sprint 3
# 1. Créer les types
# 2. Validation Zod
# 3. Service CRUD
# 4. i18n FR/EN/AR (AVANT l'UI!)
# 5. Hook useCountries
# 6. CountryFormDialog
# 7. Page /admin/countries
# 8. Build check + commit
```

**OPTION 2 - Commencer par une autre entité de Sprint 1:**
- Administration-Routes (simple)
- Veterinarians (medium)
- National-Campaigns (medium, dates)
- Alert-Templates (medium, JSON)

**OPTION 3 - Passer directement à Sprint 2 ou 3 (si besoins métier):**
- Breeds, Age-Categories (Sprint 2)
- Product-Packagings, Therapeutic-Indications (Sprint 2)
- Breed-Countries, Campaign-Countries (Sprint 3)

---

## 📝 Important Files References

- **Standards:** `/home/user/web/DEVELOPMENT_STANDARDS.md` (v1.5)
- **Roadmap:** `/home/user/web/ADMIN_UI_ROADMAP.md`
- **Specs:** `/home/user/web/ADMIN_REFERENCE_DATA_UI_SPECS.md`
- **Example pilote:** `/home/user/web/src/app/(app)/admin/active-substances/page.tsx`
- **Example complexe:** `/home/user/web/src/app/(app)/admin/products/page.tsx`
- **i18n FR:** `/home/user/web/src/lib/i18n/messages/fr.json`

---

## 💡 Tips for Success

1. **Toujours commencer par les i18n keys AVANT l'UI** (Rule 4.5)
2. **Copier le modèle pilote active-substances** pour entités simples
3. **Copier products pour relations complexes** (many-to-many, enums)
4. **Build check après chaque entité** (`npx tsc --noEmit`)
5. **Commit atomique par entité** avec message clair
6. **Si erreur MISSING_MESSAGE:** ajouter la clé dans les 3 langues FR/EN/AR
7. **Pour enums:** toujours render défensif `value ? t(\`types.\${value}\`) : '-'`
8. **Pour relations:** utiliser Badge pattern avec code - name
9. **Pour numériques avec unités:** concaténer avec traduction de l'unité

---

## 🎯 Success Criteria

Une entité est considérée complète quand:
- ✅ 0 TypeScript errors (`npx tsc --noEmit`)
- ✅ Build réussit (`npm run build`)
- ✅ Toutes les clés i18n présentes dans FR/EN/AR
- ✅ CRUD complet (Create, Read, Update, Delete)
- ✅ DetailSheet avec onRowClick fonctionnel
- ✅ Validation Zod côté client
- ✅ Gestion erreurs avec toast
- ✅ Code committé avec message clair

---

## 📞 Questions to Answer in New Session

1. **Quel sprint veux-tu commencer?** (1, 2 ou 3)
2. **Quelle entité en premier?** (ex: Countries pour Sprint 1)
3. **Veux-tu que je fasse tout le CRUD d'un coup ou étape par étape?**

---

**État du projet:** Prêt pour phase d'implémentation massive
**Prochaine milestone:** Compléter Sprint 1 (5 entités, 30-32h)
**Objectif final:** 16/16 entités admin complètes avec UI standardisée
