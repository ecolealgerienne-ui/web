'use client';

import { useEffect, useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Farm, CreateFarmDto, UpdateFarmDto } from '@/lib/types/farm';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';

interface FarmFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateFarmDto | UpdateFarmDto) => Promise<void>;
  farm?: Farm;
  isLoading?: boolean;
}

export function FarmFormDialog({
  open,
  onOpenChange,
  onSubmit,
  farm,
  isLoading = false,
}: FarmFormDialogProps) {
  const t = useTranslations('farms');
  const tc = useCommonTranslations();
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFarmDto>({
    defaultValues: {
      name: '',
      location: '',
      ownerId: '',
      cheptelNumber: '',
      groupId: '',
      groupName: '',
      isDefault: false,
    },
  });

  const isDefault = watch('isDefault');

  useEffect(() => {
    if (farm) {
      reset({
        name: farm.name,
        location: farm.location,
        ownerId: farm.ownerId,
        cheptelNumber: farm.cheptelNumber || '',
        groupId: farm.groupId || '',
        groupName: farm.groupName || '',
        isDefault: farm.isDefault,
      });
    } else {
      reset({
        name: '',
        location: '',
        ownerId: '',
        cheptelNumber: '',
        groupId: '',
        groupName: '',
        isDefault: false,
      });
    }
    setErrorDetails(null);
  }, [farm, reset, open]);

  const handleFormSubmit = async (data: CreateFarmDto) => {
    setErrorDetails(null);

    try {
      // Error 9: Clean payload - remove empty strings for optional fields
      const cleanPayload: any = {
        name: data.name,
        location: data.location,
        ownerId: data.ownerId,
        isDefault: data.isDefault,
      };

      // Add optional fields only if they have values
      if (data.cheptelNumber?.trim()) {
        cleanPayload.cheptelNumber = data.cheptelNumber.trim();
      }
      if (data.groupId?.trim()) {
        cleanPayload.groupId = data.groupId.trim();
      }
      if (data.groupName?.trim()) {
        cleanPayload.groupName = data.groupName.trim();
      }

      console.log(farm ? 'Updating farm:' : 'Creating farm:', cleanPayload); // Error 7: Log data before sending

      await onSubmit(cleanPayload);
      reset();
    } catch (error: any) {
      console.error('Error submitting farm form:', error); // Error 7: Log error details

      // Error 7: Extract detailed error message from multiple formats
      let detailedError = error?.message || 'Unknown error';
      if (error?.response?.data?.message) {
        detailedError = error.response.data.message;
      } else if (error?.data?.message) {
        detailedError = error.data.message;
      }

      setErrorDetails(`${detailedError} (Status: ${error?.status || 'N/A'})`);
      throw error; // Re-throw so parent can handle toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{farm ? t('actions.edit') : t('actions.add')}</DialogTitle>
          <DialogDescription>
            {farm ? t('messages.editDescription') : t('messages.addDescription')}
          </DialogDescription>
        </DialogHeader>

        {/* Error 7: Display error banner if there's an error */}
        {errorDetails && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
            <p className="text-sm font-semibold text-destructive mb-1">
              {t('messages.errorTitle') || 'Erreur détaillée'}
            </p>
            <p className="text-sm text-destructive/90">{errorDetails}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.general')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('fields.name')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name', { required: t('validation.nameRequired') })}
                  placeholder={t('placeholders.name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  {t('fields.location')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  {...register('location', { required: t('validation.locationRequired') })}
                  placeholder={t('placeholders.location')}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerId">
                  {t('fields.ownerId')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ownerId"
                  {...register('ownerId', { required: t('validation.ownerIdRequired') })}
                  placeholder={t('placeholders.ownerId')}
                />
                {errors.ownerId && (
                  <p className="text-sm text-destructive">{errors.ownerId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cheptelNumber">{t('fields.cheptelNumber')}</Label>
                <Input
                  id="cheptelNumber"
                  {...register('cheptelNumber')}
                  placeholder={t('placeholders.cheptelNumber')}
                />
              </div>
            </div>
          </div>

          {/* Groupe */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.group')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groupId">{t('fields.groupId')}</Label>
                <Input
                  id="groupId"
                  {...register('groupId')}
                  placeholder={t('placeholders.groupId')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupName">{t('fields.groupName')}</Label>
                <Input
                  id="groupName"
                  {...register('groupName')}
                  placeholder={t('placeholders.groupName')}
                />
              </div>
            </div>
          </div>

          {/* Préférences */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.preferences')}</h3>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setValue('isDefault', checked === true)}
              />
              <Label htmlFor="isDefault" className="font-normal cursor-pointer">
                {t('fields.isDefault')}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('actions.saving') : t('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
