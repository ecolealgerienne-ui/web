import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
} from '@/lib/types/admin/product'
import type {
  PaginatedResponse,
  PaginationParams,
  CrudService,
} from '@/lib/types/common/api'

/**
 * Service pour gérer les produits vétérinaires
 *
 * ✅ RÈGLE #2 : Utilise apiClient (jamais fetch direct)
 * ✅ RÈGLE #4 : Implémente CrudService<T, CreateDto, UpdateDto>
 * ✅ RÈGLE #7 : Logger toutes les opérations
 *
 * @example
 * ```typescript
 * import { productsService } from '@/lib/services/admin/products.service'
 *
 * // Récupérer tous les produits
 * const products = await productsService.getAll({ page: 1, limit: 25 })
 *
 * // Créer un produit
 * const newProduct = await productsService.create({
 *   code: 'AMOX-500-INJ',
 *   commercialName: 'Amoxival 500',
 *   laboratoryName: 'Virbac',
 *   activeSubstanceIds: ['uuid-1', 'uuid-2'],
 *   // ...
 * })
 * ```
 */
class ProductsService
  implements CrudService<Product, CreateProductDto, UpdateProductDto>
{
  private readonly baseUrl = '/api/v1/products'

  /**
   * Récupère tous les produits (paginés)
   *
   * ✅ RÈGLE #7 : Logger info + error
   * ⚠️ Bonne pratique 8.3.1 : Construire URL avec URLSearchParams
   *
   * @param params - Paramètres de pagination et filtres
   * @returns Liste paginée de produits
   * @throws {ApiError} Si l'API retourne une erreur
   */
  async getAll(
    params?: PaginationParams & ProductFilters
  ): Promise<PaginatedResponse<Product>> {
    try {
      logger.info('Fetching products', { params })

      // Construire l'URL avec les query params
      // ⚠️ Backend utilise 'sort' et 'order' (pas 'sortBy' et 'sortOrder')
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', String(params.page))
      if (params?.limit) queryParams.append('limit', String(params.limit))
      if (params?.sortBy) queryParams.append('sort', params.sortBy) // Backend: 'sort'
      if (params?.sortOrder) queryParams.append('order', params.sortOrder) // Backend: 'order'
      if (params?.search) queryParams.append('search', params.search)

      // TODO: Mapper les filtres quand utilisés dans l'UI
      // - isActive (boolean)
      // - scope (global, local, all)
      // - type (antibiotic, anti_inflammatory, etc.)
      // - categoryId
      // - vaccinesOnly

      const url = queryParams.toString()
        ? `${this.baseUrl}?${queryParams.toString()}`
        : this.baseUrl

      const response = await apiClient.get<PaginatedResponse<Product>>(url)

      logger.info('Products fetched successfully', {
        count: response.data.length,
        total: response.meta.total,
        page: response.meta.page,
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch products', { error, params })
      throw error
    }
  }

  /**
   * Récupère un produit par ID
   *
   * @param id - ID du produit
   * @returns Produit trouvé avec ses substances actives
   * @throws {ApiError} Si non trouvé (404)
   */
  async getById(id: string): Promise<Product> {
    try {
      logger.info('Fetching product by ID', { id })

      const product = await apiClient.get<Product>(`${this.baseUrl}/${id}`)

      logger.info('Product fetched successfully', { id, code: product.code })

      return product
    } catch (error) {
      logger.error('Failed to fetch product', { error, id })
      throw error
    }
  }

  /**
   * Crée un nouveau produit
   *
   * @param data - Données du produit à créer
   * @returns Produit créé avec ID généré
   * @throws {ApiError} Si code déjà existant (409 Conflict)
   */
  async create(data: CreateProductDto): Promise<Product> {
    try {
      logger.info('Creating product', { code: data.code })

      const product = await apiClient.post<Product>(this.baseUrl, data)

      logger.info('Product created successfully', {
        id: product.id,
        code: product.code,
      })

      return product
    } catch (error) {
      logger.error('Failed to create product', { error, data })
      throw error
    }
  }

  /**
   * Met à jour un produit existant
   *
   * ✅ RÈGLE #4 : Version obligatoire pour optimistic locking
   *
   * @param id - ID du produit
   * @param data - Données à mettre à jour (doit inclure version)
   * @returns Produit mis à jour avec version incrémentée
   * @throws {ApiError} Si version mismatch (409 Conflict)
   */
  async update(id: string, data: UpdateProductDto): Promise<Product> {
    try {
      logger.info('Updating product', { id, version: data.version })

      const product = await apiClient.patch<Product>(
        `${this.baseUrl}/${id}`,
        data
      )

      logger.info('Product updated successfully', {
        id,
        newVersion: product.version,
      })

      return product
    } catch (error) {
      logger.error('Failed to update product', { error, id, data })
      throw error
    }
  }

  /**
   * Supprime un produit (soft delete)
   *
   * Met deletedAt à la date actuelle sans supprimer physiquement
   *
   * @param id - ID du produit à supprimer
   * @throws {ApiError} Si le produit a des dépendances (409 Conflict)
   */
  async delete(id: string): Promise<void> {
    try {
      logger.info('Deleting product (soft delete)', { id })

      await apiClient.delete(`${this.baseUrl}/${id}`)

      logger.info('Product deleted successfully', { id })
    } catch (error) {
      logger.error('Failed to delete product', { error, id })
      throw error
    }
  }

  /**
   * Restaure un produit supprimé
   *
   * Retire le flag deletedAt pour réactiver le produit
   *
   * @param id - ID du produit à restaurer
   * @returns Produit restauré
   */
  async restore(id: string): Promise<Product> {
    try {
      logger.info('Restoring product', { id })

      const product = await apiClient.post<Product>(
        `${this.baseUrl}/${id}/restore`
      )

      logger.info('Product restored successfully', { id })

      return product
    } catch (error) {
      logger.error('Failed to restore product', { error, id })
      throw error
    }
  }

  /**
   * Vérifie l'unicité d'un code produit
   *
   * @param code - Code à vérifier
   * @param excludeId - ID à exclure (pour update)
   * @returns true si unique, false sinon
   */
  async checkCodeUnique(code: string, excludeId?: string): Promise<boolean> {
    try {
      const params = new URLSearchParams({ code })
      if (excludeId) params.append('excludeId', excludeId)

      await apiClient.get(`${this.baseUrl}/check-code?${params}`)
      return true
    } catch (error: any) {
      if (error.status === 409) {
        return false
      }
      throw error
    }
  }
}

// Export singleton
export const productsService = new ProductsService()
