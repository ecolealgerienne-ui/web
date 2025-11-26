import { useState, useEffect, useCallback } from 'react';
import { dashboardService, type DashboardStats, type Alert, type Activity, type HerdEvolution } from '@/lib/services/dashboard.service';
import { logger } from '@/lib/utils/logger';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [herdEvolution, setHerdEvolution] = useState<HerdEvolution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHerdEvolution = useCallback(async (period?: string) => {
    try {
      const data = await dashboardService.getHerdEvolution(period);
      setHerdEvolution(data);
    } catch (err) {
      logger.error('Error fetching herd evolution', { error: err });
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsData, alertsData, activitiesData, herdEvolutionData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getAlerts(),
          dashboardService.getRecentActivities(),
          dashboardService.getHerdEvolution('6months'),
        ]);

        setStats(statsData);
        setAlerts(alertsData);
        setActivities(activitiesData);
        setHerdEvolution(herdEvolutionData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch dashboard data');
        setError(error);
        logger.error('Error fetching dashboard data', { error: err });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    stats,
    alerts,
    activities,
    herdEvolution,
    loading,
    error,
    fetchHerdEvolution,
  };
}
