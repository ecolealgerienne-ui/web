'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { SmartSelect, SmartSelectItem } from '@/components/ui/smart-select';
import { useFarmerPreferences } from '@/lib/hooks/useFarmerPreferences';
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

// Mock data - À remplacer par les vraies données du catalogue
const MOCK_MEDICATIONS: SmartSelectItem[] = [
  { id: 'med-1', name: 'Oxytétracycline 20%', description: 'Antibiotique' },
  { id: 'med-2', name: 'Pénicilline-Streptomycine', description: 'Antibiotique' },
  { id: 'med-3', name: 'Amoxicilline', description: 'Antibiotique' },
  { id: 'med-4', name: 'Enrofloxacine', description: 'Antibiotique' },
  { id: 'med-5', name: 'Ivermectine 1%', description: 'Antiparasitaire' },
  { id: 'med-6', name: 'Albendazole', description: 'Antiparasitaire' },
  { id: 'med-7', name: 'Fenbendazole', description: 'Antiparasitaire' },
  { id: 'med-8', name: 'Lévamisole', description: 'Antiparasitaire' },
  { id: 'med-9', name: 'Méloxicam', description: 'Anti-inflammatoire' },
  { id: 'med-10', name: 'Flunixine', description: 'Anti-inflammatoire' },
  { id: 'med-11', name: 'Dexaméthasone', description: 'Corticoïde' },
  { id: 'med-12', name: 'Vitamine AD3E', description: 'Vitamine' },
  { id: 'med-13', name: 'Complexe B', description: 'Vitamine' },
  { id: 'med-14', name: 'Calcium Borogluconate', description: 'Minéral' },
];

const MOCK_VETERINARIANS: SmartSelectItem[] = [
  { id: 'vet-1', name: 'Dr. Karim Benali', description: 'Médecine générale' },
  { id: 'vet-2', name: 'Dr. Amira Hadj', description: 'Chirurgie' },
  { id: 'vet-3', name: 'Dr. Mohamed Saidi', description: 'Médecine bovine' },
  { id: 'vet-4', name: 'Dr. Fatima Zerrouki', description: 'Médecine ovine' },
  { id: 'vet-5', name: 'Dr. Youcef Belkacem', description: 'Volaille' },
];

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
  const {
    enrichItems,
    toggleFavorite,
    incrementUsage,
    addLocalItem,
  } = useFarmerPreferences();

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

  // État pour les sélections SmartSelect
  const [selectedMedicationId, setSelectedMedicationId] = useState<string>('');
  const [selectedVeterinarianId, setSelectedVeterinarianId] = useState<string>('');

  // Enrichir les items avec favoris et usage
  const enrichedMedications = useMemo(
    () => enrichItems('medications', MOCK_MEDICATIONS),
    [enrichItems]
  );

  const enrichedVeterinarians = useMemo(
    () => enrichItems('veterinarians', MOCK_VETERINARIANS),
    [enrichItems]
  );

  // Handlers pour les sélections
  const handleMedicationChange = useCallback((medicationId: string) => {
    setSelectedMedicationId(medicationId);
    const medication = enrichedMedications.find((m) => m.id === medicationId);
    if (medication) {
      setFormData((prev) => ({ ...prev, productName: medication.name }));
      incrementUsage('medications', medicationId);
    }
  }, [enrichedMedications, incrementUsage]);

  const handleVeterinarianChange = useCallback((vetId: string) => {
    setSelectedVeterinarianId(vetId);
    const vet = enrichedVeterinarians.find((v) => v.id === vetId);
    if (vet) {
      setFormData((prev) => ({ ...prev, veterinarianName: vet.name }));
      incrementUsage('veterinarians', vetId);
    }
  }, [enrichedVeterinarians, incrementUsage]);

  // Créer un nouveau médicament local
  const handleCreateMedication = useCallback(async (name: string): Promise<SmartSelectItem | null> => {
    const newItem: SmartSelectItem = {
      id: `local-med-${Date.now()}`,
      name,
      description: 'Produit local',
      isLocal: true,
    };
    addLocalItem('medications', newItem);
    return newItem;
  }, [addLocalItem]);

  // Créer un nouveau vétérinaire local
  const handleCreateVeterinarian = useCallback(async (name: string): Promise<SmartSelectItem | null> => {
    const newItem: SmartSelectItem = {
      id: `local-vet-${Date.now()}`,
      name,
      description: 'Vétérinaire local',
      isLocal: true,
    };
    addLocalItem('veterinarians', newItem);
    return newItem;
  }, [addLocalItem]);

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
          {/* Produit - SmartSelect */}
          <SmartSelect
            label="Produit *"
            items={enrichedMedications}
            value={selectedMedicationId}
            onChange={handleMedicationChange}
            onCreateLocal={handleCreateMedication}
            onToggleFavorite={(id) => toggleFavorite('medications', id)}
            placeholder="Sélectionner un produit..."
            createLabel="Ajouter un produit"
            createDialogTitle="Ajouter un nouveau produit"
            createInputPlaceholder="Nom du produit..."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {/* Type de traitement */}
            <div>
              <Label htmlFor="treatmentType">Type de traitement *</Label>
              <Select
                required
                value={formData.treatmentType}
                onChange={(e) =>
                  setFormData({ ...formData, treatmentType: e.target.value as Treatment['treatmentType'] })
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
                onChange={(e) =>
                  setFormData({ ...formData, targetType: e.target.value as Treatment['targetType'] })
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

          {/* Vétérinaire - SmartSelect */}
          <SmartSelect
            label="Vétérinaire"
            items={enrichedVeterinarians}
            value={selectedVeterinarianId}
            onChange={handleVeterinarianChange}
            onCreateLocal={handleCreateVeterinarian}
            onToggleFavorite={(id) => toggleFavorite('veterinarians', id)}
            placeholder="Sélectionner un vétérinaire..."
            createLabel="Ajouter un vétérinaire"
            createDialogTitle="Ajouter un nouveau vétérinaire"
            createInputPlaceholder="Nom du vétérinaire..."
          />

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
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Treatment['status'] })}
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
