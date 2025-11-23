'use client';

import { Beef, Plus, X, Syringe } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ChartEvolution } from "@/components/dashboard/chart-evolution";
import { AlertsCard } from "@/components/dashboard/alerts-card";
import { ActivitiesCard } from "@/components/dashboard/activities-card";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { mockChartData } from "@/lib/data/mock";
import { useTranslations } from "@/lib/i18n";

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { stats, alerts, activities, loading } = useDashboard();

  // Helper to translate period/label values
  const translatePeriod = (value: string) => {
    if (value === 'thisMonth') return t('periods.thisMonth');
    if (value === 'upcoming') return t('periods.upcoming');
    return value; // Return as-is if not a key
  };

  // Helper to translate month names
  const translateMonth = (month: string) => {
    const monthMap: Record<string, string> = {
      'Janvier': 'jan', 'Février': 'feb', 'Mars': 'mar', 'Avril': 'apr',
      'Mai': 'may', 'Juin': 'jun', 'Juillet': 'jul', 'Août': 'aug',
      'Septembre': 'sep', 'Octobre': 'oct', 'Novembre': 'nov', 'Décembre': 'dec'
    };
    const monthKey = monthMap[month];
    return monthKey ? t(`months.${monthKey}`) : month;
  };

  // Translate chart data months
  const translatedChartData = mockChartData.map(item => ({
    ...item,
    month: translateMonth(item.month)
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-medium">{t('loading')}</div>
          <div className="text-sm text-muted-foreground mt-2">{t('loadingData')}</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('loadError')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Beef}
          value={stats.totalAnimals.toLocaleString("fr-FR")}
          label={t('kpi.totalAnimals')}
          iconColor="text-primary"
        />
        <KpiCard
          icon={Plus}
          value={stats.births.count}
          label={t('kpi.births')}
          subtitle={translatePeriod(stats.births.period)}
          iconColor="text-green-600"
        />
        <KpiCard
          icon={X}
          value={stats.deaths.count}
          label={t('kpi.deaths')}
          subtitle={translatePeriod(stats.deaths.period)}
          iconColor="text-red-600"
        />
        <KpiCard
          icon={Syringe}
          value={stats.vaccinations.upcoming}
          label={t('kpi.vaccinations')}
          subtitle={translatePeriod(stats.vaccinations.label)}
          iconColor="text-blue-600"
        />
      </div>

      {/* Chart - Still using mock data for now */}
      <ChartEvolution data={translatedChartData} />

      {/* Bottom Grid - Alerts & Activities */}
      <div className="grid gap-4 md:grid-cols-2">
        <AlertsCard alerts={alerts} />
        <ActivitiesCard activities={activities} />
      </div>
    </div>
  );
}
