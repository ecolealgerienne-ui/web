# Instructions pour Claude Code

Ce fichier est lu automatiquement au début de chaque session.

## Contexte Marché

**Marché cible prioritaire : France 🇫🇷**
- Réglementation : normes françaises et européennes (identification bovine, traçabilité)
- Langue principale : Français
- Unités : système métrique (kg, hectares)

**Marché secondaire : Europe 🇪🇺**
- Conformité aux réglementations européennes
- Standards d'élevage UE

> ⚠️ **Note importante** : Ce produit n'est PAS destiné au marché algérien. Toutes les décisions de conception, UX et fonctionnalités doivent être orientées vers les besoins des éleveurs français et européens.

## Stratégie Produit

**Cible : 80% des éleveurs** avec un outil simple et efficace.

**Fonctionnalités "Nice to have" (NON prioritaires) :**
- ❌ Gestion des pâturages / cartographie
- ❌ Rotation des parcelles
- ❌ Traçabilité réglementaire avancée (IPG, EDE)
- ❌ Coût de production détaillé

**Focus : fonctionnalités essentielles bien faites**
- ✅ Gestion du troupeau (animaux, lots)
- ✅ Suivi des poids et croissance (GMQ)
- ✅ Traitements et vaccinations
- ✅ KPIs simples et actionnables

## Règles Critiques

### 1. Création de branche - TOUJOURS depuis main distant
```bash
git fetch origin main
git checkout -b feature/ma-feature origin/main
```
❌ Ne jamais créer une branche depuis le main local (risque de code obsolète)

### 2. Récupération des modifications des sessions précédentes
À chaque nouvelle session, **avant de commencer le travail** :
1. Lister toutes les branches `claude/*` distantes
2. Identifier les branches avec des commits non mergés dans main
3. Merger ces branches dans la nouvelle branche de travail
```bash
git fetch --all
git branch -a | grep "remotes/origin/claude/"
git merge origin/claude/<branch-precedente> --no-edit
```
⚠️ Résoudre les conflits si nécessaire et valider le JSON/TypeScript après merge

### 3. Build obligatoire avant commit
```bash
npm run build  # ou npx tsc --noEmit
```
❌ Ne jamais commiter si le build échoue

### 4. Lire DEVELOPMENT_STANDARDS.md
Avant de développer une nouvelle fonctionnalité, consulter `/DEVELOPMENT_STANDARDS.md` pour :
- Architecture et organisation des fichiers
- Composants génériques (admin vs transactionnel)
- Patterns de services API
- Conventions de nommage

### 5. Traductions
- Créer uniquement les fichiers `_fr.json` (pas en, ar)
- Utiliser `@/lib/i18n` pour les pages transactionnelles
- Utiliser `next-intl` pour les pages admin

### 6. Endpoints API
- Tous les endpoints farm-scoped utilisent le préfixe `/api/v1/`
- Pattern : `/api/v1/farms/{farmId}/<resource>`
