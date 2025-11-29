'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AnimalEvent, CreateAnimalEventDto, UpdateAnimalEventDto } from '@/lib/types/animal-event';
import { useTranslations } from '@/lib/i18n';

interface AnimalEventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAnimalEventDto | UpdateAnimalEventDto) => Promise<void>;
  event?: AnimalEvent;
  isLoading?: boolean;
}

export function AnimalEventFormDialog({
  open,
  onOpenChange,
  onSubmit,
  event,
  isLoading = false,
}: AnimalEventFormDialogProps) {
  const t = useTranslations('animalEvents');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateAnimalEventDto>({
    defaultValues: {
      animalId: '',
      eventType: 'entry',
      eventDate: '',
      title: '',
      description: '',
      performedBy: '',
      veterinarianId: '',
      cost: undefined,
      relatedAnimalId: '',
      location: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (event) {
      reset({
        animalId: event.animalId,
        eventType: event.eventType,
        eventDate: event.eventDate,
        title: event.title,
        description: event.description || '',
        performedBy: event.performedBy || '',
        veterinarianId: event.veterinarianId || '',
        cost: event.cost,
        relatedAnimalId: event.relatedAnimalId || '',
        location: event.location || '',
        notes: event.notes || '',
      });
    } else {
      reset({
        animalId: '',
        eventType: 'entry',
        eventDate: new Date().toISOString().split('T')[0],
        title: '',
        description: '',
        performedBy: '',
        veterinarianId: '',
        cost: undefined,
        relatedAnimalId: '',
        location: '',
        notes: '',
      });
    }
  }, [event, reset]);

  const handleFormSubmit = async (data: CreateAnimalEventDto) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? t('editEvent') : t('newEvent')}</DialogTitle>
          <DialogDescription>
            {event ? t('messages.editDescription') : t('messages.addDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Section: Informations générales */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.general')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="animalId">
                  {t('fields.animalId')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="animalId"
                  {...register('animalId', { required: true })}
                />
                {errors.animalId && <p className="text-sm text-destructive">Ce champ est requis</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType">
                  {t('fields.eventType')} <span className="text-destructive">*</span>
                </Label>
                <select
                  id="eventType"
                  {...register('eventType')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="entry">{t('types.entry')}</option>
                  <option value="exit">{t('types.exit')}</option>
                  <option value="birth">{t('types.birth')}</option>
                  <option value="death">{t('types.death')}</option>
                  <option value="sale">{t('types.sale')}</option>
                  <option value="purchase">{t('types.purchase')}</option>
                  <option value="transfer_in">{t('types.transfer_in')}</option>
                  <option value="transfer_out">{t('types.transfer_out')}</option>
                  <option value="temporary_out">{t('types.temporary_out')}</option>
                  <option value="temporary_return">{t('types.temporary_return')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">
                  {t('fields.eventDate')} <span className="text-destructive">*</span>
                </Label>
                <Input id="eventDate" type="date" {...register('eventDate', { required: true })} />
                {errors.eventDate && <p className="text-sm text-destructive">Ce champ est requis</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  {t('fields.title')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title', { required: true })}
                  placeholder={t('placeholders.title')}
                />
                {errors.title && <p className="text-sm text-destructive">Ce champ est requis</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('fields.description')}</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={t('placeholders.description')}
                rows={3}
              />
            </div>
          </div>

          {/* Section: Détails */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.details')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="performedBy">{t('fields.performedBy')}</Label>
                <Input
                  id="performedBy"
                  {...register('performedBy')}
                  placeholder={t('placeholders.performedBy')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="veterinarianId">{t('fields.veterinarianId')}</Label>
                <Input id="veterinarianId" {...register('veterinarianId')} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">{t('fields.cost')}</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  {...register('cost', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relatedAnimalId">{t('fields.relatedAnimalId')}</Label>
                <Input id="relatedAnimalId" {...register('relatedAnimalId')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{t('fields.location')}</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder={t('placeholders.location')}
                />
              </div>
            </div>
          </div>

          {/* Section: Informations supplémentaires */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.additional')}</h3>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('fields.notes')}</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder={t('placeholders.notes')}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
