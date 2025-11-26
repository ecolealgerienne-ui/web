'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { VaccinationInfoCard } from '@/components/vaccinations/vaccination-info-card';
import { mockVaccinations } from '@/lib/data/vaccinations.mock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VaccinationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function VaccinationDetailPage({ params }: VaccinationDetailPageProps) {
  const { id } = use(params);
  const vaccination = mockVaccinations.find((v) => v.id === id);

  if (!vaccination) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/vaccinations">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{vaccination.vaccineName}</h1>
              <p className="text-muted-foreground">
                Vaccination programmée le{' '}
                {new Date(vaccination.vaccinationDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {vaccination.status === 'scheduled' && (
            <Button variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Marquer comme effectuée
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
      {vaccination.status === 'overdue' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-100">
                Vaccination en retard
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Cette vaccination devait être effectuée. Contactez votre vétérinaire.
              </p>
            </div>
          </div>
        </div>
      )}

      {vaccination.status === 'completed' && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                Vaccination effectuée
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Le {new Date(vaccination.administeredDate!).toLocaleDateString('fr-FR')}
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
              <CardTitle>Cible de la vaccination</CardTitle>
            </CardHeader>
            <CardContent>
              {vaccination.targetType === 'individual' && vaccination.animalId && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Animal individuel</p>
                    <p className="text-sm text-muted-foreground">ID: {vaccination.animalId}</p>
                  </div>
                  <Link href={`/animals/${vaccination.animalId}`}>
                    <Button variant="outline" size="sm">Voir l&apos;animal</Button>
                  </Link>
                </div>
              )}
              {vaccination.targetType === 'lot' && vaccination.lotId && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lot d&apos;animaux</p>
                    <p className="text-sm text-muted-foreground">ID: {vaccination.lotId}</p>
                  </div>
                  <Link href={`/lots/${vaccination.lotId}`}>
                    <Button variant="outline" size="sm">Voir le lot</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <VaccinationInfoCard vaccination={vaccination} />
        </div>
      </div>
    </div>
  );
}
