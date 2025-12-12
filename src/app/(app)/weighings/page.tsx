'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Plus, Search, Loader2, Edit, Trash2, Scale, Users, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/data/common/DataTable';
import { WeightDialog } from '@/components/weighings/weight-dialog';
import { Sparkline, SparklineDataPoint } from '@/components/ui/charts/sparkline';
import { useWeighings } from '@/lib/hooks/useWeighings';
import { useLots } from '@/lib/hooks/useLots';
import { useToast } from '@/contexts/toast-context';
import type { Weighing, WeightStats, QueryWeightDto, WeightSource, CreateWeightDto, UpdateWeightDto } from '@/lib/types/weighing';
import { weighingsService } from '@/lib/services/weighings.service';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const WEIGHT_SOURCES: WeightSource[] = ['manual', 'scale', 'estimated'];

// Period options for filtering
interface PeriodOption {
  value: string;
  labelKey: string;
  days: number;
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { value: '1month', labelKey: 'period.1month', days: 30 },
  { value: '3months', labelKey: 'period.3months', days: 90 },
  { value: '6months', labelKey: 'period.6months', days: 180 },
  { value: '1year', labelKey: 'period.1year', days: 365 },
  { value: '2years', labelKey: 'period.2years', days: 730 },
  { value: 'all', labelKey: 'period.all', days: 0 },
];

export default function WeighingsPage() {
  const t = useTranslations('weighings');
  const td = useTranslations('dashboard');
  const tl = useTranslations('lots');
  const tc = useCommonTranslations();
  const toast = useToast();

  // Fetch lots for filter
  const { lots } = useLots();

  // Period state
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1month');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filters state (includes pagination for server-side)
  const [filters, setFilters] = useState<QueryWeightDto & { search?: string }>({});

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const periodConfig = PERIOD_OPTIONS.find(p => p.value === selectedPeriod) || PERIOD_OPTIONS[0];

    // 'all' option = no date filter
    if (periodConfig.days === 0) {
      return {
        fromDate: undefined,
        toDate: undefined,
      };
    }

    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - periodConfig.days);
    return {
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0],
    };
  }, [selectedPeriod]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedWeighing, setSelectedWeighing] = useState<Weighing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [weighingToDelete, setWeighingToDelete] = useState<Weighing | null>(null);

  // Stats state
  const [stats, setStats] = useState<WeightStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Sparkline data state
  const [sparklineData, setSparklineData] = useState<{
    weighingsPerWeek: SparklineDataPoint[];
    avgWeightPerWeek: SparklineDataPoint[];
    avgGmqPerWeek: SparklineDataPoint[];
  }>({
    weighingsPerWeek: [],
    avgWeightPerWeek: [],
    avgGmqPerWeek: [],
  });

  // Fetch weighings with server-side pagination (using dateRange for dates)
  const { weighings, meta, loading, refresh } = useWeighings({
    ...filters,
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    page,
    limit,
  });

  // Fetch stats based on date range
  const fetchStats = useCallback(async (fromDate?: string, toDate?: string) => {
    setStatsLoading(true);
    try {
      const data = await weighingsService.getStats({
        fromDate,
        toDate,
      });
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Re-fetch stats when date range changes
  useEffect(() => {
    fetchStats(dateRange.fromDate, dateRange.toDate);
  }, [dateRange.fromDate, dateRange.toDate, fetchStats]);

  // Fetch sparkline data (all weighings for the period)
  const fetchSparklineData = useCallback(async (fromDate?: string, toDate?: string) => {
    try {
      const allWeighings = await weighingsService.getAllForExport({
        fromDate,
        toDate,
      });

      if (allWeighings.length === 0) {
        setSparklineData({
          weighingsPerWeek: [],
          avgWeightPerWeek: [],
          avgGmqPerWeek: [],
        });
        return;
      }

      // Group weighings by week
      const weeklyData = new Map<string, { weighings: Weighing[]; weekStart: Date }>();

      allWeighings.forEach((w) => {
        const date = new Date(w.weightDate);
        // Get week start (Monday)
        const weekStart = new Date(date);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        weekStart.setDate(diff);
        weekStart.setHours(0, 0, 0, 0);

        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, { weighings: [], weekStart });
        }
        weeklyData.get(weekKey)!.weighings.push(w);
      });

      // Sort weeks chronologically
      const sortedWeeks = Array.from(weeklyData.entries())
        .sort(([a], [b]) => a.localeCompare(b));

      // Calculate sparkline data
      const weighingsPerWeek: SparklineDataPoint[] = sortedWeeks.map(([, data]) => ({
        value: data.weighings.length,
        label: data.weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      }));

      const avgWeightPerWeek: SparklineDataPoint[] = sortedWeeks.map(([, data]) => {
        const totalWeight = data.weighings.reduce((sum, w) => sum + w.weight, 0);
        return {
          value: totalWeight / data.weighings.length,
          label: data.weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        };
      });

      const avgGmqPerWeek: SparklineDataPoint[] = sortedWeeks
        .map(([, data]) => {
          const weighingsWithGmq = data.weighings.filter(w => w.dailyGain !== null && w.dailyGain !== undefined);
          if (weighingsWithGmq.length === 0) return null;
          const totalGmq = weighingsWithGmq.reduce((sum, w) => sum + (w.dailyGain || 0), 0);
          return {
            value: totalGmq / weighingsWithGmq.length,
            label: data.weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          } as SparklineDataPoint;
        })
        .filter((d): d is SparklineDataPoint => d !== null);

      setSparklineData({
        weighingsPerWeek,
        avgWeightPerWeek,
        avgGmqPerWeek,
      });
    } catch (error) {
      console.error('Error fetching sparkline data:', error);
    }
  }, []);

  // Re-fetch sparkline data when date range changes
  useEffect(() => {
    fetchSparklineData(dateRange.fromDate, dateRange.toDate);
  }, [dateRange.fromDate, dateRange.toDate, fetchSparklineData]);

  // Refresh stats after CRUD operations
  const refreshAll = async () => {
    await Promise.all([
      refresh(),
      fetchStats(dateRange.fromDate, dateRange.toDate),
      fetchSparklineData(dateRange.fromDate, dateRange.toDate),
    ]);
  };

  // Client-side search filtering (filters current page only)
  const filteredWeighings = useMemo(() => {
    if (!filters.search) return weighings;
    const search = filters.search.toLowerCase();
    return weighings.filter((w) => {
      const animal = w.animal;
      return (
        animal?.officialNumber?.toLowerCase().includes(search) ||
        animal?.visualId?.toLowerCase().includes(search) ||
        w.animalId.toLowerCase().includes(search)
      );
    });
  }, [weighings, filters.search]);

  // Reset page when filters change
  const handleFilterChange = (newFilters: QueryWeightDto & { search?: string }) => {
    setFilters(newFilters);
    setPage(1);
  };

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

  const handleSubmit = async (data: CreateWeightDto | UpdateWeightDto) => {
    setIsSubmitting(true);
    try {
      if (dialogMode === 'create') {
        await weighingsService.create(data as CreateWeightDto);
        toast.success(t('messages.createSuccess'));
      } else if (dialogMode === 'edit' && selectedWeighing) {
        await weighingsService.update(selectedWeighing.id, data as UpdateWeightDto);
        toast.success(t('messages.updateSuccess'));
      }
      setDialogOpen(false);
      refreshAll();
    } catch (error) {
      console.error('Error submitting weighing:', error);
      toast.error(dialogMode === 'create' ? t('messages.createError') : t('messages.updateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!weighingToDelete) return;
    try {
      await weighingsService.delete(weighingToDelete.id);
      toast.success(t('messages.deleteSuccess'));
      setIsDeleteDialogOpen(false);
      setWeighingToDelete(null);
      refreshAll();
    } catch (error) {
      console.error('Error deleting weighing:', error);
      toast.error(t('messages.deleteError'));
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedWeighing) return;
    const currentIndex = weighings.findIndex((w) => w.id === selectedWeighing.id);
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < weighings.length) {
      setSelectedWeighing(weighings[newIndex]);
    }
  };

  // Export to CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Fetch all data without pagination (using dateRange for dates)
      const allWeighings = await weighingsService.getAllForExport({
        lotId: filters.lotId,
        source: filters.source,
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
      });

      if (allWeighings.length === 0) {
        toast.error(t('messages.noDataToExport'));
        return;
      }

      // CSV headers
      const headers = [
        t('labels.animal'),
        t('fields.weight'),
        t('fields.weightDate'),
        t('fields.source'),
        t('labels.rate'),
      ];

      // CSV rows
      const rows = allWeighings.map((w) => [
        w.animal?.officialNumber || w.animal?.visualId || w.animalId,
        w.weight.toString(),
        new Date(w.weightDate).toLocaleDateString('fr-FR'),
        t(`source.${w.source || 'undefined'}`),
        w.dailyGain !== null && w.dailyGain !== undefined ? w.dailyGain.toFixed(2) : '',
      ]);

      // Build CSV content
      const csvContent = [
        headers.join(';'),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(';')),
      ].join('\n');

      // Add BOM for Excel compatibility with French characters
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `pesees_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('messages.exportSuccess', { count: allWeighings.length }));
    } catch (error) {
      console.error('Error exporting weighings:', error);
      toast.error(t('messages.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  // Table columns
  const columns: ColumnDef<Weighing>[] = [
    {
      key: 'animal',
      header: t('labels.animal'),
      render: (weighing: Weighing) => (
        <span className="font-mono text-sm">
          {weighing.animal?.officialNumber || weighing.animal?.visualId || weighing.animalId.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'weight',
      header: t('fields.weight'),
      render: (weighing: Weighing) => (
        <span className="text-sm font-medium">{weighing.weight} kg</span>
      ),
    },
    {
      key: 'weightDate',
      header: t('fields.weightDate'),
      render: (weighing: Weighing) => (
        <span className="text-sm">
          {new Date(weighing.weightDate).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'source',
      header: t('fields.source'),
      render: (weighing: Weighing) => (
        <Badge variant="secondary">{t(`source.${weighing.source || 'undefined'}`)}</Badge>
      ),
    },
    {
      key: 'dailyGain',
      header: t('labels.rate'),
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
    {
      key: 'actions',
      header: tc('table.actions'),
      align: 'right',
      render: (weighing: Weighing) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(weighing); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteClick(weighing); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Period Selector */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {PERIOD_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={selectedPeriod === option.value ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'text-xs h-8 px-3',
                  selectedPeriod === option.value && 'shadow-sm'
                )}
                onClick={() => {
                  setSelectedPeriod(option.value);
                  setPage(1); // Reset page when period changes
                }}
              >
                {td(option.labelKey)}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={handleExportCSV} disabled={isExporting || meta.total === 0}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {t('export.csv')}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('newWeighing')}
          </Button>
        </div>
      </div>

      {/* Stats with Sparklines */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Total Weighings */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {statsLoading ? '-' : stats?.totalWeighings ?? 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('stats.total')}</p>
            </div>
            {sparklineData.weighingsPerWeek.length >= 2 && (
              <Sparkline
                data={sparklineData.weighingsPerWeek}
                color="hsl(var(--primary))"
                height={40}
                width={80}
              />
            )}
          </div>
        </div>

        {/* Unique Animals */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">
              {statsLoading ? '-' : stats?.uniqueAnimals ?? 0}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t('stats.uniqueAnimals')}</p>
        </div>

        {/* Average Weight */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-bold">
                {statsLoading ? '-' : `${stats?.weights?.latestAvg?.toFixed(1) ?? 0} kg`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('stats.latestAvgWeight')}</p>
            </div>
            {sparklineData.avgWeightPerWeek.length >= 2 && (
              <Sparkline
                data={sparklineData.avgWeightPerWeek}
                color="hsl(var(--chart-2))"
                height={40}
                width={80}
              />
            )}
          </div>
        </div>

        {/* Average Daily Gain */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {statsLoading ? '-' : `${stats?.growth?.avgDailyGain?.toFixed(2) ?? 0} kg/j`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('stats.avgDailyGain')}</p>
            </div>
            {sparklineData.avgGmqPerWeek.length >= 2 && (
              <Sparkline
                data={sparklineData.avgGmqPerWeek}
                color="hsl(142.1 76.2% 36.3%)"
                height={40}
                width={80}
              />
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('filters.title')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={filters.search || ''}
                onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{tl('title')}</label>
            <Select
              value={filters.lotId || 'all'}
              onValueChange={(value) => handleFilterChange({
                ...filters,
                lotId: value === 'all' ? undefined : value
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('filters.allLots')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allLots')}</SelectItem>
                {lots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('fields.source')}</label>
            <Select
              value={filters.source || 'all'}
              onValueChange={(value) => handleFilterChange({
                ...filters,
                source: value === 'all' ? undefined : value as WeightSource
              })}
            >
              <SelectTrigger>
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
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : meta.total === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Scale className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">{t('messages.noWeighings')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('messages.noWeighingsDescription')}</p>
          <Button className="mt-4" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('newWeighing')}
          </Button>
        </div>
      ) : (
        <DataTable
          data={filteredWeighings}
          columns={columns}
          totalItems={filters.search ? filteredWeighings.length : meta.total}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          onRowClick={handleView}
        />
      )}

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
