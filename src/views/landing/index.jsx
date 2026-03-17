import React, { useState, useEffect, useMemo } from 'react';
import { Box, Container, Stack, Typography, Button, IconButton, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CodeRounded,
  SpeedRounded,
  SecurityRounded,
  AutoAwesomeRounded,
  ArrowForwardRounded,
  PlayArrowRounded,
  Assessment,
  Psychology,
  SmartToy,
  SportsEsports,
  Analytics,
  EmojiEvents,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import tenantConfig from 'config/tenantConfig';

// ── Animated Grid Background ──
const AnimatedGridBackground = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    {/* Base dark */}
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#0a0a0f' }} />

    {/* Animated grid */}
    <Box sx={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
      animation: 'gridMove 20s linear infinite',
    }} />

    {/* Glow orb 1 – purple */}
    <Box sx={{
      position: 'absolute', top: '-15%', left: '-10%',
      width: '70vw', height: '70vw',
      background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)',
      borderRadius: '50%', filter: 'blur(80px)',
      animation: 'floatOrb1 18s ease-in-out infinite alternate',
    }} />

    {/* Glow orb 2 – cyan */}
    <Box sx={{
      position: 'absolute', bottom: '-20%', right: '-15%',
      width: '60vw', height: '60vw',
      background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)',
      borderRadius: '50%', filter: 'blur(100px)',
      animation: 'floatOrb2 22s ease-in-out infinite alternate',
    }} />

    {/* Glow orb 3 – pink */}
    <Box sx={{
      position: 'absolute', top: '40%', right: '10%',
      width: '35vw', height: '35vw',
      background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 65%)',
      borderRadius: '50%', filter: 'blur(60px)',
      animation: 'floatOrb3 15s ease-in-out infinite alternate',
    }} />

    {/* Noise texture overlay */}
    <Box sx={{
      position: 'absolute', inset: 0, opacity: 0.03,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    }} />

    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes gridMove {
        0% { transform: translate(0, 0); }
        100% { transform: translate(60px, 60px); }
      }
      @keyframes floatOrb1 {
        0% { transform: translate(0, 0) scale(1); }
        100% { transform: translate(8%, 12%) scale(1.15); }
      }
      @keyframes floatOrb2 {
        0% { transform: translate(0, 0) scale(1); }
        100% { transform: translate(-10%, -8%) scale(1.1); }
      }
      @keyframes floatOrb3 {
        0% { transform: translate(0, 0) scale(0.9); }
        100% { transform: translate(-6%, 10%) scale(1.05); }
      }
      body { cursor: default; }
      a, button, [role="button"], .interactive { cursor: pointer; }
    ` }} />
  </Box>
);

// ── Interactive Cursor ──
const InteractiveCursor = () => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    const handleMouseOver = (e) => {
      setIsHovering(!!(e.target.closest('button') || e.target.closest('a') || e.target.closest('.interactive')));
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
        position: 'fixed', top: 0, left: 0, width: 32, height: 32,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      animate={{
        x: mousePos.x - 16, y: mousePos.y - 16,
        scale: isHovering ? 2.5 : 1,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
    >
      <Box sx={{
        width: '8px', height: '8px',
        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
        borderRadius: '50%',
        boxShadow: '0 0 20px 4px rgba(139,92,246,0.5), 0 0 40px 8px rgba(6,182,212,0.2)',
        opacity: 0.8,
      }} />
    </motion.div>
  );
};

// ── Letter-by-letter animated text ──
const LetterByLetterText = ({ text, delay = 0, sx = {} }) => {
  const letters = useMemo(() => text.split(''), [text]);

  return (
    <Typography
      variant="h1"
      component="h1"
      sx={{
        fontWeight: 900,
        fontSize: { xs: '3rem', sm: '4.5rem', md: '5.5rem', lg: '6.5rem' },
        lineHeight: 1.05,
        letterSpacing: '-3px',
        maxWidth: '1100px',
        mx: 'auto',
        ...sx,
      }}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.4,
            delay: delay + i * 0.035,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            display: 'inline-block',
            background: letter === ' '
              ? 'transparent'
              : 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 40%, #8b5cf6 70%, #06b6d4 100%)',
            WebkitBackgroundClip: letter === ' ' ? 'unset' : 'text',
            WebkitTextFillColor: letter === ' ' ? 'transparent' : 'transparent',
            backgroundClip: letter === ' ' ? 'unset' : 'text',
            whiteSpace: letter === ' ' ? 'pre' : 'normal',
            minWidth: letter === ' ' ? '0.3em' : 'auto',
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </Typography>
  );
};

// ── Glass Card ──
const GlassCard = ({ children, sx, ...props }) => (
  <Box
    sx={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '24px',
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        transform: 'translateY(-6px)',
        boxShadow: '0 25px 50px rgba(139, 92, 246, 0.08), 0 0 0 1px rgba(139, 92, 246, 0.1)',
      },
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>
);

// ── Floating Particles ──
const FloatingParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.1,
    })),
    []
  );

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.id % 3 === 0
              ? 'rgba(139, 92, 246, 0.6)'
              : p.id % 3 === 1
              ? 'rgba(6, 182, 212, 0.5)'
              : 'rgba(236, 72, 153, 0.4)',
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </Box>
  );
};

// ── Main Landing ──
export default function Landing() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#0a0a0f',
      color: '#e2e8f0',
      fontFamily: "'Inter', 'Outfit', sans-serif",
      position: 'relative',
      overflowX: 'hidden',
    }}>
      <AnimatedGridBackground />
      <FloatingParticles />
      <InteractiveCursor />

      {/* ══════════ Navbar ══════════ */}
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
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  <AutoAwesomeRounded sx={{ color: '#8b5cf6' }} />
                  {config?.tenantName || 'ORCADEHUB'}
                </Typography>
              )}
            </Stack>

            {/* Nav Links – Desktop */}
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

            {/* Actions */}
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

      {/* ══════════ Hero Section ══════════ */}
      <Container maxWidth="xl" sx={{ pt: { xs: 14, md: 22 }, pb: { xs: 8, md: 14 }, position: 'relative', zIndex: 10 }}>
        <Stack alignItems="center" textAlign="center" spacing={5}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              px: 2.5, py: 0.8,
              borderRadius: '100px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              background: 'rgba(139, 92, 246, 0.08)',
              backdropFilter: 'blur(10px)',
            }}>
              <Box sx={{
                width: 6, height: 6, borderRadius: '50%',
                bgcolor: '#8b5cf6',
                boxShadow: '0 0 8px rgba(139,92,246,0.6)',
                animation: 'pulse 2s infinite',
              }} />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd', letterSpacing: '0.5px' }}>
                AI-POWERED LEARNING PLATFORM
              </Typography>
            </Box>
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
            ` }} />
          </motion.div>

          {/* Hero Heading – Letter by Letter */}
          <LetterByLetterText text="Code at the speed of thought." delay={0.3} />

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Typography variant="h5" sx={{
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '650px',
              mx: 'auto',
              lineHeight: 1.7,
              fontWeight: 400,
              fontSize: { xs: '1.05rem', md: '1.25rem' },
            }}>
              Master coding with 500+ practice problems, AI-powered mock interviews, interactive labs, and real-time assessments.
            </Typography>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                endIcon={<ArrowForwardRounded />}
                className="interactive"
                sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                  color: '#fff', px: 5, py: 2,
                  borderRadius: '100px',
                  fontWeight: 700, fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 15px 50px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.3)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                startIcon={<PlayArrowRounded />}
                onClick={() => navigate('/services')}
                className="interactive"
                sx={{
                  borderColor: 'rgba(255,255,255,0.12)',
                  color: '#e2e8f0',
                  px: 5, py: 2,
                  borderRadius: '100px',
                  fontWeight: 600, fontSize: '1.1rem',
                  textTransform: 'none',
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(255,255,255,0.03)',
                  '&:hover': {
                    borderColor: 'rgba(139, 92, 246, 0.4)',
                    background: 'rgba(139, 92, 246, 0.08)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                View Services
              </Button>
            </Stack>
          </motion.div>
        </Stack>

        {/* ── Mock IDE ── */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 2.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginTop: '80px' }}
        >
          <Box sx={{
            width: '100%', maxWidth: '1100px', mx: 'auto',
            height: { xs: '280px', md: '460px' },
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(15, 15, 25, 0.8)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.05)',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            backdropFilter: 'blur(20px)',
          }}>
            {/* Window top bar */}
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 1, alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
              <Typography sx={{ ml: 2, fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                main.js — orcadehub
              </Typography>
            </Box>
            {/* Code body */}
            <Box sx={{ p: 4, flex: 1, display: 'flex', gap: 4, overflow: 'hidden' }}>
              <Stack spacing={2} sx={{ width: '40px', color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => <span key={n}>{n}</span>)}
              </Stack>
              <Box sx={{ flex: 1, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: 'rgba(255,255,255,0.6)', fontSize: { xs: '0.8rem', md: '0.95rem' }, lineHeight: 2.2 }}>
                <span style={{color: '#c084fc'}}>import</span> {'{'} OrcadeHub {'}'} <span style={{color: '#c084fc'}}>from</span> <span style={{color: '#34d399'}}>'@orcadehub/platform'</span>;<br/><br/>
                <span style={{color: '#67e8f9'}}>const</span> journey = <span style={{color: '#c084fc'}}>new</span> <span style={{color: '#67e8f9'}}>OrcadeHub</span>();<br/>
                journey.<span style={{color: '#38bdf8'}}>startLearning</span>();<br/><br/>
                <span style={{color: 'rgba(255,255,255,0.2)'}}>// Start your coding journey today...</span>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Container>

      {/* ══════════ Key Services Grid ══════════ */}
      <Container maxWidth="xl" sx={{ py: { xs: 10, md: 16 }, position: 'relative', zIndex: 10 }}>
        <Stack spacing={3} sx={{ mb: 10, textAlign: 'center', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h2" sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '4rem' },
              letterSpacing: '-1.5px',
              mb: 2,
              background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Everything you need to excel.
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Typography variant="h6" sx={{
              color: 'rgba(255,255,255,0.4)', fontWeight: 400,
              maxWidth: '700px', lineHeight: 1.7,
              fontSize: { xs: '1rem', md: '1.2rem' },
            }}>
              Comprehensive platform with practice problems, assessments, AI interviews, and real-time analytics.
            </Typography>
          </motion.div>
        </Stack>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 4, mb: 16,
        }}>
          {[
            { icon: <CodeRounded sx={{ fontSize: 36 }} />, title: 'Practice Problems', description: '500+ curated coding problems across multiple difficulty levels and topics with detailed solutions.', color: '#3B82F6', glow: 'rgba(59,130,246,0.15)' },
            { icon: <Assessment sx={{ fontSize: 36 }} />, title: 'Assessments & Quizzes', description: 'Timed assessments with instant results, detailed analytics, and performance tracking.', color: '#10B981', glow: 'rgba(16,185,129,0.15)' },
            { icon: <Psychology sx={{ fontSize: 36 }} />, title: 'Online IDE', description: 'Powerful browser-based IDE supporting Python, Java, C++, and C with instant execution.', color: '#F59E0B', glow: 'rgba(245,158,11,0.15)' },
            { icon: <SmartToy sx={{ fontSize: 36 }} />, title: 'AI Mock Interviews', description: 'Practice with AI-powered interview sessions and get personalized feedback to improve.', color: '#8b5cf6', glow: 'rgba(139,92,246,0.15)' },
            { icon: <SportsEsports sx={{ fontSize: 36 }} />, title: 'Interactive Labs', description: 'Hands-on coding labs and playgrounds for practical learning in an engaging environment.', color: '#EC4899', glow: 'rgba(236,72,153,0.15)' },
            { icon: <EmojiEvents sx={{ fontSize: 36 }} />, title: 'Leaderboard & Analytics', description: 'Compete with peers, track rankings, and get detailed insights into your progress.', color: '#EF4444', glow: 'rgba(239,68,68,0.15)' },
          ].map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
            >
              <GlassCard sx={{ p: 5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{
                  width: 72, height: 72,
                  borderRadius: '20px',
                  background: service.glow,
                  border: `1px solid ${service.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mb: 3, color: service.color,
                  boxShadow: `0 8px 24px ${service.color}15`,
                  transition: 'all 0.3s',
                }}>
                  {service.icon}
                </Box>
                <Typography variant="h5" sx={{
                  fontWeight: 700, mb: 2, letterSpacing: '-0.5px',
                  color: '#f1f5f9', fontSize: '1.4rem',
                }}>
                  {service.title}
                </Typography>
                <Typography variant="body1" sx={{
                  color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, fontSize: '0.95rem',
                }}>
                  {service.description}
                </Typography>
              </GlassCard>
            </motion.div>
          ))}
        </Box>
      </Container>

      {/* ══════════ Footer ══════════ */}
      <Box sx={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        py: 6, position: 'relative', zIndex: 10,
        background: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(20px)',
      }}>
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={3}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>
              © {new Date().getFullYear()}{' '}
              <Typography
                component="a"
                href="https://orcadehub.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'rgba(255,255,255,0.3)',
                  textDecoration: 'none',
                  '&:hover': { color: '#8b5cf6' },
                  transition: 'color 0.3s',
                }}
              >
                Orcadehub Innovations LLP
              </Typography>
              . All rights reserved.
            </Typography>
            <Stack direction="row" spacing={4}>
              {['X / Twitter', 'GitHub', 'LinkedIn'].map((link) => (
                <Typography
                  key={link}
                  variant="body2"
                  className="interactive"
                  component="a"
                  href="#"
                  sx={{
                    color: 'rgba(255,255,255,0.3)',
                    textDecoration: 'none',
                    '&:hover': { color: '#c4b5fd' },
                    transition: 'color 0.3s',
                  }}
                >
                  {link}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
