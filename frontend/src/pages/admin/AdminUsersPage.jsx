import React, { useState, useEffect } from 'react';
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
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';
import Layout from '../../components/layout/Layout';
import { DataTable, TableHeader } from '../../components/table';
import { Badge, AvatarCircle, ActionButtons, SearchInput, FilterSelect } from '../../components/ui';
import useCrudList from '../../hooks/useCrudList';
import { roleOptions } from '../../utils/adminOptions';
import userService from '../../services/userService';
import adminService from '../../services/adminService';
import CrudFormModal from '../../components/admin/CrudFormModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

// start with empty list; we'll load from API on mount
const initialUsers = [];

const AdminUsersManagementPage = () => {
  const { t, i18n } = useTranslation();

  const { bgGradient, cardBg, cardBorder, cardShadow, textColor, primaryGreen } = useDashboardTheme();
  const pageBg = bgGradient;
  const nameColor = useColorModeValue('gray.900', 'gray.100');
  const emailColor = useColorModeValue('gray.500', 'gray.300');


  const isRTL = i18n?.language === 'ar';

  const {
    items: users,
    setItems: setUsers,
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
  } = useCrudList({ initialData: initialUsers, initialForm: { name: '', email: '', role: 'player' } });

  const toast = useToast();
  const [selectedUserForRoleChange, setSelectedUserForRoleChange] = useState(null);
  const { isOpen: isRoleChangeOpen, onOpen: onRoleChangeOpen, onClose: onRoleChangeClose } = useDisclosure();

  // Load users from backend on mount
  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      try {
        const raw = await userService.getAllUsers();
        if (!Array.isArray(raw)) {
          console.warn('Unexpected users response:', raw);
          toast({ title: 'Failed to load users (unauthorized or bad response)', status: 'error', duration: 4000 });
          if (mounted) setUsers([]);
          return;
        }

        const data = raw.map(u => ({
          id: u.id,
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
          email: u.email,
          role: u.role,
          status: u.status,
        }));
        if (mounted) setUsers(data);
      } catch (err) {
        console.error('Failed to load users', err);
        toast({ title: 'Failed to load users', status: 'error', duration: 4000 });
      }
    };

    loadUsers();
    return () => { mounted = false; };
  }, [setUsers, toast]);

  const roleOptionsList = roleOptions(t);

  const [roleFilter, setRoleFilter] = React.useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  // CRUD actions use the hook's handlers; show toasts and close modals here
  const onConfirmAdd = async () => {
    try {
      const name = formData.name || '';
      const parts = name.split(' ');
      const first_name = parts.shift() || '';
      const last_name = parts.join(' ') || '';

      // generate a temporary password for newly created users
      const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';

      const createdResp = await userService.createUser({
        firstName: first_name,
        lastName: last_name,
        email: formData.email,
        password: tempPassword,
        role: formData.role,
      });

      const created = createdResp && createdResp.user;

      const newUser = {
        id: created.userId,
        name: `${created.first_name || first_name} ${created.last_name || last_name}`.trim(),
        email: created.email || formData.email,
        role: created.role || formData.role,
        status: 'Active',
      };

      setUsers(prev => [...prev, newUser]);

      toast({
        title: t('buttonAdd') || 'User added',
        description: `${newUser.name} ${t('actionAddUser') || 'has been added successfully.'}`,
        status: 'success',
        duration: 3000,
      });
      onAddClose();
      setFormData({ name: '', email: '', role: 'player' });
    } catch (err) {
      console.error('Error adding user', err);
      toast({ title: 'Failed to add user', status: 'error', duration: 4000 });
    }
  };

  const onConfirmEdit = async () => {
    try {
      if (!selectedItem) return;
      const id = selectedItem.id;
      // Only update role (admins edit role only)
      await userService.updateUserRole(id, formData.role);

      const updated = { ...selectedItem, role: formData.role };
      setUsers(prev => prev.map(u => (u.id === id ? updated : u)));

      toast({
        title: t('buttonSave') || 'User updated',
        description: t('actionAddUser') || 'User information has been updated successfully.',
        status: 'success',
        duration: 3000,
      });
      onEditClose();
      setSelectedItem(null);
    } catch (err) {
      console.error('Error updating user', err);
      toast({ title: 'Failed to update user', status: 'error', duration: 4000 });
    }
  };

  // Open edit dialog for role-only editing
  const openRoleEditDialog = (item) => {
    setSelectedItem(item);
    setFormData({ role: item.role });
    onEditOpen();
  };

  const onConfirmDelete = async () => {
    try {
      if (!selectedItem) return;
      const id = selectedItem.id;
      await userService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));

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
      await adminService.approveUser(user.id);
      // Update user status to approved
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'Active' } : u));
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
      await adminService.rejectUser(user.id);
      // Remove rejected user from list
      setUsers(prev => prev.filter(u => u.id !== user.id));
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
    setSelectedUserForRoleChange(null);
    setFormData({ userId: '', role: '' });
    onRoleChangeOpen();
  };

  const onConfirmRoleChange = async () => {
    try {
      if (!formData.userId || !formData.role) {
        toast({ title: 'Please select user and role', status: 'warning', duration: 3000 });
        return;
      }
      await userService.updateUserRole(formData.userId, formData.role);
      setUsers(prev => prev.map(u => (u.id === parseInt(formData.userId) ? { ...u, role: formData.role } : u)));
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
            <AvatarCircle name={row.name} size="sm" />
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
        const statusMap = {
          approved: { variant: 'success', label: 'Active' },
          pending: { variant: 'default', label: 'Pending' },
          rejected: { variant: 'default', label: 'Rejected' },
        };
        const statusInfo = statusMap[row.status] || { variant: 'default', label: row.status };
        return (
          <Badge variant={statusInfo.variant}>
            {t(`status${statusInfo.label}`) || statusInfo.label}
          </Badge>
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
            <Button
              size="sm"
              colorScheme="red"
              onClick={() => openDeleteDialog(row)}
            >
              {t('delete') || 'Delete'}
            </Button>
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
            count={filteredUsers.length}
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

          <DataTable
            columns={columns}
            data={filteredUsers}
            emptyMessage={t('emptyMessage') || 'No users found'}
            wrapperBorderColor={cardBorder}
          />
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

