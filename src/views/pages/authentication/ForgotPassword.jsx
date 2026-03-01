import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Stack, Typography, Button, TextField, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import LandingHeader from 'components/LandingHeader';
import tenantConfig from 'config/tenantConfig';
import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';

const InteractiveCursor = () => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseOver = (e) => {
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.interactive')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 32,
        height: 32,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      animate={{
        x: mousePos.x - 16,
        y: mousePos.y - 16,
        scale: isHovering ? 2 : 1,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
    >
      <Box sx={{ 
        width: '8px', 
        height: '8px', 
        bgcolor: '#6a0dad', 
        borderRadius: '50%',
        boxShadow: '0 0 15px 2px rgba(106,13,173,0.4)',
        opacity: 0.6
      }} />
    </motion.div>
  );
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [step, setStep] = useState(1); // 1: email, 2: otp & password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!config) {
        setError('Configuration not loaded. Please refresh the page.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/student/forgot-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey || '',
          'x-tenant-id': config.tenantId || ''
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send OTP');
        return;
      }

      setSuccess('OTP sent to your email');
      setStep(2);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      if (!config) {
        setError('Configuration not loaded. Please refresh the page.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/student/reset-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey || '',
          'x-tenant-id': config.tenantId || ''
        },
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to reset password');
        return;
      }

      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', bgcolor: '#f8fafc', overflow: 'hidden', position: 'relative' }}>
      <InteractiveCursor />
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
        }}/>
        <Box sx={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(168,85,247,0.03) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
        }}/>
      </Box>

      <LandingHeader />
      <AuthWrapper1 sx={{ minHeight: 'calc(100vh - 76px)', height: 'calc(100vh - 76px)', backgroundColor: 'transparent' }}>
        <Stack sx={{ minHeight: 'calc(100vh - 76px)', justifyContent: 'center', alignItems: 'center', px: { xs: 1, sm: 2 } }}>
          <Box sx={{ width: 1, maxWidth: 540 }}>
            <AuthCardWrapper sx={{
              borderRadius: '24px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.1)',
              '& .MuiCardContent-root': { p: { xs: 3, sm: 4.5 } }
            }}>
              <Stack spacing={3}>
                <Stack spacing={1} alignItems="center">
                  <Typography variant="h2" sx={{ color: '#1e293b', fontWeight: 800, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {step === 1 ? 'Forgot Password' : 'Reset Password'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center' }}>
                    {step === 1 ? 'Enter your email to receive OTP' : 'Enter OTP and new password'}
                  </Typography>
                </Stack>

                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}

                {step === 1 ? (
                  <form onSubmit={handleSendOTP}>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Button
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{ bgcolor: '#1e293b', '&:hover': { bgcolor: '#0f172a' } }}
                      >
                        {loading ? 'Sending...' : 'Send OTP'}
                      </Button>
                      <Button
                        fullWidth
                        variant="text"
                        onClick={() => navigate('/login')}
                        sx={{ color: '#64748b' }}
                      >
                        Back to Login
                      </Button>
                    </Stack>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword}>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        inputProps={{ maxLength: 6 }}
                      />
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <Button
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{ bgcolor: '#1e293b', '&:hover': { bgcolor: '#0f172a' } }}
                      >
                        {loading ? 'Resetting...' : 'Reset Password'}
                      </Button>
                      <Button
                        fullWidth
                        variant="text"
                        onClick={() => setStep(1)}
                        sx={{ color: '#64748b' }}
                      >
                        Resend OTP
                      </Button>
                    </Stack>
                  </form>
                )}
              </Stack>
            </AuthCardWrapper>
          </Box>
        </Stack>
      </AuthWrapper1>
    </Box>
  );
}
