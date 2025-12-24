import React from 'react';
import { VStack, HStack, Box, Text } from '@chakra-ui/react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { DataTable } from '../../components/table';
import { Badge, ActionButtons } from '../../components/ui';

const MatchesTable = ({ matches, onEdit, onDelete, wrapperBorderColor, emptyMessage, i18n, primaryGreen, opponentColor }) => {
  const columns = [
    {
      header: i18n ? i18n.t('table.match') || 'Match' : 'Match',
      accessor: 'match',
      render: (row) => (
        <VStack align="start" spacing={0}>
          <Box fontWeight="600" fontSize="sm" color={primaryGreen}>{row.team}</Box>
          <Box fontSize="sm" color={opponentColor}>{row.opponent}</Box>
        </VStack>
      ),
    },
    {
      header: i18n ? i18n.t('table.dateTime') || 'Date & Time' : 'Date & Time',
      accessor: 'date',
      render: (row) => {
        const locale = i18n?.language || 'en';
        let formattedDate = 'TBD';
        let formattedTime = '-';

        if (row.date) {
          try {
            // If time is present use full datetime, otherwise parse date only
            const dt = row.time ? new Date(`${row.date}T${row.time}`) : new Date(row.date);
            if (!isNaN(dt)) {
              formattedDate = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(dt);
              formattedTime = row.time ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(dt) : '-';
            }
          } catch {
            // keep defaults
          }
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
      header: i18n ? i18n.t('table.location') || 'Location' : 'Location',
      accessor: 'location',
      render: (row) => (
        <HStack spacing={2} align="center">
          <MapPin size={14} color={primaryGreen} />
          <Text fontSize="sm">{row.location}</Text>
        </HStack>
      ),
    },
    {
      header: i18n ? i18n.t('table.competition') || 'Competition' : 'Competition',
      accessor: 'competition',
      render: (row) => (
        <Badge variant="default">
          {row.competition}
        </Badge>
      ),
    },
    {
      header: i18n ? i18n.t('table.status') || 'Status' : 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Upcoming' ? 'warning' : 'success'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: i18n ? i18n.t('table.score') || 'Score' : 'Score',
      accessor: 'score',
      render: (row) => (
        row.score ? (
          <Badge variant={row.result === 'Won' ? 'success' : row.result === 'Draw' ? 'warning' : 'danger'}>
            {row.score}
          </Badge>
        ) : (
          <Text fontSize="sm" color="gray.400">-</Text>
        )
      ),
    },
    {
      header: i18n ? i18n.t('table.actions') || 'Actions' : 'Actions',
      accessor: 'actions',
      render: (row) => (
        <ActionButtons onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={matches}
      emptyMessage={emptyMessage}
      wrapperBorderColor={wrapperBorderColor}
    />
  );
};

export default MatchesTable;
