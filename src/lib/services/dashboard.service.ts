/**
 * Service pour les statistiques du dashboard
 */

import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';

const TEMP_FARM_ID = 'd3934abb-13d2-4950-8d1c-f8ab4628e762';

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
          births: { count: 0, period: 'Ce mois' },
          deaths: { count: 0, period: 'Ce mois' },
          vaccinations: { upcoming: 0, label: 'À venir' },
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
}

export const dashboardService = new DashboardService();
