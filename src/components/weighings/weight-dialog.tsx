'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { animalsService } from '@/lib/services/animals.service';
import type { Weighing, CreateWeighingDto, UpdateWeighingDto, WeighingPurpose, WeightUnit } from '@/lib/types/weighing';

interface WeightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'view' | 'edit' | 'create';
  weighing?: Weighing | null;
  onSubmit: (data: CreateWeighingDto | UpdateWeighingDto) => Promise<void>;
  isLoading?: boolean;
  // Navigation
  weighings?: Weighing[];
  onNavigate?: (direction: 'prev' | 'next') => void;
}

const PURPOSES: WeighingPurpose[] = ['routine', 'medical', 'sale', 'growth_monitoring', 'other'];
const UNITS: WeightUnit[] = ['kg', 'lbs'];

export function WeightDialog({
  open,
  onOpenChange,
  mode,
  weighing,
  onSubmit,
  isLoading = false,
  weighings = [],
  onNavigate,
}: WeightDialogProps) {
  const t = useTranslations('weighings');
  const tc = useCommonTranslations();

  // Form state
  const [formData, setFormData] = useState<Partial<CreateWeighingDto>>({
    animalId: '',
    weight: 0,
    unit: 'kg',
    weighingDate: new Date().toISOString().split('T')[0],
    purpose: 'routine',
  });

  // Animal search state
  const [animalSearch, setAnimalSearch] = useState('');
  const [animalSearchResults, setAnimalSearchResults] = useState<Array<{ id: string; officialNumber?: string; visualId?: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<{ id: string; officialNumber?: string; visualId?: string } | null>(null);

  // Navigation state
  const currentIndex = weighing ? weighings.findIndex((w) => w.id === weighing.id) : -1;
  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext = currentIndex < weighings.length - 1;

  // Reset form when weighing changes
  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        animalId: '',
        weight: 0,
        unit: 'kg',
        weighingDate: new Date().toISOString().split('T')[0],
        purpose: 'routine',
        method: '',
        notes: '',
      });
      setSelectedAnimal(null);
      setAnimalSearch('');
    } else if (weighing) {
      setFormData({
        animalId: weighing.animalId,
        weight: weighing.weight,
        unit: weighing.unit,
        weighingDate: weighing.weighingDate,
        purpose: weighing.purpose,
        method: weighing.method || '',
        location: weighing.location || '',
        notes: weighing.notes || '',
        conditions: weighing.conditions || '',
      });
      // Set animal display info if available
      if ((weighing as any).animal) {
        setSelectedAnimal((weighing as any).animal);
        setAnimalSearch((weighing as any).animal.officialNumber || (weighing as any).animal.visualId || '');
      }
    }
  }, [weighing, mode]);

  // Animal search with debounce
  const searchAnimals = useCallback(async (query: string) => {
    if (query.length < 2) {
      setAnimalSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await animalsService.getAll({ search: query, limit: 5 });
      setAnimalSearchResults(results.map((a) => ({
        id: a.id,
        officialNumber: a.officialNumber || undefined,
        visualId: a.visualId || undefined,
      })));
    } catch (error) {
      console.error('Error searching animals:', error);
      setAnimalSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (animalSearch && mode !== 'view') {
        searchAnimals(animalSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [animalSearch, searchAnimals, mode]);

  const handleAnimalSelect = (animal: { id: string; officialNumber?: string; visualId?: string }) => {
    setSelectedAnimal(animal);
    setFormData((prev) => ({ ...prev, animalId: animal.id }));
    setAnimalSearch(animal.officialNumber || animal.visualId || animal.id);
    setAnimalSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!formData.animalId || !formData.weight || !formData.weighingDate) {
      return;
    }

    // Clean empty strings
    const cleanData = Object.fromEntries(
      Object.entries(formData).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    ) as CreateWeighingDto | UpdateWeighingDto;

    await onSubmit(cleanData);
  };

  const getDialogTitle = () => {
    switch (mode) {
      case 'view':
        return t('viewWeighing') || 'Détails de la pesée';
      case 'edit':
        return t('editWeighing') || 'Modifier la pesée';
      case 'create':
        return t('newWeighing');
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isViewMode = mode === 'view';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">{getDialogTitle()}</DialogTitle>
              {mode === 'create' && (
                <DialogDescription>{t('messages.addDescription')}</DialogDescription>
              )}
            </div>
            {isViewMode && weighing && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {weighing.weight} {weighing.unit}
              </Badge>
            )}
          </div>

          {/* Navigation */}
          {isViewMode && weighings.length > 1 && (
            <div className="flex items-center justify-between pt-2 border-t mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate?.('prev')}
                disabled={!canNavigatePrev}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {tc('navigation.previous')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {weighings.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate?.('next')}
                disabled={!canNavigateNext}
              >
                {tc('navigation.next')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section: Animal */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('labels.animal')}</h3>
            <div className="space-y-2">
              <Label>{t('fields.animalId')} *</Label>
              {isViewMode ? (
                <p className="text-sm font-mono">
                  {selectedAnimal?.officialNumber || selectedAnimal?.visualId || weighing?.animalId || '-'}
                </p>
              ) : (
                <div className="relative">
                  <Input
                    value={animalSearch}
                    onChange={(e) => {
                      setAnimalSearch(e.target.value);
                      if (!e.target.value) {
                        setSelectedAnimal(null);
                        setFormData((prev) => ({ ...prev, animalId: '' }));
                      }
                    }}
                    placeholder={t('placeholders.animalId') || 'Numéro officiel de l\'animal'}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                  {animalSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                      {animalSearchResults.map((animal) => (
                        <button
                          key={animal.id}
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-accent text-sm"
                          onClick={() => handleAnimalSelect(animal)}
                        >
                          {animal.officialNumber || animal.visualId || animal.id}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section: Weight Data */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.data')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('fields.weight')} *</Label>
                {isViewMode ? (
                  <p className="text-sm">{weighing?.weight} {weighing?.unit}</p>
                ) : (
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                    placeholder={t('placeholders.weight')}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>{t('fields.unit')}</Label>
                {isViewMode ? (
                  <p className="text-sm">{weighing?.unit}</p>
                ) : (
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, unit: value as WeightUnit }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {t(`units.${unit}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('fields.weighingDate')} *</Label>
                {isViewMode ? (
                  <p className="text-sm">{weighing?.weighingDate ? formatDate(weighing.weighingDate) : '-'}</p>
                ) : (
                  <Input
                    type="date"
                    value={formData.weighingDate || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, weighingDate: e.target.value }))}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>{t('fields.purpose')}</Label>
                {isViewMode ? (
                  <p className="text-sm">{weighing?.purpose ? t(`purpose.${weighing.purpose}`) : '-'}</p>
                ) : (
                  <Select
                    value={formData.purpose}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, purpose: value as WeighingPurpose }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PURPOSES.map((purpose) => (
                        <SelectItem key={purpose} value={purpose}>
                          {t(`purpose.${purpose}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Growth info (view mode only) */}
            {isViewMode && (weighing?.weightGain || weighing?.growthRate) && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-green-50 dark:bg-green-950 rounded-md">
                {weighing.weightGain && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('labels.gain')}</p>
                    <p className="text-sm font-medium text-green-600">+{weighing.weightGain} kg</p>
                  </div>
                )}
                {weighing.growthRate && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('labels.rate')}</p>
                    <p className="text-sm font-medium text-green-600">{weighing.growthRate} {t('labels.perDay')}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Additional */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.additional')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('fields.method')}</Label>
                {isViewMode ? (
                  <p className="text-sm">{weighing?.method || '-'}</p>
                ) : (
                  <Input
                    value={formData.method || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, method: e.target.value }))}
                    placeholder={t('placeholders.method')}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>{t('fields.conditions')}</Label>
                {isViewMode ? (
                  <p className="text-sm">{weighing?.conditions || '-'}</p>
                ) : (
                  <Input
                    value={formData.conditions || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, conditions: e.target.value }))}
                    placeholder={t('placeholders.conditions')}
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('fields.notes')}</Label>
              {isViewMode ? (
                <p className="text-sm">{weighing?.notes || '-'}</p>
              ) : (
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('placeholders.notes')}
                  rows={3}
                />
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          {isViewMode ? (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {tc('actions.close')}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {tc('actions.cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? tc('actions.create') : tc('actions.save')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
