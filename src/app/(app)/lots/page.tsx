'use client';

import { useState } from 'react';
import { Plus, Package, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useLots } from '@/lib/hooks/useLots';
import { Lot, CreateLotDto, UpdateLotDto, LotFilters } from '@/lib/types/lot';
import { lotsService } from '@/lib/services/lots.service';
import { LotDialog } from '@/components/lots/lot-dialog';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { DataTable, ColumnDef } from '@/components/data/common/DataTable';
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

export default function LotsPage() {
  const t = useTranslations('lots');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filters: Partial<LotFilters> = {
    search: search || undefined,
    type: typeFilter !== 'all' ? typeFilter as LotFilters['type'] : undefined,
    status: statusFilter !== 'all' ? statusFilter as LotFilters['status'] : undefined,
  };

  const { lots, loading, error, refresh } = useLots(filters);

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

  const handleSubmit = async (data: CreateLotDto | UpdateLotDto) => {
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
      refresh();
    } catch (err) {
      toast.error(tc('messages.error'), t('messages.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!lotToDelete) return;
    try {
      await lotsService.delete(lotToDelete.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      setIsDeleteDialogOpen(false);
      setLotToDelete(null);
      refresh();
    } catch (err) {
      toast.error(tc('messages.error'), t('messages.deleteError'));
    }
  };

  // Table columns
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
        <Badge>{t(`type.${lot.type}`)}</Badge>
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
      header: t('fields.animals'),
      render: (lot) => (
        <span className="text-muted-foreground">
          {lot.animalIds?.length || 0} {tc('labels.animals')}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: t('fields.createdAt'),
      sortable: true,
      render: (lot) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{lot.createdAt ? new Date(lot.createdAt).toLocaleDateString() : '-'}</span>
        </div>
      ),
    },
  ];

  // Type filter component
  const typeFilterComponent = (
    <div className="flex gap-2">
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('filters.allTypes')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
          <SelectItem value="treatment">{t('type.treatment')}</SelectItem>
          <SelectItem value="vaccination">{t('type.vaccination')}</SelectItem>
          <SelectItem value="sale">{t('type.sale')}</SelectItem>
          <SelectItem value="slaughter">{t('type.slaughter')}</SelectItem>
          <SelectItem value="purchase">{t('type.purchase')}</SelectItem>
          <SelectItem value="breeding">{t('type.breeding')}</SelectItem>
          <SelectItem value="reproduction">{t('type.reproduction')}</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
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
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {t('newLot')}
        </Button>
      </div>

      {/* DataTable */}
      <DataTable<Lot>
        data={lots}
        columns={columns}
        totalItems={lots.length}
        loading={loading}
        error={error}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('filters.searchPlaceholder')}
        onRowClick={handleViewDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={t('noLots')}
        filters={typeFilterComponent}
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
