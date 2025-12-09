'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useLots } from '@/lib/hooks/useLots';
import { useSpecies } from '@/lib/hooks/useSpecies';
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
  Eye,
  X,
} from 'lucide-react';

const iconMap = {
  Beef,
  Syringe,
  Pill,
  ArrowLeftRight,
  TrendingUp,
};

const ANIMAL_STATUSES = ['all', 'alive', 'sold', 'dead', 'slaughtered', 'draft'] as const;

type PreviewData = {
  type: string;
  data: HerdInventoryReport | TreatmentsReport | VaccinationsReport | GrowthReport | MovementsReport;
} | null;

export default function ReportsPage() {
  const t = useTranslations('reports');
  const tc = useCommonTranslations();
  const toast = useToast();

  // Hooks pour lots et espèces
  const { lots, loading: lotsLoading } = useLots({ limit: 100 });
  const { species, loading: speciesLoading } = useSpecies();

  // Filtres globaux
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [animalStatus, setAnimalStatus] = useState<string>('all');
  const [selectedLotIds, setSelectedLotIds] = useState<string[]>([]);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('all');

  // État de chargement par rapport
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  // État pour l'aperçu
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

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

  // Construire les filtres communs
  const buildFilters = useCallback(() => {
    const dates = getSelectedDates();
    return {
      fromDate: dates.fromDate,
      toDate: dates.toDate,
      animalStatus: animalStatus as any,
      lotIds: selectedLotIds.length > 0 ? selectedLotIds : undefined,
      speciesId: selectedSpeciesId !== 'all' ? selectedSpeciesId : undefined,
    };
  }, [getSelectedDates, animalStatus, selectedLotIds, selectedSpeciesId]);

  // Aperçu d'un rapport
  const handlePreview = useCallback(
    async (report: ReportDefinition) => {
      setPreviewLoading(true);
      setPreviewOpen(true);

      try {
        const filters = buildFilters();
        let data: any;

        switch (report.type) {
          case 'herd_inventory':
            data = await reportsService.getHerdInventory(filters);
            break;
          case 'treatments':
            data = await reportsService.getTreatmentsReport(filters);
            break;
          case 'vaccinations':
            data = await reportsService.getVaccinationsReport(filters);
            break;
          case 'growth':
            data = await reportsService.getGrowthReport(filters);
            break;
          case 'movements':
            data = await reportsService.getMovementsReport(filters);
            break;
        }

        setPreviewData({ type: report.type, data });
      } catch (error) {
        handleApiError(error, 'reports.preview', toast);
        setPreviewOpen(false);
      } finally {
        setPreviewLoading(false);
      }
    },
    [buildFilters, toast]
  );

  // Générer et exporter un rapport
  const handleGenerateReport = useCallback(
    async (report: ReportDefinition, format: ExportFormat) => {
      const reportKey = `${report.id}-${format}`;
      setLoadingReport(reportKey);

      try {
        const filters = buildFilters();

        const exportOptions = {
          period: filters.fromDate && filters.toDate ? { from: filters.fromDate, to: filters.toDate } : undefined,
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
    [buildFilters, t, tc, toast]
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePreview(report)}
              title={t('preview.title')}
            >
              <Eye className="h-4 w-4" />
            </Button>
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
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

            {/* Espèce */}
            <div className="space-y-2">
              <Label>{t('filters.species')}</Label>
              <Select
                value={selectedSpeciesId}
                onValueChange={setSelectedSpeciesId}
                disabled={speciesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={speciesLoading ? tc('loading') : undefined} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tc('all')}</SelectItem>
                  {species.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lot */}
            <div className="space-y-2">
              <Label>{t('filters.lot')}</Label>
              <Select
                value={selectedLotIds.length === 1 ? selectedLotIds[0] : selectedLotIds.length > 1 ? 'multiple' : 'all'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setSelectedLotIds([]);
                  } else if (value !== 'multiple') {
                    setSelectedLotIds([value]);
                  }
                }}
                disabled={lotsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={lotsLoading ? tc('loading') : undefined} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tc('all')}</SelectItem>
                  {lots.map((lot) => (
                    <SelectItem key={lot.id} value={lot.id}>
                      {lot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtres actifs */}
          {(selectedLotIds.length > 0 || selectedSpeciesId !== 'all' || animalStatus !== 'all') && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">{t('filters.active')}:</span>
              {animalStatus !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {t(`animalStatus.${animalStatus}`)}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setAnimalStatus('all')}
                  />
                </Badge>
              )}
              {selectedSpeciesId !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {species.find(s => s.id === selectedSpeciesId)?.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedSpeciesId('all')}
                  />
                </Badge>
              )}
              {selectedLotIds.map(lotId => {
                const lot = lots.find(l => l.id === lotId);
                return (
                  <Badge key={lotId} variant="secondary" className="gap-1">
                    {lot?.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedLotIds(prev => prev.filter(id => id !== lotId))}
                    />
                  </Badge>
                );
              })}
            </div>
          )}
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

      {/* Dialog Aperçu */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('preview.title')}</DialogTitle>
            <DialogDescription>{t('preview.description')}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {previewLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : previewData ? (
              <PreviewTable data={previewData} t={t} />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Composant pour afficher l'aperçu des données
function PreviewTable({ data, t }: { data: PreviewData; t: (key: string) => string }) {
  if (!data) return null;

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  switch (data.type) {
    case 'herd_inventory': {
      const report = data.data as HerdInventoryReport;
      const details = report?.details || [];
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.visualId')}</TableHead>
              <TableHead>{t('columns.species')}</TableHead>
              <TableHead>{t('columns.breed')}</TableHead>
              <TableHead>{t('columns.sex')}</TableHead>
              <TableHead>{t('columns.birthDate')}</TableHead>
              <TableHead>{t('columns.status')}</TableHead>
              <TableHead>{t('columns.lot')}</TableHead>
              <TableHead className="text-right">{t('columns.weight')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.slice(0, 50).map((animal, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{animal.visualId}</TableCell>
                <TableCell>{animal.species}</TableCell>
                <TableCell>{animal.breed}</TableCell>
                <TableCell>{animal.sex}</TableCell>
                <TableCell>{formatDate(animal.birthDate)}</TableCell>
                <TableCell>{animal.status}</TableCell>
                <TableCell>{animal.lotName || '-'}</TableCell>
                <TableCell className="text-right">
                  {animal.currentWeight ? `${animal.currentWeight} kg` : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    case 'treatments': {
      const report = data.data as TreatmentsReport;
      const details = report?.details || [];
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.date')}</TableHead>
              <TableHead>{t('columns.visualId')}</TableHead>
              <TableHead>{t('columns.type')}</TableHead>
              <TableHead>{t('columns.product')}</TableHead>
              <TableHead>{t('columns.veterinarian')}</TableHead>
              <TableHead>{t('columns.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.slice(0, 50).map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell className="font-medium">{item.visualId}</TableCell>
                <TableCell>{item.type || '-'}</TableCell>
                <TableCell>{item.productName || '-'}</TableCell>
                <TableCell>{item.veterinarian || '-'}</TableCell>
                <TableCell>{item.status || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    case 'vaccinations': {
      const report = data.data as VaccinationsReport;
      const details = report?.details || [];
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.date')}</TableHead>
              <TableHead>{t('columns.visualId')}</TableHead>
              <TableHead>{t('columns.product')}</TableHead>
              <TableHead>{t('columns.batchNumber')}</TableHead>
              <TableHead>{t('columns.veterinarian')}</TableHead>
              <TableHead>{t('columns.nextDueDate')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.slice(0, 50).map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell className="font-medium">{item.visualId}</TableCell>
                <TableCell>{item.productName || '-'}</TableCell>
                <TableCell>{item.batchNumber || '-'}</TableCell>
                <TableCell>{item.veterinarian || '-'}</TableCell>
                <TableCell>{item.nextDueDate ? formatDate(item.nextDueDate) : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    case 'growth': {
      const report = data.data as GrowthReport;
      const byLot = report?.byLot || [];
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.lot')}</TableHead>
              <TableHead className="text-right">{t('columns.animalCount')}</TableHead>
              <TableHead className="text-right">{t('columns.avgWeight')}</TableHead>
              <TableHead className="text-right">{t('columns.avgDailyGain')}</TableHead>
              <TableHead>{t('columns.gmqStatus')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {byLot.map((lot, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{lot.lotName}</TableCell>
                <TableCell className="text-right">{lot.animalCount}</TableCell>
                <TableCell className="text-right">{lot.avgWeight?.toFixed(1)} kg</TableCell>
                <TableCell className="text-right">{lot.avgDailyGain?.toFixed(2)} kg/j</TableCell>
                <TableCell>
                  <Badge variant={
                    lot.gmqStatus === 'excellent' ? 'default' :
                    lot.gmqStatus === 'good' ? 'secondary' :
                    lot.gmqStatus === 'warning' ? 'warning' : 'destructive'
                  }>
                    {t(`gmqStatus.${lot.gmqStatus}`)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    case 'movements': {
      const report = data.data as MovementsReport;
      const details = report?.details || [];
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.date')}</TableHead>
              <TableHead>{t('columns.type')}</TableHead>
              <TableHead>{t('columns.visualId')}</TableHead>
              <TableHead>{t('columns.source')}</TableHead>
              <TableHead>{t('columns.destination')}</TableHead>
              <TableHead>{t('columns.reason')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.slice(0, 50).map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell>{item.type || '-'}</TableCell>
                <TableCell className="font-medium">{item.visualId}</TableCell>
                <TableCell>{item.source || '-'}</TableCell>
                <TableCell>{item.destination || '-'}</TableCell>
                <TableCell>{item.reason || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    default:
      return null;
  }
}
