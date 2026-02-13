import { Box, Container, Stack, Card, CardContent, Typography, Button, Avatar } from '@mui/material';
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
  const { state: { borderRadius } } = useConfig();

  const stats = [
    { value: '10K+', label: 'Active Students' },
    { value: '500+', label: 'Practice Problems' },
    { value: '95%', label: 'Success Rate' },
    { value: '24/7', label: 'Support Available' }
  ];

  const features = [
    { 
      icon: Code, 
      title: 'Real-Time Code Execution',
      description: 'Write, test, and debug code instantly with support for Python, Java, C++, and C. Get immediate feedback on your solutions.',
      color: 'secondary'
    },
    { 
      icon: Assessment, 
      title: 'Comprehensive Assessments',
      description: 'Take timed coding assessments with programming and quiz questions. Track your performance with detailed analytics.',
      color: 'primary'
    },
    { 
      icon: EmojiEvents, 
      title: 'Competitive Leaderboard',
      description: 'Compete with peers, climb the leaderboard, and showcase your coding skills. Track your ranking in real-time.',
      color: 'secondary'
    },
    { 
      icon: Psychology, 
      title: 'AI Mock Interviews',
      description: 'Practice with AI-powered mock interview sessions. Get personalized feedback to ace your technical interviews.',
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
    }
  ];

  const benefits = [
    'Practice with 500+ coding problems',
    'Real-time code compilation and execution',
    'Detailed performance analytics',
    'Comprehensive progress tracking'
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <PublicHeader />

      {/* Hero Section */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 600,
              height: 600,
              background: 'radial-gradient(circle, rgba(103, 58, 183, 0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              top: -200,
              right: -100
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              width: 400,
              height: 400,
              background: 'radial-gradient(circle, rgba(33, 150, 243, 0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              bottom: -100,
              left: -50
            }
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 8, md: 12 } }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={6} 
            sx={{ alignItems: 'center' }}
          >
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <MotionBox
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
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
                  Master Coding Through Practice
                </Typography>
              </MotionBox>
              
              <MotionBox
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 4, 
                    color: 'text.secondary',
                    fontWeight: 400,
                    lineHeight: 1.6
                  }}
                >
                  Comprehensive coding assessments, real-time evaluation, and instant feedback to accelerate your programming journey
                </Typography>
              </MotionBox>

              <MotionBox
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Stack spacing={2} sx={{ mb: 4 }}>
                  {benefits.map((benefit, index) => (
                    <Stack key={index} direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                      <CheckCircleOutline sx={{ color: 'success.main', fontSize: 24 }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {benefit}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </MotionBox>

              <MotionBox
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    px: 5, 
                    py: 2, 
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: `${borderRadius}px`,
                    boxShadow: '0 8px 24px rgba(103, 58, 183, 0.25)',
                    bgcolor: 'secondary.main',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(103, 58, 183, 0.35)',
                      bgcolor: 'secondary.dark'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Start Learning Now
                </Button>
              </MotionBox>
            </Box>

            <MotionBox
              sx={{ flex: 1, maxWidth: { xs: '100%', md: 500 } }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Box
                component="img"
                src="https://images.pexels.com/photos/5483077/pexels-photo-5483077.jpeg"
                alt="Students coding - cottonbro studio on Pexels"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: `${borderRadius}px`,
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              />
            </MotionBox>
          </Stack>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 6, mx: 3, mt: -4, mb: 8, borderRadius: `${borderRadius}px`, boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)', border: '1px solid', borderColor: 'divider', position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={4}
            sx={{ justifyContent: 'space-around', alignItems: 'center' }}
          >
            {stats.map((stat, index) => (
              <MotionBox
                key={index}
                sx={{ textAlign: 'center' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 800, 
                    mb: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {stat.label}
                </Typography>
              </MotionBox>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
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
            Why Choose Our Platform?
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: 700, mx: 'auto', fontWeight: 400 }}
          >
            Everything you need to excel in coding assessments and technical interviews
          </Typography>
        </MotionBox>

        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3
          }}
        >
          {features.map((feature, index) => (
            <MotionCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
              sx={{ 
                height: '100%',
                borderRadius: `${borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                  borderColor: `${feature.color}.main`
                }
              }}
            >
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: `${feature.color}.light`,
                    color: `${feature.color}.main`,
                    mb: 3,
                    borderRadius: `${borderRadius / 2}px`
                  }}
                >
                  <feature.icon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.heading' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, flexGrow: 1 }}>
                  {feature.description}
                </Typography>
              </CardContent>
            </MotionCard>
          ))}
        </Box>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 10, my: 8 }}>
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
              How It Works
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ maxWidth: 600, mx: 'auto', fontWeight: 400 }}
            >
              Get started in three simple steps
            </Typography>
          </MotionBox>

          <Stack spacing={6}>
            {[
              {
                step: '01',
                icon: Groups,
                title: 'Sign Up & Join',
                description: 'Create your account and join thousands of students learning to code. Choose your learning path based on your goals.'
              },
              {
                step: '02',
                icon: Code,
                title: 'Practice & Learn',
                description: 'Access 500+ coding problems across multiple topics. Practice with our online IDE supporting Python, Java, C++, and C.'
              },
              {
                step: '03',
                icon: TrendingUp,
                title: 'Track & Excel',
                description: 'Take assessments, compete on leaderboards, and track your progress with detailed analytics and personalized insights.'
              }
            ].map((step, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Stack 
                  direction={{ xs: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' }} 
                  spacing={4}
                  sx={{ alignItems: 'center' }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Card
                      sx={{
                        p: 4,
                        borderRadius: `${borderRadius}px`,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)',
                        bgcolor: 'background.paper'
                      }}
                    >
                      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
                        <Typography 
                          variant="h1" 
                          sx={{ 
                            fontWeight: 800, 
                            fontSize: '4rem',
                            opacity: 0.1,
                            lineHeight: 1
                          }}
                        >
                          {step.step}
                        </Typography>
                        <Box>
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: 'secondary.light',
                              color: 'secondary.main',
                              mb: 2,
                              borderRadius: `${borderRadius / 2}px`
                            }}
                          >
                            <step.icon sx={{ fontSize: 28 }} />
                          </Avatar>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, color: 'text.heading' }}>
                            {step.title}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            {step.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Box>
                  <Box 
                    sx={{ 
                      flex: 1,
                      display: { xs: 'none', md: 'flex' },
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: 'primary.main',
                        opacity: 0.1,
                        fontSize: '3rem',
                        fontWeight: 800
                      }}
                    >
                      {step.step}
                    </Avatar>
                  </Box>
                </Stack>
              </MotionBox>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ mx: 3, mb: 8 }}>
        <Container maxWidth="md">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                p: { xs: 4, md: 8 },
                borderRadius: `${borderRadius}px`,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(103, 58, 183, 0.3)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  width: 300,
                  height: 300,
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                  top: -150,
                  right: -100
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: 200,
                  height: 200,
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                  bottom: -100,
                  left: -50
                }
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
                  Ready to Level Up Your Coding Skills?
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.95, fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
                  Join thousands of students mastering programming through practice and structured learning
                </Typography>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/login')}
                  sx={{ 
                    px: 6, 
                    py: 2, 
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: `${borderRadius}px`,
                    bgcolor: '#fff',
                    color: 'secondary.main',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
                      bgcolor: 'grey.50'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Get Started Free
                </Button>
              </Box>
            </Card>
          </MotionBox>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: '#fff', py: 6, mx: 3, mb: 3, borderRadius: `${borderRadius}px` }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#fff' }}>
              © {new Date().getFullYear()} Orcadehub Innovations LLP. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
