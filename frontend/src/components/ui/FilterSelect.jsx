import {
  Box,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Filter as FilterIcon, Check, ChevronDown } from 'lucide-react';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';

const FilterSelect = ({
  placeholder = 'Select...',
  options = [],
  value,
  onChange,
  icon,
  ...props
}) => {
  const IconComp = icon || FilterIcon;
  const selected = options.find((o) => o.value === value);
  const { cardBorder, cardShadow, textColor, primaryGreen } = useDashboardTheme();
  const placeholderColor = useColorModeValue('#94A3B8', '#94A3B8');
  const menuBg = useColorModeValue('#FFFFFF', '#1F2937');
  const menuHoverBg = useColorModeValue('#F8FAFC', '#111827');
  const selectedBg = useColorModeValue('#F1F5F9', '#111827');

  const dedupedOptions = options.filter(
    (opt, idx, arr) =>
      arr.findIndex((o) => o.value === opt.value) === idx
  );

  return (
    <Box width={props.w || '100%'}>
      <Menu placement="bottom-start">
        <MenuButton
          as={Button}
          variant="unstyled"
          width="100%"
          _hover={{}}
          _active={{}}
        >
          <HStack
            height="40px"
            px="12px"
            bg={menuBg}
            border={`1px solid ${cardBorder || '#E2E8F0'}`}
            borderRadius="8px"
            align="center"
            _hover={{ bg: menuHoverBg }}
          >
            {/* Left icon (fixed width) */}
              <Box
              w="24px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color={placeholderColor}
            >
              <IconComp size={16} />
            </Box>

            {/* Center text (true center) */}
            <Box flex={1} textAlign="center">
              <Text
                fontSize="14px"
                fontWeight="500"
                color={selected ? textColor || '#0F172A' : placeholderColor}
                lineHeight="1"
              >
                {selected ? selected.label : placeholder}
              </Text>
            </Box>

            {/* Right chevron (same width as left icon) */}
            <Box
              w="24px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color={placeholderColor}
            >
              <ChevronDown size={16} />
            </Box>
          </HStack>
        </MenuButton>

        <MenuList
          mt="6px"
          p="4px"
          bg={menuBg}
          border={`1px solid ${cardBorder || '#E2E8F0'}`}
          borderRadius="8px"
          boxShadow={cardShadow || '0 8px 24px rgba(15, 23, 42, 0.08)'}
        >
          {dedupedOptions.map((option) => {
            const isSelected = option.value === value;

            return (
              <MenuItem
                key={option.value}
                height="40px"
                borderRadius="6px"
                fontSize="14px"
                fontWeight="500"
                bg={isSelected ? selectedBg : 'transparent'}
                _hover={{ bg: menuHoverBg }}
                onClick={() =>
                  onChange({ target: { value: option.value } })
                }
              >
                <Box flex={1}>{option.label}</Box>
                {isSelected && (
                  <Box color={primaryGreen || '#16A34A'}>
                    <Check size={16} />
                  </Box>
                )}
              </MenuItem>
            );
          })}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default FilterSelect;
