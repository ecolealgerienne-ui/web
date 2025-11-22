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
import { Select } from '@/components/ui/select';
import { Breed, CreateBreedDto, UpdateBreedDto } from '@/lib/types/breed';
import { breedsService } from '@/lib/services/breeds.service';
import { useToast } from '@/contexts/toast-context';

interface BreedFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breed?: Breed | null;
  onSuccess: () => void;
}

const speciesOptions = [
  { value: 'sheep', label: 'Moutons' },
  { value: 'goat', label: 'Chèvres' },
  { value: 'cattle', label: 'Bovins' },
];

export function BreedFormDialog({
  open,
  onOpenChange,
  breed,
  onSuccess,
}: BreedFormDialogProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
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
        toast.success('Succès', 'Race modifiée avec succès');
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
        toast.success('Succès', 'Race créée avec succès');
      }

      onSuccess();
      // Le parent fermera le dialogue après le refetch
    } catch (error) {
      const errorMessage = isEditMode
        ? 'Erreur lors de la modification de la race'
        : 'Erreur lors de la création de la race';
      toast.error('Erreur', errorMessage);
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
            {isEditMode ? 'Modifier la race' : 'Nouvelle race'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* ID - uniquement en mode création */}
            {!isEditMode && (
              <div className="col-span-2">
                <Label htmlFor="id">
                  ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  required
                  placeholder="ex: ouled-djellal"
                />
              </div>
            )}

            {/* Espèce */}
            <div className="col-span-2">
              <Label htmlFor="speciesId">
                Espèce <span className="text-destructive">*</span>
              </Label>
              <Select
                id="speciesId"
                value={formData.speciesId}
                onChange={(e) =>
                  setFormData({ ...formData, speciesId: e.target.value })
                }
                required
              >
                {speciesOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Nom FR */}
            <div>
              <Label htmlFor="nameFr">
                Nom (Français) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nameFr"
                value={formData.nameFr}
                onChange={(e) =>
                  setFormData({ ...formData, nameFr: e.target.value })
                }
                required
                placeholder="ex: Ouled Djellal"
              />
            </div>

            {/* Nom EN */}
            <div>
              <Label htmlFor="nameEn">
                Nom (English) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) =>
                  setFormData({ ...formData, nameEn: e.target.value })
                }
                required
                placeholder="ex: Ouled Djellal"
              />
            </div>

            {/* Nom AR */}
            <div className="col-span-2">
              <Label htmlFor="nameAr">
                Nom (العربية) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) =>
                  setFormData({ ...formData, nameAr: e.target.value })
                }
                required
                placeholder="أولاد جلال"
                dir="rtl"
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Description de la race"
              />
            </div>

            {/* Ordre d'affichage */}
            <div>
              <Label htmlFor="displayOrder">Ordre d'affichage</Label>
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
                Actif
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
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Enregistrement...'
                : isEditMode
                  ? 'Modifier'
                  : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
