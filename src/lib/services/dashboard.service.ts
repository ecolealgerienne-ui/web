/**
 * Service pour les statistiques du dashboard
 */

import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';


export interface DashboardStats {
  totalAnimals: number;
  births: {
    count: number;
    period: string;
  };
  deaths: {
    count: number;
    period: string;
  };
  vaccinations: {
    upcoming: number;
    label: string;
  };
}

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error';
  title: string;
  message: string;
  date: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  date: string;
  user?: string;
}

export interface HerdEvolutionDataPoint {
  date: string;
  count: number;
}

export interface HerdEvolution {
  data: HerdEvolutionDataPoint[];
  period: string;
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<DashboardStats>(`/farms/${TEMP_FARM_ID}/dashboard/stats`);
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('Dashboard stats not found (404), using defaults');
        return {
          totalAnimals: 0,
          births: { count: 0, period: 'thisMonth' },
          deaths: { count: 0, period: 'thisMonth' },
          vaccinations: { upcoming: 0, label: 'upcoming' },
        };
      }
      logger.error('Failed to fetch dashboard stats', { error });
      throw error;
    }
  }

  async getAlerts(): Promise<Alert[]> {
    try {
      const response = await apiClient.get<{ data: Alert[] }>(`/farms/${TEMP_FARM_ID}/dashboard/alerts`);
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No alerts found (404)');
        return [];
      }
      logger.error('Failed to fetch alerts', { error });
      throw error;
    }
  }

  async getRecentActivities(): Promise<Activity[]> {
    try {
      const response = await apiClient.get<{ data: Activity[] }>(`/farms/${TEMP_FARM_ID}/dashboard/activities`);
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No activities found (404)');
        return [];
      }
      logger.error('Failed to fetch activities', { error });
      throw error;
    }
  }

  async getHerdEvolution(period?: string): Promise<HerdEvolution> {
    try {
      const queryParams = period ? `?period=${period}` : '';
      const response = await apiClient.get<HerdEvolution>(`/farms/${TEMP_FARM_ID}/dashboard/herd-evolution${queryParams}`);
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('Herd evolution data not found (404), using empty data');
        return {
          data: [],
          period: period || '6months',
        };
      }
      logger.error('Failed to fetch herd evolution', { error });
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
