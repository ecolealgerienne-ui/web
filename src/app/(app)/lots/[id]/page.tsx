'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Package,
  Edit,
  TrendingUp,
  TrendingDown,
  Users,
  Scale,
  Target,
  Calendar,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useLot } from '@/lib/hooks/useLots';
import { dashboardService, WeightTrendsResponse } from '@/lib/services/dashboard.service';
import { LotTimeline } from '@/components/lots/LotTimeline';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/utils/logger';

// GMQ status colors
const gmqStatusColors: Record<string, { bg: string; text: string; badge: string }> = {
  excellent: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600', badge: 'bg-green-500' },
  good: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-600', badge: 'bg-blue-500' },
  warning: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-600', badge: 'bg-orange-500' },
  critical: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-600', badge: 'bg-red-500' },
};

export default function LotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lotId = params.id as string;
  const t = useTranslations('lots');
  const tc = useCommonTranslations();

  // Hook now includes stats and events
  const { lot, animals, stats, events, loading, error } = useLot(lotId);
  const [weightTrends, setWeightTrends] = useState<WeightTrendsResponse | null>(null);

  // Fetch weight trends for chart
  useEffect(() => {
    async function fetchTrends() {
      if (!lotId) return;
      try {
        const trendsData = await dashboardService.getWeightTrends({
          lotId,
          period: '6months',
          groupBy: 'week',
        });
        setWeightTrends(trendsData);
      } catch (err) {
        logger.warn('Error fetching weight trends', { error: err });
      }
    }
    fetchTrends();
  }, [lotId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !lot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">{t('detail.notFound')}</p>
        <Button variant="outline" onClick={() => router.push('/lots')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('detail.backToList')}
        </Button>
      </div>
    );
  }

  // Prepare chart data
  const chartData = weightTrends?.dataPoints?.map((point) => ({
    date: point.date,
    weight: point.avgWeight,
    gmq: point.avgDailyGain,
  })) || [];

  // Get GMQ status
  const gmqStatus = stats?.growth.status || 'good';
  const statusColors = gmqStatusColors[gmqStatus];

  // Calculate progress
  const progress = stats?.weights.targetWeight
    ? Math.min(100, (stats.weights.avgWeight / stats.weights.targetWeight) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/lots')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-2xl font-bold">{lot.name}</h1>
              <Badge variant={lot.status === 'open' ? 'success' : 'secondary'}>
                {t(`status.${lot.status}`)}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {t(`type.${lot.type}`)} · {tc('fields.createdAt')}: {lot.createdAt ? new Date(lot.createdAt).toLocaleDateString('fr-FR') : '-'}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push(`/lots?edit=${lot.id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          {t('detail.actions.edit')}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{animals.length}</p>
                <p className="text-xs text-muted-foreground">{t('detail.kpis.animals')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Scale className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats?.weights.avgWeight?.toFixed(0) || '-'} kg
                </p>
                <p className="text-xs text-muted-foreground">{t('detail.kpis.avgWeight')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', statusColors?.bg)}>
                {gmqStatus === 'excellent' || gmqStatus === 'good' ? (
                  <TrendingUp className={cn('h-5 w-5', statusColors?.text)} />
                ) : (
                  <TrendingDown className={cn('h-5 w-5', statusColors?.text)} />
                )}
              </div>
              <div>
                <p className={cn('text-2xl font-bold', statusColors?.text)}>
                  {stats?.growth.avgDailyGain?.toFixed(2) || '-'} kg/j
                </p>
                <p className="text-xs text-muted-foreground">{t('detail.kpis.gmq')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{progress.toFixed(0)}%</p>
                </div>
                <p className="text-xs text-muted-foreground">{t('detail.kpis.progress')}</p>
                {stats?.weights.targetWeight && (
                  <Progress value={progress} className="h-1.5 mt-1" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats?.predictions.estimatedDaysToTarget || '-'}
                  {stats?.predictions.estimatedDaysToTarget && 'j'}
                </p>
                <p className="text-xs text-muted-foreground">{t('detail.kpis.daysToTarget')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Animals Table */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weight Evolution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('detail.weightEvolution')}</CardTitle>
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
                    formatter={(value: number) => [`${value.toFixed(1)} kg`, t('detail.chart.weight')]}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <div className="text-center">
                  <Scale className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('detail.noWeightData')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description & Notes */}
        {(lot.description || lot.notes) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tc('fields.description')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lot.description && (
                <div>
                  <p className="text-sm text-muted-foreground">{tc('fields.description')}</p>
                  <p className="text-sm mt-1">{lot.description}</p>
                </div>
              )}
              {lot.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('fields.notes')}</p>
                  <p className="text-sm mt-1">{lot.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Animals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {t('detail.animalsInLot')} ({animals.length})
            </CardTitle>
            <Button variant="outline" size="sm">
              {t('detail.addAnimal')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {animals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('detail.table.animal')}</TableHead>
                  <TableHead>{t('fields.type')}</TableHead>
                  <TableHead>{t('detail.table.status')}</TableHead>
                  <TableHead className="text-right">{tc('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animals.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium font-mono">
                          {animal.officialNumber || animal.visualId || animal.id}
                        </p>
                        {animal.visualId && animal.officialNumber && (
                          <p className="text-xs text-muted-foreground">{animal.visualId}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {animal.species?.nameFr || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={animal.status === 'alive' ? 'success' : 'secondary'}>
                        {animal.sex === 'male' ? 'M' : animal.sex === 'female' ? 'F' : '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/animals?search=${animal.officialNumber || animal.id}`)}
                      >
                        {tc('actions.view')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('messages.noAnimalsInLot')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      {events.length > 0 && (
        <LotTimeline events={events} />
      )}
    </div>
  );
}
