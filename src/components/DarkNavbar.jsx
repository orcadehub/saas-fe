import React, { useState } from 'react';
import { Box, Container, Stack, Typography, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu as MenuIcon, Close as CloseIcon, AutoAwesomeRounded } from '@mui/icons-material';

const DarkNavbar = ({ config }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Pricing', path: '/pricing' }
  ];

  return (
    <Box component="nav" sx={{
      position: 'fixed', top: 0, width: '100%', zIndex: 100,
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
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
                sx={{
                  height: { xs: 36, md: 42 },
                  objectFit: 'contain',
                  filter: 'none',
                  borderRadius: '12px',
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <Typography variant="h5" sx={{
                fontWeight: 800, letterSpacing: '-0.5px',
                display: 'flex', alignItems: 'center', gap: 1,
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                <AutoAwesomeRounded sx={{ color: '#7c3aed' }} />
                {config?.tenantName || 'ORCADEHUB'}
              </Typography>
            )}
          </Stack>

          {/* Nav Links – Desktop */}
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="text"
                onClick={() => navigate(item.path)}
                className="interactive"
                sx={{
                  color: '#475569',
                  '&:hover': { color: '#0f172a', background: 'rgba(0,0,0,0.03)' },
                  textTransform: 'none', fontSize: '0.95rem', fontWeight: 600, px: 2,
                  transition: 'all 0.3s',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              onClick={() => navigate('/login')}
              className="interactive"
              sx={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#ffffff',
                borderRadius: '100px',
                px: 3.5,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
                display: { xs: 'none', md: 'flex' },
                '&:hover': {
                  background: 'linear-gradient(135deg, #6d28d9, #4338ca)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)',
                },
                transition: 'all 0.3s',
              }}
            >
              Login
            </Button>
            <IconButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#0f172a' }}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Stack>
        </Stack>
      </Container>

      {/* Mobile nav */}
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
              flexDirection: 'column',
              px: 3, pb: 3, gap: 1,
              borderTop: '1px solid rgba(0,0,0,0.05)',
              background: '#fff',
            }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                  sx={{ color: '#475569', textTransform: 'none', justifyContent: 'flex-start', fontWeight: 600 }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                sx={{
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
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
};


export default DarkNavbar;
