import { Box, Container, Typography, Card, CardContent, Stack, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
  CheckCircle,
  Menu as MenuIcon,
  Close as CloseIcon,
  AutoAwesomeRounded
} from '@mui/icons-material';
import useConfig from 'hooks/useConfig';
import StarryBackground from 'components/StarryBackground';
import CelestialCursor from 'components/CelestialCursor';
import tenantConfig from 'config/tenantConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

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

export default function Services() {
  const navigate = useNavigate();
  const { state: { borderRadius } } = useConfig();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  const services = [
    { icon: Code, title: 'Practice Problems', description: 'Solve coding problems across multiple difficulty levels and topics. Access 500+ curated problems with detailed solutions.', color: '#3B82F6' },
    { icon: Assessment, title: 'Assessments & Quizzes', description: 'Take timed assessments with programming and quiz questions. Get instant results and detailed performance analytics.', color: '#10B981' },
    { icon: EmojiEvents, title: 'Leaderboard', description: 'Compete with peers and track your ranking in real-time. Climb the leaderboard and showcase your coding skills.', color: '#F59E0B' },
    { icon: Psychology, title: 'Online IDE', description: 'Write, test, and debug code with our powerful online IDE. Support for Python, Java, C++, and C with instant execution.', color: '#8b5cf6' },
    { icon: SportsEsports, title: 'Interactive Labs', description: 'Learn through interactive coding labs and playgrounds. Practice concepts in a hands-on, engaging environment.', color: '#EC4899' },
    { icon: SmartToy, title: 'AI Mock Interviews', description: 'Practice with AI-powered mock interview sessions. Get personalized feedback and improve your interview skills.', color: '#06b6d4' },
    { icon: Speed, title: 'Instant Feedback', description: 'Get immediate results on test cases with detailed error messages, execution time, and optimization suggestions.', color: '#f97316' },
    { icon: Security, title: 'Secure Proctoring', description: 'Tab switch detection, fullscreen monitoring, and session tracking ensure fair and secure assessments.', color: '#ef4444' },
    { icon: Analytics, title: 'Performance Analytics', description: 'Track your progress with detailed analytics. Get insights into your strengths and areas for improvement.', color: '#14b8a6' },
    { icon: School, title: 'Structured Learning', description: 'Follow structured learning paths designed by industry experts. Learn at your own pace with clear milestones.', color: '#a855f7' },
    { icon: Group, title: 'Peer Learning', description: 'Connect with fellow learners, share solutions, and learn from each other in a collaborative environment.', color: '#6366f1' },
    { icon: Timer, title: 'Time Management', description: 'Practice with timed challenges to improve your speed and efficiency in solving coding problems.', color: '#eab308' },
  ];

  const includedFeatures = [
    'Fully White-Labeled Platform', 'Custom Branding & Logo', 'Your Own Domain', 'Complete Admin Control',
    'Instructor Management Controls', 'Student Management System', 'Assessment & Quiz Engine', 'Online IDE Integration',
    'AI Mock Interview Module', 'Interactive Labs', 'Gamified Aptitude Assessments', 'Quantitative Reasoning Practice',
    'Verbal Reasoning Practice', 'Company-Specific Questions', 'Study Materials Management', 'Leaderboard & Analytics',
    'Secure Proctoring System', 'Cross-Platform Student Stats', 'LeetCode, HackerRank, Codeforces, CodeChef Sync',
    'Multi-Language Support', 'Real-Time Code Execution', 'Activity Tracking', 'Custom Tenant Configuration', 'Dedicated Technical Support',
  ];

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
                Our Services
              </Typography>
            </MotionBox>
            <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
              <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.45)', maxWidth: '600px', mx: 'auto', lineHeight: 1.6, fontWeight: 400, fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
                Everything you need to master coding and excel in your career
              </Typography>
            </MotionBox>
            <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 4 }}>
                <Button variant="contained" onClick={() => navigate('/pricing')}
                  sx={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', px: 4, py: 2,
                    borderRadius: '100px', fontWeight: 600, fontSize: '1.1rem', textTransform: 'none',
                    boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)',
                    '&:hover': { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', transform: 'translateY(-2px)', boxShadow: '0 15px 50px rgba(139, 92, 246, 0.4)' },
                    transition: 'all 0.3s',
                  }}>View Pricing</Button>
                <Button variant="outlined" onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.12)', color: '#e2e8f0', px: 4, py: 2, borderRadius: '100px',
                    fontWeight: 600, fontSize: '1.1rem', textTransform: 'none', background: 'rgba(255,255,255,0.03)',
                    '&:hover': { borderColor: 'rgba(139,92,246,0.4)', background: 'rgba(139,92,246,0.08)' }, transition: 'all 0.3s',
                  }}>Go to Login</Button>
              </Stack>
            </MotionBox>
          </Stack>
        </Container>
      </Box>

      {/* Services grid */}
      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2.25, gridAutoRows: '1fr',
        }}>
          {services.map((service, index) => (
            <MotionCard
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: (index % 4) * 0.06 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              sx={{
                height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)',
                bgcolor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)', transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                '&:hover': {
                  boxShadow: `0 25px 50px rgba(0,0,0,0.3), 0 0 0 1px ${service.color}30`,
                  borderColor: `${service.color}30`,
                  bgcolor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Box sx={{
                  width: 72, height: 72, borderRadius: '20px',
                  background: `${service.color}15`, border: `1px solid ${service.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mb: 2.5, color: service.color,
                  boxShadow: `0 8px 24px ${service.color}15`,
                }}>
                  <service.icon sx={{ fontSize: 36 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.25, fontSize: '1.15rem', letterSpacing: '-0.3px', color: '#f1f5f9' }}>
                  {service.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, flexGrow: 1 }}>
                  {service.description}
                </Typography>
              </CardContent>
            </MotionCard>
          ))}
        </Box>
      </Container>

      {/* Everything Included */}
      <Box sx={{ py: { xs: 6, md: 8 }, mb: { xs: 5, md: 7 } }}>
        <Container maxWidth="xl" sx={{ mb: { xs: 5, md: 7 } }}>
          <MotionBox sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
            <Typography variant="h2" sx={{
              fontWeight: 800, mb: 1.5, fontSize: { xs: '1.8rem', md: '2.4rem' },
              background: 'linear-gradient(135deg, #ffffff, #c4b5fd)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Everything Included
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Same complete package available on our pricing plan.
            </Typography>
          </MotionBox>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, gridAutoRows: '1fr' }}>
            {includedFeatures.map((feature, index) => (
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

        {/* Why Students Choose Us */}
        <Container maxWidth="xl">
          <MotionBox sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
            <Typography variant="h2" sx={{
              fontWeight: 800, mb: 2, fontSize: { xs: '1.8rem', md: '2.4rem' },
              background: 'linear-gradient(135deg, #ffffff, #c4b5fd)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Why Students Choose Us
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 760, mx: 'auto', fontWeight: 400, fontSize: { xs: '1rem', md: '1.1rem' }, color: 'rgba(255,255,255,0.4)' }}>
              Comprehensive features designed to accelerate your coding journey
            </Typography>
          </MotionBox>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.25 }}>
            {[
              { title: 'Real-Time Code Execution', description: 'Execute code instantly across multiple programming languages. Get immediate feedback on syntax errors, runtime errors, and test case results.' },
              { title: 'Comprehensive Problem Library', description: 'Access 500+ carefully curated coding problems covering data structures, algorithms, system design, and more.' },
              { title: 'Detailed Analytics', description: 'Track your progress with comprehensive analytics. Identify strengths, weaknesses, and get personalized recommendations.' },
              { title: 'Competitive Environment', description: 'Compete with peers on leaderboards. Participate in timed challenges and showcase your problem-solving skills.' },
            ].map((feature, index) => (
              <MotionCard key={feature.title} initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                sx={{
                  p: { xs: 2.5, md: 3.25 }, borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)',
                  bgcolor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)', transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', bgcolor: 'rgba(255,255,255,0.05)' },
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.2, color: '#f1f5f9', fontSize: { xs: '1.2rem', md: '1.4rem' } }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                  {feature.description}
                </Typography>
              </MotionCard>
            ))}
          </Box>
        </Container>
      </Box>

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
