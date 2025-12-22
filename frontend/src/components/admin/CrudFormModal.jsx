import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  SimpleGrid,
} from '@chakra-ui/react';

/**
 * Generic CRUD form modal
 * Props:
 * - isOpen, onClose
 * - mode: 'add'|'edit'
 * - titleAdd, titleEdit
 * - confirmLabelAdd, confirmLabelEdit
 * - formData, setFormData
 * - onConfirm: function to call when confirm button clicked
 * - fields: [{ name, label, type ('text'|'select'|'textarea'|'number'), options? }]
 */
const CrudFormModal = ({
  isOpen,
  onClose,
  mode = 'add',
  titleAdd = 'Add',
  titleEdit = 'Edit',
  confirmLabelAdd = 'Add',
  confirmLabelEdit = 'Save',
  formData = {},
  setFormData = () => {},
  onConfirm = () => {},
  fields = [],
  layout = 'stack', // 'stack' | 'grid'
  columns = 1,
}) => {
  const title = mode === 'add' ? titleAdd : titleEdit;
  const confirmLabel = mode === 'add' ? confirmLabelAdd : confirmLabelEdit;

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {layout === 'grid' ? (
            <SimpleGrid columns={columns} spacing={4}>
              {fields.map((f) => (
                <FormControl key={f.name} isRequired={f.isRequired} gridColumn={f.colSpan ? `span ${f.colSpan}` : undefined}>
                  <FormLabel>{f.label}</FormLabel>
                  {f.type === 'select' ? (
                    <Select
                      value={formData[f.name] ?? ''}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                    >
                      {f.options && f.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  ) : f.type === 'textarea' ? (
                    <Textarea
                      value={formData[f.name] ?? ''}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      rows={f.rows || 3}
                    />
                  ) : f.type === 'number' ? (
                    <NumberInput value={formData[f.name] ?? ''} onChange={(val) => handleChange(f.name, val)}>
                      <NumberInputField />
                    </NumberInput>
                  ) : (
                    <Input
                      value={formData[f.name] ?? ''}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      placeholder={f.placeholder}
                      type={f.inputType || 'text'}
                    />
                  )}
                </FormControl>
              ))}
            </SimpleGrid>
          ) : (
            <VStack spacing={4} align="stretch">
              {fields.map((f) => (
                <FormControl key={f.name} isRequired={f.isRequired}>
                  <FormLabel>{f.label}</FormLabel>
                  {f.type === 'select' ? (
                    <Select
                      value={formData[f.name] ?? ''}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                    >
                      {f.options && f.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  ) : f.type === 'textarea' ? (
                    <Textarea
                      value={formData[f.name] ?? ''}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      rows={f.rows || 3}
                    />
                  ) : f.type === 'number' ? (
                    <NumberInput value={formData[f.name] ?? ''} onChange={(val) => handleChange(f.name, val)}>
                      <NumberInputField />
                    </NumberInput>
                  ) : (
                    <Input
                      value={formData[f.name] ?? ''}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      placeholder={f.placeholder}
                      type={f.inputType || 'text'}
                    />
                  )}
                </FormControl>
              ))}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="green" onClick={onConfirm}>{confirmLabel}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CrudFormModal;
