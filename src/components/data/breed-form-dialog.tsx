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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breed, CreateBreedDto, UpdateBreedDto } from '@/lib/types/breed';
import { breedsService } from '@/lib/services/breeds.service';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';

interface BreedFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breed?: Breed | null;
  onSuccess: () => void;
}

export function BreedFormDialog({
  open,
  onOpenChange,
  breed,
  onSuccess,
}: BreedFormDialogProps) {
  const t = useTranslations('breeds');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const speciesOptions = [
    { value: 'sheep', label: t('species.sheep') },
    { value: 'goat', label: t('species.goat') },
    { value: 'cattle', label: t('species.cattle') },
  ];
  const [formData, setFormData] = useState({
    id: '',
    speciesId: 'sheep',
    nameFr: '',
    nameEn: '',
    nameAr: '',
    description: '',
    displayOrder: 0,
    isActive: true,
  });

  const isEditMode = Boolean(breed);

  // Charger les données du breed en mode édition
  useEffect(() => {
    if (breed) {
      setFormData({
        id: breed.id,
        speciesId: breed.speciesId,
        nameFr: breed.nameFr,
        nameEn: breed.nameEn,
        nameAr: breed.nameAr,
        description: breed.description || '',
        displayOrder: breed.displayOrder || 0,
        isActive: breed.isActive ?? true,
      });
    } else {
      // Réinitialiser le formulaire en mode création
      setFormData({
        id: '',
        speciesId: 'sheep',
        nameFr: '',
        nameEn: '',
        nameAr: '',
        description: '',
        displayOrder: 0,
        isActive: true,
      });
    }
  }, [breed, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        // Mode édition
        const updateData: UpdateBreedDto = {
          speciesId: formData.speciesId,
          nameFr: formData.nameFr,
          nameEn: formData.nameEn,
          nameAr: formData.nameAr,
          description: formData.description || undefined,
          displayOrder: formData.displayOrder,
          isActive: formData.isActive,
        };
        await breedsService.update(breed!.id, updateData);
        toast.success(tc('messages.success'), t('messages.updated'));
      } else {
        // Mode création
        const createData: CreateBreedDto = {
          id: formData.id,
          speciesId: formData.speciesId,
          nameFr: formData.nameFr,
          nameEn: formData.nameEn,
          nameAr: formData.nameAr,
          description: formData.description || undefined,
          displayOrder: formData.displayOrder,
          isActive: formData.isActive,
        };
        await breedsService.create(createData);
        toast.success(tc('messages.success'), t('messages.created'));
      }

      onSuccess();
      // Le parent fermera le dialogue après le refetch
    } catch (error) {
      const errorMessage = isEditMode
        ? t('messages.updateError')
        : t('messages.createError');
      toast.error(tc('messages.error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('editBreed') : t('newBreed')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* ID - uniquement en mode création */}
            {!isEditMode && (
              <div className="col-span-2">
                <Label htmlFor="id">
                  {t('fields.id')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  required
                  placeholder={t('placeholders.id')}
                />
              </div>
            )}

            {/* Espèce */}
            <div className="col-span-2">
              <Label htmlFor="speciesId">
                {t('fields.speciesId')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.speciesId}
                onValueChange={(value) =>
                  setFormData({ ...formData, speciesId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {speciesOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nom FR */}
            <div>
              <Label htmlFor="nameFr">
                {t('fields.nameFr')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nameFr"
                value={formData.nameFr}
                onChange={(e) =>
                  setFormData({ ...formData, nameFr: e.target.value })
                }
                required
                placeholder={t('placeholders.nameFr')}
              />
            </div>

            {/* Nom EN */}
            <div>
              <Label htmlFor="nameEn">
                {t('fields.nameEn')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) =>
                  setFormData({ ...formData, nameEn: e.target.value })
                }
                required
                placeholder={t('placeholders.nameEn')}
              />
            </div>

            {/* Nom AR */}
            <div className="col-span-2">
              <Label htmlFor="nameAr">
                {t('fields.nameAr')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) =>
                  setFormData({ ...formData, nameAr: e.target.value })
                }
                required
                placeholder={t('placeholders.nameAr')}
                dir="rtl"
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Label htmlFor="description">{t('fields.description')}</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('placeholders.description')}
              />
            </div>

            {/* Ordre d'affichage */}
            <div>
              <Label htmlFor="displayOrder">{t('fields.displayOrder')}</Label>
              <Input
                id="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayOrder: parseInt(e.target.value) || 0,
                  })
                }
                min={0}
              />
            </div>

            {/* Actif */}
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                {t('fields.isActive')}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {tc('actions.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? tc('actions.saving')
                : isEditMode
                  ? tc('actions.edit')
                  : tc('actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
