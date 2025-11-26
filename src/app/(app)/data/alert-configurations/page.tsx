'use client';

import { useState } from 'react';
import { Bell, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlertConfigurations } from '@/lib/hooks/useAlertConfigurations';
import { AlertConfiguration, AlertType } from '@/lib/types/alert-configuration';
import { alertConfigurationsService } from '@/lib/services/alert-configurations.service';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';

export default function AlertConfigurationsPage() {
  const t = useTranslations('alertConfigurations');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [selectedType, setSelectedType] = useState<AlertType | ''>('');
  const { alertConfigurations, loading, error, refetch } = useAlertConfigurations({
    type: selectedType || undefined,
  });

  const handleToggleEnabled = async (alert: AlertConfiguration) => {
    try {
      await alertConfigurationsService.update(alert.id, { enabled: !alert.enabled });
      toast.success(tc('messages.success'), t('messages.updated'));
      refetch();
    } catch (error) {
      toast.error(tc('messages.error'), t('messages.updateError'));
    }
  };

  const getTypeBadgeVariant = (type: AlertType): 'destructive' | 'success' | 'default' | 'warning' => {
    switch (type) {
      case 'urgent':
        return 'destructive';
      case 'important':
        return 'default';
      case 'routine':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityBadgeVariant = (priority: string): 'destructive' | 'success' | 'default' | 'warning' => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <div className="text-center py-12">{tc('messages.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              {tc('messages.loadError')}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center flex-wrap">
        <Select
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as AlertType | '')}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('filters.allTypes')}</SelectItem>
            <SelectItem value="urgent">{t('types.urgent')}</SelectItem>
            <SelectItem value="important">{t('types.important')}</SelectItem>
            <SelectItem value="routine">{t('types.routine')}</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground">
          {t(alertConfigurations.length > 1 ? 'alertCount_plural' : 'alertCount', { count: alertConfigurations.length })}
        </div>
      </div>

      {/* Liste des configurations */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('title')} ({alertConfigurations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertConfigurations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noAlertConfigurations')}
            </div>
          ) : (
            <div className="space-y-4">
              {alertConfigurations.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg hover:bg-accent transition-colors ${
                    !alert.enabled ? 'opacity-60 bg-muted/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className="h-4 w-4" style={{ color: alert.colorHex }} />
                        <div className="font-semibold text-lg">{alert.evaluationType}</div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant={getTypeBadgeVariant(alert.type)} className="text-xs">
                          {t(`types.${alert.type}`)}
                        </Badge>
                        <Badge variant={getPriorityBadgeVariant(alert.priority)} className="text-xs">
                          {t(`priorities.${alert.priority}`)}
                        </Badge>
                        <Badge variant="default" className="text-xs">
                          {alert.category}
                        </Badge>
                        {!alert.enabled && (
                          <Badge variant="warning" className="text-xs">
                            {tc('status.disabled')}
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          <span className="font-medium">{t('fields.titleKey')}:</span> {alert.titleKey}
                        </div>
                        <div>
                          <span className="font-medium">{t('fields.messageKey')}:</span> {alert.messageKey}
                        </div>
                        {alert.daysBeforeDue !== undefined && (
                          <div>
                            <span className="font-medium">{t('fields.daysBeforeDue')}:</span> {alert.daysBeforeDue} {t('days')}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">{t('fields.severity')}:</span> {alert.severity}/10
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant={alert.enabled ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleEnabled(alert)}
                      >
                        {alert.enabled ? t('actions.disable') : t('actions.enable')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info box */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            ℹ️ {t('messages.infoMessage')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
