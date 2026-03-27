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

// ── Animated Grid Background ──
const AnimatedGridBackground = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#0a0a0f' }} />
    <Box sx={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
      animation: 'gridMove 20s linear infinite',
    }} />
    <Box sx={{
      position: 'absolute', top: '-15%', left: '-10%',
      width: '70vw', height: '70vw',
      background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)',
      borderRadius: '50%', filter: 'blur(80px)',
      animation: 'floatOrb1 18s ease-in-out infinite alternate',
    }} />
    <Box sx={{
      position: 'absolute', bottom: '-20%', right: '-15%',
      width: '60vw', height: '60vw',
      background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)',
      borderRadius: '50%', filter: 'blur(100px)',
      animation: 'floatOrb2 22s ease-in-out infinite alternate',
    }} />
    <Box sx={{
      position: 'absolute', top: '50%', left: '60%',
      width: '30vw', height: '30vw',
      background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 65%)',
      borderRadius: '50%', filter: 'blur(60px)',
    }} />
    <Box sx={{
      position: 'absolute', inset: 0, opacity: 0.03,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    }} />
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes gridMove { 0% { transform: translate(0, 0); } 100% { transform: translate(60px, 60px); } }
      @keyframes floatOrb1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(8%, 12%) scale(1.15); } }
      @keyframes floatOrb2 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-10%, -8%) scale(1.1); } }
    ` }} />
  </Box>
);

// ================================|| AUTH - LOGIN ||================================ //

export default function Login() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [config, setConfig] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  return (
    <Box sx={{ height: '100vh', bgcolor: '#0a0a0f', overflow: 'hidden', position: 'relative' }}>
      <AnimatedGridBackground />
      <StarryBackground />
      <CelestialCursor />
      <LandingHeader />

      {/* Main content */}
      <Stack
        sx={{
          minHeight: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 2, sm: 3 },
          position: 'relative',
          zIndex: 10,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Box sx={{
            width: { xs: '100%', sm: 560 },
            maxWidth: '100%',
            p: { xs: 3, sm: 5 },
            borderRadius: '28px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #8b5cf6, #06b6d4, transparent)',
              opacity: 0.6,
            },
          }}>
            <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              {/* Logo */}
              <Box sx={{ mb: 0.5 }}>
                {config?.logoUrl ? (
                  <Box
                    component="img"
                    src={config.logoUrl}
                    alt="Logo"
                    sx={{
                      height: { xs: 48, sm: 58 },
                      maxWidth: { xs: 180, sm: 220 },
                      objectFit: 'contain',
                      filter: 'brightness(1.1)',
                      borderRadius: '20px',
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <Link to="#" aria-label="logo">
                    <Logo />
                  </Link>
                )}
              </Box>

              {/* Title */}
              <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
                <Typography
                  variant={downMD ? 'h3' : 'h2'}
                  sx={{
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Hi, Welcome Back
                </Typography>
                <Typography variant="caption" sx={{
                  fontSize: '15px', textAlign: 'center',
                  color: 'rgba(255,255,255,0.4)',
                }}>
                  Enter your credentials to continue
                </Typography>
              </Stack>

              {/* Login form */}
              <Box sx={{ width: 1 }}>
                <AuthLogin />
              </Box>
            </Stack>
          </Box>
        </motion.div>

        {/* Footer */}
        <Box sx={{ position: 'absolute', bottom: { xs: 12, sm: 20 }, left: 0, right: 0, textAlign: 'center' }}>
          <Typography
            variant="subtitle2"
            component="a"
            href="https://orcadehub.com"
            target="_blank"
            sx={{
              color: 'rgba(255,255,255,0.25)',
              textDecoration: 'none',
              '&:hover': { color: '#8b5cf6' },
              transition: 'color 0.3s',
            }}
          >
            Orcadehub Innovations LLP
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
