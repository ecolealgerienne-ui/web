'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimalEvent } from '@/lib/types/animal-event';
import { useTranslations } from '@/lib/i18n';
import { Calendar, MapPin, User, Stethoscope, DollarSign, FileText, Edit2 } from 'lucide-react';

interface AnimalEventDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: AnimalEvent | null;
  onEdit?: (event: AnimalEvent) => void;
}

export function AnimalEventDetailDialog({
  open,
  onOpenChange,
  event,
  onEdit,
}: AnimalEventDetailDialogProps) {
  const t = useTranslations('animalEvents');

  if (!event) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEdit = () => {
    onOpenChange(false);
    onEdit?.(event);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{event.title}</DialogTitle>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Type et Date */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <Badge variant="default" className="text-sm px-3 py-1">
              {t(`types.${event.eventType}`)}
            </Badge>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(event.eventDate)}</span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p className="text-sm">{event.description}</p>
            </div>
          )}

          {/* Détails en grille */}
          <div className="grid grid-cols-2 gap-4">
            {event.location && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.location')}</p>
                  <p className="text-sm">{event.location}</p>
                </div>
              </div>
            )}

            {event.performedBy && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.performedBy')}</p>
                  <p className="text-sm">{event.performedBy}</p>
                </div>
              </div>
            )}

            {event.veterinarianId && (
              <div className="flex items-start gap-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.veterinarianId')}</p>
                  <p className="text-sm">{event.veterinarianId}</p>
                </div>
              </div>
            )}

            {event.cost !== undefined && event.cost !== null && (
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('fields.cost')}</p>
                  <p className="text-sm">{event.cost} €</p>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {event.notes && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium text-muted-foreground">{t('fields.notes')}</h4>
              </div>
              <p className="text-sm bg-muted/50 rounded-md p-3">{event.notes}</p>
            </div>
          )}

          {/* Métadonnées */}
          <div className="text-xs text-muted-foreground pt-4 border-t space-y-1">
            <p>ID Animal: {event.animalId || 'Non spécifié'}</p>
            {event.createdAt && <p>Créé le: {formatDate(event.createdAt)}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
