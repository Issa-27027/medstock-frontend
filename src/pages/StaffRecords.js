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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  MedicalServices as MedicalIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  EmojiEvents as AchievementIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  LocalHospital as LocalHospitalIcon,
  Medication as MedicationIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import api from '../services/api';

// Update TabPanel component
function TabPanel({ children, value, index }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`staff-tabpanel-${index}`}
      aria-labelledby={`staff-tab-${index}`}
      sx={{ py: 2 }}
    >
      {value === index && children}
    </Box>
  );
}

// Update initial staff data structure
const initialStaff = [
  {
    id: 'S001',
    name: 'Dr. Sarah Smith',
    role: 'Pharmacist',
    department: 'Pharmacy',
    status: 'Active',
    contactNumber: '+1234567890',
    email: 'sarah.smith@example.com',
    dateOfJoining: '2024-01-01',
    qualifications: ['PharmD', 'BCPS'],
    specializations: ['Clinical Pharmacy', 'Medication Therapy Management'],
    yearsOfExperience: 8,
    emergencyContact: {
      name: 'John Smith',
      relationship: 'Spouse',
      phone: '+1987654321'
    }
  }
];

// Add a utility function to format display text
const formatDisplayText = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

function StaffRow({ staff, onEdit, onDelete, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Ensure specializations is always an array
  const specializations = Array.isArray(staff.specializations) 
    ? staff.specializations 
    : (staff.specialization ? [staff.specialization] : []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'active':
      case 'active':
        return '#4caf50';
      case 'on leave':
      case 'on_leave':
        return '#ff9800';
      case 'inactive':
      case 'inactive':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const StatusChip = ({ status }) => {
    // Convert internal status code to display text
    let displayText = status;
    if (status === 'active') displayText = 'Active';
    else if (status === 'on_leave') displayText = 'On Leave';
    else if (status === 'inactive') displayText = 'Inactive';
    
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
        <TableCell align="center">{staff.id}</TableCell>
        <TableCell align="center">{staff.name}</TableCell>
        <TableCell align="center">{formatDisplayText(staff.role)}</TableCell>
        <TableCell align="center">
          {formatDisplayText(typeof staff.department === 'object' ? staff.department.name.toLowerCase() : staff.department.toLowerCase())}
        </TableCell>
        <TableCell align="center">
          <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
            <Select
              value={staff.status}
              onChange={(e) => {
                e.stopPropagation();
                onStatusChange(staff.id, e.target.value);
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
              <MenuItem value="active">
                <StatusChip status="active" />
              </MenuItem>
              <MenuItem value="on_leave">
                <StatusChip status="on_leave" />
              </MenuItem>
              <MenuItem value="inactive">
                <StatusChip status="inactive" />
              </MenuItem>
            </Select>
          </FormControl>
        </TableCell>
        <TableCell align="center">
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            onEdit(staff);
          }}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            onDelete(staff.id);
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
                    label="Professional Details" 
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
                          primary="Email" 
                          secondary={staff.email || 'Not provided'} 
                          sx={{ textAlign: 'center' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Phone" 
                          secondary={staff.contactNumber || 'Not provided'} 
                          sx={{ textAlign: 'center' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Address" 
                          secondary={staff.address || 'Not provided'} 
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
                          primary={staff.emergencyContact?.name || 'Not provided'}
                          secondary={staff.emergencyContact ? 
                            `${staff.emergencyContact.relationship || 'Not specified'} - ${staff.emergencyContact.phone || 'No phone'}`
                            : 'No emergency contact information'
                          }
                          sx={{ textAlign: 'center' }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" align="center">Employment Details</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Date of Joining" 
                          secondary={staff.dateOfJoining || 'Not provided'} 
                          sx={{ textAlign: 'center' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Department" 
                          secondary={typeof staff.department === 'object' ? staff.department.name : staff.department} 
                          sx={{ textAlign: 'center' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Role" 
                          secondary={staff.role} 
                          sx={{ textAlign: 'center' }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" align="center">Qualifications</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
                      {staff.qualifications.length > 0 ? (
                        staff.qualifications.map((qual, index) => (
                          <Chip
                            key={index}
                            label={qual}
                            color="primary"
                            size="small"
                            sx={{ borderRadius: 1.5 }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">No qualifications listed</Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" align="center">Specializations</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
                      {specializations.length > 0 ? (
                        specializations.map((spec, index) => (
                          <Chip
                            key={index}
                            label={spec}
                            color="secondary"
                            size="small"
                            sx={{ borderRadius: 1.5 }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">No specializations listed</Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" align="center">Experience</Typography>
                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                      <Typography variant="body1">
                        {staff.yearsOfExperience ? `${staff.yearsOfExperience} years of experience` : 'Experience not specified'}
                      </Typography>
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

function StaffRecords() {
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });
  const [formData, setFormData] = useState({
    id: '',
    user_id: '',
    name: '',
    role: 'pharmacist',
    department: 'pharmacy',
    email: '',
    phone: '',
    address: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    qualifications: '',
    specializations: '',
    yearsOfExperience: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    status: 'active'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/staff/staff/');
      console.log('RAW STAFF DATA FROM BACKEND:', response.data);
      
      const formattedStaff = response.data.map(staff => {
        // Format emergency contact with fallbacks to prevent undefined values
        const emergencyContact = {
          name: '',
          relationship: '',
          phone: ''
        };
        
        // Handle emergency_contact from backend
        if (staff.emergency_contact) {
          if (typeof staff.emergency_contact === 'object') {
            emergencyContact.name = staff.emergency_contact.name || '';
            emergencyContact.relationship = staff.emergency_contact.relationship || '';
            emergencyContact.phone = staff.emergency_contact.phone || '';
          }
        }
        
        // Get full name from combined fields or directly from name field
        const fullName = staff.name || (staff.user ? 
          (staff.user.first_name && staff.user.last_name ? 
            `${staff.user.first_name} ${staff.user.last_name}` : 
            staff.user.username) : 
          'Unknown');
        
        // Ensure joining_date and dateOfJoining are properly mapped 
        const dateOfJoining = staff.joining_date || staff.dateOfJoining || new Date().toISOString().split('T')[0];
        
        // Ensure years_of_experience and yearsOfExperience are properly mapped
        const yearsOfExperience = staff.years_of_experience || staff.yearsOfExperience || 0;

        // Ensure department is lowercase
        const department = typeof staff.department === 'object' 
          ? staff.department.name.toLowerCase() 
          : (staff.department || '').toLowerCase();
        
        return {
          ...staff,
          name: fullName,
          dateOfJoining: dateOfJoining,
          yearsOfExperience: yearsOfExperience,
          status: (staff.status || 'active').toLowerCase(),
          department: department,
          role: (staff.role || 'pharmacist').toLowerCase(),
          contactNumber: staff.phone || '',
          email: staff.user?.email || '',
          qualifications: Array.isArray(staff.qualifications) ? staff.qualifications : [],
          specializations: Array.isArray(staff.specialization) ? staff.specialization : 
                           (staff.specialization ? [staff.specialization] : []),
          emergencyContact: emergencyContact
        };
      });
      
      console.log('FORMATTED STAFF AFTER PROCESSING:', formattedStaff);
      setStaff(formattedStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setError('Failed to fetch staff records. Please try again later.');
      setStaff([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      console.log(`Updating staff ${id} status to: ${newStatus}`);
      
      // Verify the status is one of the expected values
      if (!['active', 'on_leave', 'inactive'].includes(newStatus)) {
        console.error(`Invalid status value: ${newStatus}`);
        alert(`Invalid status value: ${newStatus}`);
        return;
      }
      
      // Send PATCH request directly
      await api.patch(`/api/staff/staff/${id}/`, { status: newStatus });
      
      // Update UI
      setStaff(prevStaff => 
        prevStaff.map(staff =>
          staff.id === id ? { ...staff, status: newStatus } : staff
        )
      );
      
      // Refresh staff data to ensure it's in sync
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff status:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to update staff status: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    
    // Handle department
    const departmentValue = typeof staff.department === 'object' 
      ? staff.department.name 
      : staff.department;
      
    // Convert yearsOfExperience to string to ensure proper form handling
    const yearsExpString = staff.yearsOfExperience !== undefined && staff.yearsOfExperience !== null
      ? String(staff.yearsOfExperience)
      : '';
      
    setFormData({
      id: staff.id,
      user_id: staff.user_id || '',
      name: staff.name,
      role: staff.role,
      department: departmentValue,
      email: staff.email,
      phone: staff.contactNumber,
      address: staff.address || '',
      dateOfJoining: staff.dateOfJoining || new Date().toISOString().split('T')[0],
      qualifications: Array.isArray(staff.qualifications) ? staff.qualifications.join(', ') : staff.qualifications,
      specializations: Array.isArray(staff.specializations) ? staff.specializations.join(', ') : (staff.specialization || ''),
      yearsOfExperience: yearsExpString,
      emergencyContact: {
        name: staff.emergencyContact?.name || '',
        relationship: staff.emergencyContact?.relationship || '',
        phone: staff.emergencyContact?.phone || ''
      },
      status: staff.status
    });
    
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/staff/staff/${id}/`);
      setStaff(prev => prev.filter(staff => staff.id !== id));
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleOpenDialog = (selectedStaffMember = null) => {
    if (selectedStaffMember) {
      setSelectedStaff(selectedStaffMember);
      
      setFormData({
        id: selectedStaffMember.id,
        user_id: selectedStaffMember.user_id || '',
        name: selectedStaffMember.name,
        role: selectedStaffMember.role.toLowerCase(),
        department: selectedStaffMember.department.toLowerCase(),
        email: selectedStaffMember.email,
        phone: selectedStaffMember.contactNumber,
        address: selectedStaffMember.address || '',
        dateOfJoining: selectedStaffMember.dateOfJoining || new Date().toISOString().split('T')[0],
        qualifications: selectedStaffMember.qualifications.join(', '),
        specializations: selectedStaffMember.specializations?.join(', ') || '',
        yearsOfExperience: selectedStaffMember.yearsOfExperience?.toString() || '',
        emergencyContact: {
          name: selectedStaffMember.emergencyContact?.name || '',
          relationship: selectedStaffMember.emergencyContact?.relationship || '',
          phone: selectedStaffMember.emergencyContact?.phone || ''
        },
        status: selectedStaffMember.status.toLowerCase()
      });
    } else {
      setSelectedStaff(null);
      const newId = `S${String(staff.length + 1).padStart(3, '0')}`;
      setFormData({
        id: newId,
        user_id: '',
        name: '',
        role: 'pharmacist',
        department: 'pharmacy',
        email: '',
        phone: '',
        address: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        qualifications: '',
        specializations: '',
        yearsOfExperience: '',
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        },
        status: 'active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStaff(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Format the base data consistently for both create and update
      const formattedData = {
        user_id: formData.user_id || selectedStaff?.user_id || 1,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        role: formData.role.toLowerCase(),
        department: formData.department.toLowerCase(),
        joining_date: formData.dateOfJoining,
        years_of_experience: parseInt(formData.yearsOfExperience, 10) || 0,
        qualifications: formData.qualifications ? formData.qualifications.split(',').map(item => item.trim()).filter(Boolean) : [],
        specialization: formData.specializations ? formData.specializations.split(',')[0].trim() : '',
        emergency_contact: {
          name: formData.emergencyContact.name.trim() || '',
          relationship: formData.emergencyContact.relationship.trim() || '',
          phone: formData.emergencyContact.phone.trim() || ''
        },
        status: formData.status.toLowerCase().replace(' ', '_')
      };

      console.log('Sending formatted data:', formattedData);

      if (selectedStaff) {
        // Update existing staff member
        await api.put(`/api/staff/staff/${selectedStaff.id}/`, formattedData);
        setStaff(prev => prev.map(s => 
          s.id === selectedStaff.id ? { 
            ...s,
            ...formattedData,
            contactNumber: formattedData.phone,
            dateOfJoining: formattedData.joining_date,
            yearsOfExperience: formattedData.years_of_experience,
            specializations: [formattedData.specialization],
            emergencyContact: formattedData.emergency_contact
          } : s
        ));
      } else {
        // Create new staff member
        const response = await api.post('/api/staff/staff/', formattedData);
        const newStaff = {
          id: response.data.id,
          ...formattedData,
          contactNumber: formattedData.phone,
          dateOfJoining: formattedData.joining_date,
          yearsOfExperience: formattedData.years_of_experience,
          specializations: [formattedData.specialization],
          emergencyContact: formattedData.emergency_contact
        };
        setStaff(prev => [...prev, newStaff]);
      }

      // Close dialog and refresh data
      handleCloseDialog();
      fetchStaff();
    } catch (error) {
      console.error('Error saving staff member:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.detail || 
                          Object.entries(error.response?.data || {})
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ') ||
                          'Please try again.';
      alert(`Error saving staff member: ${errorMessage}`);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedStaff = [...staff].sort((a, b) => {
    if (!sortConfig.key) return 0;

    if (sortConfig.key === 'dateOfJoining') {
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

  const filteredStaff = sortedStaff.filter(staff =>
    Object.values(staff).some(value =>
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
        <Button variant="contained" onClick={fetchStaff}>
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
          Staff Records
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#64748b',
          fontSize: '1.1rem'
        }}>
          Manage healthcare staff information and performance
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="Search staff..."
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
          Add Staff Member
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <SortableTableCell label="Staff ID" sortKey="id" />
              <SortableTableCell label="Name" sortKey="name" />
              <SortableTableCell label="Role" sortKey="role" />
              <SortableTableCell label="Department" sortKey="department" />
              <SortableTableCell label="Status" sortKey="status" />
              <TableCell align="center" sx={{ fontWeight: 500 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaff.map((staff) => (
              <StaffRow
                key={staff.id}
                staff={staff}
                onEdit={handleEdit}
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
        <DialogTitle sx={{ 
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <PersonIcon color="primary" />
          {selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Personal Information Section */}
            <Box>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" />
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Staff ID"
                    name="id"
                    value={formData.id}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Date of Joining"
                    name="dateOfJoining"
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      label="Role"
                    >
                      <MenuItem value="administrator">Administrator</MenuItem>
                      <MenuItem value="doctor">Doctor</MenuItem>
                      <MenuItem value="pharmacist">Pharmacist</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Department</InputLabel>
                    <Select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      label="Department"
                    >
                      <MenuItem value="Pharmacy">Pharmacy</MenuItem>
                      <MenuItem value="emergency">Emergency</MenuItem>
                      <MenuItem value="cardiology">Cardiology</MenuItem>
                      <MenuItem value="radiology">Radiology</MenuItem>
                      <MenuItem value="administration">Administration</MenuItem>
                      <MenuItem value="laboratory">Laboratory</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="on_leave">On Leave</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Contact Information Section */}
            <Box>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalHospitalIcon fontSize="small" />
                Contact Information
              </Typography>
              <Grid container spacing={2}>
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
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
            </Box>

            {/* Professional Details Section */}
            <Box>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MedicationIcon fontSize="small" />
                Professional Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Years of Experience"
                    name="yearsOfExperience"
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Qualifications"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleInputChange}
                    helperText="Separate multiple qualifications with commas"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Specializations"
                    name="specializations"
                    value={formData.specializations}
                    onChange={handleInputChange}
                    helperText="Separate multiple specializations with commas"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Emergency Contact Section */}
            <Box>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon fontSize="small" />
                Emergency Contact
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    required
                    label="Name"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    required
                    label="Relationship"
                    name="emergencyContact.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    required
                    label="Phone"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            </Box>
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
            {selectedStaff ? 'Update Staff Member' : 'Add Staff Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StaffRecords; 