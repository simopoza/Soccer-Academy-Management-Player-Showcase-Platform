import { Select, Box, HStack } from '@chakra-ui/react';
import { Filter as FilterIcon } from 'lucide-react';

const FilterSelect = ({ 
  placeholder = 'Select...', 
  options = [],
  value,
  onChange,
  icon: IconComp = FilterIcon,
  ...props 
}) => {
  return (
    <Box>
      <HStack bg="#FFFFFF" border="1px solid #E2E8F0" borderRadius="8px" height="40px" spacing={2} px={2} alignItems="center">
        <Box display="flex" alignItems="center" justifyContent="center" color="#94A3B8">
          <IconComp size={16} />
        </Box>
        <Select
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          variant="unstyled"
          _focus={{ boxShadow: 'none' }}
          height="36px"
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </HStack>
    </Box>
  );
};

export default FilterSelect;
