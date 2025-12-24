import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import matchService from '../services/matchService';

export default function useMatches({ searchQuery = '', statusFilter = 'all', locationFilter = 'all', initialPage = 1, pageSize = 10 } = {}) {
  const [page, setPage] = useState(initialPage);
  const queryClient = useQueryClient();

  const { data: rawMatches = [], isLoading, isFetching } = useQuery({
    queryKey: ['matches'],
    queryFn: () => (matchService.getMatches ? matchService.getMatches() : matchService.getMatches()),
    staleTime: 1000 * 60,
  });

  const mapRow = (r) => {
    let dateStr = '';
    let timeStr = '';

    // Treat null/empty date as unknown/upcoming
    if (r.date) {
      try {
        const dt = new Date(r.date);
        if (!isNaN(dt)) {
          dateStr = dt.toISOString().slice(0, 10);
          timeStr = dt.toTimeString().slice(0, 5);
        }
      } catch (e) {
        console.debug(e);
      }
    }

    const now = new Date();
    let isUpcoming = true;
    if (r.date) {
      const matchDate = new Date(r.date);
      if (!isNaN(matchDate)) {
        isUpcoming = matchDate > now;
      }
    }

    let result = null;
    if (!isUpcoming && r.team_goals != null && r.opponent_goals != null) {
      if (r.team_goals > r.opponent_goals) result = 'Won';
      else if (r.team_goals === r.opponent_goals) result = 'Draw';
      else result = 'Lost';
    }

    const score = (!isUpcoming && r.team_goals != null && r.opponent_goals != null)
      ? `${r.team_goals}-${r.opponent_goals}`
      : null;

    return {
      id: r.id,
      // if team_name missing and team_id is null, treat as the academy's own match
      team: r.team_name || (r.team_id == null ? 'Academy' : ''),
      opponent: r.opponent || '—',
      date: dateStr,
      time: timeStr,
      location: r.location || '',
      matchType: r.location || '',
      team_goals: r.team_goals != null ? r.team_goals : 0,
      opponent_goals: r.opponent_goals != null ? r.opponent_goals : 0,
      competition: r.competition || '',
      score,
      status: isUpcoming ? 'Upcoming' : 'Completed',
      result,
    };
  };

  const matches = useMemo(() => (Array.isArray(rawMatches) ? rawMatches.map(mapRow) : []), [rawMatches]);

  const filteredMatches = useMemo(() => matches.filter(match => {
    const mq = (searchQuery || '').toLowerCase();
    const matchesSearch = match.team.toLowerCase().includes(mq) || match.opponent.toLowerCase().includes(mq);
    const matchesStatus = statusFilter === 'all' || match.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || match.location === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  }), [matches, searchQuery, statusFilter, locationFilter]);

  const totalFiltered = filteredMatches.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  // keep page in bounds — run when totalPages changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    // only respond to changes in totalPages
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  // Reset page to 1 when filters/search change (intentional setState in effect)
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, locationFilter]);

  const startIdx = (page - 1) * pageSize;
  const pagedMatches = filteredMatches.slice(startIdx, startIdx + pageSize);

  const totalMatches = matches.length;
  const upcomingMatches = matches.filter(m => m.status === 'Upcoming').length;
  const completedMatches = matches.filter(m => m.status === 'Completed').length;
  const wins = matches.filter(m => m.result === 'Won').length;
  const winRate = completedMatches > 0 ? ((wins / completedMatches) * 100).toFixed(1) : '0.0';

  // actions that mutate data and invalidate cache
  const queryKey = ['matches'];

  const buildPayload = (formData) => ({
    // backend accepts nullable date — send null when no date provided
    date: formData.date ? `${formData.date} ${formData.time || '00:00:00'}` : null,
    opponent: formData.opponent,
    location: formData.location,
    competition: formData.competition,
    team_goals: formData.team_goals != null && formData.team_goals !== '' ? Number(formData.team_goals) : 0,
    opponent_goals: formData.opponent_goals != null && formData.opponent_goals !== '' ? Number(formData.opponent_goals) : 0,
    team_id: formData.team_id ? Number(formData.team_id) : null,
    team_name: null, // server will resolve team_name from team_id
    participant_home_id: formData.participant_home_id ? Number(formData.participant_home_id) : null,
    participant_away_id: formData.participant_away_id ? Number(formData.participant_away_id) : null,
  });

  const addMutation = useMutation({
    mutationFn: (formData) => matchService.addMatch(buildPayload(formData)),
    onMutate: async (formData) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      const tempId = `temp-${Date.now()}`;
      // construct a raw match object similar to backend shape so mapRow will handle it
      const payload = buildPayload(formData);
      const tempRaw = {
        id: tempId,
        date: payload.date,
        opponent: formData.opponent,
        location: formData.location,
        competition: formData.competition,
        team_goals: payload.team_goals,
        opponent_goals: payload.opponent_goals,
        team_name: null,
        team_id: payload.team_id ?? null,
        participant_home_id: payload.participant_home_id,
        participant_away_id: payload.participant_away_id,
      };
      queryClient.setQueryData(queryKey, (old = []) => [tempRaw, ...old]);
      return { previous, tempId };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSuccess: (data, variables, context) => {
      // replace temporary item with server-provided item
      if (context?.tempId) {
        queryClient.setQueryData(queryKey, (old = []) => old.map(item => (String(item.id) === String(context.tempId) ? data : item)));
      } else {
        // fallback: prepend server item
        queryClient.setQueryData(queryKey, (old = []) => [data, ...old]);
      }
    },
    onSettled: () => {
      // optionally ensure consistency by invalidating if needed
      // keep lightweight: do not force refetch here
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => matchService.updateMatch(id, buildPayload(formData)),
    onMutate: async ({ id, formData }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      const payload = buildPayload(formData);
      queryClient.setQueryData(queryKey, (old = []) => old.map(item => (String(item.id) === String(id) ? { ...item, date: payload.date, opponent: formData.opponent, location: formData.location, competition: formData.competition, team_goals: payload.team_goals, opponent_goals: payload.opponent_goals, team_id: payload.team_id ?? null, team_name: formData.team || null, participant_home_id: payload.participant_home_id, participant_away_id: payload.participant_away_id } : item)));
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSuccess: (data) => {
      // merge server-updated item into cache
      if (data && data.id != null) {
        queryClient.setQueryData(queryKey, (old = []) => old.map(item => (String(item.id) === String(data.id) ? data : item)));
      }
    },
    onSettled: () => {
      // no full refetch required; cache already updated
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => matchService.deleteMatch(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old = []) => old.filter(item => String(item.id) !== String(id)));
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSuccess: (_data, id) => {
      // ensure the deleted id is removed (id is variables)
      queryClient.setQueryData(queryKey, (old = []) => old.filter(item => String(item.id) !== String(id)));
    },
    onSettled: () => {
      // no refetch required
    },
  });

  // wrapper functions to keep previous API
  const addMatch = async (formData) => addMutation.mutateAsync(formData);
  const updateMatch = async (id, formData) => updateMutation.mutateAsync({ id, formData });
  const deleteMatch = async (id) => deleteMutation.mutateAsync(id);

  return {
    pagedMatches,
    page,
    setPage,
    pageSize,
    totalPages,
    totalFiltered,
    totalMatches,
    upcomingMatches,
    completedMatches,
    wins,
    winRate,
    isLoading,
    isFetching,
    addMatch,
    updateMatch,
    deleteMatch,
  };
}
