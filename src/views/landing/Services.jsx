import { Box, Container, Typography, Card, CardContent, Avatar, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PublicHeader from 'components/PublicHeader';
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

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <PublicHeader />

      <Box sx={{ position: 'relative', overflow: 'hidden', py: { xs: 6, md: 10 } }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 18% 10%, rgba(106,13,173,0.1), transparent 34%), radial-gradient(circle at 80% 0%, rgba(37,211,102,0.1), transparent 28%)',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 340,
              height: 340,
              background: 'radial-gradient(circle, rgba(106,13,173,0.16) 0%, transparent 70%)',
              borderRadius: '50%',
              top: -120,
              right: -80
            }
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            sx={{
              borderRadius: `${borderRadius}px`,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'rgba(255,255,255,0.9)',
              boxShadow: '0 14px 34px rgba(15, 23, 42, 0.08)',
              px: { xs: 2.5, sm: 4, md: 6 },
              py: { xs: 4, sm: 5, md: 6 },
              textAlign: 'center'
            }}
          >
            <Typography
              variant="overline"
              sx={{
                display: 'inline-block',
                px: 1.5,
                py: 0.5,
                borderRadius: 999,
                bgcolor: 'rgba(106,13,173,0.1)',
                color: '#6a0dad',
                letterSpacing: 0.5,
                fontWeight: 700,
                mb: 2
              }}
            >
              Our Services
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.4rem', md: '3rem' }
              }}
            >
              Our Services
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontWeight: 400,
                lineHeight: 1.65,
                maxWidth: 760,
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' },
                mb: 3
              }}
            >
              Everything you need to master coding and excel in your career
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => navigate('/pricing')}
                sx={{
                  borderRadius: `${borderRadius}px`,
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: '#6a0dad',
                  '&:hover': { bgcolor: '#570b8c' }
                }}
              >
                View Pricing
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  borderRadius: `${borderRadius}px`,
                  textTransform: 'none',
                  fontWeight: 700
                }}
              >
                Go to Login
              </Button>
            </Stack>
          </MotionBox>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
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
                borderRadius: `${borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
                  borderColor: service.color === 'primary' ? '#6a0dad' : '#25D366'
                }
              }}
            >
              <CardContent
                sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
              >
                <Avatar
                  sx={{
                    width: 58,
                    height: 58,
                    bgcolor: `${service.color}.light`,
                    color: `${service.color}.main`,
                    mb: 2,
                    borderRadius: `${borderRadius / 2}px`
                  }}
                >
                  <service.icon sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.25 }}>
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
        <Container maxWidth="lg" sx={{ mb: { xs: 5, md: 7 } }}>
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
                  borderRadius: `${borderRadius}px`,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
                  height: '100%',
                  width: '100%',
                  '&:hover': {
                    borderColor: '#6a0dad',
                    boxShadow: '0 10px 22px rgba(106, 13, 173, 0.12)'
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

        <Container maxWidth="lg">
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
                  borderRadius: `${borderRadius}px`,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)'
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.2, color: '#6a0dad', fontSize: { xs: '1.2rem', md: '1.4rem' } }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {feature.description}
                </Typography>
              </MotionCard>
            ))}
          </Box>
        </Container>
      </Box>

      <Box sx={{ bgcolor: 'grey.900', color: '#fff', py: 5 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              © {new Date().getFullYear()}{' '}
              <Typography
                component="a"
                href="https://orcadehub.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#fff',
                  opacity: 0.8,
                  textDecoration: 'none',
                  '&:hover': { opacity: 1, textDecoration: 'underline' }
                }}
              >
                Orcadehub Innovations LLP
              </Typography>
              . All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              <Button
                onClick={() => navigate('/')}
                sx={{
                  color: '#fff',
                  opacity: 0.8,
                  textTransform: 'none',
                  '&:hover': { opacity: 1 }
                }}
              >
                Home
              </Button>
              <Button
                onClick={() => navigate('/login')}
                sx={{
                  color: '#fff',
                  opacity: 0.8,
                  textTransform: 'none',
                  '&:hover': { opacity: 1 }
                }}
              >
                Login
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
