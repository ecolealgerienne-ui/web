import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';

// Types de rapports disponibles
export type ReportType = 'herd_inventory' | 'treatments' | 'vaccinations' | 'growth' | 'movements';

// Filtres pour les rapports
export interface ReportFilters {
  type: ReportType;
  fromDate?: string;
  toDate?: string;
  animalStatus?: 'all' | 'alive' | 'sold' | 'dead' | 'slaughtered' | 'draft';
  lotIds?: string[];
  speciesId?: string;
}

// Structure commune pour le résumé
export interface ReportSummary {
  totalCount: number;
  [key: string]: number | string | Record<string, number>;
}

// Inventaire du cheptel
export interface HerdInventoryReport {
  summary: {
    totalAnimals: number;
    byStatus: Record<string, number>;
    bySex: { male: number; female: number };
    bySpecies: Array<{ speciesId: string; name: string; count: number }>;
  };
  details: Array<{
    animalId: string;
    visualId: string;
    officialNumber: string;
    species: string;
    breed: string;
    sex: string;
    birthDate: string;
    age: string;
    status: string;
    lotName?: string;
    currentWeight?: number;
    lastWeighingDate?: string;
  }>;
}

// Rapport traitements
export interface TreatmentsReport {
  summary: {
    totalTreatments: number;
    animalsTreated: number;
    byType: Record<string, number>;
    byProduct: Array<{ product: string; count: number }>;
  };
  details: Array<{
    id: string;
    date: string;
    animalId: string;
    visualId: string;
    type: string;
    productName: string;
    dosage?: string;
    veterinarian?: string;
    withdrawalEndDate?: string;
    status: string;
  }>;
}

// Rapport vaccinations
export interface VaccinationsReport {
  summary: {
    totalVaccinations: number;
    animalsVaccinated: number;
    byProduct: Array<{ product: string; count: number }>;
  };
  details: Array<{
    id: string;
    date: string;
    animalId: string;
    visualId: string;
    productName: string;
    batchNumber?: string;
    veterinarian?: string;
    nextDueDate?: string;
  }>;
  upcoming: Array<{
    animalId: string;
    visualId: string;
    productName: string;
    dueDate: string;
  }>;
}

// Rapport croissance
export interface GrowthReport {
  summary: {
    totalWeighings: number;
    animalsWeighed: number;
    avgDailyGain: number;
    avgWeight: number;
    minWeight: number;
    maxWeight: number;
  };
  byLot: Array<{
    lotId: string;
    lotName: string;
    animalCount: number;
    avgDailyGain: number;
    avgWeight: number;
    gmqStatus: 'excellent' | 'good' | 'warning' | 'critical';
  }>;
  topPerformers: Array<{
    animalId: string;
    visualId: string;
    avgDailyGain: number;
    weightGain: number;
    currentWeight: number;
  }>;
  lowPerformers: Array<{
    animalId: string;
    visualId: string;
    avgDailyGain: number;
    weightGain: number;
    currentWeight: number;
    alert?: string;
  }>;
}

// Rapport mouvements
export interface MovementsReport {
  summary: {
    totalMovements: number;
    byType: Record<string, number>;
    entries: number;
    exits: number;
  };
  details: Array<{
    id: string;
    date: string;
    type: string;
    animalId: string;
    visualId: string;
    source?: string;
    destination?: string;
    reason?: string;
  }>;
}

// Union type pour tous les rapports
export type ReportData =
  | { type: 'herd_inventory'; data: HerdInventoryReport }
  | { type: 'treatments'; data: TreatmentsReport }
  | { type: 'vaccinations'; data: VaccinationsReport }
  | { type: 'growth'; data: GrowthReport }
  | { type: 'movements'; data: MovementsReport };

class ReportsService {
  private getBasePath(): string {
    return `/api/v1/farms/${TEMP_FARM_ID}/reports`;
  }

  /**
   * Récupère les données d'un rapport
   */
  async getReportData<T>(filters: ReportFilters): Promise<T> {
    try {
      const params = new URLSearchParams();

      params.append('type', filters.type);

      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.animalStatus && filters.animalStatus !== 'all') {
        params.append('animalStatus', filters.animalStatus);
      }
      if (filters.lotIds && filters.lotIds.length > 0) {
        params.append('lotIds', filters.lotIds.join(','));
      }
      if (filters.speciesId) params.append('speciesId', filters.speciesId);

      const url = `${this.getBasePath()}/data?${params.toString()}`;
      const response = await apiClient.get<any>(url);

      // Le backend peut double-wrapper la réponse: { success, data: { type, details } }
      // apiClient unwrap déjà un niveau, mais si on a encore { success, data }, unwrap à nouveau
      if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        return response.data as T;
      }

      return response as T;
    } catch (error: any) {
      logger.error('Failed to fetch report data', { error, filters });
      throw error;
    }
  }

  /**
   * Récupère les données du rapport Inventaire Cheptel
   */
  async getHerdInventory(filters: Omit<ReportFilters, 'type'>): Promise<HerdInventoryReport> {
    return this.getReportData<HerdInventoryReport>({ ...filters, type: 'herd_inventory' });
  }

  /**
   * Récupère les données du rapport Traitements
   */
  async getTreatmentsReport(filters: Omit<ReportFilters, 'type'>): Promise<TreatmentsReport> {
    return this.getReportData<TreatmentsReport>({ ...filters, type: 'treatments' });
  }

  /**
   * Récupère les données du rapport Vaccinations
   */
  async getVaccinationsReport(filters: Omit<ReportFilters, 'type'>): Promise<VaccinationsReport> {
    return this.getReportData<VaccinationsReport>({ ...filters, type: 'vaccinations' });
  }

  /**
   * Récupère les données du rapport Croissance
   */
  async getGrowthReport(filters: Omit<ReportFilters, 'type'>): Promise<GrowthReport> {
    return this.getReportData<GrowthReport>({ ...filters, type: 'growth' });
  }

  /**
   * Récupère les données du rapport Mouvements
   */
  async getMovementsReport(filters: Omit<ReportFilters, 'type'>): Promise<MovementsReport> {
    return this.getReportData<MovementsReport>({ ...filters, type: 'movements' });
  }
}

export const reportsService = new ReportsService();
