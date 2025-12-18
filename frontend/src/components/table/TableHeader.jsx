import { Flex, Heading, Text, Button, HStack } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const TableHeader = ({ 
  title, 
  count, 
  actionLabel, 
  onAction,
  showAction = true,
  ...props 
}) => {
  const { t } = useTranslation();
  return (
    <Flex 
      justify="space-between" 
      align="center" 
      mb={6}
      {...props}
    >
      <HStack spacing={3}>
        <Heading size="md" fontWeight="600" color="gray.800">
          {title}
        </Heading>
        {count !== undefined && (
          <Text fontSize="sm" color="gray.500" fontWeight="500">
            {count === 1 ? t('table.itemFound', { count }) : t('table.itemsFound', { count })}
          </Text>
        )}
      </HStack>
      
      {showAction && onAction && (
        <Button
          leftIcon={<FiPlus />}
          colorScheme="green"
          size="md"
          onClick={onAction}
          height="40px"
          borderRadius="8px"
          fontWeight="500"
        >
          {actionLabel || 'Add New'}
        </Button>
      )}
    </Flex>
  );
};

export default TableHeader;
