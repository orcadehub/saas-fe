import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Stack, Typography, Button } from '@mui/material';
import { AutoAwesomeRounded } from '@mui/icons-material';
import tenantConfig from 'config/tenantConfig';

export default function LandingHeader() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  return (
    <Box component="nav" sx={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)' }}>
      <Container maxWidth="xl">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5 }}>
          
          {/* Logo Section */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            {config?.logoUrl ? (
              <Box
                component="img"
                src={config.logoUrl}
                alt="Logo"
                sx={{ height: 40, objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                <AutoAwesomeRounded sx={{ color: '#6a0dad' }} />
                {config?.tenantName || 'ORCADEHUB'}
              </Typography>
            )}
          </Stack>

          {/* Navigation Links */}
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {[{ label: 'Home', path: '/' }, { label: 'Services', path: '/services' }, { label: 'Pricing', path: '/pricing' }].map((item) => (
              <Button 
                key={item.path}
                variant="text" 
                onClick={() => navigate(item.path)}
                sx={{ color: '#475569', '&:hover': { color: '#0f172a', background: 'rgba(0,0,0,0.04)' }, textTransform: 'none', fontSize: '0.95rem', fontWeight: 600, px: 2 }}
                className="interactive"
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          {/* Login Button */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Button 
              onClick={() => navigate('/login')}
              sx={{ 
                background: '#1e293b', 
                color: '#ffffff', 
                borderRadius: '100px', 
                px: 3.5, 
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)',
                '&:hover': { background: '#0f172a', transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(30, 41, 59, 0.3)' },
                transition: 'all 0.2s'
              }}
              className="interactive"
            >
              Login
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
