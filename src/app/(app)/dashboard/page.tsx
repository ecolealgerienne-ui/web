'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Beef,
  Plus,
  Skull,
  Syringe,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Bell,
  Calendar,
  Scale,
  FileSpreadsheet,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { EmptyState, EmptyStateIllustration } from '@/components/ui/empty-state';
import { useTranslations } from '@/lib/i18n';
import { dashboardService } from '@/lib/services/dashboard.service';
import { weighingsService } from '@/lib/services/weighings.service';
import { treatmentsService } from '@/lib/services/treatments.service';
import { lotsService } from '@/lib/services/lots.service';
import { logger } from '@/lib/utils/logger';
import type { DashboardStats, HerdEvolution } from '@/lib/services/dashboard.service';
import type { WeightStats } from '@/lib/types/weighing';
import type { Treatment } from '@/lib/types/treatment';
import type { Lot } from '@/lib/types/lot';

interface DashboardData {
  stats: DashboardStats;
  weightStats: WeightStats | null;
  herdEvolution: HerdEvolution;
  upcomingVaccinations: Treatment[];
  activeWithdrawals: Treatment[];
  lots: Lot[];
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [
          stats,
          weightStats,
          herdEvolution,
          vaccinations,
          treatments,
          lots,
        ] = await Promise.all([
          dashboardService.getStats(),
          weighingsService.getStats().catch(() => null),
          dashboardService.getHerdEvolution('6months').catch(() => ({ data: [], period: '6months' })),
          treatmentsService.getAll({ type: 'vaccination' }).catch(() => []),
          treatmentsService.getAll().catch(() => []),
          lotsService.getAll({ isActive: true }).catch(() => []),
        ]);

        // Filter upcoming vaccinations (next 30 days)
        const now = new Date();
        const in30Days = new Date();
        in30Days.setDate(now.getDate() + 30);

        const upcomingVaccinations = vaccinations.filter((v) => {
          if (!v.nextDueDate) return false;
          const dueDate = new Date(v.nextDueDate);
          return dueDate >= now && dueDate <= in30Days;
        });

        // Filter active withdrawals
        const activeWithdrawals = treatments.filter((t) => {
          if (!t.withdrawalEndDate) return false;
          return new Date(t.withdrawalEndDate) > now;
        });

        setData({
          stats,
          weightStats,
          herdEvolution,
          upcomingVaccinations,
          activeWithdrawals,
          lots,
        });
      } catch (err) {
        logger.error('Error fetching dashboard data', { error: err });
        setError(t('loadError'));
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            {t('retry')}
          </Button>
        </div>
      </div>
    );
  }

  // Empty state - no animals
  if (data?.stats.totalAnimals === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={<EmptyStateIllustration />}
          title={t('welcome')}
          description={t('welcomeDescription')}
          action={{
            label: t('registerFirstAnimal'),
            onClick: () => router.push('/animals?action=new'),
          }}
          secondaryAction={{
            label: t('importFromExcel'),
            onClick: () => router.push('/animals?action=import'),
            icon: FileSpreadsheet,
          }}
        />
      </div>
    );
  }

  const { stats, weightStats, herdEvolution, upcomingVaccinations, activeWithdrawals, lots } = data!;

  // Calculate mortality rate
  const mortalityRate = stats.totalAnimals > 0
    ? ((stats.deaths.count / (stats.totalAnimals + stats.deaths.count)) * 100).toFixed(1)
    : '0';

  // Prepare chart data
  const chartData = herdEvolution.data.map((point) => ({
    date: new Date(point.date).toLocaleDateString('fr-FR', { month: 'short' }),
    count: point.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('overview')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Total Animals */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Beef className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold">{stats.totalAnimals}</p>
                <p className="text-sm font-medium">{t('kpis.totalAnimals')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Births */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold">{stats.births.count}</p>
                <p className="text-sm font-medium">{t('kpis.births')}</p>
                <p className="text-xs text-muted-foreground">{t('kpis.thisMonth')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deaths */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900">
                <Skull className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold">{stats.deaths.count}</p>
                <p className="text-sm font-medium">{t('kpis.deaths')}</p>
                <p className="text-xs text-muted-foreground">{mortalityRate}% {t('kpis.mortality')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GMQ */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${
                (weightStats?.growth?.avgDailyGain ?? 0) >= 0
                  ? 'bg-green-100 dark:bg-green-900'
                  : 'bg-red-100 dark:bg-red-900'
              }`}>
                {(weightStats?.growth?.avgDailyGain ?? 0) >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-3xl font-bold ${
                  (weightStats?.growth?.avgDailyGain ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {weightStats?.growth?.avgDailyGain?.toFixed(2) ?? '-'} kg/j
                </p>
                <p className="text-sm font-medium">{t('kpis.avgDailyGain')}</p>
                <p className="text-xs text-muted-foreground">
                  {weightStats?.growth?.animalsWithGain ?? 0} {t('kpis.animals')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vaccinations */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Syringe className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold">{upcomingVaccinations.length}</p>
                <p className="text-sm font-medium">{t('kpis.vaccinations')}</p>
                <p className="text-xs text-muted-foreground">{t('kpis.upcomingDays')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Required + Herd Evolution */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Actions Required */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('actions.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Active Withdrawals */}
            {activeWithdrawals.length > 0 && (
              <div
                className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors"
                onClick={() => router.push('/treatments?filter=withdrawal')}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">{t('actions.withdrawals')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('actions.withdrawalsDesc', { count: activeWithdrawals.length })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    {activeWithdrawals.length}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Upcoming Vaccinations */}
            {upcomingVaccinations.length > 0 && (
              <div
                className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                onClick={() => router.push('/treatments?type=vaccination')}
              >
                <div className="flex items-center gap-3">
                  <Syringe className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">{t('actions.vaccinationsDue')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('actions.vaccinationsDueDesc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {upcomingVaccinations.length}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Weighings Stats */}
            {weightStats && (
              <div
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => router.push('/weighings')}
              >
                <div className="flex items-center gap-3">
                  <Scale className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{t('actions.weighingsThisMonth')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('actions.weighingsRegistered', { count: weightStats.periodWeighings })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {t('actions.totalWeighings', { count: weightStats.totalWeighings })}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Active Lots */}
            {lots.length > 0 && (
              <div
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => router.push('/lots')}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{t('actions.activeLots')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('actions.activeLotsDesc', { count: lots.length })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* No actions */}
            {activeWithdrawals.length === 0 &&
              upcomingVaccinations.length === 0 &&
              !weightStats &&
              lots.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">{t('actions.noActions')}</p>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Herd Evolution Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('chart.evolution')}</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                    formatter={(value: number) => [`${value} ${t('chart.animals')}`, t('chart.herd')]}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <p className="text-sm">{t('chart.noData')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weight Stats Details */}
      {weightStats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="h-5 w-5" />
              {t('growth.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{weightStats.weights?.avg?.toFixed(1) ?? '-'} kg</p>
                <p className="text-sm text-muted-foreground">{t('growth.avgWeight')}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{weightStats.weights?.min?.toFixed(1) ?? '-'} kg</p>
                <p className="text-sm text-muted-foreground">{t('growth.minWeight')}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{weightStats.weights?.max?.toFixed(1) ?? '-'} kg</p>
                <p className="text-sm text-muted-foreground">{t('growth.maxWeight')}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{weightStats.uniqueAnimals}</p>
                <p className="text-sm text-muted-foreground">{t('growth.animalsWeighed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('quickActions.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push('/animals?action=new')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('quickActions.newAnimal')}
            </Button>
            <Button variant="outline" onClick={() => router.push('/weighings')}>
              <Scale className="h-4 w-4 mr-2" />
              {t('quickActions.newWeighing')}
            </Button>
            <Button variant="outline" onClick={() => router.push('/treatments?action=new')}>
              <Syringe className="h-4 w-4 mr-2" />
              {t('quickActions.newTreatment')}
            </Button>
            <Button variant="outline" onClick={() => router.push('/lots')}>
              <Calendar className="h-4 w-4 mr-2" />
              {t('quickActions.manageLots')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
