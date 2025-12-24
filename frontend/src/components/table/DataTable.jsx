import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';

const DataTable = ({ 
  columns = [], 
  data = [],
  emptyMessage = 'No data available',
  wrapperBorderColor,
  ...props 
}) => {
  const tableProps = { ...props };
  const { cardBorder, titleColor, textColor, primaryGreen } = useDashboardTheme();

  // call color-mode hooks at top-level and compute fallbacks
  const headerBgFallback = useColorModeValue('#ECFDF5', '#0B1220');
  const rowHoverBg = useColorModeValue('#F1F5F9', '#071028');
  const cellTextColorFallback = useColorModeValue('#0F172A', '#E6EEF6');
  const headerColor = useColorModeValue(primaryGreen || titleColor || '#0F172A', 'whiteAlpha.900');
  const borderBottomColor = useColorModeValue('#E2E8F0', '#1F2937');

  const headerBg = wrapperBorderColor || cardBorder || headerBgFallback;
  const cellTextColor = textColor || cellTextColorFallback;

  return (
    <Box overflowX="auto" borderRadius="8px" border="1px" borderColor={wrapperBorderColor || cardBorder || '#E2E8F0'}>
      <Table variant="simple" {...tableProps}>
        <Thead bg={headerBg}>
          <Tr>
            {columns.map((column, index) => (
                <Th
                key={index}
                fontSize="13px"
                fontWeight="600"
                textTransform="none"
                letterSpacing="normal"
                  color={headerColor}
                  _light={{ color: primaryGreen || titleColor || '#0F172A' }}
                  _dark={{ color: 'whiteAlpha.900' }}
                  borderBottom={`1px solid ${wrapperBorderColor || cardBorder || borderBottomColor}`}
                py="14px"
              >
                {column.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={columns.length} textAlign="center" py={8}>
                <Text color="gray.500" fontSize="sm">
                  {emptyMessage}
                </Text>
              </Td>
            </Tr>
          ) : (
            data.map((row, rowIndex) => (
              <Tr
                key={row.id || rowIndex}
                _hover={{ bg: rowHoverBg, cursor: 'pointer' }}
                transition="background-color 0.15s ease"
              >
                {columns.map((column, colIndex) => (
                  <Td
                    key={colIndex}
                    fontSize="sm"
                    color={cellTextColor}
                    py="14px"
                  >
                    {column.render ? column.render(row) : row[column.accessor]}
                  </Td>
                ))}
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default DataTable;
