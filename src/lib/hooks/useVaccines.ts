/**
 * Hook React pour la gestion des vaccins (catalogue)
 */

import { useState, useEffect, useCallback } from 'react';
import { Vaccine, VaccineFilters } from '@/lib/services/vaccines.service';
import { vaccinesService } from '@/lib/services/vaccines.service';
import { logger } from '@/lib/utils/logger';

interface UseVaccinesResult {
  vaccines: Vaccine[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useVaccines(filters?: Partial<VaccineFilters>): UseVaccinesResult {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVaccines = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await vaccinesService.getAll(filters);
      setVaccines(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to fetch vaccines in hook', { error });
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.isActive]);

  useEffect(() => {
    fetchVaccines();
  }, [fetchVaccines]);

  return {
    vaccines,
    loading,
    error,
    refetch: fetchVaccines,
  };
}
