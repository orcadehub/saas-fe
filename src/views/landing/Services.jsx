import { Box, Container, Typography, Card, CardContent, Stack, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DarkNavbar from 'components/DarkNavbar';
import AnimatedGridBackground from 'components/AnimatedGridBackground';
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
import StarryBackground from 'components/StarryBackground';
import CelestialCursor from 'components/CelestialCursor';
import tenantConfig from 'config/tenantConfig';
import { motion } from 'framer-motion';
import { LetterByLetterText } from 'components/ThemeElements';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);


export default function Services() {
  const navigate = useNavigate();
  const { state: { borderRadius } } = useConfig();

  const services = [
    { icon: Code, title: 'Practice Problems', description: 'Solve coding problems across multiple difficulty levels and topics. Access 500+ curated problems with detailed solutions.', color: '#2563eb' },
    { icon: Assessment, title: 'Assessments & Quizzes', description: 'Take timed assessments with programming and quiz questions. Get instant results and detailed performance analytics.', color: '#059669' },
    { icon: EmojiEvents, title: 'Leaderboard', description: 'Compete with peers and track your ranking in real-time. Climb the leaderboard and showcase your coding skills.', color: '#d97706' },
    { icon: Psychology, title: 'Online IDE', description: 'Write, test, and debug code with our powerful online IDE. Support for Python, Java, C++, and C with instant execution.', color: '#7c3aed' },
    { icon: SportsEsports, title: 'Interactive Labs', description: 'Learn through interactive coding labs and playgrounds. Practice concepts in a hands-on, engaging environment.', color: '#db2777' },
    { icon: SmartToy, title: 'AI Mock Interviews', description: 'Practice with AI-powered mock interview sessions. Get personalized feedback and improve your interview skills.', color: '#0891b2' },
    { icon: Speed, title: 'Instant Feedback', description: 'Get immediate results on test cases with detailed error messages, execution time, and optimization suggestions.', color: '#ea580c' },
    { icon: Security, title: 'Secure Proctoring', description: 'Tab switch detection, fullscreen monitoring, and session tracking ensure fair and secure assessments.', color: '#dc2626' },
    { icon: Analytics, title: 'Performance Analytics', description: 'Track your progress with detailed analytics. Get insights into your strengths and areas for improvement.', color: '#0d9488' },
    { icon: School, title: 'Structured Learning', description: 'Follow structured learning paths designed by industry experts. Learn at your own pace with clear milestones.', color: '#9333ea' },
    { icon: Group, title: 'Peer Learning', description: 'Connect with fellow learners, share solutions, and learn from each other in a collaborative environment.', color: '#4f46e5' },
    { icon: Timer, title: 'Time Management', description: 'Practice with timed challenges to improve your speed and efficiency in solving coding problems.', color: '#ca8a04' },
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
    <Box sx={{ color: '#1e293b', position: 'relative' }}>

      {/* Hero */}
      <Box sx={{ position: 'relative', overflow: 'hidden', py: { xs: 6, md: 10 }, mt: 8 }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
          <Stack alignItems="center" textAlign="center" spacing={4}>
            <MotionBox initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
              <LetterByLetterText 
                text="Our Services" 
                delay={0.1}
                sx={{
                  fontSize: { xs: '3.5rem', sm: '4.5rem', md: '6rem' },
                  background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}
              />
            </MotionBox>
            <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
              <Typography variant="h5" sx={{ color: '#64748b', maxWidth: '600px', mx: 'auto', lineHeight: 1.6, fontWeight: 500, fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
                Everything you need to master coding and excel in your career
              </Typography>
            </MotionBox>
            <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 4 }}>
                <Button variant="contained" onClick={() => navigate('/pricing')}
                  sx={{
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', px: 4, py: 2,
                    borderRadius: '100px', fontWeight: 700, fontSize: '1.1rem', textTransform: 'none',
                    boxShadow: '0 10px 30px rgba(124, 58, 237, 0.25)',
                    '&:hover': { background: 'linear-gradient(135deg, #6d28d9, #4338ca)', transform: 'translateY(-2px)', boxShadow: '0 15px 40px rgba(124, 58, 237, 0.35)' },
                    transition: 'all 0.3s',
                  }}>View Pricing</Button>
                <Button variant="outlined" onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'rgba(0,0,0,0.12)', color: '#475569', px: 4, py: 2, borderRadius: '100px',
                    fontWeight: 700, fontSize: '1.1rem', textTransform: 'none', background: 'rgba(255,255,255,0.8)',
                    '&:hover': { borderColor: 'rgba(124, 58, 237, 0.4)', background: 'rgba(124, 58, 237, 0.05)' }, transition: 'all 0.3s',
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
                borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)',
                bgcolor: '#ffffff', backdropFilter: 'blur(20px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.02)', transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                '&:hover': {
                  boxShadow: `0 25px 50px rgba(0,0,0,0.06), 0 0 0 1px ${service.color}10`,
                  borderColor: `${service.color}30`,
                  bgcolor: '#ffffff',
                },
              }}
            >
              <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Box sx={{
                  width: 72, height: 72, borderRadius: '20px',
                  background: `${service.color}08`, border: `1px solid ${service.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mb: 2.5, color: service.color,
                  boxShadow: `0 8px 24px ${service.color}10`,
                }}>
                  <service.icon sx={{ fontSize: 36 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.25, fontSize: '1.15rem', letterSpacing: '-0.3px', color: '#0f172a' }}>
                  {service.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.65, flexGrow: 1, fontWeight: 500 }}>
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
              background: 'linear-gradient(135deg, #0f172a, #334155)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Everything Included
            </Typography>
            <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 500, fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Same complete package available on our pricing plan.
            </Typography>
          </MotionBox>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, gridAutoRows: '1fr' }}>
            {includedFeatures.map((feature, index) => (
              <MotionCard key={feature} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.35, delay: (index % 4) * 0.06 }}
                sx={{
                  borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', bgcolor: '#ffffff',
                  backdropFilter: 'blur(20px)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                  height: '100%', width: '100%', transition: 'all 0.3s ease',
                  '&:hover': { borderColor: 'rgba(124, 58, 237, 0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', transform: 'translateY(-4px)' },
                }}
              >
                <CardContent sx={{ p: 2.25, height: '100%', display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <CheckCircle sx={{ color: '#7c3aed', fontSize: 20, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>{feature}</Typography>
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
              background: 'linear-gradient(135deg, #0f172a, #334155)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Why Students Choose Us
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 760, mx: 'auto', fontWeight: 500, fontSize: { xs: '1rem', md: '1.1rem' }, color: '#64748b' }}>
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
                  p: { xs: 2.5, md: 3.25 }, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)',
                  bgcolor: '#ffffff', backdropFilter: 'blur(20px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.02)', transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' },
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.2, color: '#0f172a', fontSize: { xs: '1.2rem', md: '1.4rem' } }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.7, fontWeight: 500 }}>
                  {feature.description}
                </Typography>
              </MotionCard>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{
        borderTop: '1px solid rgba(0,0,0,0.05)', py: 6, position: 'relative', zIndex: 10,
        background: '#ffffff',
      }}>
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={3}>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              © {new Date().getFullYear()}{' '}
              <Typography component="a" href="https://orcadehub.com" target="_blank" rel="noopener noreferrer"
                sx={{ color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#7c3aed' }, transition: 'color 0.3s' }}
              >Orcadehub Innovations LLP</Typography>. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={4}>
              {['X / Twitter', 'GitHub', 'LinkedIn'].map((link) => (
                <Typography key={link} variant="body2" component="a" href="#"
                  sx={{ color: '#94a3b8', fontWeight: 600, textDecoration: 'none', '&:hover': { color: '#7c3aed' }, transition: 'color 0.3s' }}
                >{link}</Typography>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

