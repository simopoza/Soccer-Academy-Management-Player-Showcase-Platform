import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import teamService from '../services/teamService';

export default function useTeamsOptions({ staleTime = 1000 * 60 * 5 } = {}) {
  const { data: teams = [], isLoading, isFetching, isError } = useQuery({
    queryKey: ['teams', 'list'],
    queryFn: () => teamService.getTeams(),
    staleTime,
  });

  const teamsOptions = useMemo(() => {
    if (!Array.isArray(teams)) return [];
    return teams.map(t => ({ value: String(t.id), label: t.name }));
  }, [teams]);

  return { teams, teamsOptions, isLoading, isFetching, isError };
}
