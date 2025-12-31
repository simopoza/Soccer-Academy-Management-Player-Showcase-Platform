import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import playerService from '../services/playerService';

export default function useAdminTeams({ initialPage = 1, initialPageSize = 10 } = {}) {
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const { data: resp = null, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['adminTeams', page, pageSize, searchQuery],
    queryFn: () => playerService.getTeams({ page, limit: pageSize, q: searchQuery }),
    staleTime: 1000 * 60,
    keepPreviousData: true,
  });

  const teamsArray = useMemo(() => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (resp.data && Array.isArray(resp.data)) return resp.data;
    return [];
  }, [resp]);

  const total = useMemo(() => {
    if (!resp) return 0;
    if (Array.isArray(resp)) return resp.length;
    if (typeof resp.total === 'number') return resp.total;
    if (Array.isArray(resp.data)) return resp.data.length;
    return 0;
  }, [resp]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    // Ensure page is within bounds; it's safe to update only when needed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const normalized = useMemo(() => teamsArray.map(t => ({
    id: t.id,
    name: t.name,
    ageCategory: t.ageCategory || null,
    coach: t.coach || '',
    founded: t.founded || '',
    status: t.status || 'Active',
    playerCount: t.playerCount || 0,
    raw: t,
  })), [teamsArray]);

  // Mutations
  const addTeamMutation = useMutation({
    mutationFn: (data) => playerService.addTeam(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminTeams'] }),
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }) => playerService.updateTeam(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminTeams'] }),
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (id) => playerService.deleteTeam(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminTeams'] }),
  });

  return {
    teams: normalized,
    rawTeams: teamsArray,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    searchQuery,
    setSearchQuery,
    isLoading,
    isFetching,
    refetch,
    addTeam: addTeamMutation.mutateAsync,
    addTeamStatus: addTeamMutation.status,
    updateTeam: updateTeamMutation.mutateAsync,
    updateTeamStatus: updateTeamMutation.status,
    deleteTeam: deleteTeamMutation.mutateAsync,
    deleteTeamStatus: deleteTeamMutation.status,
  };
}
