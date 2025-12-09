/**
 * Client API centralisé
 *
 * Toutes les requêtes API doivent passer par ce client pour:
 * - Gestion centralisée de l'URL backend
 * - Ajout automatique du token d'authentification
 * - Logging des erreurs
 * - Gestion des erreurs HTTP
 * - Intercepteurs pour refresh token
 *
 * Usage:
 * import { apiClient } from '@/lib/api/client'
 * const data = await apiClient.get('/animals')
 */

import { logger } from '@/lib/utils/logger'

// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const API_TIMEOUT = 30000 // 30 secondes

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any,
    public url?: string
  ) {
    super(`API Error ${status}: ${statusText}`)
    this.name = 'ApiError'
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number
  skipAuth?: boolean
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    const { timeout = API_TIMEOUT, skipAuth = false, ...fetchOptions } = options

    // Headers par défaut
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    }

    // Ajouter le token d'authentification si présent
    if (!skipAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    // Timeout avec AbortController
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response
    } catch (error: any) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        logger.error('API request timeout', { url, timeout })
        throw new ApiError(408, 'Request Timeout', undefined, url)
      }

      logger.error('API request failed', {
        url,
        errorMessage: error.message,
        errorName: error.name,
        errorType: typeof error,
        error: String(error)
      })
      throw error
    }
  }

  private async handleResponse<T>(response: Response, url: string, method: string): Promise<T> {
    // Vérifier si la réponse est OK
    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = await response.text()
      }

      // Ne pas logger les 404 comme des erreurs (souvent des cas normaux: pas de données)
      // Les services gèrent les 404 individuellement
      if (response.status !== 404) {
        logger.httpError(
          method.toUpperCase(),
          url,
          response.status,
          errorData,
          { statusText: response.statusText }
        )
      }

      throw new ApiError(
        response.status,
        response.statusText,
        errorData,
        url
      )
    }

    // Gérer les réponses vides (204 No Content)
    if (response.status === 204) {
      return undefined as T
    }

    // Parser la réponse JSON
    try {
      const json = await response.json()

      // Le backend NestJS retourne: { success, data, timestamp, meta? }
      // Déballer automatiquement pour simplifier les services
      // Si meta est présent (pagination), retourner { data, meta } au lieu de juste data
      if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
        if ('meta' in json && json.meta) {
          // Réponse paginée : préserver data et meta
          return { data: json.data, meta: json.meta } as T
        }
        return json.data as T
      }

      return json as T
    } catch (error) {
      logger.error('Failed to parse API response', { url, error })
      throw new ApiError(500, 'Invalid JSON response', undefined, url)
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    logger.debug('API GET', { url })

    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      ...options,
    })

    return this.handleResponse<T>(response, url, 'GET')
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    logger.debug('API POST', { url, data })

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    return this.handleResponse<T>(response, url, 'POST')
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    logger.debug('API PUT', { url, data })

    const response = await this.fetchWithTimeout(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    return this.handleResponse<T>(response, url, 'PUT')
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    logger.debug('API PATCH', { url, data })

    const response = await this.fetchWithTimeout(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    return this.handleResponse<T>(response, url, 'PATCH')
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    logger.debug('API DELETE', { url })

    const response = await this.fetchWithTimeout(url, {
      method: 'DELETE',
      ...options,
    })

    return this.handleResponse<T>(response, url, 'DELETE')
  }

  // Upload de fichiers
  async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    options?: RequestOptions
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    logger.debug('API UPLOAD', { url, fileName: file.name })

    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    // Ne pas définir Content-Type pour FormData (le navigateur le fait automatiquement)
    const { headers, ...restOptions } = options || {}

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      body: formData,
      ...restOptions,
    })

    return this.handleResponse<T>(response, url, 'POST')
  }
}

// Instance singleton du client API
export const apiClient = new ApiClient(API_BASE_URL)

// Export de l'URL de base pour usage direct si nécessaire
export { API_BASE_URL }
