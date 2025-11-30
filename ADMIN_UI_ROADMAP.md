# Roadmap Admin UI - AniTra Web

**Date de création :** 2025-11-30
**Statut :** Phase 3 complétée ✅
**Prochaine étape :** Phase 4 (15 entités admin restantes)

---

## 📊 État d'Avancement Global

| Phase | Description | Statut | Commits | Lignes |
|-------|-------------|--------|---------|--------|
| **Phase 1** | Foundation (types, constantes, error handling) | ✅ Complété | `3a8fe47` | ~400 |
| **Phase 2** | Composants génériques (DataTable, Pagination, DeleteConfirmModal) | ✅ Complété | - | ~800 |
| **Phase 3** | Entité pilote Active-Substances (modèle CRUD complet) | ✅ Complété | `3a8fe47`, `9b104af`, `3ea1c71` | ~1853 |
| **Phase 4** | 15 entités admin restantes | 🔄 À faire | - | ~27,795 (estimé) |
| **Phase 5** | Tests & Documentation | 📋 Planifié | - | - |
| **Phase 6** | Navigation & Menu Admin | 📋 Planifié | - | - |

**Total estimé :** ~30,848 lignes de code

---

## 🎯 Phase 4 : Les 15 Entités Admin Restantes

### 🧬 **Méthodologie : Copy-Paste-Adapt du Modèle Pilote**

Chaque entité suit **EXACTEMENT** le même pattern que Active-Substances :

**Template Pattern (6-8h par entité) :**
```
1. Types (30min)          → /src/lib/types/admin/{entity}.ts
2. Validation Zod (30min) → /src/lib/validation/schemas/admin/{entity}.schema.ts
3. Service CRUD (1-2h)    → /src/lib/services/admin/{entity}.service.ts
4. i18n FR/EN/AR (1h)     → Ajouter namespace dans messages/{fr,en,ar}.json
5. Hook (1h)              → /src/lib/hooks/admin/use{Entity}.ts
6. Form Dialog (1-2h)     → /src/components/admin/{entity}/{Entity}FormDialog.tsx
7. Page Liste (1-2h)      → /src/app/(app)/admin/{entity}/page.tsx
8. Vérifications (30min)  → TypeScript check + commit
```

---

### 📋 **Liste des 16 Entités Admin (Priorité)**

#### **Groupe 1 : Référentiel Produits (Priorité HAUTE)** 🔴
Dépendances : Active-Substances ✅

1. **Products** (Produits vétérinaires)
   - Dépend de : Active-Substances
   - Complexité : **Moyenne** (relations many-to-many substances)
   - Estimation : **8-10h**
   - Champs clés : code, commercialName, laboratoryName, therapeuticForm, dosage, activeSubstances[]

2. **Therapeutic-Indications** (Indications thérapeutiques)
   - Dépend de : Products
   - Complexité : **Simple**
   - Estimation : **6h**
   - Champs clés : code, name, description, targetSpecies[]

3. **Withdrawal-Periods** (Temps d'attente)
   - Dépend de : Products, Therapeutic-Indications
   - Complexité : **Moyenne**
   - Estimation : **7-8h**
   - Champs clés : productId, indicationId, meatDays, milkDays, eggsDays

4. **Dosages** (Posologies)
   - Dépend de : Products, Therapeutic-Indications
   - Complexité : **Moyenne**
   - Estimation : **7-8h**
   - Champs clés : productId, indicationId, speciesId, minDose, maxDose, unit, frequency

#### **Groupe 2 : Référentiel Maladies/Pathologies (Priorité HAUTE)** 🔴

5. **Diseases** (Maladies)
   - Indépendant
   - Complexité : **Simple**
   - Estimation : **6h**
   - Champs clés : code, name, description, symptoms, isMandatoryDeclaration

6. **Disease-Categories** (Catégories de maladies)
   - Dépend de : Diseases
   - Complexité : **Simple**
   - Estimation : **5-6h**
   - Champs clés : code, name, description, parentCategoryId (arborescence)

#### **Groupe 3 : Référentiel Animaux (Priorité MOYENNE)** 🟡

7. **Species** (Espèces)
   - Indépendant
   - Complexité : **Simple**
   - Estimation : **5h**
   - Champs clés : code, nameFr, nameEn, nameAr, category (bovine/ovine/caprine/etc)

8. **Breeds** (Races/Sélections)
   - Dépend de : Species
   - Complexité : **Simple** (déjà existant en farm-scope, adapter pour admin)
   - Estimation : **6h**
   - Champs clés : code, nameFr, nameEn, nameAr, speciesId, origin, characteristics

9. **Animal-Categories** (Catégories d'animaux)
   - Dépend de : Species
   - Complexité : **Simple**
   - Estimation : **5h**
   - Champs clés : code, name, speciesId, ageMin, ageMax (ex: veau, génisse, vache)

#### **Groupe 4 : Référentiel Vétérinaires (Priorité MOYENNE)** 🟡

10. **Veterinarians** (Vétérinaires)
    - Indépendant
    - Complexité : **Moyenne** (contact info, specialties)
    - Estimation : **7h**
    - Champs clés : title, firstName, lastName, licenseNumber, specialties[], contactInfo

11. **Veterinary-Clinics** (Cliniques vétérinaires)
    - Indépendant
    - Complexité : **Simple**
    - Estimation : **6h**
    - Champs clés : name, address, phone, email, region, veterinarianIds[]

#### **Groupe 5 : Référentiel Laboratoires (Priorité BASSE)** 🟢

12. **Laboratories** (Laboratoires pharmaceutiques)
    - Indépendant
    - Complexité : **Simple**
    - Estimation : **5h**
    - Champs clés : code, name, country, contactInfo, certifications[]

13. **Laboratory-Certifications** (Certifications laboratoires)
    - Dépend de : Laboratories
    - Complexité : **Simple**
    - Estimation : **5h**
    - Champs clés : code, name, issuingAuthority, validityPeriod

#### **Groupe 6 : Référentiel Événements (Priorité BASSE)** 🟢

14. **Event-Types** (Types d'événements)
    - Indépendant
    - Complexité : **Simple**
    - Estimation : **5h**
    - Champs clés : code, name, category (health/movement/production), icon, color

15. **Alert-Types** (Types d'alertes)
    - Indépendant
    - Complexité : **Simple**
    - Estimation : **5h**
    - Champs clés : code, name, severity, defaultMessage, triggerConditions

#### **Groupe 7 : Référentiel Géographique (Priorité BASSE)** 🟢

16. **Regions** (Régions/Wilayas)
    - Indépendant
    - Complexité : **Simple**
    - Estimation : **5h**
    - Champs clés : code, nameFr, nameEn, nameAr, country, coordinates

---

## 📅 **Planning par Sprints (Phase 4)**

### **Sprint 1 (Semaine 1) : Référentiel Produits** 🔴
**Objectif :** Compléter le référentiel produits vétérinaires
**Durée estimée :** 28-32h (3-4 jours)

- ✅ Active-Substances (déjà fait)
- ⏳ Products
- ⏳ Therapeutic-Indications
- ⏳ Withdrawal-Periods
- ⏳ Dosages

**Livrable :** CRUD complet pour gestion catalogue produits vétérinaires

---

### **Sprint 2 (Semaine 1) : Référentiel Maladies + Animaux** 🔴🟡
**Objectif :** Référentiels maladies et espèces/races
**Durée estimée :** 22-24h (2-3 jours)

- ⏳ Diseases
- ⏳ Disease-Categories
- ⏳ Species
- ⏳ Breeds
- ⏳ Animal-Categories

**Livrable :** Référentiels sanitaires et zootechniques complets

---

### **Sprint 3 (Semaine 2) : Référentiel Vétérinaires + Divers** 🟡🟢
**Objectif :** Compléter les référentiels secondaires
**Durée estimée :** 28h (3-4 jours)

- ⏳ Veterinarians
- ⏳ Veterinary-Clinics
- ⏳ Laboratories
- ⏳ Laboratory-Certifications
- ⏳ Event-Types
- ⏳ Alert-Types
- ⏳ Regions

**Livrable :** Tous les référentiels admin disponibles

---

## 🎯 Phase 5 : Tests & Documentation

**Durée estimée :** 1-2 jours

### 5.1 Tests Unitaires (Services)
```typescript
// Pour chaque service
describe('ActiveSubstancesService', () => {
  it('should fetch all with pagination', async () => {})
  it('should create with valid data', async () => {})
  it('should update with version check', async () => {})
  it('should handle 409 conflict on duplicate code', async () => {})
})
```

### 5.2 Tests d'Intégration (Hooks)
```typescript
// Pour hooks critiques (Products, Diseases)
describe('useProducts', () => {
  it('should load products on mount', () => {})
  it('should create and refetch', () => {})
})
```

### 5.3 Documentation API Admin
- Documenter tous les endpoints `/api/v1/admin/*`
- Schémas de requête/réponse
- Codes d'erreur spécifiques

---

## 🎯 Phase 6 : Navigation & Menu Admin

**Durée estimée :** 1 jour

### 6.1 Menu Admin Sidebar
```typescript
// /src/components/admin/AdminSidebar.tsx
const adminMenuItems = [
  {
    group: 'Référentiel Produits',
    items: [
      { label: 'Substances Actives', href: '/admin/active-substances', icon: Pill },
      { label: 'Produits', href: '/admin/products', icon: Package },
      { label: 'Indications', href: '/admin/therapeutic-indications', icon: FileText },
      { label: 'Temps d\'attente', href: '/admin/withdrawal-periods', icon: Clock },
      { label: 'Posologies', href: '/admin/dosages', icon: Calculator },
    ],
  },
  {
    group: 'Référentiel Maladies',
    items: [
      { label: 'Maladies', href: '/admin/diseases', icon: AlertCircle },
      { label: 'Catégories', href: '/admin/disease-categories', icon: FolderTree },
    ],
  },
  // ... autres groupes
]
```

### 6.2 Layout Admin
- Header avec breadcrumb
- Sidebar avec navigation
- Permissions admin-only (middleware)

---

## ✅ Checklist Avant Démarrage Sprint 1

- [x] Phase 3 complétée (Active-Substances)
- [x] Documentation mise à jour (DEVELOPMENT_STANDARDS.md section 8.3)
- [x] Modèle pilote validé et testé
- [x] Bonnes pratiques documentées
- [ ] Créer les branches Git pour Sprint 1
- [ ] Préparer les types backend (si nécessaire)
- [ ] Valider schéma base de données Products

---

## 📈 Métriques de Progression

**Formule d'estimation par entité :**
- Simple (5-6h) : ~1150 lignes
- Moyenne (7-8h) : ~1600 lignes
- Complexe (8-10h) : ~2000 lignes

**Total Phase 4 estimé :**
- 16 entités × ~1732 lignes moyenne = **~27,712 lignes**

**Vélocité recommandée :**
- 2-3 entités/jour (si simples)
- 1-2 entités/jour (si moyennes/complexes)

---

## 🚀 Commandes Rapides

```bash
# Démarrer Sprint 1
git checkout -b feature/admin-sprint-1-products

# Pattern de commit par entité
git commit -m "feat(admin): add Products CRUD (Sprint 1 - 2/5)"

# Build check après chaque entité
npx tsc --noEmit

# Push quotidien
git push -u origin feature/admin-sprint-1-products
```

---

## 📞 Points de Synchronisation

**Daily :**
- Fin de journée : commit + push
- Vérifier les erreurs TypeScript
- Mettre à jour cette roadmap (cocher entités terminées)

**Fin de Sprint :**
- Créer PR vers main
- Review complète
- Merge et tag version

---

**Prochaine action demain :** Démarrer Sprint 1 avec **Products** (entité 1/15) 🚀
