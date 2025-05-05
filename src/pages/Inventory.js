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
  Alert,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import api from '../services/api';

// List of approved suppliers
const suppliers = [
  {
    name: 'ABC Pharmaceuticals',
    location: 'New York, NY',
    type: 'Manufacturer',
    rating: 'A+'
  },
  {
    name: 'Global Medical Supplies',
    location: 'Chicago, IL',
    type: 'Distributor',
    rating: 'A'
  },
  {
    name: 'HealthCare Solutions',
    location: 'Los Angeles, CA',
    type: 'Manufacturer',
    rating: 'A+'
  },
  {
    name: 'MediCorp International',
    location: 'Miami, FL',
    type: 'Distributor',
    rating: 'A'
  },
  {
    name: 'MedSupply Co.',
    location: 'Houston, TX',
    type: 'Distributor',
    rating: 'B+'
  },
  {
    name: 'PharmaCorp',
    location: 'Boston, MA',
    type: 'Manufacturer',
    rating: 'A+'
  },
  {
    name: 'Quality Medical Products',
    location: 'Seattle, WA',
    type: 'Manufacturer',
    rating: 'A'
  },
  {
    name: 'SafeMed Supplies',
    location: 'Dallas, TX',
    type: 'Distributor',
    rating: 'B+'
  },
  {
    name: 'United Healthcare',
    location: 'Atlanta, GA',
    type: 'Manufacturer',
    rating: 'A+'
  },
  {
    name: 'Worldwide Medical',
    location: 'San Francisco, CA',
    type: 'Distributor',
    rating: 'A'
  }
];

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: 'Medical Supplies',
    quantity: 0,
    unit: 'units',
    minQuantity: '0',
    location: '',
    supplier: 'PharmaCorp',
    pricePerUnit: '',
    batches: []
  });
  const [newBatch, setNewBatch] = useState({
    batchNumber: '',
    expirationDate: '',
    quantity: '',
    pricePerUnit: '',
    supplier: 'PharmaCorp'
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });

  // Fetch inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Get inventory items from medicines endpoint
      const response = await api.get('/api/inventory/medicines/');
      console.log('Inventory API response:', response.data);
      
      const inventoryData = response.data.map(item => {
        // Calculate total quantity from batches
        const totalQuantity = item.batches?.reduce((total, batch) => 
          total + (parseInt(batch.quantity) || 0), 0) || 0;
        
        return {
          id: item.id,
          name: item.name || 'Unknown Item',
          category: item.category?.name || 'Uncategorized',
          quantity: totalQuantity,
          unit: item.unit || 'units',
          minQuantity: item.min_quantity || 0,
          supplier: item.supplier?.name || 'Unknown Supplier',
          pricePerUnit: item.price_per_unit || 0,
          barcode: item.barcode || '',
          description: item.description || '',
          batches: item.batches?.map(batch => ({
            id: batch.id,
            batchNumber: batch.batch_number,
            quantity: batch.quantity,
            expirationDate: batch.expiration_date,
            pricePerUnit: batch.cost_per_unit,
            supplier: batch.supplier?.name || item.supplier?.name || 'Unknown Supplier'
          })) || []
        };
      });
      
      console.log('Formatted inventory data:', inventoryData);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to load inventory data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInventoryLogs = async (medicineId) => {
    try {
      const response = await api.get(`/api/inventory/inventory-logs/?medicine_id=${medicineId}`);
      console.log('Inventory logs:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory logs:', error);
      return [];
    }
  };

  const handleRowExpand = async (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
      const logs = await fetchInventoryLogs(id);
      setInventoryLogs(logs);
    }
  };

  const calculateTotalQuantity = (batches) => {
    return batches.reduce((total, batch) => total + Number(batch.quantity), 0);
  };

  const handleBatchChange = (e) => {
    const { name, value } = e.target;
    setNewBatch(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddBatch = () => {
    if (!newBatch.batchNumber || !newBatch.expirationDate || !newBatch.quantity || !newBatch.pricePerUnit || !newBatch.supplier) {
      return;
    }
    setFormData(prev => {
      const updatedBatches = [...prev.batches, { ...newBatch }];
      return {
        ...prev,
        batches: updatedBatches,
        quantity: calculateTotalQuantity(updatedBatches),
        // Update main item price and supplier from the latest batch
        pricePerUnit: newBatch.pricePerUnit,
        supplier: newBatch.supplier
      };
    });
    setNewBatch({
      batchNumber: '',
      expirationDate: '',
      quantity: '',
      pricePerUnit: '',
      supplier: 'PharmaCorp'
    });
  };

  const handleRemoveBatch = (batchNumber) => {
    setFormData(prev => {
      const updatedBatches = prev.batches.filter(b => b.batchNumber !== batchNumber);
      const lastBatch = updatedBatches[updatedBatches.length - 1];
      return {
        ...prev,
        batches: updatedBatches,
        quantity: calculateTotalQuantity(updatedBatches),
        // Update main item price and supplier from the last remaining batch, or reset if none
        pricePerUnit: lastBatch ? lastBatch.pricePerUnit : '',
        supplier: lastBatch ? lastBatch.supplier : 'PharmaCorp'
      };
    });
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        ...item,
        category: item.category,
        batches: item.batches.map(batch => ({
          ...batch,
          // Each batch should maintain its own price and supplier
          pricePerUnit: batch.pricePerUnit || item.pricePerUnit,
          supplier: batch.supplier || item.supplier
        })) || []
      });
    } else {
      setSelectedItem(null);
      setFormData({
        name: '',
        barcode: '',
        category: 'Medical Supplies',
        quantity: 0,
        unit: 'units',
        minQuantity: '0',
        pricePerUnit: '',
        supplier: 'PharmaCorp',
        batches: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const itemData = {
        name: formData.name,
        category: formData.category,
        total_quantity: calculateTotalQuantity(formData.batches),
        unit: formData.unit,
        min_quantity: formData.minQuantity,
        supplier: formData.supplier,
        price_per_unit: formData.pricePerUnit,
        batches: formData.batches.map(batch => ({
          batch_number: batch.batchNumber,
          quantity: batch.quantity,
          expiration_date: batch.expirationDate,
          price_per_unit: batch.pricePerUnit,
          supplier: batch.supplier
        }))
      };

      if (selectedItem) {
        await api.put(`/api/inventory/medicines/${selectedItem.id}/`, itemData);
        setInventory(inventory.map(item =>
          item.id === selectedItem.id ? { ...itemData, id: selectedItem.id } : item
        ));
      } else {
        const response = await api.post('/api/inventory/medicines/', itemData);
        setInventory([...inventory, response.data]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving inventory item:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/inventory/medicines/${id}/`);
      setInventory(inventory.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedInventory = [...inventory].sort((a, b) => {
    if (!sortConfig.key) return 0;

    if (sortConfig.key === 'lastOrder') {
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

  const filteredInventory = sortedInventory.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const lowStockItems = inventory.filter(
    item => item.quantity <= item.minQuantity
  );

  const getExpirationStatus = (batches) => {
    if (!Array.isArray(batches) || batches.length === 0) return { status: 'No batches', color: 'default' };
    const today = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    const earliestExpiration = new Date(Math.min(...batches.map(batch => new Date(batch.expirationDate))));
    if (earliestExpiration < today) {
      return { status: 'Expired', color: 'error' };
    } else if (earliestExpiration <= oneMonthFromNow) {
      return { status: 'Expires Soon', color: 'error' };
    } else {
      return { status: 'Valid', color: 'success' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getExpiredItemsCount = (batches) => {
    return batches.reduce((count, batch) => {
      return count + (getExpirationStatus(batches).status === 'Expired' ? batch.quantity : 0);
    }, 0);
  };

  const handleBatchEdit = (batchNumber, field, value) => {
    setFormData(prev => {
      const updatedBatches = prev.batches.map(batch => {
        if (batch.batchNumber === batchNumber) {
          return { ...batch, [field]: value };
        }
        return batch;
      });
      const lastBatch = updatedBatches[updatedBatches.length - 1];
      return {
        ...prev,
        batches: updatedBatches,
        quantity: calculateTotalQuantity(updatedBatches),
        // Update main item price and supplier only if editing the last batch
        ...(lastBatch && batchNumber === lastBatch.batchNumber ? {
          pricePerUnit: field === 'pricePerUnit' ? value : lastBatch.pricePerUnit,
          supplier: field === 'supplier' ? value : lastBatch.supplier
        } : {})
      };
    });
  };

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
          Inventory Management
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#64748b',
          fontSize: '1.1rem'
        }}>
          Track and manage your medical inventory
        </Typography>
      </Box>

      {/* Search Bar and Low Stock Alert */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search inventory..."
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
            flexGrow: 1,
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
        {lowStockItems.length > 0 && (
          <Alert 
            severity="warning" 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              '& .MuiAlert-icon': {
                color: '#f59e0b'
              },
              flexShrink: 0
            }}
          >
            {lowStockItems.length} items are running low on stock
          </Alert>
        )}
      </Box>

      {/* Inventory Table */}
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
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <SortableTableCell label="Name" sortKey="name" />
              <SortableTableCell label="Category" sortKey="category" />
              <SortableTableCell label="Quantity" sortKey="quantity" />
              <SortableTableCell label="Unit" sortKey="unit" />
              <SortableTableCell label="Min. Quantity" sortKey="minQuantity" />
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Expiration</TableCell>
              <TableCell align="right" sx={{ width: '80px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInventory.map((item) => {
              const expirationStatus = getExpirationStatus(item.batches);
              return (
                <React.Fragment key={item.id}>
                  <TableRow 
                    onClick={() => handleRowExpand(item.id)}
                    sx={{ 
                      '& > *': { borderBottom: expandedRow === item.id ? 'none' : '1px solid rgba(0,0,0,0.08)' },
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
                    <TableCell align="center">
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{item.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          ID: {item.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1">{item.category}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1">{item.quantity} {item.unit}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1">{item.unit}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1">{item.minQuantity} {item.unit}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={item.quantity <= item.minQuantity ? 'Low Stock' : 'In Stock'}
                        color={item.quantity <= item.minQuantity ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Chip 
                          label={expirationStatus.status}
                          color={expirationStatus.color}
                          size="small"
                          icon={expirationStatus.color === 'error' ? <WarningIcon /> : undefined}
                        />
                        {item.batches && item.batches.length > 0 && (
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {formatDate(item.batches[0].expirationDate)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(item);
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
                            handleDelete(item.id);
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
                  {expandedRow === item.id && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Box sx={{ p: 2 }}>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="h6" gutterBottom>
                                Item Details
                              </Typography>
                              <TableContainer>
                                <Table size="small">
                                  <TableBody>
                                    <TableRow>
                                      <TableCell component="th" scope="row">Barcode</TableCell>
                                      <TableCell>{item.barcode || 'N/A'}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell component="th" scope="row">Description</TableCell>
                                      <TableCell>{item.description || 'No description available'}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell component="th" scope="row">Supplier</TableCell>
                                      <TableCell>{item.supplier}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell component="th" scope="row">Price Per Unit</TableCell>
                                      <TableCell>${item.pricePerUnit}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell component="th" scope="row">Min Quantity</TableCell>
                                      <TableCell>{item.minQuantity} {item.unit}</TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="h6" gutterBottom>
                                Batch Information
                              </Typography>
                              <TableContainer>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Batch #</TableCell>
                                      <TableCell>Quantity</TableCell>
                                      <TableCell>Expiry Date</TableCell>
                                      <TableCell>Status</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {item.batches && item.batches.length > 0 ? (
                                      item.batches.map((batch) => (
                                        <TableRow key={batch.batchNumber}>
                                          <TableCell>{batch.batchNumber}</TableCell>
                                          <TableCell>{batch.quantity}</TableCell>
                                          <TableCell>{formatDate(batch.expirationDate)}</TableCell>
                                          <TableCell>
                                            <Chip 
                                              label={getExpirationStatus([batch]).status}
                                              color={getExpirationStatus([batch]).color}
                                              size="small"
                                            />
                                          </TableCell>
                                        </TableRow>
                                      ))
                                    ) : (
                                      <TableRow>
                                        <TableCell colSpan={4} align="center">
                                          No batch information available
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                Transaction History
                              </Typography>
                              <TableContainer>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Date</TableCell>
                                      <TableCell>Action</TableCell>
                                      <TableCell>Quantity</TableCell>
                                      <TableCell>Batch</TableCell>
                                      <TableCell>Performed By</TableCell>
                                      <TableCell>Notes</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {inventoryLogs.length > 0 ? (
                                      inventoryLogs.map(log => (
                                        <TableRow key={log.id}>
                                          <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                          <TableCell>
                                            <Chip 
                                              label={log.action} 
                                              color={log.action === 'ADD' ? 'success' : log.action === 'DISPENSE' ? 'warning' : 'default'} 
                                              size="small" 
                                            />
                                          </TableCell>
                                          <TableCell>{log.quantity}</TableCell>
                                          <TableCell>{log.batch?.batch_number || 'N/A'}</TableCell>
                                          <TableCell>{log.performed_by}</TableCell>
                                          <TableCell>{log.notes}</TableCell>
                                        </TableRow>
                                      ))
                                    ) : (
                                      <TableRow>
                                        <TableCell colSpan={6} align="center">
                                          No transaction history available
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid>
                          </Grid>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center">
            <EditIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              {selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Item Information Section */}
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Item Information
                </Typography>
              </Box>
            </Grid>

            {/* Item Information Fields Container */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Item Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Item ID"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      label="Category"
                      sx={{ height: '56px' }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: '300px',
                            width: 'auto',
                            '& .MuiMenuItem-root': {
                              py: 1,
                              px: 2
                            }
                          }
                        },
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left'
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left'
                        }
                      }}
                    >
                      <MenuItem value="Medical Supplies">Medical Supplies</MenuItem>
                      <MenuItem value="Medications">Medications</MenuItem>
                      <MenuItem value="Equipment">Equipment</MenuItem>
                      <MenuItem value="First Aid">First Aid</MenuItem>
                      <MenuItem value="Lab Supplies">Lab Supplies</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Quantity"
                    value={formData.quantity}
                    disabled
                    helperText="Automatically calculated from batch quantities"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Minimum Quantity"
                    name="minQuantity"
                    value={formData.minQuantity}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Expired Items"
                    value={getExpiredItemsCount(formData.batches)}
                    disabled
                    helperText="Automatically calculated from batch details"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Batch Management Section with increased spacing */}
            <Grid item xs={12}>
              <Box sx={{ mt: 6, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Batch Management
                </Typography>
              </Box>
            </Grid>

            {/* Batch Management Table */}
            <Grid item xs={12}>
              <TableContainer 
                component={Paper} 
                variant="outlined"
                sx={{ 
                  '& .MuiTable-root': {
                    minWidth: 650
                  }
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Batch Number</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price per Unit ($)</TableCell>
                      <TableCell>Supplier</TableCell>
                      <TableCell>Expiration Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.batches.map((batch) => (
                      <TableRow key={batch.batchNumber}>
                        <TableCell>
                          <TextField
                            size="small"
                            value={batch.batchNumber}
                            onChange={(e) => handleBatchEdit(batch.batchNumber, 'batchNumber', e.target.value)}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={batch.quantity}
                            onChange={(e) => handleBatchEdit(batch.batchNumber, 'quantity', e.target.value)}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={batch.pricePerUnit}
                            onChange={(e) => handleBatchEdit(batch.batchNumber, 'pricePerUnit', e.target.value)}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={batch.supplier}
                            onChange={(e) => handleBatchEdit(batch.batchNumber, 'supplier', e.target.value)}
                            sx={{ minWidth: 120 }}
                            fullWidth
                          >
                            {suppliers.map((supplier) => (
                              <MenuItem key={supplier.name} value={supplier.name}>
                                {supplier.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="date"
                            value={batch.expirationDate}
                            onChange={(e) => handleBatchEdit(batch.batchNumber, 'expirationDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveBatch(batch.batchNumber)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <TextField
                          size="small"
                          placeholder="Batch #"
                          name="batchNumber"
                          value={newBatch.batchNumber}
                          onChange={handleBatchChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          name="quantity"
                          value={newBatch.quantity}
                          onChange={handleBatchChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          name="pricePerUnit"
                          value={newBatch.pricePerUnit}
                          onChange={handleBatchChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          name="supplier"
                          value={newBatch.supplier}
                          onChange={handleBatchChange}
                          sx={{ minWidth: 120 }}
                          fullWidth
                        >
                          {suppliers.map((supplier) => (
                            <MenuItem key={supplier.name} value={supplier.name}>
                              {supplier.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="date"
                          name="expirationDate"
                          value={newBatch.expirationDate}
                          onChange={handleBatchChange}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleAddBatch}
                          disabled={!newBatch.batchNumber || !newBatch.quantity || !newBatch.pricePerUnit || !newBatch.supplier || !newBatch.expirationDate}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} startIcon={<DeleteIcon />}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!formData.name || !formData.barcode || !formData.category || !formData.unit}
          >
            {selectedItem ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Inventory; 