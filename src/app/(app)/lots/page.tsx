'use client';

import { useState, useCallback } from 'react';
import { Plus, Package, Users, Download, TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useLots } from '@/lib/hooks/useLots';
import { Lot, CreateLotDto, UpdateLotDto } from '@/lib/types/lot';
import { lotsService } from '@/lib/services/lots.service';
import { LotDialog } from '@/components/lots/lot-dialog';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { DataTable, ColumnDef } from '@/components/data/common/DataTable';
import { handleApiError } from '@/lib/utils/api-error-handler';
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

/**
 * Retourne la variante de badge selon le type de lot
 */
function getLotTypeBadgeVariant(type: string): 'default' | 'secondary' | 'destructive' | 'success' | 'warning' {
  switch (type) {
    case 'fattening':
    case 'production':
      return 'default'; // Bleu - production
    case 'sale':
    case 'slaughter':
      return 'warning'; // Orange - sortie
    case 'purchase':
    case 'breeding':
    case 'reproduction':
      return 'success'; // Vert - entrée/reproduction
    case 'quarantine':
    case 'treatment':
    case 'vaccination':
      return 'destructive'; // Rouge - santé
    default:
      return 'secondary'; // Gris
  }
}

/**
 * Retourne l'icône de tendance GMQ
 */
function getGmqTrendIcon(gmq: number | undefined) {
  if (!gmq) return <Minus className="h-3 w-3 text-muted-foreground" />;
  if (gmq >= 1.0) return <TrendingUp className="h-3 w-3 text-green-600" />;
  if (gmq >= 0.5) return <Minus className="h-3 w-3 text-orange-500" />;
  return <TrendingDown className="h-3 w-3 text-red-600" />;
}

/**
 * Exporte les lots en CSV
 */
function exportToCSV(lots: Lot[], t: (key: string) => string, tc: (key: string) => string): void {
  const headers = [
    t('fields.name'),
    t('fields.type'),
    t('fields.status'),
    tc('labels.animals'),
    t('fields.avgWeight'),
    t('fields.gmq'),
    t('fields.progress'),
    t('fields.daysToTarget'),
  ];

  const rows = lots.map(lot => [
    lot.name,
    t(`type.${lot.type}`),
    t(`status.${lot.status}`),
    (lot._count?.lotAnimals || 0).toString(),
    lot.stats?.avgWeight ? `${lot.stats.avgWeight.toFixed(1)} kg` : '-',
    lot.stats?.avgDailyGain ? `${lot.stats.avgDailyGain.toFixed(2)} kg/j` : '-',
    lot.stats?.progress ? `${lot.stats.progress.toFixed(0)}%` : '-',
    lot.stats?.estimatedDaysToTarget ? `${lot.stats.estimatedDaysToTarget}j` : '-',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lots_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function LotsPage() {
  const t = useTranslations('lots');
  const tc = useCommonTranslations();
  const toast = useToast();

  // Hook avec params/setParams pour la pagination (règle 7.7)
  const { lots, total, loading, error, params, setParams, refetch } = useLots();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lotToDelete, setLotToDelete] = useState<Lot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = () => {
    setSelectedLot(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleViewDetail = (lot: Lot) => {
    setSelectedLot(lot);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedLot) return;
    const currentIndex = lots.findIndex((l) => l.id === selectedLot.id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < lots.length) {
      setSelectedLot(lots[newIndex]);
    }
  };

  const handleEdit = (lot: Lot) => {
    setSelectedLot(lot);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDelete = (lot: Lot) => {
    setLotToDelete(lot);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = useCallback(async (data: CreateLotDto | UpdateLotDto) => {
    setIsSubmitting(true);
    try {
      if (selectedLot) {
        await lotsService.update(selectedLot.id, data as UpdateLotDto);
        toast.success(tc('messages.success'), t('messages.updated'));
      } else {
        await lotsService.create(data as CreateLotDto);
        toast.success(tc('messages.success'), t('messages.created'));
      }
      setDialogOpen(false);
      refetch();
    } catch (error) {
      handleApiError(error, 'lots.submit', toast);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedLot, refetch, toast, tc, t]);

  const confirmDelete = useCallback(async () => {
    if (!lotToDelete) return;

    try {
      await lotsService.delete(lotToDelete.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      setIsDeleteDialogOpen(false);
      setLotToDelete(null);
      refetch();
    } catch (error) {
      handleApiError(error, 'lots.delete', toast);
    }
  }, [lotToDelete, refetch, toast, tc, t]);

  // Table columns with stats
  const columns: ColumnDef<Lot>[] = [
    {
      key: 'name',
      header: t('fields.name'),
      sortable: true,
      render: (lot) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{lot.name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: t('fields.type'),
      sortable: true,
      render: (lot) => (
        <Badge variant={getLotTypeBadgeVariant(lot.type)}>
          {t(`type.${lot.type}`)}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: t('fields.status'),
      sortable: true,
      render: (lot) => (
        <Badge variant={lot.status === 'open' ? 'success' : 'secondary'}>
          {t(`status.${lot.status}`)}
        </Badge>
      ),
    },
    {
      key: 'animals',
      header: tc('labels.animals'),
      sortable: false,
      render: (lot) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{lot._count?.lotAnimals || 0}</span>
        </div>
      ),
    },
    {
      key: 'avgWeight',
      header: t('fields.avgWeight'),
      sortable: false,
      render: (lot) => (
        <span className="text-muted-foreground">
          {lot.stats?.avgWeight ? `${lot.stats.avgWeight.toFixed(1)} kg` : '-'}
        </span>
      ),
    },
    {
      key: 'gmq',
      header: t('fields.gmq'),
      sortable: false,
      render: (lot) => (
        <div className="flex items-center gap-1">
          {getGmqTrendIcon(lot.stats?.avgDailyGain)}
          <span className={
            lot.stats?.avgDailyGain && lot.stats.avgDailyGain >= 1.0
              ? 'text-green-600 font-medium'
              : lot.stats?.avgDailyGain && lot.stats.avgDailyGain >= 0.5
                ? 'text-orange-500'
                : 'text-muted-foreground'
          }>
            {lot.stats?.avgDailyGain ? `${lot.stats.avgDailyGain.toFixed(2)} kg/j` : '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'progress',
      header: t('fields.progress'),
      sortable: false,
      render: (lot) => {
        const progress = lot.stats?.progress;
        if (!progress) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex items-center gap-2 min-w-[100px]">
            <Progress value={Math.min(progress, 100)} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground w-10">{progress.toFixed(0)}%</span>
          </div>
        );
      },
    },
    {
      key: 'daysToTarget',
      header: t('fields.daysToTarget'),
      sortable: false,
      render: (lot) => (
        <div className="flex items-center gap-1">
          {lot.stats?.estimatedDaysToTarget ? (
            <>
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>{lot.stats.estimatedDaysToTarget}j</span>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
  ];

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

  const handleTypeChange = useCallback((type: string) => {
    setParams(prev => ({ ...prev, type: type === 'all' ? undefined : type, page: 1 }));
  }, [setParams]);

  const handleStatusChange = useCallback((status: string) => {
    setParams(prev => ({ ...prev, status: status === 'all' ? undefined : status, page: 1 }));
  }, [setParams]);

  // Fonction d'export
  const handleExport = useCallback(() => {
    exportToCSV(lots, t, tc);
  }, [lots, t, tc]);

  // Type filter component
  const filtersComponent = (
    <div className="flex gap-2">
      <Select value={params.type || 'all'} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('filters.allTypes')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
          <SelectItem value="fattening">{t('type.fattening')}</SelectItem>
          <SelectItem value="reproduction">{t('type.reproduction')}</SelectItem>
          <SelectItem value="weaning">{t('type.weaning')}</SelectItem>
          <SelectItem value="quarantine">{t('type.quarantine')}</SelectItem>
          <SelectItem value="sale">{t('type.sale')}</SelectItem>
          <SelectItem value="other">{t('type.other')}</SelectItem>
        </SelectContent>
      </Select>
      <Select value={params.status || 'all'} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder={t('filters.allStatuses')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
          <SelectItem value="open">{t('status.open')}</SelectItem>
          <SelectItem value="closed">{t('status.closed')}</SelectItem>
          <SelectItem value="archived">{t('status.archived')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={lots.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            {tc('actions.export')}
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {t('newLot')}
          </Button>
        </div>
      </div>

      {/* DataTable avec pagination serveur (règle 7.7) */}
      <DataTable<Lot>
        data={lots}
        columns={columns}
        totalItems={total}
        page={params.page || 1}
        limit={params.limit || 25}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        loading={loading}
        error={error}
        searchValue={params.search || ''}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t('filters.searchPlaceholder')}
        onRowClick={handleViewDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={t('noLots')}
        filters={filtersComponent}
      />

      {/* Unified Dialog (view/edit/create) */}
      <LotDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        lot={selectedLot}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        lots={lots}
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
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tc('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
