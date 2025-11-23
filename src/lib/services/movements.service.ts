/**
 * Service pour les mouvements d'animaux
 */

import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';

export interface MovementStatistics {
  totalMovements: number;
  byType: {
    sale?: number;
    purchase?: number;
    birth?: number;
    death?: number;
    [key: string]: number | undefined;
  };
  totalSales?: number;
  totalPurchases?: number;
}

class MovementsService {
  async getStatistics(fromDate?: string, toDate?: string): Promise<MovementStatistics> {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const url = params.toString()
        ? `/farms/${TEMP_FARM_ID}/movements/statistics?${params}`
        : `/farms/${TEMP_FARM_ID}/movements/statistics`;

      const response = await apiClient.get<MovementStatistics>(url);
      logger.info('Movement statistics fetched', { fromDate, toDate, total: response.totalMovements });
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No movements found (404)');
        return {
          totalMovements: 0,
          byType: {},
        };
      }
      logger.error('Failed to fetch movement statistics', { error });
      throw error;
    }
  }
}

export const movementsService = new MovementsService();
