import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Typography, Button, TextField, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import LandingHeader from 'components/LandingHeader';
import tenantConfig from 'config/tenantConfig';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';

// ── Animated Grid Background ──
const AnimatedGridBackground = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#0a0a0f' }} />
    <Box sx={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
      animation: 'gridMove 20s linear infinite',
    }} />
    <Box sx={{
      position: 'absolute', top: '-15%', left: '-10%',
      width: '70vw', height: '70vw',
      background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)',
      borderRadius: '50%', filter: 'blur(80px)',
      animation: 'floatOrb1 18s ease-in-out infinite alternate',
    }} />
    <Box sx={{
      position: 'absolute', bottom: '-20%', right: '-15%',
      width: '60vw', height: '60vw',
      background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)',
      borderRadius: '50%', filter: 'blur(100px)',
      animation: 'floatOrb2 22s ease-in-out infinite alternate',
    }} />
    <Box sx={{
      position: 'absolute', inset: 0, opacity: 0.03,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    }} />
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes gridMove { 0% { transform: translate(0, 0); } 100% { transform: translate(60px, 60px); } }
      @keyframes floatOrb1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(8%, 12%) scale(1.15); } }
      @keyframes floatOrb2 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-10%, -8%) scale(1.1); } }
    ` }} />
  </Box>
);

// ── Interactive Cursor ──
const InteractiveCursor = () => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    const handleMouseOver = (e) => {
      setIsHovering(!!(e.target.closest('button') || e.target.closest('a') || e.target.closest('.interactive')));
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
        position: 'fixed', top: 0, left: 0, width: 32, height: 32,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      animate={{ x: mousePos.x - 16, y: mousePos.y - 16, scale: isHovering ? 2.5 : 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
    >
      <Box sx={{
        width: '8px', height: '8px',
        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
        borderRadius: '50%',
        boxShadow: '0 0 20px 4px rgba(139,92,246,0.5), 0 0 40px 8px rgba(6,182,212,0.2)',
        opacity: 0.8,
      }} />
    </motion.div>
  );
};

// Dark themed TextField styles
const darkTextFieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#e2e8f0',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(10px)',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.08)',
      transition: 'border-color 0.3s',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(139, 92, 246, 0.3)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#8b5cf6',
      borderWidth: '1.5px',
      boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
    },
    '& input': {
      color: '#e2e8f0',
      '&::placeholder': {
        color: 'rgba(255, 255, 255, 0.25)',
        opacity: 1,
      },
      '&:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 100px rgba(15, 15, 25, 0.95) inset',
        WebkitTextFillColor: '#e2e8f0',
        borderRadius: '14px',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.4)',
    '&.Mui-focused': {
      color: '#8b5cf6',
    },
  },
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
    <Box sx={{ height: '100vh', bgcolor: '#0a0a0f', overflow: 'hidden', position: 'relative' }}>
      <AnimatedGridBackground />
      <InteractiveCursor />
      <LandingHeader />

      <Stack
        sx={{
          minHeight: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 2, sm: 3 },
          position: 'relative',
          zIndex: 10,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Box sx={{
            width: { xs: '100%', sm: 560 },
            maxWidth: '100%',
            p: { xs: 3, sm: 5 },
            borderRadius: '28px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #8b5cf6, #06b6d4, transparent)',
              opacity: 0.6,
            },
          }}>
            <Stack spacing={3}>
              {/* Heading */}
              <Stack spacing={1} alignItems="center">
                <Typography variant="h2" sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {step === 1 ? 'Forgot Password' : 'Reset Password'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                  {step === 1 ? 'Enter your email to receive OTP' : 'Enter OTP and new password'}
                </Typography>
              </Stack>

              {/* Alerts */}
              {error && (
                <Alert severity="error" sx={{
                  borderRadius: '12px',
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  '& .MuiAlert-icon': { color: '#ef4444' },
                }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{
                  borderRadius: '12px',
                  bgcolor: 'rgba(34, 197, 94, 0.1)',
                  color: '#86efac',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  '& .MuiAlert-icon': { color: '#22c55e' },
                }}>
                  {success}
                </Alert>
              )}

              {/* Step 1: Email */}
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
                      sx={darkTextFieldSx}
                    />
                    <Button
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      className="interactive"
                      sx={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                        color: '#fff',
                        py: 1.5,
                        borderRadius: '14px',
                        fontWeight: 700,
                        fontSize: '1rem',
                        textTransform: 'none',
                        boxShadow: '0 8px 30px rgba(139, 92, 246, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 40px rgba(139, 92, 246, 0.4)',
                        },
                        '&:disabled': {
                          background: 'rgba(139, 92, 246, 0.3)',
                          color: 'rgba(255,255,255,0.5)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => navigate('/login')}
                      sx={{
                        color: 'rgba(255,255,255,0.4)',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': { color: '#8b5cf6', background: 'rgba(139,92,246,0.05)' },
                        transition: 'all 0.3s',
                      }}
                    >
                      Back to Login
                    </Button>
                  </Stack>
                </form>
              ) : (
                /* Step 2: OTP + New Password */
                <form onSubmit={handleResetPassword}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      inputProps={{ maxLength: 6 }}
                      sx={darkTextFieldSx}
                    />
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      sx={darkTextFieldSx}
                    />
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      sx={darkTextFieldSx}
                    />
                    <Button
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      className="interactive"
                      sx={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                        color: '#fff',
                        py: 1.5,
                        borderRadius: '14px',
                        fontWeight: 700,
                        fontSize: '1rem',
                        textTransform: 'none',
                        boxShadow: '0 8px 30px rgba(139, 92, 246, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 40px rgba(139, 92, 246, 0.4)',
                        },
                        '&:disabled': {
                          background: 'rgba(139, 92, 246, 0.3)',
                          color: 'rgba(255,255,255,0.5)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => setStep(1)}
                      sx={{
                        color: 'rgba(255,255,255,0.4)',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': { color: '#8b5cf6', background: 'rgba(139,92,246,0.05)' },
                        transition: 'all 0.3s',
                      }}
                    >
                      Resend OTP
                    </Button>
                  </Stack>
                </form>
              )}
            </Stack>
          </Box>
        </motion.div>

        {/* Footer */}
        <Box sx={{ position: 'absolute', bottom: { xs: 12, sm: 20 }, left: 0, right: 0, textAlign: 'center' }}>
          <Typography
            variant="subtitle2"
            component="a"
            href="https://orcadehub.com"
            target="_blank"
            sx={{
              color: 'rgba(255,255,255,0.25)',
              textDecoration: 'none',
              '&:hover': { color: '#8b5cf6' },
              transition: 'color 0.3s',
            }}
          >
            Orcadehub Innovations LLP
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
