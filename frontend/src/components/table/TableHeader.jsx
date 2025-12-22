import { Flex, Heading, Text, Button, HStack, useColorModeValue } from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';

const TableHeader = ({ 
  title, 
  count, 
  actionLabel, 
  onAction,
  showAction = true,
  ...props 
}) => {
  const { t } = useTranslation();
  const { titleColor, textColor, primaryGreen } = useDashboardTheme();
  const headerTitleColor = useColorModeValue(primaryGreen || titleColor || 'green.600', 'whiteAlpha.900');
  const countColor = useColorModeValue(textColor || 'gray.600', 'gray.300');
  return (
    <Flex 
      justify="space-between" 
      align="center" 
      mb={6}
      {...props}
    >
      <Flex direction="column" align="flex-start">
        <Heading size="md" fontWeight="600" color={headerTitleColor}>
          {title}
        </Heading>
        {count !== undefined && (
          <Text fontSize="sm" color={countColor} fontWeight="500">
            {count === 1 ? t('table.itemFound', { count }) : t('table.itemsFound', { count })}
          </Text>
        )}
      </Flex>
      
      {showAction && onAction && (
        <Button
          leftIcon={<Plus />}
          colorScheme="green"
          size="md"
          onClick={onAction}
          height="40px"
          borderRadius="8px"
          fontWeight="500"
          bg={primaryGreen}
          _hover={{ opacity: 0.95 }}
        >
          {actionLabel || 'Add New'}
        </Button>
      )}
    </Flex>
  );
};

export default TableHeader;
