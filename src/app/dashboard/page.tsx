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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Beef}
          value={mockDashboardStats.totalAnimals.toLocaleString("fr-FR")}
          label="Total Animaux"
          iconColor="text-primary"
        />
        <KpiCard
          icon={Plus}
          value={mockDashboardStats.births.count}
          label="Naissances"
          subtitle={mockDashboardStats.births.period}
          iconColor="text-green-600"
        />
        <KpiCard
          icon={X}
          value={mockDashboardStats.deaths.count}
          label="Décès"
          subtitle={mockDashboardStats.deaths.period}
          iconColor="text-red-600"
        />
        <KpiCard
          icon={Syringe}
          value={mockDashboardStats.vaccinations.upcoming}
          label="Vaccinations"
          subtitle={mockDashboardStats.vaccinations.label}
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
