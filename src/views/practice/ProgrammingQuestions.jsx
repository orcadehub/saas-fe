import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Breadcrumbs, Link } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { IconCode, IconChevronRight } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import CardSkeleton from 'ui-component/skeletons/CardSkeleton';
import axios from 'axios';

export default function ProgrammingQuestions() {
  const navigate = useNavigate();
  const { topic } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [topic]);

  const fetchQuestions = async () => {
    try {
      const baseURL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';
      const response = await axios.get(`${baseURL}/programming-questions/questions/${topic}`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  return (
    <MainCard>
      <Breadcrumbs separator={<IconChevronRight size={16} />} sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/practice');
          }}
          sx={{ cursor: 'pointer' }}
        >
          Practice
        </Link>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/practice/programming');
          }}
          sx={{ cursor: 'pointer' }}
        >
          Programming
        </Link>
        <Typography color="text.primary">{topic}</Typography>
      </Breadcrumbs>

      <Typography variant="h2" sx={{ mb: 1, fontWeight: 900, color: '#1e293b', fontSize: '2.25rem', letterSpacing: '-0.02em' }}>
        {topic}
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#64748b', fontWeight: 500, fontSize: '1.1rem' }}>
        Master {topic} with these practice problems
      </Typography>

      {loading ? (
        <CardSkeleton count={12} />
      ) : questions.length === 0 ? (
        <Typography>No questions found</Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: 2
          }}
        >
          {questions.map((question) => (
            <Card
              key={question._id}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                borderRadius: 4,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                },
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
              onClick={() => navigate(`/practice/programming/${topic}/${question._id}`)}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <IconCode size={28} color="#6366f1" />
                  <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 800, color: '#1e293b' }}>
                    {question.title}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {question.description?.substring(0, 100) || 'No description'}...
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 'auto' }}>
                  <Chip
                    label={question.difficulty}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      borderRadius: '6px',
                      bgcolor: question.difficulty?.toLowerCase() === 'easy' ? 'rgba(34, 197, 94, 0.1)' : 
                               question.difficulty?.toLowerCase() === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 
                               'rgba(239, 68, 68, 0.1)',
                      color: question.difficulty?.toLowerCase() === 'easy' ? '#16a34a' : 
                             question.difficulty?.toLowerCase() === 'medium' ? '#d97706' : 
                             '#dc2626'
                    }}
                  />
                  {question.tags?.slice(0, 2).map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 700, borderRadius: '6px', borderColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </MainCard>
  );
}
