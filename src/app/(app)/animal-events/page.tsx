'use client';

import { useState, useCallback } from 'react';
import { Plus, Calendar, Download, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useAnimalEvents } from '@/lib/hooks/useAnimalEvents';
import { AnimalEvent, CreateAnimalEventDto, UpdateAnimalEventDto } from '@/lib/types/animal-event';
import { animalEventsService } from '@/lib/services/animal-events.service';
import { AnimalEventDialog } from '@/components/animal-events/animal-event-dialog';
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
 * Retourne la variante de badge selon le type d'événement
 */
function getEventTypeBadgeVariant(type: string): 'default' | 'secondary' | 'destructive' | 'success' | 'warning' {
  switch (type) {
    case 'birth':
    case 'purchase':
    case 'entry':
    case 'transfer_in':
      return 'success'; // Vert - entrées
    case 'death':
      return 'destructive'; // Rouge
    case 'sale':
    case 'exit':
    case 'transfer_out':
      return 'warning'; // Orange - sorties
    case 'slaughter':
      return 'secondary'; // Gris
    default:
      return 'default';
  }
}

/**
 * Exporte les événements en CSV
 */
function exportToCSV(
  events: AnimalEvent[],
  t: (key: string) => string
): void {
  const headers = [
    t('fields.movementDate'),
    t('fields.movementType'),
    t('fields.reason'),
    t('fields.animalsCount'),
    t('fields.status'),
    t('fields.notes'),
  ];

  const rows = events.map(event => [
    new Date(event.movementDate).toLocaleDateString(),
    t(`types.${event.movementType}`),
    event.reason || t(`types.${event.movementType}`),
    (event.animalIds?.length || 0).toString(),
    event.status ? t(`statuses.${event.status}`) : '-',
    event.notes || '-',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `evenements_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AnimalEventsPage() {
  const t = useTranslations('animalEvents');
  const tc = useCommonTranslations();
  const toast = useToast();

  // Hook avec params/setParams pour la pagination (règle 7.7)
  const { events, total, loading, error, params, setParams, refetch } = useAnimalEvents();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedEvent, setSelectedEvent] = useState<AnimalEvent | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<AnimalEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = () => {
    setSelectedEvent(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleViewDetail = (event: AnimalEvent) => {
    setSelectedEvent(event);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedEvent) return;
    const currentIndex = events.findIndex((e) => e.id === selectedEvent.id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < events.length) {
      setSelectedEvent(events[newIndex]);
    }
  };

  const handleEdit = (event: AnimalEvent) => {
    setSelectedEvent(event);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDelete = (event: AnimalEvent) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = useCallback(async (data: CreateAnimalEventDto | UpdateAnimalEventDto) => {
    setIsSubmitting(true);
    try {
      if (selectedEvent) {
        await animalEventsService.update(selectedEvent.id, data as UpdateAnimalEventDto);
        toast.success(tc('messages.success'), t('messages.updated'));
      } else {
        await animalEventsService.create(data as CreateAnimalEventDto);
        toast.success(tc('messages.success'), t('messages.created'));
      }
      setDialogOpen(false);
      refetch();
    } catch (error) {
      handleApiError(error, 'animalEvents.submit', toast);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedEvent, refetch, toast, tc, t]);

  const confirmDelete = useCallback(async () => {
    if (!eventToDelete) return;

    try {
      await animalEventsService.delete(eventToDelete.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
      refetch();
    } catch (error) {
      handleApiError(error, 'animalEvents.delete', toast);
    }
  }, [eventToDelete, refetch, toast, tc, t]);

  // Définition des colonnes du tableau
  const columns: ColumnDef<AnimalEvent>[] = [
    {
      key: 'movementDate',
      header: t('fields.movementDate'),
      sortable: true,
      render: (event) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(event.movementDate).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'movementType',
      header: t('fields.movementType'),
      sortable: true,
      render: (event) => (
        <Badge variant={getEventTypeBadgeVariant(event.movementType)}>
          {t(`types.${event.movementType}`)}
        </Badge>
      ),
    },
    {
      key: 'reason',
      header: t('fields.reason'),
      sortable: true,
      render: (event) => (
        <div>
          <div className="font-medium">{event.reason || t(`types.${event.movementType}`)}</div>
          {event.notes && (
            <div className="text-sm text-muted-foreground line-clamp-1">{event.notes}</div>
          )}
        </div>
      ),
    },
    {
      key: 'animalsCount',
      header: t('fields.animalsCount'),
      sortable: false,
      render: (event) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{event.animalIds?.length || 0}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('fields.status'),
      sortable: true,
      render: (event) => event.status ? (
        <Badge variant="secondary">{t(`statuses.${event.status}`)}</Badge>
      ) : '-',
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
    // Note: La recherche n'est pas supportée par le backend pour l'instant
    // On garde le champ pour l'UX mais on ne l'envoie pas
  }, []);

  const handleTypeChange = useCallback((eventType: string) => {
    setParams(prev => ({ ...prev, eventType: eventType === 'all' ? undefined : eventType, page: 1 }));
  }, [setParams]);

  const handleFromDateChange = useCallback((fromDate: string) => {
    setParams(prev => ({ ...prev, fromDate: fromDate || undefined, page: 1 }));
  }, [setParams]);

  const handleToDateChange = useCallback((toDate: string) => {
    setParams(prev => ({ ...prev, toDate: toDate || undefined, page: 1 }));
  }, [setParams]);

  // Fonction d'export
  const handleExport = useCallback(() => {
    exportToCSV(events, t);
  }, [events, t]);

  // Filtres personnalisés (type + dates)
  const filtersComponent = (
    <div className="flex flex-wrap gap-2 items-end">
      {/* Filtre par type d'événement */}
      <Select
        value={params.eventType || 'all'}
        onValueChange={handleTypeChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('filters.allTypes')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
          <SelectItem value="entry">{t('types.entry')}</SelectItem>
          <SelectItem value="exit">{t('types.exit')}</SelectItem>
          <SelectItem value="birth">{t('types.birth')}</SelectItem>
          <SelectItem value="death">{t('types.death')}</SelectItem>
          <SelectItem value="sale">{t('types.sale')}</SelectItem>
          <SelectItem value="purchase">{t('types.purchase')}</SelectItem>
          <SelectItem value="transfer_in">{t('types.transfer_in')}</SelectItem>
          <SelectItem value="transfer_out">{t('types.transfer_out')}</SelectItem>
          <SelectItem value="slaughter">{t('types.slaughter')}</SelectItem>
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
      {/* Header avec boutons d'actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={events.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            {tc('actions.export')}
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {t('newEvent')}
          </Button>
        </div>
      </div>

      {/* DataTable avec pagination serveur (règle 7.7) */}
      <DataTable<AnimalEvent>
        data={events}
        columns={columns}
        totalItems={total}
        page={params.page || 1}
        limit={params.limit || 25}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        loading={loading}
        error={error}
        onRowClick={handleViewDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={t('noEvents')}
        filters={filtersComponent}
      />

      {/* Dialog unifié (consultation/modification/création) */}
      <AnimalEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        event={selectedEvent}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        events={events}
        onNavigate={handleNavigate}
      />

      {/* Dialog confirmation suppression */}
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
