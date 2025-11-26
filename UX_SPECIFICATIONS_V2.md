# SPÉCIFICATIONS UX : SYSTÈME DE CONFIGURATION WEB (ANI_TRA)

**Module :** Préférences Fermier & Gestion de Référentiel
**Cible :** Interface Web (Desktop / Tablette) — Usage maison/bureau
**Version :** 2.0
**Date :** 26 Novembre 2025

---

## Table des matières

1. [Vue d'ensemble et Philosophie](#1-vue-densemble-et-philosophie)
2. [Architecture des Données](#2-architecture-des-données)
3. [Phasage de l'implémentation](#3-phasage-de-limplémentation)
4. [Phase 1 : Fondations UX](#4-phase-1--fondations-ux)
5. [Phase 2 : Configuration Fermier](#5-phase-2--configuration-fermier)
6. [Phase 3 : Expérience Formulaires](#6-phase-3--expérience-formulaires)
7. [Phase 4 : Intelligence & Feedback](#7-phase-4--intelligence--feedback)
8. [Éléments Transversaux](#8-éléments-transversaux)
9. [Évolutions Futures (V2)](#9-évolutions-futures-v2)
10. [Spécifications Techniques](#10-spécifications-techniques)

---

## 1. Vue d'ensemble et Philosophie

### 1.1 Le Problème

Dans une application agricole, les listes de données de référence (races, médicaments, vétérinaires, vaccins) sont trop volumineuses (500+ entrées). L'utilisateur perd du temps à chercher ses données habituelles parmi des centaines d'options non pertinentes pour son exploitation.

### 1.2 La Solution : Architecture "Catalogue & Filtre"

Le système repose sur une distinction stricte entre trois niveaux de données :

| Niveau | Propriétaire | Visibilité | Description |
|--------|--------------|------------|-------------|
| **Catalogue Global** | Admin | Tous les utilisateurs | Base de données exhaustive et validée |
| **Sélection Fermier** | Fermier | Fermier uniquement | Sous-ensemble "Favoris" du catalogue global |
| **Données Locales** | Fermier | Fermier uniquement | Ajouts privés créés par le fermier |

### 1.3 Objectif UX Principal

> **L'interface doit s'adapter à l'utilisateur, et non l'inverse.**

Si le fermier élève des poules, il ne doit jamais voir le mot "Vache" dans son usage quotidien. Chaque interaction doit être optimisée pour son contexte spécifique.

### 1.4 Principes Directeurs

1. **Réduction cognitive** : Moins de choix = décisions plus rapides
2. **Flux ininterrompu** : Ne jamais forcer l'utilisateur à quitter son contexte
3. **Feedback immédiat** : Chaque action doit avoir une réponse visuelle claire
4. **Personnalisation progressive** : L'app s'adapte à l'usage au fil du temps
5. **Tolérance aux erreurs** : Permettre l'annulation, avertir sans bloquer

---

## 2. Architecture des Données

### 2.1 Typologie des Données (Scope)

Chaque entité de référence possède un attribut `scope` définissant sa portée :

```typescript
type DataScope = 'GLOBAL_ADMIN' | 'GLOBAL_SUGGESTION' | 'LOCAL';
```

| Scope | Créé par | Visible par | Modifiable par | Cas d'usage |
|-------|----------|-------------|----------------|-------------|
| `GLOBAL_ADMIN` | Admin système | Tous | Admin uniquement | Races officielles, vaccins homologués |
| `GLOBAL_SUGGESTION` | Fermier (proposition) | Tous (après validation) | Admin | Fermier suggère un véto manquant |
| `LOCAL` | Fermier | Fermier créateur uniquement | Fermier créateur | Véto personnel, produit maison |

### 2.2 Multi-ferme

- Un utilisateur peut gérer **plusieurs fermes**
- Les données `LOCAL` sont associées à une **ferme spécifique**, pas à l'utilisateur
- Le changement de ferme active change les données locales visibles

### 2.3 Filtrage par Pays

- Les données universelles (races, vaccins) sont filtrées par **pays** lors de l'onboarding
- Les vétérinaires sont filtrés par **région/wilaya**
- Ce filtrage réduit le catalogue affiché sans supprimer les données

### 2.4 Entités Concernées

| Entité | Scope supporté | Filtrage géographique |
|--------|----------------|----------------------|
| Races | GLOBAL_ADMIN | Par pays |
| Vaccins | GLOBAL_ADMIN, LOCAL | Par pays |
| Médicaments | GLOBAL_ADMIN, LOCAL | Par pays |
| Vétérinaires | GLOBAL_ADMIN, GLOBAL_SUGGESTION, LOCAL | Par région |
| Maladies | GLOBAL_ADMIN | Par pays |

---

## 3. Phasage de l'implémentation

### Vue d'ensemble

```
Phase 1 (Fondations UX)
    ↓
Phase 2 (Configuration Fermier)
    ↓
Phase 3 (Expérience Formulaires)
    ↓
Phase 4 (Intelligence & Feedback)
```

### Résumé par phase

| Phase | Objectif | Livrable principal |
|-------|----------|-------------------|
| **Phase 1** | Le fermier peut démarrer | Wizard + Dashboard adaptatif |
| **Phase 2** | Le fermier peut configurer | Transfer List + Settings |
| **Phase 3** | Le fermier peut saisir vite | Smart Dropdowns + Favoris |
| **Phase 4** | L'app aide le fermier | Validations + Undo + Feedback |

---

## 4. Phase 1 : Fondations UX

### 4.1 Wizard d'Onboarding

#### Déclenchement

- **Condition** : `user.isFirstLogin === true` OU `farm.isConfigured === false`
- **Comportement** : Redirection automatique vers `/onboarding`
- **Bloquant** : Oui, le dashboard n'est pas accessible avant complétion

#### UX Générale

- Mode **plein écran** (focus total, pas de sidebar)
- **Barre de progression** visible : "Étape X sur 4"
- Bouton **"Passer / Configurer plus tard"** discret mais accessible
- Navigation **précédent/suivant** avec validation par étape

#### Étape 1 : Identité & Région (Obligatoire)

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| Pays | Select | Oui | Détermine devise, unités, catalogue filtré |
| Région/Wilaya | Select | Oui | Filtre les vétérinaires |
| Nom de l'exploitation | Input | Oui | Nom affiché dans l'app |

**Comportement Backend :**
- Le pays sélectionné filtre le catalogue global pour les étapes suivantes
- Stockage : `farm.country`, `farm.region`, `farm.name`

#### Étape 2 : Production (Espèces)

**Interface :** Grille de cartes visuelles sélectionnables

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│     🐮      │  │     🐑      │  │     🐐      │  │     🐔      │
│   Bovins    │  │   Ovins     │  │  Caprins    │  │  Volaille   │
│             │  │     ✓       │  │             │  │     ✓       │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

| Propriété | Valeur |
|-----------|--------|
| Sélection | Multiple |
| Minimum | 1 espèce |
| Affichage | 4 colonnes desktop, 2 colonnes tablette |
| État sélectionné | Bordure colorée + icône check |

**Comportement Backend :**
- Stockage : `farm.species[]`
- Filtre les races disponibles aux étapes suivantes

#### Étape 3 : Partenaires (Vétérinaires)

**Interface :**
- Barre de recherche avec autocomplétion
- Liste des vétérinaires filtrés par région (étape 1)
- Possibilité de sélectionner plusieurs vétérinaires

**Cas "Introuvable" :**

```
┌─────────────────────────────────────────────────────┐
│  🔍 Rechercher un vétérinaire...                    │
├─────────────────────────────────────────────────────┤
│  Dr. Benali Ahmed - Alger Centre                    │
│  Dr. Kaci Farid - Blida                             │
├─────────────────────────────────────────────────────┤
│  ➕ Je ne trouve pas mon vétérinaire               │
└─────────────────────────────────────────────────────┘
```

- Clic sur "Je ne trouve pas..." → Formulaire de création simplifié (voir 5.3)
- Création avec scope `LOCAL` ou `GLOBAL_SUGGESTION` selon choix

#### Étape 4 : Résumé & Démarrage

**Affichage :**
```
┌─────────────────────────────────────────────────────┐
│  ✓ Configuration terminée !                         │
├─────────────────────────────────────────────────────┤
│  Exploitation : Ferme Benali                        │
│  Région : Alger                                     │
│  Espèces : Ovins, Volaille                          │
│  Vétérinaires : Dr. Benali (2 sélectionnés)         │
├─────────────────────────────────────────────────────┤
│           [ Accéder à ma ferme →]                   │
└─────────────────────────────────────────────────────┘
```

**Comportement :**
- Bouton CTA principal : "Accéder à ma ferme"
- Mise à jour : `user.isFirstLogin = false`, `farm.isConfigured = true`
- Redirection vers `/dashboard`

---

### 4.2 Dashboard Adaptatif (États Vides)

Le dashboard s'adapte à la maturité de la configuration.

#### Cas A : Démarrage (Aucun animal)

**Condition :** `count(animals) === 0`

**Affichage :**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              🐄 (Illustration)                      │
│                                                     │
│     Bienvenue sur votre espace de gestion !         │
│                                                     │
│     Commencez par enregistrer votre premier         │
│     animal pour accéder à toutes les                │
│     fonctionnalités.                                │
│                                                     │
│     [+ Enregistrer mon premier animal]              │
│                                                     │
│     ── ou ──                                        │
│                                                     │
│     📥 Importer depuis un fichier Excel             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Règles :**
- Pas de graphiques vides
- Illustration accueillante et non technique
- CTA principal très visible
- CTA secondaire pour import

#### Cas B : Configuration Incomplète

**Condition :** `count(animals) > 0` ET (`count(configured_vaccines) === 0` OU `count(configured_vets) === 0`)

**Affichage :** Dashboard normal + Carte d'alerte en haut

```
┌─────────────────────────────────────────────────────┐
│ ⚙️ Conseil : Pour saisir vos soins plus vite,       │
│    configurez votre pharmacie.                      │
│                               [Configurer →]  [✕]   │
└─────────────────────────────────────────────────────┘
```

**Règles :**
- Carte dismissable (le fermier peut la fermer)
- Réapparaît après 7 jours si toujours non configuré
- Lien direct vers la section Settings concernée

#### Cas C : Utilisation Normale

**Condition :** Configuration complète

**Affichage :** Dashboard standard avec :
- KPIs (Animaux, Naissances, Décès, Vaccinations à venir)
- Graphique d'évolution
- Alertes actives
- Activités récentes

#### Cas D : Premier Animal d'une Nouvelle Espèce

**Condition :** Premier animal d'une espèce non encore présente

**Affichage :** Toast informatif après création

```
🎉 Premier bovin ajouté ! Configurez vos races bovines
   pour aller plus vite.                    [Configurer]
```

---

## 5. Phase 2 : Configuration Fermier

### 5.1 Module Settings — Vue d'ensemble

**Accès :** Menu sidebar → "Configuration" ou "Paramètres"

**Design Visuel :**
- Header distinct (fond gris ou couleur différente) pour marquer le contexte "Administratif"
- Sidebar secondaire pour navigation entre sections

**Sections :**
1. Profil utilisateur
2. Informations ferme
3. **Mes Races** ← Transfer List
4. **Mes Vétérinaires** ← Transfer List
5. **Mes Produits** ← Transfer List
6. **Mes Vaccins** ← Transfer List
7. Mes Alertes
8. Langue & Région
9. Sécurité

---

### 5.2 Composant Transfer List (Double Colonne)

#### Anatomie

```
┌─────────────────────────────────────────────────────────────────────┐
│  Mes Vétérinaires                                                   │
├────────────────────────────────┬────────────────────────────────────┤
│  CATALOGUE DISPONIBLE          │  MA SÉLECTION (3)                  │
├────────────────────────────────┼────────────────────────────────────┤
│  🔍 Rechercher...              │                                    │
│  ┌──────────────────────────┐  │  ┌──────────────────────────────┐  │
│  │ Filtres: [Région ▼]      │  │  │ Dr. Benali Ahmed      [🗑️]  │  │
│  └──────────────────────────┘  │  │ Alger Centre                 │  │
│                                │  └──────────────────────────────┘  │
│  ┌──────────────────────────┐  │  ┌──────────────────────────────┐  │
│  │ Dr. Kaci Farid      [+]  │  │  │ Dr. Mansouri Leila 🏠 [🗑️]  │  │
│  │ Blida                    │  │  │ Tipaza (Local)               │  │
│  └──────────────────────────┘  │  └──────────────────────────────┘  │
│  ┌──────────────────────────┐  │  ┌──────────────────────────────┐  │
│  │ Dr. Hamdi Sara      [+]  │  │  │ Dr. Hamdi Sara        [🗑️]  │  │
│  │ Oran                     │  │  │ Oran                         │  │
│  └──────────────────────────┘  │  └──────────────────────────────┘  │
│                                │                                    │
│  ... (liste scrollable)        │                                    │
├────────────────────────────────┴────────────────────────────────────┤
│  ➕ Créer un vétérinaire local                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                              [Annuler] [Enregistrer]│
└─────────────────────────────────────────────────────────────────────┘
```

#### Spécifications Colonne Gauche (Catalogue)

| Élément | Description |
|---------|-------------|
| Barre de recherche | Filtre en temps réel sur nom, ville |
| Filtres | Dropdowns contextuels (Région, Type, Espèce selon entité) |
| Liste | Items du catalogue global (scope GLOBAL_ADMIN) |
| Action par item | Bouton "+" ou drag & drop vers la droite |
| Pagination | Scroll infini ou pagination (si > 50 items) |

#### Spécifications Colonne Droite (Ma Sélection)

| Élément | Description |
|---------|-------------|
| Compteur | "(N)" à côté du titre |
| Liste | Items sélectionnés par le fermier |
| Badge 🏠 | Affiché sur les items `LOCAL` |
| Action par item | Bouton poubelle pour retirer |
| Ordre | Drag & drop pour réorganiser (optionnel) |

#### Spécifications Zone Création

| Élément | Description |
|---------|-------------|
| Position | Bas de la zone, toujours visible |
| Action | Clic → Ouvre formulaire simplifié (voir 5.3) |
| Résultat | Nouvel item ajouté directement dans "Ma Sélection" |

---

### 5.3 Formulaire de Création Locale (Simplifié)

**Contexte :** Quand le fermier ne trouve pas une donnée dans le catalogue et veut la créer.

**Principe :** Formulaire minimal, seulement les champs essentiels.

#### Exemple : Création Vétérinaire Local

| Champ | Type | Obligatoire |
|-------|------|-------------|
| Nom | Input | Oui |
| Prénom | Input | Oui |
| Région | Select | Oui |
| Téléphone | Input | Non |

**Comparaison avec formulaire Admin :**

| Champ | Formulaire Fermier | Formulaire Admin |
|-------|-------------------|------------------|
| Nom/Prénom | ✅ | ✅ |
| Région | ✅ | ✅ |
| Téléphone | Optionnel | ✅ |
| Email | ❌ | ✅ |
| Adresse complète | ❌ | ✅ |
| N° Ordre | ❌ | ✅ |
| Spécialités | ❌ | ✅ |
| Tarifs | ❌ | ✅ |
| Disponibilités | ❌ | ✅ |

**Comportement :**
- Scope automatique : `LOCAL`
- Association automatique à la ferme active
- Ajout immédiat dans "Ma Sélection"

---

### 5.4 Indicateurs Visuels : Données Locales

Dans toutes les listes et dropdowns, les données locales sont identifiées visuellement :

| Indicateur | Signification | Affichage |
|------------|---------------|-----------|
| 🏠 | Donnée locale (privée) | Badge à côté du nom |
| 🔒 | Donnée en attente de validation | Badge pour GLOBAL_SUGGESTION |

**Tooltip au survol :**
- 🏠 → "Donnée privée - Visible uniquement par vous"
- 🔒 → "En attente de validation par l'administrateur"

---

### 5.5 Écran "Mes Alertes"

**Principe :** Grouper les alertes par thématique, pas une liste plate.

```
┌─────────────────────────────────────────────────────┐
│  Mes Alertes                                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SANTÉ                                              │
│  ├─ Rappels vaccinations        [====== ON]        │
│  ├─ Traitements en retard       [OFF ======]       │
│  └─ Fin de délai d'attente      [====== ON]        │
│                                                     │
│  PRODUCTION                                         │
│  ├─ Pesées manquantes (+30j)    [====== ON]        │
│  └─ Animaux sans lot            [OFF ======]       │
│                                                     │
│  ADMINISTRATIF                                      │
│  ├─ Mouvements à déclarer       [====== ON]        │
│  └─ Documents expirés           [OFF ======]       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                         [Enregistrer]│
└─────────────────────────────────────────────────────┘
```

**Composant :** Toggle Switch pour chaque alerte

---

## 6. Phase 3 : Expérience Formulaires

### 6.1 Smart Dropdowns

#### Principe

Dans tous les formulaires de saisie (Soin, Vaccination, Mouvement), les listes déroulantes n'affichent **QUE** les données configurées par le fermier.

#### Contenu

| Source | Affichage |
|--------|-----------|
| Données sélectionnées dans Settings | ✅ Affichées |
| Données du catalogue global non sélectionnées | ❌ Masquées |
| Données locales de la ferme | ✅ Affichées |

#### Tri Intelligent

1. **Favoris épinglés** (section ⭐) — en premier
2. **Plus utilisés** — triés par fréquence d'utilisation
3. **Alphabétique** — pour le reste

#### Anatomie

```
┌─────────────────────────────────────────┐
│  Vétérinaire                        ▼   │
├─────────────────────────────────────────┤
│  ⭐ FAVORIS                              │
│  ├─ Dr. Benali Ahmed                    │
│  └─ Dr. Mansouri Leila 🏠               │
├─────────────────────────────────────────┤
│  RÉCENTS                                │
│  ├─ Dr. Kaci Farid                      │
│  └─ Dr. Hamdi Sara                      │
├─────────────────────────────────────────┤
│  ⚙️ + Ajouter un vétérinaire            │
└─────────────────────────────────────────┘
```

---

### 6.2 Sticky Footer "Ajouter..."

#### Position

- **Fixe** en bas de la liste déroulante
- Toujours visible même en scrollant
- Séparé visuellement (trait ou fond différent)

#### Comportement

1. Clic sur "⚙️ + Ajouter un vétérinaire"
2. **Modale** s'ouvre par-dessus le formulaire en cours
3. Formulaire simplifié de création (voir 5.3)
4. Clic "Enregistrer"
5. Modale se ferme
6. **Nouvel item automatiquement sélectionné** dans le dropdown
7. Le formulaire initial reste intact

#### Importance

> **Ne jamais casser le flux de travail de l'utilisateur.**

Le fermier ne doit pas :
- Perdre sa saisie en cours
- Naviguer vers Settings
- Revenir et recommencer

---

### 6.3 Système de Favoris

#### Épingler un Favori

**Depuis le dropdown :**
- Hover sur un item → Icône ⭐ apparaît
- Clic sur ⭐ → Item ajouté aux favoris
- Confirmation : Toast "Ajouté aux favoris"

**Depuis Settings :**
- Dans la Transfer List (colonne droite)
- Icône ⭐ sur chaque item sélectionné
- Clic pour toggle favori

#### Limite

- Maximum **5 favoris** par type de données
- Au-delà : "Vous avez atteint la limite de favoris. Retirez-en un pour en ajouter."

#### Stockage

```typescript
interface FarmPreferences {
  favorites: {
    veterinarians: string[];  // IDs, max 5
    vaccines: string[];
    medications: string[];
    breeds: string[];
  }
}
```

---

## 7. Phase 4 : Intelligence & Feedback

### 7.1 Validation Croisée (Warnings)

#### Scénario

Le fermier sélectionne un vaccin configuré pour "Bovins" mais l'applique à une "Poule".

#### Comportement

1. **Ne pas bloquer** la saisie (cas exceptionnel possible)
2. Afficher un **warning orange** sous le champ

```
┌─────────────────────────────────────────┐
│  Vaccin : BCG Bovin                 ▼   │
├─────────────────────────────────────────┤
│  ⚠️ Ce produit n'est pas configuré pour │
│     cette espèce.                       │
│     [Ne plus afficher pour ce produit]  │
└─────────────────────────────────────────┘
```

#### Option "Ne Plus Afficher"

- Clic → Ajoute une exception dans les préférences
- L'avertissement ne réapparaîtra plus pour cette combinaison spécifique
- Stockage : `farm.warningExceptions[]`

---

### 7.2 Système de Toasts Hiérarchisés

#### Types

| Type | Couleur | Durée | Fermeture | Exemple |
|------|---------|-------|-----------|---------|
| Succès | 🟢 Vert | 3 secondes | Auto | "Configuration sauvegardée" |
| Warning | 🟠 Orange | 10 secondes | Auto + Croix | "Véto ajouté, téléphone manquant" |
| Erreur | 🔴 Rouge | Persistant | Croix uniquement | "Échec de sauvegarde" |

#### Position

- **Haut droite** de l'écran
- Empilables (max 3 visibles)
- Animation d'entrée/sortie fluide

#### Anatomie

```
┌─────────────────────────────────────────┐
│ ✓  Configuration sauvegardée       [×]  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ⚠️  Vétérinaire ajouté.            [×]  │
│     Téléphone manquant.                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ✕  Échec de sauvegarde.            [×]  │
│     Vérifiez votre connexion.           │
│     [Réessayer]                         │
└─────────────────────────────────────────┘
```

---

### 7.3 Undo / Annuler

#### Déclenchement

Après une action destructive ou modificatrice :
- Suppression d'un élément
- Retrait d'un item de la sélection
- Modification importante

#### Affichage

Toast spécial avec bouton d'action :

```
┌─────────────────────────────────────────┐
│ 🗑️  Animal supprimé.        [Annuler]   │
│     ████████████░░░░                    │
└─────────────────────────────────────────┘
```

| Propriété | Valeur |
|-----------|--------|
| Durée | 10 secondes |
| Barre de progression | Visuelle, décompte |
| Action Annuler | Restaure l'état précédent |
| Après expiration | Suppression définitive |

#### Comportement Technique

1. Action "suppression" → Soft delete (marquage)
2. Affichage toast avec timer
3. Si "Annuler" → Restauration immédiate
4. Si expiration → Hard delete (suppression réelle)

---

### 7.4 États Vides Contextuels

Messages personnalisés selon le contexte.

| Contexte | Message | CTA |
|----------|---------|-----|
| Premier animal | "Enregistrez votre premier animal" | [+ Ajouter] |
| Premier bovin | "Premier bovin ajouté ! Configurez vos races bovines" | [Configurer] |
| Aucun soin ce mois | "Aucun soin enregistré ce mois" | [+ Nouveau soin] |
| Aucun vaccin configuré | "Configurez vos vaccins pour saisir plus vite" | [Configurer] |
| Recherche sans résultat | "Aucun résultat pour 'xxx'" | [Créer 'xxx'] |

---

### 7.5 Skeleton Loaders

#### Principe

Pendant le chargement des données, afficher des "squelettes" animés au lieu d'un spinner ou écran blanc.

#### Application

| Composant | Skeleton |
|-----------|----------|
| Tableau | Lignes grisées animées |
| Cards | Rectangles grisés animés |
| Formulaire | Champs grisés animés |
| Dashboard KPIs | Blocs grisés animés |

#### Animation

- Effet "shimmer" (brillance qui passe de gauche à droite)
- Durée d'animation : 1.5s en boucle
- Couleur : Gris clair (#E5E7EB)

---

## 8. Éléments Transversaux

### 8.1 Différence Admin vs Fermier

| Aspect | Interface Admin | Interface Fermier |
|--------|-----------------|-------------------|
| Accès données | `/data/*` (CRUD complet) | Settings → "Mes..." (Transfer List) |
| Formulaires | Complets (tous les champs) | Simplifiés (essentiel uniquement) |
| Scope création | GLOBAL_ADMIN | LOCAL |
| Validation | Peut valider GLOBAL_SUGGESTION | Peut créer GLOBAL_SUGGESTION |
| Visibilité | Toutes les données | Ses données sélectionnées |

### 8.2 Gestion des Conflits de Noms

**Scénario :** Un fermier crée "Dr. Martin" en LOCAL, puis un admin ajoute "Dr. Martin" en GLOBAL.

**Règle :**
- Les deux coexistent
- Le LOCAL est marqué 🏠
- Le fermier voit les deux dans son catalogue
- Aucune fusion automatique

### 8.3 Accessibilité

| Critère | Implémentation |
|---------|----------------|
| Contraste | Ratio minimum 4.5:1 |
| Navigation clavier | Tab, Enter, Escape fonctionnels |
| Focus visible | Outline visible sur éléments focusés |
| Labels | Tous les champs ont un label associé |
| Erreurs | Annoncées aux lecteurs d'écran |

---

## 9. Évolutions Futures (V2)

Éléments identifiés mais non inclus dans le scope actuel :

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Recherche globale Cmd+K | Barre de recherche universelle | Haute |
| Actions groupées (Bulk) | Sélection multiple + action en lot | Haute |
| Import Drag & Drop | Glisser-déposer fichier Excel | Moyenne |
| Timeline animal | Frise chronologique visuelle | Moyenne |
| Raccourcis clavier | N, E, Suppr, ? | Basse |
| Aide contextuelle | Tooltips explicatifs | Basse |

---

## 10. Spécifications Techniques

### 10.1 Nouveaux Composants à Créer

| Composant | Emplacement | Dépendances |
|-----------|-------------|-------------|
| `OnboardingWizard` | `/components/onboarding/` | Stepper, Progress |
| `TransferList` | `/components/ui/` | Input, Button, Badge |
| `SmartSelect` | `/components/ui/` | Select existant, Dialog |
| `FavoritesStar` | `/components/ui/` | Button, Tooltip |
| `UndoToast` | `/components/ui/` | Toast existant, Progress |
| `SkeletonLoader` | `/components/ui/` | - |
| `EmptyState` | `/components/ui/` | Illustrations |

### 10.2 Modifications de Composants Existants

| Composant | Modification |
|-----------|--------------|
| `Select` | Ajouter sticky footer, sections, favoris |
| `Toast` | Ajouter variantes warning, erreur, undo |
| `Dialog` | Support mode modale par-dessus formulaire |
| `Badge` | Ajouter variante 🏠 local |

### 10.3 Nouvelles Routes

| Route | Description |
|-------|-------------|
| `/onboarding` | Wizard de première connexion |
| `/onboarding/step/[step]` | Étapes individuelles (optionnel) |

### 10.4 Modifications API (Backend)

| Endpoint | Modification |
|----------|--------------|
| `GET /api/reference/*` | Ajouter filtre `scope`, `farmId`, `country` |
| `POST /api/reference/*` | Supporter création avec scope LOCAL |
| `GET /api/farms/:id/preferences` | Nouveau : préférences fermier |
| `PUT /api/farms/:id/preferences` | Nouveau : mise à jour préférences |
| `GET /api/users/:id` | Ajouter `isFirstLogin` |

### 10.5 Nouvelles Structures de Données

```typescript
// Préférences par ferme
interface FarmPreferences {
  id: string;
  farmId: string;
  selectedBreeds: string[];
  selectedVeterinarians: string[];
  selectedVaccines: string[];
  selectedMedications: string[];
  favorites: {
    breeds: string[];
    veterinarians: string[];
    vaccines: string[];
    medications: string[];
  };
  warningExceptions: WarningException[];
  alertSettings: AlertSettings;
  createdAt: Date;
  updatedAt: Date;
}

interface WarningException {
  productId: string;
  speciesId: string;
  createdAt: Date;
}

interface AlertSettings {
  vaccinationReminders: boolean;
  treatmentOverdue: boolean;
  withdrawalPeriod: boolean;
  missingWeights: boolean;
  pendingMovements: boolean;
}
```

---

## Annexe : Checklist de Validation

### Phase 1
- [ ] Wizard onboarding fonctionnel (4 étapes)
- [ ] Redirection automatique première connexion
- [ ] Dashboard état A (aucun animal)
- [ ] Dashboard état B (config incomplète)
- [ ] Dashboard état C (normal)
- [ ] Dashboard état D (nouvelle espèce)

### Phase 2
- [ ] Composant TransferList réutilisable
- [ ] Écran "Mes Races" avec TransferList
- [ ] Écran "Mes Vétérinaires" avec TransferList
- [ ] Écran "Mes Vaccins" avec TransferList
- [ ] Écran "Mes Produits" avec TransferList
- [ ] Formulaire création locale simplifié
- [ ] Badge 🏠 sur données locales
- [ ] Écran "Mes Alertes" groupé

### Phase 3
- [ ] SmartSelect avec contenu filtré
- [ ] Section Favoris dans dropdown
- [ ] Tri par fréquence d'usage
- [ ] Sticky footer "Ajouter..."
- [ ] Modale création sans perte de contexte
- [ ] Sélection automatique après création
- [ ] Épinglage favoris depuis dropdown

### Phase 4
- [ ] Validation croisée espèce/produit
- [ ] Option "Ne plus afficher"
- [ ] Toast succès (3s, auto)
- [ ] Toast warning (10s, croix)
- [ ] Toast erreur (persistant)
- [ ] Undo avec timer visuel
- [ ] Skeleton loaders
- [ ] Messages états vides contextuels

---

**Fin du document**
