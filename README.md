# AniTra Web - Dashboard de Gestion du Cheptel

Application web moderne de gestion du cheptel pour éleveurs, construite avec Next.js 14 et Material Design 3.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20+
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000
```

### Docker (Optionnel)

```bash
# Avec docker-compose
docker-compose up web

# Accès : http://localhost:3000
```

## 🏗️ Stack Technique

- **Framework** : Next.js 15 (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS
- **Composants UI** : shadcn/ui (Material Design 3)
- **Icons** : Lucide React
- **Charts** : Recharts
- **Theme** : next-themes (Light/Dark mode)

## 📂 Structure du Projet

```
src/
├── app/
│   ├── dashboard/           # Page dashboard
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Styles globaux
├── components/
│   ├── ui/                 # Composants shadcn/ui (Card, Button, Badge)
│   ├── layout/             # Layout (Sidebar, Header)
│   └── dashboard/          # Composants dashboard (KPI, Charts, Alerts)
└── lib/
    ├── data/               # Mock data
    └── utils.ts            # Utilities
```

## 🎨 Design System

### Palette de Couleurs
- **Primary (Vert)** : `#059669` - Représente la nature et l'agriculture
- **Success** : `#22c55e`
- **Warning** : `#eab308`
- **Destructive** : `#ef4444`

### Thème
- **Light Mode** : Par défaut (idéal pour utilisation extérieure sur tablette)
- **Dark Mode** : Disponible via toggle en haut à droite

## 📊 Dashboard Features (MVP)

### KPI Cards
- Total d'animaux
- Naissances (30 derniers jours)
- Décès (30 derniers jours)
- Vaccinations à faire

### Graphique
- Évolution du cheptel sur 6 mois (Line Chart)

### Sections
- **Alertes Actives** : Vaccinations en retard, Traitements à compléter, Pesées dues
- **Activités Récentes** : Historique des dernières actions

## 🔄 État Actuel

**Version** : MVP 0.1.0

**Statut** : Dashboard minimaliste avec mock data

**Fonctionnalités implémentées** :
- ✅ Layout avec Sidebar et Header
- ✅ Dashboard avec KPI cards
- ✅ Graphique d'évolution
- ✅ Alertes et activités
- ✅ Dark/Light mode toggle
- ✅ Design responsive (desktop + mobile)

**Non implémenté (à venir)** :
- ⏳ Authentification (NextAuth + Keycloak)
- ⏳ Connexion API backend
- ⏳ Internationalisation (FR/AR)
- ⏳ Pages : Animaux, Lots, Vaccinations, Traitements, Rapports, Paramètres
- ⏳ Gestion multi-tenant (farmId)

## 🔧 Configuration

### Variables d'Environnement

Créer un fichier `.env.local` :

```env
# API Backend (à venir)
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001

# Auth (à venir)
NEXT_PUBLIC_AUTH_ENABLED=false
KEYCLOAK_ENABLED=false
KEYCLOAK_CLIENT_ID=
KEYCLOAK_CLIENT_SECRET=
KEYCLOAK_ISSUER=
```

## 📱 Responsive Design

- **Desktop** : Sidebar permanente
- **Tablet** : Sidebar cachée, logo dans header
- **Mobile** : Layout optimisé pour petits écrans

## 🎯 Prochaines Étapes

1. **Backend Integration** : Connecter aux endpoints NestJS
2. **Authentification** : Setup NextAuth + Keycloak
3. **Pages** : Développer les pages Animaux, Lots, etc.
4. **i18n** : Ajouter support FR/AR
5. **Docker** : Setup complet avec hot reload

## 🤝 Contribution

Pour l'instant, projet en développement actif.

## 📄 License

Propriétaire - AniTra

---

**Fait avec ❤️ pour les éleveurs algériens**
