'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Animal } from '@/lib/types/animal';

interface AnimalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animal?: Animal;
  onSave?: (animal: Partial<Animal>) => void;
}

export function AnimalFormDialog({
  open,
  onOpenChange,
  animal,
  onSave,
}: AnimalFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Animal>>(
    animal || {
      identificationNumber: '',
      
      name: '',
      speciesId: 'sheep',
      breedId: '',
      sex: 'female',
      birthDate: '',
      status: 'alive' as const,
      
      acquisitionDate: new Date().toISOString().split('T')[0],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{animal ? 'Modifier l\'animal' : 'Ajouter un animal'}</DialogTitle>
          <DialogDescription>
            {animal
              ? 'Modifiez les informations de l\'animal'
              : 'Remplissez les informations pour ajouter un nouvel animal'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* EID */}
            <div>
              <Label htmlFor="eid">EID (Électronique) *</Label>
              <Input
                id="eid"
                placeholder="250268001234567"
                required
                value={formData.identificationNumber}
                onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
              />
            </div>

            {/* ID Interne */}
            <div>
              <Label htmlFor="internalId">ID Interne</Label>
              <Input
                id="internalId"
                placeholder="A-001"
                value={formData.identificationNumber}
                onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
              />
            </div>
          </div>

          {/* Nom */}
          <div>
            <Label htmlFor="name">Nom (optionnel)</Label>
            <Input
              id="name"
              placeholder="Bella"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Espèce */}
            <div>
              <Label htmlFor="species">Espèce *</Label>
              <Select
                required
                value={formData.speciesId}
                onValueChange={(value) =>
                  setFormData({ ...formData, speciesId: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sheep">Ovin</SelectItem>
                  <SelectItem value="goat">Caprin</SelectItem>
                  <SelectItem value="cattle">Bovin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sexe */}
            <div>
              <Label htmlFor="sex">Sexe *</Label>
              <Select
                required
                value={formData.sex}
                onValueChange={(value) => setFormData({ ...formData, sex: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Femelle</SelectItem>
                  <SelectItem value="male">Mâle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date de naissance */}
            <div>
              <Label htmlFor="birthDate">Date de naissance *</Label>
              <Input
                id="birthDate"
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>
          </div>

          {/* Race */}
          <div>
            <Label htmlFor="breed">Race</Label>
            <Input
              id="breed"
              placeholder="Ouled Djellal"
              value={formData.breedId}
              onChange={(e) => setFormData({ ...formData, breedId: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Type d'acquisition */}
            <div>
              <Label htmlFor="acquisitionType">Type d&apos;acquisition *</Label>
              <Select
                required
                value={formData.identificationNumber}
                onValueChange={(value) =>
                  setFormData({ ...formData, acquisitionDate: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birth">Naissance</SelectItem>
                  <SelectItem value="purchase">Achat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date d'acquisition */}
            <div>
              <Label htmlFor="acquisitionDate">Date d&apos;acquisition *</Label>
              <Input
                id="acquisitionDate"
                type="date"
                required
                value={formData.acquisitionDate}
                onChange={(e) =>
                  setFormData({ ...formData, acquisitionDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Statut */}
          <div>
            <Label htmlFor="status">Statut *</Label>
            <Select
              required
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="sold">Vendu</SelectItem>
                <SelectItem value="dead">Décédé</SelectItem>
                <SelectItem value="slaughtered">Abattu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">{animal ? 'Mettre à jour' : 'Ajouter'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
