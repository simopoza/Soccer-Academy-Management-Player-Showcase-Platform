import React from 'react';
import {
  Box,
  Flex,
  HStack,
  useDisclosure,
  Button,
  useToast,
  useColorModeValue,
  Skeleton,
  SkeletonCircle,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';
import Layout from '../../components/layout/Layout';
import { DataTable, TableHeader } from '../../components/table';
import { Badge, AvatarCircle, ActionButtons, SearchInput, FilterSelect } from '../../components/ui';
import Pagination from '../../components/ui/Pagination';
import useCrudList from '../../hooks/useCrudList';
import useAdminUsers from '../../hooks/useAdminUsers';
import { roleOptions } from '../../utils/adminOptions';
import CrudFormModal from '../../components/admin/CrudFormModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

// start with empty list; we'll load from API on mount
const initialUsers = [];

const AdminUsersManagementPage = () => {
  const { t, i18n } = useTranslation();

  const { bgGradient, cardBg, cardBorder } = useDashboardTheme();
  const nameColor = useColorModeValue('gray.900', 'gray.100');
  const emailColor = useColorModeValue('gray.500', 'gray.300');


  const isRTL = i18n?.language === 'ar';

  const {
    // only UI state managed here
    selectedItem,
    setSelectedItem,
    formData,
    setFormData,
    isDeleteOpen,
    onDeleteClose,
    openDeleteDialog,
  } = useCrudList({ initialData: initialUsers, initialForm: { name: '', email: '', role: 'player' } });

  const {
    users,
    rawUsers,
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
    approve,
    reject,
    remove,
    updateRole,
  } = useAdminUsers({ initialPage: 1, initialPageSize: 10 });

  const toast = useToast();
  const { isOpen: isRoleChangeOpen, onOpen: onRoleChangeOpen, onClose: onRoleChangeClose } = useDisclosure();

  // data + actions come from `useAdminUsers`

  const roleOptionsList = roleOptions(t);

  const [roleFilter, setRoleFilter] = React.useState('all');

  // `users` already paginated and filtered by searchQuery inside the hook; apply role filter here
  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || (user.role || '').toLowerCase() === roleFilter.toLowerCase();
    return matchesRole;
  });

  // CRUD actions implemented where needed (role change handled below)

  const onConfirmDelete = async () => {
    try {
      if (!selectedItem) return;
      const id = selectedItem.id;
      await remove(id);

      toast({
        title: t('buttonDelete') || 'User deleted',
        description: `${selectedItem?.name} ${t('buttonDelete') || 'has been removed.'}`,
        status: 'success',
        duration: 3000,
      });
      onDeleteClose();
      setSelectedItem(null);
    } catch (err) {
      console.error('Error deleting user', err);
      toast({ title: 'Failed to delete user', status: 'error', duration: 4000 });
    }
  };

  const handleApprove = async (user) => {
    try {
      await approve(user.id);
      toast({
        title: t('approved') || 'User approved',
        description: `${user.name} has been approved successfully`,
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      console.error('Error approving user', err);
      toast({ title: 'Failed to approve user', status: 'error', duration: 4000 });
    }
  };

  const handleReject = async (user) => {
    try {
      await reject(user.id);
      toast({
        title: t('rejected') || 'User rejected',
        description: `${user.name} has been rejected and removed`,
        status: 'warning',
        duration: 3000,
      });
    } catch (err) {
      console.error('Error rejecting user', err);
      toast({ title: 'Failed to reject user', status: 'error', duration: 4000 });
    }
  };

  const openRoleChangeModal = () => {
    if (filteredUsers.length === 0) {
      toast({ title: 'No users to change role', status: 'info', duration: 3000 });
      return;
    }
    // Pre-select the first user or keep it empty
    setFormData({ userId: '', role: '' });
    onRoleChangeOpen();
  };

  const onConfirmRoleChange = async () => {
    try {
      if (!formData.userId || !formData.role) {
        toast({ title: 'Please select user and role', status: 'warning', duration: 3000 });
        return;
      }
      await updateRole({ id: parseInt(formData.userId), role: formData.role });
      toast({
        title: t('buttonSave') || 'Role updated',
        description: 'User role has been updated successfully.',
        status: 'success',
        duration: 3000,
      });
      onRoleChangeClose();
      setFormData({ userId: '', role: '' });
    } catch (err) {
      console.error('Error updating role', err);
      toast({ title: 'Failed to update role', status: 'error', duration: 4000 });
    }
  };

  const getRoleLabel = (role) => {
    const found = roleOptionsList.find(r => r.value === role);
    return found ? found.label : role;
  };

  const columns = [
    {
      header: t('table.user') || 'Name',
      accessor: 'name',
      render: (row) => {
        const parts = (row.name || '').split(' ');
        const first = parts.shift() || '';
        const last = parts.join(' ') || '';
        return (
          <HStack spacing={3} align="center">
            <AvatarCircle name={row.name} src={row.image} size="sm" />
            <HStack spacing={2} align="baseline">
              <Box fontWeight="600" fontSize="14px" color={nameColor}>{first}</Box>
              <Box fontSize="14px" color={nameColor} opacity={0.9}>{last}</Box>
            </HStack>
          </HStack>
        );
      },
    },
    {
      header: t('table.email') || 'Email',
      accessor: 'email',
      render: (row) => (
        <Box fontSize="14px" color={emailColor}>{row.email}</Box>
      ),
    },
    {
      header: t('table.role') || 'Role',
      accessor: 'role',
      render: (row) => (
        <Badge variant="info">{getRoleLabel(row.role)}</Badge>
      ),
    },
    {
      header: t('table.status') || 'Status',
      accessor: 'status',
      render: (row) => {
        // normalize incoming status values to handle both backend variants (e.g. 'approved' or 'Active')
        const rawStatus = String(row.status || '').toLowerCase();
        const statusMap = {
          approved: { variant: 'success', label: 'Active' },
          active: { variant: 'success', label: 'Active' },
          pending: { variant: 'default', label: 'Pending' },
          rejected: { variant: 'default', label: 'Rejected' },
        };
        const statusInfo = statusMap[rawStatus] || { variant: 'default', label: row.status || '' };

        // Prefer translations like 'statusActive' then fallback to 'active' key then raw label
        const keyStatus = `status${statusInfo.label}`;
        const translatedStatusKey = t(keyStatus);
        let statusText = statusInfo.label;
        if (translatedStatusKey && translatedStatusKey !== keyStatus) {
          statusText = translatedStatusKey;
        } else {
          const altKey = String(statusInfo.label).toLowerCase();
          const translatedAlt = t(altKey);
          if (translatedAlt && translatedAlt !== altKey) statusText = translatedAlt;
        }

        return (
          <Badge variant={statusInfo.variant}>{statusText}</Badge>
        );
      },
    },
    {
      header: t('table.actions') || 'Actions',
      accessor: 'actions',
      render: (row) => {
        const isPending = row.status === 'pending';
        return (
          <HStack spacing={2} justify="center">
            {isPending && (
              <>
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={() => handleApprove(row)}
                >
                  {t('approve') || 'Approve'}
                </Button>
                <Button
                  size="sm"
                  colorScheme="orange"
                  onClick={() => handleReject(row)}
                >
                  {t('reject') || 'Reject'}
                </Button>
              </>
            )}
            <ActionButtons
              onDelete={() => openDeleteDialog(row)}
            />
          </HStack>
        );
      },
    },
  ];

  return (
    <Layout pageTitle={t('pageTitle') || 'Users Management'} pageSubtitle={t('pageSubtitle') || 'Manage academy users and permissions'}>
      <Box bgGradient={bgGradient} px="32px" pt="24px" pb="32px" minH="100vh" dir={isRTL ? 'rtl' : 'ltr'}>
        <Box bg={cardBg} borderRadius="12px" borderWidth="1px" borderStyle="solid" borderColor={cardBorder} boxShadow="0 10px 25px rgba(0,0,0,0.05)" p="24px">
          <TableHeader
            title={t('cardTitle') || 'All Users'}
            count={total}
            actionLabel={t('changeRole') || 'Change Role'}
            onAction={openRoleChangeModal}
          />

          <Flex gap={4} mb="24px">
            <Box flex={1}>
              <SearchInput
                placeholder={t('searchPlaceholderUsers') || 'Search by name or email...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Box>
            <Box width="200px">
              <FilterSelect
                placeholder={t('filterAllRoles') || 'All Roles'}
                options={roleOptionsList}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              />
            </Box>
          </Flex>

          {isLoading ? (
            // Chakra skeleton for nicer look
            <>
              {[1,2,3,4,5].map(i => (
                <Box key={i} display="flex" alignItems="center" gap={3} mb="12px">
                  <SkeletonCircle size="40px" />
                  <Box flex={1}>
                    <Skeleton height="14px" width="60%" mb="8px" />
                    <Skeleton height="12px" width="40%" />
                  </Box>
                </Box>
              ))}
            </>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={filteredUsers}
                emptyMessage={t('emptyMessage') || 'No users found'}
                wrapperBorderColor={cardBorder}
              />

              {/* Reusable pagination component */}
              <Pagination page={page} setPage={setPage} totalPages={totalPages} pageSize={pageSize} setPageSize={setPageSize} />
            </>
          )}
        </Box>
      </Box>

      {/* Change Role Modal */}
      <CrudFormModal
        isOpen={isRoleChangeOpen}
        onClose={onRoleChangeClose}
        mode="edit"
        titleEdit={t('changeUserRole') || 'Change User Role'}
        confirmLabelEdit={t('buttonSave') || 'Save Changes'}
        cancelLabel={t('buttonCancel') || 'Cancel'}
        formData={formData}
        setFormData={setFormData}
        onConfirm={onConfirmRoleChange}
        fields={[
          { 
            name: 'userId', 
            label: t('form.selectUser') || 'Select User', 
            type: 'select', 
            isRequired: true, 
            options: filteredUsers.filter(u => u.status === 'approved').map(u => ({ value: u.id, label: u.name })) 
          },
          { 
            name: 'role', 
            label: t('form.role') || 'Role', 
            type: 'select', 
            isRequired: true, 
            options: roleOptionsList 
          },
        ]}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        title={t('modalDeleteTitle') || 'Delete User'}
        body={t('confirmDelete', { name: selectedItem?.name }) || `Are you sure you want to delete ${selectedItem?.name}? This action cannot be undone.`}
        onConfirm={onConfirmDelete}
        confirmLabel={t('buttonDelete') || 'Delete'}
        cancelLabel={t('buttonCancel') || 'Cancel'}
      />

    </Layout>
  );
};

export default AdminUsersManagementPage;

