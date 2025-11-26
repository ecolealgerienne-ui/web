'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
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
      dose: 0,
      dosageUnit: 'ml',
      administrationRoute: 'IM',
      treatmentDate: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
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
                required
                value={formData.treatmentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, treatmentType: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="antibiotic">Antibiotique</SelectItem>
                  <SelectItem value="antiparasitic">Antiparasitaire</SelectItem>
                  <SelectItem value="anti_inflammatory">Anti-inflammatoire</SelectItem>
                  <SelectItem value="vitamin">Vitamine/Complément</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type de cible */}
            <div>
              <Label htmlFor="targetType">Cible *</Label>
              <Select
                required
                value={formData.targetType}
                onValueChange={(value) =>
                  setFormData({ ...formData, targetType: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une cible" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Animal individuel</SelectItem>
                  <SelectItem value="lot">Lot d&apos;animaux</SelectItem>
                </SelectContent>
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
                type="number"
                step="0.01"
                placeholder="0.2"
                required
                value={formData.dose}
                onChange={(e) => setFormData({ ...formData, dose: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="administrationRoute">Voie d&apos;administration</Label>
              <Select
                value={formData.administrationRoute}
                onValueChange={(value) =>
                  setFormData({ ...formData, administrationRoute: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une voie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IM">Intramusculaire (IM)</SelectItem>
                  <SelectItem value="SC">Sous-cutanée (SC)</SelectItem>
                  <SelectItem value="oral">Orale</SelectItem>
                  <SelectItem value="IV">Intraveineuse (IV)</SelectItem>
                  <SelectItem value="topical">Topique</SelectItem>
                </SelectContent>
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
              value={formData.treatmentDate?.split('T')[0]}
              onChange={(e) =>
                setFormData({ ...formData, treatmentDate: e.target.value + 'T00:00:00Z' })
              }
            />
          </div>

          {/* Délais d&apos;attente */}
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
              required
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Programmé</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
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
