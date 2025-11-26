/**
 * Hook React pour la gestion des vaccinations
 */

import { useState, useEffect, useCallback } from 'react';
import { Vaccination, VaccinationFilters } from '@/lib/types/vaccination';
import { vaccinationsService } from '@/lib/services/vaccinations.service';
import { logger } from '@/lib/utils/logger';

interface UseVaccinationsResult {
  vaccinations: Vaccination[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useVaccinations(
  filters?: Partial<VaccinationFilters> & { animalId?: string }
): UseVaccinationsResult {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVaccinations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await vaccinationsService.getAll(filters);
      setVaccinations(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to fetch vaccinations in hook', { error });
    } finally {
      setLoading(false);
    }
  }, [
    filters?.animalId,
    filters?.status,
    filters?.dateFrom,
    filters?.dateTo,
    filters?.search,
    filters?.targetType,
  ]);

  useEffect(() => {
    fetchVaccinations();
  }, [fetchVaccinations]);

  return {
    vaccinations,
    loading,
    error,
    refetch: fetchVaccinations,
  };
}
