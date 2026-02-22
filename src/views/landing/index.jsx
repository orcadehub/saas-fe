import { Box, Container, Stack, Card, CardContent, Typography, Button, Avatar, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Code,
  Assessment,
  EmojiEvents,
  Speed,
  Security,
  TrendingUp,
  CheckCircleOutline,
  Groups,
  Timer,
  Psychology
} from '@mui/icons-material';
import PublicHeader from 'components/PublicHeader';
import useConfig from 'hooks/useConfig';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

export default function Landing() {
  const navigate = useNavigate();
  const {
    state: { borderRadius }
  } = useConfig();

  const stats = [
    { value: '10K+', label: 'Active Students' },
    { value: '500+', label: 'Practice Problems' },
    { value: '95%', label: 'Success Rate' },
    { value: '24/7', label: 'Support' }
  ];

  const features = [
    {
      icon: Code,
      title: 'Real-Time Code Execution',
      description: 'Practice in Python, Java, C++, and C with immediate output and fast feedback.',
      color: 'secondary'
    },
    {
      icon: Assessment,
      title: 'Structured Assessments',
      description: 'Run timed assessments with coding + quiz sections and clear performance analysis.',
      color: 'primary'
    },
    {
      icon: EmojiEvents,
      title: 'Leaderboard & Ranking',
      description: 'Track progress against peers through transparent scoring and ranking updates.',
      color: 'secondary'
    },
    {
      icon: Psychology,
      title: 'AI Mock Interviews',
      description: 'Improve interview readiness with guided mock interview sessions and feedback.',
      color: 'primary'
    },
    {
      icon: Speed,
      title: 'Instant Evaluation',
      description: 'Review outcomes quickly with execution details, correctness, and attempt insights.',
      color: 'secondary'
    },
    {
      icon: Security,
      title: 'Secure Proctoring',
      description: 'Enable tab-switch and fullscreen controls for more reliable test environments.',
      color: 'primary'
    }
  ];

  const benefits = [
    'Curated coding and aptitude practice',
    'Real-time compiler and IDE workflow',
    'Detailed performance analytics',
    'Clear improvement roadmap for students'
  ];

  const howItWorks = [
    {
      step: '01',
      icon: Groups,
      title: 'Login & Onboard',
      description: 'Students log in and access a clean dashboard with goals, topics, and recommended tracks.'
    },
    {
      step: '02',
      icon: Code,
      title: 'Practice & Learn',
      description: 'Use labs, IDE, and guided question sets across programming, aptitude, and company-specific prep.'
    },
    {
      step: '03',
      icon: Timer,
      title: 'Take Timed Assessments',
      description: 'Simulate real tests through timed assessments, quizzes, and monitored attempts.'
    },
    {
      step: '04',
      icon: TrendingUp,
      title: 'Track Growth',
      description: 'Analyze reports and ranking trends to identify gaps and continuously improve outcomes.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f3f6fb' }}>
      <PublicHeader />

      <Box sx={{ py: { xs: 6, md: 9 } }}>
        <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <MotionCard
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42 }}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: `${borderRadius}px`,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: '#fff',
              boxShadow: '0 8px 22px rgba(16, 24, 40, 0.07)'
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
                gap: { xs: 2.5, md: 3.5 },
                alignItems: 'stretch'
              }}
            >
              <Box sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
                <Chip
                  label="Professional LMS Platform"
                  sx={{
                    mb: 2,
                    width: 'fit-content',
                    bgcolor: 'rgba(106,13,173,0.12)',
                    color: '#6a0dad',
                    fontWeight: 700
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{ fontWeight: 800, lineHeight: 1.08, mb: 2, fontSize: { xs: '2rem', sm: '2.4rem', md: '2.9rem' } }}
                >
                  Master Coding Through Structured Practice
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontWeight: 400, lineHeight: 1.65, fontSize: { xs: '1rem', md: '1.08rem' }, mb: 3 }}
                >
                  A focused learning system with coding practice, assessments, interview prep, and measurable performance tracking.
                </Typography>

                <Stack spacing={1.25} sx={{ mb: 3 }}>
                  {benefits.map((item) => (
                    <Stack key={item} direction="row" spacing={1.1} sx={{ alignItems: 'center' }}>
                      <CheckCircleOutline sx={{ color: '#16a34a', fontSize: 20 }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      px: 3.2,
                      py: 1.35,
                      borderRadius: `${borderRadius}px`,
                      fontWeight: 700,
                      textTransform: 'none',
                      bgcolor: '#6a0dad',
                      '&:hover': { bgcolor: '#570b8c' }
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/services')}
                    sx={{
                      px: 3.2,
                      py: 1.35,
                      borderRadius: `${borderRadius}px`,
                      fontWeight: 700,
                      textTransform: 'none'
                    }}
                  >
                    View Services
                  </Button>
                </Stack>
              </Box>

              <Box sx={{ overflow: 'hidden', borderRadius: `${Math.max(borderRadius - 4, 8)}px` }}>
                <Box
                  component="img"
                  src="https://images.pexels.com/photos/5483077/pexels-photo-5483077.jpeg"
                  alt="Students coding"
                  sx={{ width: '100%', height: '100%', minHeight: { xs: 250, md: 430 }, objectFit: 'cover' }}
                />
              </Box>
            </Box>
          </MotionCard>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: { xs: 5, md: 7 } }}>
        <Card
          sx={{
            p: { xs: 2.5, md: 3.25 },
            borderRadius: `${borderRadius}px`,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 22px rgba(16, 24, 40, 0.07)'
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            {stats.map((stat) => (
              <Box key={stat.label} sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#6a0dad', fontSize: { xs: '1.55rem', md: '1.95rem' } }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 5, md: 8 } }}>
        <MotionBox
          sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1.2, fontSize: { xs: '1.8rem', md: '2.35rem' } }}>
            Key Platform Capabilities
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontWeight: 400, fontSize: { xs: '1rem', md: '1.08rem' }, maxWidth: 720, mx: 'auto' }}
          >
            Built for institutions and students who need a practical, measurable, and scalable learning environment.
          </Typography>
        </MotionBox>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 2,
            gridAutoRows: '1fr'
          }}
        >
          {features.map((feature, index) => (
            <MotionCard
              key={feature.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.32, delay: (index % 3) * 0.07 }}
              sx={{
                height: '100%',
                borderRadius: `${borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
                '&:hover': { boxShadow: '0 10px 22px rgba(15, 23, 42, 0.12)' }
              }}
            >
              <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Avatar
                  sx={{
                    width: 54,
                    height: 54,
                    bgcolor: `${feature.color}.light`,
                    color: `${feature.color}.main`,
                    mb: 1.8,
                    borderRadius: `${borderRadius / 2}px`
                  }}
                >
                  <feature.icon sx={{ fontSize: 26 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  {feature.description}
                </Typography>
              </CardContent>
            </MotionCard>
          ))}
        </Box>
      </Container>

      <Box sx={{ bgcolor: '#ffffff', py: { xs: 6, md: 8 }, mb: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <MotionBox
            sx={{ textAlign: 'center', mb: { xs: 3, md: 4.5 } }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 1.2, fontSize: { xs: '1.8rem', md: '2.35rem' } }}>
              How It Works
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 400, fontSize: { xs: '1rem', md: '1.08rem' }, maxWidth: 700, mx: 'auto' }}
            >
              A simple, disciplined workflow from onboarding to measurable improvement.
            </Typography>
          </MotionBox>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            {howItWorks.map((item, index) => (
              <MotionCard
                key={item.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -14 : 14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.32, delay: index * 0.07 }}
                sx={{
                  p: { xs: 2.3, md: 2.8 },
                  borderRadius: `${borderRadius}px`,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)'
                }}
              >
                <Stack direction="row" spacing={1.4} sx={{ alignItems: 'flex-start' }}>
                  <Avatar sx={{ width: 46, height: 46, bgcolor: 'rgba(106,13,173,0.12)', color: '#6a0dad', fontWeight: 800 }}>
                    {item.step}
                  </Avatar>
                  <Box>
                    <Stack direction="row" spacing={0.9} sx={{ alignItems: 'center', mb: 0.7 }}>
                      <item.icon sx={{ color: '#6a0dad', fontSize: 19 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {item.title}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                      {item.description}
                    </Typography>
                  </Box>
                </Stack>
              </MotionCard>
            ))}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ pb: { xs: 6, md: 9 } }}>
        <MotionCard
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          sx={{
            p: { xs: 3, sm: 4.5, md: 5.5 },
            borderRadius: `${borderRadius}px`,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #4b0579 0%, #6a0dad 60%, #7a1fbe 100%)',
            color: '#fff',
            boxShadow: '0 20px 48px rgba(75, 5, 121, 0.3)'
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.3, color: '#ffffff', fontSize: { xs: '1.65rem', md: '2.1rem' } }}>
            Ready to Level Up Your Coding Skills?
          </Typography>
          <Typography sx={{ mb: 3, color: '#f5e9ff', fontWeight: 500, fontSize: { xs: '0.96rem', md: '1.04rem' } }}>
            Join students building confidence through practice, assessments, and consistent performance tracking.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              px: { xs: 3, md: 4.3 },
              py: 1.35,
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: `${borderRadius}px`,
              bgcolor: '#25D366',
              '&:hover': { bgcolor: '#20BA5A' }
            }}
          >
            Start Now
          </Button>
        </MotionCard>
      </Container>

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
