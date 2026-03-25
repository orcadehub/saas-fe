import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Breadcrumbs, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconCode, IconChevronRight } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import CardSkeleton from 'ui-component/skeletons/CardSkeleton';
import apiService from 'services/apiService';
import { motion } from 'framer-motion';

const MotionCard = motion.create(Card);

export default function ProgrammingPractice() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const data = await apiService.getProgrammingTopics();
      setTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
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

  return (
    <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h1" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
          ORCA
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
          Master essential coding principles, data structures, and algorithms through competitive challenges.
        </Typography>
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
            const theme = getTopicColor(idx);
            return (
              <MotionCard
                key={topic.topic}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
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
                onClick={() => navigate(`/practice/programming/${topic.topic}`)}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 2.5, sm: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                    <Box sx={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      width: 52, height: 52, 
                      borderRadius: '12px', 
                      bgcolor: theme.bg, 
                      color: theme.color 
                    }}>
                      <IconCode size={28} />
                    </Box>
                    <Box sx={{ 
                      bgcolor: theme.bg, 
                      color: theme.color, 
                      px: 1.5, py: 0.5, 
                      borderRadius: '10px', 
                      fontSize: '0.75rem', 
                      fontWeight: 800,
                      border: `1px solid ${theme.color}20`
                    }}>
                      {topic.count} Challenges
                    </Box>
                  </Box>
                  
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: '#1e293b', 
                    mb: 1.5,
                    fontSize: '1.25rem',
                    textTransform: 'capitalize'
                  }}>
                    {topic.topic}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ 
                    color: '#64748b', 
                    fontWeight: 600, 
                    lineHeight: 1.6,
                    flexGrow: 1 
                  }}>
                    Deep dive into {topic.topic} with targeted problem solving.
                  </Typography>
                </CardContent>
              </MotionCard>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
