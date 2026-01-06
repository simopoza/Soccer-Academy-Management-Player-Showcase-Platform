import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Stack,
  useToast,
} from '@chakra-ui/react';
import matchService from '../../services/matchService';
import { useQueryClient } from '@tanstack/react-query';

const OpponentGoalModal = ({ isOpen, onClose, match }) => {
  const [goals, setGoals] = useState(1);
  const [assists, setAssists] = useState(0);
  const [minutes, setMinutes] = useState(90);
  const [saves, setSaves] = useState(0);
  const [yellowCards, setYellowCards] = useState(0);
  const [redCards, setRedCards] = useState(0);
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    if (!isOpen) return;
    setGoals(1);
    setAssists(0);
    setMinutes(90);
    setSaves(0);
    setYellowCards(0);
    setRedCards(0);
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!match || !match.id) return;
    setLoading(true);
    try {
      const payload = {
        goals,
        assists,
        minutes_played: minutes,
        saves,
        yellowCards,
        redCards,
      };
      await matchService.opponentGoal(match.id, payload);
      // refresh matches cache
      qc.invalidateQueries(['matches']);
      toast({ title: 'Opponent goal recorded', status: 'success', duration: 3000 });
      onClose();
    } catch (err) {
      console.error('Opponent goal failed', err);
      toast({ title: 'Error', description: err?.message || 'Failed to record opponent goal', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Record Opponent Goal</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={3}>
            <FormControl>
              <FormLabel>Goals</FormLabel>
              <NumberInput min={1} value={goals} onChange={(v) => setGoals(Number(v))}>
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Assists</FormLabel>
              <NumberInput min={0} value={assists} onChange={(v) => setAssists(Number(v))}>
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Minutes Played</FormLabel>
              <NumberInput min={0} max={120} value={minutes} onChange={(v) => setMinutes(Number(v))}>
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Saves</FormLabel>
              <NumberInput min={0} value={saves} onChange={(v) => setSaves(Number(v))}>
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Yellow Cards</FormLabel>
              <NumberInput min={0} value={yellowCards} onChange={(v) => setYellowCards(Number(v))}>
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Red Cards</FormLabel>
              <NumberInput min={0} value={redCards} onChange={(v) => setRedCards(Number(v))}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button colorScheme="orange" onClick={handleConfirm} isLoading={loading}>
            Record Goal
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OpponentGoalModal;
