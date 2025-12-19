// // import { Box, HStack, Menu, MenuButton, MenuList, MenuItem, Button, Text } from '@chakra-ui/react';
// // import { Filter as FilterIcon, Check } from 'lucide-react';

// // const FilterSelect = ({
// //   placeholder = 'Select...',
// //   options = [],
// //   value,
// //   onChange,
// //   icon: IconComp = FilterIcon,
// //   ...props
// // }) => {
// //   const selected = options.find((o) => o.value === value);

// //   // dedupe options by value to avoid duplicate entries
// //   const dedupedOptions = options.filter((opt, idx, arr) => arr.findIndex((o) => o.value === opt.value) === idx);

// //   // If a width is passed, respect it; otherwise allow the control to flex and fill remaining space
// //   const explicitWidth = props.w || props.width;

// //   return (
// //     <Box display="block" flex={explicitWidth ? undefined : 1} width={explicitWidth || '100%'}>
// //       <Menu>
// //         {() => (
// //           <>
// //             <MenuButton as={Button} variant="ghost" p={0} _hover={{}} _active={{}} width="100%">
// //               <HStack bg="#FFFFFF" border="1px solid #E2E8F0" borderRadius="8px" height="40px" spacing={2} px={3} alignItems="center">
// //                 <Box display="flex" alignItems="center" justifyContent="center" color="#94A3B8">
// //                   <IconComp size={16} />
// //                 </Box>
// //                 <Box flex={1} textAlign="left">
// //                   <Text fontSize="sm" color={selected ? 'gray.800' : '#94A3B8'}>
// //                     {selected ? selected.label : placeholder}
// //                   </Text>
// //                 </Box>
// //               </HStack>
// //             </MenuButton>
// //             <MenuList zIndex={1000} minW="auto" w="100%">
// //               {dedupedOptions.map((option) => (
// //                 <MenuItem key={option.value} onClick={() => onChange({ target: { value: option.value } })}>
// //                   <Box flex={1}>{option.label}</Box>
// //                   {value === option.value && <Check size={16} />}
// //                 </MenuItem>
// //               ))}
// //             </MenuList>
// //           </>
// //         )}
// //       </Menu>
// //     </Box>
// //   );
// // };

// // export default FilterSelect;


// import {
//   Box,
//   HStack,
//   Menu,
//   MenuButton,
//   MenuList,
//   MenuItem,
//   Button,
//   Text,
// } from '@chakra-ui/react';
// import { Filter as FilterIcon, Check } from 'lucide-react';

// const FilterSelect = ({
//   placeholder = 'Select...',
//   options = [],
//   value,
//   onChange,
//   icon: IconComp = FilterIcon,
//   ...props
// }) => {
//   const selected = options.find((o) => o.value === value);

//   const dedupedOptions = options.filter(
//     (opt, idx, arr) =>
//       arr.findIndex((o) => o.value === opt.value) === idx
//   );

//   const explicitWidth = props.w || props.width;

//   return (
//     <Box width={explicitWidth || '100%'}>
//       <Menu placement="bottom-start">
//         <MenuButton
//           as={Button}
//           variant="unstyled"
//           width="100%"
//           _hover={{}}
//           _active={{}}
//         >
//           <HStack
//             height="40px"
//             px="12px"
//             spacing="8px"
//             bg="#FFFFFF"
//             border="1px solid #E2E8F0"
//             borderRadius="8px"
//             _hover={{ bg: '#F8FAFC' }}
//           >
//             <Box color="#94A3B8">
//               <IconComp size={16} />
//             </Box>

//             <Text
//               fontSize="14px"
//               fontWeight="500"
//               color={selected ? '#0F172A' : '#94A3B8'}
//               flex={1}
//               textAlign="left"
//             >
//               {selected ? selected.label : placeholder}
//             </Text>
//           </HStack>
//         </MenuButton>

//         <MenuList
//           mt="6px"
//           p="4px"
//           border="1px solid #E2E8F0"
//           borderRadius="8px"
//           boxShadow="0 8px 24px rgba(15, 23, 42, 0.08)"
//         >
//           {dedupedOptions.map((option) => {
//             const isSelected = option.value === value;

//             return (
//               <MenuItem
//                 key={option.value}
//                 height="40px"
//                 borderRadius="6px"
//                 fontSize="14px"
//                 fontWeight="500"
//                 bg={isSelected ? '#F1F5F9' : 'transparent'}
//                 _hover={{ bg: '#F8FAFC' }}
//                 onClick={() =>
//                   onChange({ target: { value: option.value } })
//                 }
//               >
//                 <Box flex={1}>{option.label}</Box>
//                 {isSelected && (
//                   <Box color="#16A34A">
//                     <Check size={16} />
//                   </Box>
//                 )}
//               </MenuItem>
//             );
//           })}
//         </MenuList>
//       </Menu>
//     </Box>
//   );
// };

// export default FilterSelect;


import {
  Box,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
} from '@chakra-ui/react';
import { Filter as FilterIcon, Check, ChevronDown } from 'lucide-react';

const FilterSelect = ({
  placeholder = 'Select...',
  options = [],
  value,
  onChange,
  icon: IconComp = FilterIcon,
  ...props
}) => {
  const selected = options.find((o) => o.value === value);

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
            bg="#FFFFFF"
            border="1px solid #E2E8F0"
            borderRadius="8px"
            align="center"
            _hover={{ bg: '#F8FAFC' }}
          >
            {/* Left icon (fixed width) */}
            <Box
              w="24px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="#94A3B8"
            >
              <IconComp size={16} />
            </Box>

            {/* Center text (true center) */}
            <Box flex={1} textAlign="center">
              <Text
                fontSize="14px"
                fontWeight="500"
                color={selected ? '#0F172A' : '#94A3B8'}
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
              color="#94A3B8"
            >
              <ChevronDown size={16} />
            </Box>
          </HStack>
        </MenuButton>

        <MenuList
          mt="6px"
          p="4px"
          border="1px solid #E2E8F0"
          borderRadius="8px"
          boxShadow="0 8px 24px rgba(15, 23, 42, 0.08)"
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
                bg={isSelected ? '#F1F5F9' : 'transparent'}
                _hover={{ bg: '#F8FAFC' }}
                onClick={() =>
                  onChange({ target: { value: option.value } })
                }
              >
                <Box flex={1}>{option.label}</Box>
                {isSelected && (
                  <Box color="#16A34A">
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
