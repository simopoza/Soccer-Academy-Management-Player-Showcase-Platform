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
  const { cardBorder, titleColor } = useDashboardTheme();

  const headerBg = wrapperBorderColor || cardBorder || '#D1FAE5';

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
                color={titleColor || '#475569'}
                borderBottom={`1px solid ${wrapperBorderColor || cardBorder || '#E2E8F0'}`}
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
                _hover={{ bg: headerBg, cursor: 'pointer' }}
                transition="background-color 0.15s ease"
              >
                {columns.map((column, colIndex) => (
                  <Td
                    key={colIndex}
                    fontSize="sm"
                    color="gray.700"
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
