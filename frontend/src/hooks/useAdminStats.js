import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import statsService from '../services/statsService';

export default function useAdminStats({ initialPage = 1, initialPageSize = 10, filterType = 'all', filterValue = 'all' } = {}) {
  const qc = useQueryClient();
  const [searchQueryState, setSearchQueryState] = useState('');
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // fetch full list (no server-side pagination) to mirror useAdminPlayers/matches pattern
  // Request a large limit so backend returns the full list (backend defaults to 10 per page)
  const { data: resp = [], isLoading, isFetching, refetch, isError, error } = useQuery({
    queryKey: ['adminStats', 'all'],
    queryFn: () => statsService.getStats({ page: 1, limit: 1000 }),
    staleTime: 1000 * 60,
  });

  const statsArray = useMemo(() => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (resp.data && Array.isArray(resp.data)) return resp.data;
    return [];
  }, [resp]);

  const normalizedAll = useMemo(() => statsArray.map(s => ({
    id: s.id,
    player_id: s.player_id,
    player_name: s.player_name || `${s.first_name || ''} ${s.last_name || ''}`.trim(),
    match_id: s.match_id,
    team_name: s.team_name || null,
    opponent: s.opponent || null,
    match_date: s.match_date || s.date || null,
    goals: Number(s.goals || 0),
    assists: Number(s.assists || 0),
    minutes_played: Number(s.minutes_played || s.minutes || 0),
    rating: Number(s.rating || 0),
    raw: s,
  })), [statsArray]);

  // apply search + optional filterType/filterValue locally
  const filtered = useMemo(() => {
    const q = (searchQueryState || '').toLowerCase();
    return normalizedAll.filter(s => {
      const pname = (s.player_name || '').toString().toLowerCase();
      const mname = ((s.team_name ? `${s.team_name} vs ${s.opponent || ''}` : '') || '').toString().toLowerCase();
      const matchesSearch = !q || pname.includes(q) || mname.includes(q) || (s.opponent || '').toString().toLowerCase().includes(q);

      let matchesFilter = true;
      if (filterType === 'player') {
        matchesFilter = filterValue === 'all' || pname === (filterValue || '').toString().toLowerCase();
      } else if (filterType === 'match') {
        matchesFilter = filterValue === 'all' || mname === (filterValue || '').toString().toLowerCase();
      }

      return matchesSearch && matchesFilter;
    });
  }, [normalizedAll, searchQueryState, filterType, filterValue]);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  // keep page in bounds
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  // no-op: keep hook stable; remove dev logs
  useEffect(() => {
    // intentionally left blank
  }, [page, pageSize, totalPages, totalFiltered]);

  // reset page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [searchQueryState, filterType, filterValue]);

  const startIdx = (page - 1) * pageSize;
  const paged = filtered.slice(startIdx, startIdx + pageSize);

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
    stats: paged,
    raw: resp,
    total: totalFiltered,
    page,
    setPage,
    pageSize,
    setPageSize: (s) => { setPageSizeState(s); setPage(1); },
    totalPages,
    searchQuery: searchQueryState,
    setSearchQuery: (q) => {
      // support both updater function and direct value
      if (typeof q === 'function') {
        setSearchQueryState(prev => {
          const next = q(prev);
          if (prev === next) return prev;
          setPage(1);
          return typeof next === 'string' ? next : String(next || '');
        });
      } else {
        setSearchQueryState(prev => {
          if (prev === q) return prev;
          setPage(1);
          return typeof q === 'string' ? q : String(q || '');
        });
      }
    },
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
