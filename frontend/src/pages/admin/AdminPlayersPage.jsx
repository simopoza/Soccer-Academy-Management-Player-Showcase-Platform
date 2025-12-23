import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Text,
} from '@chakra-ui/react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';
import useCrudList from '../../hooks/useCrudList';
// teams are loaded from the API; remove static helpers
import Layout from '../../components/layout/Layout';
import { DataTable, TableHeader } from '../../components/table';
import { Badge, AvatarCircle, ActionButtons, SearchInput, FilterSelect } from '../../components/ui';
import playerService from '../../services/playerService';
import CrudFormModal from '../../components/admin/CrudFormModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

const initialPlayers = [];

// teamOptionsStatic removed — teams loaded from backend

const AdminPlayersPage = () => {
  const { t, i18n } = useTranslation();

  const { bgGradient, cardBg, cardBorder, cardShadow, primaryGreen, textColor } = useDashboardTheme();
  const pageBg = bgGradient;
  const isRTL = i18n?.language === 'ar';

  const {
    items: players,
    setItems: setPlayers,
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
  const [teams, setTeams] = useState([]);

  // load team options from API (keeps the list up-to-date)
  // use `filterAllTeams` i18n key (consistent with other helpers) so translations (e.g. Arabic) show correctly
  const teamOptions = [{ value: 'all', label: t('filterAllTeams') || 'All Teams' }, ...teams.map(tm => ({ value: String(tm.id), label: tm.name }))];

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = teamFilter === 'all' || player.team === teamFilter;
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
        const newPlayer = {
          id: resp.id,
          name: `${payload.first_name || ''} ${payload.last_name || ''}`.trim(),
          team: teams.find(ti => ti.id === payload.team_id)?.name || '',
          position: payload.position,
          status: 'Active',
        };
        setPlayers(prev => [...prev, newPlayer]);
        toast({ title: t('notification.playerAdded') || 'Player added', description: t('notification.playerAddedDesc') || `${newPlayer.name} has been added successfully.`, status: 'success', duration: 3000 });
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
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, name: `${payload.first_name} ${payload.last_name}`.trim(), team: teams.find(ti => ti.id === payload.team_id)?.name || p.team, position: payload.position } : p));
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
        setPlayers(prev => prev.filter(p => p.id !== id));
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
  const onOpenDelete = (player) => openDeleteDialog(player);

  // Load players and teams from API on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const resp = await playerService.getPlayers();
        const list = Array.isArray(resp) ? resp : [];
        const mapped = list.map(p => ({
          id: p.id,
          name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
          team: p.team_name || '',
          position: p.position || '',
          status: p.status || 'Active',
        }));
        if (mounted) setPlayers(mapped);
      } catch (err) {
        console.error('Failed to load players', err);
        toast({ title: 'Failed to load players', status: 'error', duration: 4000 });
      }

      try {
        const teamsResp = await playerService.getTeams();
        if (mounted) setTeams(Array.isArray(teamsResp) ? teamsResp : []);
      } catch (err) {
        console.error('Failed to load teams', err);
      }
    };

    load();
    return () => { mounted = false; };
  }, [setPlayers, toast]);

  const getRatingColor = (rating) => {
    if (rating >= 8.5) return 'success';
    if (rating >= 7.5) return 'info';
    return 'warning';
  };

  const columns = [
    {
      header: t('table.player') || 'Player',
      accessor: 'name',
      render: (row) => (
        <HStack spacing={3} align="center">
          <AvatarCircle name={row.name} size="sm" />
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
          // Try direct translation key first (e.g. positionGoalkeeper or positionGK)
          const rawKey = `position${row.position}`;
          const direct = t(rawKey);
          let posLabel = direct;

          // If translation not found (i18n may return the key itself or an object), try mapping abbreviations
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
              // final fallback: show the mapped English label or raw position
              posLabel = mapped;
            }
          }

          return (
            <Badge variant="info">{posLabel}</Badge>
          );
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
        <ActionButtons
          onEdit={() => openEditDialog(row)}
          onDelete={() => openDeleteDialog(row)}
        />
      ),
    },
  ];

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
        fields={[
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
          { name: 'team_id', label: t('team') || 'Team', type: 'select', isRequired: false, options: teams.map(tm => ({ value: String(tm.id), label: tm.name })) },
        ]}
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
        fields={[
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
          { name: 'team_id', label: t('team') || 'Team', type: 'select', isRequired: false, options: teams.map(tm => ({ value: String(tm.id), label: tm.name })) },
        ]}
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
