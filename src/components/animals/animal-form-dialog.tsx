'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Animal, CreateAnimalDto, UpdateAnimalDto } from '@/lib/types/animal';
import { Treatment } from '@/lib/types/treatment';
import { Vaccination } from '@/lib/types/vaccination';
import { useTranslations } from '@/lib/i18n';
import { useBreeds } from '@/lib/hooks/useBreeds';
import { treatmentsService } from '@/lib/services/treatments.service';
import { vaccinationsService } from '@/lib/services/vaccinations.service';
import { Pill, Syringe } from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState('info');
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

  // Care data (only for editing existing animals)
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loadingCare, setLoadingCare] = useState(false);

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
      setActiveTab('info'); // Reset to info tab when creating new animal
    }
  }, [animal]);

  const loadCareData = React.useCallback(async () => {
    if (!animal) return;
    setLoadingCare(true);
    try {
      const [treatmentsData, vaccinationsData] = await Promise.all([
        treatmentsService.getAll({ animalId: animal.id }),
        vaccinationsService.getAll({ animalId: animal.id }),
      ]);
      setTreatments(treatmentsData);
      setVaccinations(vaccinationsData);
    } catch (error) {
      console.error('Failed to load care data:', error);
    } finally {
      setLoadingCare(false);
    }
  }, [animal]);

  useEffect(() => {
    if (animal && activeTab === 'care') {
      loadCareData();
    }
  }, [animal, activeTab, loadCareData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getTreatmentStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'scheduled':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getVaccinationStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'scheduled':
        return 'bg-yellow-500';
      case 'overdue':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('editAnimal') : t('newAnimal')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('messages.editDescription') : t('messages.addDescription')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="care" disabled={!isEditing}>
              Soins
              {isEditing && (treatments.length > 0 || vaccinations.length > 0) && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {treatments.length + vaccinations.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
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
          </TabsContent>

          <TabsContent value="care" className="space-y-6 py-4">
            {loadingCare ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : (
              <>
                {/* Treatments */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="h-5 w-5" />
                    <h3 className="text-sm font-semibold">Traitements</h3>
                    <Badge variant="default" className="ml-auto">
                      {treatments.length}
                    </Badge>
                  </div>
                  {treatments.length === 0 ? (
                    <div className="text-sm text-muted-foreground border rounded-lg p-4 text-center">
                      Aucun traitement enregistré
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {treatments.map((treatment) => (
                        <div
                          key={treatment.id}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{treatment.productName}</p>
                              <p className="text-sm text-muted-foreground">{treatment.reason}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${getTreatmentStatusColor(treatment.status)}`} />
                              <span className="text-xs text-muted-foreground capitalize">
                                {treatment.status}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Date:</span>
                              <p>{new Date(treatment.treatmentDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Dose:</span>
                              <p>{treatment.dose} {treatment.dosageUnit}</p>
                            </div>
                          </div>
                          {treatment.notes && (
                            <p className="text-xs text-muted-foreground italic">{treatment.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vaccinations */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Syringe className="h-5 w-5" />
                    <h3 className="text-sm font-semibold">Vaccinations</h3>
                    <Badge variant="default" className="ml-auto">
                      {vaccinations.length}
                    </Badge>
                  </div>
                  {vaccinations.length === 0 ? (
                    <div className="text-sm text-muted-foreground border rounded-lg p-4 text-center">
                      Aucune vaccination enregistrée
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vaccinations.map((vaccination) => (
                        <div
                          key={vaccination.id}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{vaccination.vaccineName}</p>
                              <p className="text-sm text-muted-foreground">{vaccination.diseaseTarget}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${getVaccinationStatusColor(vaccination.status)}`} />
                              <span className="text-xs text-muted-foreground capitalize">
                                {vaccination.status}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Date:</span>
                              <p>{new Date(vaccination.vaccinationDate).toLocaleDateString()}</p>
                            </div>
                            {vaccination.nextDueDate && (
                              <div>
                                <span className="text-muted-foreground">Prochain rappel:</span>
                                <p>{new Date(vaccination.nextDueDate).toLocaleDateString()}</p>
                              </div>
                            )}
                          </div>
                          {vaccination.notes && (
                            <p className="text-xs text-muted-foreground italic">{vaccination.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-sm text-muted-foreground text-center pt-4 border-t">
                  Pour ajouter des traitements ou vaccinations, utilisez les écrans dédiés.
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
