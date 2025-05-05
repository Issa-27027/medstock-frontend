import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemText,
  useTheme,
  Grid,
  MenuItem,
  InputAdornment,
  FormControl,
  Select,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Cancel as CancelIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

function Orders() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });
  const [formData, setFormData] = useState({
    status: 'Pending',
    supplierName: '',
    supplierRating: '',
    supplierContact: '',
    supplierAddress: '',
    items: [],
    totalOrderValue: 0,
    notes: ''
  });
  const [orderItems, setOrderItems] = useState([]);
  const emptyFormData = {
    status: 'pending',
    supplierName: '',
    supplierRating: '',
    supplierContact: '',
    supplierAddress: '',
    notes: '',
    items: []
  };
  const location = useLocation();

  useEffect(() => {
    // Check if we should open the dialog on mount
    if (location.state?.openNewOrderDialog) {
      setOpenDialog(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, []);

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/orders/orders/');
      console.log('API response:', response.data);
      
      // Check if response is an array before mapping
      if (Array.isArray(response.data)) {
        const formattedOrders = response.data.map(order => ({
          id: order.id,
          orderDate: order.order_date,
          status: order.status || 'pending',
          supplier: {
            name: order.supplier?.name || 'Unknown Supplier',
            rating: order.supplier?.rating || 'N/A'
          },
          supplierContact: order.supplier?.phone || '',
          supplierAddress: order.supplier?.address || '',
          items: Array.isArray(order.items) ? order.items.map(item => ({
            id: item.id || item.medicine_id,
            medicineId: item.medicine_id,
            name: item.medicine_name || 'Unknown Item',
            quantity: item.quantity || 0,
            price: item.price || 0,
            unit: item.unit || 'tablets'
          })) : [],
          totalPrice: order.total_amount || 0,
          notes: order.notes || ''
        }));
        console.log('Formatted orders data:', formattedOrders);
        setOrders(formattedOrders);
      } else {
        // Handle case where response is not an array
        console.error('Expected array response, got:', typeof response.data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again later.');
      setOrders([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedOrders = () => {
    if (!Array.isArray(orders)) return [];
    if (!sortConfig.key) return orders;

    return [...orders].sort((a, b) => {
      if (!a || !b) return 0;
      
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc'
          ? new Date(a.orderDate) - new Date(b.orderDate)
          : new Date(b.orderDate) - new Date(a.orderDate);
      }
      if (sortConfig.key === 'id') {
        return sortConfig.direction === 'asc'
          ? a.id - b.id
          : b.id - a.id;
      }
      if (sortConfig.key === 'supplierName') {
        const aName = a.supplier?.name || '';
        const bName = b.supplier?.name || '';
        return sortConfig.direction === 'asc'
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }
      if (sortConfig.key === 'totalPrice') {
        const aPrice = a.totalPrice || 0;
        const bPrice = b.totalPrice || 0;
        return sortConfig.direction === 'asc'
          ? aPrice - bPrice
          : bPrice - aPrice;
      }
      if (sortConfig.key === 'status') {
        const statusOrder = { 'complete': 0, 'pending': 1, 'terminated': 2 };
        const aStatus = statusOrder[a.status] || 0;
        const bStatus = statusOrder[b.status] || 0;
        return sortConfig.direction === 'asc'
          ? aStatus - bStatus
          : bStatus - aStatus;
      }
      return 0;
    });
  };

  const handleCancelOrder = (orderId) => {
    setOrders(orders.map(order => 
      order.id === orderId
        ? { ...order, status: 'terminated' }
        : order
    ));
  };

  const handleAddToOrder = (orderId) => {
    // Redirect to restock page
    navigate('/restock');
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'complete':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'terminated':
        return '#f44336';
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  const handleOpenDialog = () => {
    setSelectedOrder(null);
    // Ensure the date is properly formatted when initializing
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setFormData({
      ...emptyFormData,
      orderDate: formattedDate
    });
    setOrderItems([]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, {
      id: Date.now(),
      name: '',
      unit: 'tablets',
      quantity: 0,
      price: 0
    }]);
  };

  const handleRemoveItem = (itemId) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const handleItemChange = (itemId, field, value) => {
    setOrderItems(orderItems.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotalPrice = () => {
    return orderItems.reduce((total, item) => 
      total + (item.quantity * item.price), 0
    );
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.supplierName) {
      setError('Please select a supplier');
      return;
    }
    if (orderItems.length === 0) {
      setError('Please add at least one item to the order');
      return;
    }
    // Validate each item
    for (const item of orderItems) {
      if (!item.name || item.name.trim() === '') {
        setError('Please enter a drug name for all items.');
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        setError('Please enter a valid quantity (> 0) for all items.');
        return;
      }
      if (!item.price || item.price <= 0) {
        setError('Please enter a valid price (> 0) for all items.');
        return;
      }
    }

    try {
      const currentDate = new Date().toISOString().split('T')[0];

      // Build the payload with all form data and items
      const payload = {
        status: formData.status,
        supplier_name: formData.supplierName,
        supplier_rating: formData.supplierRating, // Only include if backend uses it
        supplier_contact: formData.supplierContact,
        supplier_address: formData.supplierAddress,
        notes: formData.notes,
        total_amount: calculateTotalPrice(),
        order_date: currentDate,
        order_number: selectedOrder ? undefined : `ORD-${Date.now()}`,
        items: orderItems.map(item => ({
          medicine_name: item.name,
          unit: item.unit,
          quantity: Number(item.quantity),
          price: Number(item.price)
        }))
      };

      // Remove undefined fields (like order_number for updates)
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      console.log('Sending order payload:', payload);

      let response;
      if (selectedOrder) {
        response = await api.put(`/api/orders/orders/${selectedOrder.id}/`, payload);
        await fetchOrders();
      } else {
        response = await api.post('/api/orders/orders/', payload);
        await fetchOrders();
      }

      setOpenDialog(false);
      setFormData(emptyFormData);
      setOrderItems([]);
    } catch (error) {
      console.error('Error submitting order:', error);
      setError('Failed to save order. Please try again.');
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setFormData({
      orderDate: order.orderDate,
      status: order.status,
      supplierName: order.supplier.name,
      supplierRating: order.supplier.rating,
      supplierContact: order.supplierContact || '',
      supplierAddress: order.supplierAddress || '',
      notes: order.notes || ''
    });
    // Set the order items correctly
    setOrderItems(order.items.map(item => ({
      id: item.id || Date.now(),
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      unit: item.unit || 'tablets'
    })));
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/orders/orders/${id}/`);
      setOrders(prev => prev.filter(order => order.id !== id));
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // First update the order status
      await api.patch(`/api/orders/orders/${orderId}/`, { status: newStatus });
      
      // If order is completed, update inventory
      if (newStatus.toLowerCase() === 'complete') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          // Fetch the complete order data to ensure we have all medicine IDs
          const completeOrder = await api.get(`/api/orders/orders/${orderId}/`);
          const orderData = completeOrder.data;
          
          // Prepare data for inventory adjustment
          const inventoryData = {
            source_type: 'order',
            source_id: orderId,
            items: orderData.items.map(item => ({
              medicine_id: item.medicine.id, // Use the medicine ID from the complete order data
              quantity: parseInt(item.quantity, 10),
              expiration_date: item.expirationDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 year if not specified
              cost_per_unit: parseFloat(item.price) || 0
            }))
          };
          
          try {
            console.log('Updating inventory with data:', inventoryData);
            // Call inventory adjustment endpoint
            await api.post('/api/inventory/adjust-inventory/', inventoryData);
            console.log('Inventory updated successfully from order');
            
            // Refresh inventory data
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('inventory-updated'));
            }
          } catch (error) {
            console.error('Error updating inventory:', error);
            alert('Error updating inventory. Please check the inventory manually.');
          }
        }
      }
      
      // Update UI
      setOrders(orders.map(order => 
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      ));
      
      // Refresh orders to ensure all data is in sync
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

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
        <Button variant="contained" onClick={fetchOrders}>
          Retry
        </Button>
      </Box>
    );
  }

  const filteredOrders = getSortedOrders().filter(order => {
    if (!order) return false;
    return Object.values(order).some(value => 
      String(value).toLowerCase().includes((searchTerm || '').toLowerCase())
    );
  });

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
          Orders Management
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#64748b',
          fontSize: '1.1rem'
        }}>
          Track and manage supplier orders
        </Typography>
      </Box>

      {/* Search and Add Button Section */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <TextField
          fullWidth
          placeholder="Search orders..."
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
          onClick={handleOpenDialog}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          New Order
        </Button>
      </Box>

      {/* Orders Table */}
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
              <SortableTableCell label="Date" sortKey="date" />
              <SortableTableCell label="Order ID" sortKey="id" />
              <SortableTableCell label="Supplier" sortKey="supplierName" />
              <SortableTableCell label="Total Value" sortKey="totalPrice" />
              <SortableTableCell label="Status" sortKey="status" />
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <React.Fragment key={order.id}>
                <TableRow 
                  onClick={() => setExpandedRow(expandedRow === order.id ? null : order.id)}
                  sx={{ 
                    '& > *': { borderBottom: expandedRow === order.id ? 'none' : '1px solid rgba(0,0,0,0.08)' },
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
                  <TableCell align="center">{formatDate(order.orderDate)}</TableCell>
                  <TableCell align="center">{order.id}</TableCell>
                  <TableCell align="center">{order.supplier.name}</TableCell>
                  <TableCell align="center">${order.totalPrice}</TableCell>
                  <TableCell align="center">
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                      <Select
                        value={order.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order.id, e.target.value);
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
                        <MenuItem value="complete">
                          <StatusChip status="complete" />
                        </MenuItem>
                        <MenuItem value="pending">
                          <StatusChip status="pending" />
                        </MenuItem>
                        <MenuItem value="terminated">
                          <StatusChip status="terminated" />
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
                          handleEdit(order);
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
                          handleDelete(order.id);
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
                {expandedRow === order.id && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 0, backgroundColor: '#f8fafc' }}>
                      <Box sx={{ p: 2 }}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Supplier Information
                            </Typography>
                            <List dense>
                              <ListItem>
                                <ListItemText 
                                  primary="Supplier Name"
                                  secondary={order.supplier.name}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary="Rating"
                                  secondary={order.supplier.rating}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary="Contact"
                                  secondary={order.supplierContact}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary="Address"
                                  secondary={order.supplierAddress}
                                />
                              </ListItem>
                            </List>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Order Details
                            </Typography>
                            <List dense>
                              <ListItem>
                                <ListItemText 
                                  primary="Total Value"
                                  secondary={`$${order.totalPrice}`}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary="Notes"
                                  secondary={order.notes}
                                />
                              </ListItem>
                            </List>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Order Items
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Drug Name</TableCell>
                                  <TableCell>Quantity</TableCell>
                                  <TableCell>Unit</TableCell>
                                  <TableCell>Price per Unit</TableCell>
                                  <TableCell>Total Price</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {order.items.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.unit}</TableCell>
                                    <TableCell>${(Number(item.price) || 0).toFixed(2)}</TableCell>
                                    <TableCell>${((Number(item.price) || 0) * (Number(item.quantity) || 0)).toFixed(2)}</TableCell>
                                  </TableRow>
                                ))}
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
              {selectedOrder ? 'Edit Order' : 'New Order'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Supplier Information Section */}
            <Typography variant="h6" sx={{ mb: 1 }}>Supplier Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Supplier Name"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Supplier Rating"
                  value={formData.supplierRating}
                  onChange={(e) => setFormData({ ...formData, supplierRating: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Information"
                  value={formData.supplierContact}
                  onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.supplierAddress}
                  onChange={(e) => setFormData({ ...formData, supplierAddress: e.target.value })}
                />
              </Grid>
            </Grid>

            {/* Order Details Section */}
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Order Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="complete">Complete</MenuItem>
                  <MenuItem value="terminated">Terminated</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>

            {/* Order Items Section */}
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Order Items</Typography>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
              >
                Add Item
              </Button>
            </Box>
            
            {orderItems.map((item, index) => (
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
                  onClick={() => handleRemoveItem(item.id)}
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
                    <TextField
                      fullWidth
                      label="Drug Name"
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Unit"
                      value={item.unit}
                      onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                      required
                    >
                      <MenuItem value="tablets">Tablets</MenuItem>
                      <MenuItem value="bottles">Bottles</MenuItem>
                      <MenuItem value="boxes">Boxes</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Price per Unit"
                      value={item.price}
                      onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      required
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}

            {orderItems.length > 0 && (
              <Typography variant="h6" sx={{ mt: 2 }}>
                Total Order Value: ${(Number(calculateTotalPrice()) || 0).toFixed(2)}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} startIcon={<DeleteIcon />}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!formData.supplierName}
          >
            {selectedOrder ? 'Update Order' : 'Create Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Orders; 