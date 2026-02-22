import { Box, Container, Stack, Button, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useConfig from 'hooks/useConfig';
import tenantConfig from 'config/tenantConfig';
import { Login, Menu as MenuIcon } from '@mui/icons-material';

export default function PublicHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state: { borderRadius }
  } = useConfig();
  const [config, setConfig] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  const isActive = (path) => location.pathname === path;
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Pricing', path: '/pricing' }
  ];

  return (
    <Box
      sx={{
        bgcolor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            minHeight: { xs: 68, sm: 76 },
            py: { xs: 1.25, sm: 1.5 },
            gap: { xs: 1, sm: 2 }
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: 'center',
              cursor: 'pointer',
              minWidth: { sm: 190 }
            }}
            onClick={() => navigate('/')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', height: { xs: 40, sm: 48 } }}>
              {config?.logoUrl ? (
                <Box
                  component="img"
                  src={config.logoUrl}
                  alt="Logo"
                  sx={{
                    height: { xs: 42, sm: 54 },
                    maxWidth: { xs: 170, sm: 230 },
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <Typography
                  variant="h5"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800,
                    fontSize: { xs: '1.25rem', sm: '1.8rem' },
                    lineHeight: 1.1
                  }}
                >
                  {config?.tenantName || 'Orcadehub'}
                </Typography>
              )}
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              justifyContent: 'flex-end',
              flex: 1,
              display: { xs: 'none', sm: 'flex' }
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  color: isActive(item.path) ? 'primary.main' : 'text.primary',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  px: { sm: 1.5, md: 2.25 },
                  py: 1.2,
                  minWidth: 90,
                  fontWeight: 600,
                  borderBottom: isActive(item.path) ? '2px solid' : '2px solid transparent',
                  borderColor: isActive(item.path) ? 'primary.main' : 'transparent',
                  borderRadius: 0,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ ml: { xs: 'auto', sm: 0 } }}>
            <IconButton
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{ display: { xs: 'inline-flex', sm: 'none' }, mr: 1 }}
              aria-label="open navigation menu"
            >
              <MenuIcon />
            </IconButton>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              startIcon={<Login />}
              sx={{
                background: '#6a0dad',
                color: 'white',
                px: { xs: 1.75, sm: 2.75 },
                py: 1.05,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                fontWeight: 700,
                minWidth: { xs: 96, sm: 122 },
                borderRadius: `${borderRadius}px`,
                boxShadow: '0 4px 12px rgba(103, 58, 183, 0.3)',
                display: { xs: 'none', sm: 'inline-flex' },
                '&:hover': {
                  background: '#570b8c',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(106, 13, 173, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Login
            </Button>
          </Box>
        </Stack>
      </Container>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            minWidth: 190,
            boxShadow: '0 10px 28px rgba(0,0,0,0.12)'
          }
        }}
      >
        {navItems.map((item) => (
          <MenuItem
            key={item.path}
            selected={isActive(item.path)}
            onClick={() => {
              navigate(item.path);
              setMenuAnchor(null);
            }}
            sx={{ fontWeight: 600 }}
          >
            {item.label}
          </MenuItem>
        ))}
        <MenuItem
          onClick={() => {
            navigate('/login');
            setMenuAnchor(null);
          }}
          sx={{ fontWeight: 700, color: 'primary.main' }}
        >
          Login
        </MenuItem>
      </Menu>
    </Box>
  );
}
