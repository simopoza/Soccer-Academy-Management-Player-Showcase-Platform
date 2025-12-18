import { HStack, IconButton, Tooltip } from '@chakra-ui/react';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

const ActionButtons = ({ 
  onView, 
  onEdit, 
  onDelete,
  showView = false,
  showEdit = true,
  showDelete = true,
  size = 'sm',
  ...props 
}) => {
  return (
    <HStack spacing={1} {...props}>
      {showView && onView && (
        <Tooltip label="View" fontSize="xs">
          <IconButton
            aria-label="View"
            icon={<FiEye />}
            size={size}
            variant="ghost"
            colorScheme="blue"
            onClick={onView}
          />
        </Tooltip>
      )}
      
      {showEdit && onEdit && (
        <Tooltip label="Edit" fontSize="xs">
          <IconButton
            aria-label="Edit"
            icon={<FiEdit2 />}
            size={size}
            variant="ghost"
            colorScheme="green"
            onClick={onEdit}
          />
        </Tooltip>
      )}
      
      {showDelete && onDelete && (
        <Tooltip label="Delete" fontSize="xs">
          <IconButton
            aria-label="Delete"
            icon={<FiTrash2 />}
            size={size}
            variant="ghost"
            colorScheme="red"
            onClick={onDelete}
          />
        </Tooltip>
      )}
    </HStack>
  );
};

export default ActionButtons;
