import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  TherapeuticIndication,
  CreateTherapeuticIndicationDto,
  UpdateTherapeuticIndicationDto,
} from '@/lib/types/admin/therapeutic-indication'
import type {
  PaginatedResponse,
  PaginationParams,
  CrudService,
} from '@/lib/types/common/api'

/**
 * Paramètres de filtrage pour les indications thérapeutiques
 *
 * ✅ RÈGLE #2 : Étend PaginationParams pour page, limit, sortBy, sortOrder
 */
export interface TherapeuticIndicationFilterParams extends PaginationParams {
  /**
   * Filtrer par produit (foreign key)
   */
  productId?: string

  /**
   * Filtrer par espèce (foreign key)
   */
  speciesId?: string

  /**
   * Filtrer par code pays
   */
  countryCode?: string

  /**
   * Filtrer par voie d'administration (foreign key)
   */
  routeId?: string

  /**
   * Filtrer par statut de vérification
   * - true: Indications vérifiées uniquement
   * - false: Indications non vérifiées uniquement
   * - undefined: Toutes
   */
  isVerified?: boolean

  /**
   * Filtrer par statut actif/inactif
   */
  isActive?: boolean

  /**
   * Recherche full-text (code, pathology)
   */
  search?: string

  /**
   * Champ de tri
   * Options: code, pathology, createdAt
   */
  sortBy?: 'code' | 'pathology' | 'createdAt'

  /**
   * Ordre de tri (asc ou desc)
   */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Service pour gérer les Indications Thérapeutiques (Therapeutic Indications)
 *
 * ✅ RÈGLE #4 : Implémente CrudService<TherapeuticIndication, CreateTherapeuticIndicationDto, UpdateTherapeuticIndicationDto>
 * ✅ RÈGLE #5 : Utilise apiClient pour toutes les requêtes
 * ✅ RÈGLE #5 : Utilise logger pour toutes les erreurs
 * ✅ RÈGLE Section 8.3.24 : Utilise response.meta.total (pas response.total)
 *
 * Pattern: Simple Reference Data (entité la plus complexe)
 * API Base: /api/v1/therapeutic-indications
 */
class TherapeuticIndicationsService implements CrudService<
  TherapeuticIndication,
  CreateTherapeuticIndicationDto,
  UpdateTherapeuticIndicationDto
> {
  private readonly basePath = '/api/v1/therapeutic-indications'

  /**
   * Récupère toutes les indications thérapeutiques (paginées) avec filtres
   *
   * @param params - Paramètres de pagination et filtrage
   * @returns Promise<PaginatedResponse<TherapeuticIndication>>
   */
  async getAll(params: TherapeuticIndicationFilterParams = {}): Promise<PaginatedResponse<TherapeuticIndication>> {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'code',
        sortOrder = 'asc',
        productId,
        speciesId,
        countryCode,
        routeId,
        isVerified,
        isActive,
        search,
      } = params

      // Construire les query params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      // Ajouter les filtres optionnels
      if (productId) queryParams.append('productId', productId)
      if (speciesId) queryParams.append('speciesId', speciesId)
      if (countryCode) queryParams.append('countryCode', countryCode)
      if (routeId) queryParams.append('routeId', routeId)
      if (isVerified !== undefined) queryParams.append('isVerified', isVerified.toString())
      if (isActive !== undefined) queryParams.append('isActive', isActive.toString())
      if (search) queryParams.append('search', search)

      const response = await apiClient.get<PaginatedResponse<TherapeuticIndication>>(
        `${this.basePath}?${queryParams.toString()}`
      )

      logger.info('Therapeutic indications list fetched', {
        total: response.meta.total,
        page,
        limit,
        productId,
        speciesId,
        countryCode,
        routeId,
        isVerified,
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch therapeutic indications list', { error, params })
      throw error
    }
  }

  /**
   * Récupérer une indication thérapeutique par son ID
   *
   * @param id - ID de l'indication
   * @returns Promise<TherapeuticIndication>
   */
  async getById(id: string): Promise<TherapeuticIndication> {
    try {
      const indication = await apiClient.get<TherapeuticIndication>(`${this.basePath}/${id}`)
      logger.info('Therapeutic indication fetched', { id, productId: indication.productId })
      return indication
    } catch (error) {
      logger.error('Failed to fetch therapeutic indication', { error, id })
      throw error
    }
  }

  /**
   * Créer une nouvelle indication thérapeutique
   *
   * @param data - Données de création
   * @returns Promise<TherapeuticIndication>
   */
  async create(data: CreateTherapeuticIndicationDto): Promise<TherapeuticIndication> {
    try {
      const indication = await apiClient.post<TherapeuticIndication>(this.basePath, data)
      logger.info('Therapeutic indication created', { id: indication.id, productId: indication.productId })
      return indication
    } catch (error) {
      logger.error('Failed to create therapeutic indication', { error, data })
      throw error
    }
  }

  /**
   * Mettre à jour une indication thérapeutique existante
   *
   * @param id - ID de l'indication
   * @param data - Données de mise à jour (inclut version pour optimistic locking)
   * @returns Promise<TherapeuticIndication>
   */
  async update(id: string, data: UpdateTherapeuticIndicationDto): Promise<TherapeuticIndication> {
    try {
      const indication = await apiClient.put<TherapeuticIndication>(`${this.basePath}/${id}`, data)
      logger.info('Therapeutic indication updated', { id, productId: indication.productId, version: data.version })
      return indication
    } catch (error) {
      logger.error('Failed to update therapeutic indication', { error, id, data })
      throw error
    }
  }

  /**
   * Supprimer une indication thérapeutique (soft delete)
   *
   * @param id - ID de l'indication
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`)
      logger.info('Therapeutic indication deleted (soft)', { id })
    } catch (error) {
      logger.error('Failed to delete therapeutic indication', { error, id })
      throw error
    }
  }

  /**
   * Restaurer une indication thérapeutique supprimée
   *
   * @param id - ID de l'indication
   * @returns Promise<TherapeuticIndication>
   */
  async restore(id: string): Promise<TherapeuticIndication> {
    try {
      const indication = await apiClient.post<TherapeuticIndication>(`${this.basePath}/${id}/restore`)
      logger.info('Therapeutic indication restored', { id, productId: indication.productId })
      return indication
    } catch (error) {
      logger.error('Failed to restore therapeutic indication', { error, id })
      throw error
    }
  }

  /**
   * Vérifier les dépendances avant suppression
   *
   * @param id - ID de l'indication
   * @returns Promise<Record<string, number>> - Map des entités dépendantes et leur nombre
   *
   * @example
   * {
   *   "treatments": 15,
   *   "treatmentProtocols": 8
   * }
   */
  async checkDependencies(id: string): Promise<Record<string, number>> {
    try {
      const dependencies = await apiClient.get<Record<string, number>>(
        `${this.basePath}/${id}/dependencies`
      )
      logger.info('Therapeutic indication dependencies checked', { id, dependencies })
      return dependencies
    } catch (error) {
      logger.error('Failed to check therapeutic indication dependencies', { error, id })
      throw error
    }
  }

  /**
   * Vérifier (valider) une indication thérapeutique
   *
   * @param id - ID de l'indication
   * @returns Promise<TherapeuticIndication>
   */
  async verify(id: string): Promise<TherapeuticIndication> {
    try {
      const indication = await apiClient.post<TherapeuticIndication>(`${this.basePath}/${id}/verify`)
      logger.info('Therapeutic indication verified', { id, productId: indication.productId })
      return indication
    } catch (error) {
      logger.error('Failed to verify therapeutic indication', { error, id })
      throw error
    }
  }

  /**
   * Révoquer la vérification d'une indication thérapeutique
   *
   * @param id - ID de l'indication
   * @returns Promise<TherapeuticIndication>
   */
  async unverify(id: string): Promise<TherapeuticIndication> {
    try {
      const indication = await apiClient.post<TherapeuticIndication>(`${this.basePath}/${id}/unverify`)
      logger.info('Therapeutic indication unverified', { id, productId: indication.productId })
      return indication
    } catch (error) {
      logger.error('Failed to unverify therapeutic indication', { error, id })
      throw error
    }
  }
}

/**
 * Instance singleton du service Therapeutic Indications
 * ✅ RÈGLE #4 : Export de l'instance, pas de la classe
 */
export const therapeuticIndicationsService = new TherapeuticIndicationsService()
