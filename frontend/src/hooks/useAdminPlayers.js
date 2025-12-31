import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import playerService from '../services/playerService';

export default function useAdminPlayers({ initialPage = 1, initialPageSize = 10, teamFilter = 'all' } = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // fetch full list (no server-side pagination) to mirror Matches pattern
  // Request a large limit so backend returns the full list (backend defaults to 10 per page)
  const { data: resp = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['adminPlayers', 'all'],
    queryFn: () => playerService.getPlayers({ page: 1, limit: 1000 }),
    staleTime: 1000 * 60,
  });

  const playersArray = useMemo(() => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (resp.data && Array.isArray(resp.data)) return resp.data;
    return [];
  }, [resp]);

  const normalizedAll = useMemo(() => playersArray.map(p => ({
    id: p.id,
    first_name: p.first_name || '',
    last_name: p.last_name || '',
    name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
    team_name: p.team_name || '',
    team: p.team_name || p.team || '',
    team_id: p.team_id || null,
    position: p.position || '',
    status: p.status || 'Active',
    image: p.image_url || null,
    raw: p,
  })), [playersArray]);

  // apply search + team filter locally (hook exposes searchQuery/state)
  const filtered = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    return normalizedAll.filter(p => {
      const matchesSearch = !q || (p.name || '').toLowerCase().includes(q) || (p.team || '').toLowerCase().includes(q);
      const matchesTeam = teamFilter === 'all' || String(p.team_id || p.team) === String(teamFilter) || p.team === teamFilter;
      return matchesSearch && matchesTeam;
    });
  }, [normalizedAll, searchQuery, teamFilter]);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  // keep page in bounds when totalPages changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  // reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const startIdx = (page - 1) * pageSize;
  const paged = filtered.slice(startIdx, startIdx + pageSize);

  return {
    players: paged,
    rawPlayers: playersArray,
    total: totalFiltered,
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
  };
}
