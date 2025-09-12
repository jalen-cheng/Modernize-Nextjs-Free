"use client";
import { useState, useEffect } from "react";
import { Grid, Box, Card, Typography, TextField, Button, Alert, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
// components
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import { authHelpers } from "@/app/lib/supabase";

const Login2 = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pharmacyCode, setPharmacyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPharmacyStep, setShowPharmacyStep] = useState(false);
  const router = useRouter();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let result;
      if (mode === 'signup') {
        console.log('Attempting signup for:', email);
        result = await authHelpers.signUp(email, password);
        console.log('Signup result:', result);
        if (result.error) {
          setError(`Signup failed: ${result.error.message}`);
        } else {
          setSuccess('Account created! Please sign in.');
          setMode('login');
        }
      } else {
        console.log('Attempting login for:', email);
        result = await authHelpers.signIn(email, password);
        console.log('Login result:', result);
        if (result.error) {
          if (result.error.message.includes('Email not confirmed')) {
            setError('Please check your email and click the confirmation link before signing in.');
          } else if (result.error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. If you just signed up, please check your email for a confirmation link first.');
          } else {
            setError(`Login failed: ${result.error.message}`);
          }
        } else if (result.data.user) {
          setSuccess('Signed in successfully! Please enter pharmacy code.');
          setShowPharmacyStep(true);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(`Authentication failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePharmacyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate pharmacy code via API
      const response = await fetch('/api/validate-pharmacy-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pharmacyCode }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.valid) {
        // Store pharmacy access in localStorage for client-side checks
        localStorage.setItem('pharmacyAccess', 'true');
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        setError(result.error || 'Invalid pharmacy code. Please contact your administrator.');
      }
    } catch (err: any) {
      setError('Pharmacy code validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Login" description="MedMe Assistant Login">
      <Box
        sx={{
          position: "relative",
          "&:before": {
            content: '""',
            background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
            backgroundSize: "400% 400%",
            animation: "gradient 15s ease infinite",
            position: "absolute",
            height: "100%",
            width: "100%",
            opacity: "0.3",
          },
        }}
      >
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
            <Card
              elevation={9}
              sx={{ p: 4, zIndex: 1, width: "100%", maxWidth: "500px" }}
            >
              <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
                <Logo />
              </Box>

              <Typography variant="h4" textAlign="center" mb={1}>
                MedMe Assistant
              </Typography>
              
              <Typography variant="subtitle1" textAlign="center" color="textSecondary" mb={3}>
                {!showPharmacyStep && (mode === 'login' ? 'Sign in to your account' : 'Create a new account')}
                {showPharmacyStep && 'Enter your pharmacy access code'}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              {!showPharmacyStep && (
                <Box component="form" onSubmit={handleAuthSubmit}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                    autoComplete="email"
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{ py: 1.5, mb: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                  </Button>
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  >
                    {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                  </Button>
                </Box>
              )}

              {showPharmacyStep && (
                <Box component="form" onSubmit={handlePharmacyCodeSubmit}>
                  <TextField
                    fullWidth
                    label="Pharmacy Code"
                    value={pharmacyCode}
                    onChange={(e) => setPharmacyCode(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                    helperText="Use: MEDME2024"
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{ py: 1.5 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Access Dashboard'}
                  </Button>
                </Box>
              )}

            </Card>
        </Box>
      </Box>
    </PageContainer>
  );
};
export default Login2;
