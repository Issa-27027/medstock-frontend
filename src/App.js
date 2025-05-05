import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Prescriptions from './pages/Prescriptions';
import Analytics from './pages/Analytics';
import StaffRecords from './pages/StaffRecords';
import Settings from './pages/Settings';
import Orders from './pages/Orders';
import PatientRecords from './pages/PatientRecords';

// Components
import Layout from './components/Layout';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6',
    },
    secondary: {
      main: '#64748b',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

const AppContent = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          {isAuthenticated ? (
            <>
              <Layout />
              <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/prescriptions" element={<Prescriptions />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/staff-records" element={<StaffRecords />} />
                  <Route path="/patient-records" element={<PatientRecords />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
            </>
          ) : (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
        </Box>
      </Router>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
