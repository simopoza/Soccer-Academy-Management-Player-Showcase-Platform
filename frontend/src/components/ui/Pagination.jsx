import React from 'react';
import { HStack, Select, Button, Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const Pagination = ({ page, setPage, totalPages, pageSize, setPageSize, pageSizeOptions = [10, 25, 50], isLoading = false }) => {
  const { t } = useTranslation();

  const prevLabel = t('pagination.prev', { defaultValue: 'Prev' });
  const nextLabel = t('pagination.next', { defaultValue: 'Next' });
  const perPageLabel = t('pagination.perPage', { defaultValue: 'Per page:' });
  const pageOfLabel = t('pagination.pageOf', { page, total: totalPages, defaultValue: 'Page {{page}} / {{total}}' });

  const onPrev = () => setPage(prev => Math.max(1, (Number(prev) || 1) - 1));
  const onNext = () => setPage(prev => Math.min(totalPages, (Number(prev) || 1) + 1));
  const onPageSizeChange = (e) => {
    const next = parseInt(e.target.value, 10);
    setPageSize(next);
    // reset to first page when page size changes to avoid empty pages
    setPage(1);
  };

  // plain prev/next handlers

  return (
    <HStack justify="space-between" align="center" mt="12px">
      <HStack>
        <Button size="sm" onClick={onPrev} disabled={page <= 1 || isLoading}>{prevLabel}</Button>
        <Button size="sm" onClick={onNext} disabled={page >= totalPages || isLoading}>{nextLabel}</Button>
        <Box fontSize="14px">{pageOfLabel}</Box>
      </HStack>

      <HStack>
        <Box fontSize="14px">{perPageLabel}</Box>
        <Select size="sm" width="100px" value={pageSize} onChange={onPageSizeChange} disabled={isLoading}>
          {pageSizeOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Select>
      </HStack>
    </HStack>
  );
};

export default Pagination;
