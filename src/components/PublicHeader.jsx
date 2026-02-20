import { Box, Container, Stack, Button, Typography, Chip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useConfig from 'hooks/useConfig';
import tenantConfig from 'config/tenantConfig';
import { Login } from '@mui/icons-material';

export default function PublicHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: { borderRadius } } = useConfig();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  const isActive = (path) => location.pathname === path;

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
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: 2
          }}
        >
          <Stack 
            direction="row" 
            spacing={1.5} 
            sx={{ 
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            {config?.logoUrl ? (
              <Box 
                component="img"
                src={config.logoUrl}
                alt="Logo"
                sx={{ 
                  height: { xs: 36, sm: 44 }, 
                  maxWidth: { xs: 130, sm: 170 }, 
                  objectFit: 'contain'
                }}
                onError={(e) => { e.target.style.display = 'none' }}
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
                  fontSize: { xs: '1.15rem', sm: '1.5rem' }
                }}
              >
                {config?.tenantName || 'Orcadehub'}
              </Typography>
            )}
          </Stack>

          <Stack 
            direction="row" 
            spacing={{ xs: 1, sm: 2 }} 
            sx={{ alignItems: 'center' }}
          >
            <Button 
              onClick={() => navigate('/')} 
              sx={{ 
                color: isActive('/') ? 'primary.main' : 'text.primary',
                textTransform: 'none', 
                fontSize: '0.95rem', 
                px: 2,
                fontWeight: 600,
                borderBottom: isActive('/') ? '2px solid' : 'none',
                borderColor: 'primary.main',
                borderRadius: 0,
                '&:hover': {
                  bgcolor: 'action.hover'
                },
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              Home
            </Button>
            
            <Button 
              onClick={() => navigate('/services')} 
              sx={{ 
                color: isActive('/services') ? 'primary.main' : 'text.primary',
                textTransform: 'none', 
                fontSize: '0.95rem', 
                px: 2,
                fontWeight: 600,
                borderBottom: isActive('/services') ? '2px solid' : 'none',
                borderColor: 'primary.main',
                borderRadius: 0,
                '&:hover': {
                  bgcolor: 'action.hover'
                },
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              Services
            </Button>
          
            <Button 
              onClick={() => navigate('/pricing')} 
              sx={{ 
                color: isActive('/pricing') ? 'primary.main' : 'text.primary',
                textTransform: 'none', 
                fontSize: '0.95rem', 
                px: 2,
                fontWeight: 600,
                borderBottom: isActive('/pricing') ? '2px solid' : 'none',
                borderColor: 'primary.main',
                borderRadius: 0,
                '&:hover': {
                  bgcolor: 'action.hover'
                },
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              Pricing
            </Button>
          
            <Button 
              variant="contained"
              onClick={() => navigate('/login')} 
              startIcon={<Login />}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                px: { xs: 2, sm: 3 },
                py: 1,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                fontWeight: 700,
                borderRadius: `${borderRadius}px`,
                boxShadow: '0 4px 12px rgba(103, 58, 183, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(103, 58, 183, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Login
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
