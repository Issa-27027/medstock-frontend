import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  BarChart,
  LineChart,
  PieChart,
} from '@mui/x-charts';
import {
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  List as ListIcon,
  LocalPharmacy as MedicineIcon,
} from '@mui/icons-material';
import api from '../services/api';

function TabPanel({ children, value, index }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      sx={{ mt: 3 }}
    >
      {value === index && children}
    </Box>
  );
}

function Analytics() {
  const [selectedReport, setSelectedReport] = useState(0);
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [prescriptionData, setPrescriptionData] = useState([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState([]);
  const [inventoryUsageData, setInventoryUsageData] = useState([]);
  const [topPerformingItems, setTopPerformingItems] = useState([]);
  const [medicineConsumptionData, setMedicineConsumptionData] = useState({});
  const [activePatientsCount, setActivePatientsCount] = useState(0);
  const [totalPrescriptions, setTotalPrescriptions] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [monthlyCosts, setMonthlyCosts] = useState(0);

  // Fetch analytics data on component mount
  useEffect(() => {
    fetchAnalyticsData();
    fetchActivePatients();
    fetchTotalPrescriptions();
    fetchLowStockCount();
    fetchMonthlyCosts();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch prescription data
      const prescriptionResponse = await api.get('/api/reports/analytics/v2/prescriptions/');
      setPrescriptionData(prescriptionResponse.data);

      // Fetch monthly trend data
      const trendResponse = await api.get('/api/reports/analytics/v2/trends/');
      setMonthlyTrendData(trendResponse.data);

      // Fetch inventory usage data
      const inventoryResponse = await api.get('/api/reports/analytics/v2/inventory_usage/');
      setInventoryUsageData(inventoryResponse.data);

      // Fetch top performing items
      const topItemsResponse = await api.get('/api/reports/analytics/v2/top_items/');
      setTopPerformingItems(topItemsResponse.data);

      // Fetch medicine consumption data
      const consumptionResponse = await api.get('/api/reports/analytics/v2/medicine_consumption/');
      setMedicineConsumptionData(consumptionResponse.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  // Fetch active patients (status: 'BEING_TREATED')
  const fetchActivePatients = async () => {
    try {
      const response = await api.get('/api/patients/patients/');
      const activePatients = response.data.filter(patient => 
        patient.status && patient.status.toUpperCase() === 'BEING_TREATED'
      );
      setActivePatientsCount(activePatients.length);
    } catch (error) {
      console.error('Error fetching active patients:', error);
    }
  };

  // Fetch total prescriptions
  const fetchTotalPrescriptions = async () => {
    try {
      const response = await api.get('/api/prescriptions/prescriptions/');
      setTotalPrescriptions(response.data.length);
    } catch (error) {
      console.error('Error fetching total prescriptions:', error);
    }
  };

  // Fetch low stock items
  const fetchLowStockCount = async () => {
    try {
      const response = await api.get('/api/inventory/medicines/');
      let lowStock = 0;
      response.data.forEach(item => {
        // Calculate total quantity from batches
        const totalQuantity = item.batches?.reduce((total, batch) => total + (parseInt(batch.quantity) || 0), 0) || 0;
        if (totalQuantity <= (item.min_quantity || 0)) {
          lowStock++;
        }
      });
      setLowStockCount(lowStock);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
    }
  };

  // Fetch monthly costs (sum of total_amount of orders in the current month)
  const fetchMonthlyCosts = async () => {
    try {
      const response = await api.get('/api/orders/orders/');
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      let total = 0;
      response.data.forEach(order => {
        const orderDate = new Date(order.created_at || order.order_date);
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          total += parseFloat(order.total_amount) || 0;
        }
      });
      setMonthlyCosts(total);
    } catch (error) {
      console.error('Error fetching monthly costs:', error);
    }
  };

  const handleReportChange = (event, newValue) => {
    setSelectedReport(newValue);
  };

  const handleMedicineChange = (event) => {
    setSelectedMedicine(event.target.value);
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
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#64748b',
          fontSize: '1.1rem'
        }}>
          Monitor and analyze your pharmacy performance
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ 
        mb: 4,
        width: '100%',
        margin: 0,
        '& > .MuiGrid-item': {
          pl: 3,
          pr: 3,
          pb: 3,
          pt: 0,
        }
      }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ 
            p: 2, 
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#64748b' }}>Active Patients</Typography>
            <Typography variant="h4" sx={{ color: '#1e293b' }}>{activePatientsCount}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ 
            p: 2, 
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#64748b' }}>Total Prescriptions</Typography>
            <Typography variant="h4" sx={{ color: '#1e293b' }}>{totalPrescriptions}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ 
            p: 2, 
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#64748b' }}>Low Stock Items</Typography>
            <Typography variant="h4" sx={{ color: '#1e293b' }}>{lowStockCount}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ 
            p: 2, 
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#64748b' }}>Monthly Costs</Typography>
            <Typography variant="h4" sx={{ color: '#1e293b' }}>${monthlyCosts.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Reports Section */}
      <Paper sx={{ 
        p: 3,
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <Typography variant="h6" sx={{ 
          mb: 2,
          color: '#1e293b',
          fontWeight: 600
        }}>
          Reports
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={selectedReport} 
            onChange={handleReportChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                minHeight: 48,
                fontSize: '0.875rem',
              }
            }}
          >
            <Tab 
              icon={<AssessmentIcon />} 
              iconPosition="start" 
              label="Most Prescribed Medicines" 
            />
            <Tab 
              icon={<TimelineIcon />} 
              iconPosition="start" 
              label="Monthly Prescription Trends" 
            />
            <Tab 
              icon={<PieChartIcon />} 
              iconPosition="start" 
              label="Inventory Usage" 
            />
            <Tab 
              icon={<ListIcon />} 
              iconPosition="start" 
              label="Top Performing Items" 
            />
            <Tab 
              icon={<MedicineIcon />} 
              iconPosition="start" 
              label="Medicine Consumption" 
            />
          </Tabs>
        </Box>

        <TabPanel value={selectedReport} index={0}>
          <Box sx={{ height: 400 }}>
            {prescriptionData && prescriptionData.length > 0 ? (
              <BarChart
                xAxis={[{
                  data: prescriptionData.map((item) => item.name),
                  scaleType: 'band'
                }]}
                series={[{
                  data: prescriptionData.map((item) => item.value)
                }]}
                height={350}
              />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body1" color="text.secondary">No prescription data available</Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={selectedReport} index={1}>
          <Box sx={{ height: 400 }}>
            {monthlyTrendData && monthlyTrendData.length > 0 ? (
              <LineChart
                xAxis={[{
                  data: monthlyTrendData.map((item) => item.month),
                  scaleType: 'band'
                }]}
                series={[{
                  data: monthlyTrendData.map((item) => item.value)
                }]}
                height={350}
              />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body1" color="text.secondary">No trend data available</Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={selectedReport} index={2}>
          <Box sx={{ height: 400 }}>
            {inventoryUsageData && inventoryUsageData.length > 0 ? (
              <PieChart
                series={[{
                  data: inventoryUsageData.map((item) => ({
                    id: item.name,
                    value: item.value,
                    label: item.name
                  }))
                }]}
                height={350}
              />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body1" color="text.secondary">No inventory usage data available</Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={selectedReport} index={3}>
          <Box sx={{ height: 400 }}>
            {topPerformingItems && topPerformingItems.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Medicine Name</TableCell>
                      <TableCell align="right">Consumption</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topPerformingItems.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell component="th" scope="row">{item.name}</TableCell>
                        <TableCell align="right">{item.consumption}</TableCell>
                        <TableCell align="right">${item.revenue}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body1" color="text.secondary">No consumption data available</Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={selectedReport} index={4}>
          <Paper sx={{ p: 3, bgcolor: 'white' }}>
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth sx={{ maxWidth: 300 }}>
                <InputLabel id="medicine-select-label">Select Medicine</InputLabel>
                <Select
                  labelId="medicine-select-label"
                  value={selectedMedicine}
                  label="Select Medicine"
                  onChange={handleMedicineChange}
                >
                  {medicineConsumptionData && Object.keys(medicineConsumptionData).map((medicine) => (
                    <MenuItem key={medicine} value={medicine}>
                      {medicine}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {selectedMedicine ? (
                <>
                  <Typography variant="subtitle1" color="text.secondary">
                    Monthly Consumption Trend for {selectedMedicine}
                  </Typography>
                  {medicineConsumptionData[selectedMedicine] && medicineConsumptionData[selectedMedicine].length > 0 ? (
                    <LineChart
                      xAxis={[{
                        data: medicineConsumptionData[selectedMedicine].map(item => item.month),
                        scaleType: 'band'
                      }]}
                      series={[{
                        data: medicineConsumptionData[selectedMedicine].map(item => item.consumption),
                        label: 'Units Consumed',
                        color: '#3b82f6'
                      }]}
                      height={400}
                      sx={{
                        '.MuiLineElement-root': {
                          strokeWidth: 2,
                        },
                        '.MuiMarkElement-root': {
                          stroke: '#fff',
                          scale: '1.2',
                        }
                      }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                      <Typography variant="body1" color="text.secondary">No consumption data available for this medicine</Typography>
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                  <Typography variant="body1" color="text.secondary">Please select a medicine to view consumption data</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default Analytics; 