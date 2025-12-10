'use client'

import { useRouter } from 'next/navigation'
import { Beef, Plus, X, Syringe, FileSpreadsheet } from 'lucide-react'
import { KpiCard } from './kpi-card'
import { ChartEvolution } from './chart-evolution'
import { AlertsCard } from './alerts-card'
import { ActivitiesCard } from './activities-card'
import { EmptyState, EmptyStateIllustration, ConfigWarningCard } from '@/components/ui/empty-state'

// Default mock data for development
const mockDashboardStats = {
  totalAnimals: 0,
  births: { count: 0, period: 'Ce mois' },
  deaths: { count: 0, period: 'Ce mois' },
  vaccinations: { upcoming: 0, label: 'À venir' },
}

const mockChartData: Array<{ month: string; animals: number }> = []

const mockRecentActivities: any[] = []

interface DashboardStats {
  totalAnimals: number
  configuredVaccines: number
  configuredVeterinarians: number
}

interface DashboardContentProps {
  stats?: DashboardStats
}

type DashboardState = 'empty' | 'incomplete-config' | 'normal'

export function DashboardContent({ stats }: DashboardContentProps) {
  const router = useRouter()

  // Déterminer l'état du dashboard
  const getDashboardState = (): DashboardState => {
    if (!stats) return 'normal' // Par défaut en mode normal (avec mock data)

    if (stats.totalAnimals === 0) {
      return 'empty'
    }

    if (stats.configuredVaccines === 0 || stats.configuredVeterinarians === 0) {
      return 'incomplete-config'
    }

    return 'normal'
  }

  const dashboardState = getDashboardState()

  // Cas A : Aucun animal
  if (dashboardState === 'empty') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={<EmptyStateIllustration />}
          title="Bienvenue sur votre espace de gestion !"
          description="Commencez par enregistrer votre premier animal pour accéder à toutes les fonctionnalités de suivi et de gestion."
          action={{
            label: '+ Enregistrer mon premier animal',
            onClick: () => router.push('/animals?action=new'),
          }}
          secondaryAction={{
            label: 'Importer depuis Excel',
            onClick: () => router.push('/animals?action=import'),
            icon: FileSpreadsheet,
          }}
        />
      </div>
    )
  }

  // Cas B & C : Affichage normal avec warning potentiel
  return (
    <div className="space-y-6">
      {/* Warning de configuration incomplète (Cas B) */}
      {dashboardState === 'incomplete-config' && (
        <ConfigWarningCard
          title="Conseil : Complétez votre configuration"
          description="Pour saisir vos soins plus rapidement, configurez vos vaccins et vétérinaires habituels."
          actionLabel="Configurer"
          onAction={() => router.push('/settings')}
        />
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Beef}
          value={stats?.totalAnimals?.toLocaleString('fr-FR') ?? mockDashboardStats.totalAnimals.toLocaleString('fr-FR')}
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
        <AlertsCard />
        <ActivitiesCard activities={mockRecentActivities} />
      </div>
    </div>
  )
}
