'use client';

import React, { useEffect, useState } from 'react';
import { Animal } from '@/lib/types/animal';
import { Treatment } from '@/lib/types/treatment';
import { Vaccination } from '@/lib/types/vaccination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from '@/lib/i18n';
import { ChevronLeft, ChevronRight, Syringe, Pill } from 'lucide-react';
import { treatmentsService } from '@/lib/services/treatments.service';
import { vaccinationsService } from '@/lib/services/vaccinations.service';

interface AnimalDetailDialogProps {
  animal: Animal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animals?: Animal[];
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export function AnimalDetailDialog({
  animal,
  open,
  onOpenChange,
  animals = [],
  onNavigate,
}: AnimalDetailDialogProps) {
  const t = useTranslations('animals');
  const [activeTab, setActiveTab] = useState('info');
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loadingCare, setLoadingCare] = useState(false);

  const currentIndex = animal ? animals.findIndex((a) => a.id === animal.id) : -1;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < animals.length - 1 && currentIndex !== -1;

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

  if (!animal) return null;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'alive':
        return 'default';
      case 'sold':
        return 'secondary';
      case 'dead':
        return 'destructive';
      default:
        return 'outline';
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
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">
                {animal.currentEid || animal.officialNumber || animal.visualId || animal.id}
              </DialogTitle>
              <DialogDescription>
                {animal.breed?.name && (
                  <span className="text-sm">{animal.breed.name}</span>
                )}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(animal.status)}>
                {t(`status.${animal.status}`)}
              </Badge>
            </div>
          </div>

          {/* Navigation buttons */}
          {onNavigate && animals.length > 1 && (
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('prev')}
                disabled={!canGoPrev}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {currentIndex + 1} / {animals.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('next')}
                disabled={!canGoNext}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="care">
              Soins
              {(treatments.length > 0 || vaccinations.length > 0) && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {treatments.length + vaccinations.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 mt-4">
            {/* Section: Identification */}
            <div>
              <h3 className="text-sm font-semibold mb-3 border-b pb-2">{t('sections.general')}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {animal.currentEid && (
                  <div>
                    <span className="text-muted-foreground">{t('fields.currentEid')}:</span>
                    <p className="font-medium">{animal.currentEid}</p>
                  </div>
                )}
                {animal.officialNumber && (
                  <div>
                    <span className="text-muted-foreground">{t('fields.officialNumber')}:</span>
                    <p className="font-medium">{animal.officialNumber}</p>
                  </div>
                )}
                {animal.visualId && (
                  <div>
                    <span className="text-muted-foreground">{t('fields.visualId')}:</span>
                    <p className="font-medium">{animal.visualId}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">{t('fields.sex')}:</span>
                  <p className="font-medium">{t(`sex.${animal.sex}`)}</p>
                </div>
                {animal.birthDate && (
                  <div>
                    <span className="text-muted-foreground">{t('fields.birthDate')}:</span>
                    <p className="font-medium">{new Date(animal.birthDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Species & Breed */}
            {(animal.species || animal.breed) && (
              <div>
                <h3 className="text-sm font-semibold mb-3 border-b pb-2">Espèce et Race</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {animal.species && (
                    <div>
                      <span className="text-muted-foreground">{t('fields.speciesId')}:</span>
                      <p className="font-medium">{animal.species.name}</p>
                    </div>
                  )}
                  {animal.breed && (
                    <div>
                      <span className="text-muted-foreground">{t('fields.breedId')}:</span>
                      <p className="font-medium">{animal.breed.name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section: Genealogy */}
            {animal.mother && (
              <div>
                <h3 className="text-sm font-semibold mb-3 border-b pb-2">{t('sections.genealogy')}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Mère:</span>
                    <p className="font-medium">
                      {animal.mother.currentEid || animal.mother.officialNumber || animal.mother.visualId}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section: Additional Info */}
            {animal.notes && (
              <div>
                <h3 className="text-sm font-semibold mb-3 border-b pb-2">Informations supplémentaires</h3>
                <div className="text-sm">
                  <span className="text-muted-foreground">{t('fields.notes')}:</span>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{animal.notes}</p>
                </div>
              </div>
            )}

            {/* Section: Metadata */}
            <div>
              <h3 className="text-sm font-semibold mb-3 border-b pb-2">Métadonnées</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                {animal.createdAt && (
                  <div>
                    <span>{t('fields.createdAt')}:</span>
                    <p>{new Date(animal.createdAt).toLocaleString()}</p>
                  </div>
                )}
                {animal.updatedAt && (
                  <div>
                    <span>{t('fields.updatedAt')}:</span>
                    <p>{new Date(animal.updatedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="care" className="space-y-6 mt-4">
            {loadingCare ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : (
              <>
                {/* Treatments */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="h-5 w-5" />
                    <h3 className="text-sm font-semibold">Traitements</h3>
                    <Badge variant="outline" className="ml-auto">
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
                    <Badge variant="outline" className="ml-auto">
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
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
