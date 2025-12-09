'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  REPORT_DEFINITIONS,
  ReportPeriod,
  ReportFormat,
  ReportDefinition,
  getPeriodDates,
} from '@/lib/types/report';
import { reportsService } from '@/lib/services/reports.service';
import type {
  HerdInventoryReport,
  TreatmentsReport,
  VaccinationsReport,
  GrowthReport,
  MovementsReport,
} from '@/lib/services/reports.service';
import {
  exportHerdInventory,
  exportTreatmentsReport,
  exportVaccinationsReport,
  exportGrowthReport,
  exportMovementsReport,
  type ExportFormat,
} from '@/lib/utils/report-export';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { useToast } from '@/contexts/toast-context';
import { handleApiError } from '@/lib/utils/api-error-handler';
import {
  Beef,
  Syringe,
  Pill,
  ArrowLeftRight,
  TrendingUp,
  Download,
  FileText,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';

const iconMap = {
  Beef,
  Syringe,
  Pill,
  ArrowLeftRight,
  TrendingUp,
};

const ANIMAL_STATUSES = ['all', 'alive', 'sold', 'dead', 'slaughtered', 'draft'] as const;

export default function ReportsPage() {
  const t = useTranslations('reports');
  const tc = useCommonTranslations();
  const toast = useToast();

  // Filtres globaux
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [animalStatus, setAnimalStatus] = useState<string>('all');

  // État de chargement par rapport
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  // Obtenir les dates selon la période sélectionnée
  const getSelectedDates = useCallback(() => {
    if (period === 'custom') {
      return {
        fromDate: customFromDate || undefined,
        toDate: customToDate || undefined,
      };
    }
    return getPeriodDates(period);
  }, [period, customFromDate, customToDate]);

  // Générer et exporter un rapport
  const handleGenerateReport = useCallback(
    async (report: ReportDefinition, format: ExportFormat) => {
      const reportKey = `${report.id}-${format}`;
      setLoadingReport(reportKey);

      try {
        const dates = getSelectedDates();
        const filters = {
          fromDate: dates.fromDate,
          toDate: dates.toDate,
          animalStatus: animalStatus as any,
        };

        const exportOptions = {
          period: dates.fromDate && dates.toDate ? { from: dates.fromDate, to: dates.toDate } : undefined,
        };

        switch (report.type) {
          case 'herd_inventory': {
            const data = await reportsService.getHerdInventory(filters);
            exportHerdInventory(data, format, t, exportOptions);
            break;
          }
          case 'treatments': {
            const data = await reportsService.getTreatmentsReport(filters);
            exportTreatmentsReport(data, format, t, exportOptions);
            break;
          }
          case 'vaccinations': {
            const data = await reportsService.getVaccinationsReport(filters);
            exportVaccinationsReport(data, format, t, exportOptions);
            break;
          }
          case 'growth': {
            const data = await reportsService.getGrowthReport(filters);
            exportGrowthReport(data, format, t, exportOptions);
            break;
          }
          case 'movements': {
            const data = await reportsService.getMovementsReport(filters);
            exportMovementsReport(data, format, t, exportOptions);
            break;
          }
        }

        toast.success(tc('messages.success'), t('messages.exportSuccess'));
      } catch (error) {
        handleApiError(error, 'reports.generate', toast);
      } finally {
        setLoadingReport(null);
      }
    },
    [getSelectedDates, animalStatus, t, tc, toast]
  );

  // Couleur de catégorie
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'health':
        return {
          border: 'border-blue-200 dark:border-blue-800',
          bg: 'bg-blue-100 dark:bg-blue-900',
          icon: 'text-blue-600 dark:text-blue-400',
        };
      case 'production':
        return {
          border: 'border-green-200 dark:border-green-800',
          bg: 'bg-green-100 dark:bg-green-900',
          icon: 'text-green-600 dark:text-green-400',
        };
      case 'regulatory':
        return {
          border: 'border-purple-200 dark:border-purple-800',
          bg: 'bg-purple-100 dark:bg-purple-900',
          icon: 'text-purple-600 dark:text-purple-400',
        };
      default:
        return {
          border: 'border-gray-200 dark:border-gray-800',
          bg: 'bg-gray-100 dark:bg-gray-900',
          icon: 'text-gray-600 dark:text-gray-400',
        };
    }
  };

  // Composant carte de rapport
  const ReportCard = ({ report }: { report: ReportDefinition }) => {
    const Icon = iconMap[report.icon as keyof typeof iconMap];
    const styles = getCategoryStyles(report.category);
    const isLoading = loadingReport?.startsWith(report.id);

    return (
      <Card className={styles.border}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${styles.bg}`}>
                <Icon className={`h-5 w-5 ${styles.icon}`} />
              </div>
              <div>
                <CardTitle className="text-base">
                  {t(`definitions.${report.id}.name`)}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {t(`definitions.${report.id}.description`)}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGenerateReport(report, 'csv')}
              disabled={isLoading}
            >
              {loadingReport === `${report.id}-csv` ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <FileText className="mr-1 h-3 w-3" />
              )}
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGenerateReport(report, 'xlsx')}
              disabled={isLoading}
            >
              {loadingReport === `${report.id}-xlsx` ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-1 h-3 w-3" />
              )}
              Excel
            </Button>
            <Button
              size="sm"
              onClick={() => handleGenerateReport(report, 'pdf')}
              disabled={isLoading}
            >
              {loadingReport === `${report.id}-pdf` ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Download className="mr-1 h-3 w-3" />
              )}
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Grouper les rapports par catégorie
  const healthReports = REPORT_DEFINITIONS.filter(r => r.category === 'health');
  const productionReports = REPORT_DEFINITIONS.filter(r => r.category === 'production');
  const regulatoryReports = REPORT_DEFINITIONS.filter(r => r.category === 'regulatory');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      {/* Filtres globaux */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.title')}</CardTitle>
          <CardDescription>{t('settings.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Période */}
            <div className="space-y-2">
              <Label htmlFor="period">{t('period.label')}</Label>
              <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">{t('period.week')}</SelectItem>
                  <SelectItem value="month">{t('period.month')}</SelectItem>
                  <SelectItem value="quarter">{t('period.quarter')}</SelectItem>
                  <SelectItem value="year">{t('period.year')}</SelectItem>
                  <SelectItem value="custom">{t('period.custom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates personnalisées */}
            {period === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label>{t('filters.fromDate')}</Label>
                  <Input
                    type="date"
                    value={customFromDate}
                    onChange={(e) => setCustomFromDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('filters.toDate')}</Label>
                  <Input
                    type="date"
                    value={customToDate}
                    onChange={(e) => setCustomToDate(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Statut animal */}
            <div className="space-y-2">
              <Label>{t('filters.animalStatus')}</Label>
              <Select value={animalStatus} onValueChange={setAnimalStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANIMAL_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`animalStatus.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rapports Santé */}
      {healthReports.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('categoryTitles.health')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {healthReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      )}

      {/* Rapports Production */}
      {productionReports.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('categoryTitles.production')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {productionReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      )}

      {/* Rapports Réglementaires */}
      {regulatoryReports.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('categoryTitles.regulatory')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regulatoryReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
