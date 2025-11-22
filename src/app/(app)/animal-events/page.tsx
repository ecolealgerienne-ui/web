'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAnimalEvents } from '@/lib/hooks/useAnimalEvents';
import { AnimalEvent, CreateAnimalEventDto, UpdateAnimalEventDto } from '@/lib/types/animal-event';
import { animalEventsService } from '@/lib/services/animal-events.service';
import { AnimalEventFormDialog } from '@/components/data/animal-event-form-dialog';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function AnimalEventsPage() {
  const t = useTranslations('animalEvents');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [typeFilter, setTypeFilter] = useState<string>('');
  const { events, loading, error, refetch } = useAnimalEvents({ eventType: typeFilter });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AnimalEvent | undefined>();
  const [eventToDelete, setEventToDelete] = useState<AnimalEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = () => {
    setSelectedEvent(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (event: AnimalEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
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
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
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
    } catch (error) {
      toast.error(tc('messages.error'), t('messages.deleteError'));
    }
  };

  if (loading) return <div className="p-6"><div className="text-center py-12">{tc('messages.loading')}</div></div>;
  if (error) return <div className="p-6"><Card><CardContent className="pt-6"><div className="text-center text-destructive">{tc('messages.loadError')}</div></CardContent></Card></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      <div className="flex gap-4 items-center">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">{t('filters.allTypes')}</option>
          <option value="birth">{t('types.birth')}</option>
          <option value="death">{t('types.death')}</option>
          <option value="sale">{t('types.sale')}</option>
          <option value="purchase">{t('types.purchase')}</option>
          <option value="transfer">{t('types.transfer')}</option>
          <option value="health_check">{t('types.health_check')}</option>
          <option value="vaccination">{t('types.vaccination')}</option>
          <option value="treatment">{t('types.treatment')}</option>
          <option value="weighing">{t('types.weighing')}</option>
          <option value="other">{t('types.other')}</option>
        </select>
        <Button onClick={handleAdd} className="ml-auto"><Plus className="mr-2 h-4 w-4" />{t('newEvent')}</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('title')} ({events.length})</CardTitle></CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{t('noEvents')}</div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{new Date(event.eventDate).toLocaleDateString()}</span>
                        <Badge>{t(`types.${event.eventType}`)}</Badge>
                      </div>
                      <h3 className="font-semibold">{event.title}</h3>
                      {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
                      {event.cost && <p className="text-sm mt-1">Coût: {event.cost} €</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(event)}><Edit2 className="h-3 w-3" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(event)} className="text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AnimalEventFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleSubmit} event={selectedEvent} isLoading={isSubmitting} />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('messages.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('messages.deleteConfirmDescription')}<br /><span className="text-destructive font-medium">{tc('messages.actionIrreversible')}</span></AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{tc('actions.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
