import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  CssBaseline,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Description as PrescriptionIcon,
  Analytics as AnalyticsIcon,
  People as StaffIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  LocalHospital as LocalHospitalIcon,
  ShoppingCart as OrdersIcon,
  PersonSearch as PatientRecordsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

function Layout({ children }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const sidebarTextColor = isDark ? theme.palette.common.white : theme.palette.getContrastText(theme.palette.primary.main);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, logout } = useAuth();

  // Get username from localStorage when component mounts
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const allMenuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/',
      roles: ['admin', 'doctor', 'pharmacist']
    },
    { 
      text: 'Inventory', 
      icon: <InventoryIcon />, 
      path: '/inventory',
      roles: ['admin', 'pharmacist']
    },
    { 
      text: 'Prescriptions', 
      icon: <PrescriptionIcon />, 
      path: '/prescriptions',
      roles: ['admin', 'doctor', 'pharmacist']
    },
    { 
      text: 'Patient Records', 
      icon: <PatientRecordsIcon />, 
      path: '/patient-records',
      roles: ['admin', 'doctor']
    },
    { 
      text: 'Staff Records', 
      icon: <StaffIcon />, 
      path: '/staff-records',
      roles: ['admin']
    },
    { 
      text: 'Orders', 
      icon: <OrdersIcon />, 
      path: '/orders',
      roles: ['admin', 'pharmacist']
    },
    { 
      text: 'Analytics', 
      icon: <AnalyticsIcon />, 
      path: '/analytics',
      roles: ['admin']
    },
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: '/settings',
      roles: ['admin']
    },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  // Update the avatar and text in the drawer footer
  const getInitials = (name) => {
    if (!name) return userRole?.charAt(0).toUpperCase() || 'U';
    
    // If it's a full name with space, get first letter of first and last name
    if (name.includes(' ')) {
      const parts = name.split(' ');
      return (parts[0].charAt(0) + parts[parts.length-1].charAt(0)).toUpperCase();
    }
    // Otherwise just return the first letter
    return name.charAt(0).toUpperCase();
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Drawer Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: sidebarTextColor,
        height: 'auto',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
        }
      }}>
        <Box sx={{ 
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1,
          }}>
            <LocalHospitalIcon sx={{ 
              fontSize: 30,
              color: sidebarTextColor,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            }} />
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  color: sidebarTextColor,
                  lineHeight: 1.2,
                  mb: 0.25,
                  fontSize: '1.4rem',
                }}
              >
                MedStock
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.85,
                  letterSpacing: '0.5px',
                  color: sidebarTextColor,
                  textShadow: '0 1px 2px rgba(0,0,0,0.15)',
                  fontWeight: 500,
                }}
              >
                Healthcare Management
              </Typography>
            </Box>
          </Box>
          <Box sx={{
            p: 1,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                color: sidebarTextColor,
                fontWeight: 500,
                textAlign: 'center',
              }}
            >
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <List sx={{ 
          px: 1,
          py: 1,
          '& .MuiListItem-root': {
            borderRadius: 1.5,
            mb: 0.5,
            color: sidebarTextColor,
            transition: 'all 0.2s ease',
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          },
        }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                position: 'relative',
                '&.Mui-selected': {
                  backgroundColor: 'transparent',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: '-8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '60%',
                    backgroundColor: sidebarTextColor,
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 10px rgba(255,255,255,0.5)',
                  },
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                },
                '&:hover': {
                  backgroundColor: 'transparent',
                  transform: 'translateX(4px)',
                  '& .MuiListItemIcon-root': {
                    transform: 'scale(1.1)',
                    filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))',
                  },
                  '& .MuiListItemText-root': {
                    textShadow: '0 0 10px rgba(255,255,255,0.5)',
                  },
                },
              }}
            >
              <ListItemIcon 
                sx={{
                  color: location.pathname === item.path ? sidebarTextColor : sidebarTextColor,
                  minWidth: '40px',
                  transition: 'all 0.2s ease',
                  filter: location.pathname === item.path ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none',
                  transform: location.pathname === item.path ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: location.pathname === item.path ? sidebarTextColor : sidebarTextColor,
                    transition: 'all 0.2s ease',
                    textShadow: location.pathname === item.path ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
                    letterSpacing: location.pathname === item.path ? '0.5px' : 'normal',
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ mt: 'auto' }}>
        <Divider sx={{ 
          borderColor: 'rgba(255, 255, 255, 0.12)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }} />
        <List sx={{ 
          backgroundColor: theme.palette.primary.dark,
          borderRadius: '0 0 4px 4px',
          boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }
        }}>
          <ListItem 
            button 
            onClick={handleMenuOpen}
            sx={{
              color: sidebarTextColor,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)',
              },
              py: 1.5,
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                color: theme.palette.primary.dark,
                fontWeight: 'bold',
                boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
                },
              }}>
                {getInitials(username)}
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary={username || userRole}
              secondary={userRole} 
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: 500,
                  color: sidebarTextColor,
                  textShadow: '0 1px 2px rgba(0,0,0,0.15)',
                },
                '& .MuiTypography-body2': {
                  fontSize: '0.75rem',
                  color: sidebarTextColor,
                  textTransform: 'capitalize',
                }
              }}
            />
          </ListItem>
        </List>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              borderRadius: 1,
            },
          }}
        >
          <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
            <SettingsIcon sx={{ mr: 1 }} />
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: sidebarTextColor,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: `linear-gradient(165deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: sidebarTextColor,
              borderRight: 'none',
              boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.palette.background.default,
            zIndex: -1
          }
        }}
      >
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          position: 'relative',
          zIndex: 1
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default Layout; 