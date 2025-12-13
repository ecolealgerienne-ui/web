# Plan de Travail - Module Pharmacie Simplifié (IHM)

**Date:** 2025-12-13
**Basé sur:** SPEC_IHM_PHARMACIE.md v1.1
**Standards:** DEVELOPMENT_STANDARDS.md v1.10

---

## 1. Analyse de l'Existant

### 1.1 Fichiers à Supprimer (5 entités admin)

| Entité | Page | Component | Service | Type | Hook |
|--------|------|-----------|---------|------|------|
| Active Substances | `src/app/(app)/admin/active-substances/page.tsx` | `src/components/admin/active-substances/ActiveSubstanceFormDialog.tsx` | `src/lib/services/admin/active-substances.service.ts` | `src/lib/types/admin/active-substance.ts` | `src/lib/hooks/admin/useActiveSubstances.ts` |
| Administration Routes | `src/app/(app)/admin/administration-routes/page.tsx` | `src/components/admin/administration-routes/AdministrationRouteFormDialog.tsx` | `src/lib/services/admin/administration-routes.service.ts` | `src/lib/types/admin/administration-route.ts` | `src/lib/hooks/admin/useAdministrationRoutes.ts` |
| Product Categories | `src/app/(app)/admin/product-categories/page.tsx` | `src/components/admin/product-categories/ProductCategoryFormDialog.tsx` | `src/lib/services/admin/product-categories.service.ts` | `src/lib/types/admin/product-category.ts` | `src/lib/hooks/admin/useProductCategories.ts` |
| Product Packagings | `src/app/(app)/admin/product-packagings/page.tsx` | `src/components/admin/product-packagings/ProductPackagingFormDialog.tsx` | `src/lib/services/admin/product-packagings.service.ts` | `src/lib/types/admin/product-packaging.ts` | `src/lib/hooks/admin/useProductPackagings.ts` |
| Therapeutic Indications | `src/app/(app)/admin/therapeutic-indications/page.tsx` | `src/components/admin/therapeutic-indications/TherapeuticIndicationFormDialog.tsx` | `src/lib/services/admin/therapeutic-indications.service.ts` | `src/lib/types/admin/therapeutic-indication.ts` | `src/lib/hooks/admin/useTherapeuticIndications.ts` |

**Total: 25 fichiers à supprimer**

### 1.2 Fichiers à Modifier

| Fichier | Modification |
|---------|--------------|
| `src/components/layout/sidebar.tsx` | Retirer 5 items admin + ajouter Pharmacie |
| `src/lib/i18n/messages/fr.json` | Retirer traductions admin + ajouter pharmacie |
| `src/lib/i18n/messages/en.json` | Idem |
| `src/lib/i18n/messages/ar.json` | Idem (si existe) |

### 1.3 Services Existants à Réutiliser

| Service | Fichier | Utilisation |
|---------|---------|-------------|
| ProductPreferencesService | `src/lib/services/product-preferences.service.ts` | Sélection produits ferme |
| ProductsService (admin) | `src/lib/services/admin/products.service.ts` | Catalogue global |
| TreatmentsService | `src/lib/services/treatments.service.ts` | Création traitements |

### 1.4 Types Existants à Réutiliser

| Type | Fichier |
|------|---------|
| `ProductPreference` | `src/lib/types/product-preference.ts` |
| `Product` | `src/lib/types/admin/product.ts` |
| `Treatment` | `src/lib/types/treatment.ts` |

### 1.5 Fichiers à Créer

```
src/
├── app/(app)/pharmacy/
│   ├── page.tsx                         # Page stock pharmacie
│   └── products/
│       └── page.tsx                     # Page catalogue/sélection
├── components/pharmacy/
│   ├── PharmacyKPICards.tsx             # KPIs (4 cartes)
│   ├── ProductPreferenceCard.tsx        # Carte produit avec lots
│   ├── FarmerLotCard.tsx                # Carte lot individuel
│   ├── LotStatusIndicator.tsx           # Indicateur expiration
│   ├── AddLotDialog.tsx                 # Dialog ajout lot
│   ├── ProductConfigDialog.tsx          # Dialog config produit
│   └── ProductCatalogCard.tsx           # Carte produit catalogue
├── lib/
│   ├── services/
│   │   └── farmer-product-lots.service.ts  # Service lots (si n'existe pas)
│   ├── types/
│   │   └── farmer-product-lot.ts           # Type lot (si n'existe pas)
│   └── hooks/
│       ├── usePharmacy.ts                  # Hook page pharmacie
│       └── useFarmerProductLots.ts         # Hook lots
```

---

## 2. Plan de Travail Détaillé

### Phase 1: Nettoyage (Priorité Haute)

#### Tâche 1.1: Suppression des pages admin inutiles
**Durée estimée:** 30 min
**Fichiers:** 25 fichiers

```bash
# Pages (5)
rm src/app/(app)/admin/active-substances/page.tsx
rm src/app/(app)/admin/administration-routes/page.tsx
rm src/app/(app)/admin/product-categories/page.tsx
rm src/app/(app)/admin/product-packagings/page.tsx
rm src/app/(app)/admin/therapeutic-indications/page.tsx

# Components (5 dossiers)
rm -rf src/components/admin/active-substances/
rm -rf src/components/admin/administration-routes/
rm -rf src/components/admin/product-categories/
rm -rf src/components/admin/product-packagings/
rm -rf src/components/admin/therapeutic-indications/

# Services (5)
rm src/lib/services/admin/active-substances.service.ts
rm src/lib/services/admin/administration-routes.service.ts
rm src/lib/services/admin/product-categories.service.ts
rm src/lib/services/admin/product-packagings.service.ts
rm src/lib/services/admin/therapeutic-indications.service.ts

# Types (5)
rm src/lib/types/admin/active-substance.ts
rm src/lib/types/admin/administration-route.ts
rm src/lib/types/admin/product-category.ts
rm src/lib/types/admin/product-packaging.ts
rm src/lib/types/admin/therapeutic-indication.ts

# Hooks (5)
rm src/lib/hooks/admin/useActiveSubstances.ts
rm src/lib/hooks/admin/useAdministrationRoutes.ts
rm src/lib/hooks/admin/useProductCategories.ts
rm src/lib/hooks/admin/useProductPackagings.ts
rm src/lib/hooks/admin/useTherapeuticIndications.ts
```

**Vérifications:**
- [ ] `npm run build` réussit
- [ ] Aucune référence cassée (grep sur les noms)

#### Tâche 1.2: Mise à jour navigation (sidebar.tsx)
**Durée estimée:** 15 min

**Modifications:**
1. Retirer les 5 items de `adminMenuItems`:
   - `activeSubstances`
   - `administrationRoutes`
   - `productCategories`
   - `productPackagings`
   - `therapeuticIndications`

2. Ajouter dans `menuItems` (après treatments):
```typescript
{ icon: Pill, key: "pharmacy", href: "/pharmacy" },
```

#### Tâche 1.3: Mise à jour i18n
**Durée estimée:** 20 min

**fr.json - Ajouter:**
```json
{
  "navigation": {
    "menu": {
      "pharmacy": "Pharmacie"
    }
  },
  "pharmacy": {
    "title": "Pharmacie",
    "subtitle": "Gestion du stock de médicaments",
    "kpis": {
      "totalProducts": "Produits",
      "lowStock": "Stock bas",
      "expired": "Périmés",
      "totalValue": "Valeur totale"
    },
    "actions": {
      "addLot": "Ajouter un lot",
      "configure": "Configurer",
      "treat": "Traiter",
      "viewDetails": "Voir détails"
    },
    "lot": {
      "title": "Nouveau lot",
      "nickname": "Surnom du lot",
      "officialNumber": "N° de lot officiel",
      "expiryDate": "Date de péremption",
      "expiresSoon": "Expire bientôt",
      "expired": "Périmé"
    },
    "config": {
      "title": "Configuration",
      "customDose": "Dose personnalisée",
      "withdrawalMeat": "Délai d'attente viande (jours)",
      "withdrawalMilk": "Délai d'attente lait (heures)",
      "resetDefaults": "Réinitialiser aux valeurs par défaut",
      "defaultValue": "Défaut: {value}"
    },
    "catalog": {
      "title": "Catalogue Produits",
      "myProducts": "Mes produits sélectionnés",
      "allProducts": "Catalogue complet",
      "add": "Ajouter",
      "remove": "Retirer"
    },
    "empty": {
      "title": "Aucun produit sélectionné",
      "description": "Commencez par sélectionner les produits que vous utilisez.",
      "action": "Parcourir le catalogue"
    }
  }
}
```

**Retirer de navigation.admin:**
- `activeSubstances`
- `administrationRoutes`
- `productCategories`
- `productPackagings`
- `therapeuticIndications`

---

### Phase 2: Page Pharmacie (Priorité Haute)

#### Tâche 2.1: Types et Service FarmerProductLot
**Durée estimée:** 30 min

**Créer:** `src/lib/types/farmer-product-lot.ts`
```typescript
export interface FarmerProductLot {
  id: string;
  configId: string;
  nickname: string;
  officialLotNumber: string;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFarmerProductLotDto {
  nickname: string;
  officialLotNumber: string;
  expiryDate: string;
  isActive?: boolean;
}
```

**Créer:** `src/lib/services/farmer-product-lots.service.ts`
- Pattern: suivre `product-preferences.service.ts`
- Endpoints: `/farms/:farmId/product-configs/:configId/lots`

#### Tâche 2.2: Hook usePharmacy
**Durée estimée:** 30 min

**Créer:** `src/lib/hooks/usePharmacy.ts`
- Fetch `FarmProductPreference[]` avec leurs `FarmerProductLot[]`
- États: loading, error, data
- Actions: refresh

#### Tâche 2.3: Composants UI Pharmacie
**Durée estimée:** 2h

**Ordre de création:**
1. `LotStatusIndicator.tsx` - Simple badge couleur
2. `FarmerLotCard.tsx` - Carte lot (utilise LotStatusIndicator)
3. `ProductPreferenceCard.tsx` - Carte produit avec ses lots
4. `PharmacyKPICards.tsx` - 4 KPI cards
5. `AddLotDialog.tsx` - Dialog formulaire

**Pattern à suivre:**
- Utiliser composants de `@/components/ui/`
- Utiliser `useTranslations('pharmacy')`
- Pas de textes hardcodés

#### Tâche 2.4: Page Pharmacie
**Durée estimée:** 1h

**Créer:** `src/app/(app)/pharmacy/page.tsx`
- Pattern: suivre `src/app/(app)/weighings/page.tsx`
- Composants: PharmacyKPICards, ProductPreferenceCard[]

---

### Phase 3: Page Catalogue (Priorité Haute)

#### Tâche 3.1: Composant ProductCatalogCard
**Durée estimée:** 30 min

**Créer:** `src/components/pharmacy/ProductCatalogCard.tsx`
- Affiche: nom, labo, catégorie, délais
- Actions: Ajouter/Retirer (selon si dans préférences)

#### Tâche 3.2: Page Catalogue
**Durée estimée:** 1h

**Créer:** `src/app/(app)/pharmacy/products/page.tsx`
- Section 1: "Mes produits" (FarmProductPreference)
- Section 2: "Catalogue complet" (Product avec pagination)
- Recherche full-text

---

### Phase 4: Dialogs et Intégration (Priorité Moyenne)

#### Tâche 4.1: ProductConfigDialog
**Durée estimée:** 45 min

**Créer:** `src/components/pharmacy/ProductConfigDialog.tsx`
- Champs: dose, unité, délai viande, délai lait
- API: `PUT /farms/:farmId/product-preferences/:id/config`

#### Tâche 4.2: Lien Traiter → Treatment Dialog
**Durée estimée:** 30 min

**Modifier:** Bouton "Traiter" sur FarmerLotCard
- Ouvre TreatmentDialog existant
- Pré-rempli: productId, farmerLotId

---

## 3. Checklist Conformité DEVELOPMENT_STANDARDS.md

### Pour chaque fichier créé:

- [ ] **Pas de valeurs en dur** (section 1.1)
  - Tous les textes via i18n
  - Pas d'URLs hardcodées

- [ ] **Gestion erreurs centralisée** (section 3)
  - Utiliser `apiClient` (jamais `fetch`)
  - Utiliser `handleApiError()` dans catch

- [ ] **Composants génériques** (section 1.1)
  - Utiliser `DataTable<T>` de `/components/data/common/`
  - Utiliser `Pagination` existant

- [ ] **Types communs** (section 6)
  - Étendre `BaseEntity` si applicable
  - Utiliser `PaginatedResponse<T>`

- [ ] **Pas de composants imbriqués** (section 7.13)
  - Sous-composants en dehors du parent

- [ ] **Build avant commit** (section 11.3)
  - `npm run build` réussit
  - Ou `npx tsc --noEmit`

- [ ] **i18n complet** (section 4)
  - Clés dans fr.json, en.json, ar.json
  - Structure hiérarchique

---

## 4. Ordre d'Exécution Recommandé

| # | Tâche | Dépendances | Durée |
|---|-------|-------------|-------|
| 1 | Tâche 1.1 - Suppression fichiers | - | 30 min |
| 2 | Tâche 1.2 - Sidebar | 1 | 15 min |
| 3 | Tâche 1.3 - i18n | - | 20 min |
| 4 | **BUILD CHECK** | 1, 2, 3 | 5 min |
| 5 | Tâche 2.1 - Types/Service lots | - | 30 min |
| 6 | Tâche 2.2 - Hook usePharmacy | 5 | 30 min |
| 7 | Tâche 2.3 - Composants UI | 6 | 2h |
| 8 | Tâche 2.4 - Page Pharmacie | 7 | 1h |
| 9 | **BUILD CHECK** | 8 | 5 min |
| 10 | Tâche 3.1 - ProductCatalogCard | - | 30 min |
| 11 | Tâche 3.2 - Page Catalogue | 10 | 1h |
| 12 | **BUILD CHECK** | 11 | 5 min |
| 13 | Tâche 4.1 - ProductConfigDialog | 8 | 45 min |
| 14 | Tâche 4.2 - Lien Traiter | 8 | 30 min |
| 15 | **BUILD FINAL + TEST** | 13, 14 | 15 min |

**Durée totale estimée:** ~8h

---

## 5. Risques et Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Références cassées après suppression | Build fail | Grep avant suppression |
| API lots non disponible | Blocage | Vérifier API_SIGNATURES_V2.md |
| Conflits i18n | Erreurs runtime | Tester toutes les langues |
| Performance (trop de requêtes) | UX dégradée | Utiliser SWR/cache |

---

## 6. Critères d'Acceptation

### Phase 1 (Nettoyage)
- [ ] 25 fichiers supprimés
- [ ] Build réussit
- [ ] Navigation fonctionne
- [ ] Pas d'erreurs console

### Phase 2 (Page Pharmacie)
- [ ] Page `/pharmacy` accessible
- [ ] KPIs affichés
- [ ] Liste produits avec lots groupés
- [ ] Ajout lot fonctionne
- [ ] Indicateurs expiration corrects

### Phase 3 (Catalogue)
- [ ] Page `/pharmacy/products` accessible
- [ ] Recherche fonctionne
- [ ] Ajout/Retrait produit fonctionne
- [ ] Pagination fonctionne

### Phase 4 (Intégration)
- [ ] Configuration produit fonctionne
- [ ] Lien vers traitement pré-rempli
