import { useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  useDisclosure,
  ModalCloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Text,
  SimpleGrid,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react';
import { CalendarDays, Clock, CheckCircle, Trophy, MapPin } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { DataTable, TableHeader } from '../../components/table';
import { Badge, ActionButtons, SearchInput, FilterSelect, StatsCard } from '../../components/ui';

import { useTranslation } from 'react-i18next';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';
import useCrudList from '../../hooks/useCrudList';
import { statusOptions, matchTypeOptions } from '../../utils/adminOptions';
import CrudFormModal from '../../components/admin/CrudFormModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

const initialMatches = [
  { id: 1, team: 'Eagles U16', opponent: 'Lions U16', date: '2025-12-08', time: '15:00', location: 'Academy Stadium A', matchType: 'Home', status: 'Upcoming', competition: 'League', score: null },
  { id: 2, team: 'Hawks U18', opponent: 'Tigers U18', date: '2025-12-07', time: '16:30', location: 'Tigers Ground', matchType: 'Away', status: 'Upcoming', competition: 'Cup', score: null },
  { id: 3, team: 'Eagles U16', opponent: 'Wolves U16', date: '2025-12-01', time: '15:00', location: 'Academy Stadium A', matchType: 'Home', status: 'Completed', competition: 'League', score: '3-2', result: 'Won' },
  { id: 4, team: 'Falcons U14', opponent: 'Sharks U14', date: '2025-11-30', time: '14:00', location: 'Sharks Arena', matchType: 'Away', status: 'Completed', competition: 'League', score: '1-1', result: 'Draw' },
  { id: 5, team: 'Hawks U18', opponent: 'Bears U18', date: '2025-11-28', time: '16:00', location: 'Academy Stadium B', matchType: 'Home', status: 'Completed', competition: 'Cup', score: '2-3', result: 'Lost' },
];



const AdminMatchesPage = () => {
  const { t, i18n } = useTranslation();

  const { bgGradient, cardBg, cardBorder, cardShadow, primaryGreen, textColor } = useDashboardTheme();
  const pageBg = bgGradient;

  const opponentColor = useColorModeValue('gray.600', '#FFFFFF');

  const isRTL = i18n?.language === 'ar';

  const {
    items: matches,
    setItems: setMatches,
    searchQuery,
    setSearchQuery,
    selectedItem,
    setSelectedItem,
    formData,
    setFormData,

    isAddOpen,
    onAddOpen,
    onAddClose,
    isEditOpen,
    onEditOpen,
    onEditClose,
    isDeleteOpen,
    onDeleteOpen,
    onDeleteClose,

    handleAdd,
    handleEdit,
    handleDelete,
    openEditDialog,
    openDeleteDialog,
  } = useCrudList({ initialData: initialMatches, initialForm: { team: '', opponent: '', date: '', time: '', location: '', matchType: 'Home', competition: 'League', notes: '' } });

  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [matchTypeFilter, setMatchTypeFilter] = useState('all');

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         match.opponent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || match.status === statusFilter;
    const matchesType = matchTypeFilter === 'all' || match.matchType === matchTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalMatches = matches.length;
  const upcomingMatches = matches.filter(m => m.status === 'Upcoming').length;
  const completedMatches = matches.filter(m => m.status === 'Completed').length;
  const wins = matches.filter(m => m.result === 'Won').length;
  const winRate = completedMatches > 0 ? ((wins / completedMatches) * 100).toFixed(1) : '0.0';

  const onConfirmAdd = () => {
    const created = handleAdd({ status: 'Upcoming', score: null });
    toast({
      title: t('notification.matchAdded') || 'Match added',
      description: t('notification.matchAddedDesc') || `Match has been scheduled successfully.`,
      status: 'success',
      duration: 3000,
    });
    onAddClose();
    setFormData({ team: '', opponent: '', date: '', time: '', location: '', matchType: 'Home', competition: 'League', notes: '' });
    return created;
  };

  const onConfirmEdit = () => {
    const updated = handleEdit();
    toast({
      title: t('notification.matchUpdated') || 'Match updated',
      description: t('notification.matchUpdatedDesc') || `Match information has been updated successfully.`,
      status: 'success',
      duration: 3000,
    });
    onEditClose();
    setSelectedItem(null);
    return updated;
  };

  const onConfirmDelete = () => {
    const deleted = handleDelete();
    toast({
      title: t('notification.matchDeleted') || 'Match deleted',
      description: t('notification.matchDeletedDesc') || `Match has been removed.`,
      status: 'success',
      duration: 3000,
    });
    onDeleteClose();
    setSelectedItem(null);
    return deleted;
  };

  const onOpenEdit = (match) => openEditDialog(match);
  const onOpenDelete = (match) => openDeleteDialog(match);

  // field schema for Add/Edit forms (keeps form definition in one place)
  const matchFields = [
    { name: 'team', label: t('team') || 'Team', type: 'text', isRequired: true, placeholder: t('team') || 'Enter team name' },
    { name: 'opponent', label: t('opponent') || 'Opponent', type: 'text', isRequired: true, placeholder: t('opponent') || 'Enter opponent' },
    { name: 'date', label: t('date') || 'Date', type: 'text', isRequired: true, inputType: 'date' },
    { name: 'time', label: t('time') || 'Time', type: 'text', isRequired: true, inputType: 'time' },
    { name: 'location', label: t('location') || 'Location', type: 'text', isRequired: true, placeholder: t('location') || 'Enter match location' },
    { name: 'matchType', label: t('matchType') || 'Match Type', type: 'select', isRequired: true, options: matchTypeOptions(t) },
    { name: 'competition', label: t('competition') || 'Competition', type: 'select', isRequired: true, options: [
      { value: 'League', label: t('competitionLeague') || 'League' },
      { value: 'Cup', label: t('competitionCup') || 'Cup' },
      { value: 'Friendly', label: t('competitionFriendly') || 'Friendly' },
    ] },
    { name: 'notes', label: t('notes') || 'Notes', type: 'textarea', isRequired: false, rows: 3 },
  ];

  const columns = [
    {
      header: t('table.match') || 'Match',
      accessor: 'match',
      render: (row) => (
        <VStack align="start" spacing={0}>
          <Box fontWeight="600" fontSize="sm" color={primaryGreen}>{row.team}</Box>
          <Box fontSize="sm" color={opponentColor}>{row.opponent}</Box>
        </VStack>
      ),
    },
    {
      header: t('table.dateTime') || 'Date & Time',
      accessor: 'date',
      render: (row) => {
        // format date/time according to current locale
        const locale = i18n?.language || 'en';
        let formattedDate = row.date;
        let formattedTime = row.time;
        try {
          const dt = new Date(`${row.date}T${row.time}`);
          formattedDate = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(dt);
          formattedTime = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(dt);
        } catch (e) {
          // keep raw values if parsing fails
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
      header: t('table.location') || 'Location',
      accessor: 'location',
      render: (row) => (
        <HStack spacing={2} align="center">
          <MapPin size={14} color={primaryGreen} />
          <Text fontSize="sm">{row.location}</Text>
        </HStack>
      ),
    },
    {
      header: t('table.type') || 'Type',
      accessor: 'matchType',
      render: (row) => (
        <Badge variant={row.matchType === 'Home' ? 'success' : 'info'}>
          {t(row.matchType === 'Home' ? 'matchTypeHome' : 'matchTypeAway') || row.matchType}
        </Badge>
      ),
    },
    {
      header: t('table.competition') || 'Competition',
      accessor: 'competition',
      render: (row) => (
        <Badge variant="default">
          {t(
            row.competition === 'League'
              ? 'competitionLeague'
              : row.competition === 'Cup'
              ? 'competitionCup'
              : 'competitionFriendly'
          ) || row.competition}
        </Badge>
      ),
    },
    {
      header: t('table.status') || 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Upcoming' ? 'warning' : 'success'}>
          {t(row.status === 'Upcoming' ? 'statusUpcoming' : 'statusCompleted') || row.status}
        </Badge>
      ),
    },
    {
      header: t('table.score') || 'Score',
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

  return (
    <Layout pageTitle={t('matchesManagement') || 'Matches Management'} pageSubtitle={t('matchesManagementDesc') || 'Manage academy matches and fixtures'}>
      <Box bgGradient={bgGradient} px="32px" pt="24px" pb="32px" minH="100vh" dir={isRTL ? 'rtl' : 'ltr'}>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={6}>
        <StatsCard
          title={t('cardTotalMatches') || 'Total Matches'}
          value={totalMatches}
          icon={CalendarDays}
          color="green"
          primaryGreen={primaryGreen}
          cardBg={cardBg}
          cardBorder={cardBorder}
          cardShadow={cardShadow}
          textColor={textColor}
        />
        <StatsCard
          title={t('cardUpcoming') || 'Upcoming'}
          value={upcomingMatches}
          icon={Clock}
          color="orange"
          primaryGreen={primaryGreen}
          cardBg={cardBg}
          cardBorder={cardBorder}
          cardShadow={cardShadow}
          textColor={textColor}
        />
        <StatsCard
          title={t('cardCompleted') || 'Completed'}
          value={completedMatches}
          icon={CheckCircle}
          color="blue"
          primaryGreen={primaryGreen}
          cardBg={cardBg}
          cardBorder={cardBorder}
          cardShadow={cardShadow}
          textColor={textColor}
        />
        <StatsCard
          title={t('cardWinRate') || 'Win Rate'}
          value={`${winRate}%`}
          icon={Trophy}
          color="purple"
          primaryGreen={primaryGreen}
          cardBg={cardBg}
          cardBorder={cardBorder}
          cardShadow={cardShadow}
          textColor={textColor}
        />
        </SimpleGrid>

        <Box
          bg={cardBg}
          borderRadius="12px"
          boxShadow="0 10px 25px rgba(0,0,0,0.05)"
          border="1px"
          borderColor={cardBorder}
          p="24px"
        >
        <TableHeader
          title={t('cardTitleMatches') || 'All Matches'}
          count={filteredMatches.length}
          actionLabel={t('actionAddMatch') || 'Add Match'}
          onAction={onAddOpen}
        />

        <Flex gap={4} mb={6}>
          <Box flex={1}>
            <SearchInput
              placeholder={t('searchPlaceholderMatches') || 'Search by team, opponent, or location...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>
          <Box width="200px">
            <FilterSelect
              placeholder={t('filterAllStatus') || 'All Status'}
              options={statusOptions(t)}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </Box>
          <Box width="200px">
            <FilterSelect
              placeholder={t('filterAllTypes') || 'All Types'}
              options={matchTypeOptions(t)}
              value={matchTypeFilter}
              onChange={(e) => setMatchTypeFilter(e.target.value)}
            />
          </Box>
        </Flex>

        <DataTable
          columns={columns}
          data={filteredMatches}
          emptyMessage={t('emptyMatches') || 'No matches found'}
          wrapperBorderColor={cardBorder}
        />
        </Box>
      </Box>

      <CrudFormModal
        isOpen={isAddOpen}
        onClose={onAddClose}
        mode="add"
        titleAdd={t('modal.addMatch') || 'Add New Match'}
        confirmLabelAdd={t('actionAddMatch') || 'Add Match'}
        formData={formData}
        setFormData={setFormData}
        onConfirm={onConfirmAdd}
        fields={matchFields}
        layout="grid"
        columns={2}
      />

      <CrudFormModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        mode="edit"
        titleEdit={t('modal.editMatch') || 'Edit Match'}
        confirmLabelEdit={t('saveChanges') || 'Save Changes'}
        formData={formData}
        setFormData={setFormData}
        onConfirm={onConfirmEdit}
        fields={matchFields}
        layout="grid"
        columns={2}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        title={t('modal.deleteMatch') || 'Delete Match'}
        body={t('confirmDeleteMatch') || 'Are you sure you want to delete this match? This action cannot be undone.'}
        onConfirm={onConfirmDelete}
        confirmLabel={t('delete') || 'Delete'}
        cancelLabel={t('cancel') || 'Cancel'}
      />
    </Layout>
  );
};

export default AdminMatchesPage;
