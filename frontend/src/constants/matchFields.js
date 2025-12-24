const matchFields = [
  { name: 'team', label: 'Team', type: 'text', isRequired: true, placeholder: 'Enter team name' },
  { name: 'opponent', label: 'Opponent', type: 'text', isRequired: true, placeholder: 'Enter opponent' },
  { name: 'date', label: 'Date', type: 'text', isRequired: true, inputType: 'date' },
  { name: 'time', label: 'Time', type: 'text', isRequired: true, inputType: 'time' },
  { name: 'location', label: 'Location', type: 'text', isRequired: true, placeholder: 'Enter match location' },
  { name: 'matchType', label: 'Match Type', type: 'select', isRequired: true, options: [
    { value: 'Home', label: 'Home' },
    { value: 'Away', label: 'Away' },
  ] },
  { name: 'competition', label: 'Competition', type: 'select', isRequired: true, options: [
    { value: 'League', label: 'League' },
    { value: 'Cup', label: 'Cup' },
    { value: 'Friendly', label: 'Friendly' },
  ] },
  { name: 'notes', label: 'Notes', type: 'textarea', isRequired: false, rows: 3 },
];

export default matchFields;
