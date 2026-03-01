import { Box, Container, Typography, Button, Card, CardContent, Stack, Chip } from '@mui/material';
import { WhatsApp, CheckCircle, CheckCircleOutline } from '@mui/icons-material';
import LandingHeader from 'components/LandingHeader';
import useConfig from 'hooks/useConfig';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

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

export default function Pricing() {
  const {
    state: { borderRadius }
  } = useConfig();

  const features = [
    'Fully White-Labeled Platform',
    'Custom Branding & Logo',
    'Your Own Domain',
    'Complete Admin Control',
    'Instructor Management Controls',
    'Student Management System',
    'Assessment & Quiz Engine',
    'Online IDE Integration',
    'AI Mock Interview Module',
    'Interactive Labs',
    'Gamified Aptitude Assessments',
    'Quantitative Reasoning Practice',
    'Verbal Reasoning Practice',
    'Company-Specific Questions',
    'Study Materials Management',
    'Leaderboard & Analytics',
    'Secure Proctoring System',
    'Cross-Platform Student Stats',
    'LeetCode, HackerRank, Codeforces, CodeChef Sync',
    'Multi-Language Support',
    'Real-Time Code Execution',
    'Activity Tracking',
    'Custom Tenant Configuration',
    'Dedicated Technical Support'
  ];

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/917093012101?text=Hi, I want to get a white-labeled LMS for my institution', '_blank');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', position: 'relative', overflowX: 'hidden' }}>
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

      <Box sx={{ position: 'relative', overflow: 'hidden', py: { xs: 6, md: 10 }, mt: 8 }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
          <Stack alignItems="center" textAlign="center" spacing={4}>
            <MotionBox
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '3rem', sm: '4.5rem', md: '6rem' },
                  lineHeight: 1.05,
                  letterSpacing: '-2px',
                  maxWidth: '1000px',
                  mx: 'auto',
                  background: 'linear-gradient(180deg, #1A202C 0%, #4A5568 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Get Your Branded LMS
              </Typography>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Typography variant="h5" sx={{ color: '#64748b', maxWidth: '600px', mx: 'auto', lineHeight: 1.6, fontWeight: 400, fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
                Launch your own institution-ready platform with assessments, practice labs, analytics, and complete control over branding.
              </Typography>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  startIcon={<WhatsApp />}
                  onClick={handleWhatsAppContact}
                  sx={{
                    background: '#25D366',
                    color: '#fff',
                    px: 4,
                    py: 2,
                    borderRadius: '100px',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: '0 10px 25px rgba(37, 211, 102, 0.2)',
                    '&:hover': { background: '#20BA5A', transform: 'translateY(-2px)' },
                    transition: 'all 0.2s'
                  }}
                >
                  Contact on WhatsApp
                </Button>
                <Button
                  variant="outlined"
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
                  +91 7093012101
                </Button>
              </Stack>
            </MotionBox>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
        <MotionBox
          sx={{ textAlign: 'center', mb: { xs: 3.5, md: 5.5 } }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            Everything Included
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, fontSize: { xs: '1rem', md: '1.1rem' } }}>
            No hidden modules. Full LMS capability for your institution from day one.
          </Typography>
        </MotionBox>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2,
            gridAutoRows: '1fr'
          }}
        >
          {features.map((feature, index) => (
            <MotionCard
              key={feature}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: (index % 4) * 0.06 }}
              sx={{
                borderRadius: '24px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                height: '100%',
                width: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'rgba(0,0,0,0.15)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
                  transform: 'translateY(-4px)',
                  bgcolor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            >
              <CardContent sx={{ p: 2.25, height: '100%', display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <CheckCircle sx={{ color: '#25D366', fontSize: 20, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {feature}
                </Typography>
              </CardContent>
            </MotionCard>
          ))}
        </Box>
      </Container>

      <Container maxWidth="xl" sx={{ pb: { xs: 6, md: 9 } }}>
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          sx={{
            p: { xs: 3, sm: 4.5, md: 6 },
            borderRadius: '24px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(106,13,173,0.3) 0%, transparent 72%)',
              top: -130,
              right: -80
            }
          }}
        >
          <Chip
            label="Launch Support"
            sx={{
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.16)',
              color: '#f8ecff',
              fontWeight: 700
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 1.5,
              fontSize: { xs: '2rem', md: '2.8rem' },
              letterSpacing: '-1px',
              color: '#ffffff',
              position: 'relative',
              zIndex: 1
            }}
          >
            Ready to Launch Your LMS?
          </Typography>
          <Typography
            sx={{
              mb: 3,
              color: '#f3dcff',
              fontWeight: 500,
              fontSize: { xs: '0.96rem', md: '1.05rem' },
              position: 'relative',
              zIndex: 1
            }}
          >
            Let’s set up your branded portal for students, instructors, and admins.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<WhatsApp />}
            onClick={handleWhatsAppContact}
            sx={{
              px: { xs: 2.5, md: 4.5 },
              py: 1.5,
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: `${borderRadius}px`,
              bgcolor: '#25D366',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              position: 'relative',
              zIndex: 1,
              '&:hover': { bgcolor: '#20BA5A' }
            }}
          >
            WhatsApp: +91 7093012101
          </Button>
        </MotionCard>
      </Container>

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
