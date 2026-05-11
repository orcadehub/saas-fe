import { Box, Container, Typography, Button, Card, CardContent, Stack, Chip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { WhatsApp, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useState } from 'react';

const MotionBox = motion.create(Box);

export default function StudentTiers() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const cycles = [
    { id: 'monthly', label: 'Monthly', discount: 0 },
    { id: '3months', label: '3 Months', discount: 2 },
    { id: '6months', label: '6 Months', discount: 5 },
    { id: '1year', label: '1 Year', discount: 10 }
  ];

  const basePrice = 25;
  const tiers = [
    { count: 100, label: '100 Students', baseDisc: 0 },
    { count: 500, label: '500 Students', baseDisc: 8 },
    { count: 1000, label: '1000 Students', baseDisc: 12 },
    { count: 5000, label: '5000 Students', baseDisc: 20 }
  ];

  const currentCycle = cycles.find((c) => c.id === billingCycle);

  const calculatePrice = (tier) => {
    const totalDisc = tier.baseDisc + currentCycle.discount;
    const finalPerStudent = basePrice * (1 - totalDisc / 100);
    const monthlyTotal = tier.count * finalPerStudent;
    return `₹${Math.round(monthlyTotal).toLocaleString()}`;
  };

  const calculatePerStudent = (tier) => {
    const totalDisc = tier.baseDisc + currentCycle.discount;
    const finalPerStudent = basePrice * (1 - totalDisc / 100);
    return `₹${finalPerStudent.toFixed(2)}`;
  };

  const handleWhatsAppContact = () => {
    window.open(`https://wa.me/917093012101?text=Hi, I'm interested in the ${currentCycle.label} plan for white-labeled LMS`, '_blank');
  };

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'rgba(248, 250, 252, 0.5)', position: 'relative' }}>
      <Container maxWidth="lg">
        <Stack alignItems="center" spacing={4} sx={{ mb: 8 }}>
          <MotionBox textAlign="center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 1.5,
                fontSize: { xs: '2.25rem', md: '3.5rem' },
                letterSpacing: '-1.5px',
                background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Flexible Student Tiers
            </Typography>
            <Typography variant="h5" sx={{ color: '#64748b', fontWeight: 500, maxWidth: 600, mx: 'auto' }}>
              Scale your institution with our transparent, student-based pricing models.
            </Typography>
          </MotionBox>

          <ToggleButtonGroup
            value={billingCycle}
            exclusive
            onChange={(_, v) => v && setBillingCycle(v)}
            sx={{
              bgcolor: '#fff',
              borderRadius: '100px',
              p: 0.5,
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              '& .MuiToggleButton-root': {
                borderRadius: '100px',
                border: 'none',
                px: { xs: 2, md: 3 },
                py: 1,
                textTransform: 'none',
                fontWeight: 800,
                color: '#64748b',
                fontSize: '0.85rem',
                '&.Mui-selected': { bgcolor: '#6366f1', color: '#fff', '&:hover': { bgcolor: '#4f46e5' } }
              }
            }}
          >
            {cycles.map((cycle) => (
              <ToggleButton key={cycle.id} value={cycle.id}>
                {cycle.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3
          }}
        >
          {tiers.map((tier, idx) => {
            const totalDisc = tier.baseDisc + currentCycle.discount;
            return (
              <MotionBox
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  sx={{
                    borderRadius: '32px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.05)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'translateY(-10px)' }
                  }}
                >
                  <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#1e293b' }}>
                      {tier.label}
                    </Typography>
                    <Chip
                      label={`${totalDisc}% Discount Applied`}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(34, 197, 94, 0.1)',
                        color: '#16a34a',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        mb: 4,
                        width: 'fit-content'
                      }}
                    />

                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h1" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '2.5rem', lineHeight: 1 }}>
                        {calculatePerStudent(tier)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6366f1', fontWeight: 800, mb: 1.5 }}>
                        Per Student / Month
                      </Typography>
                      <Box sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#475569' }}>
                          {calculatePrice(tier)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                          Total Monthly Billing
                        </Typography>
                      </Box>
                    </Box>

                    <Stack spacing={2} sx={{ mb: 6, flexGrow: 1 }}>
                      {['All Premium Modules', 'Custom Branding', 'Domain Mapping', 'Technical Support'].map((f) => (
                        <Stack key={f} direction="row" spacing={1.5} alignItems="center">
                          <CheckCircle sx={{ color: '#6366f1', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                            {f}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleWhatsAppContact}
                      sx={{
                        borderRadius: '16px',
                        py: 1.5,
                        bgcolor: '#0f172a',
                        fontWeight: 800,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#1e293b' }
                      }}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </MotionBox>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
