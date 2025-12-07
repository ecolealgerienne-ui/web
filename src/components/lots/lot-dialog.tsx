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
import { Lot, LotAnimal, CreateLotDto, UpdateLotDto, LotType, LotStatus } from '@/lib/types/lot';
import { Animal } from '@/lib/types/animal';
import { lotsService } from '@/lib/services/lots.service';
import { animalsService } from '@/lib/services/animals.service';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { ChevronLeft, ChevronRight, PawPrint, Loader2, Plus, Search, X, Package } from 'lucide-react';

type DialogMode = 'view' | 'edit' | 'create';

interface LotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: DialogMode;
  lot?: Lot | null;
  onSubmit?: (data: CreateLotDto | UpdateLotDto) => Promise<void>;
  isLoading?: boolean;
  // Navigation pour le mode view
  lots?: Lot[];
  onNavigate?: (direction: 'prev' | 'next') => void;
}

const LOT_TYPES: LotType[] = [
  'treatment', 'vaccination', 'fattening', 'quarantine', 'weaning', 'gestation', 'lactation', 'birth', 'production', 'sale', 'slaughter', 'purchase', 'breeding', 'reproduction', 'other'
];

const LOT_STATUSES: LotStatus[] = ['open', 'closed', 'archived', 'completed'];

export function LotDialog({
  open,
  onOpenChange,
  mode,
  lot,
  onSubmit,
  isLoading,
  lots = [],
  onNavigate,
}: LotDialogProps) {
  const t = useTranslations('lots');
  const tc = useCommonTranslations();
  const isEditable = mode === 'edit' || mode === 'create';

  // Navigation
  const currentIndex = lot ? lots.findIndex((l) => l.id === lot.id) : -1;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < lots.length - 1 && currentIndex !== -1;

  // Animals state
  const [lotAnimals, setLotAnimals] = useState<LotAnimal[]>([]);
  const [animalsLoading, setAnimalsLoading] = useState(false);

  // Animal search state
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [searchOfficialId, setSearchOfficialId] = useState('');
  const [searchingAnimal, setSearchingAnimal] = useState(false);
  const [searchResult, setSearchResult] = useState<Animal | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<CreateLotDto>({
    name: '',
    type: 'treatment',
    status: 'open',
    description: '',
    notes: '',
    isActive: true,
    animalIds: [],
  });

  useEffect(() => {
    if (lot) {
      setFormData({
        name: lot.name,
        type: lot.type,
        status: lot.status,
        description: lot.description || '',
        notes: lot.notes || '',
        isActive: lot.isActive,
        animalIds: lot.animalIds || [],
        productId: lot.productId || undefined,
        productName: lot.productName || undefined,
        treatmentDate: lot.treatmentDate?.split('T')[0] || '',
        withdrawalEndDate: lot.withdrawalEndDate?.split('T')[0] || '',
        veterinarianId: lot.veterinarianId || undefined,
        veterinarianName: lot.veterinarianName || undefined,
        priceTotal: lot.priceTotal || undefined,
        buyerName: lot.buyerName || undefined,
        sellerName: lot.sellerName || undefined,
      });
    } else {
      setFormData({
        name: '',
        type: 'treatment',
        status: 'open',
        description: '',
        notes: '',
        isActive: true,
        animalIds: [],
      });
      setLotAnimals([]);
    }
    // Reset search state
    setShowAddAnimal(false);
    setSearchOfficialId('');
    setSearchResult(null);
    setSearchError(null);
  }, [lot, open]);

  // Fetch lot animals
  useEffect(() => {
    const fetchAnimals = async () => {
      if (!lot?.id || !open) {
        setLotAnimals([]);
        return;
      }
      setAnimalsLoading(true);
      try {
        const animals = await lotsService.getLotAnimals(lot.id);
        setLotAnimals(animals);
      } catch (error) {
        console.error('Failed to fetch lot animals:', error);
        setLotAnimals([]);
      } finally {
        setAnimalsLoading(false);
      }
    };
    fetchAnimals();
  }, [lot?.id, open]);

  // Animal search
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
      const animals = await animalsService.getAll({ search: officialId, limit: 10 });

      const exactMatch = animals.find(a =>
        a.officialNumber?.toLowerCase() === officialId.toLowerCase() ||
        a.visualId?.toLowerCase() === officialId.toLowerCase() ||
        a.currentEid?.toLowerCase() === officialId.toLowerCase()
      );

      if (exactMatch) {
        const alreadyInList = lotAnimals.some(la => la.animalId === exactMatch.id);
        if (alreadyInList) {
          setSearchError(t('messages.animalAlreadyInList'));
        } else {
          setSearchResult(exactMatch);
        }
      } else if (animals.length > 0) {
        const firstResult = animals[0];
        const alreadyInList = lotAnimals.some(la => la.animalId === firstResult.id);
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
  }, [lotAnimals, t]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchOfficialId) {
        searchAnimalByOfficialId(searchOfficialId);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchOfficialId, searchAnimalByOfficialId]);

  // Add animal to list
  const handleAddAnimal = () => {
    if (searchResult) {
      const newAnimal: LotAnimal = {
        id: `temp-${searchResult.id}`,
        lotId: lot?.id || '',
        animalId: searchResult.id,
        farmId: searchResult.farmId || '',
        joinedAt: new Date().toISOString(),
        animal: {
          id: searchResult.id,
          officialNumber: searchResult.officialNumber || undefined,
          visualId: searchResult.visualId || undefined,
          currentEid: searchResult.currentEid || undefined,
          sex: searchResult.sex,
          status: searchResult.status,
          birthDate: searchResult.birthDate,
          speciesId: searchResult.speciesId || undefined,
          species: searchResult.species,
          breed: searchResult.breed,
        },
      };
      setLotAnimals([...lotAnimals, newAnimal]);
      setFormData(prev => ({
        ...prev,
        animalIds: [...(prev.animalIds || []), searchResult.id]
      }));
      setSearchOfficialId('');
      setSearchResult(null);
      setShowAddAnimal(false);
    }
  };

  // Remove animal from list
  const handleRemoveAnimal = (animalId: string) => {
    setLotAnimals(lotAnimals.filter(la => la.animalId !== animalId));
    setFormData(prev => ({
      ...prev,
      animalIds: (prev.animalIds || []).filter(id => id !== animalId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    try {
      const payload: CreateLotDto | UpdateLotDto = {
        ...formData,
        animalIds: lotAnimals.map(la => la.animalId),
      };
      await onSubmit(payload);
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getDialogTitle = () => {
    if (mode === 'create') return t('newLot');
    if (mode === 'edit') return t('editLot');
    return lot?.name || '';
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

  const showTreatmentFields = formData.type === 'treatment' || formData.type === 'vaccination';
  const showSaleFields = formData.type === 'sale' || formData.type === 'slaughter';
  const showPurchaseFields = formData.type === 'purchase';

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
            {mode === 'view' && lot && (
              <Badge variant="default" className="text-sm px-3 py-1">
                {t(`type.${lot.type}`)}
              </Badge>
            )}
          </div>

          {/* Navigation (view mode only) */}
          {mode === 'view' && onNavigate && lots.length > 1 && (
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => onNavigate('prev')} disabled={!canGoPrev}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {tc('navigation.previous')}
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {currentIndex + 1} / {lots.length}
              </span>
              <Button variant="outline" size="sm" onClick={() => onNavigate('next')} disabled={!canGoNext}>
                {tc('navigation.next')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </DialogHeader>

        {isEditable ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Section: General Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">{t('sections.general')}</h3>
                </div>

                <div className="space-y-2">
                  <Label>{t('fields.name')} *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('placeholders.name')}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('fields.type')} *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as LotType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('placeholders.selectType')} />
                      </SelectTrigger>
                      <SelectContent>
                        {LOT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {t(`type.${type}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('fields.status')} *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as LotStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('placeholders.selectStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                        {LOT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {t(`status.${status}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('fields.description')}</Label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('placeholders.description')}
                    rows={2}
                  />
                </div>
              </div>

              {/* Section: Treatment/Vaccination Fields */}
              {showTreatmentFields && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium border-b pb-2">{t('sections.treatment')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('fields.productName')}</Label>
                      <Input
                        value={formData.productName || ''}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        placeholder={t('placeholders.productName')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('fields.veterinarianName')}</Label>
                      <Input
                        value={formData.veterinarianName || ''}
                        onChange={(e) => setFormData({ ...formData, veterinarianName: e.target.value })}
                        placeholder={t('placeholders.veterinarianName')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('fields.treatmentDate')}</Label>
                      <Input
                        type="date"
                        value={formData.treatmentDate || ''}
                        onChange={(e) => setFormData({ ...formData, treatmentDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('fields.withdrawalEndDate')}</Label>
                      <Input
                        type="date"
                        value={formData.withdrawalEndDate || ''}
                        onChange={(e) => setFormData({ ...formData, withdrawalEndDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Sale Fields */}
              {showSaleFields && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium border-b pb-2">{t('sections.sale')}</h3>
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
                      <Label>{t('fields.priceTotal')}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={formData.priceTotal?.toString() || ''}
                          onChange={(e) => setFormData({ ...formData, priceTotal: e.target.value ? parseFloat(e.target.value) : undefined })}
                          step="0.01"
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-muted-foreground">DA</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Purchase Fields */}
              {showPurchaseFields && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium border-b pb-2">{t('sections.purchase')}</h3>
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
                      <Label>{t('fields.priceTotal')}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={formData.priceTotal?.toString() || ''}
                          onChange={(e) => setFormData({ ...formData, priceTotal: e.target.value ? parseFloat(e.target.value) : undefined })}
                          step="0.01"
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-muted-foreground">DA</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Animals */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <PawPrint className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">{t('sections.animals')}</h3>
                </div>

                {animalsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : lotAnimals.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{t('fields.animalsInLot')} ({lotAnimals.length})</p>
                    <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                      {lotAnimals.map((la) => (
                        <div key={la.animalId} className="flex items-center gap-3 p-2 text-sm">
                          <PawPrint className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">
                              {la.animal?.officialNumber || la.animal?.visualId || la.animal?.currentEid || la.animalId}
                            </span>
                            {la.animal?.species?.name && (
                              <span className="text-muted-foreground ml-2">• {la.animal.species.name}</span>
                            )}
                          </div>
                          <Badge variant="secondary" className="flex-shrink-0">
                            {la.animal?.sex === 'male' ? 'M' : la.animal?.sex === 'female' ? 'F' : '-'}
                          </Badge>
                          {isEditable && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleRemoveAnimal(la.animalId)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">{t('messages.noAnimalsInLot')}</p>
                )}

                {/* Animal search */}
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
                            <span className="font-medium">
                              {searchResult.officialNumber || searchResult.visualId || searchResult.currentEid}
                            </span>
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

                {/* Add animal button */}
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

              {/* Section: Notes */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium border-b pb-2">{t('sections.notes')}</h3>
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
          /* View mode */
          <div className="space-y-6 py-4">
            {/* Section: General Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">{t('sections.general')}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.type')}</p>
                  <div className="mt-1"><Badge>{t(`type.${lot?.type}`)}</Badge></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.status')}</p>
                  <div className="mt-1"><Badge variant="secondary">{t(`status.${lot?.status}`)}</Badge></div>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">{t('fields.description')}</p>
                <p className={`text-sm ${!lot?.description ? 'text-muted-foreground' : ''}`}>
                  {lot?.description || '-'}
                </p>
              </div>
            </div>

            {/* Treatment/Vaccination view */}
            {(lot?.type === 'treatment' || lot?.type === 'vaccination') && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium border-b pb-2">{t('sections.treatment')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('fields.productName')}</p>
                    <p className="text-sm">{lot?.productName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('fields.veterinarianName')}</p>
                    <p className="text-sm">{lot?.veterinarianName || '-'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('fields.treatmentDate')}</p>
                    <p className="text-sm">{lot?.treatmentDate ? formatDate(lot.treatmentDate) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('fields.withdrawalEndDate')}</p>
                    <p className="text-sm">{lot?.withdrawalEndDate ? formatDate(lot.withdrawalEndDate) : '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sale view */}
            {(lot?.type === 'sale' || lot?.type === 'slaughter') && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium border-b pb-2">{t('sections.sale')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('fields.buyerName')}</p>
                    <p className="text-sm">{lot?.buyerName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('fields.priceTotal')}</p>
                    <p className="text-sm">{lot?.priceTotal ? `${lot.priceTotal} DA` : '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Purchase view */}
            {lot?.type === 'purchase' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium border-b pb-2">{t('sections.purchase')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('fields.sellerName')}</p>
                    <p className="text-sm">{lot?.sellerName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('fields.priceTotal')}</p>
                    <p className="text-sm">{lot?.priceTotal ? `${lot.priceTotal} DA` : '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Section: Animals */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <PawPrint className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">{t('sections.animals')}</h3>
              </div>

              {animalsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : lotAnimals.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{t('fields.animalsInLot')} ({lotAnimals.length})</p>
                  <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                    {lotAnimals.map((la) => (
                      <div key={la.animalId} className="flex items-center gap-3 p-2 text-sm">
                        <PawPrint className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">
                            {la.animal?.officialNumber || la.animal?.visualId || la.animal?.currentEid || la.animalId}
                          </span>
                          {la.animal?.species?.name && (
                            <span className="text-muted-foreground ml-2">• {la.animal.species.name}</span>
                          )}
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0">
                          {la.animal?.sex === 'male' ? 'M' : la.animal?.sex === 'female' ? 'F' : '-'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">{t('messages.noAnimalsInLot')}</p>
              )}
            </div>

            {/* Section: Notes */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">{t('sections.notes')}</h3>
              <div>
                <p className="text-xs text-muted-foreground">{t('fields.notes')}</p>
                <p className={`text-sm ${!lot?.notes ? 'text-muted-foreground' : ''}`}>
                  {lot?.notes || '-'}
                </p>
              </div>
            </div>

            {/* Metadata */}
            {(lot?.createdAt || lot?.updatedAt) && (
              <div className="text-xs text-muted-foreground pt-4 border-t space-y-1">
                {lot?.createdAt && <p>{tc('fields.createdAt')}: {formatDate(lot.createdAt)}</p>}
                {lot?.updatedAt && <p>{tc('fields.updatedAt')}: {formatDate(lot.updatedAt)}</p>}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
