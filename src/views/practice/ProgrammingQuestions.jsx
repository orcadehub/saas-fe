import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Breadcrumbs, Link, Stack } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { IconCode, IconChevronRight, IconCheck } from '@tabler/icons-react';
import CardSkeleton from 'ui-component/skeletons/CardSkeleton';
import apiService from 'services/apiService';
import { motion } from 'framer-motion';

const MotionCard = motion.create(Card);

export default function ProgrammingQuestions() {
  const navigate = useNavigate();
  const { topic } = useParams();
  const [questions, setQuestions] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
    fetchCompletedStatus();
  }, [topic]);

  const fetchQuestions = async () => {
    try {
      const data = await apiService.getProgrammingTopicQuestions(topic);
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedStatus = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await fetch(`${import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api'}/practice-submissions/completed`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCompletedIds(data.completedQuestionIds || []);
    } catch (error) {
      console.error('Error fetching completed status:', error);
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
            const isCompleted = completedIds.includes(question._id);
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
                  bgcolor: isCompleted ? '#f0fdf4' : '#fff', // High-end green for completed
                  border: isCompleted ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid #f1f5f9',
                  boxShadow: isCompleted ? '0 8px 30px rgba(52, 211, 153, 0.08)' : '0 4px 20px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { 
                    transform: 'translateY(-8px)', 
                    boxShadow: isCompleted ? '0 15px 40px rgba(52, 211, 153, 0.15)' : '0 12px 30px rgba(15, 23, 42, 0.08)' 
                  }
                }}
                onClick={() => navigate(`/practice/programming/${topic}/${question._id}`)}
              >
                {/* Completed Banner if applicable */}
                {isCompleted && (
                  <Box sx={{ 
                    position: 'absolute', top: 0, right: 0, width: 40, height: 40,
                    bgcolor: '#34d399', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
                  }}>
                    <IconCheck size={16} style={{ marginBottom: 12, marginLeft: 12 }} />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 2.5, sm: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                    <Box sx={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      width: 44, height: 44, 
                      borderRadius: '12px', 
                      bgcolor: isCompleted ? 'rgba(52, 211, 153, 0.2)' : '#f8fafc', 
                      color: isCompleted ? '#059669' : '#6366f1' 
                    }}>
                      <IconCode size={24} />
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
                    {question.description || 'Practice your problem-solving skills with this interactive challenge.'}
                  </Typography>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2.5 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {question.tags?.slice(0, 2).map((tag, tIdx) => (
                        <Chip
                          key={tIdx}
                          label={tag}
                          size="small"
                          sx={{ 
                            height: '24px',
                            fontSize: '0.7rem',
                            fontWeight: 700, 
                            bgcolor: isCompleted ? 'rgba(52, 211, 153, 0.1)' : '#f1f5f9', 
                            color: isCompleted ? '#059669' : '#475569',
                            borderRadius: '6px'
                          }}
                        />
                      ))}
                    </Box>
                    {isCompleted && (
                       <Typography sx={{ color: '#059669', fontWeight: 900, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                         <IconCheck size={14} /> DONE
                       </Typography>
                    )}
                  </Stack>
                </CardContent>
              </MotionCard>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
