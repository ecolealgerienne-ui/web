/**
 * Service pour les statistiques du dashboard
 */

import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';
import { animalsService } from './animals.service';
import { movementsService } from './movements.service';
import { vaccinationsService } from './vaccinations.service';


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
  id: number;
  type: 'destructive' | 'warning' | 'success' | 'default';
  count: number;
  label: string;
}

export interface Activity {
  id: number;
  label: string;
  time: string;
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
  private getThisMonthDates() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return {
      fromDate: firstDay.toISOString(),
      toDate: lastDay.toISOString(),
    };
  }

  private getUpcomingVaccinationsDays() {
    return 30; // Consider vaccinations due in next 30 days as "upcoming"
  }

  async getStats(): Promise<DashboardStats> {
    try {
      // Get real data from multiple endpoints
      const { fromDate, toDate } = this.getThisMonthDates();

      const [animals, movementStats, vaccinations] = await Promise.all([
        animalsService.getAll(),
        movementsService.getStatistics(fromDate, toDate),
        vaccinationsService.getAll(),
      ]);

      // Calculate real stats
      const totalAnimals = animals.length;

      // Extract count from birth/death data (API might return object or number)
      const birthData = movementStats.byType.birth;
      const deathData = movementStats.byType.death;

      const birthsCount = typeof birthData === 'object' && birthData !== null && 'count' in birthData
        ? (birthData as any).count
        : (birthData as number) || 0;

      const deathsCount = typeof deathData === 'object' && deathData !== null && 'count' in deathData
        ? (deathData as any).count
        : (deathData as number) || 0;

      // Count upcoming vaccinations (nextDueDate within next 30 days)
      const now = new Date();
      const upcomingDays = this.getUpcomingVaccinationsDays();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + upcomingDays);

      const upcomingVaccinations = vaccinations.filter((vacc) => {
        if (!vacc.nextDueDate) return false;
        const dueDate = new Date(vacc.nextDueDate);
        return dueDate >= now && dueDate <= futureDate;
      }).length;

      return {
        totalAnimals,
        births: { count: birthsCount, period: 'thisMonth' },
        deaths: { count: deathsCount, period: 'thisMonth' },
        vaccinations: { upcoming: upcomingVaccinations, label: 'upcoming' },
      };
    } catch (error: any) {
      logger.error('Failed to fetch dashboard stats', { error });

      // Return zeros on error
      return {
        totalAnimals: 0,
        births: { count: 0, period: 'thisMonth' },
        deaths: { count: 0, period: 'thisMonth' },
        vaccinations: { upcoming: 0, label: 'upcoming' },
      };
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
