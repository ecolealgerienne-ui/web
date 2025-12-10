'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AnimalEvent, CreateAnimalEventDto, UpdateAnimalEventDto, AnimalEventType } from '@/lib/types/animal-event';
import { Animal } from '@/lib/types/animal';
import { animalEventsService } from '@/lib/services/animal-events.service';
import { animalsService } from '@/lib/services/animals.service';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { ChevronLeft, ChevronRight, PawPrint, Loader2, Plus, Search, X } from 'lucide-react';

type DialogMode = 'view' | 'edit' | 'create';

interface AnimalEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: DialogMode;
  event?: AnimalEvent | null;
  onSubmit?: (data: CreateAnimalEventDto | UpdateAnimalEventDto) => Promise<void>;
  isLoading?: boolean;
  // Navigation pour le mode view
  events?: AnimalEvent[];
  onNavigate?: (direction: 'prev' | 'next') => void;
}

const EVENT_TYPES: AnimalEventType[] = [
  'entry', 'exit', 'birth', 'death', 'sale', 'purchase',
  'transfer_in', 'transfer_out', 'temporary_out', 'temporary_return'
];

export function AnimalEventDialog({
  open,
  onOpenChange,
  mode,
  event,
  onSubmit,
  isLoading,
  events = [],
  onNavigate,
}: AnimalEventDialogProps) {
  const t = useTranslations('animalEvents');
  const tc = useCommonTranslations();
  const isEditable = mode === 'edit' || mode === 'create';

  // Navigation
  const currentIndex = event ? events.findIndex((e) => e.id === event.id) : -1;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < events.length - 1 && currentIndex !== -1;

  // État pour les animaux du mouvement
  const [movementAnimals, setMovementAnimals] = useState<Animal[]>([]);
  const [animalsLoading, setAnimalsLoading] = useState(false);

  // État pour l'ajout d'animal
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [searchOfficialId, setSearchOfficialId] = useState('');
  const [searchingAnimal, setSearchingAnimal] = useState(false);
  const [searchResult, setSearchResult] = useState<Animal | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Form data aligned with API schema
  const [formData, setFormData] = useState<CreateAnimalEventDto>({
    animalIds: [],
    movementType: 'entry',
    movementDate: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
  });

  useEffect(() => {
    if (event) {
      const formattedDate = event.movementDate ? event.movementDate.split('T')[0] : '';
      setFormData({
        animalIds: event.animalIds || [],
        movementType: event.movementType,
        movementDate: formattedDate,
        lotId: event.lotId,
        reason: event.reason || '',
        status: event.status,
        notes: event.notes || '',
        buyerName: event.buyerName,
        buyerType: event.buyerType,
        buyerContact: event.buyerContact,
        buyerFarmId: event.buyerFarmId,
        salePrice: event.salePrice,
        sellerName: event.sellerName,
        purchasePrice: event.purchasePrice,
        destinationFarmId: event.destinationFarmId,
        originFarmId: event.originFarmId,
        slaughterhouseName: event.slaughterhouseName,
        slaughterhouseId: event.slaughterhouseId,
        isTemporary: event.isTemporary,
        temporaryType: event.temporaryType,
        expectedReturnDate: event.expectedReturnDate,
        returnDate: event.returnDate,
        returnNotes: event.returnNotes,
        relatedMovementId: event.relatedMovementId,
        documentNumber: event.documentNumber,
      });
    } else {
      setFormData({
        animalIds: [],
        movementType: 'entry',
        movementDate: new Date().toISOString().split('T')[0],
        reason: '',
        notes: '',
      });
      setMovementAnimals([]);
    }
    // Reset search state when dialog opens/closes
    setShowAddAnimal(false);
    setSearchOfficialId('');
    setSearchResult(null);
    setSearchError(null);
  }, [event, open]);

  // Charger les animaux du mouvement
  useEffect(() => {
    const fetchAnimals = async () => {
      if (!event?.id || !open) {
        setMovementAnimals([]);
        return;
      }
      setAnimalsLoading(true);
      try {
        const animals = await animalEventsService.getAnimals(event.id);
        setMovementAnimals(animals);
      } catch (error) {
        console.error('Failed to fetch movement animals:', error);
        setMovementAnimals([]);
      } finally {
        setAnimalsLoading(false);
      }
    };
    fetchAnimals();
  }, [event?.id, open]);

  // Recherche automatique d'animal par ID officiel
  const searchAnimalByOfficialId = useCallback(async (officialId: string) => {
    if (!officialId || officialId.length < 3) {
      setSearchResult(null);
      setSearchError(null);
      return;
    }

    setSearchingAnimal(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      // Rechercher par numéro officiel
      const animals = await animalsService.getAll({ search: officialId, limit: 10 });

      // Trouver l'animal avec le numéro officiel exact ou le plus proche
      const exactMatch = animals.find(a =>
        a.officialNumber?.toLowerCase() === officialId.toLowerCase() ||
        a.visualId?.toLowerCase() === officialId.toLowerCase() ||
        a.currentEid?.toLowerCase() === officialId.toLowerCase()
      );

      if (exactMatch) {
        // Vérifier si l'animal n'est pas déjà dans la liste
        const alreadyInList = movementAnimals.some(a => a.id === exactMatch.id);
        if (alreadyInList) {
          setSearchError(t('messages.animalAlreadyInList'));
        } else {
          setSearchResult(exactMatch);
        }
      } else if (animals.length > 0) {
        // Prendre le premier résultat si pas de correspondance exacte
        const firstResult = animals[0];
        const alreadyInList = movementAnimals.some(a => a.id === firstResult.id);
        if (alreadyInList) {
          setSearchError(t('messages.animalAlreadyInList'));
        } else {
          setSearchResult(firstResult);
        }
      } else {
        setSearchError(t('messages.animalNotFound'));
      }
    } catch (error) {
      console.error('Failed to search animal:', error);
      setSearchError(t('messages.searchError'));
    } finally {
      setSearchingAnimal(false);
    }
  }, [movementAnimals, t]);

  // Debounce la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchOfficialId) {
        searchAnimalByOfficialId(searchOfficialId);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchOfficialId, searchAnimalByOfficialId]);

  // Ajouter l'animal trouvé à la liste
  const handleAddAnimal = () => {
    if (searchResult) {
      const newAnimals = [...movementAnimals, searchResult];
      setMovementAnimals(newAnimals);
      // Update animalIds in formData
      setFormData(prev => ({
        ...prev,
        animalIds: newAnimals.map(a => a.id)
      }));
      setSearchOfficialId('');
      setSearchResult(null);
      setShowAddAnimal(false);
    }
  };

  // Retirer un animal de la liste
  const handleRemoveAnimal = (animalId: string) => {
    const newAnimals = movementAnimals.filter(a => a.id !== animalId);
    setMovementAnimals(newAnimals);
    setFormData(prev => ({
      ...prev,
      animalIds: newAnimals.map(a => a.id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    try {
      // Build the payload with animalIds from movementAnimals
      const payload: CreateAnimalEventDto | UpdateAnimalEventDto = {
        ...formData,
        animalIds: movementAnimals.map(a => a.id),
      };
      await onSubmit(payload);
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getDialogTitle = () => {
    if (mode === 'create') return t('newEvent');
    if (mode === 'edit') return t('editEvent');
    return event?.reason || t(`types.${event?.movementType}`);
  };

  const getDialogDescription = () => {
    if (mode === 'create') return t('messages.addDescription');
    if (mode === 'edit') return t('messages.editDescription');
    return '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">{getDialogTitle()}</DialogTitle>
              {getDialogDescription() && (
                <DialogDescription>{getDialogDescription()}</DialogDescription>
              )}
            </div>
            {mode === 'view' && event && (
              <Badge variant="default" className="text-sm px-3 py-1">
                {t(`types.${event.movementType}`)}
              </Badge>
            )}
          </div>

          {/* Navigation (mode view uniquement) */}
          {mode === 'view' && onNavigate && events.length > 1 && (
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => onNavigate('prev')} disabled={!canGoPrev}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {currentIndex + 1} / {events.length}
              </span>
              <Button variant="outline" size="sm" onClick={() => onNavigate('next')} disabled={!canGoNext}>
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </DialogHeader>

        {isEditable ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Section: Animaux concernés */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <PawPrint className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">{t('sections.animals')}</h3>
                </div>

                {/* Liste des animaux du mouvement */}
                {animalsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : movementAnimals.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{t('fields.animalsInMovement')} ({movementAnimals.length})</p>
                    <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                      {movementAnimals.map((animal) => (
                        <div key={animal.id} className="flex items-center gap-3 p-2 text-sm">
                          <PawPrint className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{animal.officialNumber || animal.visualId || animal.currentEid || animal.id}</span>
                            {animal.species?.name && (
                              <span className="text-muted-foreground ml-2">• {animal.species.name}</span>
                            )}
                            {animal.breed?.name && (
                              <span className="text-muted-foreground"> ({animal.breed.name})</span>
                            )}
                          </div>
                          <Badge variant="secondary" className="flex-shrink-0">
                            {animal.sex === 'male' ? 'M' : 'F'}
                          </Badge>
                          {isEditable && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleRemoveAnimal(animal.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : mode !== 'create' ? (
                  <p className="text-sm text-muted-foreground py-2">{t('messages.noAnimalsInMovement')}</p>
                ) : null}

                {/* Champ de recherche d'animal */}
                {showAddAnimal && (
                  <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t('actions.searchAnimal')}</span>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder={t('placeholders.officialId')}
                        value={searchOfficialId}
                        onChange={(e) => setSearchOfficialId(e.target.value)}
                        autoFocus
                      />
                      {searchingAnimal && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('messages.searching')}
                        </div>
                      )}
                      {searchError && (
                        <p className="text-sm text-destructive">{searchError}</p>
                      )}
                      {searchResult && (
                        <div className="flex items-center gap-3 p-2 border rounded-lg bg-background">
                          <PawPrint className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{searchResult.officialNumber || searchResult.visualId || searchResult.currentEid}</span>
                            {searchResult.species?.name && (
                              <span className="text-muted-foreground ml-2">• {searchResult.species.name}</span>
                            )}
                          </div>
                          <Button type="button" size="sm" onClick={handleAddAnimal}>
                            {t('actions.add')}
                          </Button>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAddAnimal(false);
                        setSearchOfficialId('');
                        setSearchResult(null);
                        setSearchError(null);
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      {tc('actions.cancel')}
                    </Button>
                  </div>
                )}

                {/* Bouton Ajouter un animal */}
                {!showAddAnimal && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowAddAnimal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('actions.addAnimal')}
                  </Button>
                )}
              </div>

              {/* Section: Informations générales */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium border-b pb-2">{t('sections.general')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('fields.movementType')} *</Label>
                    <Select
                      value={formData.movementType}
                      onValueChange={(value) => setFormData({ ...formData, movementType: value as AnimalEventType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('placeholders.selectType')} />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {t(`types.${type}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('fields.movementDate')} *</Label>
                    <Input
                      type="date"
                      value={formData.movementDate}
                      onChange={(e) => setFormData({ ...formData, movementDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('fields.reason')}</Label>
                  <Select
                    value={formData.reason || ''}
                    onValueChange={(value) => setFormData({ ...formData, reason: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('placeholders.selectReason')} />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type} value={t(`types.${type}`)}>
                          {t(`types.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Champs conditionnels selon le type de mouvement */}
                {(formData.movementType === 'sale') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('fields.buyerName')}</Label>
                      <Input
                        value={formData.buyerName || ''}
                        onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                        placeholder={t('placeholders.buyerName')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('fields.salePrice')}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={formData.salePrice?.toString() || ''}
                          onChange={(e) => setFormData({ ...formData, salePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                          step="0.01"
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-muted-foreground">€</span>
                      </div>
                    </div>
                  </div>
                )}

                {(formData.movementType === 'purchase') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('fields.sellerName')}</Label>
                      <Input
                        value={formData.sellerName || ''}
                        onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                        placeholder={t('placeholders.sellerName')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('fields.purchasePrice')}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={formData.purchasePrice?.toString() || ''}
                          onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                          step="0.01"
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-muted-foreground">€</span>
                      </div>
                    </div>
                  </div>
                )}

                {(formData.movementType === 'transfer_in' || formData.movementType === 'transfer_out') && (
                  <div className="space-y-2">
                    <Label>{formData.movementType === 'transfer_in' ? t('fields.originFarmId') : t('fields.destinationFarmId')}</Label>
                    <Input
                      value={(formData.movementType === 'transfer_in' ? formData.originFarmId : formData.destinationFarmId) || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        ...(formData.movementType === 'transfer_in'
                          ? { originFarmId: e.target.value }
                          : { destinationFarmId: e.target.value })
                      })}
                      placeholder={t('placeholders.farmId')}
                    />
                  </div>
                )}

                {(formData.movementType === 'temporary_out') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('fields.temporaryType')}</Label>
                      <Select
                        value={formData.temporaryType || ''}
                        onValueChange={(value) => setFormData({ ...formData, temporaryType: value as 'veterinary' | 'exhibition' | 'breeding' | 'grazing' | 'other', isTemporary: true })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('placeholders.selectTemporaryType')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="veterinary">{t('temporaryTypes.veterinary')}</SelectItem>
                          <SelectItem value="exhibition">{t('temporaryTypes.exhibition')}</SelectItem>
                          <SelectItem value="breeding">{t('temporaryTypes.breeding')}</SelectItem>
                          <SelectItem value="grazing">{t('temporaryTypes.grazing')}</SelectItem>
                          <SelectItem value="other">{t('temporaryTypes.other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('fields.expectedReturnDate')}</Label>
                      <Input
                        type="date"
                        value={formData.expectedReturnDate?.split('T')[0] || ''}
                        onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section: Notes */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium border-b pb-2">{t('sections.additional')}</h3>
                <div className="space-y-2">
                  <Label>{t('fields.documentNumber')}</Label>
                  <Input
                    value={formData.documentNumber || ''}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    placeholder={t('placeholders.documentNumber')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('fields.notes')}</Label>
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t('placeholders.notes')}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                {tc('actions.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? tc('actions.saving') : mode === 'create' ? tc('actions.create') : tc('actions.save')}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* Mode lecture */
          <div className="space-y-6 py-4">
            {/* Section: Animaux concernés */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <PawPrint className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">{t('sections.animals')}</h3>
              </div>

              {/* Liste des animaux du mouvement */}
              {animalsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : movementAnimals.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{t('fields.animalsInMovement')} ({movementAnimals.length})</p>
                  <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                    {movementAnimals.map((animal) => (
                      <div key={animal.id} className="flex items-center gap-3 p-2 text-sm">
                        <PawPrint className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{animal.officialNumber || animal.visualId || animal.currentEid || animal.id}</span>
                          {animal.species?.name && (
                            <span className="text-muted-foreground ml-2">• {animal.species.name}</span>
                          )}
                          {animal.breed?.name && (
                            <span className="text-muted-foreground"> ({animal.breed.name})</span>
                          )}
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0">
                          {animal.sex === 'male' ? 'M' : 'F'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">{t('messages.noAnimalsInMovement')}</p>
              )}
            </div>

            {/* Section: Informations générales */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">{t('sections.general')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.movementType')}</p>
                  <div className="mt-1"><Badge>{t(`types.${event?.movementType}`)}</Badge></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.movementDate')}</p>
                  <p className="text-sm">{event?.movementDate ? formatDate(event.movementDate) : '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.reason')}</p>
                  <p className="text-sm">{event?.reason || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.status')}</p>
                  <p className="text-sm">{event?.status ? t(`statuses.${event.status}`) : '-'}</p>
                </div>
              </div>

              {/* Champs conditionnels en mode lecture */}
              {event?.movementType === 'sale' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('fields.buyerName')}</p>
                    <p className="text-sm">{event?.buyerName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('fields.salePrice')}</p>
                    <p className="text-sm">{event?.salePrice ? `${event.salePrice} €` : '-'}</p>
                  </div>
                </div>
              )}

              {event?.movementType === 'purchase' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('fields.sellerName')}</p>
                    <p className="text-sm">{event?.sellerName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('fields.purchasePrice')}</p>
                    <p className="text-sm">{event?.purchasePrice ? `${event.purchasePrice} €` : '-'}</p>
                  </div>
                </div>
              )}

              {(event?.movementType === 'transfer_in' || event?.movementType === 'transfer_out') && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    {event.movementType === 'transfer_in' ? t('fields.originFarmId') : t('fields.destinationFarmId')}
                  </p>
                  <p className="text-sm">
                    {(event.movementType === 'transfer_in' ? event.originFarmId : event.destinationFarmId) || '-'}
                  </p>
                </div>
              )}

              {event?.isTemporary && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('fields.temporaryType')}</p>
                    <p className="text-sm">{event.temporaryType ? t(`temporaryTypes.${event.temporaryType}`) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('fields.expectedReturnDate')}</p>
                    <p className="text-sm">{event.expectedReturnDate ? formatDate(event.expectedReturnDate) : '-'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section: Notes */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">{t('sections.additional')}</h3>
              <div>
                <p className="text-xs text-muted-foreground">{t('fields.documentNumber')}</p>
                <p className={`text-sm ${!event?.documentNumber ? 'text-muted-foreground' : ''}`}>{event?.documentNumber || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('fields.notes')}</p>
                <p className={`text-sm ${!event?.notes ? 'text-muted-foreground' : ''}`}>{event?.notes || '-'}</p>
              </div>
            </div>

            {/* Métadonnées (lecture seule) */}
            {(event?.createdAt || event?.updatedAt) && (
              <div className="text-xs text-muted-foreground pt-4 border-t space-y-1">
                {event?.createdAt && <p>{tc('fields.createdAt')}: {formatDate(event.createdAt)}</p>}
                {event?.updatedAt && <p>{tc('fields.updatedAt')}: {formatDate(event.updatedAt)}</p>}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
