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
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';
import Layout from '../../components/layout/Layout';
import { DataTable, TableHeader } from '../../components/table';
import { Badge, ActionButtons, SearchInput, FilterSelect, StatsCard } from '../../components/ui';
import { BarChart3, Target, TrendingUp, Star } from 'lucide-react';

const initialStats = [
  { id: 1, playerName: 'Marcus Johnson', playerNumber: 10, matchName: 'Academy U17 vs Riverside FC', matchDate: '2024-12-05', opponent: 'Riverside FC', goals: 2, assists: 1, minutes: 90, saves: 0, yellowCards: 0, redCards: 0, rating: 9.2 },
  { id: 2, playerName: 'David Chen', playerNumber: 7, matchName: 'Academy U17 vs Riverside FC', matchDate: '2024-12-05', opponent: 'Riverside FC', goals: 1, assists: 2, minutes: 90, saves: 0, yellowCards: 1, redCards: 0, rating: 8.8 },
  { id: 3, playerName: 'Alex Rivera', playerNumber: 1, matchName: 'Academy U17 vs Riverside FC', matchDate: '2024-12-05', opponent: 'Riverside FC', goals: 0, assists: 0, minutes: 90, saves: 8, yellowCards: 0, redCards: 0, rating: 8.5 },
  { id: 4, playerName: 'Marcus Johnson', playerNumber: 10, matchName: 'Academy U17 vs City United', matchDate: '2024-11-28', opponent: 'City United', goals: 1, assists: 0, minutes: 85, saves: 0, yellowCards: 0, redCards: 0, rating: 8.0 },
  { id: 5, playerName: 'Emma Wilson', playerNumber: 8, matchName: 'Academy U17 vs City United', matchDate: '2024-11-28', opponent: 'City United', goals: 0, assists: 2, minutes: 90, saves: 0, yellowCards: 0, redCards: 0, rating: 8.3 },
  { id: 6, playerName: 'James Wilson', playerNumber: 5, matchName: 'Academy U17 vs Riverside FC', matchDate: '2024-12-05', opponent: 'Riverside FC', goals: 0, assists: 0, minutes: 90, saves: 0, yellowCards: 0, redCards: 0, rating: 7.8 },
  { id: 7, playerName: 'Sarah Martinez', playerNumber: 11, matchName: 'Academy U17 vs Parkside Academy', matchDate: '2024-11-21', opponent: 'Parkside Academy', goals: 3, assists: 1, minutes: 90, saves: 0, yellowCards: 0, redCards: 0, rating: 9.5 },
  { id: 8, playerName: 'Alex Rivera', playerNumber: 1, matchName: 'Academy U17 vs City United', matchDate: '2024-11-28', opponent: 'City United', goals: 0, assists: 0, minutes: 90, saves: 5, yellowCards: 0, redCards: 0, rating: 7.9 },
];

const AdminStatsPage = () => {
  const { t, i18n } = useTranslation();

  const { bgGradient, cardBg, cardBorder, cardShadow, primaryGreen, textColor } = useDashboardTheme();
  const pageBg = bgGradient;
  const isRTL = i18n?.language === 'ar';

  const [stats, setStats] = useState(initialStats);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('all');
  const [selectedStat, setSelectedStat] = useState(null);
  const [formData, setFormData] = useState({ 
    playerName: '', 
    matchName: '', 
    goals: '',
    assists: '',
    minutes: '',
    saves: '',
    yellowCards: '',
    redCards: '',
    rating: ''
  });
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const toast = useToast();

  const uniquePlayers = Array.from(new Set(stats.map(stat => stat.playerName))).sort();
  const uniqueMatches = Array.from(new Set(stats.map(stat => stat.matchName))).sort();
  // derive unique teams from matchName like 'Team A vs Team B'
  const uniqueTeamsSet = new Set();
  stats.forEach(s => {
    const parts = (s.matchName || '').split(' vs ');
    if (parts[0]) uniqueTeamsSet.add(parts[0].trim());
    if (parts[1]) uniqueTeamsSet.add(parts[1].trim());
  });
  const uniqueTeams = Array.from(uniqueTeamsSet).sort();

  const filteredStats = stats.filter(stat => {
    const matchesSearch = stat.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stat.matchName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'player') {
      return matchesSearch && (filterValue === 'all' || stat.playerName === filterValue);
    } else if (filterType === 'match') {
      return matchesSearch && (filterValue === 'all' || stat.matchName === filterValue);
    }
    
    return matchesSearch;
  });

  const totalStats = stats.length;
  const totalGoals = stats.reduce((sum, s) => sum + (Number(s.goals) || 0), 0);
  const totalAssists = stats.reduce((sum, s) => sum + (Number(s.assists) || 0), 0);
  const avgRating = stats.length ? (stats.reduce((sum, s) => sum + (Number(s.rating) || 0), 0) / stats.length).toFixed(2) : '0.00';

  const handleAdd = () => {
    const newStat = {
      id: stats.length + 1,
      ...formData,
      playerNumber: 0,
      matchDate: new Date().toISOString().split('T')[0],
      opponent: formData.matchName.split(' vs ')[1] || '',
      goals: parseInt(formData.goals) || 0,
      assists: parseInt(formData.assists) || 0,
      minutes: parseInt(formData.minutes) || 0,
      saves: parseInt(formData.saves) || 0,
      yellowCards: parseInt(formData.yellowCards) || 0,
      redCards: parseInt(formData.redCards) || 0,
      rating: parseFloat(formData.rating) || 0,
    };
    setStats([...stats, newStat]);
    toast({
      title: t('notification.added') || 'Statistics added',
      description: t('notification.addedDesc') || `Player statistics have been recorded successfully.`,
      status: 'success',
      duration: 3000,
    });
    onAddClose();
    setFormData({ playerName: '', matchName: '', goals: '', assists: '', minutes: '', saves: '', yellowCards: '', redCards: '', rating: '' });
  };

  const handleEdit = () => {
    setStats(stats.map(s => 
      s.id === selectedStat.id 
        ? { 
            ...s, 
            ...formData,
            goals: parseInt(formData.goals) || 0,
            assists: parseInt(formData.assists) || 0,
            minutes: parseInt(formData.minutes) || 0,
            saves: parseInt(formData.saves) || 0,
            yellowCards: parseInt(formData.yellowCards) || 0,
            redCards: parseInt(formData.redCards) || 0,
            rating: parseFloat(formData.rating) || 0,
          } 
        : s
    ));
    toast({
      title: t('notification.updated') || 'Statistics updated',
      description: t('notification.updatedDesc') || `Statistics have been updated successfully.`,
      status: 'success',
      duration: 3000,
    });
    onEditClose();
    setSelectedStat(null);
  };

  const handleDelete = () => {
    setStats(stats.filter(s => s.id !== selectedStat.id));
    toast({
      title: t('notification.deleted') || 'Statistics deleted',
      description: t('notification.deletedDesc') || `Statistics record has been removed.`,
      status: 'success',
      duration: 3000,
    });
    onDeleteClose();
    setSelectedStat(null);
  };

  const openEditDialog = (stat) => {
    setSelectedStat(stat);
    setFormData({ 
      playerName: stat.playerName, 
      matchName: stat.matchName, 
      goals: stat.goals.toString(),
      assists: stat.assists.toString(),
      minutes: stat.minutes.toString(),
      saves: stat.saves.toString(),
      yellowCards: stat.yellowCards.toString(),
      redCards: stat.redCards.toString(),
      rating: stat.rating.toString()
    });
    onEditOpen();
  };

  const openDeleteDialog = (stat) => {
    setSelectedStat(stat);
    onDeleteOpen();
  };

  const getRatingColor = (rating) => {
    if (rating >= 9.0) return 'success';
    if (rating >= 8.0) return 'info';
    if (rating >= 7.0) return 'warning';
    return 'danger';
  };

  const columns = [
    {
      header: t('table.player') || 'Player',
      accessor: 'playerName',
      render: (row) => (
        <VStack align="start" spacing={0}>
          <Box fontWeight="600" fontSize="sm">{row.playerName}</Box>
        </VStack>
      ),
    },
    {
      header: t('table.match') || 'Match',
      accessor: 'matchName',
      render: (row) => (
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" fontWeight="500" noOfLines={1}>{row.matchName}</Text>
        </VStack>
      ),
    },
    {
      header: t('table.date') || 'Date',
      accessor: 'matchDate',
      render: (row) => {
        const d = row.matchDate ? new Date(row.matchDate) : null
        const formatted = d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''
        return <Text fontSize="sm">{formatted}</Text>
      }
    },
    {
      header: t('table.goals') || 'Goals',
      accessor: 'goals',
      render: (row) => (
        <Badge variant={row.goals > 0 ? 'success' : 'default'}>
          {row.goals}
        </Badge>
      ),
    },
    {
      header: t('table.assists') || 'Assists',
      accessor: 'assists',
      render: (row) => (
        <Badge variant={row.assists > 0 ? 'info' : 'default'}>
          {row.assists}
        </Badge>
      ),
    },
    {
      header: t('table.minutes') || 'Minutes',
      accessor: 'minutes',
      render: (row) => (
        <Text fontSize="sm">{row.minutes}'</Text>
      ),
    },
    {
      header: t('table.saves') || 'Saves',
      accessor: 'saves',
      render: (row) => (
        <Text fontSize="sm">{row.saves}</Text>
      ),
    },
    {
      header: t('table.cards') || 'Cards',
      accessor: 'cards',
      render: (row) => (
        <HStack spacing={1}>
          {row.yellowCards > 0 && (
            <Badge variant="warning">Y{row.yellowCards}</Badge>
          )}
          {row.redCards > 0 && (
            <Badge variant="danger">R{row.redCards}</Badge>
          )}
          {row.yellowCards === 0 && row.redCards === 0 && (
            <Text fontSize="sm" color="gray.400">-</Text>
          )}
        </HStack>
      ),
    },
    {
      header: t('table.rating') || 'Rating',
      accessor: 'rating',
      render: (row) => (
        <Badge variant={getRatingColor(row.rating)}>
          {row.rating.toFixed(1)}
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

  const filterTypeOptions = [
    { value: 'all', label: t('filterAllRecords') || 'All Records' },
    { value: 'player', label: t('filterByPlayer') || 'By Player' },
    { value: 'match', label: t('filterByMatch') || 'By Match' },
  ];

  const getFilterValueOptions = () => {
    if (filterType === 'player') {
      return [{ value: 'all', label: t('filterAllPlayers') || 'All Players' }, ...uniquePlayers.map(p => ({ value: p, label: p }))];
    } else if (filterType === 'match') {
      return [{ value: 'all', label: t('filterAllMatches') || 'All Matches' }, ...uniqueMatches.map(m => ({ value: m, label: m }))];
    }
    return [];
  };

  return (
    <Layout pageTitle={t('statisticsManagement') || 'Statistics Management'} pageSubtitle={t('statsManagementDesc') || 'Manage player performance statistics'}>
      <Box bgGradient={bgGradient} px="32px" pt="24px" pb="32px" minH="100vh" dir={isRTL ? 'rtl' : 'ltr'}>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={6}>
        <StatsCard
          title={t('cardTotalStats') || 'Total Stats'}
          value={totalStats}
          icon={BarChart3}
          color="#0F172A"
          iconBg="#F1F5F9"
          primaryGreen={primaryGreen}
          cardBg={cardBg}
          cardBorder={cardBorder}
          cardShadow={cardShadow}
          textColor={textColor}
        />
        <StatsCard
          title={t('cardTotalGoals') || 'Total Goals'}
          value={totalGoals}
          icon={Target}
          color="#0F172A"
          iconBg="#F1F5F9"
          primaryGreen={primaryGreen}
          cardBg={cardBg}
          cardBorder={cardBorder}
          cardShadow={cardShadow}
          textColor={textColor}
        />
        <StatsCard
          title={t('cardTotalAssists') || 'Total Assists'}
          value={totalAssists}
          icon={TrendingUp}
          color="#0F172A"
          iconBg="#F1F5F9"
          primaryGreen={primaryGreen}
          cardBg={cardBg}
          cardBorder={cardBorder}
          cardShadow={cardShadow}
          textColor={textColor}
        />
        <StatsCard
          title={t('cardAvgRating') || 'Avg Rating'}
          value={avgRating}
          icon={Star}
          color="#0F172A"
          iconBg="#F1F5F9"
          primaryGreen={primaryGreen}
          cardBg={cardBg}
          cardBorder={cardBorder}
          cardShadow={cardShadow}
          textColor={textColor}
        />
      </SimpleGrid>

        <Box
          bg={cardBg}
          borderRadius="12px"
          boxShadow="0 10px 25px rgba(0,0,0,0.05)"
          border="1px"
          borderColor={cardBorder}
          p="24px"
        >
        <TableHeader
          title={t('cardTitleStats') || 'Player Statistics'}
          count={filteredStats.length}
          actionLabel={t('actionAddStats') || 'Add Statistics'}
          onAction={onAddOpen}
        />

        <Flex gap={4} mb={6}>
          <Box flex={1}>
                <SearchInput
                  placeholder={t('searchPlaceholderStats') || 'Search by player, match, or opponent...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
          </Box>
          <Box width="180px">
            <FilterSelect
              placeholder={t('filterType') || 'Filter Type'}
              options={filterTypeOptions}
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterValue('all');
              }}
            />
          </Box>
          {filterType !== 'all' && (
              <Box width="220px">
              <FilterSelect
                placeholder={t('select') || 'Select...'}
                options={getFilterValueOptions()}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            </Box>
          )}
        </Flex>

        <DataTable
          columns={columns}
          data={filteredStats}
          emptyMessage={t('emptyStats') || 'No statistics found'}
          wrapperBorderColor={cardBorder}
        />
        </Box>
      </Box>

      {/* Add Statistics Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('actionAddStats') || 'Add Player Statistics'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                  <FormLabel>{t('playerName') || 'Player Name'}</FormLabel>
                <Input
                  value={formData.playerName}
                  onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                  placeholder={t('playerNamePlaceholder') || 'Enter player name'}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('matchName') || 'Match Name'}</FormLabel>
                <Input
                  value={formData.matchName}
                  onChange={(e) => setFormData({ ...formData, matchName: e.target.value })}
                  placeholder={t('matchNamePlaceholder') || 'e.g., Academy U17 vs Riverside FC'}
                />
              </FormControl>
              <SimpleGrid columns={2} spacing={4} width="100%">
                <FormControl isRequired>
                  <FormLabel>{t('goals') || 'Goals'}</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>{t('assists') || 'Assists'}</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    value={formData.assists}
                    onChange={(e) => setFormData({ ...formData, assists: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>{t('minutes') || 'Minutes'}</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    max="120"
                    value={formData.minutes}
                    onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>{t('saves') || 'Saves'}</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    value={formData.saves}
                    onChange={(e) => setFormData({ ...formData, saves: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>{t('yellowCards') || 'Yellow Cards'}</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    max="2"
                    value={formData.yellowCards}
                    onChange={(e) => setFormData({ ...formData, yellowCards: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>{t('redCards') || 'Red Cards'}</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    value={formData.redCards}
                    onChange={(e) => setFormData({ ...formData, redCards: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>
                <FormControl isRequired>
                  <FormLabel>{t('rating') || 'Rating (0-10)'}</FormLabel>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddClose}>
              {t('cancel') || 'Cancel'}
            </Button>
            <Button colorScheme="green" onClick={handleAdd}>
              {t('actionAddStats') || 'Add Statistics'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Statistics Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('editStatistics') || 'Edit Statistics'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t('playerName') || 'Player Name'}</FormLabel>
                <Input
                  value={formData.playerName}
                  onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('matchName') || 'Match Name'}</FormLabel>
                <Input
                  value={formData.matchName}
                  onChange={(e) => setFormData({ ...formData, matchName: e.target.value })}
                />
              </FormControl>
              <SimpleGrid columns={2} spacing={4} width="100%">
                <FormControl isRequired>
                  <FormLabel>{t('goals') || 'Goals'}</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>{t('assists') || 'Assists'}</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    value={formData.assists}
                    onChange={(e) => setFormData({ ...formData, assists: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>{t('minutes') || 'Minutes'}</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      max="120"
                      value={formData.minutes}
                      onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>{t('saves') || 'Saves'}</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      value={formData.saves}
                      onChange={(e) => setFormData({ ...formData, saves: e.target.value })}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>{t('yellowCards') || 'Yellow Cards'}</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      max="2"
                      value={formData.yellowCards}
                      onChange={(e) => setFormData({ ...formData, yellowCards: e.target.value })}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>{t('redCards') || 'Red Cards'}</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      value={formData.redCards}
                      onChange={(e) => setFormData({ ...formData, redCards: e.target.value })}
                    />
                  </FormControl>
              </SimpleGrid>
              <FormControl isRequired>
                <FormLabel>{t('rating') || 'Rating (0-10)'}</FormLabel>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              {t('cancel') || 'Cancel'}
            </Button>
            <Button colorScheme="green" onClick={handleEdit}>
              {t('saveChanges') || 'Save Changes'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('deleteStatistics') || 'Delete Statistics'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {t('confirmDeleteStats') || 'Are you sure you want to delete these statistics? This action cannot be undone.'}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              {t('cancel') || 'Cancel'}
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              {t('delete') || 'Delete'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
};

export default AdminStatsPage;
