import { Box, Typography, CardContent, Button, Chip, Stack, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  IconBrandPython,
  IconCoffee,
  IconDatabase,
  IconCode,
  IconTerminal2,
  IconServer,
  IconAppWindow,
  IconChartBar,
  IconLiveView,
  IconCalendarEvent,
  IconClock,
  IconCircleCheck,
  IconConfetti,
  IconGift
} from '@tabler/icons-react';

const MotionCard = motion(Box);

// ── Soft Light Background ──
const LightBackground = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#fbfcfe' }} />
    <Box
      sx={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)'
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(100px)'
      }}
    />
  </Box>
);

const courseData = [
  {
    id: 'python',
    title: 'Python Mastery',
    description: 'Learn Python from basics to advanced, including OOP, standard libraries, and real-world projects.',
    icon: IconBrandPython,
    color: '#3b82f6',
    bg: '#eff6ff',
    price: '₹3,499',
    originalPrice: '₹5,000',
    duration: '2 Months',
    tags: ['Beginner Friendly', 'Core Concept']
  },
  {
    id: 'java',
    title: 'Java Developer',
    description: 'Master Java programming, multithreading, collections, and build enterprise-ready applications.',
    icon: IconCoffee,
    color: '#eab308',
    bg: '#fefce8',
    price: '₹3,999',
    originalPrice: '₹6,000',
    duration: '2 Months',
    tags: ['Enterprise', 'OOP']
  },
  {
    id: 'dsa-java',
    title: 'DSA using Java',
    description: 'Ace coding interviews by mastering Data Structures and Algorithms with implementation in Java.',
    icon: IconCode,
    color: '#ef4444',
    bg: '#fef2f2',
    price: '₹4,499',
    originalPrice: '₹7,500',
    duration: '2 Months',
    tags: ['Interviews', 'Advanced']
  },
  {
    id: 'dsa-python',
    title: 'DSA using Python',
    description: 'Solve complex algorithmic problems efficiently using Python data structures.',
    icon: IconTerminal2,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    price: '₹4,499',
    originalPrice: '₹7,500',
    duration: '2 Months',
    tags: ['Interviews', 'Advanced']
  },
  {
    id: 'frontend',
    title: 'Frontend Development',
    description: 'Build stunning, responsive interfaces using HTML, CSS, JavaScript, and React.',
    icon: IconAppWindow,
    color: '#ec4899',
    bg: '#fdf2f8',
    price: '₹4,999',
    originalPrice: '₹8,000',
    duration: '2 Months',
    tags: ['UI/UX', 'React']
  },
  {
    id: 'backend',
    title: 'Backend Development',
    description: 'Learn server-side programming, REST APIs, and database integration using Node.js and Express.',
    icon: IconServer,
    color: '#10b981',
    bg: '#ecfdf5',
    price: '₹4,999',
    originalPrice: '₹8,000',
    duration: '2 Months',
    tags: ['Node.js', 'APIs']
  },
  {
    id: 'database',
    title: 'Database Management',
    description: 'Deep dive into SQL and NoSQL databases, optimization, and database design principles.',
    icon: IconDatabase,
    color: '#06b6d4',
    bg: '#ecfeff',
    price: '₹2,999',
    originalPrice: '₹4,500',
    duration: '2 Months',
    tags: ['SQL', 'MongoDB']
  },
  {
    id: 'mern',
    title: 'Full Stack (MERN)',
    description: 'Become a complete MERN stack developer by building full-stack, scalable web applications.',
    icon: IconCode,
    color: '#6366f1',
    bg: '#eef2ff',
    price: 'FREE',
    originalPrice: '₹15,000',
    duration: '2 Months',
    tags: ['Full Stack', 'Job Ready', '🎉 Anniversary Offer'],
    isFree: true
  },
  {
    id: 'data-science',
    title: 'Data Science',
    description: 'Master data analysis, visualization, and storytelling using Excel, SQL, and PowerBI.',
    icon: IconChartBar,
    color: '#f97316',
    bg: '#fff7ed',
    price: '₹5,999',
    originalPrice: '₹9,000',
    duration: '2 Months',
    tags: ['Analytics', 'PowerBI']
  }
];

export default function Courses() {
  const navigate = useNavigate();

  // Countdown to May 16
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date('2026-05-16T00:00:00+05:30').getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: { xs: 2.5, sm: 3, md: 4.5 },
        bgcolor: '#fbfcfe',
        color: '#1e293b',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      <LightBackground />

      <Box sx={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            mb: 4
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              color: '#1e293b',
              mb: 2,
              fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.5rem' },
              letterSpacing: '-1.5px',
              lineHeight: 1.1
            }}
          >
            Advance Your{' '}
            <Box component="span" sx={{ color: '#6366f1' }}>
              Career
            </Box>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#64748b',
              fontSize: { xs: '1rem', sm: '1.15rem' },
              fontWeight: 500,
              maxWidth: '650px',
              mb: 4
            }}
          >
            Experience premium, live learning with industry experts. Our courses are designed to transition you from basics to professional proficiency.
          </Typography>
        </Box>

        {/* 🎉 First Anniversary Banner — Hero Style */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          sx={{
            maxWidth: '1100px',
            mx: 'auto',
            mb: 4,
            p: { xs: 4, md: 6 },
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #a855f7 80%, #c084fc 100%)',
            borderRadius: '36px',
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            boxShadow: '0 30px 80px rgba(99, 102, 241, 0.4)',
            border: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          {/* Animated decorative elements */}
          <Box sx={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', animation: 'pulse 4s ease-in-out infinite' }} />
          <Box sx={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)', animation: 'pulse 5s ease-in-out infinite 1s' }} />
          <Box sx={{ position: 'absolute', top: '20%', right: '25%', width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', animation: 'pulse 3s ease-in-out infinite 0.5s' }} />
          <Box sx={{ position: 'absolute', bottom: '30%', right: '10%', width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />

          {/* Sparkle CSS */}
          <style>{`
            @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.15); opacity: 1; } }
            @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          `}</style>

          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
            {/* Left: Icon + Text */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mb: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '16px', backdropFilter: 'blur(10px)', display: 'flex' }}>
                  <IconConfetti size={32} stroke={1.5} />
                </Box>
                <Chip
                  label="🎂 1st Anniversary Celebration"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '0.8rem',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    height: 36
                  }}
                />
              </Stack>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2rem', md: '2.75rem' },
                  lineHeight: 1.1,
                  mb: 1.5,
                  letterSpacing: '-1px'
                }}
              >
                Orcadehub Innovations LLP{' '}
                <Box component="span" sx={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)', backgroundSize: '200% auto', animation: 'shimmer 3s linear infinite', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  turns 1!
                </Box>
              </Typography>
              <Typography sx={{ fontWeight: 500, fontSize: { xs: '1rem', md: '1.15rem' }, opacity: 0.9, maxWidth: 500 }}>
                To celebrate, we're offering a <strong>completely FREE</strong> 2-month Full Stack Web Development course using the MERN Stack. No catch, no hidden fees.
              </Typography>
            </Box>

            {/* Right: Countdown + FREE badge */}
            <Stack spacing={2} alignItems="center" sx={{ flexShrink: 0 }}>
              {/* Countdown */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8, mb: 1.5 }}>
                  🎂 Birthday Countdown
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[
                    { val: countdown.days, label: 'Days' },
                    { val: countdown.hours, label: 'Hrs' },
                    { val: countdown.minutes, label: 'Min' },
                    { val: countdown.seconds, label: 'Sec' }
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        p: 1.5,
                        minWidth: 60,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        borderRadius: '16px',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        textAlign: 'center'
                      }}
                    >
                      <Typography sx={{ fontWeight: 900, fontSize: '1.75rem', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                        {String(item.val).padStart(2, '0')}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', opacity: 0.7, mt: 0.3, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
              {/* FREE pill */}
              <Box
                component={motion.div}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                sx={{
                  px: 3,
                  py: 1,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderRadius: '100px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <IconGift size={22} />
                <Typography sx={{ fontWeight: 900, fontSize: '1.1rem' }}>100% FREE</Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* 🎁 Standalone FREE MERN Course Card */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          sx={{
            maxWidth: '1100px',
            mx: 'auto',
            mb: 8
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: { xs: 3, md: 5 },
              p: { xs: 3, md: 5 },
              bgcolor: '#fff',
              borderRadius: '32px',
              border: '2px solid #6366f1',
              boxShadow: '0 16px 50px rgba(99, 102, 241, 0.15), 0 0 0 6px rgba(99, 102, 241, 0.05)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s',
              '&:hover': { boxShadow: '0 24px 60px rgba(99, 102, 241, 0.22), 0 0 0 6px rgba(99, 102, 241, 0.08)', transform: 'translateY(-4px)' }
            }}
          >
            {/* Ribbon */}
            <Box sx={{ position: 'absolute', top: 22, right: -35, transform: 'rotate(45deg)', bgcolor: '#16a34a', color: '#fff', px: 6, py: 0.8, fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1.5px', zIndex: 2, boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)' }}>
              FREE
            </Box>

            {/* Icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: { xs: 80, md: 100 }, height: { xs: 80, md: 100 }, borderRadius: '24px', bgcolor: '#eef2ff', color: '#6366f1', boxShadow: '0 12px 24px rgba(99, 102, 241, 0.15)', flexShrink: 0 }}>
              <IconCode size={48} stroke={1.5} />
            </Box>

            {/* Details */}
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip label="🎉 Anniversary Special" size="small" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontWeight: 800, fontSize: '0.7rem' }} />
                <Chip label="Full Stack" size="small" sx={{ bgcolor: '#f8fafc', color: '#475569', fontWeight: 700, border: '1px solid #f1f5f9', fontSize: '0.7rem' }} />
                <Chip label="Job Ready" size="small" sx={{ bgcolor: '#f8fafc', color: '#475569', fontWeight: 700, border: '1px solid #f1f5f9', fontSize: '0.7rem' }} />
              </Stack>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.5rem', md: '1.85rem' }, color: '#0f172a', mb: 0.5, letterSpacing: '-0.5px' }}>
                Full Stack Web Development — MERN Stack
              </Typography>
              <Typography sx={{ color: '#64748b', fontWeight: 500, lineHeight: 1.6, mb: 2, fontSize: '0.95rem' }}>
                Become a complete MERN stack developer by building full-stack, scalable web applications. Covers MongoDB, Express.js, React, and Node.js with real-world projects.
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.08)', px: 1.5, py: 0.5, borderRadius: '8px' }}>
                  <IconClock size={16} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 800 }}>2 Months</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.08)', px: 1.5, py: 0.5, borderRadius: '8px' }}>
                  <IconCircleCheck size={16} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 800 }}>Live Classes</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)', px: 1.5, py: 0.5, borderRadius: '8px' }}>
                  <IconLiveView size={16} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 800 }}>100% Live</Typography>
                </Box>
              </Stack>
            </Box>

            {/* Price + CTA */}
            <Box sx={{ textAlign: 'center', flexShrink: 0, minWidth: { md: 180 } }}>
              <Typography sx={{ fontWeight: 900, fontSize: '2.5rem', color: '#16a34a', lineHeight: 1 }}>FREE</Typography>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#94a3b8', textDecoration: 'line-through', mb: 2 }}>₹15,000</Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate('/courses/mern')}
                sx={{
                  bgcolor: '#6366f1',
                  color: '#fff',
                  py: 1.75,
                  borderRadius: '14px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 800,
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
                  '&:hover': { bgcolor: '#4f46e5', boxShadow: '0 12px 30px rgba(99, 102, 241, 0.45)', transform: 'translateY(-2px)' },
                  transition: 'all 0.2s'
                }}
              >
                Enroll for Free
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Schedule & Info Banner */}
        <Box
          sx={{
            maxWidth: '1000px',
            mx: 'auto',
            mb: 8,
            p: { xs: 3, md: 4 },
            bgcolor: '#fff',
            borderRadius: '32px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)', zIndex: 0 }} />

          <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px' }}>
                  <IconLiveView size={28} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>100% Live Classes</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Interactive real-time sessions</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: '12px' }}>
                  <IconClock size={28} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>6 PM - 9 PM Daily</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Flexible 1-hour slots daily</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px' }}>
                  <IconCalendarEvent size={28} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>Weekly Structure</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>5 Days Class + Sat/Sun Projects</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Other Courses Heading */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.5px' }}>
            Explore More Courses
          </Typography>
          <Typography sx={{ color: '#64748b', fontWeight: 500, mt: 1 }}>Premium courses with expert-led live sessions</Typography>
        </Box>

        {/* Course Grid — excluding MERN */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 4
          }}
        >
          {courseData.filter(c => !c.isFree).map((course, idx) => {
            const Icon = course.icon;
            const isComingSoon = true; // Hide all except the special offer
            return (
              <MotionCard
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                key={course.id}
                sx={{
                  borderRadius: '28px',
                  bgcolor: '#fff',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  opacity: 0.6,
                  pointerEvents: 'none',
                  filter: 'grayscale(0.5)',
                  '&:hover': {
                    transform: 'none',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)'
                  }
                }}
              >
                {/* Accent Top Bar */}
                <Box sx={{ height: '6px', width: '100%', bgcolor: '#94a3b8' }} />

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 3.5, sm: 4 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: '18px',
                        bgcolor: '#f1f5f9',
                        color: '#94a3b8',
                      }}
                    >
                      <Icon size={34} stroke={1.5} />
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: '1.6rem',
                          color: '#94a3b8',
                          lineHeight: 1
                        }}
                      >
                        {course.price}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#64748b',
                      fontSize: '1.5rem',
                      mb: 1.5,
                      letterSpacing: '-0.3px'
                    }}
                  >
                    {course.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8', bgcolor: '#f1f5f9', px: 1, py: 0.3, borderRadius: '6px' }}>
                      <IconClock size={14} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800 }}>Coming Soon</Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#94a3b8',
                      fontWeight: 500,
                      lineHeight: 1.6,
                      flexGrow: 1,
                      mb: 3
                    }}
                  >
                    {course.description}
                  </Typography>

                  <Box sx={{ mt: 'auto' }}>
                    <Button
                      disabled
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: '#cbd5e1',
                        color: '#fff',
                        py: 1.75,
                        borderRadius: '14px',
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 800,
                      }}
                    >
                      Coming Soon
                    </Button>
                  </Box>
                </CardContent>
              </MotionCard>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
