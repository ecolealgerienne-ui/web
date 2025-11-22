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
import { Vaccination, CreateVaccinationDto, UpdateVaccinationDto } from '@/lib/types/vaccination';
import { useTranslations } from '@/lib/i18n';

interface VaccinationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateVaccinationDto | UpdateVaccinationDto) => Promise<void>;
  vaccination?: Vaccination;
  isLoading?: boolean;
}

export function VaccinationFormDialog({
  open,
  onOpenChange,
  onSubmit,
  vaccination,
  isLoading = false,
}: VaccinationFormDialogProps) {
  const t = useTranslations('vaccinations');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateVaccinationDto>({
    defaultValues: {
      animalId: '',
      vaccineName: '',
      vaccineId: '',
      batchNumber: '',
      expiryDate: '',
      dose: '',
      site: '',
      veterinarianId: '',
      status: 'scheduled',
      cost: undefined,
      notes: '',
    },
  });

  useEffect(() => {
    if (vaccination) {
      reset({
        animalId: vaccination.animalId || '',
        vaccineName: vaccination.vaccineName,
        vaccineId: vaccination.vaccineId || '',
        batchNumber: vaccination.batchNumber || '',
        expiryDate: vaccination.expiryDate || '',
        dose: vaccination.dose || '',
        site: vaccination.site || '',
        veterinarianId: vaccination.veterinarianId || '',
        status: vaccination.status,
        cost: vaccination.cost,
        notes: vaccination.notes || '',
      });
    } else {
      reset({
        animalId: '',
        vaccineName: '',
        vaccineId: '',
        batchNumber: '',
        expiryDate: '',
        dose: '',
        site: '',
        veterinarianId: '',
        status: 'scheduled',
        cost: undefined,
        notes: '',
      });
    }
  }, [vaccination, reset]);

  const handleFormSubmit = async (data: CreateVaccinationDto) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vaccination ? t('editVaccination') : t('newVaccination')}</DialogTitle>
          <DialogDescription>
            {vaccination ? t('messages.editDescription') : t('messages.addDescription')}
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
                <Label htmlFor="status">
                  {t('fields.status')} <span className="text-destructive">*</span>
                </Label>
                <select
                  id="status"
                  {...register('status')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="scheduled">{t('status.scheduled')}</option>
                  <option value="completed">{t('status.completed')}</option>
                  <option value="overdue">{t('status.overdue')}</option>
                  <option value="cancelled">{t('status.cancelled')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Détails du vaccin */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.vaccine')}</h3>

            <div className="space-y-2">
              <Label htmlFor="vaccineName">
                {t('fields.vaccineName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vaccineName"
                {...register('vaccineName', { required: true })}
                placeholder={t('placeholders.vaccineName')}
              />
              {errors.vaccineName && <p className="text-sm text-destructive">Ce champ est requis</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vaccineId">{t('fields.vaccineId')}</Label>
                <Input id="vaccineId" {...register('vaccineId')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber">{t('fields.batchNumber')}</Label>
                <Input
                  id="batchNumber"
                  {...register('batchNumber')}
                  placeholder={t('placeholders.batchNumber')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">{t('fields.expiryDate')}</Label>
              <Input id="expiryDate" type="date" {...register('expiryDate')} />
            </div>
          </div>

          {/* Section: Administration */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.administration')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dose">{t('fields.dosage')}</Label>
                <Input
                  id="dose"
                  {...register('dose')}
                  placeholder={t('placeholders.dosage')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site">{t('fields.siteOfInjection')}</Label>
                <Input
                  id="site"
                  {...register('site')}
                  placeholder={t('placeholders.siteOfInjection')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="veterinarianId">{t('fields.veterinarianId')}</Label>
                <Input id="veterinarianId" {...register('veterinarianId')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">{t('fields.cost')}</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  {...register('cost', { valueAsNumber: true })}
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
