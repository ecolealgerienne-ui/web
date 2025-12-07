'use client';

import { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useAnimalEvents } from '@/lib/hooks/useAnimalEvents';
import { AnimalEvent, CreateAnimalEventDto, UpdateAnimalEventDto } from '@/lib/types/animal-event';
import { animalEventsService } from '@/lib/services/animal-events.service';
import { AnimalEventDialog } from '@/components/animal-events/animal-event-dialog';
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

export default function AnimalEventsPage() {
  const t = useTranslations('animalEvents');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { events, loading, error, refetch } = useAnimalEvents({ eventType: typeFilter });

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

  const handleSubmit = async (data: CreateAnimalEventDto | UpdateAnimalEventDto) => {
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
    } catch (err) {
      toast.error(tc('messages.error'), t('messages.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await animalEventsService.delete(eventToDelete.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
      refetch();
    } catch (err) {
      toast.error(tc('messages.error'), t('messages.deleteError'));
    }
  };

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
        <Badge>{t(`types.${event.movementType}`)}</Badge>
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
      key: 'status',
      header: t('fields.status'),
      sortable: true,
      render: (event) => event.status ? (
        <Badge variant="secondary">{t(`statuses.${event.status}`)}</Badge>
      ) : '-',
    },
  ];

  // Filtre personnalisé pour le type d'événement
  const typeFilterComponent = (
    <Select
      value={typeFilter}
      onValueChange={(value) => setTypeFilter(value)}
    >
      <SelectTrigger className="w-[200px]">
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
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      {/* Header avec bouton d'ajout */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {t('newEvent')}
        </Button>
      </div>

      {/* DataTable avec filtres intégrés */}
      <DataTable<AnimalEvent>
        data={events}
        columns={columns}
        totalItems={events.length}
        loading={loading}
        error={error}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('filters.search')}
        onRowClick={handleViewDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={t('noEvents')}
        filters={typeFilterComponent}
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
