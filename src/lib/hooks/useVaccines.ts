/**
 * Hook React pour la gestion des vaccins (READ ONLY)
 */

import { useState, useEffect, useCallback } from 'react';
import { Vaccine } from '@/lib/types/vaccine';
import { vaccinesService } from '@/lib/services/vaccines.service';
import { useToast } from '@/contexts/toast-context';
import { useCommonTranslations } from '@/lib/i18n';
import { logger } from '@/lib/utils/logger';

interface UseVaccinesResult {
  vaccines: Vaccine[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useVaccines(): UseVaccinesResult {
  const toast = useToast();
  const tc = useCommonTranslations();
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVaccines = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await vaccinesService.getAll();
      setVaccines(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to fetch vaccines in hook', { error });
      toast.error(tc('messages.error'), tc('messages.loadError') || 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
