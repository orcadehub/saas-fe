import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import tenantConfig from 'config/tenantConfig';
import { useAuth } from 'contexts/AuthContext';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import { strengthColor, strengthIndicator } from 'utils/password-strength';
import PolicyDialog from 'components/PolicyDialogs';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';

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
    }
  },
  '& .MuiInputLabel-root': {
    color: '#64748b',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#7c3aed'
    }
  }
};

export default function AuthRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(false);
  const [policyType, setPolicyType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [strength, setStrength] = useState(0);
  const [level, setLevel] = useState();

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    const temp = strengthIndicator(value);
    setStrength(temp);
    setLevel(strengthColor(temp));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!checked) {
      setError('You must agree to the Terms and Conditions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!config) {
        setError('Configuration not loaded. Please refresh.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/student/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey || '',
          'x-tenant-id': config.tenantId || ''
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        return;
      }

      // Successful registration
      login({ ...data.student, token: data.token });
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack sx={{ mb: 3, alignItems: 'center', gap: 1 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            fontSize: '1.85rem',
            background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Create Account
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
          Join our learning community today
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      <FormControl fullWidth sx={{ ...lightInputSx, mb: 2.5 }}>
        <InputLabel htmlFor="outlined-adornment-name-register">Full Name</InputLabel>
        <OutlinedInput
          id="outlined-adornment-name-register"
          type="text"
          value={formData.name}
          name="name"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter your full name"
          required
        />
      </FormControl>

      <FormControl fullWidth sx={{ ...lightInputSx, mb: 2.5 }}>
        <InputLabel htmlFor="outlined-adornment-email-register">Email Address</InputLabel>
        <OutlinedInput
          id="outlined-adornment-email-register"
          type="email"
          value={formData.email}
          name="email"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter your email"
          required
        />
      </FormControl>

      <FormControl fullWidth sx={{ ...lightInputSx, mb: 1.5 }}>
        <InputLabel htmlFor="outlined-adornment-password-register">Password</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password-register"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          name="password"
          onChange={handlePasswordChange}
          placeholder="Choose a secure password"
          required
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end" size="large">
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>

      {strength !== 0 && (
        <FormControl fullWidth>
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: 85, height: 8, borderRadius: '7px', bgcolor: level?.color }} />
              <Typography variant="subtitle1" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {level?.label}
              </Typography>
            </Stack>
          </Box>
        </FormControl>
      )}

      <FormControl fullWidth sx={{ ...lightInputSx, mb: 2.5 }}>
        <InputLabel htmlFor="outlined-adornment-confirm-password">Confirm Password</InputLabel>
        <OutlinedInput
          id="outlined-adornment-confirm-password"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          name="confirmPassword"
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          required
        />
      </FormControl>

      <FormControlLabel
        control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} color="primary" />}
        label={
          <Typography variant="subtitle1" sx={{ color: '#64748b' }}>
            I agree with the{' '}
            <Typography 
              variant="subtitle1" 
              component="span" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPolicyType('terms'); }} 
              sx={{ color: '#7c3aed', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
            >
              Terms & Conditions
            </Typography>
            {' '}and{' '}
            <Typography 
              variant="subtitle1" 
              component="span" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPolicyType('privacy'); }} 
              sx={{ color: '#7c3aed', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
            >
              Privacy Policy
            </Typography>
          </Typography>
        }
      />

      <Box sx={{ mt: 3 }}>
        <AnimateButton>
          <Button
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            disabled={loading || !checked}
            sx={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              py: 1.5,
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6d28d9, #4338ca)',
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            {loading ? 'Creating Account...' : 'Sign up'}
          </Button>
        </AnimateButton>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="subtitle1" sx={{ color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: 700 }}>
            Sign In
          </Link>
        </Typography>
      </Box>

      <PolicyDialog type={policyType} open={policyType !== null} onClose={() => setPolicyType(null)} />
    </form>
  );
}

