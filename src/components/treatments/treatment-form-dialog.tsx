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
import { Treatment } from '@/lib/types/treatment';
import { CreateTreatmentDto, UpdateTreatmentDto } from '@/lib/services/treatments.service';
import { useTranslations } from '@/lib/i18n';

interface TreatmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTreatmentDto | UpdateTreatmentDto) => Promise<void>;
  treatment?: Treatment;
  isLoading?: boolean;
}

export function TreatmentFormDialog({
  open,
  onOpenChange,
  onSubmit,
  treatment,
  isLoading = false,
}: TreatmentFormDialogProps) {
  const t = useTranslations('treatments');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateTreatmentDto>({
    defaultValues: {
      targetType: 'individual',
      productName: '',
      treatmentType: 'antibiotic',
      reason: '',
      dosage: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'scheduled',
    },
  });

  useEffect(() => {
    if (treatment) {
      reset({
        animalId: treatment.animalId || '',
        lotId: treatment.lotId || '',
        targetType: treatment.targetType,
        productId: treatment.productId || '',
        productName: treatment.productName,
        treatmentType: treatment.treatmentType,
        manufacturer: treatment.manufacturer || '',
        batchNumber: treatment.batchNumber || '',
        reason: treatment.reason,
        diagnosis: treatment.diagnosis || '',
        dosage: treatment.dosage,
        administrationRoute: treatment.administrationRoute || '',
        frequency: treatment.frequency || '',
        duration: treatment.duration,
        startDate: treatment.startDate ? treatment.startDate.split('T')[0] : '',
        endDate: treatment.endDate ? treatment.endDate.split('T')[0] : '',
        administeredBy: treatment.administeredBy || '',
        veterinarianId: treatment.veterinarianId || '',
        prescriptionNumber: treatment.prescriptionNumber || '',
        withdrawalPeriodMeat: treatment.withdrawalPeriodMeat,
        withdrawalPeriodMilk: treatment.withdrawalPeriodMilk,
        status: treatment.status,
        notes: treatment.notes || '',
        cost: treatment.cost,
      });
    } else {
      reset({
        targetType: 'individual',
        productName: '',
        treatmentType: 'antibiotic',
        reason: '',
        dosage: '',
        startDate: new Date().toISOString().split('T')[0],
        status: 'scheduled',
      });
    }
  }, [treatment, reset]);

  const handleFormSubmit = async (data: CreateTreatmentDto) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{treatment ? t('editTreatment') : t('newTreatment')}</DialogTitle>
          <DialogDescription>
            {treatment ? t('messages.editDescription') : t('messages.addDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Section: General information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.general')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetType">
                  {t('fields.targetType')} <span className="text-destructive">*</span>
                </Label>
                <select
                  id="targetType"
                  {...register('targetType')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="individual">{t('targetType.individual')}</option>
                  <option value="lot">{t('targetType.lot')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="animalId">{t('fields.animalId')}</Label>
                <Input id="animalId" {...register('animalId')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  <option value="in_progress">{t('status.in_progress')}</option>
                  <option value="completed">{t('status.completed')}</option>
                  <option value="cancelled">{t('status.cancelled')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentType">
                  {t('fields.treatmentType')} <span className="text-destructive">*</span>
                </Label>
                <select
                  id="treatmentType"
                  {...register('treatmentType')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="antibiotic">{t('type.antibiotic')}</option>
                  <option value="antiparasitic">{t('type.antiparasitic')}</option>
                  <option value="anti_inflammatory">{t('type.anti_inflammatory')}</option>
                  <option value="vitamin">{t('type.vitamin')}</option>
                  <option value="other">{t('type.other')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Product details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.product')}</h3>

            <div className="space-y-2">
              <Label htmlFor="productName">
                {t('fields.productName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="productName"
                {...register('productName', { required: true })}
                placeholder={t('placeholders.productName')}
              />
              {errors.productName && <p className="text-sm text-destructive">Ce champ est requis</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">{t('fields.manufacturer')}</Label>
                <Input id="manufacturer" {...register('manufacturer')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber">{t('fields.batchNumber')}</Label>
                <Input id="batchNumber" {...register('batchNumber')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">
                {t('fields.reason')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reason"
                {...register('reason', { required: true })}
                placeholder={t('placeholders.reason')}
              />
              {errors.reason && <p className="text-sm text-destructive">Ce champ est requis</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">{t('fields.diagnosis')}</Label>
              <Input
                id="diagnosis"
                {...register('diagnosis')}
                placeholder={t('placeholders.diagnosis')}
              />
            </div>
          </div>

          {/* Section: Administration */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.administration')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosage">
                  {t('fields.dosage')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dosage"
                  {...register('dosage', { required: true })}
                  placeholder={t('placeholders.dosage')}
                />
                {errors.dosage && <p className="text-sm text-destructive">Ce champ est requis</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="administrationRoute">{t('fields.administrationRoute')}</Label>
                <select
                  id="administrationRoute"
                  {...register('administrationRoute')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">{t('fields.administrationRoute')}</option>
                  <option value="SC">{t('routes.SC')}</option>
                  <option value="IM">{t('routes.IM')}</option>
                  <option value="ID">{t('routes.ID')}</option>
                  <option value="oral">{t('routes.oral')}</option>
                  <option value="IV">{t('routes.IV')}</option>
                  <option value="topical">{t('routes.topical')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">{t('fields.frequency')}</Label>
                <Input
                  id="frequency"
                  {...register('frequency')}
                  placeholder={t('placeholders.frequency')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">{t('fields.duration')}</Label>
                <Input
                  id="duration"
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  {t('fields.startDate')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate', { required: true })}
                />
                {errors.startDate && <p className="text-sm text-destructive">Ce champ est requis</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">{t('fields.endDate')}</Label>
                <Input id="endDate" type="date" {...register('endDate')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="administeredBy">{t('fields.administeredBy')}</Label>
                <Input
                  id="administeredBy"
                  {...register('administeredBy')}
                  placeholder={t('placeholders.administeredBy')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="veterinarianId">{t('fields.veterinarianId')}</Label>
                <Input id="veterinarianId" {...register('veterinarianId')} />
              </div>
            </div>
          </div>

          {/* Section: Withdrawal periods */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.withdrawal')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="withdrawalPeriodMeat">{t('fields.withdrawalPeriodMeat')}</Label>
                <Input
                  id="withdrawalPeriodMeat"
                  type="number"
                  {...register('withdrawalPeriodMeat', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdrawalPeriodMilk">{t('fields.withdrawalPeriodMilk')}</Label>
                <Input
                  id="withdrawalPeriodMilk"
                  type="number"
                  {...register('withdrawalPeriodMilk', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Section: Additional information */}
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
