import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import statsService from '../services/statsService';

export default function useAdminStats() {
  const qc = useQueryClient();

  const { data: resp = [], isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => statsService.getStats(),
    staleTime: 1000 * 60,
  });

  const statsArray = useMemo(() => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (resp.data && Array.isArray(resp.data)) return resp.data;
    return [];
  }, [resp]);

  const addMutation = useMutation({
    mutationFn: (payload) => statsService.addStat(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminStats'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => statsService.updateStat(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminStats'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => statsService.deleteStat(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminStats'] }),
  });

  return {
    stats: statsArray,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    addStat: addMutation.mutateAsync,
    updateStat: updateMutation.mutateAsync,
    deleteStat: deleteMutation.mutateAsync,
  };
}
