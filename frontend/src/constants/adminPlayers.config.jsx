import React from 'react';
import { HStack, Box, Text } from '@chakra-ui/react';
import { Star } from 'lucide-react';
import { AvatarCircle, Badge, ActionButtons } from '../components/ui';

const getRatingColor = (rating) => {
  if (rating >= 8.5) return 'success';
  if (rating >= 7.5) return 'info';
  return 'warning';
};

export const createPlayerColumns = ({ t, onEdit, onDelete }) => {
  return [
    {
      header: t('table.player') || 'Player',
      accessor: 'name',
      render: (row) => (
        <HStack spacing={3} align="center">
          <AvatarCircle name={row.name} src={row.image} size="sm" />
          <Box fontWeight="600" fontSize="sm">{row.name}</Box>
        </HStack>
      ),
    },
    {
      header: t('table.team') || 'Team',
      accessor: 'team',
      render: (row) => (
        <Text fontSize="sm" fontWeight="500">{row.team}</Text>
      ),
    },
    {
      header: t('table.position') || 'Position',
      accessor: 'position',
      render: (row) => {
        const rawKey = `position${row.position}`;
        const direct = t(rawKey);
        let posLabel = direct;

        if (!direct || direct === rawKey || typeof direct !== 'string') {
          const abbrevMap = {
            GK: 'Goalkeeper',
            DF: 'Defender',
            MF: 'Midfielder',
            FW: 'Forward',
            WG: 'Winger',
            ST: 'Striker',
          };
          const mapped = abbrevMap[row.position] || row.position || '';
          const mappedKey = `position${mapped}`;
          const mappedTranslated = t(mappedKey);
          if (mappedTranslated && mappedTranslated !== mappedKey && typeof mappedTranslated === 'string') {
            posLabel = mappedTranslated;
          } else {
            posLabel = mapped;
          }
        }

        return <Badge variant="info">{posLabel}</Badge>;
      },
    },
    {
      header: t('table.rating') || 'Rating',
      accessor: 'rating',
      render: (row) => (
        <HStack spacing={2}>
          <Star size={14} color="#F59E0B" />
          {typeof row.rating === 'number' && !isNaN(row.rating) ? (
            <Badge variant={getRatingColor(row.rating)}>{row.rating.toFixed(1)}</Badge>
          ) : (
            <Text fontSize="sm" color="gray.400">-</Text>
          )}
        </HStack>
      ),
    },
    {
      header: t('table.status') || 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>
          {row.status === 'Active' ? t('statusActive') : row.status === 'Injured' ? t('statusInjured') : t('statusInactive') || row.status}
        </Badge>
      ),
    },
    {
      header: t('table.actions') || 'Actions',
      accessor: 'actions',
      render: (row) => (
        <ActionButtons onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
      ),
    },
  ];
};

export const getPlayerAddFields = (teamsOptions = [], t, { isLoading = false } = {}) => ([
  { name: 'first_name', label: t('firstName') || 'First Name', type: 'text', isRequired: true },
  { name: 'last_name', label: t('lastName') || 'Last Name', type: 'text', isRequired: true },
  { name: 'date_of_birth', label: t('dateOfBirth') || 'Date of Birth', type: 'text', inputType: 'date', isRequired: true },
  { name: 'height', label: t('height') || 'Height (cm)', type: 'number', isRequired: false },
  { name: 'weight', label: t('weight') || 'Weight (kg)', type: 'number', isRequired: false },
  { name: 'position', label: t('table.position') || 'Position', type: 'select', isRequired: true, options: [
    { value: 'Goalkeeper', label: t('positionGoalkeeper') || 'Goalkeeper' },
    { value: 'Defender', label: t('positionDefender') || 'Defender' },
    { value: 'Midfielder', label: t('positionMidfielder') || 'Midfielder' },
    { value: 'Forward', label: t('positionForward') || 'Forward' },
    { value: 'Winger', label: t('positionWinger') || 'Winger' },
    { value: 'Striker', label: t('positionStriker') || 'Striker' },
  ] },
  { name: 'strong_foot', label: t('strongFoot') || 'Strong Foot', type: 'select', isRequired: true, options: [
    { value: 'Right', label: t('right') || 'Right' },
    { value: 'Left', label: t('left') || 'Left' },
    { value: 'Both', label: t('both') || 'Both' },
  ] },
  { name: 'email', label: t('email') || 'Email', type: 'text', isRequired: false },
  { name: 'sendInvite', label: t('sendInvite') || 'Send Invite', type: 'select', isRequired: false, options: [
    { value: 'true', label: t('yes') || 'Yes' },
    { value: 'false', label: t('no') || 'No' },
  ] },
  { name: 'team_id', label: t('team') || 'Team', type: 'select', isRequired: false, options: isLoading ? [{ value: '', label: t ? t('loading') || 'Loading...' : 'Loading...', isDisabled: true }] : teamsOptions },
]);

export const getPlayerEditFields = (teamsOptions = [], t, { isLoading = false } = {}) => ([
  { name: 'first_name', label: t('firstName') || 'First Name', type: 'text', isRequired: true },
  { name: 'last_name', label: t('lastName') || 'Last Name', type: 'text', isRequired: true },
  { name: 'date_of_birth', label: t('dateOfBirth') || 'Date of Birth', type: 'text', inputType: 'date', isRequired: true },
  { name: 'height', label: t('height') || 'Height (cm)', type: 'number', isRequired: false },
  { name: 'weight', label: t('weight') || 'Weight (kg)', type: 'number', isRequired: false },
  { name: 'position', label: t('table.position') || 'Position', type: 'select', isRequired: true, options: [
    { value: 'Goalkeeper', label: t('positionGoalkeeper') || 'Goalkeeper' },
    { value: 'Defender', label: t('positionDefender') || 'Defender' },
    { value: 'Midfielder', label: t('positionMidfielder') || 'Midfielder' },
    { value: 'Forward', label: t('positionForward') || 'Forward' },
    { value: 'Winger', label: t('positionWinger') || 'Winger' },
    { value: 'Striker', label: t('positionStriker') || 'Striker' },
  ] },
  { name: 'strong_foot', label: t('strongFoot') || 'Strong Foot', type: 'select', isRequired: true, options: [
    { value: 'Right', label: t('right') || 'Right' },
    { value: 'Left', label: t('left') || 'Left' },
    { value: 'Both', label: t('both') || 'Both' },
  ] },
  { name: 'team_id', label: t('team') || 'Team', type: 'select', isRequired: false, options: isLoading ? [{ value: '', label: t ? t('loading') || 'Loading...' : 'Loading...', isDisabled: true }] : teamsOptions },
]);

export default {
  createPlayerColumns,
  getPlayerAddFields,
  getPlayerEditFields,
};
