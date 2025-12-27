import { useState } from 'react';
import {
  Box,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';
import useCrudList from '../../hooks/useCrudList';
import useAdminTeams from '../../hooks/useAdminTeams';
import Pagination from '../../components/ui/Pagination';
import { Skeleton, Center } from '@chakra-ui/react';
import { categoryOptions } from '../../utils/adminOptions';
// playerService is not used here anymore; CRUD goes through useAdminTeams
import Layout from '../../components/layout/Layout';
import { DataTable, TableHeader } from '../../components/table';
import { SearchInput, FilterSelect } from '../../components/ui';
import ConfirmModal from '../../components/admin/ConfirmModal';
import CrudFormModal from '../../components/admin/CrudFormModal';
import { createColumns, getAddFields, getEditFields } from '../../constants/adminTeams.config';

// teams are loaded from backend via API

// use shared `categoryOptions` from utils/adminOptions

const AdminTeamsPage = () => {
  const { t, i18n } = useTranslation();

  const { bgGradient, cardBg, cardBorder } = useDashboardTheme();
  const isRTL = i18n?.language === 'ar';

  const {
    // useCrudList provides modal/form state only; the teams list and search
    // are fetched server-side via `useAdminTeams`.
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
  } = useCrudList({ initialData: [], initialForm: { name: '', ageCategory: 'U16', coach: '', description: '' } });

  // Use paginated server-side teams hook
  const {
    teams,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    searchQuery,
    setSearchQuery,
    isLoading,
    refetch,
    addTeam,
    updateTeam,
    deleteTeam,
  } = useAdminTeams({ initialPage: 1, initialPageSize: 10 });

  const toast = useToast();
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.coach.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || team.ageCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const onConfirmAdd = async () => {
    try {
      const payload = {
        name: formData.name,
        age_limit: formData.ageCategory ? Number(formData.ageCategory.replace('U','')) : null,
        coach: formData.coach || null,
        founded: formData.founded || new Date().getFullYear().toString(),
        status: formData.status || 'Active',
      };
      await addTeam(payload);
      toast({ title: t('notification.teamAdded') || 'Team added', description: t('notification.teamAddedDesc') || `${payload.name} has been added.`, status: 'success', duration: 3000 });
      onAddClose();
      setFormData({ name: '', ageCategory: 'U16', coach: '', description: '' });
      refetch();
    } catch (err) {
      toast({ title: t('error') || 'Error', description: err?.response?.data?.message || 'Failed to add team', status: 'error' });
    }
  };

  const onConfirmEdit = async () => {
    try {
      const payload = {
        name: formData.name,
        age_limit: formData.ageCategory ? Number(formData.ageCategory.replace('U','')) : null,
        coach: formData.coach || null,
        founded: formData.founded || null,
        status: formData.status || 'Active',
      };
      await updateTeam({ id: selectedItem.id, data: payload });
      toast({ title: t('notification.teamUpdated') || 'Team updated', description: t('notification.teamUpdatedDesc') || `Team information has been updated successfully.`, status: 'success', duration: 3000 });
      onEditClose();
      setSelectedItem(null);
      refetch();
    } catch (err) {
      toast({ title: t('error') || 'Error', description: err?.response?.data?.message || 'Failed to update team', status: 'error' });
    }
  };

  const onConfirmDelete = async () => {
    try {
      await deleteTeam(selectedItem.id);
      toast({ title: t('notification.teamDeleted') || 'Team deleted', description: t('notification.teamDeletedDesc') || `${selectedItem?.name} has been removed.`, status: 'success', duration: 3000 });
      onDeleteClose();
      setSelectedItem(null);
      refetch();
    } catch (err) {
      toast({ title: t('error') || 'Error', description: err?.response?.data?.message || 'Failed to delete team', status: 'error' });
    }
  };

  

  const columns = createColumns(t, openEditDialog, openDeleteDialog);

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
          count={total}
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

        {isLoading ? (
          <Center py={8}>
            <Skeleton height="24px" width="80%" />
          </Center>
        ) : (
          <DataTable
            columns={columns}
            data={filteredTeams}
            emptyMessage={t('emptyTeams') || 'No teams found'}
            wrapperBorderColor={cardBorder}
          />
        )}

        <Box mt={4}>
          <Pagination page={page} setPage={setPage} totalPages={totalPages} pageSize={pageSize} setPageSize={setPageSize} />
        </Box>
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
        fields={getAddFields(t)}
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
        fields={getEditFields(t)}
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
