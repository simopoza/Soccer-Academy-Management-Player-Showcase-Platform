import React from 'react';
import { HStack, Select, Button, Box } from '@chakra-ui/react';

const Pagination = ({ page, setPage, totalPages, pageSize, setPageSize, pageSizeOptions = [10, 25, 50] }) => {
  return (
    <HStack justify="space-between" align="center" mt="12px">
      <HStack>
        <Button size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>Prev</Button>
        <Button size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next</Button>
        <Box fontSize="14px">Page {page} / {totalPages}</Box>
      </HStack>

      <HStack>
        <Box fontSize="14px">Per page:</Box>
        <Select size="sm" width="100px" value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value, 10))}>
          {pageSizeOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Select>
      </HStack>
    </HStack>
  );
};

export default Pagination;
