'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
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
      eid: '',
      internalId: '',
      name: '',
      species: 'sheep',
      breed: '',
      sex: 'female',
      birthDate: '',
      status: 'active',
      acquisitionType: 'birth',
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
                value={formData.eid}
                onChange={(e) => setFormData({ ...formData, eid: e.target.value })}
              />
            </div>

            {/* ID Interne */}
            <div>
              <Label htmlFor="internalId">ID Interne</Label>
              <Input
                id="internalId"
                placeholder="A-001"
                value={formData.internalId}
                onChange={(e) => setFormData({ ...formData, internalId: e.target.value })}
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
                id="species"
                required
                value={formData.species}
                onChange={(e) =>
                  setFormData({ ...formData, species: e.target.value as any })
                }
              >
                <option value="sheep">Ovin</option>
                <option value="goat">Caprin</option>
                <option value="cattle">Bovin</option>
              </Select>
            </div>

            {/* Sexe */}
            <div>
              <Label htmlFor="sex">Sexe *</Label>
              <Select
                id="sex"
                required
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
              >
                <option value="female">Femelle</option>
                <option value="male">Mâle</option>
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
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Type d'acquisition */}
            <div>
              <Label htmlFor="acquisitionType">Type d&apos;acquisition *</Label>
              <Select
                id="acquisitionType"
                required
                value={formData.acquisitionType}
                onChange={(e) =>
                  setFormData({ ...formData, acquisitionType: e.target.value as any })
                }
              >
                <option value="birth">Naissance</option>
                <option value="purchase">Achat</option>
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
              id="status"
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="active">Actif</option>
              <option value="sold">Vendu</option>
              <option value="dead">Décédé</option>
              <option value="slaughtered">Abattu</option>
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
