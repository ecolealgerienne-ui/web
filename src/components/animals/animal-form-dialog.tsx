'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Animal, CreateAnimalDto, UpdateAnimalDto } from '@/lib/types/animal';
import { useTranslations } from '@/lib/i18n';
import { useBreeds } from '@/lib/hooks/useBreeds';

interface AnimalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animal?: Animal | null;
  onSubmit: (data: CreateAnimalDto | UpdateAnimalDto) => Promise<void>;
  isLoading?: boolean;
}

export function AnimalFormDialog({
  open,
  onOpenChange,
  animal,
  onSubmit,
  isLoading,
}: AnimalFormDialogProps) {
  const t = useTranslations('animals');
  const tc = useTranslations('common');
  const isEditing = !!animal;

  const [formData, setFormData] = useState<CreateAnimalDto>({
    birthDate: '',
    sex: 'female',
    currentEid: '',
    officialNumber: '',
    visualId: '',
    speciesId: '',
    breedId: '',
    status: 'alive',
    notes: '',
  });

  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('');
  const { breeds } = useBreeds(selectedSpeciesId);

  useEffect(() => {
    if (animal) {
      setFormData({
        birthDate: animal.birthDate || '',
        sex: animal.sex,
        currentEid: animal.currentEid || '',
        officialNumber: animal.officialNumber || '',
        visualId: animal.visualId || '',
        speciesId: animal.speciesId || '',
        breedId: animal.breedId || '',
        status: animal.status,
        notes: animal.notes || '',
      });
      setSelectedSpeciesId(animal.speciesId || '');
    } else {
      setFormData({
        birthDate: '',
        sex: 'female',
        currentEid: '',
        officialNumber: '',
        visualId: '',
        speciesId: '',
        breedId: '',
        status: 'alive',
        notes: '',
      });
      setSelectedSpeciesId('');
    }
  }, [animal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('editAnimal') : t('newAnimal')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('messages.editDescription') : t('messages.addDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Section: Identification */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.general')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentEid">{t('fields.currentEid')}</Label>
                <Input
                  id="currentEid"
                  value={formData.currentEid}
                  onChange={(e) => setFormData({ ...formData, currentEid: e.target.value })}
                  placeholder="Ex: 250268001234567"
                  maxLength={15}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="officialNumber">{t('fields.officialNumber')}</Label>
                <Input
                  id="officialNumber"
                  value={formData.officialNumber}
                  onChange={(e) => setFormData({ ...formData, officialNumber: e.target.value })}
                  placeholder="Ex: DZ-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visualId">{t('fields.visualId')}</Label>
                <Input
                  id="visualId"
                  value={formData.visualId}
                  onChange={(e) => setFormData({ ...formData, visualId: e.target.value })}
                  placeholder="Ex: A-001"
                />
              </div>
            </div>
          </div>

          {/* Section: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">Informations de base</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sex">{t('fields.sex')} *</Label>
                <Select
                  value={formData.sex}
                  onValueChange={(value) => setFormData({ ...formData, sex: value as 'male' | 'female' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">{t('sex.female')}</SelectItem>
                    <SelectItem value="male">{t('sex.male')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">{t('fields.birthDate')} *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{t('fields.status')} *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alive">{t('status.alive')}</SelectItem>
                    <SelectItem value="sold">{t('status.sold')}</SelectItem>
                    <SelectItem value="dead">{t('status.dead')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section: Species & Breed */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">Espèce et Race</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="speciesId">{t('fields.speciesId')}</Label>
                <Input
                  id="speciesId"
                  value={formData.speciesId}
                  onChange={(e) => {
                    setFormData({ ...formData, speciesId: e.target.value, breedId: '' });
                    setSelectedSpeciesId(e.target.value);
                  }}
                  placeholder="Ex: UUID de l'espèce"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breedId">{t('fields.breedId')}</Label>
                {breeds.length > 0 ? (
                  <Select
                    value={formData.breedId}
                    onValueChange={(value) => setFormData({ ...formData, breedId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une race" />
                    </SelectTrigger>
                    <SelectContent>
                      {breeds.map((breed) => (
                        <SelectItem key={breed.id} value={breed.id}>
                          {breed.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="breedId"
                    value={formData.breedId}
                    onChange={(e) => setFormData({ ...formData, breedId: e.target.value })}
                    placeholder="Ex: UUID de la race"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section: Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">Notes</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">{t('fields.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('placeholders.notes')}
                rows={3}
                maxLength={1000}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {tc('actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('actions.saving') : isEditing ? tc('actions.save') : tc('actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
