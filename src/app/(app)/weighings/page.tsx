'use client';

import { useState, useMemo } from 'react';
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
import { Plus, Search, Loader2, Eye, Edit, Trash2, Scale } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/data/common/DataTable';
import { WeightDialog } from '@/components/weighings/weight-dialog';
import { useWeighings } from '@/lib/hooks/useWeighings';
import { useToast } from '@/contexts/toast-context';
import type { Weighing, QueryWeightDto, WeightSource, CreateWeightDto, UpdateWeightDto } from '@/lib/types/weighing';
import { weighingsService } from '@/lib/services/weighings.service';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';

const WEIGHT_SOURCES: WeightSource[] = ['manual', 'scale', 'estimated'];

export default function WeighingsPage() {
  const t = useTranslations('weighings');
  const tc = useCommonTranslations();
  const toast = useToast();

  // Filters state
  const [filters, setFilters] = useState<QueryWeightDto & { search?: string }>({
    search: '',
  });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedWeighing, setSelectedWeighing] = useState<Weighing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [weighingToDelete, setWeighingToDelete] = useState<Weighing | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch weighings
  const { weighings, loading, refresh } = useWeighings(filters);

  // Client-side search filtering
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

  // Paginated data
  const paginatedWeighings = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredWeighings.slice(startIndex, startIndex + limit);
  }, [filteredWeighings, page, limit]);

  // Reset page when filters change
  const handleFilterChange = (newFilters: QueryWeightDto & { search?: string }) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Stats
  const stats = useMemo(() => {
    const totalWeight = weighings.reduce((sum, w) => sum + w.weight, 0);
    const avgWeight = weighings.length > 0 ? totalWeight / weighings.length : 0;

    // Calculate average daily gain if we have dailyGain data
    const weighingsWithGrowth = weighings.filter((w) => w.dailyGain);
    const avgDailyGain = weighingsWithGrowth.length > 0
      ? weighingsWithGrowth.reduce((sum, w) => sum + (w.dailyGain || 0), 0) / weighingsWithGrowth.length
      : 0;

    return {
      total: weighings.length,
      manual: weighings.filter((w) => w.source === 'manual').length,
      avgWeight: avgWeight.toFixed(1),
      avgDailyGain: avgDailyGain.toFixed(2),
    };
  }, [weighings]);

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
      refresh();
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
      refresh();
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
      render: (weighing: Weighing) => (
        <span className={`text-sm ${weighing.dailyGain ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
          {weighing.dailyGain ? `${weighing.dailyGain.toFixed(2)} kg/j` : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: tc('table.actions'),
      align: 'right',
      render: (weighing: Weighing) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleView(weighing)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(weighing)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteClick(weighing)}>
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
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('newWeighing')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t('stats.total')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{stats.manual}</div>
          <p className="text-xs text-muted-foreground">{t('stats.manual')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{stats.avgWeight} kg</div>
          <p className="text-xs text-muted-foreground">{t('stats.avgWeight')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold text-green-600">{stats.avgDailyGain} kg/j</div>
          <p className="text-xs text-muted-foreground">{t('stats.avgDailyGain')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
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
      ) : filteredWeighings.length === 0 ? (
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
          data={paginatedWeighings}
          columns={columns}
          totalItems={filteredWeighings.length}
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
