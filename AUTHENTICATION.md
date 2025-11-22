# Architecture d'authentification

Ce document explique comment fonctionne le système d'authentification centralisé de l'application.

## 🎯 Objectif

Faciliter le développement en mode non sécurisé (DEV) et permettre un basculement simple vers le mode sécurisé (PROD) avec Keycloak/JWT.

## 🔧 Architecture

### Composants principaux

```
src/
├── lib/
│   └── auth/
│       └── config.ts              # Configuration centralisée
├── contexts/
│   └── auth-context.tsx           # Context React + useAuth hook
├── app/
│   ├── layout.tsx                 # AuthProvider wrapper
│   ├── page.tsx                   # Page d'accueil publique
│   └── login/
│       └── page.tsx               # Page de connexion
└── middleware.ts                  # Protection des routes (serveur)
```

### Flux d'authentification

#### Mode DEV (AUTH_ENABLED=false)
```
1. Utilisateur accède à n'importe quelle page
2. Middleware vérifie AUTH_ENABLED → false
3. Laisse passer sans vérification
4. AuthContext fournit un utilisateur mock
5. Page s'affiche normalement
```

#### Mode PROD (AUTH_ENABLED=true)
```
1. Utilisateur accède à une page protégée
2. Middleware vérifie AUTH_ENABLED → true
3. Vérifie la présence du token JWT
4. Si pas de token → Redirect vers /login
5. Si token valide → Page s'affiche
6. AuthContext fournit l'utilisateur depuis le JWT
```

## 🚀 Utilisation

### Configuration

**Fichier `.env.local`:**
```env
# Mode DEV (par défaut)
NEXT_PUBLIC_AUTH_ENABLED=false

# Mode PROD
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_KEYCLOAK_URL=https://auth.example.com
NEXT_PUBLIC_KEYCLOAK_REALM=ecole-algerienne
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=web-app
```

### Dans les composants

**Accéder aux informations utilisateur:**
```tsx
import { useAuth } from '@/contexts/auth-context'

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>Non connecté</div>
  }

  return (
    <div>
      <p>Bienvenue {user.name}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  )
}
```

**Protection d'une page:**

Les pages dans `src/app/(app)/` sont automatiquement protégées par le middleware.

### Routes publiques vs protégées

**Routes publiques** (accessibles sans authentification):
- `/` - Page d'accueil
- `/login` - Page de connexion

**Routes protégées** (nécessitent authentification en mode PROD):
- `/dashboard`
- `/animals/*`
- `/lots/*`
- `/vaccinations/*`
- `/treatments/*`
- `/reports`
- `/settings`

### Modifier les routes publiques

Éditer `middleware.ts`:
```typescript
const PUBLIC_ROUTES = ['/', '/login', '/about', '/contact']
```

## 📝 Basculement DEV → PROD

### Étape 1: Créer .env.local

```bash
cp .env.local.example .env.local
```

### Étape 2: Activer l'authentification

Dans `.env.local`:
```env
NEXT_PUBLIC_AUTH_ENABLED=true
```

### Étape 3: Configurer Keycloak

```env
NEXT_PUBLIC_KEYCLOAK_URL=https://votre-keycloak.com
NEXT_PUBLIC_KEYCLOAK_REALM=votre-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=votre-client-id
```

### Étape 4: Implémenter l'intégration Keycloak

Les fonctions à compléter dans `src/contexts/auth-context.tsx`:

```typescript
// TODO: Implémenter
async function authenticateWithKeycloak(email: string, password: string) {
  // Appel à Keycloak pour obtenir le token
}

// TODO: Implémenter
async function fetchUserFromToken(token: string) {
  // Décoder le JWT et récupérer les infos utilisateur
}

// TODO: Implémenter
async function verifyJWT(token: string) {
  // Vérifier la validité du token
}
```

### Étape 5: Redémarrer

```bash
npm run dev
```

## 🔐 Sécurité

### Mode DEV
- ⚠️ Aucune vérification de sécurité
- 👤 Utilisateur mock automatique
- 🎨 Indicateur visuel "Mode DEV" dans le header

### Mode PROD
- ✅ Vérification JWT sur chaque requête
- 🔒 Protection des routes par middleware
- 🔄 Système de refresh token
- 👮 Gestion des rôles et permissions

## 📦 Stockage des tokens

**Mode DEV:** Pas de stockage (utilisateur mock en mémoire)

**Mode PROD:**
- Token JWT: `localStorage.auth_token`
- Refresh token: `localStorage.refresh_token`

## 🎨 Indicateurs visuels

### Header
- **Mode DEV:** Badge bleu "Mode DEV" avec animation
- **Mode PROD:** Bouton de déconnexion visible
- Affichage du nom et de la ferme de l'utilisateur

### Page d'accueil
- Bouton "Se connecter" si non authentifié
- Bouton "Accéder au dashboard" si authentifié

## 🔍 Debug

### Vérifier le mode actuel

Console navigateur:
```javascript
console.log('Auth enabled:', process.env.NEXT_PUBLIC_AUTH_ENABLED)
```

### Vérifier l'utilisateur actuel

```tsx
const { user, isAuthenticated } = useAuth()
console.log({ user, isAuthenticated })
```

### Headers de réponse

Le middleware ajoute un header `X-Auth-Mode`:
- `dev` - Mode développement
- `prod` - Mode production

## 📚 Ressources

- [Documentation Keycloak](https://www.keycloak.org/documentation)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [JWT.io](https://jwt.io/) - Décodeur JWT

## ⚙️ Variables d'environnement

| Variable | Requis | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_AUTH_ENABLED` | Oui | Active/désactive la sécurité |
| `NEXT_PUBLIC_KEYCLOAK_URL` | Si PROD | URL de Keycloak |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | Si PROD | Realm Keycloak |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | Si PROD | Client ID Keycloak |

## 🐛 Problèmes courants

### "useAuth must be used within AuthProvider"
**Solution:** Vérifier que `AuthProvider` est bien dans `layout.tsx`

### Redirection infinie vers /login
**Solution:** Vérifier que `/login` est dans `PUBLIC_ROUTES` du middleware

### Token expiré
**Solution:** Implémenter le refresh token automatique dans `auth-context.tsx`
