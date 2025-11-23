import { useState, useEffect } from 'react';
import { dashboardService, type DashboardStats, type Alert, type Activity } from '@/lib/services/dashboard.service';
import { logger } from '@/lib/utils/logger';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsData, alertsData, activitiesData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getAlerts(),
          dashboardService.getRecentActivities(),
        ]);

        setStats(statsData);
        setAlerts(alertsData);
        setActivities(activitiesData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch dashboard data');
        setError(error);
        logger.error('Error fetching dashboard data', err);
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
    loading,
    error,
  };
}
