import React from 'react';
import { Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, IconButton, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Person } from '../api/client';

interface Props {
  open: boolean;
  title: string;
  loading: boolean;
  persons: any[];
  onClose: () => void;
}

export const RelatedPersonsDialog: React.FC<Props> = ({ open, title, loading, persons, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 5 }}>
        {title}
        <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? <Stack alignItems="center" py={4}><CircularProgress /></Stack> : (
          persons.length === 0 ? <Stack py={2}>No persons found.</Stack> :
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Job</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Manager</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {persons.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.first_name} {p.last_name}</TableCell>
                  <TableCell>{p.job?.title || ''}</TableCell>
                  <TableCell>{p.department?.name || ''}</TableCell>
                  <TableCell>{p.manager?.full_name || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};
