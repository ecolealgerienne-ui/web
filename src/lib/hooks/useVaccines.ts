/**
 * Hook React pour la gestion des vaccins
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Vaccine, VaccineFilters, CreateVaccineDto } from '@/lib/types/vaccine';
import { vaccinesService } from '@/lib/services/vaccines.service';
import { logger } from '@/lib/utils/logger';

interface UseVaccinesResult {
  vaccines: Vaccine[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createVaccine: (data: CreateVaccineDto) => Promise<Vaccine>;
}

export function useVaccines(filters?: VaccineFilters): UseVaccinesResult {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Extraire les valeurs des filtres pour éviter les re-renders inutiles
  const filterSearch = filters?.search;
  const filterScope = filters?.scope;
  const filterTargetDisease = filters?.targetDisease;
  const filterIsActive = filters?.isActive;

  const memoizedFilters = useMemo(() => ({
    search: filterSearch,
    scope: filterScope,
    targetDisease: filterTargetDisease,
    isActive: filterIsActive,
  }), [filterSearch, filterScope, filterTargetDisease, filterIsActive]);

  const fetchVaccines = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await vaccinesService.getAll(memoizedFilters);
      setVaccines(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to fetch vaccines in hook', { error });
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  useEffect(() => {
    fetchVaccines();
  }, [fetchVaccines]);

  const createVaccine = useCallback(async (data: CreateVaccineDto): Promise<Vaccine> => {
    const newVaccine = await vaccinesService.create(data);
    setVaccines(prev => [...prev, newVaccine]);
    return newVaccine;
  }, []);

  return {
    vaccines,
    loading,
    error,
    refetch: fetchVaccines,
    createVaccine,
  };
}
