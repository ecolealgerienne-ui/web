// Types pour les rapports

export type ReportType =
  | 'herd_inventory'
  | 'vaccinations'
  | 'treatments'
  | 'movements'
  | 'growth';

export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom';
export type ReportFormat = 'pdf' | 'xlsx' | 'csv';
export type ReportCategory = 'health' | 'production' | 'regulatory';

export interface ReportDefinition {
  id: string;
  type: ReportType;
  icon: string;
  category: ReportCategory;
}

export interface ReportFilters {
  period: ReportPeriod;
  fromDate?: string;
  toDate?: string;
  animalStatus?: 'all' | 'alive' | 'sold' | 'dead' | 'slaughtered' | 'draft';
  lotIds?: string[];
  speciesId?: string;
}

// Définitions des rapports disponibles (textes via i18n)
export const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    id: 'herd-inventory',
    type: 'herd_inventory',
    icon: 'Beef',
    category: 'production',
  },
  {
    id: 'vaccinations-report',
    type: 'vaccinations',
    icon: 'Syringe',
    category: 'health',
  },
  {
    id: 'treatments-report',
    type: 'treatments',
    icon: 'Pill',
    category: 'health',
  },
  {
    id: 'movements-report',
    type: 'movements',
    icon: 'ArrowLeftRight',
    category: 'regulatory',
  },
  {
    id: 'growth-report',
    type: 'growth',
    icon: 'TrendingUp',
    category: 'production',
  },
];

// Helper pour obtenir les dates selon la période
export function getPeriodDates(period: ReportPeriod): { fromDate: string; toDate: string } {
  const now = new Date();
  const toDate = now.toISOString().split('T')[0];
  let fromDate: string;

  switch (period) {
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      fromDate = weekAgo.toISOString().split('T')[0];
      break;
    case 'month':
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      fromDate = monthAgo.toISOString().split('T')[0];
      break;
    case 'quarter':
      const quarterAgo = new Date(now);
      quarterAgo.setMonth(quarterAgo.getMonth() - 3);
      fromDate = quarterAgo.toISOString().split('T')[0];
      break;
    case 'year':
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      fromDate = yearAgo.toISOString().split('T')[0];
      break;
    default:
      fromDate = toDate;
  }

  return { fromDate, toDate };
}
