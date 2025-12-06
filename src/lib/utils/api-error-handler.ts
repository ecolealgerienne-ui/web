/**
 * Helper centralisé pour la gestion des erreurs API
 *
 * Gère automatiquement :
 * - Affichage des toasts d'erreur
 * - Logging des erreurs
 * - Messages i18n
 * - Cas spéciaux (409 Conflict, 400 Validation, etc.)
 */

import { ApiError } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import { HTTP_STATUS } from '@/lib/constants/http-status'

/**
 * Interface pour le contexte Toast
 * (pour éviter la dépendance circulaire)
 */
interface ToastContext {
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

/**
 * Formate les dépendances pour affichage utilisateur
 *
 * @param dependencies - Objet des dépendances {entity: count}
 * @returns Message formaté
 *
 * @example
 * ```typescript
 * formatDependencies({ therapeuticIndications: 12 })
 * // → "12 indication(s) thérapeutique(s)"
 * ```
 */
function formatDependencies(dependencies: Record<string, number>): string {
  const parts: string[] = []

  for (const [entityKey, count] of Object.entries(dependencies)) {
    // Convertir camelCase en texte lisible
    // therapeuticIndications → therapeutic indications
    const readable = entityKey
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .trim()

    parts.push(`${count} ${readable}`)
  }

  return parts.join(', ')
}

/**
 * Gère une erreur API de manière centralisée
 *
 * Cette fonction :
 * 1. Identifie le type d'erreur (400, 404, 409, 500, etc.)
 * 2. Affiche un toast approprié avec message i18n
 * 3. Log l'erreur dans la console et services externes
 *
 * @param error - Erreur capturée (ApiError ou Error générique)
 * @param context - Contexte de l'erreur (ex: "create active substance")
 * @param toast - Contexte Toast pour afficher les notifications
 * @param customMessages - Messages i18n personnalisés (optionnel)
 *
 * @example
 * ```typescript
 * try {
 *   await service.create(data)
 * } catch (error) {
 *   handleApiError(error, 'create active substance', toast)
 * }
 * ```
 */
export function handleApiError(
  error: unknown,
  context: string,
  toast: ToastContext,
  customMessages?: {
    400?: string
    404?: string
    409?: string
    500?: string
  }
): void {
  // Logger l'erreur dans tous les cas
  logger.error(`API error in ${context}`, { error })

  // Si c'est une ApiError, traiter selon le code de statut
  if (error instanceof ApiError) {
    const { status, data } = error

    switch (status) {
      case HTTP_STATUS.BAD_REQUEST: {
        // 400 - Erreurs de validation
        const validationMessages = Array.isArray(data?.message)
          ? data.message
          : [data?.message || 'common.error.validation']

        toast.error(
          customMessages?.[400] || 'common.error.validation',
          validationMessages.join('\n')
        )
        break
      }

      case HTTP_STATUS.UNAUTHORIZED: {
        // 401 - Non authentifié
        toast.error('common.error.unauthorized', 'common.error.unauthorized.message')
        // Optionnel : Redirect vers login
        // window.location.href = '/login'
        break
      }

      case HTTP_STATUS.FORBIDDEN: {
        // 403 - Non autorisé
        toast.error('common.error.forbidden', 'common.error.forbidden.message')
        break
      }

      case HTTP_STATUS.NOT_FOUND: {
        // 404 - Ressource non trouvée
        toast.error(
          customMessages?.[404] || 'common.error.notFound',
          'common.error.notFound.message'
        )
        break
      }

      case HTTP_STATUS.REQUEST_TIMEOUT: {
        // 408 - Timeout
        toast.error('common.error.timeout', 'common.error.timeout.message')
        break
      }

      case HTTP_STATUS.CONFLICT: {
        // 409 - Conflit (unique, version, dépendances)
        if (data?.dependencies) {
          // Cas spécial : Dépendances empêchant la suppression
          const dependenciesText = formatDependencies(data.dependencies)
          toast.warning(
            'common.error.hasDependencies',
            `Impossible de supprimer : ${dependenciesText}`
          )
        } else if (data?.message?.includes('version')) {
          // Cas spécial : Conflit de version (optimistic locking)
          toast.warning(
            'common.error.versionConflict',
            'Les données ont été modifiées par un autre utilisateur. Veuillez recharger.'
          )
        } else {
          // Conflit générique (ex: contrainte unique)
          toast.error(
            customMessages?.[409] || 'common.error.conflict',
            data?.message || 'Un conflit est survenu'
          )
        }
        break
      }

      case HTTP_STATUS.TOO_MANY_REQUESTS: {
        // 429 - Rate limiting
        toast.warning('common.error.tooManyRequests', 'Trop de requêtes, veuillez patienter')
        break
      }

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.BAD_GATEWAY:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
      case HTTP_STATUS.GATEWAY_TIMEOUT: {
        // 5xx - Erreurs serveur
        toast.error(
          customMessages?.[500] || 'common.error.serverError',
          'Une erreur serveur est survenue. Veuillez réessayer.'
        )
        break
      }

      default: {
        // Erreur HTTP non gérée
        toast.error(
          'common.error.unknown',
          `Erreur ${status}: ${data?.message || 'Une erreur est survenue'}`
        )
      }
    }
  } else if (error instanceof Error) {
    // Erreur JavaScript générique (network, etc.)
    if (error.name === 'AbortError') {
      toast.error('common.error.timeout', 'La requête a expiré')
    } else if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
      toast.error('common.error.network', 'Erreur réseau : vérifiez votre connexion')
    } else {
      toast.error('common.error.unknown', error.message || 'Une erreur est survenue')
    }
  } else {
    // Erreur inconnue
    toast.error('common.error.unknown', 'Une erreur inattendue est survenue')
  }
}

/**
 * Vérifie si une erreur API indique que la ressource n'existe pas
 */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === HTTP_STATUS.NOT_FOUND
}

/**
 * Vérifie si une erreur API indique un conflit (contrainte unique, etc.)
 */
export function isConflictError(error: unknown): boolean {
  return error instanceof ApiError && error.status === HTTP_STATUS.CONFLICT
}

/**
 * Vérifie si une erreur API indique des erreurs de validation
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof ApiError && error.status === HTTP_STATUS.BAD_REQUEST
}

/**
 * Extrait les messages de validation d'une erreur 400
 */
export function getValidationMessages(error: unknown): string[] {
  if (error instanceof ApiError && error.status === HTTP_STATUS.BAD_REQUEST) {
    const { data } = error
    return Array.isArray(data?.message) ? data.message : [data?.message || 'Erreur de validation']
  }
  return []
}
