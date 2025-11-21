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
import { Treatment } from '@/lib/types/treatment';

interface TreatmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment?: Treatment;
  onSave?: (treatment: Partial<Treatment>) => void;
}

export function TreatmentFormDialog({
  open,
  onOpenChange,
  treatment,
  onSave,
}: TreatmentFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Treatment>>(
    treatment || {
      productName: '',
      treatmentType: 'antiparasitic',
      targetType: 'individual',
      reason: '',
      dosage: '',
      administrationRoute: 'IM',
      startDate: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
      status: 'scheduled',
      duration: 1,
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
            {treatment ? 'Modifier le traitement' : 'Nouveau traitement'}
          </DialogTitle>
          <DialogDescription>
            {treatment
              ? 'Modifiez les informations du traitement'
              : 'Enregistrez un nouveau traitement vétérinaire'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Produit */}
          <div>
            <Label htmlFor="productName">Nom du produit *</Label>
            <Input
              id="productName"
              placeholder="Ivermectine 1%"
              required
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Type de traitement */}
            <div>
              <Label htmlFor="treatmentType">Type de traitement *</Label>
              <Select
                id="treatmentType"
                required
                value={formData.treatmentType}
                onChange={(e) =>
                  setFormData({ ...formData, treatmentType: e.target.value as any })
                }
              >
                <option value="antibiotic">Antibiotique</option>
                <option value="antiparasitic">Antiparasitaire</option>
                <option value="anti_inflammatory">Anti-inflammatoire</option>
                <option value="vitamin">Vitamine/Complément</option>
                <option value="other">Autre</option>
              </Select>
            </div>

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
                <option value="lot">Lot d'animaux</option>
              </Select>
            </div>
          </div>

          {/* Raison */}
          <div>
            <Label htmlFor="reason">Raison du traitement *</Label>
            <Input
              id="reason"
              placeholder="Infestation parasitaire..."
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          {/* Diagnostic */}
          <div>
            <Label htmlFor="diagnosis">Diagnostic</Label>
            <Input
              id="diagnosis"
              placeholder="Parasitose digestive confirmée..."
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            />
          </div>

          {/* Dosage et voie */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                placeholder="0.2 mg/kg"
                required
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="administrationRoute">Voie d'administration</Label>
              <Select
                id="administrationRoute"
                value={formData.administrationRoute}
                onChange={(e) =>
                  setFormData({ ...formData, administrationRoute: e.target.value })
                }
              >
                <option value="IM">Intramusculaire (IM)</option>
                <option value="SC">Sous-cutanée (SC)</option>
                <option value="oral">Orale</option>
                <option value="IV">Intraveineuse (IV)</option>
                <option value="topical">Topique</option>
              </Select>
            </div>
          </div>

          {/* Fréquence et durée */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="frequency">Fréquence</Label>
              <Input
                id="frequency"
                placeholder="1x par jour"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="duration">Durée (jours)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="5"
                value={formData.duration || ''}
                onChange={(e) =>
                  setFormData({ ...formData, duration: Number(e.target.value) })
                }
              />
            </div>
          </div>

          {/* Date de début */}
          <div>
            <Label htmlFor="startDate">Date de début *</Label>
            <Input
              id="startDate"
              type="date"
              required
              value={formData.startDate?.split('T')[0]}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value + 'T00:00:00Z' })
              }
            />
          </div>

          {/* Délais d'attente */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="withdrawalPeriodMeat">Délai viande (jours)</Label>
              <Input
                id="withdrawalPeriodMeat"
                type="number"
                placeholder="35"
                value={formData.withdrawalPeriodMeat || ''}
                onChange={(e) =>
                  setFormData({ ...formData, withdrawalPeriodMeat: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <Label htmlFor="withdrawalPeriodMilk">Délai lait (jours)</Label>
              <Input
                id="withdrawalPeriodMilk"
                type="number"
                placeholder="4"
                value={formData.withdrawalPeriodMilk || ''}
                onChange={(e) =>
                  setFormData({ ...formData, withdrawalPeriodMilk: Number(e.target.value) })
                }
              />
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

          {/* Coût */}
          <div>
            <Label htmlFor="cost">Coût (DA)</Label>
            <Input
              id="cost"
              type="number"
              placeholder="1200"
              value={formData.cost || ''}
              onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
            />
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
              <option value="scheduled">Programmé</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </Select>
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
            <Button type="submit">{treatment ? 'Mettre à jour' : 'Enregistrer'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
