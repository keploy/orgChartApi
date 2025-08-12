import React from 'react';
import { DataGrid, GridColDef, GridToolbar, GridRowParams } from '@mui/x-data-grid';
import { Box } from '@mui/material';

export interface CrudTableProps<T extends { id: number }> {
  rows: T[];
  columns: GridColDef[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
}

export function CrudTable<T extends { id: number }>({ rows, columns, loading, onRowClick }: CrudTableProps<T>) {
  return (
    <Box sx={{ height: 520, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        onRowClick={(params: GridRowParams) => onRowClick?.(params.row as T)}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        pageSizeOptions={[5, 10, 25]}
      />
    </Box>
  );
}
