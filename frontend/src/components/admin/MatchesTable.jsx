import React from 'react';
import { VStack, HStack, Box, Text } from '@chakra-ui/react';
import { DataTable } from '../../components/table';
import { Badge, ActionButtons } from '../../components/ui';
import adminMatchesConfig from '../../constants/adminMatches.config';

const MatchesTable = ({ matches, onEdit, onDelete, wrapperBorderColor, emptyMessage, i18n, primaryGreen, opponentColor }) => {
  const columns = adminMatchesConfig.createMatchColumns({ i18n, primaryGreen, opponentColor, onEdit, onDelete }).map(col => {
    // inject action handlers into actions column render
    if (col.accessor === 'actions') {
      return {
        ...col,
        render: (row) => <ActionButtons onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />,
      };
    }
    return col;
  });

  return (
    <DataTable
      columns={columns}
      data={matches}
      emptyMessage={emptyMessage}
      wrapperBorderColor={wrapperBorderColor}
    />
  );
};

export default MatchesTable;
