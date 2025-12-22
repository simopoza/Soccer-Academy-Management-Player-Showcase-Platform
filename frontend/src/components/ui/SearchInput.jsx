import { Input, InputGroup, InputLeftElement, useColorModeValue } from '@chakra-ui/react';
import { Search } from 'lucide-react';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';

const SearchInput = ({ 
  placeholder = 'Search...', 
  value,
  onChange,
  ...props 
}) => {
  const { cardBg, cardBorder, primaryGreen, textColor } = useDashboardTheme();
  const placeholderColor = useColorModeValue('#94A3B8', '#94A3B8');
  const inputBg = cardBg || useColorModeValue('#FFFFFF', '#1F2937');
  const borderColor = cardBorder || useColorModeValue('#E2E8F0', '#374151');
  const hoverBorder = useColorModeValue('#CBD5E1', '#4B5563');
  const focusBorder = primaryGreen || '#2563EB';

  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <Search size={16} color={placeholderColor} />
      </InputLeftElement>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        bg={inputBg}
        borderColor={borderColor}
        _placeholder={{ color: placeholderColor }}
        _hover={{ borderColor: hoverBorder }}
        _focus={{ borderColor: focusBorder, boxShadow: `0 0 0 1px ${focusBorder}` }}
        height="40px"
        borderRadius="8px"
        color={textColor}
        {...props}
      />
    </InputGroup>
  );
};

export default SearchInput;
