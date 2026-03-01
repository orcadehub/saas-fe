import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LandingHeader from 'components/LandingHeader';
import tenantConfig from 'config/tenantConfig';
import { motion } from 'framer-motion';

// project imports
import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';

import Logo from 'ui-component/Logo';
import AuthFooter from 'ui-component/cards/AuthFooter';
import AuthLogin from '../auth-forms/AuthLogin';

const InteractiveCursor = () => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseOver = (e) => {
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.interactive')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 32,
        height: 32,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      animate={{
        x: mousePos.x - 16,
        y: mousePos.y - 16,
        scale: isHovering ? 2 : 1,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
    >
      <Box sx={{ 
        width: '8px', 
        height: '8px', 
        bgcolor: '#6a0dad', 
        borderRadius: '50%',
        boxShadow: '0 0 15px 2px rgba(106,13,173,0.4)',
        opacity: 0.6
      }} />
    </motion.div>
  );
};

// ================================|| AUTH3 - LOGIN ||================================ //

export default function Login() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [config, setConfig] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  return (
    <Box sx={{ height: '100vh', bgcolor: '#f8fafc', overflow: 'hidden', position: 'relative' }}>
      <InteractiveCursor />
      {/* Particle Background */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
        }}/>
        <Box sx={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(168,85,247,0.03) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
        }}/>
      </Box>

      <LandingHeader />
      <AuthWrapper1 sx={{ minHeight: 'calc(100vh - 76px)', height: 'calc(100vh - 76px)', backgroundColor: 'transparent' }}>
        <Stack
          sx={{
            minHeight: 'calc(100vh - 76px)',
            height: 'calc(100vh - 76px)',
            justifyContent: 'center',
            alignItems: 'center',
            px: { xs: 1, sm: 2 },
            py: { xs: 1.5, sm: 2 },
            overflow: 'hidden',
            pb: { xs: 6, sm: 7 }
          }}
        >
          <Box sx={{ width: 1, maxWidth: 540 }}>
            <AuthCardWrapper
              sx={{
                maxHeight: { xs: 'calc(100vh - 108px)', sm: 'calc(100vh - 120px)' },
                overflow: 'auto',
                borderRadius: '24px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 50px rgba(15, 23, 42, 0.1)',
                '& .MuiCardContent-root': {
                  p: { xs: 3, sm: 4.5 }
                }
              }}
            >
              <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Box sx={{ mb: 1.5 }}>
                  {config?.logoUrl ? (
                    <Box
                      component="img"
                      src={config.logoUrl}
                      alt="Logo"
                      sx={{
                        height: { xs: 52, sm: 62 },
                        maxWidth: { xs: 180, sm: 220 },
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Link to="#" aria-label="logo">
                      <Logo />
                    </Link>
                  )}
                </Box>

                <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
                  <Typography variant={downMD ? 'h3' : 'h2'} sx={{ color: '#1e293b', textAlign: 'center', fontWeight: 800, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    Hi, Welcome Back
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '15px', textAlign: 'center', color: '#64748b' }}>
                    Enter your credentials to continue
                  </Typography>
                </Stack>

                <Box sx={{ width: 1 }}>
                  <AuthLogin />
                </Box>
              </Stack>
            </AuthCardWrapper>
          </Box>
        </Stack>

        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: { xs: 8, sm: 12 },
            px: 2
          }}
        >
          <AuthFooter />
        </Box>
      </AuthWrapper1>
    </Box>
  );
}
