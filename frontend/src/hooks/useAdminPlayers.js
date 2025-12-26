import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import playerService from '../services/playerService';

export default function useAdminPlayers({ initialPage = 1, initialPageSize = 10 } = {}) {
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const { data: resp = null, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['adminPlayers', page, pageSize, searchQuery],
    queryFn: () => playerService.getPlayers({ page, limit: pageSize, q: searchQuery }),
    staleTime: 1000 * 60,
    keepPreviousData: true,
  });

  const playersArray = useMemo(() => {
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
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const normalized = useMemo(() => playersArray.map(p => ({
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

  return {
    players: normalized,
    rawPlayers: playersArray,
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
  };
}
