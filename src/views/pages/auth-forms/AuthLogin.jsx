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

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';

// Dark-themed input styles
const darkInputSx = {
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
  '& .MuiIconButton-root': {
    color: 'rgba(255, 255, 255, 0.4)',
    '&:hover': {
      color: '#8b5cf6',
    },
  },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        body: JSON.stringify(formData)
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
      
      // Store session start time for 5-hour auto-clear
      localStorage.setItem('sessionStartTime', Date.now().toString());

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
            bgcolor: 'rgba(239, 68, 68, 0.1)',
            color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            '& .MuiAlert-icon': { color: '#ef4444' },
          }}
        >
          {error}
        </Alert>
      )}
      
      <FormControl fullWidth sx={{ ...darkInputSx, mb: 2.5 }}>
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

      <FormControl fullWidth sx={{ ...darkInputSx, mb: 1.5 }}>
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
              color: '#8b5cf6',
              fontWeight: 500,
              fontSize: '0.875rem',
              '&:hover': { color: '#a78bfa' },
              transition: 'color 0.3s',
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
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </Box>
    </form>
  );
}
