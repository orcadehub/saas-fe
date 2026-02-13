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
    <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
      <Box 
        sx={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: `${borderRadius}px`,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
          }
        }}
      >
        <Container maxWidth="xl">
          <Stack 
            direction="row" 
            sx={{ 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: { xs: 2, md: 2.5 }
            }}
          >
            {/* Logo Section */}
            <Stack 
              direction="row" 
              spacing={1.5} 
              sx={{ 
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateX(4px)'
                }
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
                <Stack spacing={0.3}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 900,
                      letterSpacing: '-0.5px',
                      fontSize: { xs: '1.15rem', sm: '1.5rem' },
                      lineHeight: 1.2
                    }}
                  >
                    {config?.tenantName || 'Orcadehub'}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 600,
                      fontSize: { xs: '0.65rem', sm: '0.72rem' },
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase'
                    }}
                  >
                    Learning Platform
                  </Typography>
                </Stack>
              )}
            </Stack>

            {/* Navigation */}
            <Stack 
              direction="row" 
              spacing={{ xs: 1, sm: 1.5 }} 
              sx={{ alignItems: 'center' }}
            >
              {/* Navigation Links - Desktop */}
              <Stack 
                direction="row" 
                spacing={1}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                <Button 
                  onClick={() => navigate('/')} 
                  sx={{ 
                    color: isActive('/') ? 'secondary.main' : 'text.primary',
                    textTransform: 'none', 
                    fontSize: '0.95rem', 
                    px: 2.5,
                    py: 1,
                    fontWeight: 700,
                    borderRadius: `${borderRadius}px`,
                    bgcolor: isActive('/') ? 'secondary.light' : 'transparent',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: isActive('/') ? '50%' : '0%',
                      height: '2px',
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '2px',
                      transition: 'width 0.3s ease'
                    },
                    '&:hover': {
                      bgcolor: isActive('/') ? 'secondary.light' : 'rgba(103, 58, 183, 0.04)',
                      color: 'secondary.main',
                      '&::after': {
                        width: '50%'
                      }
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Home
                </Button>
                
                <Button 
                  onClick={() => navigate('/services')} 
                  sx={{ 
                    color: isActive('/services') ? 'secondary.main' : 'text.primary',
                    textTransform: 'none', 
                    fontSize: '0.95rem', 
                    px: 2.5,
                    py: 1,
                    fontWeight: 700,
                    borderRadius: `${borderRadius}px`,
                    bgcolor: isActive('/services') ? 'secondary.light' : 'transparent',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: isActive('/services') ? '50%' : '0%',
                      height: '2px',
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '2px',
                      transition: 'width 0.3s ease'
                    },
                    '&:hover': {
                      bgcolor: isActive('/services') ? 'secondary.light' : 'rgba(103, 58, 183, 0.04)',
                      color: 'secondary.main',
                      '&::after': {
                        width: '50%'
                      }
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Services
                </Button>
              </Stack>

              {/* Mobile Navigation Chips */}
              <Stack 
                direction="row" 
                spacing={0.5}
                sx={{ display: { xs: 'flex', sm: 'none' } }}
              >
                <Chip
                  label="Home"
                  onClick={() => navigate('/')}
                  sx={{
                    bgcolor: isActive('/') ? 'secondary.light' : 'grey.100',
                    color: isActive('/') ? 'secondary.main' : 'text.secondary',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    border: '1px solid',
                    borderColor: isActive('/') ? 'secondary.main' : 'divider',
                    '&:hover': {
                      bgcolor: 'secondary.light',
                      color: 'secondary.main'
                    }
                  }}
                />
                <Chip
                  label="Services"
                  onClick={() => navigate('/services')}
                  sx={{
                    bgcolor: isActive('/services') ? 'secondary.light' : 'grey.100',
                    color: isActive('/services') ? 'secondary.main' : 'text.secondary',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    border: '1px solid',
                    borderColor: isActive('/services') ? 'secondary.main' : 'divider',
                    '&:hover': {
                      bgcolor: 'secondary.light',
                      color: 'secondary.main'
                    }
                  }}
                />
              </Stack>
            
              {/* Get Started Button */}
              <Button 
                variant="contained"
                onClick={() => navigate('/login')} 
                startIcon={<Login sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  px: { xs: 2.5, sm: 3.5 },
                  py: { xs: 1.1, sm: 1.3 },
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', sm: '0.95rem' },
                  fontWeight: 800,
                  borderRadius: `${borderRadius}px`,
                  boxShadow: '0 4px 16px rgba(103, 58, 183, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'left 0.6s ease'
                  },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 24px rgba(103, 58, 183, 0.4)',
                    '&::before': {
                      left: '100%'
                    }
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Get Started
                </Box>
                <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                  Login
                </Box>
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
