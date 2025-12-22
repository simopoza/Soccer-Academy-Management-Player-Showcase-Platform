// Small utilities to produce localized option arrays across admin pages
export const statusOptions = (t) => [
  { value: 'all', label: t ? t('filterAllStatus') || 'All Status' : 'All Status' },
  { value: 'Upcoming', label: t ? t('statusUpcoming') || 'Upcoming' : 'Upcoming' },
  { value: 'Completed', label: t ? t('statusCompleted') || 'Completed' : 'Completed' },
];

export const matchTypeOptions = (t) => [
  { value: 'all', label: t ? t('filterAllTypes') || 'All Types' : 'All Types' },
  { value: 'Home', label: t ? t('matchTypeHome') || 'Home' : 'Home' },
  { value: 'Away', label: t ? t('matchTypeAway') || 'Away' : 'Away' },
];

export const categoryOptions = (t) => [
  { value: 'all', label: t ? t('filterAllCategories') || 'All Categories' : 'All Categories' },
  { value: 'U12', label: t ? t('ageU12') || 'U12' : 'U12' },
  { value: 'U14', label: t ? t('ageU14') || 'U14' : 'U14' },
  { value: 'U16', label: t ? t('ageU16') || 'U16' : 'U16' },
  { value: 'U18', label: t ? t('ageU18') || 'U18' : 'U18' },
];

export const roleOptions = (t) => [
  { value: 'all', label: t ? t('filterAllRoles') || 'All Roles' : 'All Roles' },
  { value: 'admin', label: t ? t('role.admin') || 'Admin' : 'Admin' },
  { value: 'coach', label: t ? t('role.coach') || 'Coach' : 'Coach' },
  { value: 'player', label: t ? t('role.player') || 'Player' : 'Player' },
  { value: 'agent', label: t ? t('role.agent') || 'Agent' : 'Agent' },
];

export const teamOptionsFromArray = (t, teams = []) => [
  { value: 'all', label: t ? t('filterAllTeams') || 'All Teams' : 'All Teams' },
  ...teams.map(name => ({ value: name, label: name })),
];
