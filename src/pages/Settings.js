import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Button,
  Container,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Slider,
} from '@mui/material';
import {
  AccountCircle,
  Security,
  Settings as SettingsIcon,
  Backup as BackupIcon,
  PhotoCamera as PhotoCameraIcon,
  Update as UpdateIcon,
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  TextFields as TextFieldsIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

function Settings() {
  const { themeSettings, updateTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Profile Settings
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: null,
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    prescriptionAlerts: true,
    inventoryAlerts: true,
    systemUpdates: true,
  });

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/auth/user-profile/');
      if (response.data) {
        setProfile(prev => ({
          ...prev,
          username: response.data.username || '',
          email: response.data.email || '',
          phone: response.data.phone || response.data.contact || '',
          avatar: response.data.avatar || null,
        }));
      }
    } catch (error) {
      showSnackbar('Error loading profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field) => (event) => {
    setProfile(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        
        const response = await api.post('/api/auth/update-avatar/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data?.avatar) {
          setProfile(prev => ({ ...prev, avatar: response.data.avatar }));
          showSnackbar('Profile picture updated successfully');
        }
      } catch (error) {
        showSnackbar('Error updating profile picture', 'error');
      }
    }
  };

  const handlePasswordChange = async () => {
    if (profile.newPassword !== profile.confirmPassword) {
      showSnackbar('New passwords do not match', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/auth/change-password/', {
        current_password: profile.currentPassword,
        new_password: profile.newPassword,
      });
      
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      
      showSnackbar('Password updated successfully');
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error updating password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (field) => (event) => {
    const value = field === 'darkMode' ? event.target.checked : event.target.value;
    updateTheme(field, value);
  };

  const handleNotificationChange = (field) => (event) => {
    setNotifications(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const saveNotificationSettings = async () => {
    try {
      setLoading(true);
      await api.post('/api/settings/notifications/', notifications);
      showSnackbar('Notification settings saved successfully');
    } catch (error) {
      showSnackbar('Error saving notification settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Settings
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AccountCircle sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Profile Settings</Typography>
            </Box>
            
            <Box sx={{ position: 'relative', mb: 4, display: 'flex', justifyContent: 'center' }}>
              <Avatar
                src={profile.avatar}
                sx={{ width: 100, height: 100 }}
              >
                {profile.username?.charAt(0)}
              </Avatar>
              <IconButton
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: -10,
                  right: 'calc(50% - 60px)',
                  backgroundColor: 'primary.main',
                  '&:hover': { backgroundColor: 'primary.dark' },
                }}
              >
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <PhotoCameraIcon sx={{ color: 'white' }} />
              </IconButton>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={profile.username}
                  onChange={handleProfileChange('username')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange('email')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profile.phone}
                  onChange={handleProfileChange('phone')}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Typography variant="subtitle1" gutterBottom>
              Change Password
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={profile.currentPassword}
                  onChange={handleProfileChange('currentPassword')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={profile.newPassword}
                  onChange={handleProfileChange('newPassword')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={profile.confirmPassword}
                  onChange={handleProfileChange('confirmPassword')}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handlePasswordChange}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Password'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Theme Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PaletteIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Theme Settings</Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.darkMode}
                      onChange={handleThemeChange('darkMode')}
                    />
                  }
                  label="Dark Mode"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Primary Color</InputLabel>
                  <Select
                    value={themeSettings.primaryColor}
                    label="Primary Color"
                    onChange={handleThemeChange('primaryColor')}
                  >
                    <MenuItem value="#3b82f6">Blue</MenuItem>
                    <MenuItem value="#10b981">Green</MenuItem>
                    <MenuItem value="#f59e0b">Orange</MenuItem>
                    <MenuItem value="#ef4444">Red</MenuItem>
                    <MenuItem value="#8b5cf6">Purple</MenuItem>
                    <MenuItem value="#ec4899">Pink</MenuItem>
                    <MenuItem value="#6366f1">Indigo</MenuItem>
                    <MenuItem value="#14b8a6">Teal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Text Size Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TextFieldsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Text Size</Typography>
            </Box>
            
            <Box sx={{ px: 3 }}>
              <Typography gutterBottom>Adjust the text size to your preference</Typography>
              <Slider
                value={themeSettings.textSize}
                onChange={handleThemeChange('textSize')}
                min={12}
                max={24}
                step={1}
                marks={[
                  { value: 12, label: 'Small' },
                  { value: 16, label: 'Medium' },
                  { value: 20, label: 'Large' },
                  { value: 24, label: 'Extra Large' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Notification Preferences</Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.emailNotifications}
                      onChange={handleNotificationChange('emailNotifications')}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.prescriptionAlerts}
                      onChange={handleNotificationChange('prescriptionAlerts')}
                    />
                  }
                  label="Prescription Alerts"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.inventoryAlerts}
                      onChange={handleNotificationChange('inventoryAlerts')}
                    />
                  }
                  label="Inventory Alerts"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.systemUpdates}
                      onChange={handleNotificationChange('systemUpdates')}
                    />
                  }
                  label="System Updates"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={saveNotificationSettings}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Notification Settings'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Settings; 