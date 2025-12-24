const matchFields = [
  { name: 'team', label: 'Team', type: 'text', isRequired: true, placeholder: 'Enter team name' },
  { name: 'opponent', label: 'Opponent', type: 'text', isRequired: true, placeholder: 'Enter opponent' },
  { name: 'date', label: 'Date', type: 'text', isRequired: true, inputType: 'date' },
  { name: 'time', label: 'Time', type: 'text', isRequired: true, inputType: 'time' },
  { name: 'location', label: 'Location', type: 'select', isRequired: true, options: [
    { value: 'Home', label: 'Home' },
    { value: 'Away', label: 'Away' },
  ] },
  { name: 'team_goals', label: 'Team Goals', type: 'number', isRequired: true, inputType: 'number', placeholder: '0' },
  { name: 'opponent_goals', label: 'Opponent Goals', type: 'number', isRequired: true, inputType: 'number', placeholder: '0' },
  { name: 'competition', label: 'Competition', type: 'select', isRequired: true, options: [
    { value: 'League', label: 'League' },
    { value: 'Cup', label: 'Cup' },
    { value: 'Friendly', label: 'Friendly' },
  ] },
  // notes removed per admin requirements
];

export default matchFields;
