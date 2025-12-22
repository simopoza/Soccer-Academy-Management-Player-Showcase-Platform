import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  VStack,
} from '@chakra-ui/react';

const ConfirmModal = ({ isOpen, onClose, title = 'Confirm', body = '', onConfirm = () => {}, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) => {
  const handleConfirm = () => {
    const res = onConfirm();
    // allow onConfirm to return a promise; caller may handle closing
    if (res && typeof res.then === 'function') {
      res.then(() => onClose()).catch(() => {});
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch">
            {typeof body === 'string' ? <Text>{body}</Text> : body}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>{cancelLabel}</Button>
          <Button colorScheme="red" onClick={handleConfirm}>{confirmLabel}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;
