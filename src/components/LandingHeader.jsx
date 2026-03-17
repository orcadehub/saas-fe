import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Stack, Typography, Button, IconButton } from '@mui/material';
import { AutoAwesomeRounded, Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import tenantConfig from 'config/tenantConfig';

export default function LandingHeader() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  return (
    <Box component="nav" sx={{
      position: 'fixed', top: 0, width: '100%', zIndex: 100,
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      background: 'rgba(10, 10, 15, 0.7)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
    }}>
      <Container maxWidth="xl">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5 }}>
          {/* Logo */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            {config?.logoUrl ? (
              <Box
                component="img"
                src={config.logoUrl}
                alt="Logo"
                sx={{ height: 40, objectFit: 'contain', filter: 'brightness(1.1)', borderRadius: '10px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <Typography variant="h5" sx={{
                fontWeight: 800, letterSpacing: '-0.5px',
                display: 'flex', alignItems: 'center', gap: 1,
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                <AutoAwesomeRounded sx={{ color: '#8b5cf6' }} />
                {config?.tenantName || 'ORCADEHUB'}
              </Typography>
            )}
          </Stack>

          {/* Desktop Nav */}
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {[{ label: 'Home', path: '/' }, { label: 'Services', path: '/services' }, { label: 'Pricing', path: '/pricing' }].map((item) => (
              <Button
                key={item.path}
                variant="text"
                onClick={() => navigate(item.path)}
                className="interactive"
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.05)' },
                  textTransform: 'none', fontSize: '0.95rem', fontWeight: 500, px: 2,
                  transition: 'all 0.3s',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          {/* Login Button & Mobile Toggle */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              onClick={() => navigate('/login')}
              className="interactive"
              sx={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: '#ffffff',
                borderRadius: '100px',
                px: 3.5,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
                display: { xs: 'none', md: 'flex' },
                '&:hover': {
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
                },
                transition: 'all 0.3s',
              }}
            >
              Login
            </Button>
            <IconButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#fff' }}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Stack>
        </Stack>
      </Container>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column', px: 3, pb: 3, gap: 1,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              {[{ label: 'Home', path: '/' }, { label: 'Services', path: '/services' }, { label: 'Pricing', path: '/pricing' }].map((item) => (
                <Button
                  key={item.path}
                  onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                  sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', justifyContent: 'flex-start', fontWeight: 500 }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                sx={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: '#fff', borderRadius: '12px', mt: 1,
                  textTransform: 'none', fontWeight: 600,
                }}
              >
                Login
              </Button>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
