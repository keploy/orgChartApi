import React from 'react';
import { Stack, Typography, Grid, Paper } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { listPersons, listDepartments, listJobs } from '../api/client';

export const DashboardPage: React.FC = () => {
  const { data: persons = [] } = useQuery({ queryKey: ['persons'], queryFn: () => listPersons() });
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: () => listDepartments() });
  const { data: jobs = [] } = useQuery({ queryKey: ['jobs'], queryFn: () => listJobs() });

  const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <Paper sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="h6" fontWeight={600}>{value}</Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Paper>
  );

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={600}>Overview</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}><Stat label="People" value={persons.length} /></Grid>
        <Grid item xs={12} sm={4}><Stat label="Departments" value={departments.length} /></Grid>
        <Grid item xs={12} sm={4}><Stat label="Jobs" value={jobs.length} /></Grid>
      </Grid>
      <Typography variant="body1">Use the navigation to manage your organization: add people, create departments and roles, and visualize reporting lines.</Typography>
    </Stack>
  );
};
