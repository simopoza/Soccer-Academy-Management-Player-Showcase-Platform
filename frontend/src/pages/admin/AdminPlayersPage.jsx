import { useState } from 'react';
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
import { teamOptionsFromArray } from '../../utils/adminOptions';
import Layout from '../../components/layout/Layout';
import { DataTable, TableHeader } from '../../components/table';
import { Badge, AvatarCircle, ActionButtons, SearchInput, FilterSelect } from '../../components/ui';
import CrudFormModal from '../../components/admin/CrudFormModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

const initialPlayers = [
  { id: 1, name: 'Emma Wilson', team: 'Eagles U16', position: 'Midfielder', rating: 8.5, jerseyNumber: 10, status: 'Active' },
  { id: 2, name: 'Michael Chen', team: 'Hawks U18', position: 'Forward', rating: 9.2, jerseyNumber: 9, status: 'Active' },
  { id: 3, name: 'Sarah Davis', team: 'Eagles U16', position: 'Defender', rating: 7.8, jerseyNumber: 4, status: 'Active' },
  { id: 4, name: 'James Rodriguez', team: 'Falcons U14', position: 'Goalkeeper', rating: 8.9, jerseyNumber: 1, status: 'Active' },
  { id: 5, name: 'Olivia Martinez', team: 'Hawks U18', position: 'Winger', rating: 8.1, jerseyNumber: 7, status: 'Active' },
  { id: 6, name: 'David Thompson', team: 'Eagles U12', position: 'Striker', rating: 7.5, jerseyNumber: 11, status: 'Injured' },
  { id: 7, name: 'Sofia Garcia', team: 'Falcons U14', position: 'Midfielder', rating: 8.3, jerseyNumber: 8, status: 'Active' },
  { id: 8, name: 'Lucas Anderson', team: 'Hawks U18', position: 'Defender', rating: 8.7, jerseyNumber: 5, status: 'Active' },
];

const teamOptionsStatic = [
  { value: 'all', label: 'All Teams' },
  { value: 'Eagles U16', label: 'Eagles U16' },
  { value: 'Hawks U18', label: 'Hawks U18' },
  { value: 'Falcons U14', label: 'Falcons U14' },
  { value: 'Eagles U12', label: 'Eagles U12' },
];

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
  } = useCrudList({ initialData: initialPlayers, initialForm: { name: '', team: 'Eagles U16', position: 'Midfielder', jerseyNumber: '' } });

  const toast = useToast();
  const [teamFilter, setTeamFilter] = useState('all');

  // derive team options from current players list (keeps the list up-to-date)
  const uniqueTeams = Array.from(new Set(players.map(p => p.team))).sort();
  const teamOptions = teamOptionsFromArray(t, uniqueTeams);

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = teamFilter === 'all' || player.team === teamFilter;
    return matchesSearch && matchesTeam;
  });

  const onConfirmAdd = () => {
    const created = handleAdd({ jerseyNumber: parseInt(formData.jerseyNumber), rating: 7.0, status: 'Active' });
    toast({
      title: t('notification.playerAdded') || 'Player added',
      description: t('notification.playerAddedDesc') || `${created.name} has been added successfully.`,
      status: 'success',
      duration: 3000,
    });
    onAddClose();
    setFormData({ name: '', team: 'Eagles U16', position: 'Midfielder', jerseyNumber: '' });
  };

  const onConfirmEdit = () => {
    const updated = handleEdit();
    toast({
      title: t('notification.playerUpdated') || 'Player updated',
      description: t('notification.playerUpdatedDesc') || `Player information has been updated successfully.`,
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
      title: t('notification.playerDeleted') || 'Player deleted',
      description: t('notification.playerDeletedDesc') || `${deleted?.name} has been removed.`,
      status: 'success',
      duration: 3000,
    });
    onDeleteClose();
    setSelectedItem(null);
    return deleted;
  };

  const onOpenEdit = (player) => openEditDialog(player);
  const onOpenDelete = (player) => openDeleteDialog(player);

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
        render: (row) => (
          <Badge variant="info">{t('position' + row.position) ? t('position' + row.position) : (
            // fallback: try mapped keys
            row.position === 'Goalkeeper' ? t('positionGoalkeeper') :
            row.position === 'Defender' ? t('positionDefender') :
            row.position === 'Midfielder' ? t('positionMidfielder') :
            row.position === 'Forward' ? t('positionForward') :
            row.position === 'Winger' ? t('positionWinger') :
            row.position === 'Striker' ? t('positionStriker') : row.position
          )}</Badge>
        ),
    },
    {
      header: t('table.rating') || 'Rating',
      accessor: 'rating',
      render: (row) => (
        <HStack spacing={2}>
          <Star size={14} color="#F59E0B" />
          <Badge variant={getRatingColor(row.rating)}>
            {row.rating.toFixed(1)}
          </Badge>
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
          { name: 'name', label: t('playerName') || 'Name', type: 'text', isRequired: true, placeholder: t('playerNamePlaceholder') || 'Enter player name' },
          { name: 'team', label: t('team') || 'Team', type: 'select', isRequired: true, options: teamOptions },
          { name: 'position', label: t('table.position') || 'Position', type: 'select', isRequired: true, options: [
            { value: 'Goalkeeper', label: t('positionGoalkeeper') || 'Goalkeeper' },
            { value: 'Defender', label: t('positionDefender') || 'Defender' },
            { value: 'Midfielder', label: t('positionMidfielder') || 'Midfielder' },
            { value: 'Forward', label: t('positionForward') || 'Forward' },
            { value: 'Winger', label: t('positionWinger') || 'Winger' },
            { value: 'Striker', label: t('positionStriker') || 'Striker' },
          ] },
          { name: 'jerseyNumber', label: t('jerseyNumber') || 'Jersey Number', type: 'number', isRequired: true, placeholder: t('jerseyNumberPlaceholder') || 'Enter jersey number' },
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
          { name: 'name', label: t('playerName') || 'Name', type: 'text', isRequired: true },
          { name: 'team', label: t('team') || 'Team', type: 'select', isRequired: true, options: teamOptions },
          { name: 'position', label: t('table.position') || 'Position', type: 'select', isRequired: true, options: [
            { value: 'Goalkeeper', label: t('positionGoalkeeper') || 'Goalkeeper' },
            { value: 'Defender', label: t('positionDefender') || 'Defender' },
            { value: 'Midfielder', label: t('positionMidfielder') || 'Midfielder' },
            { value: 'Forward', label: t('positionForward') || 'Forward' },
            { value: 'Winger', label: t('positionWinger') || 'Winger' },
            { value: 'Striker', label: t('positionStriker') || 'Striker' },
          ] },
          { name: 'jerseyNumber', label: t('jerseyNumber') || 'Jersey Number', type: 'number', isRequired: true },
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
