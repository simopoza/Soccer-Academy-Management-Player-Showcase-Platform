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
  Textarea,
  Icon,
} from '@chakra-ui/react';
import { FiUsers } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';
import Layout from '../../components/layout/Layout';
import { DataTable, TableHeader } from '../../components/table';
import { Badge, ActionButtons, SearchInput, FilterSelect } from '../../components/ui';

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

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'U12', label: 'U12' },
  { value: 'U14', label: 'U14' },
  { value: 'U16', label: 'U16' },
  { value: 'U18', label: 'U18' },
];

const AdminTeamsPage = () => {
  const { t, i18n } = useTranslation();

  const { bgGradient, cardBg, cardBorder, cardShadow, primaryGreen, textColor } = useDashboardTheme();
  const pageBg = bgGradient;
  const isRTL = i18n?.language === 'ar';

  const [teams, setTeams] = useState(initialTeams);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    ageCategory: 'U16', 
    coach: '',
    description: ''
  });
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const toast = useToast();

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.coach.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || team.ageCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = () => {
    const newTeam = {
      id: teams.length + 1,
      ...formData,
      playerCount: 0,
      founded: new Date().getFullYear().toString(),
      status: 'Active',
    };
    setTeams([...teams, newTeam]);
    toast({
      title: 'Team added',
      description: `${formData.name} ${formData.ageCategory} has been added successfully.`,
      status: 'success',
      duration: 3000,
    });
    onAddClose();
    setFormData({ name: '', ageCategory: 'U16', coach: '', description: '' });
  };

  const handleEdit = () => {
    setTeams(teams.map(t => t.id === selectedTeam.id ? { ...t, ...formData } : t));
    toast({
      title: 'Team updated',
      description: `Team information has been updated successfully.`,
      status: 'success',
      duration: 3000,
    });
    onEditClose();
    setSelectedTeam(null);
  };

  const handleDelete = () => {
    setTeams(teams.filter(t => t.id !== selectedTeam.id));
    toast({
      title: 'Team deleted',
      description: `${selectedTeam.name} has been removed.`,
      status: 'success',
      duration: 3000,
    });
    onDeleteClose();
    setSelectedTeam(null);
  };

  const openEditDialog = (team) => {
    setSelectedTeam(team);
    setFormData({ 
      name: team.name, 
      ageCategory: team.ageCategory, 
      coach: team.coach,
      description: ''
    });
    onEditOpen();
  };

  const openDeleteDialog = (team) => {
    setSelectedTeam(team);
    onDeleteOpen();
  };

  const columns = [
    {
      header: 'Team',
      accessor: 'name',
      render: (row) => (
        <HStack align="center" spacing={3}>
          <Box fontWeight="600" fontSize="sm">{row.name}</Box>
          <Box fontSize="sm" color="gray.600">{row.ageCategory}</Box>
        </HStack>
      ),
    },
    {
      header: 'Age Category',
      accessor: 'ageCategory',
      render: (row) => (
        <Badge variant="info">{row.ageCategory}</Badge>
      ),
    },
    {
      header: 'Coach',
      accessor: 'coach',
      render: (row) => (
        <Text fontSize="sm" fontWeight="500">{row.coach}</Text>
      ),
    },
    {
      header: 'Players',
      accessor: 'playerCount',
      render: (row) => (
        <HStack spacing={2} align="center">
          <Icon as={FiUsers} boxSize={4} color="gray.500" />
          <Text fontSize="sm" fontWeight="600" color="green.600">{row.playerCount}</Text>
        </HStack>
      ),
    },
    {
      header: 'Founded',
      accessor: 'founded',
      render: (row) => (
        <Text fontSize="sm">{row.founded}</Text>
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
    <Layout pageTitle={t('teamsManagement') || 'Teams Management'} pageSubtitle={t('teamsManagementDesc') || 'Manage academy teams'}>
      <Box bgGradient="linear(to-b, green.50, white)" px="32px" pt="24px" pb="32px" minH="100vh" dir={isRTL ? 'rtl' : 'ltr'}>
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
              options={categoryOptions}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
          </Box>
        </Flex>

        <DataTable
          columns={columns}
          data={filteredTeams}
          emptyMessage="No teams found"
          wrapperBorderColor={cardBorder}
        />
        </Box>
      </Box>

      {/* Add Team Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Team</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Team Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter team name"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Age Category</FormLabel>
                <Select
                  value={formData.ageCategory}
                  onChange={(e) => setFormData({ ...formData, ageCategory: e.target.value })}
                >
                  <option value="U12">U12</option>
                  <option value="U14">U14</option>
                  <option value="U16">U16</option>
                  <option value="U18">U18</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Coach</FormLabel>
                <Input
                  value={formData.coach}
                  onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                  placeholder="Enter coach name"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter team description (optional)"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAdd}>
              Add Team
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Team Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Team</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Team Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Age Category</FormLabel>
                <Select
                  value={formData.ageCategory}
                  onChange={(e) => setFormData({ ...formData, ageCategory: e.target.value })}
                >
                  <option value="U12">U12</option>
                  <option value="U14">U14</option>
                  <option value="U16">U16</option>
                  <option value="U18">U18</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Coach</FormLabel>
                <Input
                  value={formData.coach}
                  onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter team description (optional)"
                  rows={3}
                />
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
          <ModalHeader>Delete Team</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete {selectedTeam?.name} {selectedTeam?.ageCategory}? This action cannot be undone.
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

export default AdminTeamsPage;
