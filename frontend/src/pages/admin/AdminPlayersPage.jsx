import { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  useToast,
  Text,
} from '@chakra-ui/react';
import { Star } from 'lucide-react';
import adminPlayersConfig from '../../constants/adminPlayers.config';
import { useTranslation } from 'react-i18next';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';
import useCrudList from '../../hooks/useCrudList';
import useAdminPlayers from '../../hooks/useAdminPlayers';
// teams are loaded from the API; remove static helpers
import Layout from '../../components/layout/Layout';
import { DataTable, TableHeader } from '../../components/table';
import { Badge, AvatarCircle, ActionButtons, SearchInput, FilterSelect } from '../../components/ui';
import Pagination from '../../components/ui/Pagination';
import playerService from '../../services/playerService';
import useTeamsOptions from '../../hooks/useTeamsOptions';
import CrudFormModal from '../../components/admin/CrudFormModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

const initialPlayers = [];

// teamOptionsStatic removed — teams loaded from backend

const AdminPlayersPage = () => {
  const { t, i18n } = useTranslation();

  const { bgGradient, cardBg, cardBorder } = useDashboardTheme();
  const isRTL = i18n?.language === 'ar';

  const {
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
  } = useCrudList({
    initialData: initialPlayers,
    initialForm: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      height: '',
      weight: '',
      position: 'Midfielder',
      strong_foot: 'Right',
      team_id: '',
      email: '',
      sendInvite: false,
    }
  });


  const toast = useToast();
  const [teamFilter, setTeamFilter] = useState('all');
  const { teamsOptions } = useTeamsOptions();

  const {
    players,
    rawPlayers,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    searchQuery,
    setSearchQuery,
    isLoading,
    isFetching,
    refetch,
  } = useAdminPlayers();

  // derive team options from cached teams via `useTeamsOptions`
  const teamOptions = [{ value: 'all', label: t('filterAllTeams') || 'All Teams' }, ...teamsOptions.filter(o => o.value !== '').map(o => ({ value: o.value, label: o.label }))];

  const filteredPlayers = (players || []).filter(player => {
    const matchesSearch = !searchQuery || (player.name || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchesTeam = teamFilter === 'all' || String(player.team_id || player.team) === String(teamFilter) || player.team === teamFilter;
    return matchesSearch && matchesTeam;
  });

  const onConfirmAdd = () => {
    (async () => {
      try {
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          position: formData.position,
          strong_foot: formData.strong_foot,
          team_id: formData.team_id ? parseInt(formData.team_id) : null,
          email: formData.email || null,
          sendInvite: formData.sendInvite === true || formData.sendInvite === 'true',
        };
        const resp = await playerService.adminCreatePlayer(payload);
        await refetch();
        toast({ title: t('notification.playerAdded') || 'Player added', description: t('notification.playerAddedDesc') || `${payload.first_name || ''} ${payload.last_name || ''} has been added successfully.`, status: 'success', duration: 3000 });
        onAddClose();
        setFormData({ first_name: '', last_name: '', date_of_birth: '', height: '', weight: '', position: 'Midfielder', strong_foot: 'Right', team_id: '', email: '', sendInvite: false });
      } catch (err) {
        console.error('Error adding player', err);
        toast({ title: 'Failed to add player', status: 'error', duration: 4000 });
      }
    })();
  };

  const onConfirmEdit = () => {
    (async () => {
      try {
        if (!selectedItem) return;
        const id = selectedItem.id;
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          position: formData.position,
          strong_foot: formData.strong_foot,
          team_id: formData.team_id ? parseInt(formData.team_id) : null,
        };
        await playerService.updatePlayer(id, payload);
        await refetch();
        toast({ title: t('notification.playerUpdated') || 'Player updated', description: t('notification.playerUpdatedDesc') || `Player information has been updated successfully.`, status: 'success', duration: 3000 });
        onEditClose();
        setSelectedItem(null);
      } catch (err) {
        console.error('Error updating player', err);
        toast({ title: 'Failed to update player', status: 'error', duration: 4000 });
      }
    })();
  };

  const onConfirmDelete = () => {
    (async () => {
      try {
        if (!selectedItem) return;
        const id = selectedItem.id;
        await playerService.deletePlayer(id);
        await refetch();
        toast({ title: t('notification.playerDeleted') || 'Player deleted', description: t('notification.playerDeletedDesc') || `${selectedItem?.name} has been removed.`, status: 'success', duration: 3000 });
        onDeleteClose();
        setSelectedItem(null);
      } catch (err) {
        console.error('Error deleting player', err);
        toast({ title: 'Failed to delete player', status: 'error', duration: 4000 });
      }
    })();
  };

  const onOpenEdit = async (player) => {
    try {
      // Fetch full player details to populate form
      const fullPlayer = await playerService.getPlayerById(player.id);
      const editFormData = {
        first_name: fullPlayer.first_name || '',
        last_name: fullPlayer.last_name || '',
        date_of_birth: fullPlayer.date_of_birth ? fullPlayer.date_of_birth.split('T')[0] : '',
        height: fullPlayer.height || '',
        weight: fullPlayer.weight || '',
        position: fullPlayer.position || '',
        strong_foot: fullPlayer.strong_foot || 'Right',
        team_id: fullPlayer.team_id ? String(fullPlayer.team_id) : '',
      };
      setSelectedItem(player);
      setFormData(editFormData);
      onEditOpen();
    } catch (err) {
      console.error('Failed to fetch player details', err);
      toast({ title: 'Failed to load player details', status: 'error', duration: 3000 });
    }
  };
  const onOpenDelete = (player) => {
    // openDeleteDialog isn't available in this hook usage; instead set selected item and open delete modal
    setSelectedItem(player);
    if (typeof onDeleteOpen === 'function') onDeleteOpen();
  };

  // teams are provided by useTeamsOptions

  const getRatingColor = (rating) => {
    if (rating >= 8.5) return 'success';
    if (rating >= 7.5) return 'info';
    return 'warning';
  };

  const columns = adminPlayersConfig.createPlayerColumns({ t, onEdit: onOpenEdit, onDelete: onOpenDelete });

  return (
    <Layout pageTitle={t('playersManagement') || 'Players Management'} pageSubtitle={t('playersManagementDesc') || 'Manage academy players'}>
      <Box bgGradient={bgGradient} px="32px" pt="24px" pb="32px" minH="100vh" dir={isRTL ? 'rtl' : 'ltr'}>
        <Box
          bg={cardBg}
          borderRadius="12px"
          boxShadow="0 10px 25px rgba(0,0,0,0.05)"
          border="1px"
          borderColor={cardBorder}
          p="24px"
        >
        <TableHeader
          title={t('cardTitlePlayers') || 'All Players'}
          count={filteredPlayers.length}
          actionLabel={t('actionAddPlayer') || 'Add Player'}
          onAction={onAddOpen}
        />

        <Flex gap={4} mb={6}>
          <Box flex={1}>
              <SearchInput
                placeholder={t('searchPlaceholderPlayers') || 'Search by player name...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Box>
            <Box width="200px">
              <FilterSelect
                placeholder={t('filterAllTeams') || 'All Teams'}
                options={teamOptions}
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
            </Box>
        </Flex>

        <DataTable
          columns={columns}
          data={filteredPlayers}
          emptyMessage="No players found"
          wrapperBorderColor={cardBorder}
        />
        <Pagination page={page} setPage={setPage} totalPages={totalPages} pageSize={pageSize} setPageSize={setPageSize} />
        </Box>
      </Box>

      <CrudFormModal
        isOpen={isAddOpen}
        onClose={onAddClose}
        mode="add"
        titleAdd={t('modal.addPlayer') || t('actionAddPlayer') || 'Add New Player'}
        confirmLabelAdd={t('actionAddPlayer') || 'Add Player'}
        formData={formData}
        setFormData={setFormData}
        onConfirm={onConfirmAdd}
        fields={adminPlayersConfig.getPlayerAddFields(teamsOptions, t)}
      />

      <CrudFormModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        mode="edit"
        titleEdit={t('modal.editPlayer') || 'Edit Player'}
        confirmLabelEdit={t('saveChanges') || 'Save Changes'}
        formData={formData}
        setFormData={setFormData}
        onConfirm={onConfirmEdit}
        fields={adminPlayersConfig.getPlayerEditFields(teamsOptions, t)}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        title={t('modal.deletePlayer') || 'Delete Player'}
        body={t('confirmDeletePlayer') || `Are you sure you want to delete ${selectedItem?.name}? This action cannot be undone.`}
        onConfirm={onConfirmDelete}
        confirmLabel={t('actionDelete') || 'Delete'}
        cancelLabel={t('cancel') || 'Cancel'}
      />
    </Layout>
  );
};

export default AdminPlayersPage;
