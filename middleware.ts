import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware centralisé pour la protection des routes
 *
 * IMPORTANT: Ce middleware permet de basculer facilement entre:
 * - Mode DEV (AUTH_ENABLED=false): Toutes les routes sont accessibles
 * - Mode PROD (AUTH_ENABLED=true): Protection avec JWT/Keycloak
 *
 * Pour activer la sécurité, il suffit de changer la variable d'environnement:
 * NEXT_PUBLIC_AUTH_ENABLED=true
 */

// Routes publiques (accessibles sans authentification)
const PUBLIC_ROUTES = ['/', '/login']

// Configuration
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true'
const LOGIN_ROUTE = '/login'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignorer les fichiers statiques et API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/favicon.ico') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // Vérifier si la route est publique
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(route)
  })

  // Si la route est publique, laisser passer
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // MODE DEV: Si l'authentification est désactivée, laisser passer
  if (!AUTH_ENABLED) {
    // Ajouter un header pour indiquer le mode dev
    const response = NextResponse.next()
    response.headers.set('X-Auth-Mode', 'dev')
    return response
  }

  // MODE PROD: Vérifier l'authentification
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    // Pas de token, rediriger vers la page de login
    const loginUrl = new URL(LOGIN_ROUTE, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // TODO: Vérifier la validité du token JWT avec Keycloak
  // Pour l'instant, on accepte si le token existe
  try {
    // const isValid = await verifyJWT(token)
    // if (!isValid) {
    //   return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url))
    // }

    const response = NextResponse.next()
    response.headers.set('X-Auth-Mode', 'prod')
    return response
  } catch (error) {
    console.error('Erreur de vérification du token:', error)
    return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url))
  }
}

// Configuration du matcher pour exclure certains chemins
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
