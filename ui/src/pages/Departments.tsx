import React, { useState } from 'react';
import { Box, Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listDepartments, createDepartment, updateDepartment, deleteDepartment, Department, getDepartmentPersons } from '../api/client';
import { CrudTable } from '../components/CrudTable';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { RelatedPersonsDialog } from '../components/RelatedPersonsDialog';

export const DepartmentsPage: React.FC = () => {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ['departments'], queryFn: () => listDepartments() });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [relatedOpen, setRelatedOpen] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedPersons, setRelatedPersons] = useState<any[]>([]);
  const [snack, setSnack] = useState<{open:boolean; msg:string; severity:'success'|'error'}>({open:false,msg:'',severity:'success'});

  const createMut = useMutation({ mutationFn: createDepartment, onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); setOpen(false); setSnack({open:true,msg:'Department created',severity:'success'}); }, onError:()=>setSnack({open:true,msg:'Create failed',severity:'error'}) });
  const updateMut = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: Partial<Department> }) => updateDepartment(id, payload), onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); setOpen(false); setSnack({open:true,msg:'Department updated',severity:'success'}); }, onError:()=>setSnack({open:true,msg:'Update failed',severity:'error'}) });
  const deleteMut = useMutation({ mutationFn: (id: number) => deleteDepartment(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); setSnack({open:true,msg:'Department deleted',severity:'success'}); }, onError:()=>setSnack({open:true,msg:'Delete failed',severity:'error'}) });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'actions', headerName: 'Actions', width: 260, sortable: false, renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => { setEditing(params.row as Department); setName((params.row as Department).name); setOpen(true); }}>Edit</Button>
          <Button size="small" color="error" onClick={() => deleteMut.mutate((params.row as Department).id)}>Delete</Button>
          <Button size="small" variant="outlined" onClick={async () => { setRelatedOpen(true); setRelatedLoading(true); try { const list = await getDepartmentPersons((params.row as Department).id); setRelatedPersons(list); } finally { setRelatedLoading(false); } }}>People</Button>
        </Stack>
      )
    }
  ];

  const submit = () => {
    if (editing) updateMut.mutate({ id: editing.id, payload: { name } }); else createMut.mutate({ name } as any);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={600}>Departments</Typography>
        <Button onClick={() => { setEditing(null); setName(''); setOpen(true); }}>New Department</Button>
      </Stack>
      <CrudTable rows={data} columns={columns} loading={isLoading} />
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Edit Department' : 'New Department'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth sx={{ mt: 1 }} value={name} onChange={e => setName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!name}>{editing ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
      <RelatedPersonsDialog open={relatedOpen} title="Department People" loading={relatedLoading} persons={relatedPersons} onClose={() => setRelatedOpen(false)} />
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={()=>setSnack(s=>({...s,open:false}))} anchorOrigin={{vertical:'bottom',horizontal:'center'}}>
        <Alert severity={snack.severity} variant="filled" onClose={()=>setSnack(s=>({...s,open:false}))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};
