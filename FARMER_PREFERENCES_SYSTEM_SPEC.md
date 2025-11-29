# Spécification du Système de Préférences et Configuration Fermier

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture générale](#architecture-générale)
3. [Écrans de paramètres fermier](#écrans-de-paramètres-fermier)
4. [Utilisation quotidienne](#utilisation-quotidienne)
5. [Système d'alertes](#système-dalerts)
6. [Cas d'usage et scénarios](#cas-dusage-et-scénarios)

---

## Vue d'ensemble

### Contexte
L'application PAPS2 gère les données agricoles des fermiers (animaux, vaccinations, traitements, pesées, etc.). Actuellement, il est nécessaire de simplifier et structurer comment les fermiers configurent leurs préférences sans surcharger l'interface.

### Objectif
Créer un système de configuration où :
- **L'Admin** configure une fois un référentiel maître (catalogue centralisé)
- **Le Fermier** sélectionne parmi ce catalogue SES données pertinentes
- **L'Application** affiche au fermier UNIQUEMENT ce qu'il a sélectionné

### Résultat
- Interface allégée pour le fermier
- Configuration simple avec filtres et recherche
- Cohérence des données à travers l'app

---

## Architecture générale

### 1. Deux mondes séparés

```
┌─────────────────────────────────────────────┐
│               ADMIN PANEL                   │
├─────────────────────────────────────────────┤
│  • Gère référentiel maître                 │
│  • Vétérinaires globaux                    │
│  • Espèces & Races globales                │
│  • Produits & Vaccins                      │
│  • Campagnes nationales                    │
│  • Configure modèles d'alertes             │
│  • Filtre par pays/région                  │
└─────────────────────────────────────────────┘
                      ↓
        (Données maîtres pré-chargées)
                      ↓
┌─────────────────────────────────────────────┐
│           APPLICATION FERMIER               │
├─────────────────────────────────────────────┤
│  PARAMÈTRES (Setup)                         │
│  ├─ Infos de base                           │
│  ├─ Mes vétérinaires (sélection)            │
│  ├─ Mes espèces/races (sélection)           │
│  ├─ Mes vaccins/produits (sélection)        │
│  └─ Mes alertes (on/off)                    │
│                                             │
│  USAGE (Écrans métier)                      │
│  ├─ Animaux → utilise ses espèces/races     │
│  ├─ Vaccinations → utilise ses vaccins      │
│  ├─ Traitements → utilise ses produits      │
│  ├─ Pesées                                  │
│  ├─ Événements                              │
│  ├─ Lots                                    │
│  └─ Dashboard → affiche ses alertes         │
└─────────────────────────────────────────────┘
```

### 2. Flux de données

```
ADMIN crée le catalogue
    ↓
Vétérinaires, Espèces, Races, Vaccins, Produits
    ↓
FERMIER accède à "Paramètres"
    ↓
API retourne : catalogue filtré par pays + ses préférences actuelles
    ↓
FERMIER sélectionne SES données
(avec filtres pour réduire le bruit)
    ↓
Sélections sauvegardées (IDs des données maîtres)
    ↓
LISTES DÉROULANTES reflètent ses sélections
    ↓
DONNÉES TRANSACTIONNELLES liées à ses sélections
(vaccinations, traitements, pesées, animaux, etc.)
    ↓
ALERTES s'affichent selon ses préférences (on/off)
```

### 3. Principes clés

| Principe | Description |
|----------|-------------|
| **Séparation responsabilités** | Admin = données maîtres, Fermier = sélection personnelle |
| **Optionalité** | Tous les paramètres peuvent être laissés vides et complétés après |
| **Simplification** | Filtres + recherche pour éviter les listes géantes |
| **Validation** | Avertir si incohérence (ex: vaccin bovins sans bovins sélectionnés) |
| **Cohérence** | Les listes déroulantes partout = les mêmes données sélectionnées |

---

## Écrans de paramètres fermier

### Écran 1: Infos de base

**Localisation:** Paramètres → Infos de base

**Contenu:**
```
┌────────────────────────────────────────┐
│        INFOS DE BASE                   │
├────────────────────────────────────────┤
│                                        │
│  Devise:           [€ ▼]              │
│  Langue:           [Français ▼]       │
│  Format date:      [DD/MM/YYYY ▼]    │
│  Unités:           [Kilogrammes ▼]    │
│                                        │
│              [Sauvegarder]             │
│                                        │
│  Note: Tous les champs sont optionnels │
│  et peuvent être complétés plus tard   │
└────────────────────────────────────────┘
```

**Comportement:**
- Tous les champs sont **optionnels**
- Les valeurs par défaut sont appliquées si vides
- Sauvegarde immédiate lors de clic "Sauvegarder"

---

### Écran 2: Mes vétérinaires

**Localisation:** Paramètres → Mes vétérinaires

**Contenu et flux:**
```
┌────────────────────────────────────────┐
│       MES VÉTÉRINAIRES                 │
├────────────────────────────────────────┤
│                                        │
│  FILTRES:                              │
│  ┌──────────────────────────────────┐ │
│  │ Région: [Toutes ▼]              │ │
│  │ Spécialité: [Toutes ▼]          │ │
│  │ Recherche: [________________]    │ │
│  └──────────────────────────────────┘ │
│                                        │
│  RÉSULTATS FILTRÉS:                    │
│  ☐ Dr. Pierre Dubois - Île-de-France │
│    Spécialité: Bovins                 │
│                                        │
│  ☑ Dr. Marie Leclerc - PACA           │
│    Spécialité: Ovins & Caprins        │
│                                        │
│  ☐ Dr. Gérard Martin - Occitanie      │
│    Spécialité: Volaille               │
│                                        │
│              [Sauvegarder]             │
└────────────────────────────────────────┘
```

**Filtres disponibles:**
- **Région** : Île-de-France, PACA, Occitanie, Normandie, Nouvelle-Aquitaine, etc.
- **Spécialité** : Bovins, Ovins, Caprins, Volaille, Équins, Apiculture
- **Recherche texte** : par nom du vétérinaire

**Comportement:**
- Checkbox list des résultats filtrés
- Recherche en temps réel (fuzzy match)
- Sélections sauvegardées = liste des IDs

---

### Écran 3: Mes espèces et races

**Localisation:** Paramètres → Mes espèces & races

**Contenu et flux:**
```
┌────────────────────────────────────────┐
│     MES ESPÈCES ET RACES               │
├────────────────────────────────────────┤
│                                        │
│  FILTRES:                              │
│  ┌──────────────────────────────────┐ │
│  │ Espèce: [Bovins ▼]              │ │
│  │ Région: [Toutes ▼]              │ │
│  │ Recherche: [________________]    │ │
│  └──────────────────────────────────┘ │
│                                        │
│  RÉSULTATS FILTRÉS:                    │
│  ☐ Holstein                            │
│  ☑ Montbéliarde                        │
│  ☐ Brune des Alpes                     │
│  ☐ Simmental                           │
│                                        │
│              [Sauvegarder]             │
└────────────────────────────────────────┘
```

**Filtres disponibles:**
- **Espèce** : Bovins, Ovins, Caprins, Volaille, Équins, Apiculture, Autres
- **Région** : Toutes, Île-de-France, PACA, Occitanie, Normandie, etc.
- **Recherche texte** : par nom de race

**Comportement:**
- Grouper par espèce pour clarté
- Filtre espèce change les races affichées
- Sélections sauvegardées = liste des IDs de races

---

### Écran 4: Mes vaccins et produits

**Localisation:** Paramètres → Mes vaccins & produits

**Contenu et flux:**
```
┌────────────────────────────────────────┐
│     MES VACCINS ET PRODUITS            │
├────────────────────────────────────────┤
│                                        │
│  FILTRES:                              │
│  ┌──────────────────────────────────┐ │
│  │ Type: [Tout ▼]                  │ │
│  │ Pour espèce: [Bovins ▼]         │ │
│  │ Région: [Toutes ▼]              │ │
│  │ Recherche: [________________]    │ │
│  └──────────────────────────────────┘ │
│                                        │
│  RÉSULTATS FILTRÉS:                    │
│  ☑ Vaccin FMD - Boehringer             │
│    Type: Vaccin | Espèce: Bovins       │
│                                        │
│  ☐ Vaccin IBR - Elanco                 │
│    Type: Vaccin | Espèce: Bovins       │
│                                        │
│  ☐ Antiparasitaire oral - MSD          │
│    Type: Antiparasitaire | Espèce: All │
│                                        │
│              [Sauvegarder]             │
│                                        │
│  ⚠️  Validation: Si vous sélectionnez  │
│  un vaccin pour Bovins, n'oubliez pas  │
│  de sélectionner au moins une race     │
│  bovine dans "Mes espèces & races"     │
└────────────────────────────────────────┘
```

**Filtres disponibles:**
- **Type** : Vaccin, Antiparasitaire, Antibiotique, Autres
- **Pour espèce** : Bovins, Ovins, Caprins, Volaille, etc.
- **Région** : Toutes, Île-de-France, PACA, Occitanie, Normandie, etc.
- **Recherche texte** : par nom de produit

**Validation intégrée:**
- Si fermier sélectionne vaccin X (pour espèce "Bovins")
- ET il n'a pas sélectionné de race bovine en Écran 3
- → Afficher avertissement : "Vous avez sélectionné un vaccin pour Bovins mais aucune race bovine. Vérifiez vos sélections."

**Comportement:**
- Sélections sauvegardées = liste des IDs de produits

---

### Écran 5: Mes alertes

**Localisation:** Paramètres → Mes alertes

**Contenu et flux:**
```
┌────────────────────────────────────────┐
│         MES ALERTES                    │
├────────────────────────────────────────┤
│                                        │
│  Sélectionnez les alertes à afficher   │
│  sur votre tableau de bord:            │
│                                        │
│  ☐ Animal pas pesé depuis 30 jours     │
│  ☑ Vaccination expirée                 │
│  ☐ Poids anormal détecté               │
│  ☑ Traitement prescrit non appliqué    │
│  ☐ Événement important (naissance)     │
│  ☑ Rappel visite vétérinaire           │
│                                        │
│              [Sauvegarder]             │
│                                        │
│  Note: Les alertes cochées s'afficheront│
│  sur votre tableau de bord et dans     │
│  l'application mobile                  │
└────────────────────────────────────────┘
```

**Comportement:**
- Toggle on/off pour chaque alerte
- Les alertes sont pré-configurées par l'Admin
- Le fermier active/désactive selon ses besoins
- Sauvegarder les préférences d'alertes

---

## Utilisation quotidienne

### Écrans métier et listes déroulantes

Une fois les paramètres configurés, le fermier utilise les écrans métier. Les listes déroulantes affichent **UNIQUEMENT ses sélections**.

#### Exemple 1: Écran Animaux

```
SANS paramètres configurés:
┌──────────────────────────┐
│ Ajouter un animal        │
├──────────────────────────┤
│ Nom: [_________]         │
│ Espèce: [----------]     │ ← Vide ou 100+ races
│ Race: [----------]       │   (accablant)
│ Poids: [_________]       │
└──────────────────────────┘

AVEC paramètres configurés (Écran 3):
┌──────────────────────────┐
│ Ajouter un animal        │
├──────────────────────────┤
│ Nom: [_________]         │
│ Espèce: [Bovins ▼]       │ ← Montbéliarde,
│ Race: [Holstein ▼]       │   Holstein,
│                          │   Brune des Alpes
│ Poids: [_________]       │   (3 options)
└──────────────────────────┘
```

#### Exemple 2: Écran Vaccinations

```
AVEC paramètres configurés (Écran 4):
┌─────────────────────────────┐
│ Enregistrer une vaccination │
├─────────────────────────────┤
│ Animal: [Bossali ▼]         │
│ Vaccin: [FMD ▼]             │ ← Uniquement les vaccins
│ Date: [24/11/2024]          │   sélectionnés par le fermier
│ Vétérinaire: [Dr. Fatima ▼] │ ← Uniquement ses vétérinaires
│                             │
│        [Enregistrer]        │
└─────────────────────────────┘
```

#### Exemple 3: Écran Traitements

```
AVEC paramètres configurés (Écran 4):
┌──────────────────────────────┐
│ Enregistrer un traitement    │
├──────────────────────────────┤
│ Animal: [Bessam ▼]           │
│ Produit: [Antiparasitaire ▼] │ ← Uniquement ses produits
│ Date: [24/11/2024]           │
│ Dosage: [_________]          │
│                              │
│       [Enregistrer]          │
└──────────────────────────────┘
```

### Structures de données stockées

**Préférences Fermier (Profil):**
```json
{
  "fermier_id": 123,
  "preferences": {
    "devise": "EUR",
    "langue": "fr",
    "format_date": "DD/MM/YYYY",
    "unite_poids": "kg",
    "selected_veterinarians": [1, 5, 12],     // IDs
    "selected_species_breeds": [101, 102, 104], // IDs
    "selected_products": [201, 203, 205],     // IDs
    "selected_alerts": [
      "animal_not_weighed_30d",
      "vaccination_expired",
      "treatment_not_applied"
    ]
  }
}
```

**Données transactionnelles (exemple - Vaccination):**
```json
{
  "vaccination_id": 5001,
  "animal_id": 50,
  "product_id": 203,        // ← Doit être dans selected_products
  "veterinarian_id": 5,     // ← Doit être dans selected_veterinarians
  "date": "2024-11-24",
  "notes": "..."
}
```

---

## Système d'alertes

### Configuration par l'Admin

L'Admin configure une fois les modèles d'alertes. Exemples :

| ID | Alerte | Logique | Affichage |
|----|----|---------|-----------|
| 1 | Animal pas pesé depuis 30j | Si dernier pesée > 30j | Warning |
| 2 | Vaccination expirée | Si date expiration < aujourd'hui | Erreur |
| 3 | Poids anormal | Si poids en dehors des normes de race | Warning |
| 4 | Traitement non appliqué | Si traitement prescrit depuis X jours sans confirmation | Warning |
| 5 | Rappel visite vétérinaire | Si pas de visite depuis 90j | Info |

### Activation par le Fermier

Le fermier, en Écran 5 (Mes alertes), **active/désactive les alertes** selon ses besoins.

### Affichage dans l'App

Les alertes activées s'affichent :
- **Sur le Dashboard** : espace dédié avec icônes et statut
- **Sur l'App mobile** : visibles dans l'interface générale (in-app, pas de notifications push)
- **Code couleur** : Rouge (critique), Orange (attention), Bleu (info)

**Exemple Dashboard:**
```
┌────────────────────────────────────────┐
│          ALERTES ACTIVES               │
├────────────────────────────────────────┤
│                                        │
│  🔴 2 animaux non pesés depuis 30j    │
│  🟠 1 vaccination expirée              │
│  🟠 3 traitements non appliqués        │
│  🔵 Rappel visite vétérinaire          │
│                                        │
│  [Voir les détails]                    │
└────────────────────────────────────────┘
```

---

## Cas d'usage et scénarios

### Scénario 1: Fermier novice (Ferme mixte)

**Contexte:** Pierre a une petite ferme en Nouvelle-Aquitaine avec bovins, ovins et volaille. C'est sa première utilisation.

**Flux:**
1. Pierre se connecte → reçoit message de bienvenue
2. Il accède à "Paramètres" → voit les 5 écrans
3. **Écran 1** : Configure devise (EUR), langue (Français), format date (DD/MM/YYYY)
4. **Écran 2** : Cherche vétérinaires → filtre par région (Nouvelle-Aquitaine) → sélectionne 2 vétérinaires
5. **Écran 3** : Sélectionne espèces (Bovins, Ovins) → sélectionne races (Holstein, Montbéliarde, Mérinos)
6. **Écran 4** : Filtre vaccins pour Bovins et Ovins → sélectionne 3 vaccins courants
7. **Écran 5** : Active alertes pertinentes (pas pesé 30j, vaccination expirée, visite vétérinaire)
8. Sauvegarde → retour à l'accueil

**Résultat:** Pierre voit uniquement ses données. Quand il ajoute un animal, le dropdown espèce = Bovins, Ovins. Quand il vaccine, le dropdown vaccin = ses 3 vaccins.

---

### Scénario 2: Fermier spécialisé (Éleveur de volaille)

**Contexte:** Sandrine élève uniquement de la volaille (poules, dindes) en Normandie. Elle veut une config simple et pertinente.

**Flux:**
1. Accède à Paramètres
2. **Écran 1** : Configure de base (devise EUR, langue)
3. **Écran 2** : Sélectionne 1 vétérinaire (spécialisé volaille)
4. **Écran 3** : Filtre par espèce "Volaille" → sélectionne races (Poule pondeuse, Dinde blanche)
5. **Écran 4** : Filtre pour "Volaille" → sélectionne 4-5 vaccins volaille
6. **Écran 5** : Active alertes : vaccination expirée, poids anormal, pas pesé 30j

**Résultat:** Interface complètement allégée. Sandrine ne voit que ce qui concerne la volaille.

---

### Scénario 3: Ajout d'une nouvelle race après le setup

**Contexte:** Jean a configuré ses paramètres il y a 2 mois. Maintenant il veut ajouter une race bovine supplémentaire à son élevage en PACA.

**Flux:**
1. Retourne en Paramètres → Écran 3
2. Décocher/recocher les races qu'il utilise
3. Ajoute la nouvelle race (si elle existe dans le catalogue, il la sélectionne)
4. Sauvegarde

**Résultat:** Immédiatement disponible dans les listes déroulantes de l'app.

---

### Scénario 4: Validation d'incohérence

**Contexte:** Marc sélectionne un vaccin pour "Bovins" mais n'a pas sélectionné de race bovine.

**Flux:**
1. En Écran 4, sélectionne "Vaccin Rhinotrachéite Infectieuse Bovine (pour Bovins)"
2. Sauvegarde
3. **Système affiche avertissement** : "Vous avez sélectionné un vaccin pour Bovins, mais aucune race bovine en Écran 3. Vérifiez vos sélections."
4. Marc retourne en Écran 3 → sélectionne une race bovine
5. Validation résolue

---

### Scénario 5: Modification après utilisation

**Contexte:** Sophie a utilisé l'app pendant 3 mois en Île-de-France. Elle veut désactiver les alertes de "poids anormal" car elle trouve ça trop bruyant.

**Flux:**
1. Paramètres → Écran 5
2. Décocher "Poids anormal"
3. Sauvegarde

**Résultat:** L'alerte n'apparaît plus sur le dashboard.

---

## Récapitulatif des avantages

| Point | Avantage |
|-------|----------|
| **Charge Admin** | Une fois : créer le catalogue pour tous les fermiers |
| **Charge Fermier** | Léger : sélectionner ses données + on/off alertes |
| **UX** | Filtres + recherche = listes déroulantes compréhensibles |
| **Cohérence** | Toute l'app reflète les sélections du fermier |
| **Optionalité** | Fermier peut configurer progressivement |
| **Validation** | Système prévient les incohérences |
| **Scalabilité** | Admin ajoute des données → tous les fermiers en bénéficient |

---

**Version:** 1.0
**Date:** 2024-11-24
**Statut:** Spécification validée
