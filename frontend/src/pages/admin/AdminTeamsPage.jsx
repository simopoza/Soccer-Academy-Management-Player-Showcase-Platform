import { useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
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
  Textarea,
  Icon,
} from '@chakra-ui/react';
import { FiUsers } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';
import useCrudList from '../../hooks/useCrudList';
import { categoryOptions } from '../../utils/adminOptions';
import Layout from '../../components/layout/Layout';
import { DataTable, TableHeader } from '../../components/table';
import { Badge, ActionButtons, SearchInput, FilterSelect } from '../../components/ui';
import ConfirmModal from '../../components/admin/ConfirmModal';
import CrudFormModal from '../../components/admin/CrudFormModal';

const initialTeams = [
  { id: 1, name: 'Eagles', ageCategory: 'U16', playerCount: 22, coach: 'John Smith', founded: '2015', status: 'Active' },
  { id: 2, name: 'Hawks', ageCategory: 'U18', playerCount: 24, coach: 'Sarah Johnson', founded: '2014', status: 'Active' },
  { id: 3, name: 'Falcons', ageCategory: 'U14', playerCount: 20, coach: 'Mike Davis', founded: '2017', status: 'Active' },
  { id: 4, name: 'Eagles', ageCategory: 'U12', playerCount: 18, coach: 'Lisa Anderson', founded: '2018', status: 'Active' },
  { id: 5, name: 'Tigers', ageCategory: 'U16', playerCount: 21, coach: 'David Brown', founded: '2016', status: 'Active' },
  { id: 6, name: 'Lions', ageCategory: 'U14', playerCount: 19, coach: 'Emma Wilson', founded: '2017', status: 'Inactive' },
  { id: 7, name: 'Wolves', ageCategory: 'U18', playerCount: 23, coach: 'James Martinez', founded: '2015', status: 'Active' },
  { id: 8, name: 'Bears', ageCategory: 'U12', playerCount: 17, coach: 'Jennifer Taylor', founded: '2019', status: 'Active' },
];

// use shared `categoryOptions` from utils/adminOptions

const AdminTeamsPage = () => {
  const { t, i18n } = useTranslation();

  const { bgGradient, cardBg, cardBorder, cardShadow, primaryGreen, textColor } = useDashboardTheme();
  const pageBg = bgGradient;
  const isRTL = i18n?.language === 'ar';

  const {
    items: teams,
    setItems: setTeams,
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
  } = useCrudList({ initialData: initialTeams, initialForm: { name: '', ageCategory: 'U16', coach: '', description: '' } });

  const toast = useToast();
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.coach.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || team.ageCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const onConfirmAdd = () => {
    const created = handleAdd({ playerCount: 0, founded: new Date().getFullYear().toString(), status: 'Active' });
    toast({
      title: t('notification.teamAdded') || 'Team added',
      description: t('notification.teamAddedDesc') || `${created.name} ${created.ageCategory} has been added successfully.`,
      status: 'success',
      duration: 3000,
    });
    onAddClose();
    setFormData({ name: '', ageCategory: 'U16', coach: '', description: '' });
  };

  const onConfirmEdit = () => {
    const updated = handleEdit();
    toast({
      title: t('notification.teamUpdated') || 'Team updated',
      description: t('notification.teamUpdatedDesc') || `Team information has been updated successfully.`,
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
      title: t('notification.teamDeleted') || 'Team deleted',
      description: t('notification.teamDeletedDesc') || `${deleted?.name} has been removed.`,
      status: 'success',
      duration: 3000,
    });
    onDeleteClose();
    setSelectedItem(null);
    return deleted;
  };

  const onOpenEdit = (team) => openEditDialog(team);
  const onOpenDelete = (team) => openDeleteDialog(team);

  const columns = [
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

  return (
    <Layout pageTitle={t('teamsManagement') || 'Teams Management'} pageSubtitle={t('teamsManagementDesc') || 'Manage academy teams'}>
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
          title={t('cardTitleTeams') || 'All Teams'}
          count={filteredTeams.length}
          actionLabel={t('actionAddTeam') || 'Add Team'}
          onAction={onAddOpen}
        />

        <Flex gap={4} mb={6}>
          <Box flex={1}>
            <SearchInput
              placeholder={t('searchPlaceholderTeams') || 'Search by team name, or coach...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>
          <Box width="200px">
            <FilterSelect
              placeholder={t('filterAllCategories') || 'All Categories'}
              options={categoryOptions(t)}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
          </Box>
        </Flex>

        <DataTable
          columns={columns}
          data={filteredTeams}
          emptyMessage={t('emptyTeams') || 'No teams found'}
          wrapperBorderColor={cardBorder}
        />
        </Box>
      </Box>

      <CrudFormModal
        isOpen={isAddOpen}
        onClose={onAddClose}
        mode="add"
        titleAdd={t('modal.addTeam') || 'Add New Team'}
        confirmLabelAdd={t('actionAddTeam') || 'Add Team'}
        formData={formData}
        setFormData={setFormData}
        onConfirm={onConfirmAdd}
        fields={[
          { name: 'name', label: t('teamName') || 'Team Name', type: 'text', isRequired: true, placeholder: t('teamNamePlaceholder') || 'Enter team name' },
          { name: 'ageCategory', label: t('ageCategory') || 'Age Category', type: 'select', isRequired: true, options: [
            { value: 'U12', label: t('ageU12') || 'U12' },
            { value: 'U14', label: t('ageU14') || 'U14' },
            { value: 'U16', label: t('ageU16') || 'U16' },
            { value: 'U18', label: t('ageU18') || 'U18' },
          ] },
          { name: 'coach', label: t('coach') || 'Coach', type: 'text', isRequired: true, placeholder: t('coachPlaceholder') || 'Enter coach name' },
          { name: 'description', label: t('description') || 'Description', type: 'textarea', isRequired: false, rows: 3, placeholder: t('descriptionPlaceholder') || 'Enter team description (optional)' },
        ]}
      />

      <CrudFormModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        mode="edit"
        titleEdit={t('modal.editTeam') || 'Edit Team'}
        confirmLabelEdit={t('saveChanges') || 'Save Changes'}
        formData={formData}
        setFormData={setFormData}
        onConfirm={onConfirmEdit}
        fields={[
          { name: 'name', label: t('teamName') || 'Team Name', type: 'text', isRequired: true },
          { name: 'ageCategory', label: t('ageCategory') || 'Age Category', type: 'select', isRequired: true, options: [
            { value: 'U12', label: t('ageU12') || 'U12' },
            { value: 'U14', label: t('ageU14') || 'U14' },
            { value: 'U16', label: t('ageU16') || 'U16' },
            { value: 'U18', label: t('ageU18') || 'U18' },
          ] },
          { name: 'coach', label: t('coach') || 'Coach', type: 'text', isRequired: true },
          { name: 'description', label: t('description') || 'Description', type: 'textarea', isRequired: false, rows: 3 },
        ]}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        title={t('modal.deleteTeam') || 'Delete Team'}
        body={t('confirmDeleteTeam') || `Are you sure you want to delete ${selectedItem?.name} ${selectedItem?.ageCategory}? This action cannot be undone.`}
        onConfirm={onConfirmDelete}
        confirmLabel={t('delete') || 'Delete'}
        cancelLabel={t('cancel') || 'Cancel'}
      />
    </Layout>
  );
};

export default AdminTeamsPage;
