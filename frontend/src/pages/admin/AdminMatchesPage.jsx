import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  useToast,
  SimpleGrid,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { CalendarDays, Clock, CheckCircle, Trophy } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { TableHeader } from '../../components/table';
import { SearchInput, FilterSelect, StatsCard } from '../../components/ui';
import Pagination from '../../components/ui/Pagination';
import MatchesTable from '../../components/admin/MatchesTable';

import { useTranslation } from 'react-i18next';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';
import useCrudList from '../../hooks/useCrudList';
import useMatches from '../../hooks/useMatches';
import adminMatchesConfig from '../../constants/adminMatches.config';
import useTeamsOptions from '../../hooks/useTeamsOptions';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { statusOptions } from '../../utils/adminOptions';
import CrudFormModal from '../../components/admin/CrudFormModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

// initialLocal data removed: matches are loaded from backend via React Query

const AdminMatchesPage = () => {
  const { t, i18n } = useTranslation();

  const { bgGradient, cardBg, cardBorder, cardShadow, primaryGreen, textColor } = useDashboardTheme();

  const opponentColor = useColorModeValue('gray.600', '#FFFFFF');

  const isRTL = i18n?.language === 'ar';

  const {
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
    onEditClose,
    isDeleteOpen,
    onDeleteClose,
    openEditDialog,
    openDeleteDialog,
  } = useCrudList({ initialData: [], initialForm: { team_id: '', opponent: '', date: '', time: '', location: 'Home', competition: 'League', team_goals: 0, opponent_goals: 0 } });

  // local input state for debounced search
  const [searchInput, setSearchInput] = useState(searchQuery || '');
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // update global searchQuery only after debounce
  useEffect(() => {
    setSearchQuery(debouncedSearch);
    // reset to first page when search changes
    // setPage? useMatches provides setPage but we leave pagination hook to react to searchQuery changes
  }, [debouncedSearch]);

  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // useMatches hook encapsulates fetching, mapping, filtering and pagination
  const {
    pagedMatches,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFiltered,
    totalMatches,
    upcomingMatches,
    completedMatches,
    winRate,
    isLoading,
    addMatch,
    updateMatch,
    deleteMatch,
  } = useMatches({ searchQuery, statusFilter, locationFilter, pageSize: 10 });

  // teams for Team select options (use React Query via hook)
  const { teamsOptions, isLoading: teamsLoading } = useTeamsOptions();

  const fieldsWithOptions = adminMatchesConfig.getMatchFields(teamsOptions, t, { isLoading: teamsLoading });

  // pagination, filtering and stats are provided by `useMatches` hook

  const onConfirmAdd = async () => {
    try {
      await addMatch(formData);
      toast({
        title: t('notification.matchAdded') || 'Match added',
        description: t('notification.matchAddedDesc') || `Match has been scheduled successfully.`,
        status: 'success',
        duration: 3000,
      });
      onAddClose();
      setFormData({ team_id: '', opponent: '', date: '', time: '', location: 'Home', competition: 'League', team_goals: 0, opponent_goals: 0 });
    } catch (err) {
      console.error('Add match failed', err);
      toast({ title: t('error') || 'Error', description: err?.message || 'Failed to add match', status: 'error' });
    }
  };

  const onConfirmEdit = async () => {
    try {
      if (!selectedItem) return null;
      await updateMatch(selectedItem.id, formData);
      toast({
        title: t('notification.matchUpdated') || 'Match updated',
        description: t('notification.matchUpdatedDesc') || `Match information has been updated successfully.`,
        status: 'success',
        duration: 3000,
      });
      onEditClose();
      setSelectedItem(null);
      setFormData({ team_id: '', opponent: '', date: '', time: '', location: 'Home', competition: 'League', team_goals: 0, opponent_goals: 0 });
    } catch (err) {
      console.error('Update match failed', err);
      toast({ title: t('error') || 'Error', description: err?.message || 'Failed to update match', status: 'error' });
    }
  };

  const onConfirmDelete = async () => {
    try {
      if (!selectedItem) return null;
      await deleteMatch(selectedItem.id);
      toast({
        title: t('notification.matchDeleted') || 'Match deleted',
        description: t('notification.matchDeletedDesc') || `Match has been removed.`,
        status: 'success',
        duration: 3000,
      });
      onDeleteClose();
      setSelectedItem(null);
    } catch (err) {
      console.error('Delete match failed', err);
      toast({ title: t('error') || 'Error', description: err?.message || 'Failed to delete match', status: 'error' });
    }
  };

  // table columns and rendering extracted to MatchesTable component

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
          count={totalFiltered}
          actionLabel={t('actionAddMatch') || 'Add Match'}
          onAction={onAddOpen}
        />

        <Flex gap={4} mb={6}>
          <Box flex={1}>
            <SearchInput
              placeholder={t('searchPlaceholderMatches') || 'Search by team, opponent, or location...'}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
              options={[
                { value: 'all', label: t('filterAllTypes') || 'All Types' },
                { value: 'Home', label: t('matchTypeHome') || 'Home' },
                { value: 'Away', label: t('matchTypeAway') || 'Away' },
              ]}
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </Box>
        </Flex>

        <MatchesTable
          matches={pagedMatches}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          emptyMessage={t('emptyMatches') || 'No matches found'}
          wrapperBorderColor={cardBorder}
          i18n={i18n}
          primaryGreen={primaryGreen}
          opponentColor={opponentColor}
        />
        {isLoading && (
          <Box p={6}>
            <Skeleton height="20px" mb={4} />
            <Skeleton height="20px" mb={4} />
            <Skeleton height="20px" mb={4} />
          </Box>
        )}

        <Box mt={4}>
          <Pagination
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        </Box>
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
        fields={fieldsWithOptions}
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
        fields={fieldsWithOptions}
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
