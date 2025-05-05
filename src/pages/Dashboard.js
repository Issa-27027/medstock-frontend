import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Avatar,
  Button,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  LocalHospital as HospitalIcon,
  Medication as MedicationIcon,
  People as PeopleIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Groups as GroupsIcon,
  AddShoppingCart as AddShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Sample data
const notifications = [
  {
    id: 1,
    type: 'warning',
    message: 'Low stock alert: Paracetamol is running low',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'success',
    message: 'New prescription received from Dr. Smith',
    time: '3 hours ago',
  },
  {
    id: 3,
    type: 'warning',
    message: 'Inventory update required for Medical Supplies',
    time: '5 hours ago',
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'prescription',
    description: 'New prescription for John Doe',
    time: '2 hours ago',
    icon: <MedicationIcon sx={{ color: '#3b82f6' }} />,
  },
  {
    id: 2,
    type: 'inventory',
    description: 'Added 50 units of Paracetamol',
    time: '3 hours ago',
    icon: <InventoryIcon sx={{ color: '#10b981' }} />,
  },
  {
    id: 3,
    type: 'patient',
    description: 'New patient registration: Jane Smith',
    time: '4 hours ago',
    icon: <PersonAddIcon sx={{ color: '#8b5cf6' }} />,
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const [currentTime] = useState(new Date().toLocaleTimeString());
  const [totalPatients, setTotalPatients] = useState(0);
  const [activePrescriptions, setActivePrescriptions] = useState(0);
  const [activeStaff, setActiveStaff] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);

  // Function to format time difference
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  };

  const fetchData = async () => {
    try {
      const [patientsRes, prescriptionsRes, staffRes, ordersRes, inventoryRes] = await Promise.all([
        api.get('/api/patients/patients/'),
        api.get('/api/prescriptions/prescriptions/'),
        api.get('/api/staff/staff/'),
        api.get('/api/orders/orders/'),
        api.get('/api/inventory/medicines/')
      ]);

      // Set total patients
      setTotalPatients(patientsRes.data.length);

      // Set active prescriptions
      const activePresCount = prescriptionsRes.data.filter(prescription => 
        prescription.status === 'ACTIVE' || prescription.status === 'active'
      ).length;
      setActivePrescriptions(activePresCount);

      // Set active staff
      const activeStaffCount = staffRes.data.filter(staff => 
        staff.status === 'ACTIVE' || staff.status === 'active'
      ).length;
      setActiveStaff(activeStaffCount);

      // Set pending orders
      const pendingOrdersCount = ordersRes.data.filter(order => 
        order.status === 'PENDING' || order.status === 'pending'
      ).length;
      setPendingOrders(pendingOrdersCount);

      // Calculate low stock items
      const inventoryData = inventoryRes.data;
      let lowStock = 0;
      inventoryData.forEach(item => {
        // Calculate total quantity from batches
        const totalQuantity = item.batches?.reduce((total, batch) => total + (parseInt(batch.quantity) || 0), 0) || 0;
        if (totalQuantity <= (item.min_quantity || 0)) {
          lowStock++;
        }
      });
      setLowStockCount(lowStock);

      // Process activities
      const activities = new Map(); // Use Map to store unique activities

      // Add patient activities
      patientsRes.data.forEach(patient => {
        const isNew = patient.created_at === patient.updated_at;
        const activityKey = `patient-${patient.id}-${isNew ? 'created' : 'updated'}-${patient.updated_at}`;
        
        if (!activities.has(activityKey)) {
          activities.set(activityKey, {
            id: activityKey,
            type: 'patient',
            description: `Patient ${patient.name} was ${isNew ? 'registered' : 'updated'}`,
            time: patient.updated_at || patient.created_at,
            icon: <PersonAddIcon sx={{ color: '#8b5cf6' }} />
          });
        }
      });

      // Add prescription activities
      prescriptionsRes.data.forEach(prescription => {
        const activityKey = `prescription-${prescription.id}-${prescription.status}-${prescription.updated_at}`;
        
        if (!activities.has(activityKey)) {
          activities.set(activityKey, {
            id: activityKey,
            type: 'prescription',
            description: `Prescription for ${prescription.patient_name || 'a patient'} was ${prescription.status.toLowerCase()}`,
            time: prescription.updated_at || prescription.created_at,
            icon: <MedicationIcon sx={{ color: '#3b82f6' }} />
          });
        }
      });

      // Add order activities
      ordersRes.data.forEach(order => {
        const activityKey = `order-${order.id}-${order.status}-${order.updated_at}`;
        
        if (!activities.has(activityKey)) {
          activities.set(activityKey, {
            id: activityKey,
            type: 'inventory',
            description: `Order #${order.id} was ${order.status.toLowerCase()}`,
            time: order.updated_at || order.created_at,
            icon: <InventoryIcon sx={{ color: '#10b981' }} />
          });
        }
      });

      // Convert Map to array, sort by time, and take the 5 most recent unique activities
      const uniqueActivities = Array.from(activities.values())
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5);

      setRecentActivities(uniqueActivities);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch all data on component mount and set up polling
  useEffect(() => {
    fetchData();

    // Set up polling for updates every 30 seconds
    const intervalId = setInterval(fetchData, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const metrics = [
    {
      title: 'Total Patients',
      value: totalPatients.toString(),
      icon: <PeopleIcon />,
      color: '#4caf50',
    },
    {
      title: 'Active Prescriptions',
      value: activePrescriptions.toString(),
      icon: <MedicationIcon />,
      color: '#ff9800',
    },
    {
      title: 'Active Staff',
      value: activeStaff.toString(),
      icon: <GroupsIcon />,
      color: '#8b5cf6',
    },
    {
      title: 'Low Stock Items',
      value: lowStockCount.toString(),
      icon: <WarningIcon />,
      color: '#f44336',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.toString(),
      icon: <LocalShippingIcon />,
      color: '#2196f3',
    },
  ];

  return (
    <Box sx={{ height: '100%', p: 0 }}>
      {/* Welcome Section */}
      <Box
        sx={{
          bgcolor: '#1e293b',
          color: 'white',
          borderRadius: 2,
          p: 4,
          mb: 3,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Welcome back,
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
              What's happening currently in the Hospital, 
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {' • '}
              {currentTime}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* Metrics Cards */}
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.title}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <Avatar
                sx={{
                  bgcolor: `${metric.color}15`,
                  color: metric.color,
                  width: 48,
                  height: 48,
                  mb: 2
                }}
              >
                {metric.icon}
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                {metric.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metric.title}
              </Typography>
            </Paper>
          </Grid>
        ))}

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<MedicationIcon />}
                  onClick={() => navigate('/prescriptions', { state: { openPrescribeDialog: true } })}
                  sx={{
                    py: 2,
                    bgcolor: '#ef4444',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                      bgcolor: '#dc2626',
                    },
                  }}
                >
                  New Prescription
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<InventoryIcon />}
                  onClick={() => navigate('/inventory')}
                  sx={{
                    py: 2,
                    bgcolor: '#3b82f6',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      bgcolor: '#2563eb',
                    },
                  }}
                >
                  Check Inventory
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<GroupsIcon />}
                  onClick={() => navigate('/staff-records')}
                  sx={{
                    py: 2,
                    bgcolor: '#8b5cf6',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                      bgcolor: '#7c3aed',
                    },
                  }}
                >
                  Manage Staff
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate('/analytics')}
                  sx={{
                    py: 2,
                    bgcolor: '#10b981',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      bgcolor: '#059669',
                    },
                  }}
                >
                  View Analytics
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={() => navigate('/orders', { state: { openNewOrderDialog: true } })}
                  sx={{
                    py: 2,
                    bgcolor: '#f59e0b',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                      bgcolor: '#d97706',
                    },
                  }}
                >
                  Place Order
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={12} lg={12} sx={{ width: '100%' }}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              width: '100%',
              maxWidth: '100%'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Recent Activity
            </Typography>
            <List sx={{ width: '100%' }}>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem sx={{ px: 0, width: '100%' }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {activity.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={getTimeAgo(activity.time)}
                      primaryTypographyProps={{
                        sx: { fontWeight: 500 },
                      }}
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && (
                    <Divider sx={{ my: 1 }} />
                  )}
                </React.Fragment>
              ))}
              {recentActivities.length === 0 && (
                <ListItem>
                  <ListItemText 
                    primary="No recent activities"
                    sx={{ textAlign: 'center', color: 'text.secondary' }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 