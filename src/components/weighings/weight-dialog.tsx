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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { animalsService } from '@/lib/services/animals.service';
import { weighingsService } from '@/lib/services/weighings.service';
import type { Weighing, WeightHistory, CreateWeightDto, UpdateWeightDto, WeightSource } from '@/lib/types/weighing';

interface WeightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'view' | 'edit' | 'create';
  weighing?: Weighing | null;
  onSubmit: (data: CreateWeightDto | UpdateWeightDto) => Promise<void>;
  isLoading?: boolean;
  // Navigation
  weighings?: Weighing[];
  onNavigate?: (direction: 'prev' | 'next') => void;
}

const SOURCES: WeightSource[] = ['manual', 'scale', 'estimated', 'automatic', 'weighbridge'];

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
  const [formData, setFormData] = useState<Partial<CreateWeightDto>>({
    animalId: '',
    weight: 0,
    weightDate: new Date().toISOString().split('T')[0],
    source: 'manual',
  });

  // Animal search state
  const [animalSearch, setAnimalSearch] = useState('');
  const [animalSearchResults, setAnimalSearchResults] = useState<Array<{ id: string; officialNumber?: string; visualId?: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<{ id: string; officialNumber?: string; visualId?: string } | null>(null);

  // Weight history state
  const [weightHistory, setWeightHistory] = useState<WeightHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

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
        weightDate: new Date().toISOString().split('T')[0],
        source: 'manual',
        notes: '',
      });
      setSelectedAnimal(null);
      setAnimalSearch('');
      setWeightHistory([]);
    } else if (weighing) {
      setFormData({
        animalId: weighing.animalId,
        weight: weighing.weight,
        weightDate: weighing.weightDate,
        source: weighing.source || 'manual',
        notes: weighing.notes || '',
      });
      // Set animal display info if available
      if (weighing.animal) {
        setSelectedAnimal(weighing.animal);
        setAnimalSearch(weighing.animal.officialNumber || weighing.animal.visualId || '');
      }
    }
  }, [weighing, mode]);

  // Fetch weight history when viewing/editing an existing weighing
  useEffect(() => {
    const fetchHistory = async () => {
      if (!open || mode === 'create' || !weighing?.animalId) {
        setWeightHistory([]);
        return;
      }

      setIsLoadingHistory(true);
      try {
        const history = await weighingsService.getAnimalHistory(weighing.animalId);
        setWeightHistory(history);
      } catch (error) {
        console.error('Error fetching weight history:', error);
        setWeightHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [open, mode, weighing?.animalId]);

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
    if (!formData.animalId || !formData.weight || !formData.weightDate) {
      return;
    }

    // Clean empty strings
    const cleanData = Object.fromEntries(
      Object.entries(formData).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    ) as CreateWeightDto | UpdateWeightDto;

    await onSubmit(cleanData);
  };

  const getDialogTitle = () => {
    switch (mode) {
      case 'view':
        return t('viewWeighing');
      case 'edit':
        return t('editWeighing');
      case 'create':
        return t('newWeighing');
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isViewMode = mode === 'view';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                {weighing.weight} kg
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
                    placeholder={t('placeholders.animalId')}
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
                <Label>{t('fields.weight')} * (kg)</Label>
                {isViewMode ? (
                  <p className="text-sm">{weighing?.weight} kg</p>
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
                <Label>{t('fields.source')}</Label>
                {isViewMode ? (
                  <p className="text-sm">{weighing?.source ? t(`source.${weighing.source}`) : '-'}</p>
                ) : (
                  <Select
                    value={formData.source}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, source: value as WeightSource }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCES.map((source) => (
                        <SelectItem key={source} value={source}>
                          {t(`source.${source}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('fields.weightDate')} *</Label>
              {isViewMode ? (
                <p className="text-sm">{weighing?.weightDate ? formatDate(weighing.weightDate) : '-'}</p>
              ) : (
                <Input
                  type="date"
                  value={formData.weightDate || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, weightDate: e.target.value }))}
                />
              )}
            </div>

            {/* Growth info (view mode only) */}
            {isViewMode && (weighing?.weightGain || weighing?.dailyGain) && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-green-50 dark:bg-green-950 rounded-md">
                {weighing.weightGain && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('labels.gain')}</p>
                    <p className="text-sm font-medium text-green-600">+{weighing.weightGain} kg</p>
                  </div>
                )}
                {weighing.dailyGain && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('labels.rate')}</p>
                    <p className="text-sm font-medium text-green-600">{weighing.dailyGain.toFixed(2)} kg/j</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">{t('sections.notes')}</h3>
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

          {/* Section: Weight History (view/edit mode only) */}
          {mode !== 'create' && weighing?.animalId && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">{t('sections.history')}</h3>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : weightHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('messages.noHistory')}
                </p>
              ) : (
                <div className="border rounded-md max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('fields.weightDate')}</TableHead>
                        <TableHead className="text-right">{t('fields.weight')}</TableHead>
                        <TableHead className="text-right">{t('labels.rate')}</TableHead>
                        <TableHead>{t('fields.source')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weightHistory.map((record) => {
                        const isCurrentRecord = record.id === weighing?.id;
                        return (
                          <TableRow
                            key={record.id}
                            className={isCurrentRecord ? 'bg-primary/10' : ''}
                          >
                            <TableCell className="font-medium">
                              {formatDate(record.weightDate)}
                              {isCurrentRecord && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {t('labels.current')}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {record.weight} kg
                            </TableCell>
                            <TableCell className="text-right">
                              {record.dailyGain ? (
                                <span className={`flex items-center justify-end gap-1 ${record.dailyGain > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {record.dailyGain > 0 ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3" />
                                  )}
                                  {record.dailyGain.toFixed(2)} kg/j
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {t(`source.${record.source || 'undefined'}`)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
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
