'use client'
import { useState, useEffect } from 'react';
import { 
  Grid, 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { Phone, Add, Refresh } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { supabase, authHelpers } from '@/app/lib/supabase';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import { PatientSchema } from '@/app/lib/schema';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone_e164: string;
  email?: string | null;
  security_question?: string | null;
  security_answer?: string | null;
  created_at: string;
}

interface CallLog {
  id: string;
  patient_id: string;
  call_job_id?: string;
  started_at: string;
  ended_at?: string;
  status: string;
  available_on_scheduled_date?: boolean;
  delivery_window?: string;
  med_change?: string;
  shipment_feedback?: any;
  free_text_notes?: string;
  transcript?: any;
  model_raw?: any;
  meta?: any;
}

const Dashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({ 
    first_name: '', 
    last_name: '', 
    phone_e164: '', 
    email: '', 
    security_question: 'What is your last name?', 
    security_answer: '' 
  });
  const [error, setError] = useState('');
  const [calling, setCalling] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const pharmacyAccess = localStorage.getItem('pharmacyAccess');
      
      if (user && pharmacyAccess === 'true') {
        setIsAuthenticated(true);
        loadData();
      } else {
        router.push('/authentication/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/authentication/login');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await authHelpers.signOut();
    localStorage.removeItem('pharmacyAccess');
    router.push('/authentication/login');
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Try to load patients from database
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (patientsError) {
        console.log('Database error:', patientsError.message);
        // Use demo data if database tables don't exist
        setPatients([
          {
            id: '1',
            first_name: 'John',
            last_name: 'Doe',
            phone_e164: '+1234567890',
            created_at: '2024-01-15T10:00:00Z'
          },
          {
            id: '2', 
            first_name: 'Jane',
            last_name: 'Smith',
            phone_e164: '+1234567891',
            created_at: '2024-01-10T10:00:00Z'
          },
          {
            id: '3',
            first_name: 'Bob',
            last_name: 'Wilson',
            phone_e164: '+1234567892',
            created_at: '2024-01-08T10:00:00Z'
          }
        ]);
        setError('Using demo data - connect your Supabase database to see real data');
      } else {
        setPatients(patientsData || []);
      }

      // Try to load call logs
      const { data: callLogsData, error: callLogsError } = await supabase
        .from('call_log')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (callLogsError) {
        console.log('Call logs error:', callLogsError.message);
        // Use demo call logs
        setCallLogs([
          {
            id: '1',
            patient_id: '1',
            status: 'completed' as const,
            started_at: '2024-01-15T10:00:00Z',
            ended_at: '2024-01-15T10:05:00Z',
            available_on_scheduled_date: true,
            delivery_window: 'Morning (9-12 PM)',
            med_change: 'None',
            shipment_feedback: { rating: 5, comments: 'Satisfied with delivery' },
            free_text_notes: 'Patient confirmed medication pickup and adherence'
          },
          {
            id: '2',
            patient_id: '2',
            status: 'completed' as const,
            started_at: '2024-01-10T14:30:00Z',
            ended_at: '2024-01-10T14:35:00Z',
            available_on_scheduled_date: false,
            delivery_window: 'Afternoon (1-5 PM)',
            med_change: 'Dosage increased',
            shipment_feedback: { rating: 3, comments: 'Delivery was late' },
            free_text_notes: 'Patient requested earlier delivery window'
          }
        ]);
      } else {
        setCallLogs(callLogsData || []);
      }
    } catch (err: any) {
      console.error('Load data error:', err);
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async () => {
    try {
      console.log('Adding patient:', newPatient);
      
      // Basic validation
      if (!newPatient.first_name || !newPatient.last_name || !newPatient.phone_e164 || !newPatient.security_answer) {
        setError('Please fill in all required fields');
        return;
      }

      // Use API route instead of direct Supabase call
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: newPatient.first_name,
          last_name: newPatient.last_name,
          phone_e164: newPatient.phone_e164,
          email: newPatient.email || null,
          security_question: newPatient.security_question,
          security_answer: newPatient.security_answer
        })
      });

      const result = await response.json();
      console.log('API result:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add patient');
      }

      console.log('Patient added successfully:', result.data);
      setNewPatient({ 
        first_name: '', 
        last_name: '', 
        phone_e164: '', 
        email: '', 
        security_question: 'What is your last name?', 
        security_answer: '' 
      });
      setAddPatientOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Add patient error:', err);
      setError(err.message || 'Failed to add patient');
    }
  };

  const handleCallPatient = async (patientId: string) => {
    setCalling(patientId);
    try {
      const response = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh call logs after initiating call
        setTimeout(loadData, 2000);
      } else {
        setError(result.error || 'Failed to initiate call');
      }
    } catch (err: any) {
      setError('Failed to initiate call');
    } finally {
      setCalling(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'abandoned': return 'warning';
      case 'active': return 'primary';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  if (authLoading) {
    return (
      <PageContainer title="Loading..." description="Loading MedMe Assistant">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <PageContainer title="MedMe Assistant Dashboard" description="Pharmacy Voice Assistant Dashboard">
      <Box>
        {/* Header with Logout */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">MedMe Assistant Dashboard</Typography>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">Total Patients</Typography>
                <Typography variant="h3">{patients.length}</Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">Total Patients</Typography>
                <Typography variant="h3">{patients.length}</Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" color="info.main">Completed Calls</Typography>
                <Typography variant="h3">{callLogs.filter(c => c.status === 'completed').length}</Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">Recent Calls</Typography>
                <Typography variant="h3">{callLogs.length}</Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Main Content - Patient Management and Call Logs Side by Side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
            {/* Patients Management */}
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5">Patient Management</Typography>
                  <Box>
                    <IconButton onClick={loadData} disabled={loading}>
                      <Refresh />
                    </IconButton>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setAddPatientOpen(true)}
                      sx={{ ml: 1 }}
                    >
                      Add Patient
                    </Button>
                  </Box>
                </Box>

                {loading ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Medication</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {patients.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell>{patient.first_name} {patient.last_name}</TableCell>
                            <TableCell>{patient.phone_e164}</TableCell>
                            <TableCell>{new Date(patient.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={calling === patient.id ? <CircularProgress size={16} /> : <Phone />}
                                onClick={() => handleCallPatient(patient.id)}
                                disabled={calling === patient.id}
                              >
                                {calling === patient.id ? 'Calling...' : 'Call'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            {/* Recent Call Logs */}
            <Card>
              <CardContent>
                <Typography variant="h5" mb={2}>Recent Call Logs</Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Patient ID</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Available</TableCell>
                        <TableCell>Window</TableCell>
                        <TableCell>Notes</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {callLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.patient_id}</TableCell>
                          <TableCell>
                            <Chip 
                              label={log.status} 
                              color={getStatusColor(log.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {log.available_on_scheduled_date !== null ? 
                              (log.available_on_scheduled_date ? 'Yes' : 'No') : 'N/A'}
                          </TableCell>
                          <TableCell>{log.delivery_window || 'N/A'}</TableCell>
                          <TableCell sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {log.free_text_notes || 'N/A'}
                          </TableCell>
                          <TableCell>{new Date(log.started_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Add Patient Dialog */}
        <Dialog open={addPatientOpen} onClose={() => setAddPatientOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="First Name"
              value={newPatient.first_name}
              onChange={(e) => setNewPatient({ ...newPatient, first_name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Last Name"
              value={newPatient.last_name}
              onChange={(e) => setNewPatient({ ...newPatient, last_name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone Number (E164 Format)"
              value={newPatient.phone_e164}
              onChange={(e) => setNewPatient({ ...newPatient, phone_e164: e.target.value })}
              margin="normal"
              helperText="Format: +1234567890"
            />
            <TextField
              fullWidth
              label="Email (Optional)"
              value={newPatient.email}
              onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
              margin="normal"
              type="email"
            />
            <TextField
              fullWidth
              label="Security Question"
              value={newPatient.security_question}
              onChange={(e) => setNewPatient({ ...newPatient, security_question: e.target.value })}
              margin="normal"
              helperText="Question used for identity verification during calls"
            />
            <TextField
              fullWidth
              label="Security Answer"
              value={newPatient.security_answer}
              onChange={(e) => setNewPatient({ ...newPatient, security_answer: e.target.value })}
              margin="normal"
              required
              helperText="Answer to the security question (required)"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddPatientOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPatient} variant="contained">Add Patient</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
}

export default Dashboard;
