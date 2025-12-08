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
import { Plus, Search, Loader2, Eye, Edit, Trash2, Syringe } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/data/common/DataTable';
import { TreatmentDialog } from '@/components/treatments/treatment-dialog';
import { useTreatments } from '@/lib/hooks/useTreatments';
import { useToast } from '@/contexts/toast-context';
import { Treatment, TreatmentFilters, TreatmentType, TreatmentStatus, CreateTreatmentDto, UpdateTreatmentDto } from '@/lib/types/treatment';
import { treatmentsService } from '@/lib/services/treatments.service';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';

const TREATMENT_TYPES: TreatmentType[] = ['treatment', 'vaccination'];
const TREATMENT_STATUSES: TreatmentStatus[] = ['scheduled', 'in_progress', 'completed', 'cancelled'];

export default function TreatmentsPage() {
  const t = useTranslations('treatments');
  const tc = useCommonTranslations();
  const toast = useToast();

  // Filters state
  const [filters, setFilters] = useState<TreatmentFilters>({
    search: '',
    type: 'all',
    status: 'all',
  });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [treatmentToDelete, setTreatmentToDelete] = useState<Treatment | null>(null);

  // Fetch treatments
  const { treatments, loading, refresh } = useTreatments(filters);

  // Stats
  const stats = useMemo(() => {
    const totalCost = treatments
      .filter((tr) => tr.cost)
      .reduce((sum, tr) => sum + (tr.cost || 0), 0);

    return {
      total: treatments.length,
      inProgress: treatments.filter((tr) => tr.status === 'in_progress').length,
      completed: treatments.filter((tr) => tr.status === 'completed').length,
      cost: totalCost,
    };
  }, [treatments]);

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

  const handleSubmit = async (data: CreateTreatmentDto | UpdateTreatmentDto) => {
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
      refresh();
    } catch (err) {
      toast.error(tc('messages.error'), selectedTreatment ? t('messages.updateError') : t('messages.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!treatmentToDelete) return;
    try {
      await treatmentsService.delete(treatmentToDelete.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      setIsDeleteDialogOpen(false);
      setTreatmentToDelete(null);
      refresh();
    } catch (err) {
      toast.error(tc('messages.error'), t('messages.deleteError'));
    }
  };

  // Navigation in dialog
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedTreatment) return;
    const currentIndex = treatments.findIndex((tr) => tr.id === selectedTreatment.id);
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < treatments.length) {
      setSelectedTreatment(treatments[newIndex]);
    }
  };

  const getStatusVariant = (status: TreatmentStatus): 'default' | 'secondary' | 'destructive' | 'warning' | 'success' => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'scheduled': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  // Table columns
  const columns: ColumnDef<Treatment>[] = [
    {
      key: 'animal',
      header: t('table.animal'),
      render: (treatment: Treatment) => (
        <span className="font-mono text-sm">
          {treatment.animal?.officialNumber || treatment.animal?.visualId || treatment.animalId.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'type',
      header: t('table.type'),
      render: (treatment: Treatment) => (
        <Badge variant="secondary">{t(`type.${treatment.type}`)}</Badge>
      ),
    },
    {
      key: 'productName',
      header: t('table.product'),
      render: (treatment: Treatment) => (
        <span className="text-sm">{treatment.productName || '-'}</span>
      ),
    },
    {
      key: 'treatmentDate',
      header: t('table.date'),
      render: (treatment: Treatment) => (
        <span className="text-sm">
          {new Date(treatment.treatmentDate).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'veterinarian',
      header: t('table.veterinarian'),
      render: (treatment: Treatment) => (
        <span className="text-sm">
          {treatment.veterinarian
            ? `Dr. ${treatment.veterinarian.lastName}`
            : treatment.veterinarianName || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('table.status'),
      render: (treatment: Treatment) => (
        <Badge variant={getStatusVariant(treatment.status)}>
          {t(`status.${treatment.status}`)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: tc('table.actions'),
      align: 'right',
      render: (treatment: Treatment) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleView(treatment)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(treatment)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteClick(treatment)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('newTreatment')}
        </Button>
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
          <div className="text-2xl font-bold">{stats.cost.toLocaleString()} DA</div>
          <p className="text-xs text-muted-foreground">{t('stats.totalCost')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('filters.search')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('filters.searchPlaceholder')}
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('filters.type')}</label>
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => setFilters({ ...filters, type: value as TreatmentType | 'all' })}
            >
              <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('filters.status')}</label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => setFilters({ ...filters, status: value as TreatmentStatus | 'all' })}
            >
              <SelectTrigger>
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
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : treatments.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Syringe className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">{t('noTreatments')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('messages.noTreatmentsDescription')}</p>
          <Button className="mt-4" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('newTreatment')}
          </Button>
        </div>
      ) : (
        <DataTable
          data={treatments}
          columns={columns}
          onRowClick={handleView}
        />
      )}

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
