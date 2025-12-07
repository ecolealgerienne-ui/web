'use client';

import React, { useEffect, useState } from 'react';
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
import { AnimalEvent, CreateAnimalEventDto, UpdateAnimalEventDto } from '@/lib/types/animal-event';
import { Animal } from '@/lib/types/animal';
import { animalEventsService } from '@/lib/services/animal-events.service';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { ChevronLeft, ChevronRight, PawPrint, Loader2, Plus } from 'lucide-react';

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

const EVENT_TYPES = [
  'entry', 'exit', 'birth', 'death', 'sale', 'purchase',
  'transfer_in', 'transfer_out', 'temporary_out', 'temporary_return'
] as const;

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

  const [formData, setFormData] = useState<CreateAnimalEventDto>({
    animalId: '',
    eventType: 'entry',
    eventDate: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    performedBy: '',
    veterinarianId: '',
    cost: undefined,
    relatedAnimalId: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    if (event) {
      const formattedDate = event.eventDate ? event.eventDate.split('T')[0] : '';
      setFormData({
        animalId: event.animalId,
        eventType: event.eventType,
        eventDate: formattedDate,
        title: event.title,
        description: event.description || '',
        performedBy: event.performedBy || '',
        veterinarianId: event.veterinarianId || '',
        cost: event.cost,
        relatedAnimalId: event.relatedAnimalId || '',
        location: event.location || '',
        notes: event.notes || '',
      });
    } else {
      setFormData({
        animalId: '',
        eventType: 'entry',
        eventDate: new Date().toISOString().split('T')[0],
        title: '',
        description: '',
        performedBy: '',
        veterinarianId: '',
        cost: undefined,
        relatedAnimalId: '',
        location: '',
        notes: '',
      });
      setMovementAnimals([]);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getDialogTitle = () => {
    if (mode === 'create') return t('newEvent');
    if (mode === 'edit') return t('editEvent');
    return event?.title || '';
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
                {t(`types.${event.eventType}`)}
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
                        </div>
                      ))}
                    </div>
                  </div>
                ) : mode !== 'create' ? (
                  <p className="text-sm text-muted-foreground py-2">{t('messages.noAnimalsInMovement')}</p>
                ) : null}

                {/* Bouton Ajouter un animal (mode édition uniquement) */}
                {mode === 'edit' && (
                  <Button type="button" variant="outline" size="sm" className="w-full">
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
                    <Label>{t('fields.eventType')} *</Label>
                    <Select
                      value={formData.eventType}
                      onValueChange={(value) => setFormData({ ...formData, eventType: value as CreateAnimalEventDto['eventType'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label>{t('fields.eventDate')} *</Label>
                    <Input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('fields.title')} *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={t('placeholders.title')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('fields.location')}</Label>
                    <Input
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder={t('placeholders.location')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('fields.description')}</Label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('placeholders.description')}
                    rows={3}
                  />
                </div>
              </div>

              {/* Section: Détails */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium border-b pb-2">{t('sections.details')}</h3>
                <div className="space-y-2">
                  <Label>{t('fields.performedBy')}</Label>
                  <Input
                    value={formData.performedBy || ''}
                    onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                    placeholder={t('placeholders.performedBy')}
                  />
                </div>

                {/* Coût avec symbole € */}
                <div className="space-y-2">
                  <Label>{t('fields.cost')}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={formData.cost?.toString() || ''}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value ? parseFloat(e.target.value) : undefined })}
                      step="0.01"
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-muted-foreground">€</span>
                  </div>
                </div>
              </div>

              {/* Section: Notes */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium border-b pb-2">{t('sections.additional')}</h3>
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
                  <p className="text-xs text-muted-foreground">{t('fields.eventType')}</p>
                  <div className="mt-1"><Badge>{t(`types.${event?.eventType}`)}</Badge></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.eventDate')}</p>
                  <p className="text-sm">{event?.eventDate ? formatDate(event.eventDate) : '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.title')}</p>
                  <p className="text-sm">{event?.title || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.location')}</p>
                  <p className={`text-sm ${!event?.location ? 'text-muted-foreground' : ''}`}>{event?.location || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">{t('fields.description')}</p>
                <p className={`text-sm ${!event?.description ? 'text-muted-foreground' : ''}`}>{event?.description || '-'}</p>
              </div>
            </div>

            {/* Section: Détails */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">{t('sections.details')}</h3>
              <div>
                <p className="text-xs text-muted-foreground">{t('fields.performedBy')}</p>
                <p className={`text-sm ${!event?.performedBy ? 'text-muted-foreground' : ''}`}>{event?.performedBy || '-'}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">{t('fields.cost')}</p>
                <p className={`text-sm ${!event?.cost ? 'text-muted-foreground' : ''}`}>
                  {event?.cost ? `${event.cost} €` : '-'}
                </p>
              </div>
            </div>

            {/* Section: Notes */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">{t('sections.additional')}</h3>
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
