import { Box, Container, Typography, Button, Card, CardContent, Stack, Chip, IconButton } from '@mui/material';
import { WhatsApp, CheckCircle, AutoAwesomeRounded, Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import useConfig from 'hooks/useConfig';
import StarryBackground from 'components/StarryBackground';
import CelestialCursor from 'components/CelestialCursor';
import tenantConfig from 'config/tenantConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

// ── Animated Grid Background ──
const AnimatedGridBackground = () => (
  <Box sx={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
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
      position: 'absolute', inset: 0, opacity: 0.03,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    }} />
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes gridMove { 0% { transform: translate(0, 0); } 100% { transform: translate(60px, 60px); } }
      @keyframes floatOrb1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(8%, 12%) scale(1.15); } }
      @keyframes floatOrb2 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-10%, -8%) scale(1.1); } }
      body { cursor: default; }
      a, button, [role="button"], .interactive { cursor: pointer; }
    ` }} />
  </Box>
);

// ── Navbar ──
const DarkNavbar = ({ config }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Box component="nav" sx={{
      position: 'fixed', top: 0, width: '100%', zIndex: 100,
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      background: 'rgba(10, 10, 15, 0.7)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    }}>
      <Container maxWidth="xl">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            {config?.logoUrl ? (
              <Box component="img" src={config.logoUrl} alt="Logo" sx={{ height: 40, objectFit: 'contain', filter: 'brightness(1.1)', borderRadius: '12px' }} onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <Typography variant="h5" sx={{
                fontWeight: 800, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 1,
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                <AutoAwesomeRounded sx={{ color: '#8b5cf6' }} />
                {config?.tenantName || 'ORCADEHUB'}
              </Typography>
            )}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {[{ label: 'Home', path: '/' }, { label: 'Services', path: '/services' }, { label: 'Pricing', path: '/pricing' }].map((item) => (
              <Button key={item.path} variant="text" onClick={() => navigate(item.path)} className="interactive"
                sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.05)' }, textTransform: 'none', fontSize: '0.95rem', fontWeight: 500, px: 2, transition: 'all 0.3s' }}
              >{item.label}</Button>
            ))}
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button onClick={() => navigate('/login')} className="interactive"
              sx={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#ffffff', borderRadius: '100px',
                px: 3.5, py: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.95rem',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)', display: { xs: 'none', md: 'flex' },
                '&:hover': { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)' },
                transition: 'all 0.3s',
              }}
            >Login</Button>
            <IconButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)} sx={{ display: { xs: 'flex', md: 'none' }, color: '#fff' }}>
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Stack>
        </Stack>
      </Container>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', px: 3, pb: 3, gap: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {[{ label: 'Home', path: '/' }, { label: 'Services', path: '/services' }, { label: 'Pricing', path: '/pricing' }].map((item) => (
                <Button key={item.path} onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                  sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', justifyContent: 'flex-start', fontWeight: 500 }}
                >{item.label}</Button>
              ))}
              <Button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                sx={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', borderRadius: '12px', mt: 1, textTransform: 'none', fontWeight: 600 }}
              >Login</Button>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default function Pricing() {
  const navigate = useNavigate();
  const { state: { borderRadius } } = useConfig();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  const features = [
    'Fully White-Labeled Platform', 'Custom Branding & Logo', 'Your Own Domain', 'Complete Admin Control',
    'Instructor Management Controls', 'Student Management System', 'Assessment & Quiz Engine', 'Online IDE Integration',
    'AI Mock Interview Module', 'Interactive Labs', 'Gamified Aptitude Assessments', 'Quantitative Reasoning Practice',
    'Verbal Reasoning Practice', 'Company-Specific Questions', 'Study Materials Management', 'Leaderboard & Analytics',
    'Secure Proctoring System', 'Cross-Platform Student Stats', 'LeetCode, HackerRank, Codeforces, CodeChef Sync',
    'Multi-Language Support', 'Real-Time Code Execution', 'Activity Tracking', 'Custom Tenant Configuration', 'Dedicated Technical Support',
  ];

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/917093012101?text=Hi, I want to get a white-labeled LMS for my institution', '_blank');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0f', color: '#e2e8f0', position: 'relative', overflowX: 'hidden' }}>
      <AnimatedGridBackground />
      <StarryBackground />
      <CelestialCursor />
      <DarkNavbar config={config} />

      {/* Hero */}
      <Box sx={{ position: 'relative', overflow: 'hidden', py: { xs: 6, md: 10 }, mt: 8 }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
          <Stack alignItems="center" textAlign="center" spacing={4}>
            <MotionBox initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
              <Typography variant="h1" sx={{
                fontWeight: 900,
                fontSize: { xs: '3rem', sm: '4.5rem', md: '6rem' },
                lineHeight: 1.05, letterSpacing: '-2px', maxWidth: '1000px', mx: 'auto',
                background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Get Your Branded LMS
              </Typography>
            </MotionBox>
            <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
              <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.45)', maxWidth: '600px', mx: 'auto', lineHeight: 1.6, fontWeight: 400, fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
                Launch your own institution-ready platform with assessments, practice labs, analytics, and complete control over branding.
              </Typography>
            </MotionBox>
            <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 4 }}>
                <Button variant="contained" startIcon={<WhatsApp />} onClick={handleWhatsAppContact}
                  sx={{
                    background: 'linear-gradient(135deg, #25D366, #20BA5A)', color: '#fff', px: 4, py: 2,
                    borderRadius: '100px', fontWeight: 600, fontSize: '1.1rem', textTransform: 'none',
                    boxShadow: '0 10px 40px rgba(37, 211, 102, 0.25)',
                    '&:hover': { background: 'linear-gradient(135deg, #20BA5A, #1aa34d)', transform: 'translateY(-2px)', boxShadow: '0 15px 50px rgba(37, 211, 102, 0.35)' },
                    transition: 'all 0.3s',
                  }}>Contact on WhatsApp</Button>
                <Button variant="outlined"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.12)', color: '#e2e8f0', px: 4, py: 2, borderRadius: '100px',
                    fontWeight: 600, fontSize: '1.1rem', textTransform: 'none', background: 'rgba(255,255,255,0.03)',
                    '&:hover': { borderColor: 'rgba(139,92,246,0.4)', background: 'rgba(139,92,246,0.08)' }, transition: 'all 0.3s',
                  }}>+91 7093012101</Button>
              </Stack>
            </MotionBox>
          </Stack>
        </Container>
      </Box>

      {/* Features grid */}
      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
        <MotionBox sx={{ textAlign: 'center', mb: { xs: 3.5, md: 5.5 } }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <Typography variant="h2" sx={{
            fontWeight: 800, mb: 1.5, fontSize: { xs: '1.8rem', md: '2.5rem' },
            background: 'linear-gradient(135deg, #ffffff, #c4b5fd)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Everything Included
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, fontSize: { xs: '1rem', md: '1.1rem' } }}>
            No hidden modules. Full LMS capability for your institution from day one.
          </Typography>
        </MotionBox>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, gridAutoRows: '1fr' }}>
          {features.map((feature, index) => (
            <MotionCard key={feature} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.35, delay: (index % 4) * 0.06 }}
              sx={{
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', bgcolor: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                height: '100%', width: '100%', transition: 'all 0.3s ease',
                '&:hover': { borderColor: 'rgba(139,92,246,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', transform: 'translateY(-4px)', bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              <CardContent sx={{ p: 2.25, height: '100%', display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <CheckCircle sx={{ color: '#8b5cf6', fontSize: 20, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#e2e8f0' }}>{feature}</Typography>
              </CardContent>
            </MotionCard>
          ))}
        </Box>
      </Container>

      {/* CTA Card */}
      <Container maxWidth="xl" sx={{ pb: { xs: 6, md: 9 } }}>
        <MotionCard initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}
          sx={{
            p: { xs: 3, sm: 4.5, md: 6 },
            borderRadius: '24px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.08) 50%, rgba(139,92,246,0.1) 100%)',
            border: '1px solid rgba(139,92,246,0.2)',
            boxShadow: '0 20px 60px rgba(139, 92, 246, 0.15), 0 0 0 1px rgba(139,92,246,0.1)',
            position: 'relative', overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            '&::after': {
              content: '""', position: 'absolute', width: 280, height: 280, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 72%)',
              top: -130, right: -80,
            },
          }}
        >
          <Chip label="Launch Support"
            sx={{
              mb: 2, bgcolor: 'rgba(139,92,246,0.2)', color: '#c4b5fd', fontWeight: 700,
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          />
          <Typography variant="h3" sx={{
            fontWeight: 800, mb: 1.5, fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #ffffff, #c4b5fd)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            position: 'relative', zIndex: 1,
          }}>
            Ready to Launch Your LMS?
          </Typography>
          <Typography sx={{
            mb: 3, color: 'rgba(255,255,255,0.5)', fontWeight: 500,
            fontSize: { xs: '0.96rem', md: '1.05rem' }, position: 'relative', zIndex: 1,
          }}>
            Let's set up your branded portal for students, instructors, and admins.
          </Typography>
          <Button variant="contained" size="large" startIcon={<WhatsApp />} onClick={handleWhatsAppContact}
            sx={{
              px: { xs: 2.5, md: 4.5 }, py: 1.5, textTransform: 'none', fontWeight: 800,
              borderRadius: '100px',
              background: 'linear-gradient(135deg, #25D366, #20BA5A)', color: '#ffffff',
              boxShadow: '0 8px 30px rgba(37, 211, 102, 0.3)',
              position: 'relative', zIndex: 1,
              '&:hover': { background: 'linear-gradient(135deg, #20BA5A, #1aa34d)', transform: 'translateY(-2px)' },
              transition: 'all 0.3s',
            }}
          >
            WhatsApp: +91 7093012101
          </Button>
        </MotionCard>
      </Container>

      {/* Footer */}
      <Box sx={{
        borderTop: '1px solid rgba(255,255,255,0.05)', py: 6, position: 'relative', zIndex: 10,
        background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(20px)',
      }}>
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={3}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>
              © {new Date().getFullYear()}{' '}
              <Typography component="a" href="https://orcadehub.com" target="_blank" rel="noopener noreferrer"
                sx={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', '&:hover': { color: '#8b5cf6' }, transition: 'color 0.3s' }}
              >Orcadehub Innovations LLP</Typography>. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={4}>
              {['X / Twitter', 'GitHub', 'LinkedIn'].map((link) => (
                <Typography key={link} variant="body2" component="a" href="#"
                  sx={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', '&:hover': { color: '#c4b5fd' }, transition: 'color 0.3s' }}
                >{link}</Typography>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
