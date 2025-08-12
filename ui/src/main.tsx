import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { DepartmentsPage } from './pages/Departments';
import { JobsPage } from './pages/Jobs';
import { PersonsPage } from './pages/Persons';
import { OrgChartPage } from './pages/OrgChartPage';
import { AuthGate } from './components/AuthGate';
import { AuthProvider } from './hooks/useAuth';

const qc = new QueryClient();

const App: React.FC = () => {
  const [mode, setMode] = useState<'light' | 'dark'>(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const theme = useMemo(() => mode === 'light' ? lightTheme : darkTheme, [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<AuthGate><Layout mode={mode} onToggleMode={() => setMode(m => m === 'light' ? 'dark' : 'light')} /></AuthGate>}>
              <Route index element={<DashboardPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="persons" element={<PersonsPage />} />
              <Route path="org-chart" element={<OrgChartPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
