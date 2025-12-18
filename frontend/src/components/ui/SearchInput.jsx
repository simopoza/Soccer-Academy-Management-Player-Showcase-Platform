import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

const SearchInput = ({ 
  placeholder = 'Search...', 
  value,
  onChange,
  ...props 
}) => {
  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <FiSearch color="gray.400" />
      </InputLeftElement>
      <Input
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
      />
    </InputGroup>
  );
};

export default SearchInput;
