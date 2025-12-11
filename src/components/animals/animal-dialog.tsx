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
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { useBreeds } from '@/lib/hooks/useBreeds';
import { useSpecies } from '@/lib/hooks/useSpecies';
import { treatmentsService } from '@/lib/services/treatments.service';
import { AnimalSearchDialog } from './animal-search-dialog';
import { Pill, Syringe, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

type DialogMode = 'view' | 'edit' | 'create';

interface AnimalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: DialogMode;
  animal?: Animal | null;
  onSubmit?: (data: CreateAnimalDto | UpdateAnimalDto) => Promise<void>;
  isLoading?: boolean;
  // Navigation pour le mode view
  animals?: Animal[];
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export function AnimalDialog({
  open,
  onOpenChange,
  mode,
  animal,
  onSubmit,
  isLoading,
  animals = [],
  onNavigate,
}: AnimalDialogProps) {
  const t = useTranslations('animals');
  const tc = useCommonTranslations();
  const isEditable = mode === 'edit' || mode === 'create';

  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState<CreateAnimalDto>({
    birthDate: '',
    sex: 'female',
    currentEid: '',
    officialNumber: '',
    visualId: '',
    speciesId: '',
    breedId: '',
    motherId: '',
    fatherId: '',
    status: 'alive',
    notes: '',
  });

  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('');
  const { species, loading: loadingSpecies } = useSpecies();
  const { breeds, loading: loadingBreeds } = useBreeds(selectedSpeciesId);

  // Care data
  const [allTreatments, setAllTreatments] = useState<Treatment[]>([]);
  const [loadingCare, setLoadingCare] = useState(false);

  // Parent search dialogs
  const [motherSearchOpen, setMotherSearchOpen] = useState(false);
  const [fatherSearchOpen, setFatherSearchOpen] = useState(false);

  const treatments = allTreatments.filter(t => t.type !== 'vaccination');
  const vaccinations = allTreatments.filter(t => t.type === 'vaccination');

  // Navigation
  const currentIndex = animal ? animals.findIndex((a) => a.id === animal.id) : -1;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < animals.length - 1 && currentIndex !== -1;

  useEffect(() => {
    if (animal) {
      const birthDateForInput = animal.birthDate
        ? animal.birthDate.split('T')[0]
        : '';

      setFormData({
        birthDate: birthDateForInput,
        sex: animal.sex,
        currentEid: animal.currentEid || '',
        officialNumber: animal.officialNumber || '',
        visualId: animal.visualId || '',
        speciesId: animal.speciesId || '',
        breedId: animal.breedId || '',
        motherId: animal.motherId || '',
        fatherId: animal.fatherId || '',
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
        motherId: '',
        fatherId: '',
        status: 'alive',
        notes: '',
      });
      setSelectedSpeciesId('');
      setActiveTab('info');
    }
  }, [animal]);

  const loadCareData = React.useCallback(async () => {
    if (!animal) return;
    setLoadingCare(true);
    try {
      const treatmentsData = await treatmentsService.getByAnimalId(animal.id);
      setAllTreatments(treatmentsData);
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
    if (!onSubmit) return;
    try {
      // Clean up form data - remove empty optional fields to avoid validation errors
      const cleanedData: Record<string, any> = {
        birthDate: formData.birthDate,
        sex: formData.sex,
        speciesId: formData.speciesId,
        status: formData.status,
      };

      // Only include optional fields if they have values
      if (formData.currentEid) cleanedData.currentEid = formData.currentEid;
      if (formData.officialNumber) cleanedData.officialNumber = formData.officialNumber;
      if (formData.visualId) cleanedData.visualId = formData.visualId;
      if (formData.breedId) cleanedData.breedId = formData.breedId;
      if (formData.motherId) cleanedData.motherId = formData.motherId;
      if (formData.fatherId) cleanedData.fatherId = formData.fatherId;
      if (formData.notes) cleanedData.notes = formData.notes;

      await onSubmit(cleanedData as CreateAnimalDto);
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'success' | 'warning' | 'secondary' => {
    switch (status) {
      case 'alive': return 'success';
      case 'sold': return 'warning';
      case 'slaughtered': return 'secondary';
      case 'dead': return 'destructive';
      default: return 'default';
    }
  };

  const getTreatmentStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'scheduled': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getDialogTitle = () => {
    if (mode === 'create') return t('newAnimal');
    if (mode === 'edit') return t('editAnimal');
    return animal?.officialNumber || animal?.visualId || animal?.currentEid || animal?.id || '';
  };

  const getDialogDescription = () => {
    if (mode === 'create') return t('messages.addDescription');
    if (mode === 'edit') return t('messages.editDescription');
    return animal?.breed?.nameFr || '';
  };

  // Composant pour afficher un champ (lecture ou édition)
  const Field = ({
    label,
    value,
    type = 'text',
    placeholder,
    onChange,
    required,
    maxLength,
    options,
    disabled,
  }: {
    label: string;
    value: string;
    type?: 'text' | 'date' | 'select' | 'textarea';
    placeholder?: string;
    onChange?: (value: string) => void;
    required?: boolean;
    maxLength?: number;
    options?: { value: string; label: string }[];
    disabled?: boolean;
  }) => {
    if (!isEditable) {
      // Mode lecture
      if (type === 'select' && options) {
        const selectedOption = options.find(o => o.value === value);
        return (
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">{label}</span>
            <p className="font-medium">{selectedOption?.label || value || '-'}</p>
          </div>
        );
      }
      return (
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          <p className="font-medium">{value || '-'}</p>
        </div>
      );
    }

    // Mode édition
    if (type === 'select' && options) {
      return (
        <div className="space-y-2">
          <Label>{label}{required && ' *'}</Label>
          <Select value={value} onValueChange={onChange || (() => {})} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div className="space-y-2">
          <Label>{label}</Label>
          <Textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            rows={3}
            maxLength={maxLength}
          />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label>{label}{required && ' *'}</Label>
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
        />
      </div>
    );
  };

  // Composant pour afficher le statut
  const StatusField = () => {
    if (!isEditable) {
      return (
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">{t('fields.status')}</span>
          <div>
            <Badge variant={getStatusBadgeVariant(animal?.status || formData.status || 'alive')}>
              {t(`status.${animal?.status || formData.status || 'alive'}`)}
            </Badge>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label>{t('fields.status')} *</Label>
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
            <SelectItem value="slaughtered">{t('status.slaughtered')}</SelectItem>
            <SelectItem value="dead">{t('status.dead')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };

  const FormContent = () => (
    <div className="space-y-6 py-4">
      {/* Section: Identification */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium border-b pb-2">{t('sections.general')}</h3>
        <div className="grid grid-cols-3 gap-4">
          <Field
            label={t('fields.currentEid')}
            value={isEditable ? (formData.currentEid || '') : (animal?.currentEid || '')}
            placeholder="Ex: 250268001234567"
            maxLength={15}
            onChange={(v) => setFormData({ ...formData, currentEid: v })}
          />
          <Field
            label={t('fields.officialNumber')}
            value={isEditable ? (formData.officialNumber || '') : (animal?.officialNumber || '')}
            placeholder="Ex: DZ-2024-001"
            onChange={(v) => setFormData({ ...formData, officialNumber: v })}
          />
          <Field
            label={t('fields.visualId')}
            value={isEditable ? (formData.visualId || '') : (animal?.visualId || '')}
            placeholder="Ex: A-001"
            onChange={(v) => setFormData({ ...formData, visualId: v })}
          />
        </div>
      </div>

      {/* Section: Informations de base */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium border-b pb-2">Informations de base</h3>
        <div className="grid grid-cols-3 gap-4">
          <Field
            label={t('fields.sex')}
            value={isEditable ? formData.sex : (animal?.sex || '')}
            type="select"
            required
            options={[
              { value: 'female', label: t('sex.female') },
              { value: 'male', label: t('sex.male') },
            ]}
            onChange={(v) => setFormData({ ...formData, sex: v as 'male' | 'female' })}
          />
          {isEditable ? (
            <Field
              label={t('fields.birthDate')}
              value={formData.birthDate}
              type="date"
              required
              onChange={(v) => setFormData({ ...formData, birthDate: v })}
            />
          ) : (
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">{t('fields.birthDate')}</span>
              <p className="font-medium">
                {animal?.birthDate ? new Date(animal.birthDate).toLocaleDateString() : '-'}
              </p>
            </div>
          )}
          <StatusField />
        </div>
      </div>

      {/* Section: Espèce et Race */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium border-b pb-2">Espèce et Race</h3>
        <div className="grid grid-cols-2 gap-4">
          {isEditable ? (
            <>
              <div className="space-y-2">
                <Label>{t('fields.speciesId')} *</Label>
                <Select
                  value={formData.speciesId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, speciesId: value, breedId: '' });
                    setSelectedSpeciesId(value);
                  }}
                  disabled={loadingSpecies}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingSpecies ? "Chargement..." : "Sélectionner une espèce"} />
                  </SelectTrigger>
                  <SelectContent>
                    {species.map((sp) => (
                      <SelectItem key={sp.id} value={sp.id}>
                        {sp.nameFr || sp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('fields.breedId')}</Label>
                <Select
                  value={formData.breedId}
                  onValueChange={(value) => setFormData({ ...formData, breedId: value })}
                  disabled={!selectedSpeciesId || loadingBreeds}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !selectedSpeciesId
                        ? "Sélectionner d'abord une espèce"
                        : loadingBreeds
                          ? "Chargement..."
                          : breeds.length === 0
                            ? "Aucune race disponible"
                            : "Sélectionner une race"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {breeds.map((breed) => (
                      <SelectItem key={breed.id} value={breed.id}>
                        {breed.nameFr || breed.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">{t('fields.speciesId')}</span>
                <p className="font-medium">
                  {animal?.species?.nameFr || '-'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">{t('fields.breedId')}</span>
                <p className="font-medium">
                  {animal?.breed?.nameFr || '-'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section: Parents */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium border-b pb-2">Parents</h3>
        <div className="grid grid-cols-2 gap-4">
          {isEditable ? (
            <>
              {/* Mother selection */}
              <div className="space-y-2">
                <Label>{t('fields.motherId')}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 justify-start font-normal"
                    onClick={() => setMotherSearchOpen(true)}
                  >
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formData.motherId ? (
                      (() => {
                        const mother = animals.find(a => a.id === formData.motherId);
                        return mother?.officialNumber || mother?.visualId || mother?.currentEid || formData.motherId.substring(0, 8);
                      })()
                    ) : (
                      <span className="text-muted-foreground">Rechercher la mère...</span>
                    )}
                  </Button>
                  {formData.motherId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setFormData({ ...formData, motherId: '' })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Father selection */}
              <div className="space-y-2">
                <Label>{t('fields.fatherId')}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 justify-start font-normal"
                    onClick={() => setFatherSearchOpen(true)}
                  >
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formData.fatherId ? (
                      (() => {
                        const father = animals.find(a => a.id === formData.fatherId);
                        return father?.officialNumber || father?.visualId || father?.currentEid || formData.fatherId.substring(0, 8);
                      })()
                    ) : (
                      <span className="text-muted-foreground">Rechercher le père...</span>
                    )}
                  </Button>
                  {formData.fatherId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setFormData({ ...formData, fatherId: '' })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">{t('fields.motherId')}</span>
                <p className="font-medium">
                  {animal?.mother
                    ? (animal.mother.officialNumber || animal.mother.visualId || animal.mother.currentEid || '-')
                    : animal?.motherId
                      ? animals.find(a => a.id === animal.motherId)?.officialNumber ||
                        animals.find(a => a.id === animal.motherId)?.visualId ||
                        animal.motherId.substring(0, 8)
                      : '-'
                  }
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">{t('fields.fatherId')}</span>
                <p className="font-medium">
                  {animal?.father
                    ? (animal.father.officialNumber || animal.father.visualId || animal.father.currentEid || '-')
                    : animal?.fatherId
                      ? animals.find(a => a.id === animal.fatherId)?.officialNumber ||
                        animals.find(a => a.id === animal.fatherId)?.visualId ||
                        animal.fatherId.substring(0, 8)
                      : '-'
                  }
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section: Notes */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium border-b pb-2">{t('fields.notes')}</h3>
        {isEditable ? (
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder={t('placeholders.notes')}
            rows={3}
            maxLength={1000}
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap">{animal?.notes || '-'}</p>
        )}
      </div>

      {/* Section: Métadonnées (lecture seule) */}
      {!isEditable && animal && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium border-b pb-2">Métadonnées</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">{t('fields.createdAt')}</span>
              <p className="text-sm">
                {animal.createdAt ? new Date(animal.createdAt).toLocaleString() : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">{t('fields.updatedAt')}</span>
              <p className="text-sm">
                {animal.updatedAt ? new Date(animal.updatedAt).toLocaleString() : '-'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const CareContent = () => (
    <div className="space-y-6 py-4">
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
                  <div key={treatment.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{treatment.productName || '-'}</p>
                        <p className="text-sm text-muted-foreground">{treatment.diagnosis || '-'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getTreatmentStatusColor(treatment.status)}`} />
                        <span className="text-xs text-muted-foreground capitalize">{treatment.status}</span>
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
                  <div key={vaccination.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{vaccination.productName || '-'}</p>
                        <p className="text-sm text-muted-foreground">{vaccination.diagnosis || '-'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getTreatmentStatusColor(vaccination.status)}`} />
                        <span className="text-xs text-muted-foreground capitalize">{vaccination.status}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <p>{new Date(vaccination.treatmentDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dose:</span>
                        <p>{vaccination.dose} {vaccination.dosageUnit}</p>
                      </div>
                    </div>
                    {vaccination.notes && (
                      <p className="text-xs text-muted-foreground italic">{vaccination.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {isEditable && (
            <div className="text-sm text-muted-foreground text-center pt-4 border-t">
              Pour ajouter des traitements ou vaccinations, utilisez les écrans dédiés.
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{getDialogTitle()}</DialogTitle>
              <DialogDescription>{getDialogDescription()}</DialogDescription>
            </div>
            {mode === 'view' && animal && (
              <Badge variant={getStatusBadgeVariant(animal.status)}>
                {t(`status.${animal.status}`)}
              </Badge>
            )}
          </div>

          {/* Navigation (mode view uniquement) */}
          {mode === 'view' && onNavigate && animals.length > 1 && (
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => onNavigate('prev')} disabled={!canGoPrev}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {currentIndex + 1} / {animals.length}
              </span>
              <Button variant="outline" size="sm" onClick={() => onNavigate('next')} disabled={!canGoNext}>
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="care" disabled={mode === 'create'}>
              Soins
              {(treatments.length > 0 || vaccinations.length > 0) && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {treatments.length + vaccinations.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            {isEditable ? (
              <form onSubmit={handleSubmit}>
                <FormContent />
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                    {tc('actions.cancel')}
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? t('actions.saving') : mode === 'create' ? tc('actions.create') : tc('actions.save')}
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <FormContent />
            )}
          </TabsContent>

          <TabsContent value="care">
            <CareContent />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>

    {/* Mother search dialog */}
    <AnimalSearchDialog
      open={motherSearchOpen}
      onOpenChange={setMotherSearchOpen}
      animals={animals}
      onSelect={(selectedAnimal) => {
        setFormData({ ...formData, motherId: selectedAnimal?.id || '' });
      }}
      title="Sélectionner la mère"
      filterSex="female"
      filterSpeciesId={formData.speciesId || animal?.speciesId || undefined}
      excludeId={animal?.id}
      selectedId={formData.motherId || null}
    />

    {/* Father search dialog */}
    <AnimalSearchDialog
      open={fatherSearchOpen}
      onOpenChange={setFatherSearchOpen}
      animals={animals}
      onSelect={(selectedAnimal) => {
        setFormData({ ...formData, fatherId: selectedAnimal?.id || '' });
      }}
      title="Sélectionner le père"
      filterSex="male"
      filterSpeciesId={formData.speciesId || animal?.speciesId || undefined}
      excludeId={animal?.id}
      selectedId={formData.fatherId || null}
    />
    </>
  );
}
