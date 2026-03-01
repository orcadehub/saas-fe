import { Box, Container, Typography, Card, CardContent, Avatar, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LandingHeader from 'components/LandingHeader';
import {
  Code,
  Assessment,
  EmojiEvents,
  Psychology,
  SmartToy,
  SportsEsports,
  Speed,
  Security,
  Analytics,
  School,
  Group,
  Timer,
  CheckCircle
} from '@mui/icons-material';
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

export default function Services() {
  const navigate = useNavigate();
  const {
    state: { borderRadius }
  } = useConfig();

  const services = [
    {
      icon: Code,
      title: 'Practice Problems',
      description:
        'Solve coding problems across multiple difficulty levels and topics. Access 500+ curated problems with detailed solutions.',
      color: 'secondary'
    },
    {
      icon: Assessment,
      title: 'Assessments & Quizzes',
      description: 'Take timed assessments with programming and quiz questions. Get instant results and detailed performance analytics.',
      color: 'primary'
    },
    {
      icon: EmojiEvents,
      title: 'Leaderboard',
      description: 'Compete with peers and track your ranking in real-time. Climb the leaderboard and showcase your coding skills.',
      color: 'secondary'
    },
    {
      icon: Psychology,
      title: 'Online IDE',
      description: 'Write, test, and debug code with our powerful online IDE. Support for Python, Java, C++, and C with instant execution.',
      color: 'primary'
    },
    {
      icon: SportsEsports,
      title: 'Interactive Labs',
      description: 'Learn through interactive coding labs and playgrounds. Practice concepts in a hands-on, engaging environment.',
      color: 'secondary'
    },
    {
      icon: SmartToy,
      title: 'AI Mock Interviews',
      description: 'Practice with AI-powered mock interview sessions. Get personalized feedback and improve your interview skills.',
      color: 'primary'
    },
    {
      icon: Speed,
      title: 'Instant Feedback',
      description: 'Get immediate results on test cases with detailed error messages, execution time, and optimization suggestions.',
      color: 'secondary'
    },
    {
      icon: Security,
      title: 'Secure Proctoring',
      description: 'Tab switch detection, fullscreen monitoring, and session tracking ensure fair and secure assessments.',
      color: 'primary'
    },
    {
      icon: Analytics,
      title: 'Performance Analytics',
      description: 'Track your progress with detailed analytics. Get insights into your strengths and areas for improvement.',
      color: 'secondary'
    },
    {
      icon: School,
      title: 'Structured Learning',
      description: 'Follow structured learning paths designed by industry experts. Learn at your own pace with clear milestones.',
      color: 'primary'
    },
    {
      icon: Group,
      title: 'Peer Learning',
      description: 'Connect with fellow learners, share solutions, and learn from each other in a collaborative environment.',
      color: 'secondary'
    },
    {
      icon: Timer,
      title: 'Time Management',
      description: 'Practice with timed challenges to improve your speed and efficiency in solving coding problems.',
      color: 'primary'
    }
  ];

  const includedFeatures = [
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
                Our Services
              </Typography>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Typography variant="h5" sx={{ color: '#64748b', maxWidth: '600px', mx: 'auto', lineHeight: 1.6, fontWeight: 400, fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
                Everything you need to master coding and excel in your career
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
                  onClick={() => navigate('/pricing')}
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
                  View Pricing
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
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
                  Go to Login
                </Button>
              </Stack>
            </MotionBox>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2.25,
            gridAutoRows: '1fr'
          }}
        >
          {services.map((service, index) => (
            <MotionCard
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: (index % 4) * 0.06 }}
              whileHover={{
                y: -8,
                transition: { duration: 0.2 }
              }}
              sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '24px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                  borderColor: 'rgba(0,0,0,0.15)',
                  transform: 'translateY(-4px)',
                  bgcolor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            >
              <CardContent
                sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${service.color}.light 15%, ${service.color}.lighter 5%)`,
                    border: `1px solid`,
                    borderColor: `${service.color}.light`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2.5,
                    color: `${service.color}.main`,
                    boxShadow: `0 8px 16px rgba(0,0,0,0.08)`
                  }}
                >
                  <service.icon sx={{ fontSize: 36 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.25, fontSize: '1.15rem', letterSpacing: '-0.3px' }}>
                  {service.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, flexGrow: 1 }}>
                  {service.description}
                </Typography>
              </CardContent>
            </MotionCard>
          ))}
        </Box>
      </Container>

      <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 }, mb: { xs: 5, md: 7 } }}>
        <Container maxWidth="xl" sx={{ mb: { xs: 5, md: 7 } }}>
          <MotionBox
            sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              Everything Included
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Same complete package available on our pricing plan.
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
            {includedFeatures.map((feature, index) => (
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

        <Container maxWidth="xl">
          <MotionBox
            sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '1.8rem', md: '2.4rem' }
              }}
            >
              Why Students Choose Us
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 760, mx: 'auto', fontWeight: 400, fontSize: { xs: '1rem', md: '1.1rem' } }}
            >
              Comprehensive features designed to accelerate your coding journey
            </Typography>
          </MotionBox>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2.25
            }}
          >
            {[
              {
                title: 'Real-Time Code Execution',
                description:
                  'Execute code instantly across multiple programming languages. Get immediate feedback on syntax errors, runtime errors, and test case results.'
              },
              {
                title: 'Comprehensive Problem Library',
                description: 'Access 500+ carefully curated coding problems covering data structures, algorithms, system design, and more.'
              },
              {
                title: 'Detailed Analytics',
                description:
                  'Track your progress with comprehensive analytics. Identify strengths, weaknesses, and get personalized recommendations.'
              },
              {
                title: 'Competitive Environment',
                description: 'Compete with peers on leaderboards. Participate in timed challenges and showcase your problem-solving skills.'
              }
            ].map((feature, index) => (
              <MotionCard
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                sx={{
                  p: { xs: 2.5, md: 3.25 },
                  borderRadius: '24px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                    bgcolor: 'rgba(255, 255, 255, 0.9)'
                  }
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.2, color: '#1e293b', fontSize: { xs: '1.2rem', md: '1.4rem' } }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.7 }}>
                  {feature.description}
                </Typography>
              </MotionCard>
            ))}
          </Box>
        </Container>
      </Box>

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
