'use client';

import { Package, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n';
import { LotStats, LotsStatsResponse } from '@/lib/services/dashboard.service';
import { cn } from '@/lib/utils';

interface LotsSummaryCardsProps {
  summary: LotsStatsResponse['summary'] | null;
  lotsStats: LotStats[];
  loading?: boolean;
}

export function LotsSummaryCards({ summary, lotsStats, loading }: LotsSummaryCardsProps) {
  const t = useTranslations('lots');

  // Calculate ready for sale (animals that reached target weight)
  // For now, we estimate based on lots with progress >= 100%
  const readyForSaleCount = lotsStats.reduce((acc, lot) => {
    if (lot.weights.targetWeight && lot.weights.avgWeight >= lot.weights.targetWeight) {
      return acc + lot.animalCount;
    }
    return acc;
  }, 0);

  const cards = [
    {
      icon: Package,
      value: summary?.totalLots ?? 0,
      label: t('summary.activeLots'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      icon: Users,
      value: summary?.totalAnimals ?? 0,
      label: t('summary.totalAnimals'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      icon: TrendingUp,
      value: summary?.overallAvgDailyGain
        ? `${summary.overallAvgDailyGain.toFixed(2)} kg/j`
        : '-',
      label: t('summary.avgGmq'),
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      icon: CheckCircle,
      value: readyForSaleCount,
      label: t('summary.readyForSale'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted" />
                <div className="space-y-2">
                  <div className="h-6 w-16 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn('p-3 rounded-lg', card.bgColor)}>
                <card.icon className={cn('h-6 w-6', card.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
