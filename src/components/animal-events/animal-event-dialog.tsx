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
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { Calendar, MapPin, User, Stethoscope, DollarSign, FileText, ChevronLeft, ChevronRight, PawPrint } from 'lucide-react';

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
    }
  }, [event, open]);

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

  // Composant pour afficher un champ (lecture ou édition)
  const Field = ({
    label,
    value,
    type = 'text',
    placeholder,
    onChange,
    required,
    icon: Icon,
  }: {
    label: string;
    value: string;
    type?: 'text' | 'date' | 'number' | 'textarea';
    placeholder?: string;
    onChange?: (value: string) => void;
    required?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
  }) => {
    if (!isEditable) {
      // Mode lecture
      if (!value && value !== '0') return null;
      return (
        <div className="flex items-start gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />}
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm">{type === 'date' ? formatDate(value) : value}</p>
          </div>
        </div>
      );
    }

    // Mode édition
    if (type === 'textarea') {
      return (
        <div className="space-y-2">
          <Label>{label}{required && ' *'}</Label>
          <Textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            rows={3}
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
          step={type === 'number' ? '0.01' : undefined}
        />
      </div>
    );
  };

  // Contenu unifié (lecture et édition)
  const DialogBody = () => (
    <div className="space-y-6 py-4">
      {/* Section: Animaux concernés */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <PawPrint className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">{t('fields.animalId')}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label={t('fields.animalId')}
            value={isEditable ? formData.animalId : (event?.animalId || '')}
            required={isEditable}
            onChange={isEditable ? (v) => setFormData({ ...formData, animalId: v }) : undefined}
          />
          <Field
            label={t('fields.relatedAnimalId')}
            value={isEditable ? (formData.relatedAnimalId || '') : (event?.relatedAnimalId || '')}
            onChange={isEditable ? (v) => setFormData({ ...formData, relatedAnimalId: v }) : undefined}
          />
        </div>
      </div>

      {/* Section: Informations générales */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium border-b pb-2">{t('sections.general')}</h3>
        <div className="grid grid-cols-2 gap-4">
          {isEditable ? (
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
          ) : (
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">{t('fields.eventType')}</span>
              <div><Badge>{t(`types.${event?.eventType}`)}</Badge></div>
            </div>
          )}
          <Field
            label={t('fields.eventDate')}
            value={isEditable ? formData.eventDate : (event?.eventDate?.split('T')[0] || '')}
            type="date"
            required={isEditable}
            onChange={isEditable ? (v) => setFormData({ ...formData, eventDate: v }) : undefined}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label={t('fields.title')}
            value={isEditable ? formData.title : (event?.title || '')}
            required={isEditable}
            placeholder={t('placeholders.title')}
            onChange={isEditable ? (v) => setFormData({ ...formData, title: v }) : undefined}
          />
          <Field
            label={t('fields.location')}
            value={isEditable ? (formData.location || '') : (event?.location || '')}
            placeholder={t('placeholders.location')}
            onChange={isEditable ? (v) => setFormData({ ...formData, location: v }) : undefined}
          />
        </div>

        <Field
          label={t('fields.description')}
          value={isEditable ? (formData.description || '') : (event?.description || '')}
          type="textarea"
          placeholder={t('placeholders.description')}
          onChange={isEditable ? (v) => setFormData({ ...formData, description: v }) : undefined}
        />
      </div>

      {/* Section: Détails */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium border-b pb-2">{t('sections.details')}</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label={t('fields.performedBy')}
            value={isEditable ? (formData.performedBy || '') : (event?.performedBy || '')}
            placeholder={t('placeholders.performedBy')}
            onChange={isEditable ? (v) => setFormData({ ...formData, performedBy: v }) : undefined}
          />
          <Field
            label={t('fields.veterinarianId')}
            value={isEditable ? (formData.veterinarianId || '') : (event?.veterinarianId || '')}
            onChange={isEditable ? (v) => setFormData({ ...formData, veterinarianId: v }) : undefined}
          />
        </div>

        <Field
          label={t('fields.cost')}
          value={isEditable ? (formData.cost?.toString() || '') : (event?.cost?.toString() || '')}
          type="number"
          onChange={isEditable ? (v) => setFormData({ ...formData, cost: v ? parseFloat(v) : undefined }) : undefined}
        />
      </div>

      {/* Section: Notes */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium border-b pb-2">{t('sections.additional')}</h3>
        <Field
          label={t('fields.notes')}
          value={isEditable ? (formData.notes || '') : (event?.notes || '')}
          type="textarea"
          placeholder={t('placeholders.notes')}
          onChange={isEditable ? (v) => setFormData({ ...formData, notes: v }) : undefined}
        />
      </div>

      {/* Métadonnées (lecture seule) */}
      {!isEditable && (event?.createdAt || event?.updatedAt) && (
        <div className="text-xs text-muted-foreground pt-4 border-t space-y-1">
          {event?.createdAt && <p>{tc('fields.createdAt')}: {formatDate(event.createdAt)}</p>}
          {event?.updatedAt && <p>{tc('fields.updatedAt')}: {formatDate(event.updatedAt)}</p>}
        </div>
      )}
    </div>
  );

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
            <DialogBody />
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
          <DialogBody />
        )}
      </DialogContent>
    </Dialog>
  );
}
