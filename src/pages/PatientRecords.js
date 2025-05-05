import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocalHospital,
  Medication as MedicationIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import api from '../services/api';

const getStatusColor = (status) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'being treated':
    case 'being_treated':
      return '#4caf50';
    case 'discharged':
      return '#ff9800';
    case 'waiting':
      return '#2196f3';
    default:
      return '#9e9e9e';
  }
};

const StatusChip = ({ status }) => {
  // Convert internal status code to display text
  let displayText = status;
  if (status === 'BEING_TREATED') displayText = 'Being Treated';
  else if (status === 'DISCHARGED') displayText = 'Discharged';
  else if (status === 'WAITING') displayText = 'Waiting';
  
  return (
    <Box
      sx={{
        backgroundColor: getStatusColor(displayText),
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
      {displayText}
    </Box>
  );
};

function TabPanel({ children, value, index }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      sx={{ py: 2 }}
    >
      {value === index && children}
    </Box>
  );
}

function PatientRow({ patient, onEdit, onDelete, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Ensure allergies and chronicConditions are always arrays
  const allergiesArray = Array.isArray(patient.allergies) ? patient.allergies : [];
  const conditionsArray = Array.isArray(patient.chronicConditions) ? patient.chronicConditions : [];

  // Ensure family history arrays are properly initialized with better error handling
  const fatherHistoryArray = Array.isArray(patient.familyHistory?.father) 
    ? patient.familyHistory.father 
    : (typeof patient.familyHistory?.father === 'string' 
      ? patient.familyHistory.father.split(',').map(item => item.trim()).filter(Boolean)
      : []);

  const motherHistoryArray = Array.isArray(patient.familyHistory?.mother) 
    ? patient.familyHistory.mother 
    : (typeof patient.familyHistory?.mother === 'string' 
      ? patient.familyHistory.mother.split(',').map(item => item.trim()).filter(Boolean)
      : []);

  const siblingsHistoryArray = Array.isArray(patient.familyHistory?.siblings) 
    ? patient.familyHistory.siblings 
    : (typeof patient.familyHistory?.siblings === 'string' 
      ? patient.familyHistory.siblings.split(',').map(item => item.trim()).filter(Boolean)
      : []);

  return (
    <>
      <TableRow 
        onClick={() => setOpen(!open)}
        sx={{ 
          '& > *': { borderBottom: 'unset' },
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)'
          }
        }}
      >
        <TableCell align="center">{patient.id}</TableCell>
        <TableCell align="center">{patient.name}</TableCell>
        <TableCell align="center">{patient.dateOfBirth}</TableCell>
        <TableCell align="center">
          <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
            <Select
              value={patient.status}
              onChange={(e) => {
                e.stopPropagation();
                onStatusChange(patient.id, e.target.value);
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
              <MenuItem value="BEING_TREATED">
                <StatusChip status="Being Treated" />
              </MenuItem>
              <MenuItem value="DISCHARGED">
                <StatusChip status="Discharged" />
              </MenuItem>
              <MenuItem value="WAITING">
                <StatusChip status="Waiting" />
              </MenuItem>
            </Select>
          </FormControl>
        </TableCell>
        <TableCell align="center">
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            onEdit(patient);
          }}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            onDelete(patient.id);
          }}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                borderBottom: 1, 
                borderColor: 'divider',
                mb: 2
              }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTabs-flexContainer': {
                      justifyContent: 'center',
                    }
                  }}
                >
                  <Tab 
                    icon={<PersonIcon />} 
                    label="Personal Info" 
                    sx={{ minWidth: '160px' }}
                  />
                  <Tab 
                    icon={<MedicationIcon />} 
                    label="Medical History" 
                    sx={{ minWidth: '160px' }}
                  />
                  <Tab 
                    icon={<WarningIcon />} 
                    label="Allergies & Conditions" 
                    sx={{ minWidth: '160px' }}
                  />
                </Tabs>
              </Box>
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" align="center">Contact Information</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Phone" 
                          secondary={patient.contactNumber} 
                          sx={{ textAlign: 'center' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Email" 
                          secondary={patient.email} 
                          sx={{ textAlign: 'center' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Address" 
                          secondary={patient.address} 
                          sx={{ textAlign: 'center' }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" align="center">Emergency Contact</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary={patient.emergencyContact.name}
                          secondary={`${patient.emergencyContact.relationship} - ${patient.emergencyContact.phone}`}
                          sx={{ textAlign: 'center' }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" align="center">Personal Details</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Gender" 
                          secondary={patient.gender} 
                          sx={{ textAlign: 'center' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Blood Type" 
                          secondary={patient.bloodType} 
                          sx={{ textAlign: 'center' }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3} justifyContent="center">
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" align="center" sx={{ mb: 2, fontWeight: 600 }}>
                      Family Medical History
                    </Typography>
                    <Grid container spacing={2} justifyContent="center">
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, height: '100%', backgroundColor: '#f8f9fa', textAlign: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Father's Medical History
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                            {fatherHistoryArray.length > 0 ? (
                              fatherHistoryArray.map((condition, index) => (
                                <Chip key={index} label={condition} color="info" size="small" />
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">No recorded history</Typography>
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, height: '100%', backgroundColor: '#f8f9fa', textAlign: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Mother's Medical History
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                            {motherHistoryArray.length > 0 ? (
                              motherHistoryArray.map((condition, index) => (
                                <Chip key={index} label={condition} color="info" size="small" />
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">No recorded history</Typography>
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, height: '100%', backgroundColor: '#f8f9fa', textAlign: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Siblings' Medical History
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                            {siblingsHistoryArray.length > 0 ? (
                              siblingsHistoryArray.map((condition, index) => (
                                <Chip key={index} label={condition} color="info" size="small" />
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">No recorded history</Typography>
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" align="center">Allergies</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
                      {allergiesArray.length > 0 ? (
                        allergiesArray.map((allergy, index) => (
                          <Chip key={index} label={allergy} color="error" size="small" />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">No known allergies</Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" align="center">Chronic Conditions</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
                      {conditionsArray.length > 0 ? (
                        conditionsArray.map((condition, index) => (
                          <Chip key={index} label={condition} color="warning" size="small" />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">No chronic conditions</Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function PatientRecords() {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    status: 'BEING_TREATED',
    bloodType: 'O+',
    allergies: '',
    chronic_conditions: '',
    father_medical_history: '',
    mother_medical_history: '',
    siblings_medical_history: '',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_phone: ''
  });

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);
  
  // Add effect to update localStorage whenever patients changes
  useEffect(() => {
    if (patients.length > 0) {
      localStorage.setItem('patients', JSON.stringify(patients));
      console.log('Saved patients to localStorage:', patients.length);
    }
  }, [patients]);

  const fetchPatients = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First try to load from localStorage for faster response, but only if not forcing refresh
      if (!forceRefresh) {
        const savedPatients = localStorage.getItem('patients');
        if (savedPatients) {
          try {
            const parsed = JSON.parse(savedPatients);
            setPatients(parsed);
            console.log(`Loaded ${parsed.length} patients from localStorage`);
          } catch (e) {
            console.error('Error parsing localStorage patients:', e);
          }
        }
      }
      
      const response = await api.get('/api/patients/patients/');
      console.log('RAW PATIENTS DATA FROM BACKEND:', response.data);
      
      // Transform data to match expected format for the component
      const formattedPatients = response.data.map(patient => {
        // Log what we receive for allergies and chronic conditions for each patient
        console.log(`PATIENT ${patient.id} DATA:`, {
          allergies: patient.allergies,
          allergies_type: typeof patient.allergies,
          isAllergiesArray: Array.isArray(patient.allergies),
          chronic_conditions: patient.chronic_conditions,
          chronic_conditions_type: typeof patient.chronic_conditions,
          isConditionsArray: Array.isArray(patient.chronic_conditions),
          father_medical_history: patient.father_medical_history,
          mother_medical_history: patient.mother_medical_history,
          siblings_medical_history: patient.siblings_medical_history
        });
        
        // Handle allergies - ensure it's always an array
        let allergiesArray = [];
        if (patient.allergies) {
          if (Array.isArray(patient.allergies)) {
            allergiesArray = patient.allergies;
          } else if (typeof patient.allergies === 'string') {
            allergiesArray = patient.allergies.split(',').map(a => a.trim()).filter(Boolean);
          }
        } else if (patient.allergies_list && Array.isArray(patient.allergies_list)) {
          allergiesArray = patient.allergies_list;
        }
        
        // Handle chronic conditions - ensure it's always an array
        let conditionsArray = [];
        if (patient.chronic_conditions) {
          if (Array.isArray(patient.chronic_conditions)) {
            conditionsArray = patient.chronic_conditions;
          } else if (typeof patient.chronic_conditions === 'string') {
            conditionsArray = patient.chronic_conditions.split(',').map(c => c.trim()).filter(Boolean);
          }
        } else if (patient.chronicConditions && Array.isArray(patient.chronicConditions)) {
          conditionsArray = patient.chronicConditions;
        }

        // Handle family history - ensure each element is always an array
        const fatherHistory = processHistoryField(patient.father_medical_history || patient.family_history?.father || patient.familyHistory?.father);
        const motherHistory = processHistoryField(patient.mother_medical_history || patient.family_history?.mother || patient.familyHistory?.mother);
        const siblingsHistory = processHistoryField(patient.siblings_medical_history || patient.family_history?.siblings || patient.familyHistory?.siblings);

        return {
          id: patient.id,
          name: patient.name,
          dateOfBirth: patient.date_of_birth,
          gender: patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other',
          contactNumber: patient.phone,
          email: patient.email || '',
          address: patient.address || '',
          status: patient.status || 'BEING_TREATED', // Use the status from backend
          bloodType: patient.blood_type || patient.bloodType || 'O+', // Try to get from backend
          allergies: allergiesArray,
          chronicConditions: conditionsArray,
          medications: patient.medications || [], // Default empty array
          emergencyContact: patient.emergency_contact || {
            name: '',
            relationship: '',
            phone: ''
          },
          familyHistory: {
            father: fatherHistory,
            mother: motherHistory,
            siblings: siblingsHistory
          }
        };
      });
      
      console.log('FORMATTED PATIENTS AFTER PROCESSING:', formattedPatients);
      setPatients(formattedPatients);
      
      // Save to localStorage for persistence
      localStorage.setItem('patients', JSON.stringify(formattedPatients));
    } catch (error) {
      console.error('Error fetching patients:', error);
      console.error('Error details:', error.response?.data);
      setError('Failed to fetch patients. Please try again later.');
      // Don't clear existing patients on error to maintain state
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Format the data to match backend expectations
      const patientData = {
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender === 'Male' ? 'M' : formData.gender === 'Female' ? 'F' : 'O',
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        status: formData.status,
        blood_type: formData.bloodType,
        allergies: formData.allergies.split(',').map(item => item.trim()).filter(Boolean),
        chronic_conditions: formData.chronic_conditions.split(',').map(item => item.trim()).filter(Boolean),
        father_medical_history: formData.father_medical_history.split(',').map(item => item.trim()).filter(Boolean),
        mother_medical_history: formData.mother_medical_history.split(',').map(item => item.trim()).filter(Boolean),
        siblings_medical_history: formData.siblings_medical_history.split(',').map(item => item.trim()).filter(Boolean),
        emergency_contact: {
          name: formData.emergency_contact_name,
          relationship: formData.emergency_contact_relationship,
          phone: formData.emergency_contact_phone
        }
      };

      console.log('Sending patient data:', patientData);

      let response;
      if (selectedPatient) {
        // Update existing patient
        response = await api.put(`/api/patients/patients/${selectedPatient.id}/`, patientData);
      } else {
        // Create new patient
        response = await api.post('/api/patients/patients/', patientData);
      }

      console.log('Patient operation successful:', response.data);
      
      // Refresh the patients list
      await fetchPatients(true);
      
      // Close the dialog
      handleCloseDialog();
      
      // Show success message (you might want to add a snackbar or alert component)
      alert(selectedPatient ? 'Patient updated successfully!' : 'Patient added successfully!');
      
    } catch (error) {
      console.error('Error in patient operation:', error);
      
      // Show error message with specific details if available
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error ||
                          error.message ||
                          'An error occurred while processing your request';
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/patients/patients/${id}/`);
      setPatients(patients.filter(patient => patient.id !== id));
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const handleStatusChange = async (patientId, newStatus) => {
    try {
      console.log(`Updating patient ${patientId} status to: ${newStatus}`);
      
      // Verify the status is one of the expected values
      if (!['BEING_TREATED', 'DISCHARGED', 'WAITING'].includes(newStatus)) {
        console.error(`Invalid status value: ${newStatus}`);
        alert(`Invalid status value: ${newStatus}`);
        return;
      }
      
      // Send PATCH request directly
      await api.patch(`/api/patients/patients/${patientId}/`, { status: newStatus });
      
      // Update UI
      setPatients(prevPatients => 
        prevPatients.map(patient =>
          patient.id === patientId ? { ...patient, status: newStatus } : patient
        )
      );
      
      // Update localStorage to reflect the new status
      const existingPatients = JSON.parse(localStorage.getItem('patients') || '[]');
      const updatedPatients = existingPatients.map(patient => 
        patient.id === patientId ? { ...patient, status: newStatus } : patient
      );
      localStorage.setItem('patients', JSON.stringify(updatedPatients));
      
      // Refresh patients from API to ensure all data is in sync
      fetchPatients(true);
    } catch (error) {
      console.error('Error updating patient status:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to update patient status: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleOpenDialog = (patient = null) => {
    if (patient) {
      setSelectedPatient(patient);
      setFormData({
        name: patient.name,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.contactNumber,
        email: patient.email,
        address: patient.address,
        status: patient.status,
        bloodType: patient.bloodType,
        allergies: Array.isArray(patient.allergies) ? patient.allergies.join(', ') : patient.allergies || '',
        chronic_conditions: Array.isArray(patient.chronicConditions) ? patient.chronicConditions.join(', ') : patient.chronicConditions || '',
        father_medical_history: Array.isArray(patient.familyHistory?.father) ? patient.familyHistory.father.join(', ') : patient.familyHistory?.father || '',
        mother_medical_history: Array.isArray(patient.familyHistory?.mother) ? patient.familyHistory.mother.join(', ') : patient.familyHistory?.mother || '',
        siblings_medical_history: Array.isArray(patient.familyHistory?.siblings) ? patient.familyHistory.siblings.join(', ') : patient.familyHistory?.siblings || '',
        emergency_contact_name: patient.emergencyContact.name,
        emergency_contact_relationship: patient.emergencyContact.relationship,
        emergency_contact_phone: patient.emergencyContact.phone
      });
    } else {
      setSelectedPatient(null);
      setFormData({
        name: '',
        date_of_birth: '',
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        status: 'BEING_TREATED',
        bloodType: 'O+',
        allergies: '',
        chronic_conditions: '',
        father_medical_history: '',
        mother_medical_history: '',
        siblings_medical_history: '',
        emergency_contact_name: '',
        emergency_contact_relationship: '',
        emergency_contact_phone: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPatient(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFamilyHistoryChange = (member, value) => {
    setFormData(prev => ({
      ...prev,
      familyHistory: {
        ...prev.familyHistory,
        [member]: value
      }
    }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPatients = [...patients].sort((a, b) => {
    if (!sortConfig.key) return 0;

    if (sortConfig.key === 'dateOfBirth') {
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

  const filteredPatients = sortedPatients.filter(patient =>
    Object.values(patient).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const SortableTableCell = ({ label, sortKey }) => (
    <TableCell
      onClick={() => handleSort(sortKey)}
      sx={{ 
        cursor: 'pointer',
        textAlign: 'center',
        fontWeight: 500,
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

  // Helper function to process history fields in a consistent way
  function processHistoryField(historyField) {
    if (!historyField) {
      return [];
    }
    
    if (Array.isArray(historyField)) {
      return historyField;
    }
    
    if (typeof historyField === 'string') {
      // Split by comma and clean up each entry
      return historyField.split(',').map(item => item.trim()).filter(Boolean);
    }
    
    return [];
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 2,
        p: 3 
      }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button variant="contained" onClick={fetchPatients}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ 
        backgroundColor: 'white',
        p: 3,
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 600,
          color: '#1e293b',
          mb: 1
        }}>
          Patient Records
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#64748b',
          fontSize: '1.1rem'
        }}>
          Manage and track patient information and medical history
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="Search patients..."
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
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: 2,
            px: 3,
          }}
        >
          Add Patient
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <SortableTableCell label="Patient ID" sortKey="id" />
              <SortableTableCell label="Name" sortKey="name" />
              <SortableTableCell label="Date of Birth" sortKey="dateOfBirth" />
              <SortableTableCell label="Status" sortKey="status" />
              <TableCell align="center" sx={{ fontWeight: 500 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.map((patient) => (
              <PatientRow
                key={patient.id}
                patient={patient}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            <Typography variant="h6">
              {selectedPatient ? 'Edit Patient' : 'Add New Patient'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="date_of_birth"
                  label="Date of Birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    label="Gender"
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Blood Type</InputLabel>
                  <Select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    label="Blood Type"
                  >
                    <MenuItem value="A+">A+</MenuItem>
                    <MenuItem value="A-">A-</MenuItem>
                    <MenuItem value="B+">B+</MenuItem>
                    <MenuItem value="B-">B-</MenuItem>
                    <MenuItem value="AB+">AB+</MenuItem>
                    <MenuItem value="AB-">AB-</MenuItem>
                    <MenuItem value="O+">O+</MenuItem>
                    <MenuItem value="O-">O-</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Contact Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Medical Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  helperText="Separate multiple allergies with commas"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Chronic Conditions"
                  name="chronic_conditions"
                  value={formData.chronic_conditions}
                  onChange={handleInputChange}
                  helperText="Separate multiple conditions with commas"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Emergency Contact
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  required
                  label="Name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  required
                  label="Relationship"
                  name="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  required
                  label="Phone"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Patient Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    <MenuItem value="BEING_TREATED">Being Treated</MenuItem>
                    <MenuItem value="DISCHARGED">Discharged</MenuItem>
                    <MenuItem value="WAITING">Waiting</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Family History
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Father's Medical History"
                  name="father_medical_history"
                  value={formData.father_medical_history}
                  onChange={handleInputChange}
                  helperText="Separate multiple conditions with commas"
                  multiline
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Mother's Medical History"
                  name="mother_medical_history"
                  value={formData.mother_medical_history}
                  onChange={handleInputChange}
                  helperText="Separate multiple conditions with commas"
                  multiline
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Siblings' Medical History"
                  name="siblings_medical_history"
                  value={formData.siblings_medical_history}
                  onChange={handleInputChange}
                  helperText="Separate multiple conditions with commas"
                  multiline
                />
              </Grid>
            </Grid>

            <Typography variant="body2" color="text.secondary">
              Required fields are marked with *
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1
        }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            startIcon={<DeleteIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmit}
            startIcon={<AddIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            {selectedPatient ? 'Update Patient' : 'Add Patient'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PatientRecords; 