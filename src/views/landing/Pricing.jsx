import { Box, Container, Typography, Button, Card, CardContent, Stack, Chip } from '@mui/material';
import { WhatsApp, CheckCircle, CheckCircleOutline } from '@mui/icons-material';
import PublicHeader from 'components/PublicHeader';
import useConfig from 'hooks/useConfig';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <PublicHeader />

      <Box sx={{ position: 'relative', overflow: 'hidden', py: { xs: 6, md: 10 } }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 10%, rgba(106,13,173,0.12), transparent 35%), radial-gradient(circle at 80% 0%, rgba(37,211,102,0.12), transparent 28%)'
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.05fr 0.95fr' },
              gap: { xs: 3, md: 4 },
              alignItems: 'stretch'
            }}
          >
            <MotionCard
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                borderRadius: `${borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 16px 40px rgba(17, 24, 39, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Chip
                label="White-Labeled LMS"
                sx={{
                  mb: 2.5,
                  width: 'fit-content',
                  bgcolor: 'rgba(106, 13, 173, 0.1)',
                  color: '#6a0dad',
                  fontWeight: 700
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.1,
                  fontSize: { xs: '2rem', sm: '2.4rem', md: '3rem' },
                  mb: 2
                }}
              >
                Get Your Branded LMS Live in Days
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  mb: 4
                }}
              >
                Launch your own institution-ready platform with assessments, practice labs, analytics, and complete control over branding.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<WhatsApp />}
                  onClick={handleWhatsAppContact}
                  sx={{
                    px: { xs: 2.5, md: 4 },
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: `${borderRadius}px`,
                    bgcolor: '#25D366',
                    '&:hover': {
                      bgcolor: '#20BA5A'
                    }
                  }}
                >
                  Contact on WhatsApp
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: { xs: 2.5, md: 4 },
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: `${borderRadius}px`
                  }}
                >
                  +91 7093012101
                </Button>
              </Stack>
            </MotionCard>

            <MotionCard
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: `${borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 16px 40px rgba(17, 24, 39, 0.08)',
                bgcolor: '#ffffff'
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                What You Get
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                A complete stack for students, instructors, and admins under your own brand.
              </Typography>
              <Stack spacing={1.3}>
                {[
                  'Your domain, logo and visual identity',
                  'Complete admin + instructor controls',
                  'Coding IDE, quizzes and assessments',
                  'Interactive labs and AI mock interview modules',
                  'Gamified aptitude with quantitative and verbal reasoning tracks',
                  'Company-specific question banks and assessments',
                  'Leaderboard, reports and activity tracking',
                  'Secure proctoring and session controls',
                  'Students can connect LeetCode, HackerRank, Codeforces, and CodeChef to view unified stats'
                ].map((point) => (
                  <Stack key={point} direction="row" spacing={1.2} sx={{ alignItems: 'flex-start' }}>
                    <CheckCircleOutline sx={{ color: '#6a0dad', mt: '2px', fontSize: 20 }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {point}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </MotionCard>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
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

      <Container maxWidth="md" sx={{ pb: { xs: 6, md: 9 } }}>
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          sx={{
            p: { xs: 3, sm: 4.5, md: 6 },
            borderRadius: `${borderRadius}px`,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #4b0579 0%, #6a0dad 52%, #8d3bcb 100%)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 24px 54px rgba(75, 5, 121, 0.34)',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 72%)',
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
              fontSize: { xs: '1.7rem', md: '2.2rem' },
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
