'use client';

import { Lot } from '@/lib/types/lot';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/lib/i18n';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Calendar,
  DollarSign,
  FileText,
  Package,
  Stethoscope,
  User,
  Users,
} from 'lucide-react';

interface LotInfoCardProps {
  lot: Lot;
}

export function LotInfoCard({ lot }: LotInfoCardProps) {
  const t = useTranslations('lots');
  const animalCount = lot.animalIds?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations du lot</CardTitle>
        <CardDescription>Détails et métadonnées</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Type et Statut */}
        <div className="flex items-center gap-2">
          <Badge className="border border-border bg-background">{t(`type.${lot.type}`)}</Badge>
          <Badge variant="default">{t(`status.${lot.status}`)}</Badge>
        </div>

        {/* Description */}
        {lot.description && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Description
            </div>
            <p className="text-sm text-muted-foreground">{lot.description}</p>
          </div>
        )}

        {/* Animaux */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-muted-foreground" />
            Animaux concernés
          </div>
          <p className="text-2xl font-bold">{animalCount}</p>
        </div>

        {/* Produit */}
        {lot.productName && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4 text-muted-foreground" />
              Produit utilisé
            </div>
            <p className="text-sm">{lot.productName}</p>
          </div>
        )}

        {/* Vétérinaire */}
        {lot.veterinarianName && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              Vétérinaire
            </div>
            <p className="text-sm">{lot.veterinarianName}</p>
          </div>
        )}

        {/* Acheteur/Vendeur */}
        {lot.buyerName && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-muted-foreground" />
              Acheteur
            </div>
            <p className="text-sm">{lot.buyerName}</p>
          </div>
        )}

        {lot.sellerName && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-muted-foreground" />
              Vendeur
            </div>
            <p className="text-sm">{lot.sellerName}</p>
          </div>
        )}

        {/* Date de traitement */}
        {lot.treatmentDate && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Date d&apos;intervention
            </div>
            <p className="text-sm">
              {new Date(lot.treatmentDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        )}

        {/* Date de fin délai */}
        {lot.withdrawalEndDate && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Fin délai d&apos;attente
            </div>
            <p className="text-sm">
              {new Date(lot.withdrawalEndDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            {new Date(lot.withdrawalEndDate) > new Date() && (
              <Badge variant="warning">
                Délai en cours
              </Badge>
            )}
          </div>
        )}

        {/* Prix total */}
        {lot.priceTotal && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Montant total
            </div>
            <p className="text-2xl font-bold">
              {lot.priceTotal.toLocaleString('fr-DZ')} DA
            </p>
            {animalCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {(lot.priceTotal / animalCount).toLocaleString('fr-DZ')} DA /
                animal
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        {lot.notes && (
          <div className="space-y-1">
            <div className="text-sm font-medium">Notes</div>
            <p className="text-sm text-muted-foreground">{lot.notes}</p>
          </div>
        )}

        {/* Métadonnées */}
        {(lot.createdAt || lot.updatedAt) && (
          <div className="border-t pt-4 text-xs text-muted-foreground">
            <div className="space-y-1">
              {lot.createdAt && (
                <div>
                  Créé le {new Date(lot.createdAt).toLocaleDateString('fr-FR')}
                </div>
              )}
              {lot.updatedAt && (
                <div>
                  Modifié le {new Date(lot.updatedAt).toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
