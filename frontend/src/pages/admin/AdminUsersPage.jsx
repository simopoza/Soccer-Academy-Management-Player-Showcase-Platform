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
} from '@chakra-ui/react';
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

const roleOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'coach', label: 'Coach' },
  { value: 'player', label: 'Player' },
  { value: 'agent', label: 'Agent' },
];

const AdminUsersManagementPage = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'player' });
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const toast = useToast();

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
      title: 'User added',
      description: `${formData.name} has been added successfully.`,
      status: 'success',
      duration: 3000,
    });
    onAddClose();
    setFormData({ name: '', email: '', role: 'player' });
  };

  const handleEdit = () => {
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
    toast({
      title: 'User updated',
      description: `User information has been updated successfully.`,
      status: 'success',
      duration: 3000,
    });
    onEditClose();
    setSelectedUser(null);
  };

  const handleDelete = () => {
    setUsers(users.filter(u => u.id !== selectedUser.id));
    toast({
      title: 'User deleted',
      description: `${selectedUser.name} has been removed.`,
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

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (row) => (
        <HStack spacing={3}>
          <AvatarCircle name={row.name} size="sm" />
          <VStack align="start" spacing={0}>
            <Box fontWeight="600" fontSize="sm">{row.name}</Box>
            <Box fontSize="xs" color="gray.500">{row.email}</Box>
          </VStack>
        </HStack>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => (
        <Badge variant="info">
          {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'default'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
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
    <Layout pageTitle="Users Management" pageSubtitle="Manage academy users and permissions">
      <Box
        bg="white"
        borderRadius="12px"
        boxShadow="0 10px 25px rgba(0,0,0,0.05)"
        border="1px"
        borderColor="gray.200"
        p={6}
      >
        <TableHeader
          title="All Users"
          count={filteredUsers.length}
          actionLabel="Add User"
          onAction={onAddOpen}
        />

        <Flex gap={4} mb={6}>
          <Box flex={1}>
            <SearchInput
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>
          <Box width="200px">
            <FilterSelect
              placeholder="All Roles"
              options={roleOptions}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            />
          </Box>
        </Flex>

        <DataTable
          columns={columns}
          data={filteredUsers}
          emptyMessage="No users found"
        />
      </Box>

      {/* Add User Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="coach">Coach</option>
                  <option value="player">Player</option>
                  <option value="agent">Agent</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAdd}>
              Add User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="coach">Coach</option>
                  <option value="player">Player</option>
                  <option value="agent">Agent</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleEdit}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
};

export default AdminUsersManagementPage;
