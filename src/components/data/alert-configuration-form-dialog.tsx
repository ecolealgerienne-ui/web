'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertConfiguration, CreateAlertConfigurationDto, UpdateAlertConfigurationDto, AlertType, AlertPriority } from '@/lib/types/alert-configuration';
import { alertConfigurationsService } from '@/lib/services/alert-configurations.service';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { TEMP_FARM_ID } from '@/lib/auth/config';

interface AlertConfigurationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alertConfiguration?: AlertConfiguration | null;
  onSuccess: () => void;
}

export function AlertConfigurationFormDialog({
  open,
  onOpenChange,
  alertConfiguration,
  onSuccess,
}: AlertConfigurationFormDialogProps) {
  const t = useTranslations('alertConfigurations');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    evaluationType: '',
    type: 'routine' as AlertType,
    category: '',
    titleKey: '',
    messageKey: '',
    severity: 5,
    iconName: '',
    colorHex: '#2196F3',
    enabled: true,
    daysBeforeDue: 0,
    priority: 'medium' as AlertPriority,
  });

  const isEditMode = Boolean(alertConfiguration);

  useEffect(() => {
    if (alertConfiguration) {
      setFormData({
        evaluationType: alertConfiguration.evaluationType,
        type: alertConfiguration.type,
        category: alertConfiguration.category,
        titleKey: alertConfiguration.titleKey,
        messageKey: alertConfiguration.messageKey,
        severity: alertConfiguration.severity,
        iconName: alertConfiguration.iconName,
        colorHex: alertConfiguration.colorHex,
        enabled: alertConfiguration.enabled,
        daysBeforeDue: alertConfiguration.daysBeforeDue || 0,
        priority: alertConfiguration.priority,
      });
    } else {
      setFormData({
        evaluationType: '',
        type: 'routine',
        category: '',
        titleKey: '',
        messageKey: '',
        severity: 5,
        iconName: '',
        colorHex: '#2196F3',
        enabled: true,
        daysBeforeDue: 0,
        priority: 'medium',
      });
    }
    setErrorDetails(null);
  }, [alertConfiguration, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorDetails(null);

    try {
      // Error 9: Clean payload - remove empty strings and zero values for optional fields
      const cleanPayload: any = {
        evaluationType: formData.evaluationType,
        type: formData.type,
        category: formData.category,
        titleKey: formData.titleKey,
        messageKey: formData.messageKey,
        severity: formData.severity,
        iconName: formData.iconName,
        colorHex: formData.colorHex,
        enabled: formData.enabled,
        priority: formData.priority,
      };

      // Add farmId for create operations
      if (!isEditMode) {
        cleanPayload.farmId = TEMP_FARM_ID;
      }

      // Add optional fields only if they have values
      if (formData.daysBeforeDue > 0) {
        cleanPayload.daysBeforeDue = formData.daysBeforeDue;
      }

      if (isEditMode) {
        console.log('Updating alert configuration:', cleanPayload); // Error 7: Log data before sending
        await alertConfigurationsService.update(alertConfiguration!.id, cleanPayload);
        toast.success(tc('messages.success'), t('messages.updated'));
      } else {
        console.log('Creating alert configuration:', cleanPayload); // Error 7: Log data before sending
        await alertConfigurationsService.create(cleanPayload);
        toast.success(tc('messages.success'), t('messages.created'));
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error submitting alert configuration form:', error); // Error 7: Log error details

      // Error 7: Extract detailed error message from multiple formats
      let detailedError = error?.message || 'Unknown error';
      if (error?.response?.data?.message) {
        detailedError = error.response.data.message;
      } else if (error?.data?.message) {
        detailedError = error.data.message;
      }

      setErrorDetails(`${detailedError} (Status: ${error?.status || 'N/A'})`);
      toast.error(tc('messages.error'), detailedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('dialog.editTitle') : t('dialog.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error 7: Display error banner if there's an error */}
          {errorDetails && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
              <p className="text-sm font-semibold text-destructive mb-1">
                {t('dialog.errorTitle')}
              </p>
              <p className="text-sm text-destructive/90">{errorDetails}</p>
            </div>
          )}

          {/* Evaluation Type */}
          <div className="space-y-2">
            <Label htmlFor="evaluationType">
              {t('fields.evaluationType')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="evaluationType"
              value={formData.evaluationType}
              onChange={(e) => setFormData({ ...formData, evaluationType: e.target.value })}
              placeholder={t('placeholders.evaluationType')}
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              {t('fields.type')} <span className="text-destructive">*</span>
            </Label>
            {/* Error 8: Correct Radix UI Select usage */}
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as AlertType })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">{t('types.urgent')}</SelectItem>
                <SelectItem value="important">{t('types.important')}</SelectItem>
                <SelectItem value="routine">{t('types.routine')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              {t('fields.category')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder={t('placeholders.category')}
              required
            />
          </div>

          {/* Title Key */}
          <div className="space-y-2">
            <Label htmlFor="titleKey">
              {t('fields.titleKey')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titleKey"
              value={formData.titleKey}
              onChange={(e) => setFormData({ ...formData, titleKey: e.target.value })}
              placeholder={t('placeholders.titleKey')}
              required
            />
          </div>

          {/* Message Key */}
          <div className="space-y-2">
            <Label htmlFor="messageKey">
              {t('fields.messageKey')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="messageKey"
              value={formData.messageKey}
              onChange={(e) => setFormData({ ...formData, messageKey: e.target.value })}
              placeholder={t('placeholders.messageKey')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Severity */}
            <div className="space-y-2">
              <Label htmlFor="severity">
                {t('fields.severity')} (1-10) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="severity"
                type="number"
                min="1"
                max="10"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            {/* Days Before Due */}
            <div className="space-y-2">
              <Label htmlFor="daysBeforeDue">
                {t('fields.daysBeforeDue')}
              </Label>
              <Input
                id="daysBeforeDue"
                type="number"
                min="0"
                value={formData.daysBeforeDue}
                onChange={(e) => setFormData({ ...formData, daysBeforeDue: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Icon Name */}
            <div className="space-y-2">
              <Label htmlFor="iconName">
                {t('fields.iconName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="iconName"
                value={formData.iconName}
                onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                placeholder={t('placeholders.iconName')}
                required
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="colorHex">
                {t('fields.colorHex')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="colorHex"
                type="color"
                value={formData.colorHex}
                onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">
              {t('fields.priority')} <span className="text-destructive">*</span>
            </Label>
            {/* Error 8: Correct Radix UI Select usage */}
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as AlertPriority })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t('priorities.low')}</SelectItem>
                <SelectItem value="medium">{t('priorities.medium')}</SelectItem>
                <SelectItem value="high">{t('priorities.high')}</SelectItem>
                <SelectItem value="critical">{t('priorities.critical')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enabled */}
          <div className="flex items-center space-x-2">
            <input
              id="enabled"
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="enabled" className="cursor-pointer">
              {t('fields.enabled')}
            </Label>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                {tc('actions.cancel')}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? tc('messages.loading') : isEditMode ? tc('actions.save') : tc('actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
