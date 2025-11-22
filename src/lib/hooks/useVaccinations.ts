import { useState, useEffect, useCallback } from 'react';
import { vaccinationsService } from '@/lib/services/vaccinations.service';
import type { Vaccination, CreateVaccinationDto, UpdateVaccinationDto, VaccinationFilters } from '@/lib/types/vaccination';
import { logger } from '@/lib/utils/logger';

interface UseVaccinationsResult {
  vaccinations: Vaccination[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createVaccination: (data: CreateVaccinationDto) => Promise<Vaccination>;
  updateVaccination: (id: string, data: UpdateVaccinationDto) => Promise<Vaccination>;
  deleteVaccination: (id: string) => Promise<void>;
}

export function useVaccinations(filters?: Partial<VaccinationFilters>): UseVaccinationsResult {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVaccinations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vaccinationsService.getAll(filters);
      setVaccinations(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch vaccinations');
      setError(error);
      logger.error('Error fetching vaccinations', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVaccinations();
  }, [fetchVaccinations]);

  const createVaccination = useCallback(async (data: CreateVaccinationDto) => {
    const vaccination = await vaccinationsService.create(data);
    await fetchVaccinations();
    return vaccination;
  }, [fetchVaccinations]);

  const updateVaccination = useCallback(async (id: string, data: UpdateVaccinationDto) => {
    const vaccination = await vaccinationsService.update(id, data);
    await fetchVaccinations();
    return vaccination;
  }, [fetchVaccinations]);

  const deleteVaccination = useCallback(async (id: string) => {
    await vaccinationsService.delete(id);
    await fetchVaccinations();
  }, [fetchVaccinations]);

  return {
    vaccinations,
    loading,
    error,
    refresh: fetchVaccinations,
    createVaccination,
    updateVaccination,
    deleteVaccination,
  };
}
