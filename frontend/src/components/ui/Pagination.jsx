import React from 'react';
import { HStack, Select, Button, Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const Pagination = ({ page, setPage, totalPages, pageSize, setPageSize, pageSizeOptions = [10, 25, 50] }) => {
  const { t } = useTranslation();

  const prevLabel = t('pagination.prev', { defaultValue: 'Prev' });
  const nextLabel = t('pagination.next', { defaultValue: 'Next' });
  const perPageLabel = t('pagination.perPage', { defaultValue: 'Per page:' });
  const pageOfLabel = t('pagination.pageOf', { page, total: totalPages, defaultValue: 'Page {{page}} / {{total}}' });

  return (
    <HStack justify="space-between" align="center" mt="12px">
      <HStack>
        <Button size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>{prevLabel}</Button>
        <Button size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>{nextLabel}</Button>
        <Box fontSize="14px">{pageOfLabel}</Box>
      </HStack>

      <HStack>
        <Box fontSize="14px">{perPageLabel}</Box>
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
