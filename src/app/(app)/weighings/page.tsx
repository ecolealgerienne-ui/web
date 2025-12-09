'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Scale, Users, TrendingUp, TrendingDown, Minus, Download, Calendar } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/data/common/DataTable';
import { WeightDialog } from '@/components/weighings/weight-dialog';
import { useWeighings } from '@/lib/hooks/useWeighings';
import { useToast } from '@/contexts/toast-context';
import type { Weighing, WeightSource, CreateWeightDto, UpdateWeightDto } from '@/lib/types/weighing';
import { weighingsService } from '@/lib/services/weighings.service';
import { dashboardService } from '@/lib/services/dashboard.service';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { handleApiError } from '@/lib/utils/api-error-handler';

const WEIGHT_SOURCES: WeightSource[] = ['manual', 'scale', 'estimated', 'automatic', 'weighbridge'];

/**
 * Retourne la variante de badge selon la source
 */
function getSourceVariant(source?: WeightSource): 'default' | 'secondary' | 'destructive' | 'warning' | 'success' {
  switch (source) {
    case 'scale': return 'success';
    case 'automatic': return 'success';
    case 'weighbridge': return 'default';
    case 'manual': return 'secondary';
    case 'estimated': return 'warning';
    default: return 'secondary';
  }
}

/**
 * Exporte les pesées en CSV
 */
function exportToCSV(weighings: Weighing[], t: (key: string) => string): void {
  const headers = [
    t('labels.animal'),
    t('fields.weight'),
    t('fields.weightDate'),
    t('fields.source'),
    t('labels.rate'),
    t('fields.notes'),
  ];

  const rows = weighings.map(weighing => [
    weighing.animal?.officialNumber || weighing.animal?.visualId || weighing.animalId,
    `${weighing.weight} kg`,
    new Date(weighing.weightDate).toLocaleDateString('fr-FR'),
    weighing.source ? t(`source.${weighing.source}`) : '-',
    weighing.dailyGain !== null && weighing.dailyGain !== undefined
      ? `${weighing.dailyGain.toFixed(2)} kg/j`
      : '-',
    weighing.notes || '-',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pesees_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

interface DashboardWeightStats {
  weighingsThisMonth: number;
  avgDailyGainTrend: 'up' | 'down' | 'stable';
}

export default function WeighingsPage() {
  const t = useTranslations('weighings');
  const tc = useCommonTranslations();
  const toast = useToast();

  // Hook avec params/setParams pour la pagination (règle 7.7)
  const { weighings, total, loading, error, params, setParams, refetch } = useWeighings();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedWeighing, setSelectedWeighing] = useState<Weighing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [weighingToDelete, setWeighingToDelete] = useState<Weighing | null>(null);

  // Stats from weighings service
  const [stats, setStats] = useState<{
    totalWeighings: number;
    uniqueAnimals: number;
    latestAvgWeight: number;
    avgDailyGain: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Dashboard stats for additional info
  const [dashboardStats, setDashboardStats] = useState<DashboardWeightStats | null>(null);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [weightStats, dashboard] = await Promise.all([
        weighingsService.getStats({
          fromDate: params.fromDate,
          toDate: params.toDate,
        }),
        dashboardService.getStatsV2(),
      ]);

      setStats({
        totalWeighings: weightStats.totalWeighings,
        uniqueAnimals: weightStats.uniqueAnimals,
        latestAvgWeight: weightStats.weights?.latestAvg ?? 0,
        avgDailyGain: weightStats.growth?.avgDailyGain ?? 0,
      });

      setDashboardStats({
        weighingsThisMonth: dashboard.weights.weighingsThisMonth,
        avgDailyGainTrend: dashboard.weights.avgDailyGainTrend,
      });
    } catch (err) {
      handleApiError(err, 'weighings.fetchStats', toast);
    } finally {
      setStatsLoading(false);
    }
  }, [params.fromDate, params.toDate, toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Refresh all data after CRUD operations
  const refreshAll = useCallback(async () => {
    await Promise.all([refetch(), fetchStats()]);
  }, [refetch, fetchStats]);

  // Client-side search filtering
  const filteredWeighings = useMemo(() => {
    if (!params.search) return weighings;
    const search = params.search.toLowerCase();
    return weighings.filter((w) => {
      const animal = w.animal;
      return (
        animal?.officialNumber?.toLowerCase().includes(search) ||
        animal?.visualId?.toLowerCase().includes(search) ||
        w.animalId.toLowerCase().includes(search)
      );
    });
  }, [weighings, params.search]);

  // Handlers
  const handleView = (weighing: Weighing) => {
    setSelectedWeighing(weighing);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (weighing: Weighing) => {
    setSelectedWeighing(weighing);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedWeighing(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleDeleteClick = (weighing: Weighing) => {
    setWeighingToDelete(weighing);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = useCallback(async (data: CreateWeightDto | UpdateWeightDto) => {
    setIsSubmitting(true);
    try {
      if (dialogMode === 'create') {
        await weighingsService.create(data as CreateWeightDto);
        toast.success(tc('messages.success'), t('messages.createSuccess'));
      } else if (dialogMode === 'edit' && selectedWeighing) {
        await weighingsService.update(selectedWeighing.id, data as UpdateWeightDto);
        toast.success(tc('messages.success'), t('messages.updateSuccess'));
      }
      setDialogOpen(false);
      refreshAll();
    } catch (err) {
      handleApiError(err, 'weighings.submit', toast);
    } finally {
      setIsSubmitting(false);
    }
  }, [dialogMode, selectedWeighing, refreshAll, toast, tc, t]);

  const confirmDelete = useCallback(async () => {
    if (!weighingToDelete) return;
    try {
      await weighingsService.delete(weighingToDelete.id);
      toast.success(tc('messages.success'), t('messages.deleteSuccess'));
      setIsDeleteDialogOpen(false);
      setWeighingToDelete(null);
      refreshAll();
    } catch (err) {
      handleApiError(err, 'weighings.delete', toast);
    }
  }, [weighingToDelete, refreshAll, toast, tc, t]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedWeighing) return;
    const currentIndex = weighings.findIndex((w) => w.id === selectedWeighing.id);
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < weighings.length) {
      setSelectedWeighing(weighings[newIndex]);
    }
  };

  // Handlers pour la pagination et les filtres (règle 7.7)
  const handlePageChange = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, [setParams]);

  const handleLimitChange = useCallback((limit: number) => {
    setParams(prev => ({ ...prev, limit, page: 1 }));
  }, [setParams]);

  const handleSearchChange = useCallback((search: string) => {
    setParams(prev => ({ ...prev, search: search || undefined, page: 1 }));
  }, [setParams]);

  const handleSourceChange = useCallback((source: string) => {
    setParams(prev => ({ ...prev, source: source === 'all' ? undefined : source as WeightSource, page: 1 }));
  }, [setParams]);

  const handleFromDateChange = useCallback((fromDate: string) => {
    setParams(prev => ({ ...prev, fromDate: fromDate || undefined, page: 1 }));
  }, [setParams]);

  const handleToDateChange = useCallback((toDate: string) => {
    setParams(prev => ({ ...prev, toDate: toDate || undefined, page: 1 }));
  }, [setParams]);

  // Export function
  const handleExport = useCallback(() => {
    exportToCSV(weighings, t);
  }, [weighings, t]);

  // Trend icon component
  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  // Table columns
  const columns: ColumnDef<Weighing>[] = [
    {
      key: 'animal',
      header: t('labels.animal'),
      sortable: true,
      render: (weighing: Weighing) => (
        <span className="font-mono text-sm">
          {weighing.animal?.officialNumber || weighing.animal?.visualId || weighing.animalId.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'weight',
      header: t('fields.weight'),
      sortable: true,
      render: (weighing: Weighing) => (
        <span className="text-sm font-medium">{weighing.weight} kg</span>
      ),
    },
    {
      key: 'weightDate',
      header: t('fields.weightDate'),
      sortable: true,
      render: (weighing: Weighing) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {new Date(weighing.weightDate).toLocaleDateString('fr-FR')}
          </span>
        </div>
      ),
    },
    {
      key: 'source',
      header: t('fields.source'),
      sortable: true,
      render: (weighing: Weighing) => (
        <Badge variant={getSourceVariant(weighing.source)}>
          {t(`source.${weighing.source || 'undefined'}`)}
        </Badge>
      ),
    },
    {
      key: 'dailyGain',
      header: t('labels.rate'),
      sortable: true,
      render: (weighing: Weighing) => {
        if (weighing.dailyGain === null || weighing.dailyGain === undefined) {
          return <span className="text-muted-foreground">-</span>;
        }
        const isPositive = weighing.dailyGain >= 0;
        return (
          <span className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {weighing.dailyGain.toFixed(2)} kg/j
          </span>
        );
      },
    },
  ];

  // Filtres personnalisés
  const filtersComponent = (
    <div className="flex flex-wrap gap-2 items-end">
      {/* Filtre par source */}
      <Select value={params.source || 'all'} onValueChange={handleSourceChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder={t('source.all')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('source.all')}</SelectItem>
          {WEIGHT_SOURCES.map((source) => (
            <SelectItem key={source} value={source}>
              {t(`source.${source}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtre par date de début */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">{t('filters.fromDate')}</Label>
        <Input
          type="date"
          value={params.fromDate || ''}
          onChange={(e) => handleFromDateChange(e.target.value)}
          className="w-[150px]"
        />
      </div>

      {/* Filtre par date de fin */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">{t('filters.toDate')}</Label>
        <Input
          type="date"
          value={params.toDate || ''}
          onChange={(e) => handleToDateChange(e.target.value)}
          className="w-[150px]"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={weighings.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            {tc('actions.export')}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('newWeighing')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold">
              {statsLoading ? '-' : stats?.totalWeighings ?? 0}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{t('stats.total')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold text-blue-600">
              {statsLoading ? '-' : dashboardStats?.weighingsThisMonth ?? 0}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{t('stats.thisMonth')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold">
              {statsLoading ? '-' : stats?.uniqueAnimals ?? 0}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{t('stats.uniqueAnimals')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">
            {statsLoading ? '-' : `${stats?.latestAvgWeight?.toFixed(1) ?? 0} kg`}
          </div>
          <p className="text-xs text-muted-foreground">{t('stats.latestAvgWeight')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            {!statsLoading && dashboardStats && (
              <TrendIcon trend={dashboardStats.avgDailyGainTrend} />
            )}
            <span className="text-2xl font-bold text-green-600">
              {statsLoading ? '-' : `${stats?.avgDailyGain?.toFixed(2) ?? 0} kg/j`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{t('stats.avgDailyGain')}</p>
        </div>
      </div>

      {/* DataTable avec pagination serveur (règle 7.7) */}
      <DataTable<Weighing>
        data={filteredWeighings}
        columns={columns}
        totalItems={params.search ? filteredWeighings.length : total}
        page={params.page || 1}
        limit={params.limit || 25}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        loading={loading}
        error={error}
        searchValue={params.search || ''}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t('searchPlaceholder')}
        onRowClick={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        emptyMessage={t('messages.noWeighings')}
        filters={filtersComponent}
      />

      {/* Weight Dialog */}
      <WeightDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        weighing={selectedWeighing}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        weighings={weighings}
        onNavigate={handleNavigate}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('messages.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('messages.deleteConfirmDescription')}
              <br />
              <span className="text-destructive font-medium">
                {tc('messages.actionIrreversible')}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {tc('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
