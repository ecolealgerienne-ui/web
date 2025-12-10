// Types pour les rapports

export type ReportType =
  | 'herd_inventory'
  | 'vaccinations'
  | 'treatments'
  | 'movements'
  | 'growth'
  | 'health'
  | 'financial';

export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom';
export type ReportFormat = 'pdf' | 'excel' | 'csv';

export interface ReportDefinition {
  id: string;
  type: ReportType;
  name: string;
  description: string;
  icon: string;
  category: 'health' | 'production' | 'financial' | 'regulatory';
}

export interface ReportFilters {
  period: ReportPeriod;
  startDate?: string;
  endDate?: string;
  animalIds?: string[];
  lotIds?: string[];
  speciesId?: string;
}

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    id: 'herd-inventory',
    type: 'herd_inventory',
    name: 'Inventaire du Cheptel',
    description: 'État complet du cheptel par espèce, âge et statut',
    icon: 'Beef',
    category: 'production',
  },
  {
    id: 'vaccinations-report',
    type: 'vaccinations',
    name: 'Registre de Vaccinations',
    description: 'Historique des vaccinations et calendrier à venir',
    icon: 'Syringe',
    category: 'health',
  },
  {
    id: 'treatments-report',
    type: 'treatments',
    name: 'Registre des Traitements',
    description: 'Historique des traitements et délais d\'attente',
    icon: 'Pill',
    category: 'health',
  },
  {
    id: 'movements-report',
    type: 'movements',
    name: 'Mouvements d\'Animaux',
    description: 'Entrées, sorties, naissances et décès',
    icon: 'ArrowLeftRight',
    category: 'regulatory',
  },
  {
    id: 'growth-report',
    type: 'growth',
    name: 'Croissance et Performance',
    description: 'Évolution des poids et gains moyens quotidiens',
    icon: 'TrendingUp',
    category: 'production',
  },
  {
    id: 'health-report',
    type: 'health',
    name: 'Bilan Sanitaire',
    description: 'Taux de morbidité, mortalité et incidents sanitaires',
    icon: 'Activity',
    category: 'health',
  },
  {
    id: 'financial-report',
    type: 'financial',
    name: 'Rapport Financier',
    description: 'Coûts des soins vétérinaires et revenus',
    icon: 'DollarSign',
    category: 'financial',
  },
];
