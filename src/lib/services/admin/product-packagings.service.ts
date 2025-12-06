import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  ProductPackaging,
  CreateProductPackagingDto,
  UpdateProductPackagingDto,
} from '@/lib/types/admin/product-packaging'
import type {
  PaginatedResponse,
  PaginationParams,
  CrudService,
} from '@/lib/types/common/api'

/**
 * Paramètres de filtrage pour les conditionnements de produits
 *
 * ✅ RÈGLE #2 : Étend PaginationParams pour page, limit, sortBy, sortOrder
 */
export interface ProductPackagingFilterParams extends PaginationParams {
  /**
   * Filtrer par produit (foreign key)
   * Pattern: Scoped Reference Data
   */
  productId?: string

  /**
   * Filtrer par code pays
   */
  countryCode?: string

  /**
   * Filtrer par code GTIN/EAN
   */
  gtinEan?: string

  /**
   * Filtrer par statut actif/inactif
   */
  isActive?: boolean

  /**
   * Recherche full-text (packagingLabel, gtinEan, numeroAMM)
   */
  search?: string

  /**
   * Champ de tri
   * Options: packagingLabel, countryCode, concentration, gtinEan, createdAt
   */
  sortBy?: 'packagingLabel' | 'countryCode' | 'concentration' | 'gtinEan' | 'createdAt'

  /**
   * Ordre de tri (asc ou desc)
   */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Service pour gérer les Conditionnements de Produits (Product Packagings)
 *
 * ✅ RÈGLE #4 : Implémente CrudService<ProductPackaging, CreateProductPackagingDto, UpdateProductPackagingDto>
 * ✅ RÈGLE #5 : Utilise apiClient pour toutes les requêtes
 * ✅ RÈGLE #5 : Utilise logger pour toutes les erreurs
 * ✅ RÈGLE Section 8.3.24 : Utilise response.meta.total (pas response.total)
 *
 * Pattern: Scoped Reference Data (Scope: Product)
 * API Base: /api/v1/product-packagings
 */
class ProductPackagingsService implements CrudService<
  ProductPackaging,
  CreateProductPackagingDto,
  UpdateProductPackagingDto
> {
  private readonly basePath = '/api/v1/product-packagings'

  /**
   * Récupère tous les conditionnements (paginés) avec filtres
   *
   * @param params - Paramètres de pagination et filtrage
   * @returns Promise<PaginatedResponse<ProductPackaging>>
   */
  async getAll(params: ProductPackagingFilterParams = {}): Promise<PaginatedResponse<ProductPackaging>> {
    try {
      const {
        page = 1,
        limit = 25,
        sortBy = 'packagingLabel',
        sortOrder = 'asc',
        productId,
        countryCode,
        gtinEan,
        isActive,
        search,
      } = params

      // Construire les query params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        orderBy: sortBy,
        order: sortOrder.toUpperCase(), // ASC ou DESC
      })

      // Ajouter les filtres optionnels
      if (productId) queryParams.append('productId', productId)
      if (countryCode) queryParams.append('countryCode', countryCode)
      if (gtinEan) queryParams.append('gtinEan', gtinEan)
      if (isActive !== undefined) queryParams.append('isActive', isActive.toString())
      if (search) queryParams.append('search', search)

      const response = await apiClient.get<PaginatedResponse<ProductPackaging>>(
        `${this.basePath}?${queryParams.toString()}`
      )

      logger.info('Product packagings list fetched', {
        total: response.meta.total,
        page,
        limit,
        productId,
        countryCode,
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch product packagings list', { error, params })
      throw error
    }
  }

  /**
   * Récupérer un conditionnement par son ID
   *
   * @param id - ID du conditionnement
   * @returns Promise<ProductPackaging>
   */
  async getById(id: string): Promise<ProductPackaging> {
    try {
      const packaging = await apiClient.get<ProductPackaging>(`${this.basePath}/${id}`)
      logger.info('Product packaging fetched', { id, label: packaging.packagingLabel })
      return packaging
    } catch (error) {
      logger.error('Failed to fetch product packaging', { error, id })
      throw error
    }
  }

  /**
   * Créer un nouveau conditionnement
   *
   * @param data - Données de création
   * @returns Promise<ProductPackaging>
   */
  async create(data: CreateProductPackagingDto): Promise<ProductPackaging> {
    try {
      const packaging = await apiClient.post<ProductPackaging>(this.basePath, data)
      logger.info('Product packaging created', { id: packaging.id, label: packaging.packagingLabel })
      return packaging
    } catch (error) {
      logger.error('Failed to create product packaging', { error, data })
      throw error
    }
  }

  /**
   * Mettre à jour un conditionnement existant
   *
   * @param id - ID du conditionnement
   * @param data - Données de mise à jour (inclut version pour optimistic locking)
   * @returns Promise<ProductPackaging>
   */
  async update(id: string, data: UpdateProductPackagingDto): Promise<ProductPackaging> {
    try {
      const packaging = await apiClient.put<ProductPackaging>(`${this.basePath}/${id}`, data)
      logger.info('Product packaging updated', { id, label: packaging.packagingLabel, version: data.version })
      return packaging
    } catch (error) {
      logger.error('Failed to update product packaging', { error, id, data })
      throw error
    }
  }

  /**
   * Supprimer un conditionnement (soft delete)
   *
   * @param id - ID du conditionnement
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`)
      logger.info('Product packaging deleted (soft)', { id })
    } catch (error) {
      logger.error('Failed to delete product packaging', { error, id })
      throw error
    }
  }

  /**
   * Restaurer un conditionnement supprimé
   *
   * @param id - ID du conditionnement
   * @returns Promise<ProductPackaging>
   */
  async restore(id: string): Promise<ProductPackaging> {
    try {
      const packaging = await apiClient.post<ProductPackaging>(`${this.basePath}/${id}/restore`)
      logger.info('Product packaging restored', { id, label: packaging.packagingLabel })
      return packaging
    } catch (error) {
      logger.error('Failed to restore product packaging', { error, id })
      throw error
    }
  }

  /**
   * Vérifier les dépendances avant suppression
   *
   * @param id - ID du conditionnement
   * @returns Promise<Record<string, number>> - Map des entités dépendantes et leur nombre
   *
   * @example
   * {
   *   "farmInventories": 5,
   *   "treatmentProtocols": 3,
   *   "purchases": 10
   * }
   */
  async checkDependencies(id: string): Promise<Record<string, number>> {
    try {
      const dependencies = await apiClient.get<Record<string, number>>(
        `${this.basePath}/${id}/dependencies`
      )
      logger.info('Product packaging dependencies checked', { id, dependencies })
      return dependencies
    } catch (error) {
      logger.error('Failed to check product packaging dependencies', { error, id })
      throw error
    }
  }
}

/**
 * Instance singleton du service Product Packagings
 * ✅ RÈGLE #4 : Export de l'instance, pas de la classe
 */
export const productPackagingsService = new ProductPackagingsService()
