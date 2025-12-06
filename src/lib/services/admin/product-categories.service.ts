import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  ProductCategory,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from '@/lib/types/admin/product-category'
import type {
  CrudService,
  PaginatedResponse,
  PaginationParams,
} from '@/lib/types/common/api'

/**
 * Service CRUD pour les catégories de produits
 *
 * ✅ RÈGLE #2 : Utilise apiClient (jamais fetch directement)
 * ✅ RÈGLE #4 : Implémente CrudService<T, CreateDto, UpdateDto>
 * ✅ RÈGLE #7 : Logger toutes les opérations et erreurs
 * ✅ RÈGLE #8.3.12 : URL vérifiée dans Swagger (http://localhost:3000/api/docs)
 *
 * @example
 * ```typescript
 * // Récupérer toutes les catégories
 * const response = await productCategoriesService.getAll({ page: 1, limit: 25 })
 *
 * // Créer une catégorie
 * const category = await productCategoriesService.create({
 *   code: 'ANTIB',
 *   name: 'Antibiotiques',
 *   description: 'Médicaments antibactériens',
 *   isActive: true
 * })
 * ```
 */
class ProductCategoriesService
  implements
    CrudService<
      ProductCategory,
      CreateProductCategoryDto,
      UpdateProductCategoryDto
    >
{
  // ⚠️ RÈGLE #8.3.12 : URL à vérifier dans Swagger
  // Basé sur le pattern Products : /api/v1/products (sans /admin/)
  // Donc : /api/v1/product-categories (à confirmer dans Swagger)
  private readonly baseUrl = '/api/v1/product-categories'

  /**
   * Récupère toutes les catégories avec pagination
   *
   * ✅ RÈGLE #4 : Retourne PaginatedResponse<T>
   *
   * @param params - Paramètres de pagination et filtres
   * @returns Liste paginée de catégories
   * @throws {ApiError} Si l'API retourne une erreur
   */
  async getAll(
    params?: PaginationParams
  ): Promise<PaginatedResponse<ProductCategory>> {
    try {
      logger.info('Fetching product categories', { params })

      // Construire l'URL avec les query params
      // Note: L'API utilise 'order' (pas 'sortOrder')
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', String(params.page))
      if (params?.limit) queryParams.append('limit', String(params.limit))
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params?.sortOrder) queryParams.append('order', params.sortOrder)
      if (params?.search) queryParams.append('search', params.search)

      const url = queryParams.toString()
        ? `${this.baseUrl}?${queryParams.toString()}`
        : this.baseUrl

      const response = await apiClient.get<PaginatedResponse<ProductCategory>>(
        url
      )

      logger.info('Product categories fetched successfully', {
        count: response.data.length,
        total: response.meta.total,
        page: response.meta.page,
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch product categories', { error, params })
      throw error
    }
  }

  /**
   * Récupère une catégorie par ID
   *
   * @param id - ID de la catégorie
   * @returns Catégorie trouvée
   * @throws {ApiError} Si non trouvée (404) ou erreur serveur
   */
  async getById(id: string): Promise<ProductCategory> {
    try {
      logger.info('Fetching product category by ID', { id })

      const category = await apiClient.get<ProductCategory>(
        `${this.baseUrl}/${id}`
      )

      logger.info('Product category fetched successfully', {
        id,
        code: category.code,
        name: category.name,
      })

      return category
    } catch (error) {
      logger.error('Failed to fetch product category', { error, id })
      throw error
    }
  }

  /**
   * Crée une nouvelle catégorie
   *
   * @param data - Données de la catégorie à créer
   * @returns Catégorie créée
   * @throws {ApiError} Si code déjà existant (409) ou validation échouée (400)
   */
  async create(data: CreateProductCategoryDto): Promise<ProductCategory> {
    try {
      logger.info('Creating product category', {
        code: data.code,
        name: data.name,
      })

      const category = await apiClient.post<ProductCategory>(
        this.baseUrl,
        data
      )

      logger.info('Product category created successfully', {
        id: category.id,
        code: category.code,
        name: category.name,
      })

      return category
    } catch (error) {
      logger.error('Failed to create product category', { error, data })
      throw error
    }
  }

  /**
   * Met à jour une catégorie existante
   *
   * ✅ RÈGLE #4 : Utilise version pour optimistic locking
   *
   * @param id - ID de la catégorie
   * @param data - Données à mettre à jour (doit inclure version)
   * @returns Catégorie mise à jour
   * @throws {ApiError} Si version conflict (409) ou non trouvée (404)
   */
  async update(
    id: string,
    data: UpdateProductCategoryDto
  ): Promise<ProductCategory> {
    try {
      logger.info('Updating product category', {
        id,
        version: data.version,
        changes: Object.keys(data).filter((k) => k !== 'version'),
      })

      const category = await apiClient.patch<ProductCategory>(
        `${this.baseUrl}/${id}`,
        data
      )

      logger.info('Product category updated successfully', {
        id: category.id,
        code: category.code,
        oldVersion: data.version,
        newVersion: category.version,
      })

      return category
    } catch (error) {
      logger.error('Failed to update product category', { error, id, data })
      throw error
    }
  }

  /**
   * Supprime une catégorie (soft delete)
   *
   * La catégorie n'est pas réellement supprimée de la DB,
   * elle est marquée comme supprimée (deletedAt = timestamp)
   *
   * @param id - ID de la catégorie à supprimer
   * @throws {ApiError} Si dépendances existent (409) ou non trouvée (404)
   */
  async delete(id: string): Promise<void> {
    try {
      logger.info('Deleting product category', { id })

      await apiClient.delete(`${this.baseUrl}/${id}`)

      logger.info('Product category deleted successfully', { id })
    } catch (error) {
      logger.error('Failed to delete product category', { error, id })
      throw error
    }
  }

  /**
   * Restaure une catégorie supprimée
   *
   * Enlève le flag deletedAt pour rendre la catégorie à nouveau active
   *
   * @param id - ID de la catégorie à restaurer
   * @returns Catégorie restaurée
   * @throws {ApiError} Si non trouvée (404) ou non supprimée
   */
  async restore(id: string): Promise<ProductCategory> {
    try {
      logger.info('Restoring product category', { id })

      const category = await apiClient.post<ProductCategory>(
        `${this.baseUrl}/${id}/restore`
      )

      logger.info('Product category restored successfully', {
        id: category.id,
        code: category.code,
      })

      return category
    } catch (error) {
      logger.error('Failed to restore product category', { error, id })
      throw error
    }
  }
}

/**
 * Instance singleton du service
 * Utiliser cette instance partout dans l'application
 */
export const productCategoriesService = new ProductCategoriesService()
