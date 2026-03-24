import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Breadcrumbs, Link } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { IconBook, IconChevronRight, IconClipboardList, IconCalculator } from '@tabler/icons-react';
import CardSkeleton from 'ui-component/skeletons/CardSkeleton';
import apiService from 'services/apiService';
import { motion } from 'framer-motion';

const MotionCard = motion.create(Card);

export default function GenericPracticeQuestions({ category, title, icon: Icon, fetchMethod }) {
  const navigate = useNavigate();
  const { topic } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [topic]);

  const fetchQuestions = async () => {
    try {
      const data = await apiService[fetchMethod](topic);
      setQuestions(data);
    } catch (error) {
      console.error(`Error fetching ${category} questions:`, error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyTheme = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return { color: '#16a34a', bg: '#f0fdf4' };
      case 'medium': return { color: '#d97706', bg: '#fffbeb' };
      case 'hard': return { color: '#dc2626', bg: '#fef2f2' };
      default: return { color: '#64748b', bg: '#f8fafc' };
    }
  };

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
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate(`/practice/${category}`);
          }}
          sx={{ cursor: 'pointer', fontWeight: 600, color: '#64748b', '&:hover': { color: '#6366f1' } }}
        >
          {title}
        </Link>
        <Typography sx={{ fontWeight: 800, color: '#1e293b', textTransform: 'capitalize' }}>{topic}</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h1" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, fontSize: '2.5rem', letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
          {topic}
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
          Master {topic} foundations with these targeted practice challenges.
        </Typography>
      </Box>

      {loading ? (
        <CardSkeleton count={12} />
      ) : questions.length === 0 ? (
        <Box sx={{ p: 8, textAlign: 'center', bgcolor: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
          <Typography sx={{ color: '#64748b', fontWeight: 600 }}>No questions found for this topic yet.</Typography>
        </Box>
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
          {questions.map((question, idx) => {
            const theme = getDifficultyTheme(question.difficulty);
            return (
              <MotionCard
                key={question._id}
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
                onClick={() => navigate(`/practice/assessment/${question._id}`)}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 2.5, sm: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                    <Box sx={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      width: 44, height: 44, 
                      borderRadius: '10px', 
                      bgcolor: '#f8fafc', 
                      color: '#6366f1' 
                    }}>
                      <Icon size={24} />
                    </Box>
                    <Box sx={{ 
                      bgcolor: theme.bg, 
                      color: theme.color, 
                      px: 1.5, py: 0.5, 
                      borderRadius: '8px', 
                      fontSize: '0.65rem', 
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      border: `1px solid ${theme.color}20`
                    }}>
                      {question.difficulty}
                    </Box>
                  </Box>
                  
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: '#1e293b', 
                    mb: 1.5,
                    fontSize: '1.15rem',
                    lineHeight: 1.4
                  }}>
                    {question.title}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ 
                    color: '#64748b', 
                    fontWeight: 500, 
                    lineHeight: 1.6,
                    flexGrow: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {question.description || 'Practice your skills with this targeted dummy challenge provided for review.'}
                  </Typography>

                  <Box sx={{ mt: 2.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {question.tags?.slice(0, 2).map((tag, tIdx) => (
                      <Chip
                        key={tIdx}
                        label={tag}
                        size="small"
                        sx={{ 
                          height: '24px',
                          fontSize: '0.7rem',
                          fontWeight: 700, 
                          bgcolor: '#f1f5f9', 
                          color: '#475569',
                          borderRadius: '6px'
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </MotionCard>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
