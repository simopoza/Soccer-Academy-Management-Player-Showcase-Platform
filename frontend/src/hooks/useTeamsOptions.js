import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import teamService from '../services/teamService';

export default function useTeamsOptions({ defaultLabel = 'Select team', staleTime = 1000 * 60 * 5 } = {}) {
  const { data: teams = [] } = useQuery({
    queryKey: ['teams', 'list'],
    queryFn: () => teamService.getTeams(),
    staleTime,
  });

  const teamsOptions = useMemo(() => {
    if (!Array.isArray(teams)) return [{ value: '', label: defaultLabel }];
    return [{ value: '', label: defaultLabel }, ...teams.map(t => ({ value: String(t.id), label: t.name }))];
  }, [teams, defaultLabel]);

  return { teams, teamsOptions };
}
