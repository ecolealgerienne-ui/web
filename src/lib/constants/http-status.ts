/**
 * Codes de statut HTTP standardisés
 *
 * Utiliser ces constantes au lieu de valeurs magiques (200, 404, etc.)
 *
 * @example
 * ```typescript
 * if (response.status === HTTP_STATUS.NOT_FOUND) {
 *   // ...
 * }
 * ```
 */
export const HTTP_STATUS = {
  // 2xx Success
  /** 200 - Requête réussie */
  OK: 200,

  /** 201 - Ressource créée avec succès */
  CREATED: 201,

  /** 204 - Requête réussie sans contenu de réponse */
  NO_CONTENT: 204,

  // 4xx Client Errors
  /** 400 - Requête invalide (erreurs de validation) */
  BAD_REQUEST: 400,

  /** 401 - Non authentifié (token manquant ou invalide) */
  UNAUTHORIZED: 401,

  /** 403 - Non autorisé (pas les permissions) */
  FORBIDDEN: 403,

  /** 404 - Ressource non trouvée */
  NOT_FOUND: 404,

  /** 408 - Timeout de la requête */
  REQUEST_TIMEOUT: 408,

  /** 409 - Conflit (contrainte unique, version, dépendances) */
  CONFLICT: 409,

  /** 422 - Entité non traitable (validation sémantique) */
  UNPROCESSABLE_ENTITY: 422,

  /** 429 - Trop de requêtes (rate limiting) */
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  /** 500 - Erreur serveur interne */
  INTERNAL_SERVER_ERROR: 500,

  /** 502 - Bad Gateway */
  BAD_GATEWAY: 502,

  /** 503 - Service indisponible */
  SERVICE_UNAVAILABLE: 503,

  /** 504 - Gateway Timeout */
  GATEWAY_TIMEOUT: 504,
} as const

/**
 * Type pour les codes de statut HTTP
 */
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS]

/**
 * Vérifie si un statut indique un succès (2xx)
 */
export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300
}

/**
 * Vérifie si un statut indique une erreur client (4xx)
 */
export function isClientError(status: number): boolean {
  return status >= 400 && status < 500
}

/**
 * Vérifie si un statut indique une erreur serveur (5xx)
 */
export function isServerError(status: number): boolean {
  return status >= 500 && status < 600
}

/**
 * Obtient un message par défaut pour un code de statut
 */
export function getDefaultStatusMessage(status: number): string {
  const messages: Record<number, string> = {
    [HTTP_STATUS.OK]: 'Success',
    [HTTP_STATUS.CREATED]: 'Created',
    [HTTP_STATUS.NO_CONTENT]: 'No Content',
    [HTTP_STATUS.BAD_REQUEST]: 'Bad Request',
    [HTTP_STATUS.UNAUTHORIZED]: 'Unauthorized',
    [HTTP_STATUS.FORBIDDEN]: 'Forbidden',
    [HTTP_STATUS.NOT_FOUND]: 'Not Found',
    [HTTP_STATUS.REQUEST_TIMEOUT]: 'Request Timeout',
    [HTTP_STATUS.CONFLICT]: 'Conflict',
    [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
    [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Too Many Requests',
    [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    [HTTP_STATUS.BAD_GATEWAY]: 'Bad Gateway',
    [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    [HTTP_STATUS.GATEWAY_TIMEOUT]: 'Gateway Timeout',
  }

  return messages[status] || 'Unknown Status'
}
