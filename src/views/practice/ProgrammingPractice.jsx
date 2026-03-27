import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Stack, LinearProgress, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconCode, IconCircleCheck, IconStar } from '@tabler/icons-react';
import CardSkeleton from 'ui-component/skeletons/CardSkeleton';
import apiService from 'services/apiService';
import { motion } from 'framer-motion';

const MotionCard = motion.create(Card);

export default function ProgrammingPractice() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState({ solvedCount: 0, totalQuestions: 0, topicStats: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
        try {
            await Promise.all([fetchTopics(), fetchStats()]);
        } finally {
            setLoading(false);
        }
    };
    loadAll();
  }, []);

  const fetchTopics = async () => {
    try {
      const data = await apiService.getProgrammingTopics();
      setTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await fetch(`${import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api'}/practice-submissions/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getTopicColor = (index) => {
    const colors = [
      { color: '#6366f1', bg: '#f5f3ff' },
      { color: '#ec4899', bg: '#fdf2f8' },
      { color: '#8b5cf6', bg: '#f5f3ff' },
      { color: '#06b6d4', bg: '#ecfeff' },
      { color: '#10b981', bg: '#f0fdf4' }
    ];
    return colors[index % colors.length];
  };

  const overallProgress = stats.totalQuestions > 0 ? (stats.solvedCount / stats.totalQuestions) * 100 : 0;

  return (
    <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 6 }} spacing={3}>
        <Box>
          <Typography variant="h1" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
            ORCA <Box component="span" sx={{ color: '#6366f1' }}>Practice</Box>
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
            Master essential coding principles through adaptive, gamified challenges.
          </Typography>
        </Box>

        {!loading && (
           <Box sx={{ 
              minWidth: { xs: '100%', md: 350 }, p: 3, borderRadius: '28px', 
              bgcolor: '#fff', border: '1px solid #f1f5f9',
              boxShadow: '0 10px 40px rgba(0,0,0,0.03)'
           }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                 <Typography sx={{ color: '#1e293b', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconStar size={20} color="#fbbf24" fill="#fbbf24" /> Platform Mastery
                 </Typography>
                 <Typography sx={{ color: '#6366f1', fontWeight: 900, fontSize: '1.2rem' }}>
                    {stats.solvedCount}<Box component="span" sx={{ color: '#94a3b8', mx: 0.5 }}>/</Box>{stats.totalQuestions}
                 </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={overallProgress} sx={{ height: 12, borderRadius: 6, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { borderRadius: 5, bgcolor: '#6366f1' } }} />
              <Typography sx={{ mt: 1.5, color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                 Curriculum {Math.round(overallProgress)}% Mastered
              </Typography>
           </Box>
        )}
      </Stack>

      {loading ? (
        <CardSkeleton count={12} />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
          {topics.map((topic, idx) => {
            const theme = getTopicColor(idx);
            const solvedInTopic = stats.topicStats[topic.topic] || 0;
            const totalInTopic = topic.count;
            const isCompleted = solvedInTopic >= totalInTopic && totalInTopic > 0;
            
            return (
              <MotionCard
                key={topic.topic}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                sx={{
                  cursor: 'pointer', borderRadius: '24px', bgcolor: '#fff', border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)', display: 'flex', flexDirection: 'column', height: '100%',
                  position: 'relative', overflow: 'hidden', transition: 'all 0.3s',
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 15px 40px rgba(15, 23, 42, 0.1)' }
                }}
                onClick={() => navigate(`/practice/programming/${topic.topic}`)}
              >
                {/* Visual Progress Indication */}
                {isCompleted && (
                   <Box sx={{ position: 'absolute', top: 0, right: 0, width: 44, height: 44, bgcolor: '#34d399', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}>
                      <IconCircleCheck size={18} style={{ marginBottom: 12, marginLeft: 12 }} />
                   </Box>
                )}

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 3, sm: 3.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '14px', bgcolor: theme.bg, color: theme.color }}>
                      <IconCode size={30} />
                    </Box>
                    <Chip 
                      label={`${solvedInTopic}/${totalInTopic}`}
                      size="small"
                      sx={{ 
                        fontWeight: 900, fontSize: '0.75rem', height: 26, borderRadius: '8px',
                        bgcolor: isCompleted ? 'rgba(52, 211, 153, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                        color: isCompleted ? '#34d399' : '#6366f1',
                        border: `1px solid ${isCompleted ? '#34d39940' : '#6366f140'}`
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b', mb: 1.5, fontSize: '1.25rem', textTransform: 'capitalize' }}>
                    {topic.topic}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, lineHeight: 1.6, flexGrow: 1, mb: 3 }}>
                    Deep dive into {topic.topic} with targeted problem solving.
                  </Typography>

                  <Box sx={{ mt: 'auto' }}>
                     <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>Topic Progress</Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: isCompleted ? '#34d399' : '#64748b' }}>{Math.round((solvedInTopic/totalInTopic)*100)}%</Typography>
                     </Stack>
                     <LinearProgress 
                        variant="determinate" 
                        value={(solvedInTopic / totalInTopic) * 100} 
                        sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: isCompleted ? '#34d399' : theme.color } }} 
                     />
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
