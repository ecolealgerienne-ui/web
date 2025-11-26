# 🧪 Guide de Test - AniTra Frontend + Backend

## 📋 Checklist de Démarrage

- [ ] Backend PAPS2 en cours d'exécution sur `http://localhost:3000`
- [ ] Fichier `.env.local` configuré
- [ ] Dépendances npm installées
- [ ] (Optionnel) Base de données peuplée avec `seed-database-100-animals-fr.ps1`

---

## 🚀 Démarrage Rapide

### 1. Vérifier que le backend répond

```bash
# Tester la connexion au backend
./test-api-connection.sh
```

**Résultat attendu :** Des réponses JSON pour chaque endpoint

### 2. Démarrer le frontend

```bash
# Lancer le serveur de développement
npm run dev

# Ou si vous voulez voir les logs détaillés
npm run dev -- --turbo
```

**URL du frontend :** http://localhost:4000

### 3. Tester dans le navigateur

Ouvrez votre navigateur et allez à : **http://localhost:4000**

---

## 🔍 Fonctionnalités à Tester

### ✅ Pages Implémentées (avec API réelle)

1. **Produits Médicaux** - `/data/medications`
   - [ ] Affichage de la liste (global + local)
   - [ ] Filtres (recherche, scope, catégorie)
   - [ ] Chargement et erreurs gérés
   - [ ] Tableau avec toutes les colonnes

2. **Vaccins** - `/data/vaccines`
   - [ ] Affichage de la liste (global + local)
   - [ ] Filtres (recherche, scope, maladie ciblée)
   - [ ] Chargement et erreurs gérés
   - [ ] Tableau avec toutes les colonnes

3. **Vaccinations** - `/vaccinations`
   - [ ] Affichage de la liste
   - [ ] Filtres (recherche, statut, type)
   - [ ] Statistiques en temps réel
   - [ ] Données provenant de l'API (plus de mock)

4. **Traitements** - `/treatments`
   - [ ] Affichage de la liste
   - [ ] Filtres (recherche, statut, type)
   - [ ] Statistiques en temps réel
   - [ ] Données provenant de l'API (plus de mock)

### ✅ Pages Existantes (déjà fonctionnelles)

- **Animaux** - `/animals`
- **Campagnes** - `/data/campaigns`
- **Vétérinaires** - `/data/veterinarians`
- **Races** - `/data/breeds`
- **Fermes** - `/data/farms`

---

## 🐛 Résolution de Problèmes

### Problème 1 : "Failed to fetch"

**Cause :** Le backend n'est pas démarré ou l'URL est incorrecte

**Solution :**
```bash
# Vérifier que le backend répond
curl http://localhost:3000

# Vérifier .env.local
cat .env.local
```

### Problème 2 : "404 Not Found"

**Cause :** Le backend ne retourne aucune donnée

**Solution :**
```bash
# Peupler la base de données
./seed-database-100-animals-fr.ps1 -BaseUrl "http://localhost:3000"
```

### Problème 3 : "CORS Error"

**Cause :** Le backend refuse les requêtes depuis le frontend

**Solution :** Vérifier la configuration CORS du backend pour autoriser `http://localhost:4000`

### Problème 4 : Loading infini

**Cause :** Erreur réseau ou timeout

**Solution :**
```bash
# Vérifier les logs du frontend
# Dans le terminal où tourne `npm run dev`

# Vérifier les logs du navigateur
# F12 > Console et Network tabs
```

---

## 🔧 Configuration Backend Attendue

Le backend PAPS2 doit exposer ces endpoints (selon `API_SIGNATURES_V1.md`) :

### Endpoints Testés par le Frontend

```
GET  /farms/:farmId/medical-products
GET  /farms/:farmId/vaccines
GET  /farms/:farmId/vaccinations
GET  /farms/:farmId/treatments
GET  /farms/:farmId/animals
GET  /farms/:farmId/veterinarians
GET  /farms/:farmId/campaigns
GET  /api/v1/breeds
GET  /api/v1/species
GET  /api/farms
```

### Authentification

Si le backend requiert un token :

1. Modifier `.env.local` :
   ```bash
   NEXT_PUBLIC_AUTH_TOKEN=your-actual-token
   ```

2. Le frontend l'utilisera automatiquement (voir `src/lib/api/client.ts`)

---

## 📊 Données de Test

### farmId par défaut

Le frontend utilise temporairement ce farmId pour les tests :
```
f9b1c8e0-7f3a-4b6d-9e2a-1c5d8f3b4a7e
```

Défini dans : `src/lib/services/*.service.ts` (constante `TEMP_FARM_ID`)

### Script de Seed

Pour peupler avec 100 animaux + données complètes :
```powershell
./seed-database-100-animals-fr.ps1 -BaseUrl "http://localhost:3000"
```

---

## 📝 Logs et Debugging

### Logs Frontend

Le frontend utilise un logger personnalisé :
```bash
# Tous les appels API sont loggés
# Ouvrir la console du navigateur (F12) pour voir
```

### Vérifier les requêtes API

1. Ouvrir DevTools (F12)
2. Aller dans l'onglet **Network**
3. Filtrer par "Fetch/XHR"
4. Recharger la page
5. Voir toutes les requêtes vers `localhost:3000`

---

## ✅ Checklist de Validation

### Backend
- [ ] Backend répond sur `http://localhost:3000`
- [ ] Base de données peuplée
- [ ] CORS configuré pour autoriser `localhost:4000`
- [ ] Tous les endpoints retournent des données valides

### Frontend
- [ ] Frontend démarre sur `http://localhost:4000`
- [ ] Aucune erreur dans la console
- [ ] Les 4 nouvelles pages affichent des données
- [ ] Les filtres fonctionnent
- [ ] Les loading states s'affichent correctement

### Intégration
- [ ] Aucune erreur CORS
- [ ] Les données s'affichent dans toutes les pages
- [ ] Les filtres déclenchent de nouvelles requêtes API
- [ ] Les statistiques sont correctes

---

## 🎯 Prochaines Étapes

Une fois les tests réussis :

1. **Implémenter les formulaires de création/édition**
   - Medical Products
   - Vaccines
   - (Vaccinations et Treatments ont déjà des composants)

2. **Ajouter l'authentification réelle**
   - Login page
   - Token management
   - Protected routes

3. **Tests E2E**
   - Cypress ou Playwright
   - Scénarios utilisateur complets

4. **Optimisations**
   - Pagination
   - Cache des requêtes
   - Debounce sur les filtres

---

**Bon test ! 🚀**
