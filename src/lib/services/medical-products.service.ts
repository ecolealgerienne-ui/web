/**
 * Service pour la gestion des produits médicaux
 * Note: As per WEB_API_SPECIFICATIONS.md section 3.3 Medical Products
 */

import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';

export interface MedicalProduct {
  id: string;
  farmId: string;
  name: string;
  commercialName?: string;
  category?: string;
  type?: string;
  activeIngredient?: string;
  manufacturer?: string;
  withdrawalPeriodMeat?: number;
  withdrawalPeriodMilk?: number;
  currentStock?: number;
  stockUnit?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMedicalProductDto {
  name: string;
  commercialName?: string;
  category?: string;
  type?: string;
  activeIngredient?: string;
  manufacturer?: string;
  withdrawalPeriodMeat?: number;
  withdrawalPeriodMilk?: number;
  currentStock?: number;
  stockUnit?: string;
  isActive?: boolean;
}

export interface UpdateMedicalProductDto extends Partial<CreateMedicalProductDto> {}

export interface MedicalProductFilters {
  search?: string;
  category?: string;
  type?: string;
  isActive?: boolean;
}

class MedicalProductsService {
  async getAll(filters?: Partial<MedicalProductFilters>): Promise<MedicalProduct[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

      const url = `/farms/${TEMP_FARM_ID}/medical-products${params.toString() ? `?${params}` : ''}`;
      logger.info('Fetching medical products from', { url });

      const response = await apiClient.get<any>(url);
      logger.info('Medical products response received', {
        responseType: typeof response,
        isArray: Array.isArray(response),
        hasData: 'data' in response,
        response: JSON.stringify(response).substring(0, 200)
      });

      // Handle both response formats: { data: [...] } or direct array [...]
      let products: MedicalProduct[];
      if (Array.isArray(response)) {
        products = response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        products = response.data || [];
      } else {
        logger.warn('Unexpected response format', { response });
        products = [];
      }

      logger.info('Medical products fetched', { count: products.length });
      return products;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No medical products found (404)');
        return [];
      }
      logger.error('Failed to fetch medical products', { error: error.message, status: error.status });
      throw error;
    }
  }

  async getById(id: string): Promise<MedicalProduct | null> {
    try {
      const response = await apiClient.get<{ data: MedicalProduct }>(`/farms/${TEMP_FARM_ID}/medical-products/${id}`);
      logger.info('Medical product fetched', { id });
      return response.data;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('Medical product not found (404)', { id });
        return null;
      }
      logger.error('Failed to fetch medical product', { error, id });
      throw error;
    }
  }

  async create(data: CreateMedicalProductDto): Promise<MedicalProduct> {
    const response = await apiClient.post<{ data: MedicalProduct }>(`/farms/${TEMP_FARM_ID}/medical-products`, data);
    logger.info('Medical product created', { id: response.data.id });
    return response.data;
  }

  async update(id: string, data: UpdateMedicalProductDto): Promise<MedicalProduct> {
    // Use PUT as per API specs
    const response = await apiClient.put<{ data: MedicalProduct }>(`/farms/${TEMP_FARM_ID}/medical-products/${id}`, data);
    logger.info('Medical product updated', { id });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/farms/${TEMP_FARM_ID}/medical-products/${id}`);
    logger.info('Medical product deleted', { id });
  }
}

export const medicalProductsService = new MedicalProductsService();
