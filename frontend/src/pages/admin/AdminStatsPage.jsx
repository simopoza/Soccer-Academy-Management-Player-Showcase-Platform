import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  useToast,
  Text,
  SimpleGrid,
  Skeleton,
  Center,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';
import useCrudList from '../../hooks/useCrudList';
import useAdminStats from '../../hooks/useAdminStats';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import Pagination from '../../components/ui/Pagination';
import Layout from '../../components/layout/Layout';
import { DataTable, TableHeader } from '../../components/table';
import { Badge, ActionButtons, SearchInput, FilterSelect, StatsCard } from '../../components/ui';
import { BarChart3, Target, TrendingUp, Star } from 'lucide-react';
import CrudFormModal from '../../components/admin/CrudFormModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

// initialStats removed — data now comes from backend via useAdminStats

const AdminStatsPage = () => {
  const { t, i18n } = useTranslation();

  const { bgGradient, cardBg, cardBorder, cardShadow, primaryGreen, textColor } = useDashboardTheme();
  const isRTL = i18n?.language === 'ar';

  const {
    // useCrudList manages modal + form state only; stats list comes from backend
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

    // actions for local UI modals
    openEditDialog,
    openDeleteDialog,
  } = useCrudList({ initialData: [], initialForm: { playerName: '', matchName: '', goals: '', assists: '', minutes: '', saves: '', yellowCards: '', redCards: '', rating: '' } });
  const toast = useToast();
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('all');

  // Backend-powered stats hook (with pagination)
  const {
    raw,
    stats,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    searchQuery,
    setSearchQuery,
    isLoading: statsLoading,
    isFetching: statsFetching,
    isError: statsError,
    refetch,
    addStat,
    updateStat,
    deleteStat,
  } = useAdminStats({ filterType, filterValue });

  // local debounced search to avoid rapid requests
  const [searchInput, setSearchInput] = useState(searchQuery || '');
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // sync debounced input into hook's searchQuery
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  // keep local input in sync with hook's searchQuery
  useEffect(() => {
    setSearchInput(searchQuery || '');
  }, [searchQuery]);

  useEffect(() => {
    // no-op: removed debug logging
  }, [page, total, totalPages, pageSize, stats]);

  // normalize both the full raw set (for filter lists) and the paged stats (for display)
  const rawArray = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.data) ? raw.data : []);
  const normalizedAll = rawArray.map(s => {
    const playerName = s.player_name || s.playerName || `${s.first_name || ''} ${s.last_name || ''}`.trim();
    const matchTeam = s.team_name || s.team || s.teamName || s.team_name;
    const matchOpponent = s.opponent || s.opponent_name || s.opponentName || s.opponent;
    const matchName = matchTeam && matchOpponent ? `${matchTeam} vs ${matchOpponent}` : (s.match_name || s.matchName || `Match ${s.match_id || ''}`);
    return {
      id: s.id,
      playerName,
      player_id: s.player_id,
      matchName,
      match_id: s.match_id,
      matchDate: s.match_date || s.matchDate || s.date || s.match_datetime || s.event_date || null,
      opponent: matchOpponent || null,
      goals: Number(s.goals || 0),
      assists: Number(s.assists || 0),
      minutes: Number(s.minutes_played || s.minutes || 0),
      saves: Number(s.saves || 0),
      yellowCards: Number(s.yellowCards || 0),
      redCards: Number(s.redCards || 0),
      rating: Number(s.rating || 0),
      raw: s,
    };
  });

  const normalizedStats = (stats || []).map(s => {
    // prefer joined/returned fields; fall back to sensible alternatives
    const playerName = s.player_name || s.playerName || `${s.first_name || ''} ${s.last_name || ''}`.trim();
    const matchTeam = s.team_name || s.team || s.teamName || s.team_name;
    const matchOpponent = s.opponent || s.opponent_name || s.opponentName || s.opponent;
    const matchName = matchTeam && matchOpponent ? `${matchTeam} vs ${matchOpponent}` : (s.match_name || s.matchName || `Match ${s.match_id || ''}`);

    // normalize date from several possible keys and formats
    let matchDateRaw = s.match_date || s.matchDate || s.date || s.match_datetime || s.event_date || null;
    // keep raw value; rendering will attempt to parse it robustly
    return {
      id: s.id,
      playerName,
      player_id: s.player_id,
      matchName,
      match_id: s.match_id,
      matchDate: matchDateRaw,
      opponent: matchOpponent || null,
      goals: Number(s.goals || 0),
      assists: Number(s.assists || 0),
      minutes: Number(s.minutes_played || s.minutes || 0),
      saves: Number(s.saves || 0),
      yellowCards: Number(s.yellowCards || 0),
      redCards: Number(s.redCards || 0),
      rating: Number(s.rating || 0),
      raw: s,
    };
  });

  // derive unique filter lists from the full dataset
  const uniquePlayers = Array.from(new Set(normalizedAll.map(stat => stat.playerName))).sort();
  const uniqueMatches = Array.from(new Set(normalizedAll.map(stat => stat.matchName))).sort();

  // stats to display are the paged/filtered results from the hook
  const displayStats = normalizedStats;

  const totalStats = normalizedAll.length;
  const totalGoals = normalizedAll.reduce((sum, s) => sum + (Number(s.goals) || 0), 0);
  const totalAssists = normalizedAll.reduce((sum, s) => sum + (Number(s.assists) || 0), 0);
  const avgRating = normalizedAll.length ? (normalizedAll.reduce((sum, s) => sum + (Number(s.rating) || 0), 0) / normalizedAll.length).toFixed(2) : '0.00';

  const onConfirmAdd = () => {
    (async () => {
      try {
        const payload = {
          player_id: formData.player_id || null,
          match_id: formData.match_id || null,
          goals: parseInt(formData.goals) || 0,
          assists: parseInt(formData.assists) || 0,
          minutes_played: parseInt(formData.minutes) || 0,
        };
        await addStat(payload);
        toast({
          title: t('notification.added') || 'Statistics added',
          description: t('notification.addedDesc') || `Player statistics have been recorded successfully.`,
          status: 'success',
          duration: 3000,
        });
        onAddClose();
        setFormData({ playerName: '', matchName: '', goals: '', assists: '', minutes: '', saves: '', yellowCards: '', redCards: '', rating: '' });
      } catch (err) {
        console.error('Error adding stat', err);
        toast({ title: t('error') || 'Error', description: err?.message || 'Failed to add statistics', status: 'error' });
      }
    })();
  };

  const onConfirmEdit = () => {
    (async () => {
      try {
        const id = formData.id || (typeof selectedItem !== 'undefined' && selectedItem?.id);
        if (!id) return;
        const payload = {
          goals: parseInt(formData.goals) || 0,
          assists: parseInt(formData.assists) || 0,
          minutes_played: parseInt(formData.minutes) || 0,
        };
        await updateStat(id, payload);
        toast({ title: t('notification.updated') || 'Statistics updated', description: t('notification.updatedDesc') || `Statistics have been updated successfully.`, status: 'success', duration: 3000 });
        onEditClose();
        setSelectedItem(null);
      } catch (err) {
        console.error('Error updating stat', err);
        toast({ title: t('error') || 'Error', description: err?.message || 'Failed to update statistics', status: 'error' });
      }
    })();
  };

  const onConfirmDelete = () => {
    (async () => {
      try {
        const id = formData.id || (typeof selectedItem !== 'undefined' && selectedItem?.id);
        if (!id) return;
        await deleteStat(id);
        toast({ title: t('notification.deleted') || 'Statistics deleted', description: t('notification.deletedDesc') || `Statistics record has been removed.`, status: 'success', duration: 3000 });
        onDeleteClose();
        setSelectedItem(null);
      } catch (err) {
        console.error('Error deleting stat', err);
        toast({ title: t('error') || 'Error', description: err?.message || 'Failed to delete statistics', status: 'error' });
      }
    })();
  };

  

  const getRatingColor = (rating) => {
    if (rating >= 9.0) return 'success';
    if (rating >= 8.0) return 'info';
    if (rating >= 7.0) return 'warning';
    return 'danger';
  };

  const columns = [
    {
      header: t('table.player') || 'Player',
      accessor: 'playerName',
      render: (row) => (
        <VStack align="start" spacing={0}>
          <Box fontWeight="600" fontSize="sm">{row.playerName}</Box>
        </VStack>
      ),
    },
    {
      header: t('table.match') || 'Match',
      accessor: 'matchName',
      render: (row) => (
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" fontWeight="500" noOfLines={1}>{row.matchName}</Text>
        </VStack>
      ),
    },
    {
      header: t('table.date') || 'Date',
      accessor: 'matchDate',
      render: (row) => {
        if (!row.matchDate) return <Text fontSize="sm">-</Text>;
        let d = new Date(row.matchDate);
        if (isNaN(d)) {
          // try converting MySQL datetime 'YYYY-MM-DD HH:MM:SS' -> 'YYYY-MM-DDTHH:MM:SS'
          try {
            d = new Date(String(row.matchDate).replace(' ', 'T'));
          } catch (e) {
            d = null;
          }
        }
        if (!d || isNaN(d)) return <Text fontSize="sm">{String(row.matchDate)}</Text>;
        const formatted = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        return <Text fontSize="sm">{formatted}</Text>;
      }
    },
    {
      header: t('table.goals') || 'Goals',
      accessor: 'goals',
      render: (row) => (
        <Badge variant={row.goals > 0 ? 'success' : 'default'}>
          {row.goals}
        </Badge>
      ),
    },
    {
      header: t('table.assists') || 'Assists',
      accessor: 'assists',
      render: (row) => (
        <Badge variant={row.assists > 0 ? 'info' : 'default'}>
          {row.assists}
        </Badge>
      ),
    },
    {
      header: t('table.minutes') || 'Minutes',
      accessor: 'minutes',
      render: (row) => (
        <Text fontSize="sm">{row.minutes}'</Text>
      ),
    },
    {
      header: t('table.saves') || 'Saves',
      accessor: 'saves',
      render: (row) => (
        <Text fontSize="sm">{row.saves}</Text>
      ),
    },
    {
      header: t('table.cards') || 'Cards',
      accessor: 'cards',
      render: (row) => (
        <HStack spacing={1}>
          {row.yellowCards > 0 && (
            <Badge variant="warning">Y{row.yellowCards}</Badge>
          )}
          {row.redCards > 0 && (
            <Badge variant="danger">R{row.redCards}</Badge>
          )}
          {row.yellowCards === 0 && row.redCards === 0 && (
            <Text fontSize="sm" color="gray.400">-</Text>
          )}
        </HStack>
      ),
    },
    {
      header: t('table.rating') || 'Rating',
      accessor: 'rating',
      render: (row) => (
        <Badge variant={getRatingColor(row.rating)}>
          {row.rating.toFixed(1)}
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

  const filterTypeOptions = [
    { value: 'all', label: t('filterAllRecords') || 'All Records' },
    { value: 'player', label: t('filterByPlayer') || 'By Player' },
    { value: 'match', label: t('filterByMatch') || 'By Match' },
  ];

  const getFilterValueOptions = () => {
    if (filterType === 'player') {
      return [{ value: 'all', label: t('filterAllPlayers') || 'All Players' }, ...uniquePlayers.map(p => ({ value: p, label: p }))];
    } else if (filterType === 'match') {
      return [{ value: 'all', label: t('filterAllMatches') || 'All Matches' }, ...uniqueMatches.map(m => ({ value: m, label: m }))];
    }
    return [];
  };

  return (
    <Layout pageTitle={t('statisticsManagement') || 'Statistics Management'} pageSubtitle={t('statsManagementDesc') || 'Manage player performance statistics'}>
      <Box bgGradient={bgGradient} px="32px" pt="24px" pb="32px" minH="100vh" dir={isRTL ? 'rtl' : 'ltr'}>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={6}>
        <StatsCard
          title={t('cardTotalStats') || 'Total Stats'}
          value={totalStats}
          icon={BarChart3}
          color="#0F172A"
          iconBg="#F1F5F9"
          primaryGreen={primaryGreen}
          cardBg={cardBg}
          cardBorder={cardBorder}
          cardShadow={cardShadow}
          textColor={textColor}
        />
        <StatsCard
          title={t('cardTotalGoals') || 'Total Goals'}
          value={totalGoals}
          icon={Target}
          color="#0F172A"
          iconBg="#F1F5F9"
          primaryGreen={primaryGreen}
          cardBg={cardBg}
          cardBorder={cardBorder}
          cardShadow={cardShadow}
          textColor={textColor}
        />
        <StatsCard
          title={t('cardTotalAssists') || 'Total Assists'}
          value={totalAssists}
          icon={TrendingUp}
          color="#0F172A"
          iconBg="#F1F5F9"
          primaryGreen={primaryGreen}
          cardBg={cardBg}
          cardBorder={cardBorder}
          cardShadow={cardShadow}
          textColor={textColor}
        />
        <StatsCard
          title={t('cardAvgRating') || 'Avg Rating'}
          value={avgRating}
          icon={Star}
          color="#0F172A"
          iconBg="#F1F5F9"
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
          title={t('cardTitleStats') || 'Player Statistics'}
          count={displayStats.length}
          actionLabel={t('actionAddStats') || 'Add Statistics'}
          onAction={onAddOpen}
        />

        <Flex gap={4} mb={6}>
          <Box flex={1}>
                <SearchInput
                  placeholder={t('searchPlaceholderStats') || 'Search by player, match, or opponent...'}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
          </Box>
          <Box width="180px">
            <FilterSelect
              placeholder={t('filterType') || 'Filter Type'}
              options={filterTypeOptions}
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterValue('all');
              }}
            />
          </Box>
          {filterType !== 'all' && (
              <Box width="220px">
              <FilterSelect
                placeholder={t('select') || 'Select...'}
                options={getFilterValueOptions()}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            </Box>
          )}
        </Flex>

        {statsLoading && !statsFetching ? (
          <Center py={8}>
            <Skeleton height="24px" width="80%" />
          </Center>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={displayStats}
              emptyMessage={t('emptyStats') || 'No statistics found'}
              wrapperBorderColor={cardBorder}
            />
            <Pagination page={page} setPage={setPage} totalPages={totalPages} pageSize={pageSize} setPageSize={setPageSize} isLoading={statsFetching} />
          </>
        )}
        </Box>
      </Box>

      <CrudFormModal
        isOpen={isAddOpen}
        onClose={onAddClose}
        mode="add"
        titleAdd={t('actionAddStats') || 'Add Player Statistics'}
        confirmLabelAdd={t('actionAddStats') || 'Add Statistics'}
        formData={formData}
        setFormData={setFormData}
        onConfirm={onConfirmAdd}
        fields={[
          { name: 'playerName', label: t('playerName') || 'Player Name', type: 'text', isRequired: true, placeholder: t('playerNamePlaceholder') || 'Enter player name' },
          { name: 'matchName', label: t('matchName') || 'Match Name', type: 'text', isRequired: true, placeholder: t('matchNamePlaceholder') || 'e.g., Academy U17 vs Riverside FC' },
          { name: 'goals', label: t('goals') || 'Goals', type: 'number', isRequired: true },
          { name: 'assists', label: t('assists') || 'Assists', type: 'number', isRequired: true },
          { name: 'minutes', label: t('minutes') || 'Minutes', type: 'number', isRequired: true },
          { name: 'saves', label: t('saves') || 'Saves', type: 'number', isRequired: true },
          { name: 'yellowCards', label: t('yellowCards') || 'Yellow Cards', type: 'number', isRequired: true },
          { name: 'redCards', label: t('redCards') || 'Red Cards', type: 'number', isRequired: true },
          { name: 'rating', label: t('rating') || 'Rating (0-10)', type: 'number', isRequired: true, inputType: 'number' },
        ]}
      />

      <CrudFormModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        mode="edit"
        titleEdit={t('editStatistics') || 'Edit Statistics'}
        confirmLabelEdit={t('saveChanges') || 'Save Changes'}
        formData={formData}
        setFormData={setFormData}
        onConfirm={onConfirmEdit}
        fields={[
          { name: 'playerName', label: t('playerName') || 'Player Name', type: 'text', isRequired: true },
          { name: 'matchName', label: t('matchName') || 'Match Name', type: 'text', isRequired: true },
          { name: 'goals', label: t('goals') || 'Goals', type: 'number', isRequired: true },
          { name: 'assists', label: t('assists') || 'Assists', type: 'number', isRequired: true },
          { name: 'minutes', label: t('minutes') || 'Minutes', type: 'number', isRequired: true },
          { name: 'saves', label: t('saves') || 'Saves', type: 'number', isRequired: true },
          { name: 'yellowCards', label: t('yellowCards') || 'Yellow Cards', type: 'number', isRequired: true },
          { name: 'redCards', label: t('redCards') || 'Red Cards', type: 'number', isRequired: true },
          { name: 'rating', label: t('rating') || 'Rating (0-10)', type: 'number', isRequired: true, inputType: 'number' },
        ]}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        title={t('deleteStatistics') || 'Delete Statistics'}
        body={t('confirmDeleteStats') || 'Are you sure you want to delete these statistics? This action cannot be undone.'}
        onConfirm={onConfirmDelete}
        confirmLabel={t('delete') || 'Delete'}
        cancelLabel={t('cancel') || 'Cancel'}
      />
    </Layout>
  );
};

export default AdminStatsPage;
