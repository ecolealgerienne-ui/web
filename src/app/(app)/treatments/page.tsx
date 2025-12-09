'use client';

import { useState, useCallback, useMemo } from 'react';
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
import { Plus, Syringe, Download, Calendar, AlertTriangle } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/data/common/DataTable';
import { TreatmentDialog } from '@/components/treatments/treatment-dialog';
import { useTreatments } from '@/lib/hooks/useTreatments';
import { useToast } from '@/contexts/toast-context';
import { Treatment, TreatmentType, TreatmentStatus, CreateTreatmentDto, UpdateTreatmentDto } from '@/lib/types/treatment';
import { treatmentsService } from '@/lib/services/treatments.service';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { handleApiError } from '@/lib/utils/api-error-handler';

const TREATMENT_TYPES: TreatmentType[] = ['treatment', 'vaccination'];
const TREATMENT_STATUSES: TreatmentStatus[] = ['scheduled', 'in_progress', 'completed', 'cancelled'];

/**
 * Retourne la variante de badge selon le statut
 */
function getStatusVariant(status: TreatmentStatus): 'default' | 'secondary' | 'destructive' | 'warning' | 'success' {
  switch (status) {
    case 'completed': return 'success';
    case 'in_progress': return 'warning';
    case 'scheduled': return 'secondary';
    case 'cancelled': return 'destructive';
    default: return 'secondary';
  }
}

/**
 * Retourne la variante de badge selon le type
 */
function getTypeVariant(type: TreatmentType): 'default' | 'secondary' | 'destructive' | 'warning' | 'success' {
  switch (type) {
    case 'vaccination': return 'success';
    case 'treatment': return 'default';
    default: return 'secondary';
  }
}

/**
 * Exporte les traitements en CSV
 */
function exportToCSV(treatments: Treatment[], t: (key: string) => string, tc: (key: string) => string): void {
  const headers = [
    t('table.animal'),
    t('table.type'),
    t('table.product'),
    t('table.date'),
    t('table.veterinarian'),
    t('table.status'),
    t('fields.withdrawalEndDate'),
  ];

  const rows = treatments.map(treatment => [
    treatment.animal?.officialNumber || treatment.animal?.visualId || '-',
    t(`type.${treatment.type}`),
    treatment.productName || '-',
    new Date(treatment.treatmentDate).toLocaleDateString('fr-FR'),
    treatment.veterinarian ? `Dr. ${treatment.veterinarian.lastName}` : treatment.veterinarianName || '-',
    t(`status.${treatment.status}`),
    treatment.withdrawalEndDate ? new Date(treatment.withdrawalEndDate).toLocaleDateString('fr-FR') : '-',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `traitements_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function TreatmentsPage() {
  const t = useTranslations('treatments');
  const tc = useCommonTranslations();
  const toast = useToast();

  // Hook avec params/setParams pour la pagination (règle 7.7)
  const { treatments, total, loading, error, params, setParams, refetch } = useTreatments();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [treatmentToDelete, setTreatmentToDelete] = useState<Treatment | null>(null);

  // Stats calculées à partir des données affichées
  const stats = useMemo(() => {
    const activeWithdrawals = treatments.filter(tr => {
      if (!tr.withdrawalEndDate) return false;
      return new Date(tr.withdrawalEndDate) > new Date();
    }).length;

    return {
      total,
      inProgress: treatments.filter((tr) => tr.status === 'in_progress').length,
      completed: treatments.filter((tr) => tr.status === 'completed').length,
      activeWithdrawals,
    };
  }, [treatments, total]);

  // Actions
  const handleView = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedTreatment(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleDeleteClick = (treatment: Treatment) => {
    setTreatmentToDelete(treatment);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = useCallback(async (data: CreateTreatmentDto | UpdateTreatmentDto) => {
    setIsSubmitting(true);
    try {
      if (selectedTreatment) {
        await treatmentsService.update(selectedTreatment.id, data as UpdateTreatmentDto);
        toast.success(tc('messages.success'), t('messages.updated'));
      } else {
        await treatmentsService.create(data as CreateTreatmentDto);
        toast.success(tc('messages.success'), t('messages.created'));
      }
      setDialogOpen(false);
      refetch();
    } catch (error) {
      handleApiError(error, 'treatments.submit', toast);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTreatment, refetch, toast, tc, t]);

  const confirmDelete = useCallback(async () => {
    if (!treatmentToDelete) return;
    try {
      await treatmentsService.delete(treatmentToDelete.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      setIsDeleteDialogOpen(false);
      setTreatmentToDelete(null);
      refetch();
    } catch (error) {
      handleApiError(error, 'treatments.delete', toast);
    }
  }, [treatmentToDelete, refetch, toast, tc, t]);

  // Navigation in dialog
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedTreatment) return;
    const currentIndex = treatments.findIndex((tr) => tr.id === selectedTreatment.id);
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < treatments.length) {
      setSelectedTreatment(treatments[newIndex]);
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

  const handleTypeChange = useCallback((type: string) => {
    setParams(prev => ({ ...prev, type: type === 'all' ? undefined : type, page: 1 }));
  }, [setParams]);

  const handleStatusChange = useCallback((status: string) => {
    setParams(prev => ({ ...prev, status: status === 'all' ? undefined : status, page: 1 }));
  }, [setParams]);

  const handleFromDateChange = useCallback((fromDate: string) => {
    setParams(prev => ({ ...prev, fromDate: fromDate || undefined, page: 1 }));
  }, [setParams]);

  const handleToDateChange = useCallback((toDate: string) => {
    setParams(prev => ({ ...prev, toDate: toDate || undefined, page: 1 }));
  }, [setParams]);

  // Fonction d'export
  const handleExport = useCallback(() => {
    exportToCSV(treatments, t, tc);
  }, [treatments, t, tc]);

  // Table columns
  const columns: ColumnDef<Treatment>[] = [
    {
      key: 'animal',
      header: t('table.animal'),
      sortable: true,
      render: (treatment: Treatment) => (
        <span className="font-mono text-sm">
          {treatment.animal?.officialNumber || treatment.animal?.visualId || treatment.animalId.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'type',
      header: t('table.type'),
      sortable: true,
      render: (treatment: Treatment) => (
        <Badge variant={getTypeVariant(treatment.type)}>
          {t(`type.${treatment.type}`)}
        </Badge>
      ),
    },
    {
      key: 'productName',
      header: t('table.product'),
      sortable: true,
      render: (treatment: Treatment) => (
        <span className="text-sm">{treatment.productName || '-'}</span>
      ),
    },
    {
      key: 'treatmentDate',
      header: t('table.date'),
      sortable: true,
      render: (treatment: Treatment) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {new Date(treatment.treatmentDate).toLocaleDateString('fr-FR')}
          </span>
        </div>
      ),
    },
    {
      key: 'veterinarian',
      header: t('table.veterinarian'),
      sortable: false,
      render: (treatment: Treatment) => (
        <span className="text-sm">
          {treatment.veterinarian
            ? `Dr. ${treatment.veterinarian.lastName}`
            : treatment.veterinarianName || '-'}
        </span>
      ),
    },
    {
      key: 'withdrawalEndDate',
      header: t('fields.withdrawalEndDate'),
      sortable: true,
      render: (treatment: Treatment) => {
        if (!treatment.withdrawalEndDate) return <span className="text-muted-foreground">-</span>;
        const isActive = new Date(treatment.withdrawalEndDate) > new Date();
        return (
          <div className="flex items-center gap-1">
            {isActive && <AlertTriangle className="h-4 w-4 text-orange-500" />}
            <span className={isActive ? 'text-orange-600 font-medium' : 'text-muted-foreground'}>
              {new Date(treatment.withdrawalEndDate).toLocaleDateString('fr-FR')}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: t('table.status'),
      sortable: true,
      render: (treatment: Treatment) => (
        <Badge variant={getStatusVariant(treatment.status)}>
          {t(`status.${treatment.status}`)}
        </Badge>
      ),
    },
  ];

  // Filtres personnalisés
  const filtersComponent = (
    <div className="flex flex-wrap gap-2 items-end">
      {/* Filtre par type */}
      <Select value={params.type || 'all'} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder={t('filters.allTypes')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
          {TREATMENT_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {t(`type.${type}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtre par statut */}
      <Select value={params.status || 'all'} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder={t('filters.allStatuses')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
          {TREATMENT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {t(`status.${status}`)}
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
          <Button variant="outline" onClick={handleExport} disabled={treatments.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            {tc('actions.export')}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('newTreatment')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Syringe className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t('stats.total')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
          <p className="text-xs text-muted-foreground">{t('stats.inProgress')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <p className="text-xs text-muted-foreground">{t('stats.completed')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            {stats.activeWithdrawals > 0 && <AlertTriangle className="h-5 w-5 text-orange-500" />}
            <span className="text-2xl font-bold text-orange-600">{stats.activeWithdrawals}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t('stats.activeWithdrawals')}</p>
        </div>
      </div>

      {/* DataTable avec pagination serveur (règle 7.7) */}
      <DataTable<Treatment>
        data={treatments}
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
        onRowClick={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        emptyMessage={t('noTreatments')}
        filters={filtersComponent}
      />

      {/* Treatment Dialog */}
      <TreatmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        treatment={selectedTreatment}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        treatments={treatments}
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
