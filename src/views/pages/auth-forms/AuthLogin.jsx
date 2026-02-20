import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import tenantConfig from 'config/tenantConfig';
import { useDashboard } from 'contexts/DashboardContext';
import { useAssessments } from 'contexts/AssessmentsContext';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const [checked, setChecked] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);
  const navigate = useNavigate();
  const { fetchDashboardData, fetchLeaderboardData } = useDashboard();
  const { refreshAssessments } = useAssessments();

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
      
      // Store token and student data in localStorage
      localStorage.setItem('studentToken', token);
      localStorage.setItem('studentData', JSON.stringify({ ...student, token }));
      
      // Fetch dashboard, leaderboard, and assessments data
      await Promise.all([
        fetchDashboardData(true),
        fetchLeaderboardData(true),
        refreshAssessments()
      ]);
      
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <CustomFormControl fullWidth>
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
          sx={{
            '&:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 100px #fff inset',
              WebkitTextFillColor: 'inherit'
            }
          }}
        />
      </CustomFormControl>

      <CustomFormControl fullWidth>
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
          sx={{
            '&:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 100px #fff inset',
              WebkitTextFillColor: 'inherit'
            }
          }}
        />
      </CustomFormControl>

      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Grid>
          <FormControlLabel
            control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />}
            label="Keep me logged in"
          />
        </Grid>
        <Grid>
          <Typography variant="subtitle1" component={Link} to="/forgot-password" sx={{ textDecoration: 'none', color: 'secondary.main' }}>
            Forgot Password?
          </Typography>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button color="secondary" fullWidth size="large" type="submit" variant="contained" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}
