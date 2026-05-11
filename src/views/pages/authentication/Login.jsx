import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LandingHeader from 'components/LandingHeader';
import tenantConfig from 'config/tenantConfig';
import { motion } from 'framer-motion';
import StarryBackground from 'components/StarryBackground';
import CelestialCursor from 'components/CelestialCursor';

import Logo from 'ui-component/Logo';
import AuthLogin from '../auth-forms/AuthLogin';
import StudentTiers from 'components/StudentTiers';

export default function Login() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [config, setConfig] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Main content */}
      {/* Main content - Split Screen */}
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Left Side: Login Form */}
        <Box
          sx={{
            flex: { xs: 'none', lg: '0 0 500px', xl: '0 0 600px' },
            minHeight: { xs: '100vh', lg: 'auto' },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            px: { xs: 2, sm: 4 },
            py: 8,
            borderRight: { lg: '1px solid rgba(0,0,0,0.05)' },
            bgcolor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%', maxWidth: 480 }}
          >
            <Box
              sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: '32px',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 40px 80px rgba(0, 0, 0, 0.06)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Stack sx={{ alignItems: 'center', gap: 4 }}>
                {/* Logo */}
                <Box>
                  {config?.logoUrl ? (
                    <Box
                      component="img"
                      src={config.logoUrl}
                      alt="Logo"
                      sx={{ height: 52, maxWidth: 200, objectFit: 'contain', borderRadius: '12px' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Logo />
                  )}
                </Box>

                <Stack sx={{ alignItems: 'center', gap: 1 }}>
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
                    Welcome Back
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Enter your credentials to continue
                  </Typography>
                </Stack>

                <Box sx={{ width: 1 }}>
                  <AuthLogin />
                </Box>

                <Typography
                  variant="subtitle2"
                  component="a"
                  href="https://orcadehub.com"
                  target="_blank"
                  sx={{
                    mt: 2,
                    color: '#94a3b8',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { color: '#6366f1' },
                    transition: 'color 0.3s'
                  }}
                >
                  © {new Date().getFullYear()} Orcadehub Innovations
                </Typography>
              </Stack>
            </Box>
          </motion.div>
        </Box>

        {/* Right Side: Pricing/Tiers */}
        <Box
          sx={{
            flex: 1,
            height: { lg: '100vh' },
            overflowY: { lg: 'auto' },
            bgcolor: '#f8fafc',
            py: { xs: 8, lg: 0 },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ my: 'auto' }}>
            <StudentTiers />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
