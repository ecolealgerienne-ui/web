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
import { Treatment, CreateTreatmentDto, UpdateTreatmentDto, TreatmentType, TreatmentStatus } from '@/lib/types/treatment';
import { Animal } from '@/lib/types/animal';
import { animalsService } from '@/lib/services/animals.service';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { ChevronLeft, ChevronRight, Loader2, Search, Syringe, Stethoscope } from 'lucide-react';

type DialogMode = 'view' | 'edit' | 'create';

interface TreatmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: DialogMode;
  treatment?: Treatment | null;
  onSubmit?: (data: CreateTreatmentDto | UpdateTreatmentDto) => Promise<void>;
  isLoading?: boolean;
  // Navigation pour le mode view
  treatments?: Treatment[];
  onNavigate?: (direction: 'prev' | 'next') => void;
}

const TREATMENT_TYPES: TreatmentType[] = ['treatment', 'vaccination'];
const TREATMENT_STATUSES: TreatmentStatus[] = ['scheduled', 'in_progress', 'completed', 'cancelled'];

export function TreatmentDialog({
  open,
  onOpenChange,
  mode,
  treatment,
  onSubmit,
  isLoading,
  treatments = [],
  onNavigate,
}: TreatmentDialogProps) {
  const t = useTranslations('treatments');
  const tc = useCommonTranslations();
  const isEditable = mode === 'edit' || mode === 'create';

  // Navigation
  const currentIndex = treatment ? treatments.findIndex((tr) => tr.id === treatment.id) : -1;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < treatments.length - 1 && currentIndex !== -1;

  // Animal search state
  const [searchAnimalId, setSearchAnimalId] = useState('');
  const [searchingAnimal, setSearchingAnimal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<CreateTreatmentDto>({
    type: 'treatment',
    animalId: '',
    treatmentDate: new Date().toISOString().split('T')[0],
    status: 'scheduled',
  });

  useEffect(() => {
    if (treatment) {
      setFormData({
        type: treatment.type,
        animalId: treatment.animalId,
        treatmentDate: treatment.treatmentDate?.split('T')[0] || '',
        status: treatment.status,
        productName: treatment.productName || undefined,
        dose: treatment.dose || undefined,
        dosageUnit: treatment.dosageUnit || undefined,
        withdrawalEndDate: treatment.withdrawalEndDate?.split('T')[0] || undefined,
        veterinarianId: treatment.veterinarianId || undefined,
        veterinarianName: treatment.veterinarianName || undefined,
        diagnosis: treatment.diagnosis || undefined,
        duration: treatment.duration || undefined,
        cost: treatment.cost || undefined,
        notes: treatment.notes || undefined,
      });
      // Set selected animal from treatment
      if (treatment.animal) {
        setSelectedAnimal({
          id: treatment.animal.id,
          visualId: treatment.animal.visualId,
          currentEid: treatment.animal.currentEid,
          officialNumber: treatment.animal.officialNumber,
        } as Animal);
      }
    } else {
      setFormData({
        type: 'treatment',
        animalId: '',
        treatmentDate: new Date().toISOString().split('T')[0],
        status: 'scheduled',
      });
      setSelectedAnimal(null);
    }
    setSearchAnimalId('');
    setSearchError(null);
  }, [treatment, open]);

  // Animal search
  const searchAnimalByOfficialId = useCallback(async (officialId: string) => {
    if (!officialId || officialId.length < 3) {
      setSelectedAnimal(null);
      setSearchError(null);
      return;
    }

    setSearchingAnimal(true);
    setSearchError(null);

    try {
      const animals = await animalsService.getAll({ search: officialId, limit: 10 });

      const exactMatch = animals.find(a =>
        a.officialNumber?.toLowerCase() === officialId.toLowerCase() ||
        a.visualId?.toLowerCase() === officialId.toLowerCase() ||
        a.currentEid?.toLowerCase() === officialId.toLowerCase()
      );

      if (exactMatch) {
        setSelectedAnimal(exactMatch);
        setFormData(prev => ({ ...prev, animalId: exactMatch.id }));
      } else if (animals.length > 0) {
        setSelectedAnimal(animals[0]);
        setFormData(prev => ({ ...prev, animalId: animals[0].id }));
      } else {
        setSearchError(t('messages.animalNotFound'));
      }
    } catch (error) {
      console.error('Failed to search animal:', error);
      setSearchError(t('messages.searchError'));
    } finally {
      setSearchingAnimal(false);
    }
  }, [t]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchAnimalId) {
        searchAnimalByOfficialId(searchAnimalId);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchAnimalId, searchAnimalByOfficialId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    try {
      const cleanPayload: CreateTreatmentDto | UpdateTreatmentDto = {
        type: formData.type,
        animalId: formData.animalId,
        treatmentDate: formData.treatmentDate,
        status: formData.status,
      };

      // Only add optional fields if they have values
      if (formData.productName) cleanPayload.productName = formData.productName;
      if (formData.dose) cleanPayload.dose = formData.dose;
      if (formData.dosageUnit) cleanPayload.dosageUnit = formData.dosageUnit;
      if (formData.withdrawalEndDate) cleanPayload.withdrawalEndDate = formData.withdrawalEndDate;
      if (formData.veterinarianId) cleanPayload.veterinarianId = formData.veterinarianId;
      if (formData.veterinarianName) cleanPayload.veterinarianName = formData.veterinarianName;
      if (formData.diagnosis) cleanPayload.diagnosis = formData.diagnosis;
      if (formData.duration) cleanPayload.duration = formData.duration;
      if (formData.cost !== undefined) cleanPayload.cost = formData.cost;
      if (formData.notes) cleanPayload.notes = formData.notes;

      await onSubmit(cleanPayload);
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getDialogTitle = () => {
    if (mode === 'create') return t('newTreatment');
    if (mode === 'edit') return t('editTreatment');
    return treatment?.productName || t('title');
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

  const getStatusVariant = (status: TreatmentStatus): 'default' | 'secondary' | 'destructive' | 'warning' | 'success' => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'scheduled': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
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
            {mode === 'view' && treatment && (
              <Badge variant={getStatusVariant(treatment.status)} className="text-sm px-3 py-1">
                {t(`status.${treatment.status}`)}
              </Badge>
            )}
          </div>

          {/* Navigation (view mode only) */}
          {mode === 'view' && onNavigate && treatments.length > 1 && (
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => onNavigate('prev')} disabled={!canGoPrev}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {tc('navigation.previous')}
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {currentIndex + 1} / {treatments.length}
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
              {/* Section: Animal */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">{t('sections.animal')}</h3>
                </div>

                {selectedAnimal ? (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div>
                      <span className="font-medium font-mono">
                        {selectedAnimal.officialNumber || selectedAnimal.visualId || selectedAnimal.id}
                      </span>
                      {selectedAnimal.visualId && selectedAnimal.officialNumber && (
                        <span className="text-muted-foreground ml-2">({selectedAnimal.visualId})</span>
                      )}
                    </div>
                    {mode === 'create' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAnimal(null);
                          setFormData(prev => ({ ...prev, animalId: '' }));
                          setSearchAnimalId('');
                        }}
                      >
                        {tc('actions.edit')}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>{t('fields.animal')} *</Label>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t('placeholders.searchAnimal')}
                        value={searchAnimalId}
                        onChange={(e) => setSearchAnimalId(e.target.value)}
                      />
                    </div>
                    {searchingAnimal && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('messages.searching')}
                      </div>
                    )}
                    {searchError && (
                      <p className="text-sm text-destructive">{searchError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Section: General Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Syringe className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">{t('sections.general')}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('fields.type')} *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as TreatmentType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('placeholders.selectType')} />
                      </SelectTrigger>
                      <SelectContent>
                        {TREATMENT_TYPES.map((type) => (
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
                      onValueChange={(value) => setFormData({ ...formData, status: value as TreatmentStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('placeholders.selectStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                        {TREATMENT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {t(`status.${status}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('fields.treatmentDate')} *</Label>
                    <Input
                      type="date"
                      value={formData.treatmentDate}
                      onChange={(e) => setFormData({ ...formData, treatmentDate: e.target.value })}
                      required
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

                <div className="space-y-2">
                  <Label>{t('fields.productName')}</Label>
                  <Input
                    value={formData.productName || ''}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder={t('placeholders.productName')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('fields.dose')}</Label>
                    <Input
                      type="number"
                      value={formData.dose || ''}
                      onChange={(e) => setFormData({ ...formData, dose: e.target.value ? parseFloat(e.target.value) : undefined })}
                      step="0.1"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('fields.dosageUnit')}</Label>
                    <Input
                      value={formData.dosageUnit || ''}
                      onChange={(e) => setFormData({ ...formData, dosageUnit: e.target.value })}
                      placeholder="ml, mg, g..."
                    />
                  </div>
                </div>
              </div>

              {/* Section: Veterinarian */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium border-b pb-2">{t('sections.veterinarian')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('fields.veterinarianName')}</Label>
                    <Input
                      value={formData.veterinarianName || ''}
                      onChange={(e) => setFormData({ ...formData, veterinarianName: e.target.value })}
                      placeholder={t('placeholders.veterinarianName')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('fields.duration')}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="0"
                      />
                      <span className="text-sm text-muted-foreground">{t('labels.days')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('fields.diagnosis')}</Label>
                  <Textarea
                    value={formData.diagnosis || ''}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder={t('placeholders.diagnosis')}
                    rows={2}
                  />
                </div>
              </div>

              {/* Section: Cost & Notes */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium border-b pb-2">{t('sections.notes')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('fields.cost')}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={formData.cost || ''}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value ? parseFloat(e.target.value) : undefined })}
                        step="0.01"
                        placeholder="0"
                      />
                      <span className="text-sm font-medium text-muted-foreground">DA</span>
                    </div>
                  </div>
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
              <Button type="submit" disabled={isLoading || !formData.animalId}>
                {isLoading ? tc('actions.saving') : mode === 'create' ? tc('actions.create') : tc('actions.save')}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* View mode */
          <div className="space-y-6 py-4">
            {/* Animal Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">{t('sections.animal')}</h3>
              </div>
              <div className="p-3 border rounded-lg bg-muted/50">
                <span className="font-medium font-mono">
                  {treatment?.animal?.officialNumber || treatment?.animal?.visualId || treatment?.animalId}
                </span>
                {treatment?.animal?.visualId && treatment?.animal?.officialNumber && (
                  <span className="text-muted-foreground ml-2">({treatment.animal.visualId})</span>
                )}
              </div>
            </div>

            {/* General Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Syringe className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">{t('sections.general')}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.type')}</p>
                  <div className="mt-1"><Badge>{t(`type.${treatment?.type}`)}</Badge></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.status')}</p>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(treatment?.status || 'scheduled')}>
                      {t(`status.${treatment?.status}`)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.treatmentDate')}</p>
                  <p className="text-sm">{treatment?.treatmentDate ? formatDate(treatment.treatmentDate) : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.withdrawalEndDate')}</p>
                  <p className="text-sm">{treatment?.withdrawalEndDate ? formatDate(treatment.withdrawalEndDate) : '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">{t('fields.productName')}</p>
                <p className="text-sm">{treatment?.productName || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.dose')}</p>
                  <p className="text-sm">{treatment?.dose ? `${treatment.dose} ${treatment.dosageUnit || ''}` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.duration')}</p>
                  <p className="text-sm">{treatment?.duration ? `${treatment.duration} ${t('labels.days')}` : '-'}</p>
                </div>
              </div>
            </div>

            {/* Veterinarian */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">{t('sections.veterinarian')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.veterinarianName')}</p>
                  <p className="text-sm">
                    {treatment?.veterinarian
                      ? `${treatment.veterinarian.firstName} ${treatment.veterinarian.lastName}`
                      : treatment?.veterinarianName || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.cost')}</p>
                  <p className="text-sm">{treatment?.cost ? `${treatment.cost} DA` : '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('fields.diagnosis')}</p>
                <p className={`text-sm ${!treatment?.diagnosis ? 'text-muted-foreground' : ''}`}>
                  {treatment?.diagnosis || '-'}
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">{t('sections.notes')}</h3>
              <div>
                <p className="text-xs text-muted-foreground">{t('fields.notes')}</p>
                <p className={`text-sm ${!treatment?.notes ? 'text-muted-foreground' : ''}`}>
                  {treatment?.notes || '-'}
                </p>
              </div>
            </div>

            {/* Metadata */}
            {(treatment?.createdAt || treatment?.updatedAt) && (
              <div className="text-xs text-muted-foreground pt-4 border-t space-y-1">
                {treatment?.createdAt && <p>{tc('fields.createdAt')}: {formatDate(treatment.createdAt)}</p>}
                {treatment?.updatedAt && <p>{tc('fields.updatedAt')}: {formatDate(treatment.updatedAt)}</p>}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
