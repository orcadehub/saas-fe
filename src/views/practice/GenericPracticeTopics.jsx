import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { IconChevronRight, IconClipboardList, IconBook, IconCalculator, IconBrain } from '@tabler/icons-react';
import CardSkeleton from 'ui-component/skeletons/CardSkeleton';
import apiService from 'services/apiService';
import { motion } from 'framer-motion';

const MotionCard = motion.create(Card);

export default function GenericPracticeTopics({ category, title, icon: Icon, fetchMethod }) {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const data = await apiService[fetchMethod]();
      setTopics(data);
    } catch (error) {
      console.error(`Error fetching ${category} topics:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    if (selectedTopics.length === 0) return;
    setGenerating(true);
    try {
      let testQuestions = [];
      if (category === 'aptitude') {
        testQuestions = await apiService.generateAptitudeTest(selectedTopics);
      } else {
        // Fallback or generic method if implemented
        testQuestions = await apiService.generateAptitudeTest(selectedTopics);
      }

      // Store questions in session storage to pass to the test page
      sessionStorage.setItem('testQuestions', JSON.stringify(testQuestions));
      sessionStorage.setItem('testTitle', `${title} Mastery Test`);
      navigate(`/practice/${category}/test-execution`);
    } catch (error) {
      console.error('Error generating test:', error);
    } finally {
      setGenerating(false);
      setShowTestModal(false);
    }
  };

  const colors = [
    { color: '#6366f1', bg: '#f5f3ff' },
    { color: '#ec4899', bg: '#fdf2f8' },
    { color: '#8b5cf6', bg: '#f5f3ff' },
    { color: '#06b6d4', bg: '#ecfeff' },
    { color: '#10b981', bg: '#f0fdf4' }
  ];

  return (
    <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
      <Breadcrumbs separator={<IconChevronRight size={16} />} sx={{ mb: 4 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/practice');
          }}
          sx={{ cursor: 'pointer', fontWeight: 600, color: '#64748b', '&:hover': { color: '#6366f1' } }}
        >
          Practice
        </Link>
        <Typography sx={{ fontWeight: 800, color: '#1e293b' }}>{title}</Typography>
      </Breadcrumbs>

      <Box
        sx={{
          mb: 6,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'flex-end' },
          gap: 3
        }}
      >
        <Box>
          <Typography variant="h1" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
            {title} Training
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
            Master {title.toLowerCase()} essentials and prepare for your next challenge.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<IconClipboardList />}
          onClick={() => setShowTestModal(true)}
          sx={{
            borderRadius: '16px',
            py: 1.5,
            px: 4,
            fontWeight: 800,
            bgcolor: '#6366f1',
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)',
            '&:hover': { bgcolor: '#4f46e5', transform: 'translateY(-2px)' },
            transition: 'all 0.2s'
          }}
        >
          Take Assessment Test
        </Button>
      </Box>

      {loading ? (
        <CardSkeleton count={12} />
      ) : (
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
          {topics.map((topic, idx) => {
            const theme = colors[idx % colors.length];
            return (
              <MotionCard
                key={topic.topic}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
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
                onClick={() => {
                  if (['aptitude', 'verbal', 'quantitative'].includes(category)) {
                    navigate(`/practice/${category}/topic/${topic.topic}`);
                  } else {
                    navigate(`/practice/${category}/${topic.topic}`);
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 2.5, sm: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 52,
                        height: 52,
                        borderRadius: '12px',
                        bgcolor: theme.bg,
                        color: theme.color
                      }}
                    >
                      <Icon size={28} />
                    </Box>
                    <Box
                      sx={{
                        bgcolor: theme.bg,
                        color: theme.color,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        border: `1px solid ${theme.color}20`
                      }}
                    >
                      {topic.count} Challenges
                    </Box>
                  </Box>

                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#1e293b',
                      mb: 1.5,
                      fontSize: '1.25rem',
                      textTransform: 'capitalize'
                    }}
                  >
                    {topic.topic}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748b',
                      fontWeight: 600,
                      lineHeight: 1.6,
                      flexGrow: 1
                    }}
                  >
                    Explore specialized {topic.topic} modules and track your progress.
                  </Typography>
                </CardContent>
              </MotionCard>
            );
          })}
        </Box>
      )}
      {/* Test Configuration Modal */}
      <Dialog
        open={showTestModal}
        onClose={() => setShowTestModal(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '28px',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ p: 3, pb: 1 }}>
          <Box component="span" sx={{ fontWeight: 900, color: '#1e293b', fontSize: '1.5rem', display: 'block' }}>
            Generate Custom Test
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontWeight: 600 }}>
            Select topics to include in your 40-question randomized test.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {topics.map((topic) => {
              const isSelected = selectedTopics.includes(topic.topic);
              return (
                <Chip
                  key={topic.topic}
                  label={topic.topic}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedTopics((prev) => prev.filter((t) => t !== topic.topic));
                    } else {
                      setSelectedTopics((prev) => [...prev, topic.topic]);
                    }
                  }}
                  sx={{
                    py: 2.5,
                    px: 1,
                    borderRadius: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    bgcolor: isSelected ? '#6366f1' : '#f1f5f9',
                    color: isSelected ? '#fff' : '#475569',
                    border: '1px solid',
                    borderColor: isSelected ? '#6366f1' : '#e2e8f0',
                    '&:hover': {
                      bgcolor: isSelected ? '#4f46e5' : '#e2e8f0'
                    },
                    transition: 'all 0.2s',
                    textTransform: 'capitalize'
                  }}
                />
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setShowTestModal(false)} sx={{ fontWeight: 700, color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={selectedTopics.length === 0 || generating}
            onClick={handleStartTest}
            sx={{
              borderRadius: '14px',
              px: 4,
              fontWeight: 800,
              bgcolor: '#6366f1',
              boxShadow: '0 8px 15px rgba(99, 102, 241, 0.15)',
              '&:hover': { bgcolor: '#4f46e5' }
            }}
          >
            {generating ? <CircularProgress size={24} color="inherit" /> : 'Start Test Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
