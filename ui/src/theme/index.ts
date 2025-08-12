import { createTheme, ThemeOptions } from '@mui/material/styles';

const common: ThemeOptions = {
  typography: {
    fontFamily: 'system-ui, Inter, Roboto, Helvetica, Arial, sans-serif',
    h1: { fontSize: '2.2rem', fontWeight: 600 },
    h2: { fontSize: '1.8rem', fontWeight: 600 },
    h3: { fontSize: '1.4rem', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      defaultProps: { variant: 'contained' },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1565c0' },
    secondary: { main: '#ff7043' },
    background: { default: '#f7f9fc', paper: '#ffffff' },
  },
  ...common,
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#ffab91' },
    background: { default: '#0f1115', paper: '#1c2025' },
  },
  ...common,
});
