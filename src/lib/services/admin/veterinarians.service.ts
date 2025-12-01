/**
 * Service CRUD pour les Vétérinaires (Admin Reference Data)
 *
 * ✅ RÈGLE #1 : Utilise apiClient (jamais fetch directement)
 * ✅ RÈGLE #7 : Logging de toutes les opérations
 * ✅ RÈGLE #7 : Gestion d'erreurs centralisée
 *
 * Implémente l'interface CrudService pour les vétérinaires.
 * Endpoint API: /api/v1/veterinarians
 *
 * @example
 * ```typescript
 * const veterinarians = await veterinariansService.getAll({ page: 1, limit: 25 })
 * const vet = await veterinariansService.create({ code: 'VET001', ... })
 * ```
 */

import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  Veterinarian,
  CreateVeterinarianDto,
  UpdateVeterinarianDto,
} from '@/lib/types/admin/veterinarian'
import type {
  PaginatedResponse,
  PaginationParams,
  CrudService,
} from '@/lib/types/common/api'

/**
 * Service de gestion des vétérinaires
 *
 * Toutes les opérations utilisent apiClient et sont loggées.
 * Les erreurs sont propagées pour être gérées par handleApiError dans les hooks.
 */
class VeterinariansService implements CrudService<Veterinarian, CreateVeterinarianDto, UpdateVeterinarianDto> {
  private readonly baseUrl = '/api/v1/veterinarians'

  /**
   * Récupère la liste paginée des vétérinaires
   *
   * @param params - Paramètres de pagination et tri
   * @returns Liste paginée de vétérinaires
   */
  async getAll(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Veterinarian>> {
    logger.info('Fetching veterinarians', { params })

    const response = await apiClient.get<PaginatedResponse<Veterinarian>>(
      this.baseUrl,
      { params }
    )

    logger.info('Veterinarians fetched', {
      count: response.data.length,
      total: response.meta.total,
    })

    return response
  }

  /**
   * Récupère un vétérinaire par son ID
   *
   * @param id - ID du vétérinaire
   * @returns Vétérinaire trouvé
   */
  async getById(id: string): Promise<Veterinarian> {
    logger.info('Fetching veterinarian by ID', { id })

    const response = await apiClient.get<Veterinarian>(
      `${this.baseUrl}/${id}`
    )

    logger.info('Veterinarian fetched', { id, code: response.code })

    return response
  }

  /**
   * Crée un nouveau vétérinaire
   *
   * @param dto - Données du vétérinaire à créer
   * @returns Vétérinaire créé
   */
  async create(dto: CreateVeterinarianDto): Promise<Veterinarian> {
    logger.info('Creating veterinarian', {
      code: dto.code,
      name: `${dto.firstName} ${dto.lastName}`,
    })

    const response = await apiClient.post<Veterinarian>(this.baseUrl, dto)

    logger.info('Veterinarian created', {
      id: response.id,
      code: response.code,
    })

    return response
  }

  /**
   * Met à jour un vétérinaire existant
   *
   * ⚠️ Requiert le champ version pour l'optimistic locking
   *
   * @param id - ID du vétérinaire
   * @param dto - Données à mettre à jour (doit inclure version)
   * @returns Vétérinaire mis à jour
   */
  async update(
    id: string,
    dto: UpdateVeterinarianDto
  ): Promise<Veterinarian> {
    logger.info('Updating veterinarian', {
      id,
      version: dto.version,
    })

    const response = await apiClient.patch<Veterinarian>(
      `${this.baseUrl}/${id}`,
      dto
    )

    logger.info('Veterinarian updated', {
      id: response.id,
      newVersion: response.version,
    })

    return response
  }

  /**
   * Supprime un vétérinaire (soft delete)
   *
   * Le vétérinaire n'est pas supprimé de la base de données,
   * mais marqué comme supprimé (deletedAt = timestamp).
   *
   * @param id - ID du vétérinaire à supprimer
   */
  async delete(id: string): Promise<void> {
    logger.info('Deleting veterinarian', { id })

    await apiClient.delete(`${this.baseUrl}/${id}`)

    logger.info('Veterinarian deleted (soft)', { id })
  }

  /**
   * Restaure un vétérinaire supprimé
   *
   * Réactive un vétérinaire précédemment supprimé (deletedAt = null).
   *
   * @param id - ID du vétérinaire à restaurer
   * @returns Vétérinaire restauré
   */
  async restore(id: string): Promise<Veterinarian> {
    logger.info('Restoring veterinarian', { id })

    const response = await apiClient.post<Veterinarian>(
      `${this.baseUrl}/${id}/restore`
    )

    logger.info('Veterinarian restored', { id })

    return response
  }
}

/**
 * Instance singleton du service
 *
 * À utiliser dans les hooks et composants:
 * ```typescript
 * import { veterinariansService } from '@/lib/services/admin/veterinarians.service'
 * ```
 */
export const veterinariansService = new VeterinariansService()
