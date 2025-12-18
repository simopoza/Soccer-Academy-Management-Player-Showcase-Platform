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
  SimpleGrid,
  Textarea,
} from '@chakra-ui/react';
import { FiCalendar, FiTrendingUp, FiTarget, FiStar } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { DataTable, TableHeader } from '../../components/table';
import { Badge, ActionButtons, SearchInput, FilterSelect, StatsCard } from '../../components/ui';

const initialMatches = [
  { id: 1, team: 'Eagles U16', opponent: 'Lions U16', date: '2025-12-08', time: '15:00', location: 'Academy Stadium A', matchType: 'Home', status: 'Upcoming', competition: 'League', score: null },
  { id: 2, team: 'Hawks U18', opponent: 'Tigers U18', date: '2025-12-07', time: '16:30', location: 'Tigers Ground', matchType: 'Away', status: 'Upcoming', competition: 'Cup', score: null },
  { id: 3, team: 'Eagles U16', opponent: 'Wolves U16', date: '2025-12-01', time: '15:00', location: 'Academy Stadium A', matchType: 'Home', status: 'Completed', competition: 'League', score: '3-2', result: 'Won' },
  { id: 4, team: 'Falcons U14', opponent: 'Sharks U14', date: '2025-11-30', time: '14:00', location: 'Sharks Arena', matchType: 'Away', status: 'Completed', competition: 'League', score: '1-1', result: 'Draw' },
  { id: 5, team: 'Hawks U18', opponent: 'Bears U18', date: '2025-11-28', time: '16:00', location: 'Academy Stadium B', matchType: 'Home', status: 'Completed', competition: 'Cup', score: '2-3', result: 'Lost' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'Completed', label: 'Completed' },
];

const matchTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'Home', label: 'Home' },
  { value: 'Away', label: 'Away' },
];

const AdminMatchesPage = () => {
  const [matches, setMatches] = useState(initialMatches);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [matchTypeFilter, setMatchTypeFilter] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [formData, setFormData] = useState({ 
    team: '', 
    opponent: '', 
    date: '',
    time: '',
    location: '',
    matchType: 'Home',
    competition: 'League',
    notes: ''
  });
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const toast = useToast();

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         match.opponent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || match.status === statusFilter;
    const matchesType = matchTypeFilter === 'all' || match.matchType === matchTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalMatches = matches.length;
  const upcomingMatches = matches.filter(m => m.status === 'Upcoming').length;
  const completedMatches = matches.filter(m => m.status === 'Completed').length;
  const wins = matches.filter(m => m.result === 'Won').length;
  const winRate = completedMatches > 0 ? ((wins / completedMatches) * 100).toFixed(1) : '0.0';

  const handleAdd = () => {
    const newMatch = {
      id: matches.length + 1,
      ...formData,
      status: 'Upcoming',
      score: null,
    };
    setMatches([...matches, newMatch]);
    toast({
      title: 'Match added',
      description: `Match has been scheduled successfully.`,
      status: 'success',
      duration: 3000,
    });
    onAddClose();
    setFormData({ team: '', opponent: '', date: '', time: '', location: '', matchType: 'Home', competition: 'League', notes: '' });
  };

  const handleEdit = () => {
    setMatches(matches.map(m => m.id === selectedMatch.id ? { ...m, ...formData } : m));
    toast({
      title: 'Match updated',
      description: `Match information has been updated successfully.`,
      status: 'success',
      duration: 3000,
    });
    onEditClose();
    setSelectedMatch(null);
  };

  const handleDelete = () => {
    setMatches(matches.filter(m => m.id !== selectedMatch.id));
    toast({
      title: 'Match deleted',
      description: `Match has been removed.`,
      status: 'success',
      duration: 3000,
    });
    onDeleteClose();
    setSelectedMatch(null);
  };

  const openEditDialog = (match) => {
    setSelectedMatch(match);
    setFormData({ 
      team: match.team, 
      opponent: match.opponent, 
      date: match.date,
      time: match.time,
      location: match.location,
      matchType: match.matchType,
      competition: match.competition,
      notes: ''
    });
    onEditOpen();
  };

  const openDeleteDialog = (match) => {
    setSelectedMatch(match);
    onDeleteOpen();
  };

  const columns = [
    {
      header: 'Match',
      accessor: 'match',
      render: (row) => (
        <VStack align="start" spacing={0}>
          <Box fontWeight="600" fontSize="sm">{row.team} vs {row.opponent}</Box>
          <Box fontSize="xs" color="gray.500">{row.competition}</Box>
        </VStack>
      ),
    },
    {
      header: 'Date & Time',
      accessor: 'date',
      render: (row) => (
        <VStack align="start" spacing={0}>
          <Text fontSize="sm">{row.date}</Text>
          <Text fontSize="xs" color="gray.500">{row.time}</Text>
        </VStack>
      ),
    },
    {
      header: 'Location',
      accessor: 'location',
      render: (row) => (
        <Text fontSize="sm">{row.location}</Text>
      ),
    },
    {
      header: 'Type',
      accessor: 'matchType',
      render: (row) => (
        <Badge variant={row.matchType === 'Home' ? 'success' : 'info'}>
          {row.matchType}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Upcoming' ? 'warning' : 'success'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Score',
      accessor: 'score',
      render: (row) => (
        row.score ? (
          <Badge variant={row.result === 'Won' ? 'success' : row.result === 'Draw' ? 'warning' : 'danger'}>
            {row.score}
          </Badge>
        ) : (
          <Text fontSize="sm" color="gray.400">-</Text>
        )
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
    <Layout pageTitle="Matches Management" pageSubtitle="Manage academy matches and fixtures">
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={6}>
        <StatsCard
          title="Total Matches"
          value={totalMatches}
          icon={FiCalendar}
          color="green"
        />
        <StatsCard
          title="Upcoming"
          value={upcomingMatches}
          icon={FiTrendingUp}
          color="orange"
        />
        <StatsCard
          title="Completed"
          value={completedMatches}
          icon={FiTarget}
          color="blue"
        />
        <StatsCard
          title="Win Rate"
          value={`${winRate}%`}
          icon={FiStar}
          color="purple"
        />
      </SimpleGrid>

      <Box
        bg="white"
        borderRadius="12px"
        boxShadow="0 10px 25px rgba(0,0,0,0.05)"
        border="1px"
        borderColor="gray.200"
        p={6}
      >
        <TableHeader
          title="All Matches"
          count={filteredMatches.length}
          actionLabel="Add Match"
          onAction={onAddOpen}
        />

        <Flex gap={4} mb={6}>
          <Box flex={1}>
            <SearchInput
              placeholder="Search by team or opponent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>
          <Box width="200px">
            <FilterSelect
              placeholder="All Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </Box>
          <Box width="200px">
            <FilterSelect
              placeholder="All Types"
              options={matchTypeOptions}
              value={matchTypeFilter}
              onChange={(e) => setMatchTypeFilter(e.target.value)}
            />
          </Box>
        </Flex>

        <DataTable
          columns={columns}
          data={filteredMatches}
          emptyMessage="No matches found"
        />
      </Box>

      {/* Add Match Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Match</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} width="100%">
                <FormControl isRequired flex={1}>
                  <FormLabel>Team</FormLabel>
                  <Input
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    placeholder="Enter team name"
                  />
                </FormControl>
                <FormControl isRequired flex={1}>
                  <FormLabel>Opponent</FormLabel>
                  <Input
                    value={formData.opponent}
                    onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                    placeholder="Enter opponent"
                  />
                </FormControl>
              </HStack>
              <HStack spacing={4} width="100%">
                <FormControl isRequired flex={1}>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired flex={1}>
                  <FormLabel>Time</FormLabel>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter match location"
                />
              </FormControl>
              <HStack spacing={4} width="100%">
                <FormControl isRequired flex={1}>
                  <FormLabel>Match Type</FormLabel>
                  <Select
                    value={formData.matchType}
                    onChange={(e) => setFormData({ ...formData, matchType: e.target.value })}
                  >
                    <option value="Home">Home</option>
                    <option value="Away">Away</option>
                  </Select>
                </FormControl>
                <FormControl isRequired flex={1}>
                  <FormLabel>Competition</FormLabel>
                  <Select
                    value={formData.competition}
                    onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                  >
                    <option value="League">League</option>
                    <option value="Cup">Cup</option>
                    <option value="Friendly">Friendly</option>
                  </Select>
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes (optional)"
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
              Add Match
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Match Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Match</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} width="100%">
                <FormControl isRequired flex={1}>
                  <FormLabel>Team</FormLabel>
                  <Input
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired flex={1}>
                  <FormLabel>Opponent</FormLabel>
                  <Input
                    value={formData.opponent}
                    onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <HStack spacing={4} width="100%">
                <FormControl isRequired flex={1}>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired flex={1}>
                  <FormLabel>Time</FormLabel>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </FormControl>
              <HStack spacing={4} width="100%">
                <FormControl isRequired flex={1}>
                  <FormLabel>Match Type</FormLabel>
                  <Select
                    value={formData.matchType}
                    onChange={(e) => setFormData({ ...formData, matchType: e.target.value })}
                  >
                    <option value="Home">Home</option>
                    <option value="Away">Away</option>
                  </Select>
                </FormControl>
                <FormControl isRequired flex={1}>
                  <FormLabel>Competition</FormLabel>
                  <Select
                    value={formData.competition}
                    onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                  >
                    <option value="League">League</option>
                    <option value="Cup">Cup</option>
                    <option value="Friendly">Friendly</option>
                  </Select>
                </FormControl>
              </HStack>
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
          <ModalHeader>Delete Match</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this match? This action cannot be undone.
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

export default AdminMatchesPage;
