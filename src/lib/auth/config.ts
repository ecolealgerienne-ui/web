/**
 * Configuration centralisée pour l'authentification
 *
 * MODE DEV: AUTH_ENABLED = false
 * - Toutes les pages accessibles sans authentification
 * - Utilisateur mock pour le développement
 *
 * MODE PROD: AUTH_ENABLED = true
 * - Protection des routes par middleware
 * - Intégration Keycloak avec JWT
 */

export const authConfig = {
  // Flag principal pour activer/désactiver la sécurité
  enabled: process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true',

  // Routes publiques (accessibles sans authentification)
  publicRoutes: ['/', '/login'],

  // Route de redirection après login
  defaultRedirectAfterLogin: '/dashboard',

  // Route de redirection si non authentifié
  loginRoute: '/login',

  // Configuration Keycloak (à remplir plus tard)
  keycloak: {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || '',
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || '',
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || '',
  },
}

// Utilisateur mock pour le mode développement
export const mockUser = {
  id: 'dev-user-1',
  email: 'dev@ecole-algerienne.dz',
  name: 'Utilisateur Dev',
  role: 'super_admin' as const, // Super admin pour accès complet en dev
  farmName: 'Ferme du Val Fleuri',
}

/**
 * ID de la ferme pour le mode développement
 *
 * IMPORTANT: Cette valeur est centralisée ici pour éviter la duplication
 * dans tous les fichiers de services. Modifier uniquement cette valeur
 * pour changer l'ID de la ferme dans toute l'application.
 *
 * En production, cet ID sera récupéré depuis le contexte utilisateur
 * après authentification.
 */
export const TEMP_FARM_ID = 'd3934abb-13d2-4950-8d1c-f8ab4628e762';

// Vérifier si une route est publique
export function isPublicRoute(pathname: string): boolean {
  return authConfig.publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(route)
  })
}
