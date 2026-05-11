import { Box, Typography, CardContent, Button, Chip, Stack, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  IconCircleCheck
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
    price: '₹8,999',
    originalPrice: '₹15,000',
    duration: '4 Months',
    tags: ['Full Stack', 'Job Ready']
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
          {/* Decorative element */}
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

        {/* Course Grid */}
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
          {courseData.map((course, idx) => {
            const Icon = course.icon;
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
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)'
                  }
                }}
              >
                {/* Accent Top Bar */}
                <Box sx={{ height: '6px', width: '100%', bgcolor: course.color }} />

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
                        bgcolor: course.bg,
                        color: course.color,
                        boxShadow: `0 8px 16px ${course.color}20`
                      }}
                    >
                      <Icon size={34} stroke={1.5} />
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: '1.6rem',
                          color: '#1e293b',
                          lineHeight: 1
                        }}
                      >
                        {course.price}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          color: '#94a3b8',
                          textDecoration: 'line-through',
                          mt: 0.5
                        }}
                      >
                        {course.originalPrice}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#0f172a',
                      fontSize: '1.5rem',
                      mb: 1.5,
                      letterSpacing: '-0.3px'
                    }}
                  >
                    {course.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.08)', px: 1, py: 0.3, borderRadius: '6px' }}>
                      <IconClock size={14} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800 }}>{course.duration}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.08)', px: 1, py: 0.3, borderRadius: '6px' }}>
                      <IconCircleCheck size={14} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800 }}>Live</Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748b',
                      fontWeight: 500,
                      lineHeight: 1.6,
                      flexGrow: 1,
                      mb: 3
                    }}
                  >
                    {course.description}
                  </Typography>

                  <Box sx={{ mt: 'auto' }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
                      {course.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            bgcolor: '#f8fafc',
                            color: '#475569',
                            fontWeight: 700,
                            borderRadius: '8px',
                            border: '1px solid #f1f5f9',
                            fontSize: '0.7rem'
                          }}
                        />
                      ))}
                    </Stack>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate(`/courses/${course.id}`)}
                      sx={{
                        bgcolor: course.color,
                        color: '#fff',
                        py: 1.75,
                        borderRadius: '14px',
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 800,
                        boxShadow: `0 8px 20px ${course.color}30`,
                        '&:hover': {
                          bgcolor: course.color,
                          filter: 'brightness(0.9)',
                          boxShadow: `0 12px 25px ${course.color}50`,
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      Enroll Now
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
