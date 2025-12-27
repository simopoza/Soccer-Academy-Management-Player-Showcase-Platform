import matchFields from './matchFields';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import React from 'react';
import { VStack, HStack, Box, Text } from '@chakra-ui/react';
import { Badge } from '../components/ui';

export const createMatchColumns = ({ i18n, primaryGreen, opponentColor, onEdit, onDelete }) => {
  const t = i18n?.t?.bind(i18n);

  return [
    {
      header: t ? t('table.match') || 'Match' : 'Match',
      accessor: 'match',
      render: (row) => (
        <VStack align="start" spacing={0}>
          <Box fontWeight="600" fontSize="sm" color={primaryGreen}>{row.team}</Box>
          <Box fontSize="sm" color={opponentColor}>{row.opponent}</Box>
        </VStack>
      ),
    },
    {
      header: t ? t('table.dateTime') || 'Date & Time' : 'Date & Time',
      accessor: 'date',
      render: (row) => {
        const locale = i18n?.language || 'en';
        let formattedDate = 'TBD';
        let formattedTime = '-';

        if (row.date) {
          try {
            const dt = row.time ? new Date(`${row.date}T${row.time}`) : new Date(row.date);
            if (!isNaN(dt)) {
              formattedDate = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(dt);
              formattedTime = row.time ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(dt) : '-';
            }
          } catch {}
        }

        return (
          <VStack align="start" spacing={0}>
            <HStack spacing={2} align="center">
              <CalendarDays size={14} color={primaryGreen} />
              <Text fontSize="sm">{formattedDate}</Text>
            </HStack>
            <HStack spacing={2} align="center">
              <Clock size={14} color={primaryGreen} />
              <Text fontSize="xs" color="gray.500">{formattedTime}</Text>
            </HStack>
          </VStack>
        );
      },
    },
    {
      header: t ? t('table.location') || 'Location' : 'Location',
      accessor: 'location',
      render: (row) => (
        <HStack spacing={2} align="center">
          <MapPin size={14} color={primaryGreen} />
          <Text fontSize="sm">{row.location}</Text>
        </HStack>
      ),
    },
    {
      header: t ? t('table.competition') || 'Competition' : 'Competition',
      accessor: 'competition',
      render: (row) => (
        <Badge variant="default">{row.competition}</Badge>
      ),
    },
    {
      header: t ? t('table.status') || 'Status' : 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Upcoming' ? 'warning' : 'success'}>{row.status}</Badge>
      ),
    },
    {
      header: t ? t('table.score') || 'Score' : 'Score',
      accessor: 'score',
      render: (row) => (
        row.score ? (
          <Badge variant={row.result === 'Won' ? 'success' : row.result === 'Draw' ? 'warning' : 'danger'}>{row.score}</Badge>
        ) : (
          <Text fontSize="sm" color="gray.400">-</Text>
        )
      ),
    },
    {
      header: t ? t('table.actions') || 'Actions' : 'Actions',
      accessor: 'actions',
      render: (row) => (
        <Box>{/* consumer should provide action handlers via onEdit/onDelete */}</Box>
      ),
    },
  ];
};

export const getMatchFields = (teamsOptions = [], t) => {
  const translateLabel = (f) => {
    if (!t) return f.label;
    // try a few candidate keys based on field name and label
    const candidates = [f.name, f.name.replace(/_id$/, ''), f.label && f.label.toLowerCase().replace(/\s+/g, '_')];
    for (const key of candidates) {
      if (!key) continue;
      const val = t(key);
      if (val && typeof val === 'string' && val !== key) return val;
    }
    return f.label;
  };

  return matchFields.map(f => {
    const base = { ...f, label: translateLabel(f) };
    if (f.name === 'team_id') {
      return { ...base, options: [{ value: '', label: t ? t('selectTeam') || 'Select team' : 'Select team' }, ...teamsOptions] };
    }
    return base;
  });
};

export default {
  createMatchColumns,
  getMatchFields,
};
