import { Select } from '@chakra-ui/react';

const FilterSelect = ({ 
  placeholder = 'Select...', 
  options = [],
  value,
  onChange,
  ...props 
}) => {
  return (
    <Select
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      bg="white"
      borderColor="gray.200"
      _hover={{ borderColor: 'gray.300' }}
      _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px var(--chakra-colors-green-500)' }}
      height="40px"
      borderRadius="8px"
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
};

export default FilterSelect;
