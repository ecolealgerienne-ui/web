/**
 * Service pour les statistiques du dashboard
 */

import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';
import { animalsService } from './animals.service';
import { movementsService } from './movements.service';
import { treatmentsService } from './treatments.service';

// ============================================
// Types Phase 1 (existants)
// ============================================

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

// ============================================
// Types Phase 2 (nouveaux endpoints)
// ============================================

// Seuils GMQ
export type GmqStatus = 'excellent' | 'good' | 'warning' | 'critical';
export const GMQ_THRESHOLDS = {
  excellent: 1.0,
  good: 0.8,
  warning: 0.6,
  critical: 0.5,
} as const;

// Priorités actions
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low' | 'success';

// GET /dashboard/stats - Stats globales
export interface DashboardStatsV2 {
  herd: {
    totalAnimals: number;
    byStatus: Record<string, number>;
    bySex: Record<string, number>;
    changeThisMonth: number;
    changePercentage: number;
  };
  movements: {
    thisMonth: {
      births: number;
      deaths: number;
      sales: number;
      purchases: number;
    };
    previousMonth: {
      births: number;
      deaths: number;
      sales: number;
      purchases: number;
    };
  };
  weights: {
    avgDailyGain: number;
    avgDailyGainTrend: 'up' | 'down' | 'stable';
    avgDailyGainChange: number;
    avgWeight: number;
    totalWeighings: number;
    weighingsThisMonth: number;
  };
  health: {
    vaccinationsUpToDate: number;
    vaccinationsUpToDatePercentage: number;
    vaccinationsDueThisWeek: number;
    activeWithdrawals: number;
    treatmentsThisMonth: number;
    treatmentsCost: number;
  };
  mortality: {
    rate: number;
    rateStatus: 'good' | 'warning' | 'critical';
    threshold: number;
  };
  alerts: {
    urgent: number;
    warning: number;
    info: number;
  };
  lastUpdated: string;
}

// GET /lots/stats - Stats par lot
export interface LotStats {
  lotId: string;
  name: string;
  type: string;
  animalCount: number;
  weights: {
    avgWeight: number;
    minWeight: number;
    maxWeight: number;
    targetWeight: number | null;
  };
  growth: {
    avgDailyGain: number;
    minDailyGain: number;
    maxDailyGain: number;
    status: GmqStatus;
  };
  predictions: {
    estimatedDaysToTarget: number | null;
    estimatedTargetDate: string | null;
  };
  lastWeighingDate: string | null;
}

export interface LotsStatsResponse {
  lots: LotStats[];
  summary: {
    totalLots: number;
    totalAnimals: number;
    overallAvgDailyGain: number;
  };
}

// GET /weights/rankings - Classement animaux
export interface AnimalRanking {
  animalId: string;
  visualId: string | null;
  officialNumber: string | null;
  avgDailyGain: number;
  weightGain: number;
  weighingsCount: number;
  currentWeight: number;
  lotName: string | null;
  alert?: string;
}

export interface WeightRankingsResponse {
  period: string;
  calculatedAt: string;
  top: AnimalRanking[];
  bottom: AnimalRanking[];
  thresholds: typeof GMQ_THRESHOLDS;
}

// GET /weights/trends - Historique GMQ
export interface TrendDataPoint {
  date: string;
  avgDailyGain: number;
  animalCount: number;
  weighingsCount: number;
  avgWeight: number;
}

export interface WeightTrendsResponse {
  period: string;
  groupBy: string;
  startDate: string;
  endDate: string;
  dataPoints: TrendDataPoint[];
  summary: {
    overallAvgDailyGain: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    trendPercentage: number;
  };
  benchmarks: {
    farmTarget: number | null;
    nationalAverage: number | null;
  };
}

// GET /dashboard/actions - Centre d'actions
export interface ActionItem {
  id: string;
  type: string;
  priority: ActionPriority;
  title: string;
  description: string;
  count: number;
  expiresAt?: string;
  expiresIn?: string;
  dueDate?: string;
  periodStart?: string;
  periodEnd?: string;
  animals: Array<{
    animalId: string;
    visualId: string | null;
    [key: string]: any;
  }>;
  actionUrl: string;
}

export interface DashboardActionsResponse {
  summary: {
    urgent: number;
    thisWeek: number;
    planned: number;
    opportunities: number;
  };
  urgent: ActionItem[];
  thisWeek: ActionItem[];
  planned: ActionItem[];
  opportunities: ActionItem[];
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

      const [animals, movementStats, treatments] = await Promise.all([
        animalsService.getAll(),
        movementsService.getStatistics(fromDate, toDate),
        treatmentsService.getAll({ type: 'vaccination' }),
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

      const upcomingVaccinations = treatments.filter((treatment) => {
        if (!treatment.nextDueDate) return false;
        const dueDate = new Date(treatment.nextDueDate);
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
      const response = await apiClient.get<{ data: Alert[] }>(`/api/v1/farms/${TEMP_FARM_ID}/dashboard/alerts`);
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
      const response = await apiClient.get<{ data: Activity[] }>(`/api/v1/farms/${TEMP_FARM_ID}/dashboard/activities`);
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
      const response = await apiClient.get<HerdEvolution>(`/api/v1/farms/${TEMP_FARM_ID}/dashboard/herd-evolution${queryParams}`);
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

  // ============================================
  // Phase 2 Methods
  // ============================================

  /**
   * GET /api/v1/farms/{farmId}/dashboard/stats
   * Stats globales unifiées
   */
  async getStatsV2(): Promise<DashboardStatsV2> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/farms/${TEMP_FARM_ID}/dashboard/stats`
      );

      // Map backend response to our expected format
      // Backend returns: { success, data: { success, data: { herd, movements, ... } } }
      const raw = response?.data || response;

      // Backend uses: { birth, purchase, exit, entry, transfer } in movements
      // thisMonth might be empty {} if no movements this month
      const thisMonthMovements = raw.movements?.thisMonth || {};
      const thisMonthTotal = raw.movements?.thisMonthTotal ?? 0;

      // All-time movements for reference
      const allTimeMovements = raw.movements?.allTime || {};
      const allTimeBirths = allTimeMovements.birth ?? 0;

      const totalAnimals = raw.herd?.alive ?? raw.herd?.total ?? 0;
      const totalRegistered = raw.herd?.total ?? totalAnimals;

      // Monthly change based on thisMonthTotal or calculate from movements
      const monthlyChange = thisMonthTotal > 0
        ? (thisMonthMovements.birth ?? 0) + (thisMonthMovements.purchase ?? 0) + (thisMonthMovements.entry ?? 0)
          - (thisMonthMovements.exit ?? 0)
        : 0;

      const changePercentage = totalAnimals > 0 && monthlyChange !== 0
        ? (monthlyChange / (totalAnimals - monthlyChange)) * 100
        : 0;

      // Get counts from status breakdown
      const statusBreakdown = raw.herd?.statusBreakdown || {};
      const totalDeaths = statusBreakdown.dead ?? 0;

      return {
        herd: {
          totalAnimals,
          byStatus: statusBreakdown,
          bySex: raw.herd?.genderBreakdown ?? {},
          changeThisMonth: monthlyChange,
          changePercentage,
        },
        movements: {
          thisMonth: {
            births: thisMonthMovements.birth ?? 0,
            deaths: thisMonthMovements.exit ?? 0, // Backend uses 'exit' for outgoing
            sales: 0,
            purchases: thisMonthMovements.purchase ?? 0,
          },
          previousMonth: {
            births: 0, // Backend doesn't provide previousMonth
            deaths: 0,
            sales: 0,
            purchases: 0,
          },
        },
        weights: {
          avgDailyGain: raw.weights?.avgDailyGain ?? 0,
          avgDailyGainTrend: (raw.weights?.avgDailyGain ?? 0) > 0.01 ? 'up' : (raw.weights?.avgDailyGain ?? 0) < -0.01 ? 'down' : 'stable',
          avgDailyGainChange: 0,
          avgWeight: raw.weights?.avgWeight ?? 0,
          totalWeighings: raw.weights?.totalWeights ?? raw.weights?.totalWeighings ?? 0,
          weighingsThisMonth: raw.weights?.weighingsLast30Days ?? 0,
        },
        health: {
          vaccinationsUpToDate: raw.health?.vaccinatedAnimals ?? 0,
          vaccinationsUpToDatePercentage: raw.health?.vaccinationCoverage ?? 0,
          vaccinationsDueThisWeek: 0,
          activeWithdrawals: raw.health?.activeWithdrawals ?? 0,
          treatmentsThisMonth: raw.health?.treatmentsThisMonth ?? 0,
          treatmentsCost: 0,
        },
        mortality: {
          rate: raw.mortality?.rate ?? 0,
          rateStatus: raw.mortality?.assessment === 'critical' ? 'critical' :
                      raw.mortality?.assessment === 'warning' ? 'warning' : 'good',
          threshold: raw.mortality?.threshold?.critical ?? 5,
        },
        alerts: {
          urgent: raw.alerts?.urgent ?? 0,
          warning: raw.alerts?.warning ?? 0,
          info: raw.alerts?.info ?? 0,
        },
        lastUpdated: raw.lastUpdated ?? new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error('Failed to fetch dashboard stats v2', { error });
      throw error;
    }
  }

  /**
   * GET /api/v1/farms/{farmId}/dashboard/actions
   * Centre d'actions unifié
   */
  async getActions(urgency?: string): Promise<DashboardActionsResponse> {
    try {
      const params = new URLSearchParams();
      if (urgency) params.append('urgency', urgency);

      const url = params.toString()
        ? `/api/v1/farms/${TEMP_FARM_ID}/dashboard/actions?${params}`
        : `/api/v1/farms/${TEMP_FARM_ID}/dashboard/actions`;

      const response = await apiClient.get<DashboardActionsResponse>(url);
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No actions found (404)');
        return {
          summary: { urgent: 0, thisWeek: 0, planned: 0, opportunities: 0 },
          urgent: [],
          thisWeek: [],
          planned: [],
          opportunities: [],
        };
      }
      logger.error('Failed to fetch dashboard actions', { error });
      throw error;
    }
  }

  /**
   * GET /api/v1/farms/{farmId}/lots/stats
   * Stats par lot
   */
  async getLotsStats(filters?: { type?: string; isActive?: boolean }): Promise<LotsStatsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

      const url = params.toString()
        ? `/api/v1/farms/${TEMP_FARM_ID}/lots/stats?${params}`
        : `/api/v1/farms/${TEMP_FARM_ID}/lots/stats`;

      const response = await apiClient.get<LotsStatsResponse>(url);
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No lots stats found (404)');
        return {
          lots: [],
          summary: { totalLots: 0, totalAnimals: 0, overallAvgDailyGain: 0 },
        };
      }
      logger.error('Failed to fetch lots stats', { error });
      throw error;
    }
  }

  /**
   * GET /api/v1/farms/{farmId}/weights/rankings
   * Classement animaux par GMQ
   */
  async getWeightRankings(filters?: {
    limit?: number;
    period?: string;
    lotId?: string;
  }): Promise<WeightRankingsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.limit) params.append('limit', String(filters.limit));
      if (filters?.period) params.append('period', filters.period);
      if (filters?.lotId) params.append('lotId', filters.lotId);

      const url = params.toString()
        ? `/api/v1/farms/${TEMP_FARM_ID}/weights/rankings?${params}`
        : `/api/v1/farms/${TEMP_FARM_ID}/weights/rankings`;

      const response = await apiClient.get<WeightRankingsResponse>(url);
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No weight rankings found (404)');
        return {
          period: filters?.period || '30d',
          calculatedAt: new Date().toISOString(),
          top: [],
          bottom: [],
          thresholds: GMQ_THRESHOLDS,
        };
      }
      logger.error('Failed to fetch weight rankings', { error });
      throw error;
    }
  }

  /**
   * GET /api/v1/farms/{farmId}/weights/trends
   * Historique GMQ pour graphiques
   */
  async getWeightTrends(filters?: {
    period?: string;
    groupBy?: string;
    lotId?: string;
  }): Promise<WeightTrendsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.period) params.append('period', filters.period);
      if (filters?.groupBy) params.append('groupBy', filters.groupBy);
      if (filters?.lotId) params.append('lotId', filters.lotId);

      const url = params.toString()
        ? `/api/v1/farms/${TEMP_FARM_ID}/weights/trends?${params}`
        : `/api/v1/farms/${TEMP_FARM_ID}/weights/trends`;

      const response = await apiClient.get<WeightTrendsResponse>(url);
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No weight trends found (404)');
        return {
          period: filters?.period || '3months',
          groupBy: filters?.groupBy || 'week',
          startDate: '',
          endDate: '',
          dataPoints: [],
          summary: { overallAvgDailyGain: 0, trend: 'stable', trendPercentage: 0 },
          benchmarks: { farmTarget: null, nationalAverage: null },
        };
      }
      logger.error('Failed to fetch weight trends', { error });
      throw error;
    }
  }

  /**
   * Helper: Get GMQ status based on value
   */
  getGmqStatus(gmq: number): GmqStatus {
    if (gmq >= GMQ_THRESHOLDS.excellent) return 'excellent';
    if (gmq >= GMQ_THRESHOLDS.good) return 'good';
    if (gmq >= GMQ_THRESHOLDS.warning) return 'warning';
    return 'critical';
  }
}

export const dashboardService = new DashboardService();
