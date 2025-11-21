'use client';

import { Treatment, TREATMENT_STATUS_LABELS, TREATMENT_TYPE_LABELS, TREATMENT_TARGET_LABELS } from '@/lib/types/treatment';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Pill, User, FileText, AlertTriangle, DollarSign, Package, Clock } from 'lucide-react';

interface TreatmentInfoCardProps {
  treatment: Treatment;
}

export function TreatmentInfoCard({ treatment }: TreatmentInfoCardProps) {
  const getStatusVariant = (status: Treatment['status']): 'default' | 'destructive' | 'warning' | 'success' => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'scheduled': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getTypeColor = (type: Treatment['treatmentType']) => {
    switch (type) {
      case 'antibiotic':
        return 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'antiparasitic':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'anti_inflammatory':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'vitamin':
        return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations du traitement</CardTitle>
        <CardDescription>Détails et traçabilité</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut et Type */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={getStatusVariant(treatment.status)}>
            {TREATMENT_STATUS_LABELS[treatment.status]}
          </Badge>
          <Badge className={getTypeColor(treatment.treatmentType)}>
            {TREATMENT_TYPE_LABELS[treatment.treatmentType]}
          </Badge>
          <Badge className="border border-border bg-background">
            {TREATMENT_TARGET_LABELS[treatment.targetType]}
          </Badge>
        </div>

        {/* Produit */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Pill className="h-4 w-4 text-muted-foreground" />
            Produit
          </div>
          <p className="text-sm font-medium">{treatment.productName}</p>
          {treatment.manufacturer && (
            <p className="text-xs text-muted-foreground">Fabricant: {treatment.manufacturer}</p>
          )}
          {treatment.batchNumber && (
            <p className="text-xs text-muted-foreground">Lot n° : {treatment.batchNumber}</p>
          )}
        </div>

        {/* Raison et diagnostic */}
        <div className="space-y-1">
          <div className="text-sm font-medium">Raison du traitement</div>
          <p className="text-sm">{treatment.reason}</p>
          {treatment.diagnosis && (
            <p className="text-xs text-muted-foreground">Diagnostic : {treatment.diagnosis}</p>
          )}
        </div>

        {/* Posologie */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Package className="h-4 w-4 text-muted-foreground" />
            Posologie
          </div>
          <p className="text-sm">{treatment.dosage}</p>
          {treatment.administrationRoute && (
            <p className="text-xs text-muted-foreground">Voie : {treatment.administrationRoute}</p>
          )}
          {treatment.frequency && (
            <p className="text-xs text-muted-foreground">Fréquence : {treatment.frequency}</p>
          )}
          {treatment.duration && (
            <p className="text-xs text-muted-foreground">Durée : {treatment.duration} jour(s)</p>
          )}
        </div>

        {/* Dates */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Dates
          </div>
          <p className="text-sm">
            Début : {new Date(treatment.startDate).toLocaleDateString('fr-FR')}
          </p>
          {treatment.endDate && (
            <p className="text-sm">
              Fin : {new Date(treatment.endDate).toLocaleDateString('fr-FR')}
            </p>
          )}
          {treatment.administeredDate && (
            <p className="text-sm">
              Administré : {new Date(treatment.administeredDate).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>

        {/* Délais d'attente */}
        {(treatment.withdrawalPeriodMeat || treatment.withdrawalPeriodMilk || treatment.withdrawalEndDate) && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Délais d'attente
            </div>
            {treatment.withdrawalPeriodMeat && (
              <p className="text-sm">Viande : {treatment.withdrawalPeriodMeat} jours</p>
            )}
            {treatment.withdrawalPeriodMilk && (
              <p className="text-sm">Lait : {treatment.withdrawalPeriodMilk} jours</p>
            )}
            {treatment.withdrawalEndDate && (
              <div className="mt-2">
                <Badge variant={new Date(treatment.withdrawalEndDate) > new Date() ? 'warning' : 'success'}>
                  Fin : {new Date(treatment.withdrawalEndDate).toLocaleDateString('fr-FR')}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Responsables */}
        {(treatment.veterinarianName || treatment.administeredBy) && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-muted-foreground" />
              Responsables
            </div>
            {treatment.veterinarianName && (
              <p className="text-sm">Vétérinaire : {treatment.veterinarianName}</p>
            )}
            {treatment.administeredBy && (
              <p className="text-sm">Administré par : {treatment.administeredBy}</p>
            )}
            {treatment.prescriptionNumber && (
              <p className="text-xs text-muted-foreground font-mono">
                Ordonnance : {treatment.prescriptionNumber}
              </p>
            )}
          </div>
        )}

        {/* Coût */}
        {treatment.cost && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Coût
            </div>
            <p className="text-2xl font-bold">{treatment.cost.toLocaleString('fr-DZ')} DA</p>
          </div>
        )}

        {/* Efficacité */}
        {treatment.effectiveness && (
          <div className="space-y-1">
            <div className="text-sm font-medium">Efficacité</div>
            <p className="text-sm text-green-600 dark:text-green-400">{treatment.effectiveness}</p>
          </div>
        )}

        {/* Réactions adverses */}
        {treatment.adverseReactions && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              Réactions adverses
            </div>
            <p className="text-sm">{treatment.adverseReactions}</p>
          </div>
        )}

        {/* Notes */}
        {treatment.notes && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Notes
            </div>
            <p className="text-sm text-muted-foreground">{treatment.notes}</p>
          </div>
        )}

        {/* Métadonnées */}
        <div className="border-t pt-4 text-xs text-muted-foreground">
          <div className="space-y-1">
            <div>Créé le {new Date(treatment.createdAt).toLocaleDateString('fr-FR')}</div>
            <div>Modifié le {new Date(treatment.updatedAt).toLocaleDateString('fr-FR')}</div>
            <div>Version : {treatment.version}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
