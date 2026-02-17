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

      <Typography variant="h3" sx={{ mb: 1 }}>
        {topic}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Practice programming questions
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <IconCode size={24} color="#1976d2" />
                  <Typography variant="h4" sx={{ flexGrow: 1 }}>
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
                    color={getDifficultyColor(question.difficulty)}
                  />
                  {question.tags?.map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag}
                      size="small"
                      variant="outlined"
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
