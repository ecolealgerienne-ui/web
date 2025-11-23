'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Weighing, CreateWeighingDto, UpdateWeighingDto, WeighingPurpose, WeightUnit } from '@/lib/types/weighing';

interface WeighingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateWeighingDto | UpdateWeighingDto) => Promise<void>;
  weighing?: Weighing;
  animalId?: string;
}

const PURPOSES: WeighingPurpose[] = ['routine', 'medical', 'sale', 'growth_monitoring', 'other'];
const UNITS: WeightUnit[] = ['kg', 'lbs'];

export function WeighingFormDialog({
  open,
  onOpenChange,
  onSubmit,
  weighing,
  animalId,
}: WeighingFormDialogProps) {
  const t = useTranslations('weighings');
  const isEditing = !!weighing;

  const { register, handleSubmit, reset, setValue, watch } = useForm<CreateWeighingDto>({
    defaultValues: {
      animalId: animalId || '',
      weight: 0,
      unit: 'kg',
      weighingDate: new Date().toISOString().split('T')[0],
      weighingTime: '',
      purpose: 'routine',
      method: '',
      location: '',
      previousWeight: undefined,
      weightGain: undefined,
      growthRate: undefined,
      age: undefined,
      recordedBy: '',
      notes: '',
      conditions: '',
    },
  });

  useEffect(() => {
    if (weighing) {
      reset({
        animalId: weighing.animalId,
        weight: weighing.weight,
        unit: weighing.unit,
        weighingDate: weighing.weighingDate,
        weighingTime: weighing.weighingTime || '',
        purpose: weighing.purpose,
        method: weighing.method || '',
        location: weighing.location || '',
        previousWeight: weighing.previousWeight,
        weightGain: weighing.weightGain,
        growthRate: weighing.growthRate,
        age: weighing.age,
        recordedBy: weighing.recordedBy || '',
        notes: weighing.notes || '',
        conditions: weighing.conditions || '',
      });
    } else {
      reset({
        animalId: animalId || '',
        weight: 0,
        unit: 'kg',
        weighingDate: new Date().toISOString().split('T')[0],
        weighingTime: '',
        purpose: 'routine',
        method: '',
        location: '',
        previousWeight: undefined,
        weightGain: undefined,
        growthRate: undefined,
        age: undefined,
        recordedBy: '',
        notes: '',
        conditions: '',
      });
    }
  }, [weighing, animalId, reset]);

  const handleFormSubmit = async (data: CreateWeighingDto) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const selectedPurpose = watch('purpose');
  const selectedUnit = watch('unit');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('messages.editDescription') : t('messages.addDescription')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('messages.editDescription') : t('messages.addDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Section 1: General Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.general')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="animalId">{t('fields.animalId')} *</Label>
                <Input
                  id="animalId"
                  {...register('animalId', { required: true })}
                  placeholder={t('fields.animalId')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weighingDate">{t('fields.weighingDate')} *</Label>
                <Input
                  id="weighingDate"
                  type="date"
                  {...register('weighingDate', { required: true })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weighingTime">{t('fields.weighingTime')}</Label>
                <Input
                  id="weighingTime"
                  type="time"
                  {...register('weighingTime')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">{t('fields.purpose')} *</Label>
                <Select
                  value={selectedPurpose}
                  onValueChange={(value) => setValue('purpose', value as WeighingPurpose)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSES.map((purpose) => (
                      <SelectItem key={purpose} value={purpose}>
                        {t(`purpose.${purpose}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 2: Weight Data */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.data')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="weight">{t('fields.weight')} *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  {...register('weight', { required: true, valueAsNumber: true })}
                  placeholder={t('placeholders.weight')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">{t('fields.unit')} *</Label>
                <Select
                  value={selectedUnit}
                  onValueChange={(value) => setValue('unit', value as WeightUnit)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {t(`units.${unit}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="method">{t('fields.method')}</Label>
                <Input
                  id="method"
                  {...register('method')}
                  placeholder={t('placeholders.method')}
                />
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

          {/* Section 3: Growth Tracking */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.growth')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="previousWeight">{t('fields.previousWeight')}</Label>
                <Input
                  id="previousWeight"
                  type="number"
                  step="0.01"
                  {...register('previousWeight', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightGain">{t('fields.weightGain')}</Label>
                <Input
                  id="weightGain"
                  type="number"
                  step="0.01"
                  {...register('weightGain', { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="growthRate">{t('fields.growthRate')}</Label>
                <Input
                  id="growthRate"
                  type="number"
                  step="0.01"
                  {...register('growthRate', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">{t('fields.age')}</Label>
                <Input
                  id="age"
                  type="number"
                  {...register('age', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Additional Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.additional')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recordedBy">{t('fields.recordedBy')}</Label>
                <Input
                  id="recordedBy"
                  {...register('recordedBy')}
                  placeholder={t('placeholders.recordedBy')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conditions">{t('fields.conditions')}</Label>
                <Input
                  id="conditions"
                  {...register('conditions')}
                  placeholder={t('placeholders.conditions')}
                />
              </div>
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
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
