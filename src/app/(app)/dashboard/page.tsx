'use client';

import { Beef, Plus, X, Syringe } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ChartEvolution } from "@/components/dashboard/chart-evolution";
import { AlertsCard } from "@/components/dashboard/alerts-card";
import { ActivitiesCard } from "@/components/dashboard/activities-card";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { mockChartData } from "@/lib/data/mock";

export default function DashboardPage() {
  const { stats, alerts, activities, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-medium">Chargement du dashboard...</div>
          <div className="text-sm text-muted-foreground mt-2">Récupération des données</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Impossible de charger les statistiques
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
          label="Total Animaux"
          iconColor="text-primary"
        />
        <KpiCard
          icon={Plus}
          value={stats.births.count}
          label="Naissances"
          subtitle={stats.births.period}
          iconColor="text-green-600"
        />
        <KpiCard
          icon={X}
          value={stats.deaths.count}
          label="Décès"
          subtitle={stats.deaths.period}
          iconColor="text-red-600"
        />
        <KpiCard
          icon={Syringe}
          value={stats.vaccinations.upcoming}
          label="Vaccinations"
          subtitle={stats.vaccinations.label}
          iconColor="text-blue-600"
        />
      </div>

      {/* Chart - Still using mock data for now */}
      <ChartEvolution data={mockChartData} />

      {/* Bottom Grid - Alerts & Activities */}
      <div className="grid gap-4 md:grid-cols-2">
        <AlertsCard alerts={alerts} />
        <ActivitiesCard activities={activities} />
      </div>
    </div>
  );
}
