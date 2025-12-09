/**
 * Hook React pour la gestion des lots
 * Conforme aux normes DEVELOPMENT_STANDARDS.md (règle 7.7)
 */

import { useState, useEffect, useCallback } from 'react';
import { lotsService, LotFilterParams, CreateLotDto, UpdateLotDto } from '@/lib/services/lots.service';
import { Lot, LotAnimal } from '@/lib/types/lot';
import { logger } from '@/lib/utils/logger';

interface UseLotsResult {
  lots: Lot[];
  total: number;
  loading: boolean;
  error: Error | null;
  params: LotFilterParams;
  setParams: React.Dispatch<React.SetStateAction<LotFilterParams>>;
  refetch: () => Promise<void>;
  createLot: (data: CreateLotDto) => Promise<Lot>;
  updateLot: (id: string, data: UpdateLotDto) => Promise<Lot>;
  deleteLot: (id: string) => Promise<void>;
  addAnimal: (lotId: string, animalId: string) => Promise<void>;
  removeAnimal: (lotId: string, animalId: string) => Promise<void>;
}

const DEFAULT_PARAMS: LotFilterParams = {
  page: 1,
  limit: 25,
  includeStats: true, // Par défaut, inclure les stats pour afficher GMQ, poids, etc.
};

export function useLots(initialParams?: Partial<LotFilterParams>): UseLotsResult {
  const [lots, setLots] = useState<Lot[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<LotFilterParams>({
    ...DEFAULT_PARAMS,
    ...initialParams,
  });

  const fetchLots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await lotsService.getAll(params);
      setLots(response.data);
      setTotal(response.meta.total);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch lots');
      setError(error);
      logger.error('Error fetching lots', { error: err });
    } finally {
      setLoading(false);
    }
  }, [params]);

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
    total,
    loading,
    error,
    params,
    setParams,
    refetch: fetchLots,
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
