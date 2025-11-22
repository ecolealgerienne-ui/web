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
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Animal, CreateAnimalDto, UpdateAnimalDto } from '@/lib/types/animal';
import { useTranslations } from '@/lib/i18n';

interface AnimalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAnimalDto | UpdateAnimalDto) => Promise<void>;
  animal?: Animal;
  isLoading?: boolean;
}

export function AnimalFormDialog({
  open,
  onOpenChange,
  onSubmit,
  animal,
  isLoading = false,
}: AnimalFormDialogProps) {
  const t = useTranslations('animals');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAnimalDto>({
    defaultValues: {
      identificationNumber: '',
      name: '',
      speciesId: '',
      breedId: '',
      sex: 'male',
      birthDate: '',
      status: 'alive',
      motherIdentificationNumber: '',
      fatherIdentificationNumber: '',
      acquisitionDate: '',
      acquisitionPrice: undefined,
      currentWeight: undefined,
      currentLocation: '',
      healthStatus: '',
      notes: '',
      isActive: true,
    },
  });

  const isActive = watch('isActive');

  useEffect(() => {
    if (animal) {
      reset({
        identificationNumber: animal.identificationNumber,
        name: animal.name || '',
        speciesId: animal.speciesId,
        breedId: animal.breedId || '',
        sex: animal.sex,
        birthDate: animal.birthDate || '',
        status: animal.status,
        motherIdentificationNumber: animal.motherIdentificationNumber || '',
        fatherIdentificationNumber: animal.fatherIdentificationNumber || '',
        acquisitionDate: animal.acquisitionDate || '',
        acquisitionPrice: animal.acquisitionPrice,
        currentWeight: animal.currentWeight,
        currentLocation: animal.currentLocation || '',
        healthStatus: animal.healthStatus || '',
        notes: animal.notes || '',
        isActive: animal.isActive,
      });
    } else {
      reset({
        identificationNumber: '',
        name: '',
        speciesId: '',
        breedId: '',
        sex: 'male',
        birthDate: '',
        status: 'alive',
        motherIdentificationNumber: '',
        fatherIdentificationNumber: '',
        acquisitionDate: '',
        acquisitionPrice: undefined,
        currentWeight: undefined,
        currentLocation: '',
        healthStatus: '',
        notes: '',
        isActive: true,
      });
    }
  }, [animal, reset]);

  const handleFormSubmit = async (data: CreateAnimalDto) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{animal ? t('editAnimal') : t('newAnimal')}</DialogTitle>
          <DialogDescription>
            {animal ? t('messages.editDescription') : t('messages.addDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Section: Informations générales */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.general')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="identificationNumber">
                  {t('fields.identificationNumber')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="identificationNumber"
                  {...register('identificationNumber', { required: true })}
                  placeholder={t('placeholders.identificationNumber')}
                />
                {errors.identificationNumber && (
                  <p className="text-sm text-destructive">Ce champ est requis</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{t('fields.name')}</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder={t('placeholders.name')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="speciesId">
                  {t('fields.speciesId')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="speciesId"
                  {...register('speciesId', { required: true })}
                />
                {errors.speciesId && (
                  <p className="text-sm text-destructive">Ce champ est requis</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="breedId">{t('fields.breedId')}</Label>
                <Input id="breedId" {...register('breedId')} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sex">
                  {t('fields.sex')} <span className="text-destructive">*</span>
                </Label>
                <select
                  id="sex"
                  {...register('sex')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="male">{t('sex.male')}</option>
                  <option value="female">{t('sex.female')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">{t('fields.birthDate')}</Label>
                <Input id="birthDate" type="date" {...register('birthDate')} />
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
                  <option value="alive">{t('status.alive')}</option>
                  <option value="sold">{t('status.sold')}</option>
                  <option value="dead">{t('status.dead')}</option>
                  <option value="missing">{t('status.missing')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Généalogie */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.genealogy')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="motherIdentificationNumber">
                  {t('fields.motherIdentificationNumber')}
                </Label>
                <Input
                  id="motherIdentificationNumber"
                  {...register('motherIdentificationNumber')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherIdentificationNumber">
                  {t('fields.fatherIdentificationNumber')}
                </Label>
                <Input
                  id="fatherIdentificationNumber"
                  {...register('fatherIdentificationNumber')}
                />
              </div>
            </div>
          </div>

          {/* Section: Acquisition */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.acquisition')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="acquisitionDate">{t('fields.acquisitionDate')}</Label>
                <Input id="acquisitionDate" type="date" {...register('acquisitionDate')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="acquisitionPrice">{t('fields.acquisitionPrice')}</Label>
                <Input
                  id="acquisitionPrice"
                  type="number"
                  step="0.01"
                  {...register('acquisitionPrice', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Section: Santé et localisation */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.health')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentWeight">{t('fields.currentWeight')}</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  step="0.01"
                  {...register('currentWeight', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentLocation">{t('fields.currentLocation')}</Label>
                <Input
                  id="currentLocation"
                  {...register('currentLocation')}
                  placeholder={t('placeholders.currentLocation')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="healthStatus">{t('fields.healthStatus')}</Label>
              <Input id="healthStatus" {...register('healthStatus')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('fields.notes')}</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder={t('placeholders.notes')}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', checked === true)}
              />
              <Label htmlFor="isActive" className="font-normal cursor-pointer">
                {t('fields.isActive')}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('actions.cancel') || 'Annuler'}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('actions.saving') || 'Enregistrement...' : t('actions.save') || 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
