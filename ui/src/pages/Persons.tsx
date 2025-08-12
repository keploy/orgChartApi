import React, { useState } from 'react';
import { Box, Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, Alert } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listPersons, createPerson, updatePerson, deletePerson, listDepartments, listJobs, PersonDetails, getDirectReports } from '../api/client';
import { CrudTable } from '../components/CrudTable';
import { RelatedPersonsDialog } from '../components/RelatedPersonsDialog';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

export const PersonsPage: React.FC = () => {
  const qc = useQueryClient();
  const { data: persons = [], isLoading } = useQuery({ queryKey: ['persons'], queryFn: () => listPersons() });
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: () => listDepartments() });
  const { data: jobs = [] } = useQuery({ queryKey: ['jobs'], queryFn: () => listJobs() });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PersonDetails | null>(null);
  const [relatedOpen, setRelatedOpen] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedPersons, setRelatedPersons] = useState<any[]>([]);
  const [snack, setSnack] = useState<{open:boolean; msg:string; severity:'success'|'error'}>({open:false,msg:'',severity:'success'});

  const [form, setForm] = useState({ first_name: '', last_name: '', department_id: '', job_id: '', manager_id: '', hire_date: '' });

  const createMut = useMutation({ mutationFn: createPerson, onSuccess: () => { qc.invalidateQueries({ queryKey: ['persons'] }); setOpen(false); setSnack({open:true,msg:'Person created',severity:'success'}); }, onError:()=>setSnack({open:true,msg:'Create failed',severity:'error'}) });
  const updateMut = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: any }) => updatePerson(id, payload), onSuccess: () => { qc.invalidateQueries({ queryKey: ['persons'] }); setOpen(false); setSnack({open:true,msg:'Person updated',severity:'success'}); }, onError:()=>setSnack({open:true,msg:'Update failed',severity:'error'}) });
  const deleteMut = useMutation({ mutationFn: (id: number) => deletePerson(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['persons'] }); setSnack({open:true,msg:'Person deleted',severity:'success'}); }, onError:()=>setSnack({open:true,msg:'Delete failed',severity:'error'}) });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'first_name', headerName: 'First Name', flex: 1 },
    { field: 'last_name', headerName: 'Last Name', flex: 1 },
    { field: 'job_title', headerName: 'Job', flex: 1, valueGetter: (p: any) => p.row.job?.title },
    { field: 'department_name', headerName: 'Department', flex: 1, valueGetter: (p: any) => p.row.department?.name },
  { field: 'manager', headerName: 'Manager', flex: 1, valueGetter: (p: any) => p.row.manager?.full_name || p.row.manager_name || '' },
    { field: 'hire_date', headerName: 'Hire Date', width: 130 },
    { field: 'actions', headerName: 'Actions', width: 250, sortable: false, renderCell: (params: GridRenderCellParams) => (
      <Stack direction="row" spacing={1}>
        <Button size="small" onClick={() => {
          const row = params.row as PersonDetails;
          setEditing(row);
          setForm({
            first_name: row.first_name,
            last_name: row.last_name,
            department_id: String(row.department_id),
            job_id: String(row.job_id),
            manager_id: row.manager_id ? String(row.manager_id) : '', // '' for none
            hire_date: row.hire_date.split('T')[0]
          });
          setOpen(true);
        }}>Edit</Button>
        <Button size="small" color="error" onClick={() => deleteMut.mutate((params.row as PersonDetails).id)}>Delete</Button>
        <Button size="small" variant="outlined" onClick={async () => { setRelatedOpen(true); setRelatedLoading(true); try { const list = await getDirectReports((params.row as PersonDetails).id); setRelatedPersons(list); } finally { setRelatedLoading(false); } }}>Reports</Button>
      </Stack>
    ) }
  ];

  const submit = () => {
    const payload = {
      ...form,
      department_id: Number(form.department_id),
      job_id: Number(form.job_id),
      manager_id: form.manager_id === '' ? undefined : Number(form.manager_id)
    };
    if (editing) updateMut.mutate({ id: editing.id, payload });
    else createMut.mutate(payload as any);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={600}>People</Typography>
        <Button onClick={() => { setEditing(null); setForm({ first_name: '', last_name: '', department_id: '', job_id: '', manager_id: '', hire_date: '' }); setOpen(true); }}>New Person</Button>
      </Stack>
      <CrudTable rows={persons} columns={columns} loading={isLoading} />
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Person' : 'New Person'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} mt={1}>
            <TextField label="First Name" value={form.first_name} onChange={(e) => setForm(f => ({ ...f, first_name: e.target.value }))} />
            <TextField label="Last Name" value={form.last_name} onChange={(e) => setForm(f => ({ ...f, last_name: e.target.value }))} />
            <TextField label="Hire Date" type="date" InputLabelProps={{ shrink: true }} value={form.hire_date} onChange={(e) => setForm(f => ({ ...f, hire_date: e.target.value }))} />
            <TextField label="Department" select value={form.department_id} onChange={(e) => setForm(f => ({ ...f, department_id: e.target.value }))}>
              {departments.map((d: any) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
            <TextField label="Job" select value={form.job_id} onChange={(e) => setForm(f => ({ ...f, job_id: e.target.value }))}>
              {jobs.map((j: any) => <MenuItem key={j.id} value={j.id}>{j.title}</MenuItem>)}
            </TextField>
            <TextField label="Manager" select value={form.manager_id} onChange={(e) => setForm(f => ({ ...f, manager_id: e.target.value }))}>
              <MenuItem value="">None</MenuItem>
              {persons.map((p: any) => <MenuItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!form.first_name || !form.last_name || !form.department_id || !form.job_id || !form.hire_date}>{editing ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={()=>setSnack(s=>({...s,open:false}))} anchorOrigin={{vertical:'bottom',horizontal:'center'}}>
        <Alert severity={snack.severity} variant="filled" onClose={()=>setSnack(s=>({...s,open:false}))}>{snack.msg}</Alert>
      </Snackbar>
      <RelatedPersonsDialog open={relatedOpen} title="Direct Reports" loading={relatedLoading} persons={relatedPersons} onClose={() => setRelatedOpen(false)} />
    </Box>
  );
};
