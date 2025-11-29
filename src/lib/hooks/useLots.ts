import { useState, useEffect, useCallback } from 'react';
import { lotsService, CreateLotDto, UpdateLotDto } from '@/lib/services/lots.service';
import { Lot, LotFilters, LotAnimal } from '@/lib/types/lot';
import { logger } from '@/lib/utils/logger';

export function useLots(filters?: Partial<LotFilters>) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await lotsService.getAll(filters);
      setLots(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch lots');
      setError(error);
      logger.error('Error fetching lots', { error: err });
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.type, filters?.status, filters?.completed]);

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

  return {
    lots,
    loading,
    error,
    refresh: fetchLots,
    createLot,
    updateLot,
    deleteLot,
    addAnimal,
    removeAnimal,
  };
}

export function useLot(id: string) {
  const [lot, setLot] = useState<Lot | null>(null);
  const [animals, setAnimals] = useState<LotAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLot = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [lotData, animalsData] = await Promise.all([
        lotsService.getById(id),
        lotsService.getLotAnimals(id),
      ]);
      setLot(lotData);
      setAnimals(animalsData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch lot');
      setError(error);
      logger.error('Error fetching lot', { error: err });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchLot();
    }
  }, [fetchLot, id]);

  return {
    lot,
    animals,
    loading,
    error,
    refresh: fetchLot,
  };
}
