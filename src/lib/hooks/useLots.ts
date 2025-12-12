import { useState, useEffect, useCallback, useMemo } from 'react';
import { lotsService, CreateLotDto, UpdateLotDto } from '@/lib/services/lots.service';
import {
  dashboardService,
  LotStats,
  LotsStatsResponse,
  LotDetailStats,
  LotEvent,
  LotEventsResponse,
} from '@/lib/services/dashboard.service';
import { Lot, LotFilters, LotAnimal } from '@/lib/types/lot';
import { logger } from '@/lib/utils/logger';

export function useLots(filters?: Partial<LotFilters>, options?: { includeStats?: boolean }) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [lotsStats, setLotsStats] = useState<LotStats[]>([]);
  const [statsSummary, setStatsSummary] = useState<LotsStatsResponse['summary'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Extraire les valeurs des filtres pour éviter les re-renders inutiles
  const filterSearch = filters?.search;
  const filterType = filters?.type;
  const filterStatus = filters?.status;
  const filterIsActive = filters?.isActive;
  const includeStats = options?.includeStats ?? false;

  const memoizedFilters = useMemo(() => ({
    search: filterSearch,
    type: filterType,
    status: filterStatus,
    isActive: filterIsActive,
  }), [filterSearch, filterType, filterStatus, filterIsActive]);

  const fetchLots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch lots and optionally stats in parallel
      if (includeStats) {
        const [lotsData, statsData] = await Promise.all([
          lotsService.getAll(memoizedFilters),
          dashboardService.getLotsStats({
            isActive: filterIsActive,
            type: filterType !== 'all' ? filterType : undefined,
          }).catch((err) => {
            logger.warn('Failed to fetch lots stats', { error: err });
            return { lots: [], summary: { totalLots: 0, totalAnimals: 0, overallAvgDailyGain: 0 } };
          }),
        ]);
        setLots(lotsData);
        setLotsStats(statsData.lots);
        setStatsSummary(statsData.summary);
      } else {
        const lotsData = await lotsService.getAll(memoizedFilters);
        setLots(lotsData);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch lots');
      setError(error);
      logger.error('Error fetching lots', { error: err });
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters, includeStats, filterIsActive, filterType]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  const createLot = async (data: CreateLotDto): Promise<Lot> => {
    const newLot = await lotsService.create(data);
    await fetchLots(); // Refresh list
    return newLot;
  };

  const updateLot = async (id: string, data: UpdateLotDto): Promise<Lot> => {
    const updatedLot = await lotsService.update(id, data);
    await fetchLots(); // Refresh list
    return updatedLot;
  };

  const deleteLot = async (id: string): Promise<void> => {
    await lotsService.delete(id);
    await fetchLots(); // Refresh list
  };

  const addAnimal = async (lotId: string, animalId: string): Promise<void> => {
    await lotsService.addAnimal(lotId, animalId);
    await fetchLots(); // Refresh list
  };

  const removeAnimal = async (lotId: string, animalId: string): Promise<void> => {
    await lotsService.removeAnimal(lotId, animalId);
    await fetchLots(); // Refresh list
  };

  // Helper to get stats for a specific lot
  const getStatsForLot = useCallback((lotId: string): LotStats | undefined => {
    return lotsStats.find((s) => s.lotId === lotId);
  }, [lotsStats]);

  return {
    lots,
    lotsStats,
    statsSummary,
    loading,
    error,
    refresh: fetchLots,
    createLot,
    updateLot,
    deleteLot,
    addAnimal,
    removeAnimal,
    getStatsForLot,
  };
}

export function useLot(id: string, options?: { includeStats?: boolean; includeEvents?: boolean }) {
  const [lot, setLot] = useState<Lot | null>(null);
  const [animals, setAnimals] = useState<LotAnimal[]>([]);
  const [stats, setStats] = useState<LotDetailStats | null>(null);
  const [events, setEvents] = useState<LotEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const includeStats = options?.includeStats ?? true;
  const includeEvents = options?.includeEvents ?? true;

  const fetchLot = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build list of promises based on options
      const promises: Promise<any>[] = [
        lotsService.getById(id),
        lotsService.getLotAnimals(id),
      ];

      if (includeStats) {
        promises.push(
          dashboardService.getLotDetailStats(id).catch((err) => {
            logger.warn('Failed to fetch lot stats', { error: err, lotId: id });
            return null;
          })
        );
      }

      if (includeEvents) {
        promises.push(
          dashboardService.getLotEvents(id, { limit: 50 }).catch((err) => {
            logger.warn('Failed to fetch lot events', { error: err, lotId: id });
            return { events: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } };
          })
        );
      }

      const results = await Promise.all(promises);

      setLot(results[0]);
      setAnimals(results[1] || []);

      if (includeStats && results[2]) {
        setStats(results[2]);
      }

      if (includeEvents && results[includeStats ? 3 : 2]) {
        const eventsResult = results[includeStats ? 3 : 2] as LotEventsResponse;
        setEvents(eventsResult.events || []);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch lot');
      setError(error);
      logger.error('Error fetching lot', { error: err });
    } finally {
      setLoading(false);
    }
  }, [id, includeStats, includeEvents]);

  useEffect(() => {
    if (id) {
      fetchLot();
    }
  }, [fetchLot, id]);

  return {
    lot,
    animals,
    stats,
    events,
    loading,
    error,
    refresh: fetchLot,
  };
}
