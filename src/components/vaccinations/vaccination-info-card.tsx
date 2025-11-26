'use client';

import { Vaccination, VACCINATION_STATUS_LABELS, VACCINATION_TARGET_LABELS } from '@/lib/types/vaccination';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Syringe, User, FileText, AlertTriangle, CheckCircle, Package } from 'lucide-react';

interface VaccinationInfoCardProps {
  vaccination: Vaccination;
}

export function VaccinationInfoCard({ vaccination }: VaccinationInfoCardProps) {
  const getStatusVariant = (status: Vaccination['status']): 'default' | 'destructive' | 'warning' | 'success' => {
    switch (status) {
      case 'completed': return 'success';
      case 'scheduled': return 'default';
      case 'overdue': return 'destructive';
      case 'cancelled': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de la vaccination</CardTitle>
        <CardDescription>Détails et traçabilité</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut et Cible */}
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(vaccination.status)}>
            {VACCINATION_STATUS_LABELS[vaccination.status]}
          </Badge>
          <Badge className="border border-border bg-background">
            {VACCINATION_TARGET_LABELS[vaccination.targetType]}
          </Badge>
        </div>

        {/* Vaccin */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Syringe className="h-4 w-4 text-muted-foreground" />
            Vaccin administré
          </div>
          <p className="text-sm">{vaccination.vaccineName}</p>
          <p className="text-xs text-muted-foreground">
            Contre : {vaccination.diseaseTarget}
          </p>
        </div>

        {/* Fabricant et lot */}
        {(vaccination.manufacturer || vaccination.batchNumber) && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4 text-muted-foreground" />
              Produit
            </div>
            {vaccination.manufacturer && (
              <p className="text-sm">Fabricant : {vaccination.manufacturer}</p>
            )}
            {vaccination.batchNumber && (
              <p className="text-sm">Lot n° : {vaccination.batchNumber}</p>
            )}
          </div>
        )}

        {/* Dosage et administration */}
        {(vaccination.dose || vaccination.administrationRoute) && (
          <div className="space-y-1">
            <div className="text-sm font-medium">Posologie</div>
            {vaccination.dose && <p className="text-sm">{vaccination.dose}</p>}
            {vaccination.administrationRoute && (
              <p className="text-xs text-muted-foreground">
                Voie : {vaccination.administrationRoute}
              </p>
            )}
          </div>
        )}

        {/* Date programmée */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Date programmée
          </div>
          <p className="text-sm">
            {new Date(vaccination.vaccinationDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Date d'administration */}
        {vaccination.administeredDate && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Date d&apos;administration
            </div>
            <p className="text-sm">
              {new Date(vaccination.administeredDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}

        {/* Prochain rappel */}
        {vaccination.nextDueDate && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Prochain rappel
            </div>
            <p className="text-sm">
              {new Date(vaccination.nextDueDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        )}

        {/* Vétérinaire et administrateur */}
        {(vaccination.veterinarianName || vaccination.administeredBy) && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-muted-foreground" />
              Responsables
            </div>
            {vaccination.veterinarianName && (
              <p className="text-sm">Vétérinaire : {vaccination.veterinarianName}</p>
            )}
            {vaccination.administeredBy && (
              <p className="text-sm">Administré par : {vaccination.administeredBy}</p>
            )}
          </div>
        )}

        {/* Site d'injection */}
        {vaccination.siteOfInjection && (
          <div className="space-y-1">
            <div className="text-sm font-medium">Site d&apos;injection</div>
            <p className="text-sm">{vaccination.siteOfInjection}</p>
          </div>
        )}

        {/* Certificat */}
        {vaccination.certificateNumber && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Certificat
            </div>
            <p className="text-sm font-mono">{vaccination.certificateNumber}</p>
          </div>
        )}

        {/* Réactions adverses */}
        {vaccination.adverseReactions && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              Réactions adverses
            </div>
            <p className="text-sm">{vaccination.adverseReactions}</p>
          </div>
        )}

        {/* Notes */}
        {vaccination.notes && (
          <div className="space-y-1">
            <div className="text-sm font-medium">Notes</div>
            <p className="text-sm text-muted-foreground">{vaccination.notes}</p>
          </div>
        )}

        {/* Métadonnées */}
        <div className="border-t pt-4 text-xs text-muted-foreground">
          <div className="space-y-1">
            <div>Créé le {new Date(vaccination.createdAt).toLocaleDateString('fr-FR')}</div>
            <div>Modifié le {new Date(vaccination.updatedAt).toLocaleDateString('fr-FR')}</div>
            <div>Version : {vaccination.version}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
