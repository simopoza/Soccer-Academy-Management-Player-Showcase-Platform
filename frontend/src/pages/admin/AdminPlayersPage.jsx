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
} from '@chakra-ui/react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';
import Layout from '../../components/layout/Layout';
import { DataTable, TableHeader } from '../../components/table';
import { Badge, AvatarCircle, ActionButtons, SearchInput, FilterSelect } from '../../components/ui';

const initialPlayers = [
  { id: 1, name: 'Emma Wilson', team: 'Eagles U16', position: 'Midfielder', rating: 8.5, jerseyNumber: 10, status: 'Active' },
  { id: 2, name: 'Michael Chen', team: 'Hawks U18', position: 'Forward', rating: 9.2, jerseyNumber: 9, status: 'Active' },
  { id: 3, name: 'Sarah Davis', team: 'Eagles U16', position: 'Defender', rating: 7.8, jerseyNumber: 4, status: 'Active' },
  { id: 4, name: 'James Rodriguez', team: 'Falcons U14', position: 'Goalkeeper', rating: 8.9, jerseyNumber: 1, status: 'Active' },
  { id: 5, name: 'Olivia Martinez', team: 'Hawks U18', position: 'Winger', rating: 8.1, jerseyNumber: 7, status: 'Active' },
  { id: 6, name: 'David Thompson', team: 'Eagles U12', position: 'Striker', rating: 7.5, jerseyNumber: 11, status: 'Injured' },
  { id: 7, name: 'Sofia Garcia', team: 'Falcons U14', position: 'Midfielder', rating: 8.3, jerseyNumber: 8, status: 'Active' },
  { id: 8, name: 'Lucas Anderson', team: 'Hawks U18', position: 'Defender', rating: 8.7, jerseyNumber: 5, status: 'Active' },
];

const teamOptionsStatic = [
  { value: 'all', label: 'All Teams' },
  { value: 'Eagles U16', label: 'Eagles U16' },
  { value: 'Hawks U18', label: 'Hawks U18' },
  { value: 'Falcons U14', label: 'Falcons U14' },
  { value: 'Eagles U12', label: 'Eagles U12' },
];

const AdminPlayersPage = () => {
  const { t, i18n } = useTranslation();

  const { bgGradient, cardBg, cardBorder, cardShadow, primaryGreen, textColor } = useDashboardTheme();
  const pageBg = bgGradient;
  const isRTL = i18n?.language === 'ar';

  const [players, setPlayers] = useState(initialPlayers);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    team: 'Eagles U16', 
    position: 'Midfielder',
    jerseyNumber: ''
  });
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const toast = useToast();

  // localize the 'all' label so it changes when language switches
  const teamOptions = teamOptionsStatic.map(o =>
    o.value === 'all' ? { ...o, label: t('filterAllTeams') || 'All Teams' } : o
  );

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = teamFilter === 'all' || player.team === teamFilter;
    return matchesSearch && matchesTeam;
  });

  const handleAdd = () => {
    const newPlayer = {
      id: players.length + 1,
      ...formData,
      jerseyNumber: parseInt(formData.jerseyNumber),
      rating: 7.0,
      status: 'Active',
    };
    setPlayers([...players, newPlayer]);
    toast({
      title: t('notification.playerAdded') || 'Player added',
      description: t('notification.playerAddedDesc') || `${formData.name} has been added successfully.`,
      status: 'success',
      duration: 3000,
    });
    onAddClose();
    setFormData({ name: '', team: 'Eagles U16', position: 'Midfielder', jerseyNumber: '' });
  };

  const handleEdit = () => {
    setPlayers(players.map(p => 
      p.id === selectedPlayer.id 
        ? { ...p, ...formData, jerseyNumber: parseInt(formData.jerseyNumber) } 
        : p
    ));
    toast({
      title: t('notification.playerUpdated') || 'Player updated',
      description: t('notification.playerUpdatedDesc') || `Player information has been updated successfully.`,
      status: 'success',
      duration: 3000,
    });
    onEditClose();
    setSelectedPlayer(null);
  };

  const handleDelete = () => {
    setPlayers(players.filter(p => p.id !== selectedPlayer.id));
    toast({
      title: t('notification.playerDeleted') || 'Player deleted',
      description: t('notification.playerDeletedDesc') || `${selectedPlayer.name} has been removed.`,
      status: 'success',
      duration: 3000,
    });
    onDeleteClose();
    setSelectedPlayer(null);
  };

  const openEditDialog = (player) => {
    setSelectedPlayer(player);
    setFormData({ 
      name: player.name, 
      team: player.team, 
      position: player.position,
      jerseyNumber: player.jerseyNumber.toString()
    });
    onEditOpen();
  };

  const openDeleteDialog = (player) => {
    setSelectedPlayer(player);
    onDeleteOpen();
  };

  const getRatingColor = (rating) => {
    if (rating >= 8.5) return 'success';
    if (rating >= 7.5) return 'info';
    return 'warning';
  };

  const columns = [
    {
      header: t('table.player') || 'Player',
      accessor: 'name',
      render: (row) => (
        <HStack spacing={3} align="center">
          <AvatarCircle name={row.name} size="sm" />
          <Box fontWeight="600" fontSize="sm">{row.name}</Box>
        </HStack>
      ),
    },
    {
      header: t('table.team') || 'Team',
      accessor: 'team',
      render: (row) => (
        <Text fontSize="sm" fontWeight="500">{row.team}</Text>
      ),
    },
    {
      header: t('table.position') || 'Position',
      accessor: 'position',
        render: (row) => (
          <Badge variant="info">{t('position' + row.position) ? t('position' + row.position) : (
            // fallback: try mapped keys
            row.position === 'Goalkeeper' ? t('positionGoalkeeper') :
            row.position === 'Defender' ? t('positionDefender') :
            row.position === 'Midfielder' ? t('positionMidfielder') :
            row.position === 'Forward' ? t('positionForward') :
            row.position === 'Winger' ? t('positionWinger') :
            row.position === 'Striker' ? t('positionStriker') : row.position
          )}</Badge>
        ),
    },
    {
      header: t('table.rating') || 'Rating',
      accessor: 'rating',
      render: (row) => (
        <HStack spacing={2}>
          <Star size={14} color="#F59E0B" />
          <Badge variant={getRatingColor(row.rating)}>
            {row.rating.toFixed(1)}
          </Badge>
        </HStack>
      ),
    },
    {
      header: t('table.status') || 'Status',
      accessor: 'status',
        render: (row) => (
          <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>
            {row.status === 'Active' ? t('statusActive') : row.status === 'Injured' ? t('statusInjured') : t('statusInactive') || row.status}
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
    <Layout pageTitle={t('playersManagement') || 'Players Management'} pageSubtitle={t('playersManagementDesc') || 'Manage academy players'}>
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
          title={t('cardTitlePlayers') || 'All Players'}
          count={filteredPlayers.length}
          actionLabel={t('actionAddPlayer') || 'Add Player'}
          onAction={onAddOpen}
        />

        <Flex gap={4} mb={6}>
          <Box flex={1}>
              <SearchInput
                placeholder={t('searchPlaceholderPlayers') || 'Search by player name...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Box>
            <Box width="200px">
              <FilterSelect
                placeholder={t('filterAllTeams') || 'All Teams'}
                options={teamOptions}
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
            </Box>
        </Flex>

        <DataTable
          columns={columns}
          data={filteredPlayers}
          emptyMessage="No players found"
          wrapperBorderColor={cardBorder}
        />
        </Box>
      </Box>

      {/* Add Player Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('modal.addPlayer') || t('actionAddPlayer') || 'Add New Player'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t('playerName') || 'Name'}</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('playerNamePlaceholder') || 'Enter player name'}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('team') || 'Team'}</FormLabel>
                <Select
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                >
                  <option value="Eagles U16">Eagles U16</option>
                  <option value="Hawks U18">Hawks U18</option>
                  <option value="Falcons U14">Falcons U14</option>
                  <option value="Eagles U12">Eagles U12</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('table.position') || 'Position'}</FormLabel>
                <Select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                >
                  <option value="Goalkeeper">{t('positionGoalkeeper') || 'Goalkeeper'}</option>
                  <option value="Defender">{t('positionDefender') || 'Defender'}</option>
                  <option value="Midfielder">{t('positionMidfielder') || 'Midfielder'}</option>
                  <option value="Forward">{t('positionForward') || 'Forward'}</option>
                  <option value="Winger">{t('positionWinger') || 'Winger'}</option>
                  <option value="Striker">{t('positionStriker') || 'Striker'}</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('jerseyNumber') || 'Jersey Number'}</FormLabel>
                <Input
                  type="number"
                  value={formData.jerseyNumber}
                  onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
                  placeholder={t('jerseyNumberPlaceholder') || 'Enter jersey number'}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddClose}>
              {t('cancel') || 'Cancel'}
            </Button>
            <Button colorScheme="green" onClick={handleAdd}>
              {t('actionAddPlayer') || 'Add Player'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Player Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('modal.editPlayer') || 'Edit Player'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t('playerName') || 'Name'}</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('team') || 'Team'}</FormLabel>
                <Select
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                >
                  <option value="Eagles U16">Eagles U16</option>
                  <option value="Hawks U18">Hawks U18</option>
                  <option value="Falcons U14">Falcons U14</option>
                  <option value="Eagles U12">Eagles U12</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('table.position') || 'Position'}</FormLabel>
                <Select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                >
                  <option value="Goalkeeper">{t('positionGoalkeeper') || 'Goalkeeper'}</option>
                  <option value="Defender">{t('positionDefender') || 'Defender'}</option>
                  <option value="Midfielder">{t('positionMidfielder') || 'Midfielder'}</option>
                  <option value="Forward">{t('positionForward') || 'Forward'}</option>
                  <option value="Winger">{t('positionWinger') || 'Winger'}</option>
                  <option value="Striker">{t('positionStriker') || 'Striker'}</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('jerseyNumber') || 'Jersey Number'}</FormLabel>
                <Input
                  type="number"
                  value={formData.jerseyNumber}
                  onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
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
          <ModalHeader>{t('modal.deletePlayer') || 'Delete Player'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {t('confirmDeletePlayer') || `Are you sure you want to delete ${selectedPlayer?.name}? This action cannot be undone.`}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              {t('cancel') || 'Cancel'}
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              {t('actionDelete') || 'Delete'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
};

export default AdminPlayersPage;
