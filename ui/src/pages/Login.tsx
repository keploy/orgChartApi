import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack, Tabs, Tab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { handleLogin, handleRegister } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true); setError(null);
    try {
      if (mode === 'login') await handleLogin({ username, password });
      else await handleRegister({ username, password });
      nav('/');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Action failed');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <Paper sx={{ p: 4, width: 420 }} elevation={4}>
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight={600} textAlign="center">Org Chart {mode === 'login' ? 'Login' : 'Create Account'}</Typography>
          <Tabs value={mode} onChange={(_, v) => setMode(v)} centered>
            <Tab label="Login" value="login" />
            <Tab label="Register" value="register" />
          </Tabs>
          <TextField label="Username" fullWidth value={username} onChange={e => setUsername(e.target.value)} autoFocus />
          <TextField label="Password" type="password" fullWidth value={password} onChange={e => setPassword(e.target.value)} />
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <Button onClick={submit} disabled={loading || !username || !password} size="large">{loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Register')}</Button>
        </Stack>
      </Paper>
    </Box>
  );
};
