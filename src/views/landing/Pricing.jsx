import { Box, Container, Typography, Button, Card, CardContent, Stack, Chip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { WhatsApp, CheckCircle } from '@mui/icons-material';
import useConfig from 'hooks/useConfig';
import tenantConfig from 'config/tenantConfig';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import DarkNavbar from 'components/DarkNavbar';
import AnimatedGridBackground from 'components/AnimatedGridBackground';
import { LetterByLetterText } from 'components/ThemeElements';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

export default function Pricing() {
  const navigate = useNavigate();
  const { state: { borderRadius } } = useConfig();
  const [config, setConfig] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  const features = [
    'Fully White-Labeled Platform', 'Custom Branding & Logo', 'Your Own Domain', 'Complete Admin Control',
    'Instructor Management Controls', 'Student Management System', 'Assessment & Quiz Engine', 'Online IDE Integration',
    'AI Mock Interview Module', 'Interactive Labs', 'Gamified Aptitude Assessments', 'Quantitative Reasoning Practice',
    'Verbal Reasoning Practice', 'Company-Specific Questions', 'Study Materials Management', 'Leaderboard & Analytics',
    'Secure Proctoring System', 'Cross-Platform Student Stats', 'LeetCode, HackerRank, Codeforces, CodeChef Sync',
    'Multi-Language Support', 'Real-Time Code Execution', 'Activity Tracking', 'Custom Tenant Configuration', 'Dedicated Technical Support',
  ];

  const cycles = [
    { id: 'monthly', label: 'Monthly', discount: 0 },
    { id: '3months', label: '3 Months', discount: 2 },
    { id: '6months', label: '6 Months', discount: 5 },
    { id: '1year', label: '1 Year', discount: 10 },
    { id: '2years', label: '2 Years', discount: 15 },
    { id: '3years', label: '3 Years', discount: 20 },
  ];

  const basePrice = 25;
  const tiers = [
    { count: 100, label: '100 Students', baseDisc: 0 },
    { count: 200, label: '200 Students', baseDisc: 4 },
    { count: 500, label: '500 Students', baseDisc: 8 },
    { count: 1000, label: '1000 Students', baseDisc: 12 },
    { count: 2000, label: '2000 Students', baseDisc: 16 },
    { count: 5000, label: '5000 Students', baseDisc: 20 },
    { count: 10000, label: '10,000 Students', baseDisc: 24 },
    { count: 10001, label: 'More than 10k', baseDisc: 24, custom: true },
  ];

  const currentCycle = cycles.find(c => c.id === billingCycle);

  const calculatePrice = (tier) => {
    if (tier.custom) return 'Contact Us';
    const totalDisc = tier.baseDisc + currentCycle.discount;
    const finalPerStudent = basePrice * (1 - totalDisc / 100);
    const monthlyTotal = tier.count * finalPerStudent;
    return `₹${Math.round(monthlyTotal).toLocaleString()}`;
  };

  const calculatePerStudent = (tier) => {
    if (tier.custom) return '';
    const totalDisc = tier.baseDisc + currentCycle.discount;
    const finalPerStudent = basePrice * (1 - totalDisc / 100);
    return `₹${finalPerStudent.toFixed(2)}/std`;
  };

  const handleWhatsAppContact = () => {
    window.open(`https://wa.me/917093012101?text=Hi, I'm interested in the ${currentCycle.label} plan for white-labeled LMS`, '_blank');
  };

  const handleCycleChange = (event, newCycle) => {
    if (newCycle !== null) setBillingCycle(newCycle);
  };

  return (
    <Box sx={{ color: '#1e293b', position: 'relative' }}>
      <AnimatedGridBackground />
      <Box sx={{ position: 'relative', zIndex: 10 }}>
        {/* Hero */}
        <Box sx={{ position: 'relative', overflow: 'hidden', py: { xs: 6, md: 10 }, mt: 8 }}>
          <Container maxWidth="lg">
            <Stack alignItems="center" textAlign="center" spacing={4}>
              <MotionBox initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
                <LetterByLetterText text="Get Your Branded LMS" delay={0.1} sx={{ fontSize: { xs: '3rem', md: '6rem' } }} />
              </MotionBox>
              <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <Typography variant="h5" sx={{ color: '#64748b', maxWidth: '600px', mx: 'auto' }}>
                  Launch your institution-ready platform with assessments, practice labs, analytics, and complete branding.
                </Typography>
              </MotionBox>
            </Stack>
          </Container>
        </Box>

        {/* Pricing Table Section */}
        <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
          <Stack alignItems="center" spacing={4} sx={{ mb: 6 }}>
            <MotionBox textAlign="center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '2rem', md: '3rem' } }}>
                Student-Based Tiers
              </Typography>
              <Typography variant="h6" sx={{ color: '#64748b' }}>
                Select your billing duration to unlock extra savings.
              </Typography>
            </MotionBox>

            {/* Cycle Selector */}
            <ToggleButtonGroup
              value={billingCycle}
              exclusive
              onChange={handleCycleChange}
              sx={{
                bgcolor: 'rgba(255,255,255,0.8)', borderRadius: '100px', p: 0.5,
                border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                '& .MuiToggleButton-root': {
                  borderRadius: '100px', border: 'none', px: { xs: 2, md: 3 }, py: 1,
                  textTransform: 'none', fontWeight: 700, color: '#64748b',
                  '&.Mui-selected': { bgcolor: '#7c3aed', color: '#fff', '&:hover': { bgcolor: '#6d28d9' } },
                }
              }}
            >
              {cycles.map(cycle => (
                <ToggleButton key={cycle.id} value={cycle.id}>
                  {cycle.label} {cycle.discount > 0 && <Box component="span" sx={{ ml: 0.5, fontSize: '0.7rem', opacity: 0.9 }}>(-{cycle.discount}%)</Box>}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

          <Box sx={{ bgcolor: '#ffffff', borderRadius: '32px', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: 'rgba(124,58,237,0.03)' }}>
                    {['Students', 'Features', 'Duration Discount', 'Monthly Total', 'Action'].map((head) => (
                      <Box component="th" key={head} sx={{ p: 2.5, textAlign: 'left', color: '#1e293b', fontWeight: 800, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        {head}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {tiers.map((tier, idx) => {
                    const totalDisc = tier.baseDisc + currentCycle.discount;
                    return (
                      <Box component="tr" key={idx} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' }, borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                        <Box component="td" sx={{ p: 2.5, color: '#1e293b', fontWeight: 700 }}>{tier.label}</Box>
                        <Box component="td" sx={{ p: 2.5 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CheckCircle sx={{ color: '#22c55e', fontSize: 16 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>Full Feature Access</Typography>
                          </Stack>
                        </Box>
                        <Box component="td" sx={{ p: 2.5 }}>
                          <Chip label={`${totalDisc}% Total Off`} size="small" sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', fontWeight: 800 }} />
                        </Box>
                        <Box component="td" sx={{ p: 2.5 }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
                            {calculatePrice(tier)}{!tier.custom && <Box component="span" sx={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, ml: 0.5 }}>/mo</Box>}
                          </Typography>
                          {!tier.custom && <Typography variant="caption" sx={{ color: '#94a3b8' }}>({calculatePerStudent(tier)})</Typography>}
                        </Box>
                        <Box component="td" sx={{ p: 2.5 }}>
                          <Button variant="contained" size="small" onClick={handleWhatsAppContact} sx={{ borderRadius: '100px', bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, textTransform: 'none', fontWeight: 700 }}>
                            {tier.custom ? 'Contact Us' : 'Get Started'}
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>

        {/* Features list */}
        <Container maxWidth="xl" sx={{ py: 8 }}>
          <Typography variant="h3" textAlign="center" sx={{ fontWeight: 800, mb: 6 }}>Everything Included</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
            {features.map(f => (
              <Card key={f} sx={{ borderRadius: '16px', boxShadow: 'none', border: '1px solid rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2 }}>
                  <CheckCircle sx={{ color: '#7c3aed', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{f}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
