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

const roleOptionsStatic = [
  { value: 'all', labelKey: 'filterAllRoles' },
  { value: 'admin', labelKey: 'role.admin' },
  { value: 'coach', labelKey: 'role.coach' },
  { value: 'player', labelKey: 'role.player' },
  { value: 'agent', labelKey: 'role.agent' },
];

const AdminUsersManagementPage = () => {
  const { t, i18n } = useTranslation();

  const { bgGradient, cardBg, cardBorder, cardShadow, textColor, primaryGreen } = useDashboardTheme();
  const pageBg = bgGradient;
  const nameColor = useColorModeValue('gray.900', 'gray.100');
  const emailColor = useColorModeValue('gray.500', 'gray.300');

  const isRTL = i18n?.language === 'ar';

  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'player' });

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const toast = useToast();

  const roleOptions = roleOptionsStatic.map(o => ({ value: o.value, label: t(o.labelKey) }));

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleAdd = () => {
    const newUser = {
      id: users.length + 1,
      ...formData,
      status: 'Active',
    };
    setUsers([...users, newUser]);
    toast({
      title: t('buttonAdd') || 'User added',
        description: `${formData.name} ${t('actionAddUser') || 'has been added successfully.'}`,
      status: 'success',
      duration: 3000,
    });
    onAddClose();
    setFormData({ name: '', email: '', role: 'player' });
  };

  const handleEdit = () => {
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
    toast({
      title: t('buttonSave') || 'User updated',
        description: t('actionAddUser') || 'User information has been updated successfully.',
      status: 'success',
      duration: 3000,
    });
    onEditClose();
    setSelectedUser(null);
  };

  const handleDelete = () => {
    setUsers(users.filter(u => u.id !== selectedUser.id));
    toast({
      title: t('buttonDelete') || 'User deleted',
        description: `${selectedUser?.name} ${t('buttonDelete') || 'has been removed.'}`,
      status: 'success',
      duration: 3000,
    });
    onDeleteClose();
    setSelectedUser(null);
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    onEditOpen();
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    onDeleteOpen();
  };

  const getRoleLabel = (role) => {
    const found = roleOptions.find(r => r.value === role);
    return found ? found.label : role;
  };

  const columns = [
    {
      header: t('table.user') || 'User',
      accessor: 'name',
      render: (row) => (
        <HStack spacing={3}>
          <AvatarCircle name={row.name} size="sm" />
          <VStack align="start" spacing={0}>
            <Box fontWeight="600" fontSize="14px" color={nameColor}>{row.name}</Box>
            <Box fontSize="13px" color={emailColor}>{row.email}</Box>
          </VStack>
        </HStack>
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
        <Badge variant={row.status === 'Active' ? 'success' : 'default'}>{row.status}</Badge>
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
      <Box bgGradient="linear(to-b, green.50, white)" px="32px" pt="24px" pb="32px" minH="100vh" dir={isRTL ? 'rtl' : 'ltr'}>
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
                placeholder={t('searchPlaceholder') || 'Search by name or email...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Box>
            <Box width="200px">
              <FilterSelect
                placeholder={t('filterAllRoles') || 'All Roles'}
                options={roleOptions}
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

      {/* Add User Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('modalAddTitle') || 'Add New User'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t('form.name') || 'Name'}</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('form.namePlaceholder') || 'Enter full name'}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('form.email') || 'Email'}</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('form.emailPlaceholder') || 'Enter email address'}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('form.role') || 'Role'}</FormLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  {roleOptions.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddClose}>{t('buttonCancel') || 'Cancel'}</Button>
            <Button colorScheme="green" onClick={handleAdd}>{t('buttonAdd') || 'Add User'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('modalEditTitle') || 'Edit User'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t('form.name') || 'Name'}</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('form.email') || 'Email'}</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('form.role') || 'Role'}</FormLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  {roleOptions.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>{t('buttonCancel') || 'Cancel'}</Button>
            <Button colorScheme="green" onClick={handleEdit}>{t('buttonSave') || 'Save Changes'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('modalDeleteTitle') || 'Delete User'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {t('confirmDelete', { name: selectedUser?.name }) || `Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>{t('buttonCancel') || 'Cancel'}</Button>
            <Button colorScheme="red" onClick={handleDelete}>{t('buttonDelete') || 'Delete'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Layout>
  );
};

export default AdminUsersManagementPage;

