import { Box, Container, Typography, Button, Card, CardContent, Stack, Chip } from '@mui/material';
import { WhatsApp, CheckCircle } from '@mui/icons-material';
import PublicHeader from 'components/PublicHeader';
import useConfig from 'hooks/useConfig';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

export default function Pricing() {
  const { state: { borderRadius } } = useConfig();

  const features = [
    'Fully White-Labeled Platform',
    'Custom Branding & Logo',
    'Your Own Domain',
    'Complete Admin Control',
    'Student Management System',
    'Assessment & Quiz Engine',
    'Online IDE Integration',
    'Study Materials Management',
    'Leaderboard & Analytics',
    'Secure Proctoring System',
    'AI Mock Interviews',
    'Interactive Labs & Playgrounds',
    'Multi-Language Support',
    'Real-Time Code Execution',
    'Activity Tracking',
    'Custom Tenant Configuration'
  ];

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/917093012101?text=Hi, I want to get a white-labeled LMS for my institution', '_blank');
  };

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
              Get Your White-Labeled LMS Today
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary" 
              sx={{ fontWeight: 400, lineHeight: 1.6, maxWidth: 700, mx: 'auto', mb: 4 }}
            >
              Launch your own branded Learning Management System with all features customized for your institution
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<WhatsApp />}
              onClick={handleWhatsAppContact}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: `${borderRadius}px`,
                bgcolor: '#25D366',
                color: 'white',
                boxShadow: '0 8px 24px rgba(37, 211, 102, 0.3)',
                '&:hover': {
                  bgcolor: '#20BA5A',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(37, 211, 102, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Contact Now on WhatsApp
            </Button>
          </MotionBox>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
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
            Everything You Need
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: 700, mx: 'auto', fontWeight: 400 }}
          >
            Complete LMS solution with powerful features for your institution
          </Typography>
        </MotionBox>

        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2
          }}
        >
          {features.map((feature, index) => (
            <MotionCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
              sx={{ 
                borderRadius: `${borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  borderColor: 'primary.main'
                }
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 28, flexShrink: 0 }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {feature}
                </Typography>
              </CardContent>
            </MotionCard>
          ))}
        </Box>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 10, mb: 8 }}>
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
                boxShadow: '0 20px 60px rgba(103, 58, 183, 0.3)'
              }}
            >
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
                Ready to Launch Your LMS?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.95, fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
                Contact us now to get started with your custom white-labeled Learning Management System
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<WhatsApp />}
                  onClick={handleWhatsAppContact}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: `${borderRadius}px`,
                    bgcolor: '#25D366',
                    color: 'white',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      bgcolor: '#20BA5A',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  WhatsApp: +91 7093012101
                </Button>
              </Stack>
            </Card>
          </MotionBox>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: '#fff', py: 6, mx: 3, mb: 3, borderRadius: `${borderRadius}px` }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#fff' }}>
              © {new Date().getFullYear()}{' '}
              <Typography
                component="a"
                href="https://orcadehub.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#fff',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Orcadehub Innovations LLP
              </Typography>
              . All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
