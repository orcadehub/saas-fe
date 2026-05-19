import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  Chip
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { IconChevronRight, IconExternalLink, IconHierarchy } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import dsaData from 'data/dsa_problems.json';

const MotionCard = motion.create(Card);

export default function DSAQuestions() {
  const navigate = useNavigate();
  const { topic } = useParams();
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    // Find topic data
    const topicData = dsaData.find(t => t.topicName === decodeURIComponent(topic));
    if (topicData) {
      // Sort problems by difficulty: Easy -> Medium -> Hard
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
      const sortedProblems = [...topicData.problems].sort((a, b) => {
        const diffA = difficultyOrder[a.level?.toLowerCase()] || 4;
        const diffB = difficultyOrder[b.level?.toLowerCase()] || 4;
        return diffA - diffB;
      });
      setProblems(sortedProblems);
    }
  }, [topic]);

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy':
        return { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' };
      case 'medium':
        return { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' };
      case 'hard':
        return { color: '#ef4444', bg: '#fef2f2', border: '#fecaca' };
      case 'no':
        return { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' };
      default:
        return { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
    }
  };

  return (
    <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
      <Breadcrumbs separator={<IconChevronRight size={16} />} sx={{ mb: 4 }}>
        <Link
          color="inherit"
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
          onClick={(e) => {
            e.preventDefault();
            navigate('/practice/dsa');
          }}
          sx={{ cursor: 'pointer', fontWeight: 600, color: '#64748b', '&:hover': { color: '#6366f1' } }}
        >
          DSA Practice
        </Link>
        <Typography sx={{ fontWeight: 800, color: '#1e293b', textTransform: 'capitalize' }}>
          {decodeURIComponent(topic)}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h1" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, fontSize: '2.5rem', letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
          {decodeURIComponent(topic)} Problems
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
          {problems.length} problems to master this topic.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {problems.map((prob, idx) => {
          const levelStyle = getLevelColor(prob.level);
          return (
            <MotionCard
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              sx={{
                borderRadius: '16px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.02)',
                '&:hover': {
                  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s'
              }}
            >
              <CardContent sx={{ p: '20px !important', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      flexShrink: 0
                    }}
                  >
                    {prob.no || idx + 1}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5, wordBreak: 'break-word' }}>
                      {prob.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {prob.pattern && (
                        <Chip
                          label={prob.pattern}
                          size="small"
                          sx={{
                            height: 24,
                            bgcolor: '#f1f5f9',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            borderRadius: '6px'
                          }}
                        />
                      )}
                      <Chip
                        label={prob.level?.toLowerCase() === 'no' ? 'Premium' : prob.level}
                        size="small"
                        sx={{
                          height: 24,
                          bgcolor: levelStyle.bg,
                          color: levelStyle.color,
                          borderColor: levelStyle.border,
                          borderWidth: 1,
                          borderStyle: 'solid',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: '6px'
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: { xs: '100%', sm: 'auto' }, pl: { xs: 7, sm: 0 } }}>
                  {prob.url && (
                    <Button
                      variant="outlined"
                      endIcon={<IconExternalLink size={16} />}
                      onClick={() => window.open(prob.url, '_blank')}
                      fullWidth
                      sx={{
                        borderRadius: '10px',
                        fontWeight: 700,
                        textTransform: 'none',
                        borderColor: '#e2e8f0',
                        color: '#475569',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                          borderColor: '#6366f1',
                          bgcolor: '#eef2ff',
                          color: '#6366f1'
                        }
                      }}
                    >
                      Solve on LeetCode
                    </Button>
                  )}
                </Box>
              </CardContent>
            </MotionCard>
          );
        })}
      </Box>
    </Box>
  );
}
