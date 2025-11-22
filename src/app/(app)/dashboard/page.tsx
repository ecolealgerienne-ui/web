'use client';

import { Beef, Plus, X, Syringe } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ChartEvolution } from "@/components/dashboard/chart-evolution";
import { AlertsCard } from "@/components/dashboard/alerts-card";
import { ActivitiesCard } from "@/components/dashboard/activities-card";
import {
  mockDashboardStats,
  mockChartData,
  mockAlerts,
  mockRecentActivities,
} from "@/lib/data/mock";
import { useTranslations } from "@/lib/i18n";

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Beef}
          value={mockDashboardStats.totalAnimals.toLocaleString("fr-FR")}
          label={t('kpis.totalAnimals')}
          iconColor="text-primary"
        />
        <KpiCard
          icon={Plus}
          value={mockDashboardStats.births.count}
          label={t('kpis.births')}
          subtitle={t('periods.thisMonth')}
          iconColor="text-green-600"
        />
        <KpiCard
          icon={X}
          value={mockDashboardStats.deaths.count}
          label={t('kpis.deaths')}
          subtitle={t('periods.thisMonth')}
          iconColor="text-red-600"
        />
        <KpiCard
          icon={Syringe}
          value={mockDashboardStats.vaccinations.upcoming}
          label={t('kpis.vaccinations')}
          subtitle={t('periods.upcoming')}
          iconColor="text-blue-600"
        />
      </div>

      {/* Chart */}
      <ChartEvolution data={mockChartData} />

      {/* Bottom Grid - Alerts & Activities */}
      <div className="grid gap-4 md:grid-cols-2">
        <AlertsCard alerts={mockAlerts} />
        <ActivitiesCard activities={mockRecentActivities} />
      </div>
    </div>
  );
}
