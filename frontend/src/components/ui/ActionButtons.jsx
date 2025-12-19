import { HStack, IconButton, Tooltip } from '@chakra-ui/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

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
            icon={<Eye />}
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
            icon={<Pencil />}
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
            icon={<Trash2 />}
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
