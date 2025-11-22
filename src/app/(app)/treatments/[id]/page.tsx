'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { TreatmentInfoCard } from '@/components/treatments/treatment-info-card';
import { mockTreatments } from '@/lib/data/treatments.mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TreatmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TreatmentDetailPage({ params }: TreatmentDetailPageProps) {
  const { id } = use(params);
  const treatment = mockTreatments.find((t) => t.id === id);

  if (!treatment) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/treatments">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{treatment.productName}</h1>
              <p className="text-muted-foreground">
                Traitement débuté le{' '}
                {new Date(treatment.startDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {treatment.status === 'in_progress' && (
            <Button variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Marquer comme terminé
            </Button>
          )}
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button variant="outline" className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {treatment.status === 'in_progress' && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="font-medium text-orange-900 dark:text-orange-100">
                Traitement en cours
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {treatment.duration && treatment.startDate ? (
                  <>
                    Jour {Math.ceil((new Date().getTime() - new Date(treatment.startDate).getTime()) / (1000 * 60 * 60 * 24))} sur {treatment.duration}
                  </>
                ) : (
                  'En cours d\'administration'
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {treatment.status === 'completed' && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                Traitement terminé
              </p>
              {treatment.endDate && (
                <p className="text-sm text-green-700 dark:text-green-300">
                  Le {new Date(treatment.endDate).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {treatment.withdrawalEndDate && new Date(treatment.withdrawalEndDate) > new Date() && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">
                Délai d'attente en cours
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Fin du délai : {new Date(treatment.withdrawalEndDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Cible */}
          <Card>
            <CardHeader>
              <CardTitle>Cible du traitement</CardTitle>
            </CardHeader>
            <CardContent>
              {treatment.targetType === 'individual' && treatment.animalId && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Animal individuel</p>
                    <p className="text-sm text-muted-foreground">ID: {treatment.animalId}</p>
                  </div>
                  <Link href={`/animals/${treatment.animalId}`}>
                    <Button variant="outline" size="sm">Voir l'animal</Button>
                  </Link>
                </div>
              )}
              {treatment.targetType === 'lot' && treatment.lotId && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lot d'animaux</p>
                    <p className="text-sm text-muted-foreground">ID: {treatment.lotId}</p>
                  </div>
                  <Link href={`/lots/${treatment.lotId}`}>
                    <Button variant="outline" size="sm">Voir le lot</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TreatmentInfoCard treatment={treatment} />
        </div>
      </div>
    </div>
  );
}
