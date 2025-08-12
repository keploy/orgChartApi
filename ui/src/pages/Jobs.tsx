import React, { useState } from 'react';
import { Box, Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listJobs, createJob, updateJob, deleteJob, Job, getJobPersons } from '../api/client';
import { CrudTable } from '../components/CrudTable';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { RelatedPersonsDialog } from '../components/RelatedPersonsDialog';

export const JobsPage: React.FC = () => {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ['jobs'], queryFn: () => listJobs() });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [title, setTitle] = useState('');
  const [relatedOpen, setRelatedOpen] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedPersons, setRelatedPersons] = useState<any[]>([]);
  const [snack, setSnack] = useState<{open:boolean; msg:string; severity:'success'|'error'}>({open:false,msg:'',severity:'success'});

  const createMut = useMutation({ mutationFn: createJob, onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); setOpen(false); setSnack({open:true,msg:'Job created',severity:'success'}); }, onError:()=>setSnack({open:true,msg:'Create failed',severity:'error'}) });
  const updateMut = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: Partial<Job> }) => updateJob(id, payload), onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); setOpen(false); setSnack({open:true,msg:'Job updated',severity:'success'}); }, onError:()=>setSnack({open:true,msg:'Update failed',severity:'error'}) });
  const deleteMut = useMutation({ mutationFn: (id: number) => deleteJob(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); setSnack({open:true,msg:'Job deleted',severity:'success'}); }, onError:()=>setSnack({open:true,msg:'Delete failed',severity:'error'}) });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'title', headerName: 'Title', flex: 1 },
    {
      field: 'actions', headerName: 'Actions', width: 260, sortable: false, renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => { setEditing(params.row as Job); setTitle((params.row as Job).title); setOpen(true); }}>Edit</Button>
          <Button size="small" color="error" onClick={() => deleteMut.mutate((params.row as Job).id)}>Delete</Button>
          <Button size="small" variant="outlined" onClick={async () => { setRelatedOpen(true); setRelatedLoading(true); try { const list = await getJobPersons((params.row as Job).id); setRelatedPersons(list); } finally { setRelatedLoading(false); } }}>People</Button>
        </Stack>
      )
    }
  ];

  const submit = () => { if (editing) updateMut.mutate({ id: editing.id, payload: { title } }); else createMut.mutate({ title } as any); };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={600}>Jobs</Typography>
        <Button onClick={() => { setEditing(null); setTitle(''); setOpen(true); }}>New Job</Button>
      </Stack>
      <CrudTable rows={data} columns={columns} loading={isLoading} />
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Edit Job' : 'New Job'}</DialogTitle>
        <DialogContent>
          <TextField label="Title" fullWidth sx={{ mt: 1 }} value={title} onChange={e => setTitle(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!title}>{editing ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={()=>setSnack(s=>({...s,open:false}))} anchorOrigin={{vertical:'bottom',horizontal:'center'}}>
        <Alert severity={snack.severity} variant="filled" onClose={()=>setSnack(s=>({...s,open:false}))}>{snack.msg}</Alert>
      </Snackbar>
      <RelatedPersonsDialog open={relatedOpen} title="Job People" loading={relatedLoading} persons={relatedPersons} onClose={() => setRelatedOpen(false)} />
    </Box>
  );
};
