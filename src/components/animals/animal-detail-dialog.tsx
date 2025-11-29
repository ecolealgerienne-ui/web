'use client';

import { Animal } from '@/lib/types/animal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/lib/i18n';

interface AnimalDetailDialogProps {
  animal: Animal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnimalDetailDialog({ animal, open, onOpenChange }: AnimalDetailDialogProps) {
  const t = useTranslations('animals');

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl">
                {animal.currentEid || animal.officialNumber || animal.visualId || animal.id}
              </DialogTitle>
              <DialogDescription>
                {t('messages.editDescription')}
              </DialogDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(animal.status)}>
              {t(`status.${animal.status}`)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
