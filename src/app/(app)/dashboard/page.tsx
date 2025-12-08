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
  Activity,
  Target,
  Users,
  Award,
  AlertCircle,
  CheckCircle,
  Info,
  DollarSign,
  Heart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState, EmptyStateIllustration } from '@/components/ui/empty-state';
import { useTranslations } from '@/lib/i18n';
import {
  dashboardService,
  type DashboardStatsV2,
  type DashboardActionsResponse,
  type LotsStatsResponse,
  type WeightRankingsResponse,
  type WeightTrendsResponse,
  type ActionItem,
  type GmqStatus,
  GMQ_THRESHOLDS,
} from '@/lib/services/dashboard.service';
import { logger } from '@/lib/utils/logger';
import { cn } from '@/lib/utils';

interface DashboardData {
  stats: DashboardStatsV2;
  actions: DashboardActionsResponse;
  lotsStats: LotsStatsResponse;
  rankings: WeightRankingsResponse;
  trends: WeightTrendsResponse;
}

// GMQ status color mapping
const gmqStatusColors: Record<GmqStatus, { bg: string; text: string; badge: string }> = {
  excellent: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-500',
  },
  good: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500',
  },
  warning: {
    bg: 'bg-orange-100 dark:bg-orange-900',
    text: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-500',
  },
  critical: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-500',
  },
};

// Action priority colors
const priorityColors: Record<string, { bg: string; border: string; icon: typeof AlertTriangle }> = {
  critical: { bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-800', icon: AlertCircle },
  high: { bg: 'bg-orange-50 dark:bg-orange-950', border: 'border-orange-200 dark:border-orange-800', icon: AlertTriangle },
  medium: { bg: 'bg-yellow-50 dark:bg-yellow-950', border: 'border-yellow-200 dark:border-yellow-800', icon: Clock },
  low: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800', icon: Info },
  success: { bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-800', icon: CheckCircle },
};

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

        // Fetch all Phase 2 data in parallel with fallbacks
        const [stats, actions, lotsStats, rankings, trends] = await Promise.all([
          dashboardService.getStatsV2().catch((err) => {
            logger.warn('Failed to fetch Phase 2 stats, will fallback', { error: err });
            return null;
          }),
          dashboardService.getActions().catch(() => null),
          dashboardService.getLotsStats({ isActive: true }).catch(() => null),
          dashboardService.getWeightRankings({ limit: 5, period: '30d' }).catch(() => null),
          dashboardService.getWeightTrends({ period: '6months', groupBy: 'month' }).catch(() => null),
        ]);

        // If Phase 2 stats failed, fallback to Phase 1 stats for basic data
        let fallbackTotalAnimals = 0;
        if (!stats || !stats.herd || stats.herd.totalAnimals === undefined) {
          try {
            const phase1Stats = await dashboardService.getStats();
            fallbackTotalAnimals = phase1Stats.totalAnimals || 0;
            logger.info('Using Phase 1 stats fallback', { totalAnimals: fallbackTotalAnimals });
          } catch (e) {
            logger.warn('Phase 1 stats fallback also failed', { error: e });
          }
        }

        // Default values for missing data
        const defaultStats: DashboardStatsV2 = {
          herd: { totalAnimals: fallbackTotalAnimals, byStatus: {}, bySex: {}, changeThisMonth: 0, changePercentage: 0 },
          movements: {
            thisMonth: { births: 0, deaths: 0, sales: 0, purchases: 0 },
            previousMonth: { births: 0, deaths: 0, sales: 0, purchases: 0 },
          },
          weights: { avgDailyGain: 0, avgDailyGainTrend: 'stable', avgDailyGainChange: 0, avgWeight: 0, totalWeighings: 0, weighingsThisMonth: 0 },
          health: { vaccinationsUpToDate: 0, vaccinationsUpToDatePercentage: 0, vaccinationsDueThisWeek: 0, activeWithdrawals: 0, treatmentsThisMonth: 0, treatmentsCost: 0 },
          mortality: { rate: 0, rateStatus: 'good', threshold: 5 },
          alerts: { urgent: 0, warning: 0, info: 0 },
          lastUpdated: new Date().toISOString(),
        };

        const defaultActions: DashboardActionsResponse = {
          summary: { urgent: 0, thisWeek: 0, planned: 0, opportunities: 0 },
          urgent: [],
          thisWeek: [],
          planned: [],
          opportunities: [],
        };

        const defaultLotsStats: LotsStatsResponse = {
          lots: [],
          summary: { totalLots: 0, totalAnimals: 0, overallAvgDailyGain: 0 },
        };

        const defaultRankings: WeightRankingsResponse = {
          period: '30d',
          calculatedAt: new Date().toISOString(),
          top: [],
          bottom: [],
          thresholds: GMQ_THRESHOLDS,
        };

        const defaultTrends: WeightTrendsResponse = {
          period: '6months',
          groupBy: 'month',
          startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          dataPoints: [],
          summary: { overallAvgDailyGain: 0, trend: 'stable', trendPercentage: 0 },
          benchmarks: { farmTarget: null, nationalAverage: null },
        };

        // Merge with defaults to ensure all properties exist
        const mergedStats = stats ? {
          ...defaultStats,
          ...stats,
          herd: { ...defaultStats.herd, ...(stats.herd || {}) },
          movements: {
            thisMonth: { ...defaultStats.movements.thisMonth, ...(stats.movements?.thisMonth || {}) },
            previousMonth: { ...defaultStats.movements.previousMonth, ...(stats.movements?.previousMonth || {}) },
          },
          weights: { ...defaultStats.weights, ...(stats.weights || {}) },
          health: { ...defaultStats.health, ...(stats.health || {}) },
          mortality: { ...defaultStats.mortality, ...(stats.mortality || {}) },
          alerts: { ...defaultStats.alerts, ...(stats.alerts || {}) },
        } : defaultStats;

        setData({
          stats: mergedStats,
          actions: actions || defaultActions,
          lotsStats: lotsStats || defaultLotsStats,
          rankings: rankings || defaultRankings,
          trends: trends || defaultTrends,
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
  if (data?.stats.herd.totalAnimals === 0) {
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

  const { stats, actions, lotsStats, rankings, trends } = data!;

  // Prepare GMQ trend chart data (with defensive check)
  // Filter out invalid GMQ values (negative or extreme values are likely calculation errors)
  // Valid GMQ for cattle is typically between 0 and 2 kg/day
  const trendChartData = (trends?.dataPoints || [])
    .map((point) => {
      // Only keep reasonable positive GMQ values (0 to 3 kg/j for cattle)
      // Negative or extreme values indicate backend calculation errors
      const isValidGmq = point.avgDailyGain >= 0 && point.avgDailyGain <= 3;
      return {
        date: point.date,
        gmq: isValidGmq ? point.avgDailyGain : null,
        weight: point.avgWeight,
        animals: point.animalCount,
      };
    })
    .filter((point) => point.gmq !== null);

  // Check if we have valid data to display
  const hasValidGmqData = trendChartData.length > 0 && trendChartData.some(d => d.gmq !== null && d.gmq > 0);

  // Check if the main GMQ stat is valid (not negative, not near zero)
  const isMainGmqValid = stats.weights.avgDailyGain > 0.01 && stats.weights.avgDailyGain <= 3;

  // Total actions count (with defensive check)
  const totalActions = (actions?.summary?.urgent || 0) + (actions?.summary?.thisWeek || 0) + (actions?.summary?.planned || 0);

  // Render action item
  const renderActionItem = (action: ActionItem) => {
    const colors = priorityColors[action.priority] || priorityColors.low;
    const Icon = colors.icon;

    return (
      <div
        key={action.id}
        className={cn(
          'flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all',
          colors.bg,
          colors.border
        )}
        onClick={() => router.push(action.actionUrl)}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">{action.title}</p>
            <p className="text-xs text-muted-foreground">{action.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{action.count}</Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('overview')}</p>
        </div>
        {stats.lastUpdated && (
          <p className="text-xs text-muted-foreground">
            {t('lastUpdated')}: {new Date(stats.lastUpdated).toLocaleString('fr-FR')}
          </p>
        )}
      </div>

      {/* KPI Cards - Row 1: Herd & Movements */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Total Animals */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Beef className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold">{stats.herd.totalAnimals}</p>
                <p className="text-sm font-medium">{t('kpis.totalAnimals')}</p>
                {stats.herd.changeThisMonth !== 0 && (
                  <p className={cn(
                    'text-xs flex items-center gap-1',
                    stats.herd.changeThisMonth > 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {stats.herd.changeThisMonth > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stats.herd.changeThisMonth > 0 ? '+' : ''}{stats.herd.changeThisMonth} ({stats.herd.changePercentage.toFixed(1)}%)
                  </p>
                )}
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
                <p className="text-3xl font-bold">{stats.movements.thisMonth.births}</p>
                <p className="text-sm font-medium">{t('kpis.births')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('kpis.thisMonth')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mortality */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                'p-3 rounded-lg',
                stats.mortality.rateStatus === 'good' ? 'bg-green-100 dark:bg-green-900' :
                stats.mortality.rateStatus === 'warning' ? 'bg-orange-100 dark:bg-orange-900' :
                'bg-red-100 dark:bg-red-900'
              )}>
                <Skull className={cn(
                  'h-6 w-6',
                  stats.mortality.rateStatus === 'good' ? 'text-green-600' :
                  stats.mortality.rateStatus === 'warning' ? 'text-orange-600' :
                  'text-red-600'
                )} />
              </div>
              <div className="flex-1">
                <p className={cn(
                  'text-3xl font-bold',
                  stats.mortality.rateStatus === 'good' ? 'text-green-600' :
                  stats.mortality.rateStatus === 'warning' ? 'text-orange-600' :
                  'text-red-600'
                )}>
                  {stats.mortality.rate.toFixed(1)}%
                </p>
                <p className="text-sm font-medium">{t('kpis.mortalityRate')}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.herd.byStatus?.dead || 0} {t('kpis.totalDeaths')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GMQ */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                'p-3 rounded-lg',
                !isMainGmqValid ? 'bg-muted' :
                stats.weights.avgDailyGainTrend === 'up' ? 'bg-green-100 dark:bg-green-900' :
                stats.weights.avgDailyGainTrend === 'down' ? 'bg-red-100 dark:bg-red-900' :
                'bg-muted'
              )}>
                {!isMainGmqValid ? (
                  <Activity className="h-6 w-6 text-muted-foreground" />
                ) : stats.weights.avgDailyGainTrend === 'up' ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : stats.weights.avgDailyGainTrend === 'down' ? (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                ) : (
                  <Activity className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                {isMainGmqValid ? (
                  <p className={cn(
                    'text-3xl font-bold',
                    dashboardService.getGmqStatus(stats.weights.avgDailyGain) === 'excellent' ? 'text-green-600' :
                    dashboardService.getGmqStatus(stats.weights.avgDailyGain) === 'good' ? 'text-blue-600' :
                    dashboardService.getGmqStatus(stats.weights.avgDailyGain) === 'warning' ? 'text-orange-600' :
                    'text-red-600'
                  )}>
                    {stats.weights.avgDailyGain.toFixed(2)} kg/j
                  </p>
                ) : (
                  <p className="text-3xl font-bold text-muted-foreground">--</p>
                )}
                <p className="text-sm font-medium">{t('kpis.avgDailyGain')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('kpis.avgWeight')}: {stats.weights.avgWeight.toFixed(0)} kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health - Vaccinations */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                'p-3 rounded-lg',
                stats.health.vaccinationsUpToDatePercentage >= 90 ? 'bg-green-100 dark:bg-green-900' :
                stats.health.vaccinationsUpToDatePercentage >= 70 ? 'bg-orange-100 dark:bg-orange-900' :
                'bg-red-100 dark:bg-red-900'
              )}>
                <Syringe className={cn(
                  'h-6 w-6',
                  stats.health.vaccinationsUpToDatePercentage >= 90 ? 'text-green-600' :
                  stats.health.vaccinationsUpToDatePercentage >= 70 ? 'text-orange-600' :
                  'text-red-600'
                )} />
              </div>
              <div className="flex-1">
                <p className={cn(
                  'text-3xl font-bold',
                  stats.health.vaccinationsUpToDatePercentage >= 90 ? 'text-green-600' :
                  stats.health.vaccinationsUpToDatePercentage >= 70 ? 'text-orange-600' :
                  'text-red-600'
                )}>
                  {stats.health.vaccinationsUpToDatePercentage.toFixed(0)}%
                </p>
                <p className="text-sm font-medium">{t('kpis.vaccinationCoverage')}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.health.activeWithdrawals > 0
                    ? `${stats.health.activeWithdrawals} ${t('kpis.activeWithdrawals')}`
                    : t('kpis.noWithdrawals')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Actions Center + GMQ Trends Chart */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Actions Center */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t('actions.title')}
              </CardTitle>
              {totalActions > 0 && (
                <Badge variant={actions.summary.urgent > 0 ? 'destructive' : 'secondary'}>
                  {totalActions}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Urgent Actions */}
            {(actions?.urgent?.length || 0) > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                  {t('actions.urgent')} ({actions?.summary?.urgent || 0})
                </p>
                {(actions?.urgent || []).slice(0, 2).map(renderActionItem)}
              </div>
            )}

            {/* This Week Actions */}
            {(actions?.thisWeek?.length || 0) > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                  {t('actions.thisWeek')} ({actions?.summary?.thisWeek || 0})
                </p>
                {(actions?.thisWeek || []).slice(0, 2).map(renderActionItem)}
              </div>
            )}

            {/* Opportunities */}
            {(actions?.opportunities?.length || 0) > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                  {t('actions.opportunities')} ({actions?.summary?.opportunities || 0})
                </p>
                {(actions?.opportunities || []).slice(0, 1).map(renderActionItem)}
              </div>
            )}

            {/* No actions */}
            {totalActions === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">{t('actions.noActions')}</p>
              </div>
            )}

            {/* View all link */}
            {totalActions > 5 && (
              <Button variant="ghost" className="w-full" onClick={() => router.push('/actions')}>
                {t('actions.viewAll')}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* GMQ Trends Chart */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t('trends.title')}</CardTitle>
                <CardDescription>{t('trends.subtitle')}</CardDescription>
              </div>
              {trends.summary && (
                <Badge variant={
                  trends.summary.trend === 'increasing' ? 'default' :
                  trends.summary.trend === 'decreasing' ? 'destructive' : 'secondary'
                }>
                  {trends.summary.trend === 'increasing' && <TrendingUp className="h-3 w-3 mr-1" />}
                  {trends.summary.trend === 'decreasing' && <TrendingDown className="h-3 w-3 mr-1" />}
                  {trends.summary.trendPercentage > 0 ? '+' : ''}{trends.summary.trendPercentage.toFixed(1)}%
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {trendChartData.length > 0 && hasValidGmqData ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    domain={[0, (dataMax: number) => Math.max(dataMax * 1.1, GMQ_THRESHOLDS.excellent)]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(2)} kg/j`,
                      t('trends.gmq'),
                    ]}
                    labelFormatter={(label) => label}
                  />
                  {/* Threshold lines */}
                  <ReferenceLine
                    y={GMQ_THRESHOLDS.good}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    label={{ value: t('trends.target'), position: 'right', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gmq"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <div className="text-center">
                  <Scale className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('chart.noData')}</p>
                  <p className="text-xs mt-1">{t('chart.noDataHint')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Lots Performance */}
      {(lotsStats?.lots?.length || 0) > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('lots.title')}
                </CardTitle>
                <CardDescription>
                  {lotsStats?.summary?.totalLots || 0} {t('lots.activeLots')} · {lotsStats?.summary?.totalAnimals || 0} {t('lots.animals')}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/lots')}>
                {t('lots.viewAll')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('lots.name')}</TableHead>
                  <TableHead className="text-center">{t('lots.animals')}</TableHead>
                  <TableHead className="text-center">{t('lots.avgWeight')}</TableHead>
                  <TableHead className="text-center">{t('lots.gmq')}</TableHead>
                  <TableHead className="text-center">{t('lots.progress')}</TableHead>
                  <TableHead className="text-center">{t('lots.daysToTarget')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(lotsStats?.lots || []).slice(0, 5).map((lot) => {
                  const gmqStatus = lot.growth.status;
                  const statusColors = gmqStatusColors[gmqStatus];
                  const progress = lot.weights.targetWeight
                    ? Math.min(100, (lot.weights.avgWeight / lot.weights.targetWeight) * 100)
                    : 0;

                  return (
                    <TableRow
                      key={lot.lotId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/lots/${lot.lotId}`)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{lot.name}</p>
                          <p className="text-xs text-muted-foreground">{lot.type}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{lot.animalCount}</TableCell>
                      <TableCell className="text-center">{lot.weights.avgWeight.toFixed(0)} kg</TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn('text-white', statusColors.badge)}>
                          {lot.growth.avgDailyGain.toFixed(2)} kg/j
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {lot.weights.targetWeight ? (
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-2 w-16" />
                            <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {lot.predictions.estimatedDaysToTarget ? (
                          <span className="text-sm">{lot.predictions.estimatedDaysToTarget}j</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Row 4: Top/Bottom Rankings */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Performers */}
        {(rankings?.top?.length || 0) > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                {t('rankings.topPerformers')}
              </CardTitle>
              <CardDescription>{t('rankings.topSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(rankings?.top || []).map((animal, index) => (
                  <div
                    key={animal.animalId}
                    className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                    onClick={() => router.push(`/animals/${animal.animalId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{animal.visualId || animal.officialNumber}</p>
                        <p className="text-xs text-muted-foreground">{animal.lotName || '-'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{animal.avgDailyGain.toFixed(2)} kg/j</p>
                      <p className="text-xs text-muted-foreground">+{animal.weightGain.toFixed(1)} kg</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom Performers (need attention) */}
        {(rankings?.bottom?.length || 0) > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                {t('rankings.needAttention')}
              </CardTitle>
              <CardDescription>{t('rankings.bottomSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(rankings?.bottom || []).map((animal, index) => (
                  <div
                    key={animal.animalId}
                    className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors"
                    onClick={() => router.push(`/animals/${animal.animalId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white font-bold text-sm">
                        {(rankings?.bottom?.length || 0) - index}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{animal.visualId || animal.officialNumber}</p>
                        <p className="text-xs text-muted-foreground">{animal.lotName || '-'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'text-lg font-bold',
                        animal.avgDailyGain < GMQ_THRESHOLDS.critical ? 'text-red-600' : 'text-orange-600'
                      )}>
                        {animal.avgDailyGain.toFixed(2)} kg/j
                      </p>
                      <p className="text-xs text-muted-foreground">+{animal.weightGain.toFixed(1)} kg</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Row 5: Health Summary + Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Health Summary */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5" />
              {t('health.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950">
                <p className="text-2xl font-bold text-green-600">{stats.health.vaccinationsUpToDatePercentage.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">{t('health.vaccinationsUpToDate')}</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950">
                <p className="text-2xl font-bold text-orange-600">{stats.health.activeWithdrawals}</p>
                <p className="text-sm text-muted-foreground">{t('health.activeWithdrawals')}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                <p className="text-2xl font-bold text-blue-600">{stats.health.treatmentsThisMonth}</p>
                <p className="text-sm text-muted-foreground">{t('health.treatmentsThisMonth')}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{stats.health.treatmentsCost.toLocaleString('fr-FR')} DA</p>
                <p className="text-sm text-muted-foreground">{t('health.treatmentsCost')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('quickActions.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start" onClick={() => router.push('/animals?action=new')}>
                <Plus className="h-4 w-4 mr-2" />
                {t('quickActions.newAnimal')}
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => router.push('/weighings')}>
                <Scale className="h-4 w-4 mr-2" />
                {t('quickActions.newWeighing')}
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => router.push('/treatments?action=new')}>
                <Syringe className="h-4 w-4 mr-2" />
                {t('quickActions.newTreatment')}
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => router.push('/lots')}>
                <Calendar className="h-4 w-4 mr-2" />
                {t('quickActions.manageLots')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
