import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { Search } from 'lucide-react';

const SearchInput = ({ 
  placeholder = 'Search...', 
  value,
  onChange,
  ...props 
}) => {
  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <Search size={16} color="#94A3B8" />
      </InputLeftElement>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        bg="#FFFFFF"
        borderColor="#E2E8F0"
        _hover={{ borderColor: '#CBD5E1' }}
        _focus={{ borderColor: '#2563EB', boxShadow: '0 0 0 1px #2563EB' }}
        height="40px"
        borderRadius="8px"
        {...props}
      />
    </InputGroup>
  );
};

export default SearchInput;
