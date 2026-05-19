import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { IconTrophy, IconClipboardList, IconCode, IconHierarchy } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDashboard } from 'contexts/DashboardContext';
import dsaData from 'data/dsa_problems.json';

const MotionCard = motion.create(Card);

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

export default function Practice() {
  const navigate = useNavigate();
  const { practiceStats, fetchPracticeStats } = useDashboard();
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setStatsLoading(true);
      await fetchPracticeStats();
      setStatsLoading(false);
    };
    load();
  }, []);

  const dsaCount = dsaData.reduce((acc, topic) => acc + topic.problems.length, 0);

  const practiceCategories = [
    {
      id: 'gamified',
      title: 'Gamified Practice',
      description: 'Learn through interactive games, puzzles and challenges designed to make learning fun.',
      icon: IconTrophy,
      color: '#f59e0b',
      bg: '#fffbeb',
      route: '/practice/gamified',
      count: 10,
      countLabel: 'Games',
      tags: ['Interactive', 'Game Based']
    },
    {
      id: 'aptitude',
      title: 'Aptitude Training',
      description: 'Master quantitative, verbal and logical reasoning through topic-wise MCQ practice sessions.',
      icon: IconClipboardList,
      color: '#ec4899',
      bg: '#fdf2f8',
      route: '/practice/aptitude',
      count: statsLoading ? null : practiceStats?.aptitudeCount || 0,
      countLabel: 'Questions',
      tags: ['MCQ Based', 'Topic Wise']
    },
    {
      id: 'programming',
      title: 'Orca Practice',
      description: 'Master basic programming concepts from fundamentals up to arrays, strings, and recursion.',
      icon: IconCode,
      color: '#6366f1',
      bg: '#f5f3ff',
      route: '/practice/programming',
      count: 170,
      countLabel: 'Questions',
      tags: ['Multi Language', 'IDE']
    },
    {
      id: 'dsa',
      title: 'DSA Practice',
      description: 'Tackle medium to advanced level Data Structures and Algorithms with curated topics and problems.',
      icon: IconHierarchy,
      color: '#10b981',
      bg: '#ecfdf5',
      route: '/practice/dsa',
      count: dsaCount,
      countLabel: 'Questions',
      tags: ['Data Structures', 'Algorithms']
    }
  ];

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
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 3,
            mb: { xs: 4, md: 6 }
          }}
        >
          <Box>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                color: '#1e293b',
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }
              }}
            >
              Practice Center
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 500 }}>
              Sharpen your skills through interactive challenges and coding practice.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 3
          }}
        >
          {practiceCategories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                key={category.id}
                onClick={() => navigate(category.route)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: '24px',
                  bgcolor: '#fff',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 2.5, sm: 3 }, position: 'relative' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: { xs: 44, sm: 52 },
                          height: { xs: 44, sm: 52 },
                          borderRadius: '12px',
                          bgcolor: category.bg,
                          color: category.color
                        }}
                      >
                        <Icon size={28} />
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          color: '#1e293b',
                          fontSize: { xs: '1.25rem', sm: '1.35rem' }
                        }}
                      >
                        {category.title}
                      </Typography>
                    </Box>
                    {category.count !== undefined && category.count !== null && (
                      <Box sx={{ textAlign: 'right' }}>
                        {statsLoading && category.id === 'aptitude' ? (
                          <CircularProgress size={16} sx={{ color: category.color }} />
                        ) : (
                          <>
                            <Typography
                              sx={{
                                fontWeight: 900,
                                fontSize: '1.25rem',
                                color: category.color,
                                lineHeight: 1
                              }}
                            >
                              {category.count.toLocaleString()}
                            </Typography>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}
                            >
                              {category.countLabel}
                            </Typography>
                          </>
                        )}
                      </Box>
                    )}
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748b',
                      fontWeight: 500,
                      lineHeight: 1.5,
                      flexGrow: 1
                    }}
                  >
                    {category.description}
                  </Typography>

                  {category.tags && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {category.tags.map((tag) => (
                        <Box
                          key={tag}
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            bgcolor: category.bg,
                            borderRadius: '8px',
                            border: `1px solid ${category.color}15`
                          }}
                        >
                          <Typography sx={{ fontWeight: 800, fontSize: '0.7rem', color: category.color }}>{tag}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </MotionCard>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
