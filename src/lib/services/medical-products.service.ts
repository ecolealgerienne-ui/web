/**
 * Service API pour la gestion des produits médicaux (CRUD)
 *
 * Les produits médicaux incluent les médicaments, antibiotiques,
 * et autres produits vétérinaires utilisés dans la ferme.
 */

import { apiClient } from '@/lib/api/client';
import { MedicalProduct, CreateMedicalProductDto, UpdateMedicalProductDto } from '@/lib/types/medical-product';
import { PaginatedResponse } from '@/lib/types/api';
import { logger } from '@/lib/utils/logger';

// TEMPORAIRE: FarmId simulé en attendant l'authentification
// TODO: Récupérer le farmId depuis le contexte utilisateur après login
const TEMP_FARM_ID = '00000000-0000-0000-0000-000000000001';

class MedicalProductsService {
  private basePath = `/farms/${TEMP_FARM_ID}/medical-products`;

  /**
   * Récupère tous les produits médicaux
   */
  async getAll(): Promise<MedicalProduct[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<MedicalProduct>>(this.basePath);

      // Si pas de données, retourner un tableau vide au lieu d'échouer
      if (!response || !response.data) {
        logger.info('No medical products found, returning empty array');
        return [];
      }

      logger.info('Medical products fetched successfully', { count: response.data.length });
      return response.data;
    } catch (error: any) {
      // Si 404, la liste est simplement vide (pas encore de produits créés)
      if (error?.status === 404) {
        logger.info('No medical products endpoint found (404), returning empty array');
        return [];
      }

      logger.error('Failed to fetch medical products', { error });
      throw error;
    }
  }

  /**
   * Crée un nouveau produit médical
   */
  async create(data: CreateMedicalProductDto): Promise<MedicalProduct> {
    try {
      const product = await apiClient.post<MedicalProduct>(this.basePath, data);
      logger.info('Medical product created successfully', { id: product.id });
      return product;
    } catch (error) {
      logger.error('Failed to create medical product', { error, data });
      throw error;
    }
  }

  /**
   * Met à jour un produit médical existant
   */
  async update(id: string, data: UpdateMedicalProductDto): Promise<MedicalProduct> {
    try {
      const product = await apiClient.put<MedicalProduct>(`${this.basePath}/${id}`, data);
      logger.info('Medical product updated successfully', { id });
      return product;
    } catch (error) {
      logger.error('Failed to update medical product', { error, id, data });
      throw error;
    }
  }

  /**
   * Supprime un produit médical (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`);
      logger.info('Medical product deleted successfully', { id });
    } catch (error) {
      logger.error('Failed to delete medical product', { error, id });
      throw error;
    }
  }
}

export const medicalProductsService = new MedicalProductsService();
