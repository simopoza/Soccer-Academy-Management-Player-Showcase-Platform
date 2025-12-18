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

const DataTable = ({ 
  columns = [], 
  data = [],
  emptyMessage = 'No data available',
  ...props 
}) => {
  return (
    <Box overflowX="auto" borderRadius="8px" border="1px" borderColor="gray.200">
      <Table variant="simple" {...props}>
        <Thead bg="gray.50">
          <Tr>
            {columns.map((column, index) => (
              <Th
                key={index}
                fontSize="xs"
                fontWeight="600"
                textTransform="uppercase"
                letterSpacing="wider"
                color="gray.600"
                py={4}
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
                _hover={{ bg: 'gray.50' }}
                transition="background-color 0.2s"
              >
                {columns.map((column, colIndex) => (
                  <Td
                    key={colIndex}
                    fontSize="sm"
                    color="gray.700"
                    py={4}
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
