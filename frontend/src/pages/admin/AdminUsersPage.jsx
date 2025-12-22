import React, { useState } from 'react';
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
import CrudFormModal from '../../components/admin/CrudFormModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

const initialUsers = [
  { id: 1, name: 'John Smith', email: 'john.smith@academy.com', role: 'coach', status: 'Active' },
  { id: 2, name: 'Emma Wilson', email: 'emma.wilson@academy.com', role: 'player', status: 'Active' },
  { id: 3, name: 'Michael Brown', email: 'michael.brown@academy.com', role: 'admin', status: 'Active' },
  { id: 4, name: 'Sarah Davis', email: 'sarah.davis@academy.com', role: 'player', status: 'Active' },
  { id: 5, name: 'James Johnson', email: 'james.johnson@academy.com', role: 'coach', status: 'Inactive' },
  { id: 6, name: 'Lisa Anderson', email: 'lisa.anderson@academy.com', role: 'agent', status: 'Active' },
  { id: 7, name: 'David Martinez', email: 'david.martinez@academy.com', role: 'player', status: 'Active' },
  { id: 8, name: 'Jennifer Taylor', email: 'jennifer.taylor@academy.com', role: 'player', status: 'Active' },
];

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

  const roleOptionsList = roleOptions(t);

  const [roleFilter, setRoleFilter] = React.useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  // CRUD actions use the hook's handlers; show toasts and close modals here
  const onConfirmAdd = () => {
    const newUser = handleAdd({ status: 'Active' });
    toast({
      title: t('buttonAdd') || 'User added',
      description: `${newUser.name} ${t('actionAddUser') || 'has been added successfully.'}`,
      status: 'success',
      duration: 3000,
    });
    onAddClose();
    setFormData({ name: '', email: '', role: 'player' });
  };

  const onConfirmEdit = () => {
    const updated = handleEdit();
    toast({
      title: t('buttonSave') || 'User updated',
      description: t('actionAddUser') || 'User information has been updated successfully.',
      status: 'success',
      duration: 3000,
    });
    onEditClose();
    setSelectedItem(null);
  };

  const onConfirmDelete = () => {
    const deleted = handleDelete();
    toast({
      title: t('buttonDelete') || 'User deleted',
      description: `${deleted?.name} ${t('buttonDelete') || 'has been removed.'}`,
      status: 'success',
      duration: 3000,
    });
    onDeleteClose();
    setSelectedItem(null);
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
    <Layout pageTitle={t('pageTitle') || 'Users Management'} pageSubtitle={t('pageSubtitle') || 'Manage academy users and permissions'}>
      <Box bgGradient={bgGradient} px="32px" pt="24px" pb="32px" minH="100vh" dir={isRTL ? 'rtl' : 'ltr'}>
        <Box bg={cardBg} borderRadius="12px" borderWidth="1px" borderStyle="solid" borderColor={cardBorder} boxShadow="0 10px 25px rgba(0,0,0,0.05)" p="24px">

          <TableHeader
            title={t('cardTitle') || 'All Users'}
            count={filteredUsers.length}
            actionLabel={t('actionAddUser') || 'Add User'}
            onAction={onAddOpen}
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

      <CrudFormModal
        isOpen={isAddOpen}
        onClose={onAddClose}
        mode="add"
        titleAdd={t('modalAddTitle') || 'Add New User'}
        confirmLabelAdd={t('buttonAdd') || 'Add User'}
        formData={formData}
        setFormData={setFormData}
        onConfirm={onConfirmAdd}
        fields={[
          { name: 'name', label: t('form.name') || 'Name', type: 'text', isRequired: true, placeholder: t('form.namePlaceholder') || 'Enter full name' },
          { name: 'email', label: t('form.email') || 'Email', type: 'text', isRequired: true, inputType: 'email', placeholder: t('form.emailPlaceholder') || 'Enter email address' },
          { name: 'role', label: t('form.role') || 'Role', type: 'select', isRequired: true, options: roleOptionsList },
        ]}
      />

      <CrudFormModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        mode="edit"
        titleEdit={t('modalEditTitle') || 'Edit User'}
        confirmLabelEdit={t('buttonSave') || 'Save Changes'}
        formData={formData}
        setFormData={setFormData}
        onConfirm={onConfirmEdit}
        fields={[
          { name: 'name', label: t('form.name') || 'Name', type: 'text', isRequired: true },
          { name: 'email', label: t('form.email') || 'Email', type: 'text', isRequired: true, inputType: 'email' },
          { name: 'role', label: t('form.role') || 'Role', type: 'select', isRequired: true, options: roleOptionsList },
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

