import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Add as AddIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return '#4caf50';
    case 'active':
      return '#ff9800';
    case 'cancelled':
      return '#f44336';
    case 'expired':
      return '#9e9e9e';
    default:
      return '#9e9e9e';
  }
};

const StatusChip = ({ status }) => (
  <Box
    sx={{
      backgroundColor: getStatusColor(status),
      color: 'white',
      px: 2,
      py: 0.5,
      borderRadius: '16px',
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '0.875rem',
      fontWeight: 500,
    }}
  >
    {status}
  </Box>
);

function PrescriptionRow({ prescription, onEdit, onDelete, onStatusChange }) {
  const [open, setOpen] = useState(false);
  
  // Ensure we have properly formatted items
  const safeItems = prescription.items || [];
  
  return (
    <>
      <TableRow
        sx={{
          '&:last-child td, &:last-child th': { border: 0 },
          backgroundColor: getStatusColor(prescription.status),
          cursor: 'pointer',
          '&:hover': { backgroundColor: (theme) => theme.palette.action.hover }
        }}
        onClick={() => setOpen(!open)}
      >
        <TableCell align="center">{prescription.prescriptionDate}</TableCell>
        <TableCell align="center">{prescription.id}</TableCell>
        <TableCell align="center">{prescription.patientName}</TableCell>
        <TableCell align="center">{prescription.prescriberName}</TableCell>
        <TableCell align="center">
          <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
            <Select
              value={prescription.status}
              onChange={(e) => {
                e.stopPropagation();
                onStatusChange(prescription.id, e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              sx={{ 
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 0.5
                }
              }}
              renderValue={(value) => <StatusChip status={value} />}
              disableUnderline
            >
              <MenuItem value="completed">
                <StatusChip status="completed" />
              </MenuItem>
              <MenuItem value="active">
                <StatusChip status="active" />
              </MenuItem>
              <MenuItem value="cancelled">
                <StatusChip status="cancelled" />
              </MenuItem>
              <MenuItem value="expired">
                <StatusChip status="expired" />
              </MenuItem>
            </Select>
          </FormControl>
        </TableCell>
        <TableCell align="center">
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            onEdit(prescription);
          }}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            onDelete(prescription.id);
          }}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Patient Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Patient Name"
                        secondary={prescription.patientName}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Date of Birth"
                        secondary={prescription.dateOfBirth}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Contact"
                        secondary={prescription.contactDetails}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Prescriber Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Prescriber Name"
                        secondary={prescription.prescriberName || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Staff ID"
                        secondary={prescription.prescriberLicense || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Contact"
                        secondary={prescription.prescriberContact || 'N/A'}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Prescription Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Description"
                        secondary={prescription.description || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Special Instructions"
                        secondary={prescription.specialInstructions || 'N/A'}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Prescribed Medications
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                        <TableCell align="center" sx={{ fontWeight: 500 }}>Medication</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500 }}>Dosage Form</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500 }}>Quantity</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500 }}>Frequency</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500 }}>Duration</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500 }}>Route</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500 }}>Instructions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {safeItems.length > 0 ? (
                        safeItems.map((item) => (
                          <TableRow key={item.id || Math.random()} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{item.drugName || 'N/A'}</TableCell>
                            <TableCell align="center">{item.dosageForm || 'N/A'}</TableCell>
                            <TableCell align="center">{item.quantity || 'N/A'}</TableCell>
                            <TableCell align="center">{item.frequency || 'N/A'}</TableCell>
                            <TableCell align="center">{item.duration || 'N/A'}</TableCell>
                            <TableCell align="center">{item.route || 'N/A'}</TableCell>
                            <TableCell align="center">{item.specialNotes || 'N/A'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center">No medication items found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function Prescriptions() {
  const location = useLocation();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(location.state?.openPrescribeDialog || false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });
  const prescriptionsRef = useRef([]);
  const [formData, setFormData] = useState({
    status: 'active',
    description: '',
    specialInstructions: '',
    patientName: '',
    dateOfBirth: '',
    patientId: '',
    contactDetails: '',
    prescriberName: '',
    prescriberLicense: '',
    prescriberContact: '',
    items: []
  });

  // Save prescriptions to localStorage for persistence between page navigations
  useEffect(() => {
    if (prescriptions.length > 0) {
      prescriptionsRef.current = prescriptions;
      localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
      console.log(`Saved ${prescriptions.length} prescriptions to localStorage`);
    }
  }, [prescriptions]);

  // Update the user profile loading useEffect
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Check if we already have valid user info in localStorage
        const cachedUsername = localStorage.getItem('username');
        const cachedStaffId = localStorage.getItem('staffId');
        const cachedContact = localStorage.getItem('contact');

        if (cachedUsername && cachedStaffId && cachedContact) {
          console.log('Using cached user info:', { username: cachedUsername, staffId: cachedStaffId, contact: cachedContact });
          return;
        }

        // Check if we have a valid token
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          navigate('/login');
          return;
        }

        // Set the token in the API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Try to get user data from the API
        const response = await api.get('/api/auth/user-profile/');
        if (response.data) {
          const userData = {
            username: response.data.username || response.data.name || '',
            staffId: response.data.license_number || response.data.staff_id || '',
            contact: response.data.contact || response.data.phone || ''
          };

          // Only update localStorage if we got valid data
          if (userData.username && userData.staffId && userData.contact) {
            localStorage.setItem('username', userData.username);
            localStorage.setItem('staffId', userData.staffId);
            localStorage.setItem('contact', userData.contact);
            console.log('User profile loaded and cached:', userData);
          } else {
            throw new Error('Incomplete user data received from API');
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    loadUserProfile();
  }, [navigate]);

  // Update useEffect to include location as a dependency and check localStorage first
  useEffect(() => {
    console.log('Fetching prescriptions and related data');
    setIsLoading(true);
    
    // Try to load from localStorage first for faster response
    const savedPrescriptions = localStorage.getItem('prescriptions');
    if (savedPrescriptions) {
      try {
        const parsed = JSON.parse(savedPrescriptions);
        setPrescriptions(parsed);
        console.log(`Loaded ${parsed.length} prescriptions from localStorage`);
      } catch (e) {
        console.error('Error parsing localStorage prescriptions:', e);
      }
    }
    
    // Attempt to load user credentials from API if they're not in localStorage
    const username = localStorage.getItem('username');
    const staffId = localStorage.getItem('staffId');
    const contact = localStorage.getItem('contact');
    
    if (!username || !staffId || !contact) {
      // If user credentials are missing, try to get them from the API
      api.get('/api/auth/user-profile/')
        .then(response => {
          if (response.data) {
            console.log('User profile loaded:', response.data);
            localStorage.setItem('username', response.data.username || '');
            localStorage.setItem('staffId', response.data.license_number || response.data.staff_id || '');
            localStorage.setItem('contact', response.data.contact || response.data.phone || '');
          }
        })
        .catch(error => {
          console.error('Error loading user profile:', error);
        });
    }
    
    // Then fetch from API to ensure we have the latest data
    fetchPrescriptions();
    fetchPatients();
    fetchMedicines();
    
    // Add cleanup function to handle component unmounting properly
    return () => {
      console.log('Cleaning up prescriptions component');
      // Save current state when navigating away
      if (prescriptionsRef.current.length > 0) {
        localStorage.setItem('prescriptions', JSON.stringify(prescriptionsRef.current));
      }
    };
  }, [location.pathname]); // More specific dependency to avoid unnecessary reloads

  const fetchPrescriptions = async () => {
    try {
      console.log('Fetching prescriptions from API');
      setError(null);
      const response = await api.get('/api/prescriptions/prescriptions/');
      console.log('Received prescription data:', response.data);
      if (Array.isArray(response.data)) {
        // Process prescription data
        const formattedPrescriptions = response.data.map(prescription => {
          // Get current user information for all new prescriptions
          const userInfo = getCurrentUserInfo();
          
          // For display purposes, use the actual prescribed_by data if available,
          // otherwise default to current user info
          const prescriberName = 
            prescription.prescribed_by?.username || 
            prescription.prescribed_by?.name || 
            userInfo.username;
            
          const prescriberLicense = 
            prescription.prescribed_by?.license_number || 
            prescription.staff_id || 
            userInfo.staffId;
            
          const prescriberContact = 
            prescription.prescribed_by?.contact || 
            prescription.contact || 
            userInfo.contact;
            
          // Process the prescription items with careful null checking
          const processedItems = (prescription.items || []).map(item => {
            console.log('Processing prescription item:', item);
            return {
              id: item.id,
              medicineId: item.medicine?.id?.toString() || '',
              drugName: item.medicine?.name || item.drug_name || 'Unknown Medicine',
              dosageForm: item.medicine?.form || item.dosage || '',
              quantity: item.quantity?.toString() || '0',
              frequency: item.frequency || '',
              duration: item.duration || '',
              route: item.route || 'oral',
              specialNotes: item.special_instructions || ''
            };
          });
          
          console.log('Processed items:', processedItems);
          
          return {
            id: prescription.id,
            prescriptionDate: new Date(prescription.date_prescribed).toLocaleDateString(),
            patientName: prescription.patient?.name || 'Unknown Patient',
            patientId: prescription.patient?.id,
            prescriberName: prescriberName,
            prescriberLicense: prescriberLicense,
            prescriberContact: prescriberContact,
            status: prescription.status,
            dateOfBirth: prescription.patient?.date_of_birth,
            contactDetails: prescription.patient?.contact || prescription.patient?.phone,
            specialInstructions: prescription.special_instructions || '',
            description: prescription.notes || '',
            items: processedItems
          };
        });
        
        console.log('Formatted prescriptions:', formattedPrescriptions);
        setPrescriptions(formattedPrescriptions);
        prescriptionsRef.current = formattedPrescriptions;
      } else {
        console.error('Invalid prescriptions data format:', response.data);
        setPrescriptions([]);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setError('Failed to load prescriptions. Please try again.');
      // Don't clear existing prescriptions on error to maintain state
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/patients/patients/');
      if (Array.isArray(response.data)) {
        setPatients(response.data);
      } else {
        console.error('Invalid patients data format:', response.data);
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/api/inventory/medicines/');
      if (Array.isArray(response.data)) {
        setMedicines(response.data);
      } else {
        console.error('Invalid medicines data format:', response.data);
        setMedicines([]);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setMedicines([]);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // First update the prescription status
      const updateData = {
        status: newStatus.toLowerCase() // Ensure status is lowercase to match backend enum
      };
      
      console.log(`Updating prescription ${id} with status: ${newStatus.toLowerCase()}`);
      
      // Send the PATCH request with the correct data format
      await api.patch(`/api/prescriptions/prescriptions/${id}/`, updateData);
      
      // If prescription is completed, update inventory
      if (newStatus.toLowerCase() === 'completed') {
        const prescription = prescriptions.find(p => p.id === id);
        if (prescription) {
          // Prepare data for inventory adjustment
          const inventoryData = {
            source_type: 'prescription',
            source_id: id,
            items: prescription.items.map(item => ({
              medicine_id: item.medicineId,
              quantity: parseInt(item.quantity, 10)
            }))
          };
          
          try {
            console.log('Updating inventory with data:', inventoryData);
            // Call inventory adjustment endpoint
            await api.post('/api/inventory/adjust-inventory/', inventoryData);
            console.log('Inventory updated successfully from prescription');
          } catch (error) {
            console.error('Error updating inventory:', error);
            // If insufficient stock, revert status change
            if (error.response?.data?.error?.includes('Insufficient stock')) {
              await api.patch(`/api/prescriptions/prescriptions/${id}/`, { status: 'active' });
              alert(`Cannot complete prescription: ${error.response.data.error}`);
              return;
            }
          }
        }
      }
      
      // Update UI
      setPrescriptions(prev =>
        prev.map(prescription =>
          prescription.id === id
            ? { ...prescription, status: newStatus.toLowerCase() }
            : prescription
        )
      );
    } catch (error) {
      console.error('Error updating prescription status:', error);
      alert(`Error updating prescription status: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleEdit = (prescription) => {
    setSelectedPrescription(prescription);
    
    // Get current user information
    const userInfo = getCurrentUserInfo();
    console.log('Current user info for editing prescription:', userInfo);
    
    setFormData({
      status: prescription.status,
      description: prescription.description,
      specialInstructions: prescription.specialInstructions,
      patientName: prescription.patientName,
      dateOfBirth: prescription.dateOfBirth,
      patientId: prescription.patientId,
      contactDetails: prescription.contactDetails,
      // Always use current user info for prescriber
      prescriberName: userInfo.username,
      prescriberLicense: userInfo.staffId,
      prescriberContact: userInfo.contact,
      items: [...prescription.items]
    });
    setOpenDialog(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleEditSubmit = async () => {
    try {
      await api.put(`/api/prescriptions/prescriptions/${selectedPrescription.id}/`, formData);
      setPrescriptions(prev =>
        prev.map(prescription =>
          prescription.id === selectedPrescription.id ? { ...formData, id: selectedPrescription.id } : prescription
        )
      );
      setOpenDialog(false);
      setSelectedPrescription(null);
    } catch (error) {
      console.error('Error updating prescription:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/prescriptions/prescriptions/${id}/`);
      setPrescriptions(prev => prev.filter(prescription => prescription.id !== id));
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  };

  const handleOpenPrescribeDialog = () => {
    setSelectedPrescription(null);
    
    // Get current user information
    const userInfo = getCurrentUserInfo();
    console.log('Current user info for new prescription:', userInfo);
    
    setFormData({
      status: 'active',
      description: '',
      specialInstructions: '',
      patientName: '',
      dateOfBirth: '',
      patientId: '',
      contactDetails: '',
      prescriberName: userInfo.username,
      prescriberLicense: userInfo.staffId,
      prescriberContact: userInfo.contact,
      items: []
    });
    setOpenDialog(true);
  };

  const handleClosePrescribeDialog = () => {
    setOpenDialog(false);
    setSelectedPrescription(null);
  };

  const handlePrescribeSubmit = async () => {
    try {
      // Get current user info again to ensure it's the latest
      const userInfo = getCurrentUserInfo();
      
      // Format the prescription data for the backend - make sure to use field names expected by the API
      const prescriptionData = {
        patient_id: formData.patientId,
        status: formData.status.toLowerCase(),
        notes: formData.description,
        special_instructions: formData.specialInstructions,
        // Include prescriber info in ALL possible fields to ensure it's saved
        prescribed_by_username: userInfo.username,
        prescribed_by_name: userInfo.username,
        staff_id: userInfo.staffId,
        license_number: userInfo.staffId,
        prescriber_contact: userInfo.contact,
        contact: userInfo.contact,
        items: formData.items.map(item => ({
          medicine_id: item.medicineId,
          quantity: parseInt(item.quantity, 10) || 1,
          frequency: item.frequency,
          duration: item.duration,
          route: item.route || 'oral',
          special_instructions: item.specialNotes
        }))
      };
      
      console.log('Sending prescription data:', prescriptionData);
      
      // Use the custom endpoint for creating prescriptions
      const response = await api.post('/api/prescriptions/create/', prescriptionData);
      console.log('Prescription created successfully:', response.data);
      
      // Add the new prescription to the state
      const newPrescription = {
        id: response.data.id,
        prescriptionDate: new Date().toLocaleDateString(),
        patientName: formData.patientName,
        patientId: formData.patientId,
        prescriberName: formData.prescriberName || localStorage.getItem('username') || 'Current User',
        prescriberLicense: formData.prescriberLicense,
        prescriberContact: formData.prescriberContact,
        status: formData.status,
        dateOfBirth: formData.dateOfBirth,
        contactDetails: formData.contactDetails,
        specialInstructions: formData.specialInstructions,
        description: formData.description,
        items: formData.items
      };
      
      setPrescriptions([newPrescription, ...prescriptions]);
      setOpenDialog(false);
      alert('Prescription created successfully!');
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert(error.response?.data?.error || 'Error creating prescription. Please try again.');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPrescriptions = [...prescriptions].sort((a, b) => {
    if (!sortConfig.key) return 0;

    if (sortConfig.key === 'prescriptionDate' || sortConfig.key === 'expiryDate') {
      return sortConfig.direction === 'asc'
        ? new Date(a[sortConfig.key]) - new Date(b[sortConfig.key])
        : new Date(b[sortConfig.key]) - new Date(a[sortConfig.key]);
    }

    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredPrescriptions = sortedPrescriptions.filter(prescription =>
    Object.values(prescription).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const SortableTableCell = ({ label, sortKey }) => (
    <TableCell
      onClick={() => handleSort(sortKey)}
      sx={{ 
        cursor: 'pointer',
        textAlign: 'center',
        '& .MuiBox-root': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }
      }}
    >
      <Box>
        {label}
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
        )}
      </Box>
    </TableCell>
  );

  useEffect(() => {
    // Check if we should open the dialog on mount
    if (location.state?.openNewPrescriptionDialog) {
      setOpenDialog(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, []);

  // Update the getCurrentUserInfo function to be more robust
  const getCurrentUserInfo = () => {
    const username = localStorage.getItem('username');
    const staffId = localStorage.getItem('staffId');
    const contact = localStorage.getItem('contact');
    
    // If we're missing ANY of the required fields, try to reload the profile
    if (!username || !staffId || !contact) {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return {
          username: 'Unknown User',
          staffId: '0000',
          contact: 'N/A'
        };
      }
      
      // Return default values but don't show warning
      return {
        username: username || 'Current User',
        staffId: staffId || '0000',
        contact: contact || 'N/A'
      };
    }
    
    return {
      username,
      staffId,
      contact
    };
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }}>
      {/* Header Section */}
      <Box sx={{ 
        backgroundColor: 'white',
        p: 3,
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 600,
          color: '#1e293b',
          mb: 1
        }}>
          Pharmacy Prescriptions Management
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#64748b',
          fontSize: '1.1rem'
        }}>
          Track and manage patient prescriptions
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Box 
          sx={{ 
            backgroundColor: '#fee2e2', 
            color: '#b91c1c',
            p: 2, 
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Typography>{error}</Typography>
          <Button 
            sx={{ ml: 2 }} 
            variant="outlined" 
            color="error" 
            size="small"
            onClick={() => fetchPrescriptions()}
          >
            Retry
          </Button>
        </Box>
      )}

      {/* Search and Add Button Section */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <TextField
          fullWidth
          placeholder="Search prescriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ 
                color: '#94a3b8',
                mr: 1
              }} />
            ),
          }}
          sx={{
            maxWidth: '600px',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: '#f8fafc'
              },
              '&.Mui-focused': {
                backgroundColor: 'white',
                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
              }
            }
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenPrescribeDialog}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          New Prescription
        </Button>
      </Box>

      {/* Loading Indicator */}
      {isLoading && prescriptions.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            p: 5
          }}
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading prescriptions...
          </Typography>
        </Box>
      ) : (
        /* Prescriptions Table */
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'rgba(0,0,0,0.08)'
          }}
        >
          {prescriptions.length === 0 && !isLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No prescriptions found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first prescription by clicking the "New Prescription" button.
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={handleOpenPrescribeDialog}
              >
                Add Prescription
              </Button>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <SortableTableCell label="Date" sortKey="prescriptionDate" />
                  <SortableTableCell label="Prescription ID" sortKey="id" />
                  <SortableTableCell label="Patient" sortKey="patientName" />
                  <SortableTableCell label="Prescriber" sortKey="prescriberName" />
                  <SortableTableCell label="Status" sortKey="status" />
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPrescriptions.map((prescription) => (
                  <React.Fragment key={prescription.id}>
                    <TableRow 
                      onClick={() => setExpandedRow(expandedRow === prescription.id ? null : prescription.id)}
                      sx={{ 
                        '& > *': { borderBottom: expandedRow === prescription.id ? 'none' : '1px solid rgba(0,0,0,0.08)' },
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#f8fafc',
                        },
                        '& td': {
                          color: '#1e293b',
                          py: 2.5,
                          transition: 'background-color 0.2s ease',
                          textAlign: 'center'
                        }
                      }}
                    >
                      <TableCell align="center">{prescription.prescriptionDate}</TableCell>
                      <TableCell align="center">{prescription.id}</TableCell>
                      <TableCell align="center">{prescription.patientName}</TableCell>
                      <TableCell align="center">{prescription.prescriberName}</TableCell>
                      <TableCell align="center">
                        <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                          <Select
                            value={prescription.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(prescription.id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            sx={{ 
                              '& .MuiSelect-select': {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                py: 0.5
                              }
                            }}
                            renderValue={(value) => <StatusChip status={value} />}
                            disableUnderline
                          >
                            <MenuItem value="completed">
                              <StatusChip status="completed" />
                            </MenuItem>
                            <MenuItem value="active">
                              <StatusChip status="active" />
                            </MenuItem>
                            <MenuItem value="cancelled">
                              <StatusChip status="cancelled" />
                            </MenuItem>
                            <MenuItem value="expired">
                              <StatusChip status="expired" />
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(prescription);
                            }}
                            sx={{ 
                              p: 0.5,
                              color: '#64748b',
                              '&:hover': { 
                                backgroundColor: '#e2e8f0',
                                color: '#3b82f6'
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(prescription.id);
                            }}
                            sx={{ 
                              p: 0.5,
                              color: '#64748b',
                              '&:hover': { 
                                backgroundColor: '#fee2e2',
                                color: '#ef4444'
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                    {expandedRow === prescription.id && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ py: 0, backgroundColor: '#f8fafc' }}>
                          <Box sx={{ p: 2 }}>
                            <Grid container spacing={3}>
                              <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Patient Information
                                </Typography>
                                <List dense>
                                  <ListItem>
                                    <ListItemText 
                                      primary="Patient Name"
                                      secondary={prescription.patientName}
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText 
                                      primary="Date of Birth"
                                      secondary={prescription.dateOfBirth}
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText 
                                      primary="Contact"
                                      secondary={prescription.contactDetails}
                                    />
                                  </ListItem>
                                </List>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Prescriber Information
                                </Typography>
                                <List dense>
                                  <ListItem>
                                    <ListItemText 
                                      primary="Prescriber Name"
                                      secondary={prescription.prescriberName || 'N/A'}
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText 
                                      primary="Staff ID"
                                      secondary={prescription.prescriberLicense || 'N/A'}
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText 
                                      primary="Contact"
                                      secondary={prescription.prescriberContact || 'N/A'}
                                    />
                                  </ListItem>
                                </List>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Prescription Details
                                </Typography>
                                <List dense>
                                  <ListItem>
                                    <ListItemText 
                                      primary="Description"
                                      secondary={prescription.description || 'N/A'}
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText 
                                      primary="Special Instructions"
                                      secondary={prescription.specialInstructions || 'N/A'}
                                    />
                                  </ListItem>
                                </List>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Prescribed Medications
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                      <TableCell align="center" sx={{ fontWeight: 500 }}>Medication</TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 500 }}>Dosage Form</TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 500 }}>Quantity</TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 500 }}>Frequency</TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 500 }}>Duration</TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 500 }}>Route</TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 500 }}>Instructions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {prescription.items && prescription.items.length > 0 ? (
                                      prescription.items.map((item, index) => (
                                        <TableRow key={item.id || Math.random()} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                          <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{item.drugName || 'N/A'}</TableCell>
                                          <TableCell align="center">
                                            <Autocomplete
                                              fullWidth
                                              options={medicines}
                                              getOptionLabel={(option) => option.name || ''}
                                              value={medicines.find(m => m.id.toString() === item.medicineId) || null}
                                              onChange={(event, newValue) => {
                                                if (newValue) {
                                                  handleMedicationChange(index, 'medicineId', newValue.id.toString());
                                                  handleMedicationChange(index, 'drugName', newValue.name);
                                                  handleMedicationChange(index, 'dosageForm', newValue.form || '');
                                                } else {
                                                  handleMedicationChange(index, 'medicineId', '');
                                                  handleMedicationChange(index, 'drugName', '');
                                                  handleMedicationChange(index, 'dosageForm', '');
                                                }
                                              }}
                                              renderInput={(params) => (
                                                <TextField
                                                  {...params}
                                                  label="Search Medicine"
                                                  required
                                                  error={!item.medicineId}
                                                  helperText={!item.medicineId ? 'Please select a medicine' : ''}
                                                />
                                              )}
                                              renderOption={(props, option) => (
                                                <li {...props}>
                                                  <Box>
                                                    <Typography variant="body1">{option.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                      Form: {option.form || 'N/A'} • Stock: {option.quantity || 0}
                                                    </Typography>
                                                  </Box>
                                                </li>
                                              )}
                                            />
                                          </TableCell>
                                          <TableCell align="center">{item.quantity || 'N/A'}</TableCell>
                                          <TableCell align="center">{item.frequency || 'N/A'}</TableCell>
                                          <TableCell align="center">{item.duration || 'N/A'}</TableCell>
                                          <TableCell align="center">{item.route || 'N/A'}</TableCell>
                                          <TableCell align="center">{item.specialNotes || 'N/A'}</TableCell>
                                        </TableRow>
                                      ))
                                    ) : (
                                      <TableRow>
                                        <TableCell colSpan={7} align="center">No medication items found</TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </Grid>
                            </Grid>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleClosePrescribeDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center">
            <EditIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              {selectedPrescription ? 'Edit Prescription' : 'New Prescription'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Patient Information Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Patient Information</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Autocomplete
                    fullWidth
                    options={patients}
                    getOptionLabel={(option) => option.name || ''}
                    value={patients.find(p => p.id.toString() === formData.patientId) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        const contactInfo = newValue.phone || newValue.contact_number || '';
                        setFormData(prev => ({
                          ...prev,
                          patientId: newValue.id.toString(),
                          patientName: newValue.name || '',
                          dateOfBirth: newValue.date_of_birth || '',
                          contactDetails: contactInfo
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          patientId: '',
                          patientName: '',
                          dateOfBirth: '',
                          contactDetails: ''
                        }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search Patient"
                        required
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '&:hover': {
                              backgroundColor: '#f8fafc'
                            },
                            '&.Mui-focused': {
                              backgroundColor: 'white'
                            }
                          }
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box>
                          <Typography variant="body1">{option.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            DOB: {option.date_of_birth || 'N/A'} • ID: {option.id}
                          </Typography>
                        </Box>
                      </li>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date of Birth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleEditInputChange}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Patient Name"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleEditInputChange}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contact Details"
                    name="contactDetails"
                    value={formData.contactDetails}
                    onChange={handleEditInputChange}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Prescriber Information Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Prescriber Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prescriber Name"
                    name="prescriberName"
                    value={formData.prescriberName || getCurrentUserInfo().username}
                    InputProps={{
                      readOnly: true,
                    }}
                    disabled
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Staff ID"
                    name="prescriberLicense"
                    value={formData.prescriberLicense || getCurrentUserInfo().staffId}
                    InputProps={{
                      readOnly: true,
                    }}
                    disabled
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contact"
                    name="prescriberContact"
                    value={formData.prescriberContact || getCurrentUserInfo().contact}
                    InputProps={{
                      readOnly: true,
                    }}
                    disabled
                    variant="filled"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Prescription Details Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Prescription Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleEditInputChange}
                    required
                  >
                    <MenuItem value="active">
                      <StatusChip status="active" />
                    </MenuItem>
                    <MenuItem value="completed">
                      <StatusChip status="completed" />
                    </MenuItem>
                    <MenuItem value="cancelled">
                      <StatusChip status="cancelled" />
                    </MenuItem>
                    <MenuItem value="expired">
                      <StatusChip status="expired" />
                    </MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleEditInputChange}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Special Instructions"
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleEditInputChange}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Medications Section */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Medications</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      items: [...formData.items, {
                        id: Date.now(),
                        medicineId: '',
                        drugName: '',
                        dosageForm: '',
                        quantity: '',
                        frequency: '',
                        duration: '',
                        route: 'oral',
                        specialNotes: ''
                      }]
                    });
                  }}
                >
                  Add Medication
                </Button>
              </Box>
              
              {formData.items.map((item, index) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    position: 'relative'
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        items: formData.items.filter((_, i) => i !== index)
                      });
                    }}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      color: 'error.main'
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        fullWidth
                        options={medicines}
                        getOptionLabel={(option) => option.name || ''}
                        value={medicines.find(m => m.id.toString() === item.medicineId) || null}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            handleMedicationChange(index, 'medicineId', newValue.id.toString());
                            handleMedicationChange(index, 'drugName', newValue.name);
                            handleMedicationChange(index, 'dosageForm', newValue.form || '');
                          } else {
                            handleMedicationChange(index, 'medicineId', '');
                            handleMedicationChange(index, 'drugName', '');
                            handleMedicationChange(index, 'dosageForm', '');
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Search Medicine"
                            required
                            error={!item.medicineId}
                            helperText={!item.medicineId ? 'Please select a medicine' : ''}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box>
                              <Typography variant="body1">{option.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Form: {option.form || 'N/A'} • Stock: {option.quantity || 0}
                              </Typography>
                            </Box>
                          </li>
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Dosage Form"
                        value={item.dosageForm}
                        onChange={(e) => handleMedicationChange(index, 'dosageForm', e.target.value)}
                        select
                        required
                      >
                        <MenuItem value="tablet">Tablet</MenuItem>
                        <MenuItem value="capsule">Capsule</MenuItem>
                        <MenuItem value="syrup">Syrup</MenuItem>
                        <MenuItem value="injection">Injection</MenuItem>
                        <MenuItem value="cream">Cream</MenuItem>
                        <MenuItem value="ointment">Ointment</MenuItem>
                        <MenuItem value="drops">Drops</MenuItem>
                        <MenuItem value="inhaler">Inhaler</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        value={item.quantity}
                        onChange={(e) => handleMedicationChange(index, 'quantity', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Frequency"
                        value={item.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Duration"
                        value={item.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Route"
                        value={item.route}
                        onChange={(e) => handleMedicationChange(index, 'route', e.target.value)}
                        required
                      >
                        <MenuItem value="oral">Oral</MenuItem>
                        <MenuItem value="intravenous">Intravenous</MenuItem>
                        <MenuItem value="intramuscular">Intramuscular</MenuItem>
                        <MenuItem value="subcutaneous">Subcutaneous</MenuItem>
                        <MenuItem value="topical">Topical</MenuItem>
                        <MenuItem value="inhalation">Inhalation</MenuItem>
                        <MenuItem value="rectal">Rectal</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Special Notes"
                        value={item.specialNotes}
                        onChange={(e) => handleMedicationChange(index, 'specialNotes', e.target.value)}
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClosePrescribeDialog} startIcon={<DeleteIcon />}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handlePrescribeSubmit}
            disabled={!formData.patientName || !formData.prescriberName}
          >
            {selectedPrescription ? 'Update Prescription' : 'Create Prescription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Prescriptions; 