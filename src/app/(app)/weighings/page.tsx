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
import { useWeighings } from '@/lib/hooks/useWeighings';
import { useLots } from '@/lib/hooks/useLots';
import { useToast } from '@/contexts/toast-context';
import type { Weighing, WeightStats, QueryWeightDto, WeightSource, CreateWeightDto, UpdateWeightDto } from '@/lib/types/weighing';
import { weighingsService } from '@/lib/services/weighings.service';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';

const WEIGHT_SOURCES: WeightSource[] = ['manual', 'scale', 'estimated'];

export default function WeighingsPage() {
  const t = useTranslations('weighings');
  const tl = useTranslations('lots');
  const tc = useCommonTranslations();
  const toast = useToast();

  // Fetch lots for filter
  const { lots } = useLots();

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filters state (includes pagination for server-side)
  const [filters, setFilters] = useState<QueryWeightDto & { search?: string }>({});

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

  // Fetch weighings with server-side pagination
  const { weighings, meta, loading, refresh } = useWeighings({
    ...filters,
    page,
    limit,
  });

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await weighingsService.getStats({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [filters.fromDate, filters.toDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Refresh stats after CRUD operations
  const refreshAll = async () => {
    await Promise.all([refresh(), fetchStats()]);
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
      // Fetch all data without pagination
      const allWeighings = await weighingsService.getAllForExport({
        lotId: filters.lotId,
        source: filters.source,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
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
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold">
              {statsLoading ? '-' : stats?.uniqueAnimals ?? 0}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{t('stats.uniqueAnimals')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">
            {statsLoading ? '-' : `${stats?.weights?.latestAvg?.toFixed(1) ?? 0} kg`}
          </div>
          <p className="text-xs text-muted-foreground">{t('stats.latestAvgWeight')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              {statsLoading ? '-' : `${stats?.growth?.avgDailyGain?.toFixed(2) ?? 0} kg/j`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{t('stats.avgDailyGain')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-5">
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

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('filters.fromDate')}</label>
            <Input
              type="date"
              value={filters.fromDate || ''}
              onChange={(e) => handleFilterChange({ ...filters, fromDate: e.target.value || undefined })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('filters.toDate')}</label>
            <Input
              type="date"
              value={filters.toDate || ''}
              onChange={(e) => handleFilterChange({ ...filters, toDate: e.target.value || undefined })}
            />
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
