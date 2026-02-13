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
  Timer
} from '@mui/icons-material';
import useConfig from 'hooks/useConfig';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

export default function Services() {
  const navigate = useNavigate();
  const { state: { borderRadius } } = useConfig();

  const services = [
    { 
      icon: Code, 
      title: 'Practice Problems', 
      description: 'Solve coding problems across multiple difficulty levels and topics. Access 500+ curated problems with detailed solutions.',
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <PublicHeader />

      {/* Hero Section */}
      <Box sx={{ position: 'relative', overflow: 'hidden', py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 400,
              height: 400,
              background: 'radial-gradient(circle, rgba(103, 58, 183, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              top: -100,
              right: -50
            }
          }}
        />
        
        <Container maxWidth="md" sx={{ position: 'relative' }}>
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            sx={{ textAlign: 'center' }}
          >
            <Typography 
              variant="h1" 
              sx={{ 
                fontWeight: 800, 
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Our Services
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary" 
              sx={{ fontWeight: 400, lineHeight: 1.6, maxWidth: 700, mx: 'auto' }}
            >
              Everything you need to master coding and excel in your career
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      {/* Services Grid */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3
          }}
        >
          {services.map((service, index) => (
            <MotionCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: `${borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                  borderColor: `${service.color}.main`
                }
              }}
            >
              <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: `${service.color}.light`,
                    color: `${service.color}.main`,
                    mb: 2,
                    borderRadius: `${borderRadius / 2}px`
                  }}
                >
                  <service.icon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: 'text.heading' }}>
                  {service.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, flexGrow: 1 }}>
                  {service.description}
                </Typography>
              </CardContent>
            </MotionCard>
          ))}
        </Box>
      </Container>

      {/* Features Highlight */}
      <Box sx={{ bgcolor: 'background.paper', py: 10, mb: 8 }}>
        <Container maxWidth="lg">
          <MotionBox
            sx={{ textAlign: 'center', mb: 8 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800, 
                mb: 2,
                color: 'text.heading'
              }}
            >
              Why Students Choose Us
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ maxWidth: 700, mx: 'auto', fontWeight: 400 }}
            >
              Comprehensive features designed to accelerate your coding journey
            </Typography>
          </MotionBox>

          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 4
            }}
          >
            {[
              {
                title: 'Real-Time Code Execution',
                description: 'Execute code instantly across multiple programming languages. Get immediate feedback on syntax errors, runtime errors, and test case results.'
              },
              {
                title: 'Comprehensive Problem Library',
                description: 'Access 500+ carefully curated coding problems covering data structures, algorithms, system design, and more.'
              },
              {
                title: 'Detailed Analytics',
                description: 'Track your progress with comprehensive analytics. Identify strengths, weaknesses, and get personalized recommendations.'
              },
              {
                title: 'Competitive Environment',
                description: 'Compete with peers on leaderboards. Participate in timed challenges and showcase your problem-solving skills.'
              }
            ].map((feature, index) => (
              <MotionCard
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                sx={{ 
                  p: 4,
                  borderRadius: `${borderRadius}px`,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)'
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
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

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: '#fff', py: 6, mx: 3, mb: 3, borderRadius: `${borderRadius}px` }}>
        <Container maxWidth="lg">
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3}
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              © {new Date().getFullYear()} Orcadehub Innovations LLP. All rights reserved.
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
