import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';
import PublicHeader from 'components/PublicHeader';
import tenantConfig from 'config/tenantConfig';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getApiUrl = () => {
    return import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';
  };

  const getHeaders = async () => {
    const config = await tenantConfig.load();
    return {
      'Content-Type': 'application/json',
      'x-api-key': config?.apiKey || '',
      'x-tenant-id': config?.tenantId || ''
    };
  };

  const handleSendOTP = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const headers = await getHeaders();
      const response = await fetch(`${getApiUrl()}/student/forgot-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP sent to your email');
        setStep(2);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const headers = await getHeaders();
      const response = await fetch(`${getApiUrl()}/student/reset-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <PublicHeader />
      <AuthWrapper1>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
          <AuthCardWrapper>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => step === 1 ? navigate('/login') : setStep(1)}
                sx={{ mb: 2 }}
              >
                Back
              </Button>

              <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                {step === 1 ? 'Forgot Password' : 'Reset Password'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {step === 1 ? 'Enter your email to receive OTP' : 'Enter OTP and new password'}
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              {step === 1 ? (
                <Box>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 3 }}
                    disabled={loading}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSendOTP}
                    disabled={loading}
                    sx={{ py: 1.5 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Send OTP'}
                  </Button>
                </Box>
              ) : (
                <Box>
                  <TextField
                    fullWidth
                    label="OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={loading}
                    inputProps={{ maxLength: 6 }}
                  />
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    sx={{ mb: 3 }}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleResetPassword}
                    disabled={loading}
                    sx={{ py: 1.5 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                  </Button>
                </Box>
              )}
            </Box>
          </AuthCardWrapper>
        </Box>
      </AuthWrapper1>
    </Box>
  );
}
