import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import tenantConfig from 'config/tenantConfig';
import { useDashboard } from 'contexts/DashboardContext';
import { useAssessments } from 'contexts/AssessmentsContext';
import { useAuth } from 'contexts/AuthContext';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';

// Light-themed input styles
const lightInputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#1e293b',
    borderRadius: '14px',
    background: 'rgba(0, 0, 0, 0.02)',
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.08)',
      transition: 'border-color 0.3s'
    },
    '&:hover fieldset': {
      borderColor: 'rgba(124, 58, 237, 0.3)'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#7c3aed',
      borderWidth: '1.5px',
      boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)'
    },
    '& input': {
      color: '#1e293b',
      '&::placeholder': {
        color: '#94a3b8',
        opacity: 1
      },
      '&:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 100px #ffffff inset',
        WebkitTextFillColor: '#1e293b',
        borderRadius: '14px'
      }
    }
  },
  '& .MuiInputLabel-root': {
    color: '#64748b',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#7c3aed'
    }
  },
  '& .MuiIconButton-root': {
    color: '#94a3b8',
    '&:hover': {
      color: '#7c3aed'
    }
  }
};

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);
  const navigate = useNavigate();
  const { fetchDashboardData, fetchLeaderboardData } = useDashboard();
  const { refreshAssessments } = useAssessments();
  const { login } = useAuth();

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e, customData = null) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    const loginData = customData || formData;

    try {
      if (!config) {
        setError('Configuration not loaded. Please refresh the page.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/student/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey || '',
          'x-tenant-id': config.tenantId || ''
        },
        body: JSON.stringify(loginData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid email or password');
        } else {
          setError('Login failed. Please try again.');
        }
        return;
      }

      const data = await response.json();
      const { token, student } = data;

      // Update AuthContext
      login({ ...student, token });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: '12px',
            bgcolor: 'rgba(239, 68, 68, 0.05)',
            color: '#dc2626',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            fontWeight: 500,
            '& .MuiAlert-icon': { color: '#dc2626' }
          }}
        >
          {error}
        </Alert>
      )}

      <FormControl fullWidth sx={{ ...lightInputSx, mb: 2.5 }}>
        <InputLabel htmlFor="outlined-adornment-email-login">Email Address</InputLabel>
        <OutlinedInput
          id="outlined-adornment-email-login"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          name="email"
          placeholder="Enter your email"
          autoComplete="email"
          required
          label="Email Address"
        />
      </FormControl>

      <FormControl fullWidth sx={{ ...lightInputSx, mb: 1.5 }}>
        <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password-login"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          name="password"
          autoComplete="current-password"
          required
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="large"
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
          label="Password"
        />
      </FormControl>

      <Grid container sx={{ alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}>
        <Grid>
          <Typography
            variant="subtitle1"
            component={Link}
            to="/forgot-password"
            sx={{
              textDecoration: 'none',
              color: '#7c3aed',
              fontWeight: 600,
              fontSize: '0.875rem',
              '&:hover': { color: '#6d28d9' },
              transition: 'color 0.3s'
            }}
          >
            Forgot Password?
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={loading}
          className="interactive"
          sx={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            color: '#fff',
            py: 1.5,
            borderRadius: '14px',
            fontWeight: 700,
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #6d28d9, #4338ca)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 30px rgba(124, 58, 237, 0.3)'
            },
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </Box>

      <Box sx={{ mt: 2, position: 'relative' }}>
        <Divider sx={{ mb: 2, '&::before, &::after': { borderColor: 'rgba(0,0,0,0.06)' } }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, px: 1 }}>
            OR CONTINUE WITH
          </Typography>
        </Divider>
        <Button
          fullWidth
          size="large"
          variant="outlined"
          onClick={() => {
            setFormData({ email: 'test@test.com', password: 'password' });
            // Small delay to ensure state update before submit if I were using a ref,
            // but I'll just trigger the submit logic directly here.
            setTimeout(() => {
              const fakeEvent = { preventDefault: () => {} };
              handleSubmit(fakeEvent, { email: 'test@test.com', password: 'password' });
            }, 100);
          }}
          sx={{
            py: 1.5,
            borderRadius: '14px',
            borderColor: 'rgba(124, 58, 237, 0.2)',
            color: '#7c3aed',
            fontWeight: 700,
            fontSize: '1rem',
            textTransform: 'none',
            '&:hover': {
              background: 'rgba(124, 58, 237, 0.04)',
              borderColor: '#7c3aed'
            },
            transition: 'all 0.3s'
          }}
        >
          Login as Test User
        </Button>
      </Box>
    </form>
  );
}
