import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { listPersons } from '../api/client';
import { OrgChart } from '../components/OrgChart';
import { Stack, Typography } from '@mui/material';

export const OrgChartPage: React.FC = () => {
  const { data: persons = [], isLoading } = useQuery({ queryKey: ['persons'], queryFn: () => listPersons() });
  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={600}>Organization Chart</Typography>
      {isLoading ? 'Loading...' : <OrgChart persons={persons} />}
    </Stack>
  );
};
