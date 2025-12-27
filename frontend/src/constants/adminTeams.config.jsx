import { HStack, Box, Text, Icon } from '@chakra-ui/react';
import { FiUsers } from 'react-icons/fi';
import { Badge } from '../components/ui';
import { ActionButtons } from '../components/ui';

export function createColumns(t, openEditDialog, openDeleteDialog) {
  return [
    {
      header: t('table.team') || 'Team',
      accessor: 'name',
      render: (row) => (
        <HStack align="center" spacing={3}>
          <Box fontWeight="600" fontSize="sm">{row.name}</Box>
          <Box fontSize="sm" color="gray.600">{row.ageCategory}</Box>
        </HStack>
      ),
    },
    {
      header: t('table.ageCategory') || 'Age Category',
      accessor: 'ageCategory',
      render: (row) => (
        <Badge variant="info">{row.ageCategory}</Badge>
      ),
    },
    {
      header: t('table.coach') || 'Coach',
      accessor: 'coach',
      render: (row) => (
        <Text fontSize="sm" fontWeight="500">{row.coach}</Text>
      ),
    },
    {
      header: t('table.players') || 'Players',
      accessor: 'playerCount',
      render: (row) => (
        <HStack spacing={2} align="center">
          <Icon as={FiUsers} boxSize={4} color="gray.500" />
          <Text fontSize="sm" fontWeight="600" color="green.600">{row.playerCount}</Text>
        </HStack>
      ),
    },
    {
      header: t('table.founded') || 'Founded',
      accessor: 'founded',
      render: (row) => (
        <Text fontSize="sm">{row.founded}</Text>
      ),
    },
    {
      header: t('table.status') || 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'default'}>
          {t(row.status === 'Active' ? 'statusActive' : 'statusInactive') || row.status}
        </Badge>
      ),
    },
    {
      header: t('table.actions') || 'Actions',
      accessor: 'actions',
      render: (row) => (
        <ActionButtons
          onEdit={() => openEditDialog(row)}
          onDelete={() => openDeleteDialog(row)}
        />
      ),
    },
  ];
}

export function getAddFields(t) {
  return [
    { name: 'name', label: t('teamName') || 'Team Name', type: 'text', isRequired: true, placeholder: t('teamNamePlaceholder') || 'Enter team name' },
    { name: 'ageCategory', label: t('ageCategory') || 'Age Category', type: 'select', isRequired: true, options: [
      { value: 'U12', label: t('ageU12') || 'U12' },
      { value: 'U14', label: t('ageU14') || 'U14' },
      { value: 'U16', label: t('ageU16') || 'U16' },
      { value: 'U18', label: t('ageU18') || 'U18' },
    ] },
    { name: 'coach', label: t('coach') || 'Coach', type: 'text', isRequired: true, placeholder: t('coachPlaceholder') || 'Enter coach name' },
    { name: 'description', label: t('description') || 'Description', type: 'textarea', isRequired: false, rows: 3, placeholder: t('descriptionPlaceholder') || 'Enter team description (optional)' },
  ];
}

export function getEditFields(t) {
  // edit fields similar to add
  return [
    { name: 'name', label: t('teamName') || 'Team Name', type: 'text', isRequired: true },
    { name: 'ageCategory', label: t('ageCategory') || 'Age Category', type: 'select', isRequired: true, options: [
      { value: 'U12', label: t('ageU12') || 'U12' },
      { value: 'U14', label: t('ageU14') || 'U14' },
      { value: 'U16', label: t('ageU16') || 'U16' },
      { value: 'U18', label: t('ageU18') || 'U18' },
    ] },
    { name: 'coach', label: t('coach') || 'Coach', type: 'text', isRequired: true },
    { name: 'description', label: t('description') || 'Description', type: 'textarea', isRequired: false, rows: 3 },
  ];
}
