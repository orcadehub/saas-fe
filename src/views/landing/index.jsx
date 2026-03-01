import React, { useState, useEffect } from 'react';
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
  EmojiEvents
} from '@mui/icons-material';
import tenantConfig from 'config/tenantConfig';
import PublicHeader from 'components/PublicHeader';

// --- Custom Components for Antigravity Vibe (Light Mode) ---

const GlassCard = ({ children, sx, ...props }) => (
  <Box
    sx={{
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      borderRadius: '24px',
      overflow: 'hidden',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(0, 0, 0, 0.15)',
        transform: 'translateY(-4px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
      },
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>
);

const GlowingText = ({ children, variant = "h1", sx = {} }) => (
  <Typography
    variant={variant}
    sx={{
      background: 'linear-gradient(180deg, #1A202C 0%, #4A5568 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent',
      ...sx
    }}
  >
    {children}
  </Typography>
);

// --- Main Interactive Cursor ---
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


// --- Main Landing Component ---

export default function Landing() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  const features = [
    {
      icon: <AutoAwesomeRounded sx={{ fontSize: 32, color: '#6a0dad' }} />,
      title: 'Agentic Intelligence',
      description: 'Powered by advanced AI to guide, evaluate, and adapt to your coding journey autonomously.',
      glow: 'rgba(106, 13, 173, 0.1)'
    },
    {
      icon: <CodeRounded sx={{ fontSize: 32, color: '#3B82F6' }} />,
      title: 'Real-Time IDE',
      description: 'A seamless, browser-based environment for multi-language execution and instant feedback.',
      glow: 'rgba(59, 130, 246, 0.1)'
    },
    {
      icon: <SpeedRounded sx={{ fontSize: 32, color: '#10B981' }} />,
      title: 'Instant Validation',
      description: 'Immediate correctness checks, performance metrics, and detailed execution insights.',
      glow: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: <SecurityRounded sx={{ fontSize: 32, color: '#F59E0B' }} />,
      title: 'Secure Environment',
      description: 'Proctored assessments with strict tab-switch and fullscreen monitoring capabilities.',
      glow: 'rgba(245, 158, 11, 0.1)'
    }
  ];

  // Particle background effect component
  const ParticleBackground = () => (
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
            animation: 'pulse 15s infinite alternate',
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
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0% { transform: scale(1) translate(0, 0); }
            50% { transform: scale(1.1) translate(2%, 2%); }
            100% { transform: scale(0.9) translate(-2%, -2%); }
          }
          body { cursor: default; }
          a, button, [role="button"], .interactive { cursor: pointer; }
        `}} />
    </Box>
  );

  return (
    <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#f8fafc', 
        color: '#1e293b',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflowX: 'hidden'
    }}>
      <ParticleBackground />
      <InteractiveCursor />

      {/* --- Dynamic Navbar (Antigravity Style + Original Content) --- */}
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

      {/* --- Hero Section --- */}
      <Container maxWidth="xl" sx={{ pt: { xs: 12, md: 18 }, pb: { xs: 8, md: 12 }, position: 'relative', zIndex: 10 }}>
        <Stack alignItems="center" textAlign="center" spacing={4}>
            
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
                <GlowingText variant="h1" sx={{ 
                    fontWeight: 800, 
                    fontSize: { xs: '3rem', sm: '4.5rem', md: '6rem' },
                    lineHeight: 1.05,
                    letterSpacing: '-2px',
                    maxWidth: '1000px',
                    mx: 'auto'
                }}>
                    Code at the speed of thought.
                </GlowingText>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
                <Typography variant="h5" sx={{ 
                    color: '#64748b', 
                    maxWidth: '600px', 
                    mx: 'auto', 
                    lineHeight: 1.6,
                    fontWeight: 400,
                    fontSize: { xs: '1.1rem', md: '1.3rem' }
                }}>
                    Master coding with 500+ practice problems, AI-powered mock interviews, interactive labs, and real-time assessments.
                </Typography>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 4 }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/login')}
                        endIcon={<ArrowForwardRounded />}
                        className="interactive"
                        sx={{
                            background: '#1e293b',
                            color: '#fff',
                            px: 4,
                            py: 2,
                            borderRadius: '100px',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            textTransform: 'none',
                            boxShadow: '0 10px 25px rgba(30, 41, 59, 0.2)',
                            '&:hover': { background: '#0f172a', transform: 'translateY(-2px)' },
                            transition: 'all 0.2s'
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
                            borderColor: 'rgba(0,0,0,0.1)',
                            color: '#1e293b',
                            px: 4,
                            py: 2,
                            borderRadius: '100px',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            textTransform: 'none',
                            backgroundColor: 'white',
                            '&:hover': { borderColor: 'rgba(0,0,0,0.2)', background: 'rgba(0,0,0,0.02)' }
                        }}
                    >
                        View Services
                    </Button>
                </Stack>
            </motion.div>

        </Stack>

        {/* Mock IDE Interface Graphic */}
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginTop: '80px' }}
        >
            <Box sx={{
                width: '100%',
                maxWidth: '1200px',
                mx: 'auto',
                height: { xs: '300px', md: '500px' },
                borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.08)',
                background: '#ffffff',
                boxShadow: '0 30px 60px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Window Controls */}
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: 1, background: '#f8fafc' }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
                </Box>
                {/* Code Body Mock */}
                <Box sx={{ p: 4, flex: 1, display: 'flex', gap: 4 }}>
                    <Stack spacing={2} sx={{ width: '40px', color: '#cbd5e1', fontFamily: 'monospace' }}>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => <span key={n}>{n}</span>)}
                    </Stack>
                    <Box sx={{ flex: 1, fontFamily: "monospace", color: '#475569', fontSize: '1rem', lineHeight: 2 }}>
                        <span style={{color: '#9333ea'}}>import</span> {'{'} OrcadeHub {'}'} <span style={{color: '#9333ea'}}>from</span> <span style={{color: '#16a34a'}}>'@orcadehub/platform'</span>;<br/><br/>
                        <span style={{color: '#2563eb'}}>const</span> journey = <span style={{color: '#9333ea'}}>new</span> <span style={{color: '#2563eb'}}>OrcadeHub</span>();<br/>
                        journey.<span style={{color: '#0284c7'}}>startLearning</span>();<br/><br/>
                        <span style={{color: '#94a3b8'}}>// Start your coding journey today...</span>
                    </Box>
                </Box>
            </Box>
        </motion.div>
      </Container>


      {/* --- Key Services Grid --- */}
      <Container maxWidth="xl" sx={{ py: { xs: 10, md: 16 }, position: 'relative', zIndex: 10 }}>
        <Stack spacing={3} sx={{ mb: 10, textAlign: 'center', alignItems: 'center' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '2.5rem', md: '4rem' }, letterSpacing: '-1.5px', color: '#1e293b', mb: 2 }}>
                    Everything you need to excel.
                </Typography>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400, maxWidth: '700px', lineHeight: 1.7, fontSize: { xs: '1rem', md: '1.2rem' } }}>
                    Comprehensive platform with practice problems, assessments, AI interviews, and real-time analytics.
                </Typography>
            </motion.div>
        </Stack>

        <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
            gap: 4,
            mb: 16
        }}>
            {[
                { icon: <CodeRounded sx={{ fontSize: 36 }} />, title: 'Practice Problems', description: '500+ curated coding problems across multiple difficulty levels and topics with detailed solutions.', color: '#3B82F6' },
                { icon: <Assessment sx={{ fontSize: 36 }} />, title: 'Assessments & Quizzes', description: 'Timed assessments with instant results, detailed analytics, and performance tracking.', color: '#10B981' },
                { icon: <Psychology sx={{ fontSize: 36 }} />, title: 'Online IDE', description: 'Powerful browser-based IDE supporting Python, Java, C++, and C with instant execution.', color: '#F59E0B' },
                { icon: <SmartToy sx={{ fontSize: 36 }} />, title: 'AI Mock Interviews', description: 'Practice with AI-powered interview sessions and get personalized feedback to improve.', color: '#6a0dad' },
                { icon: <SportsEsports sx={{ fontSize: 36 }} />, title: 'Interactive Labs', description: 'Hands-on coding labs and playgrounds for practical learning in an engaging environment.', color: '#EC4899' },
                { icon: <EmojiEvents sx={{ fontSize: 36 }} />, title: 'Leaderboard & Analytics', description: 'Compete with peers, track rankings, and get detailed insights into your progress.', color: '#EF4444' }
            ].map((service, idx) => (
                <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: idx * 0.08 }}
                >
                    <GlassCard sx={{ p: 5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Box sx={{ 
                            width: 72, 
                            height: 72, 
                            borderRadius: '20px', 
                            background: `linear-gradient(135deg, ${service.color}15, ${service.color}05)`,
                            border: `1px solid ${service.color}20`,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mb: 3,
                            color: service.color,
                            boxShadow: `0 8px 16px ${service.color}10`
                        }}>
                            {service.icon}
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, letterSpacing: '-0.5px', color: '#1e293b', fontSize: '1.4rem' }}>
                            {service.title}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            {service.description}
                        </Typography>
                    </GlassCard>
                </motion.div>
            ))}
        </Box>
      </Container>


      {/* --- Footer --- */}
      <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.08)', py: 6, position: 'relative', zIndex: 10, background: '#ffffff' }}>
        <Container maxWidth="xl">
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={3}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    © {new Date().getFullYear()}{' '}
                    <Typography
                        component="a"
                        href="https://orcadehub.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            color: '#64748b',
                            textDecoration: 'none',
                            '&:hover': { color: '#0f172a' },
                            transition: 'color 0.2s'
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
                            sx={{ color: '#64748b', textDecoration: 'none', '&:hover': { color: '#0f172a' }, transition: 'color 0.2s' }}
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

