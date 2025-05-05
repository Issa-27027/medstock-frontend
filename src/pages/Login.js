import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      const success = await login(formData.username, formData.password);
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        m: 0,
        p: 0,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.1) 10px,
            transparent 10px,
            transparent 20px
          )`,
          opacity: 0.4,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(0, 0, 0, 0.05) 20px,
            rgba(0, 0, 0, 0.05) 40px
          )`,
          opacity: 0.3,
        },
      }}
    >
      <Container 
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: 400,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #1976d2 30%, #64b5f6 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              MedStock
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ opacity: 0.8 }}
            >
              Please sign in to continue
            </Typography>
          </Box>

          {(formError || authError) && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {formError || authError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1976d2',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1976d2',
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                background: 'linear-gradient(45deg, #1976d2 30%, #64b5f6 90%)',
                boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #42a5f5 90%)',
                },
                height: 48,
                fontSize: '1.1rem',
              }}
            >
              Sign In
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login; 