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
import { Vaccination } from '@/lib/types/vaccination';

interface VaccinationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaccination?: Vaccination;
  onSave?: (vaccination: Partial<Vaccination>) => void;
}

export function VaccinationFormDialog({
  open,
  onOpenChange,
  vaccination,
  onSave,
}: VaccinationFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Vaccination>>(
    vaccination || {
      vaccineName: '',
      diseaseTarget: '',
      targetType: 'individual',
      vaccinationDate: new Date().toISOString().split('T')[0] + 'T09:00:00Z',
      status: 'scheduled',
      dose: '',
      administrationRoute: 'SC',
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
          <DialogTitle>
            {vaccination ? 'Modifier la vaccination' : 'Programmer une vaccination'}
          </DialogTitle>
          <DialogDescription>
            {vaccination
              ? 'Modifiez les informations de la vaccination'
              : 'Planifiez une nouvelle vaccination'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Vaccin */}
          <div>
            <Label htmlFor="vaccineName">Nom du vaccin *</Label>
            <Input
              id="vaccineName"
              placeholder="Vaccin PPR"
              required
              value={formData.vaccineName}
              onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
            />
          </div>

          {/* Maladie ciblée */}
          <div>
            <Label htmlFor="diseaseTarget">Maladie ciblée *</Label>
            <Input
              id="diseaseTarget"
              placeholder="Peste des Petits Ruminants"
              required
              value={formData.diseaseTarget}
              onChange={(e) =>
                setFormData({ ...formData, diseaseTarget: e.target.value })
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Type de cible */}
            <div>
              <Label htmlFor="targetType">Cible *</Label>
              <Select
                id="targetType"
                required
                value={formData.targetType}
                onChange={(e) =>
                  setFormData({ ...formData, targetType: e.target.value as any })
                }
              >
                <option value="individual">Animal individuel</option>
                <option value="lot">Lot d&apos;animaux</option>
              </Select>
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
                <option value="scheduled">Programmée</option>
                <option value="completed">Effectuée</option>
                <option value="overdue">En retard</option>
                <option value="cancelled">Annulée</option>
              </Select>
            </div>
          </div>

          {/* Fabricant */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="manufacturer">Fabricant</Label>
              <Input
                id="manufacturer"
                placeholder="MCI Santé Animale"
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
              />
            </div>

            {/* Numéro de lot */}
            <div>
              <Label htmlFor="batchNumber">N° de lot</Label>
              <Input
                id="batchNumber"
                placeholder="PPR-2025-A123"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              />
            </div>
          </div>

          {/* Date programmée */}
          <div>
            <Label htmlFor="scheduledDate">Date programmée *</Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              required
              value={formData.vaccinationDate?.slice(0, 16)}
              onChange={(e) =>
                setFormData({ ...formData, vaccinationDate: e.target.value + ':00Z' })
              }
            />
          </div>

          {/* Dosage et voie */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                placeholder="1 ml"
                value={formData.dose}
                onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="administrationRoute">Voie d&apos;administration</Label>
              <Select
                id="administrationRoute"
                value={formData.administrationRoute}
                onChange={(e) =>
                  setFormData({ ...formData, administrationRoute: e.target.value })
                }
              >
                <option value="SC">Sous-cutanée (SC)</option>
                <option value="IM">Intramusculaire (IM)</option>
                <option value="ID">Intradermique (ID)</option>
                <option value="oral">Orale</option>
                <option value="IV">Intraveineuse (IV)</option>
              </Select>
            </div>
          </div>

          {/* Vétérinaire */}
          <div>
            <Label htmlFor="veterinarianName">Vétérinaire</Label>
            <Input
              id="veterinarianName"
              placeholder="Dr. Karim Benali"
              value={formData.veterinarianName}
              onChange={(e) =>
                setFormData({ ...formData, veterinarianName: e.target.value })
              }
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Notes supplémentaires..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">{vaccination ? 'Mettre à jour' : 'Programmer'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
