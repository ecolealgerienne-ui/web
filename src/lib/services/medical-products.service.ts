/**
 * Service pour la gestion des produits médicaux
 * Système Master Table : retourne produits global + local
 */

import { apiClient } from '@/lib/api/client';
import {
  MedicalProduct,
  CreateMedicalProductDto,
  UpdateMedicalProductDto,
  MedicalProductFilters,
} from '@/lib/types/medical-product';
import { logger } from '@/lib/utils/logger';

const TEMP_FARM_ID = 'f9b1c8e0-7f3a-4b6d-9e2a-1c5d8f3b4a7e';

class MedicalProductsService {
  private getBasePath(): string {
    return `/farms/${TEMP_FARM_ID}/medical-products`;
  }

  /**
   * Récupère tous les produits médicaux (global + local)
   * @param filters - Filtres optionnels (search, scope, category, isActive)
   */
  async getAll(filters?: MedicalProductFilters): Promise<MedicalProduct[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.scope && filters.scope !== 'all') params.append('scope', filters.scope);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath();
      const response = await apiClient.get<{ data: MedicalProduct[] }>(url);
      logger.info('Medical products fetched', { count: response.data?.length || 0 });
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No medical products found (404)');
        return [];
      }
      logger.error('Failed to fetch medical products', { error });
      throw error;
    }
  }

  /**
   * Récupère un produit médical par ID
   */
  async getById(id: string): Promise<MedicalProduct | null> {
    try {
      const response = await apiClient.get<MedicalProduct>(`${this.getBasePath()}/${id}`);
      logger.info('Medical product fetched', { id });
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('Medical product not found (404)', { id });
        return null;
      }
      logger.error('Failed to fetch medical product', { error, id });
      throw error;
    }
  }

  /**
   * Crée un produit médical local (scope=local)
   */
  async create(data: CreateMedicalProductDto): Promise<MedicalProduct> {
    const response = await apiClient.post<MedicalProduct>(this.getBasePath(), data);
    logger.info('Medical product created', { id: response.id, nameFr: data.nameFr });
    return response;
  }

  /**
   * Met à jour un produit médical
   */
  async update(id: string, data: UpdateMedicalProductDto): Promise<MedicalProduct> {
    const response = await apiClient.put<MedicalProduct>(`${this.getBasePath()}/${id}`, data);
    logger.info('Medical product updated', { id });
    return response;
  }

  /**
   * Supprime un produit médical
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.getBasePath()}/${id}`);
    logger.info('Medical product deleted', { id });
  }
}

export const medicalProductsService = new MedicalProductsService();
