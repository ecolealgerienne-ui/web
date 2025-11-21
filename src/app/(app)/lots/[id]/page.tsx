'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { LotInfoCard } from '@/components/lots/lot-info-card';
import { LotAnimalsCard } from '@/components/lots/lot-animals-card';
import { mockLots } from '@/lib/data/lots.mock';

interface LotDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function LotDetailPage({ params }: LotDetailPageProps) {
  const { id } = use(params);
  const lot = mockLots.find((l) => l.id === id);

  if (!lot) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/lots">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{lot.name}</h1>
              <p className="text-muted-foreground">
                {lot.animalCount} animaux • Créé le{' '}
                {new Date(lot.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!lot.completed && (
            <Button variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Clôturer
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
      {lot.completed && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                Lot clôturé
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Le {new Date(lot.completedAt!).toLocaleDateString('fr-FR')} à{' '}
                {new Date(lot.completedAt!).toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-6 lg:col-span-2">
          <LotAnimalsCard lotId={lot.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <LotInfoCard lot={lot} />
        </div>
      </div>
    </div>
  );
}
