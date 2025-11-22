'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useFarmPreferences } from '@/lib/hooks/useFarmPreferences';
import { UpdateFarmPreferenceDto } from '@/lib/types/farm-preference';
import { farmPreferencesService } from '@/lib/services/farm-preferences.service';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';

export default function FarmPreferencesPage() {
  const t = useTranslations('farmPreferences');
  const tc = useCommonTranslations();
  const toast = useToast();
  const { preferences, loading, error, refetch } = useFarmPreferences();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    defaultVeterinarianId: '',
    defaultSpeciesId: '',
    defaultBreedId: '',
    weightUnit: 'kg',
    currency: 'EUR',
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    enableNotifications: true,
  });

  // Charger les préférences existantes
  useEffect(() => {
    if (preferences) {
      setFormData({
        defaultVeterinarianId: preferences.defaultVeterinarianId || '',
        defaultSpeciesId: preferences.defaultSpeciesId || '',
        defaultBreedId: preferences.defaultBreedId || '',
        weightUnit: preferences.weightUnit || 'kg',
        currency: preferences.currency || 'EUR',
        language: preferences.language || 'fr',
        dateFormat: preferences.dateFormat || 'DD/MM/YYYY',
        enableNotifications: preferences.enableNotifications ?? true,
      });
    }
  }, [preferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData: UpdateFarmPreferenceDto = { ...formData };
      await farmPreferencesService.update(updateData);
      toast.success(tc('messages.success'), t('messages.updated'));
      refetch();
    } catch (error) {
      toast.error(tc('messages.error'), t('messages.updateError'));
    } finally {
      setSaving(false);
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

      {/* Formulaire de préférences */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.general')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Section: Valeurs par défaut */}
            <div>
              <h3 className="text-sm font-semibold mb-3">{t('sections.defaults')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="defaultVeterinarianId">{t('fields.defaultVeterinarianId')}</Label>
                  <Input
                    id="defaultVeterinarianId"
                    value={formData.defaultVeterinarianId}
                    onChange={(e) => setFormData({ ...formData, defaultVeterinarianId: e.target.value })}
                    placeholder={t('placeholders.defaultVeterinarianId')}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultSpeciesId">{t('fields.defaultSpeciesId')}</Label>
                  <Select
                    id="defaultSpeciesId"
                    value={formData.defaultSpeciesId}
                    onChange={(e) => setFormData({ ...formData, defaultSpeciesId: e.target.value })}
                  >
                    <option value="">{t('placeholders.selectSpecies')}</option>
                    <option value="cattle">{t('species.cattle')}</option>
                    <option value="sheep">{t('species.sheep')}</option>
                    <option value="goat">{t('species.goat')}</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="defaultBreedId">{t('fields.defaultBreedId')}</Label>
                  <Input
                    id="defaultBreedId"
                    value={formData.defaultBreedId}
                    onChange={(e) => setFormData({ ...formData, defaultBreedId: e.target.value })}
                    placeholder={t('placeholders.defaultBreedId')}
                  />
                </div>
              </div>
            </div>

            {/* Section: Unités et formats */}
            <div>
              <h3 className="text-sm font-semibold mb-3">{t('sections.unitsFormats')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="weightUnit">{t('fields.weightUnit')}</Label>
                  <Select
                    id="weightUnit"
                    value={formData.weightUnit}
                    onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">{t('fields.currency')}</Label>
                  <Select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="DZD">DZD (دج)</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">{t('fields.language')}</Label>
                  <Select
                    id="language"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">{t('fields.dateFormat')}</Label>
                  <Select
                    id="dateFormat"
                    value={formData.dateFormat}
                    onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section: Notifications */}
            <div>
              <h3 className="text-sm font-semibold mb-3">{t('sections.notifications')}</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableNotifications"
                  checked={formData.enableNotifications}
                  onChange={(e) => setFormData({ ...formData, enableNotifications: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="enableNotifications" className="cursor-pointer">
                  {t('fields.enableNotifications')}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {t('messages.notificationsInfo')}
              </p>
            </div>

            {/* Bouton de sauvegarde */}
            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? tc('actions.saving') : tc('actions.save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
