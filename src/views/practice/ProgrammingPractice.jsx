import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconCode } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import axios from 'axios';

export default function ProgrammingPractice() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const baseURL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';
      const response = await axios.get(`${baseURL}/programming-questions/topics`);
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="Programming Practice">
      {loading ? (
        <Typography>Loading...</Typography>
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
          {topics.map((topic) => (
            <Card
              key={topic.topic}
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
              onClick={() => navigate(`/practice/programming/${topic.topic}`)}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <IconCode size={24} color="#1976d2" />
                  <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    {topic.topic}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 'auto' }}>
                  <Chip
                    label={`${topic.count} Questions`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </MainCard>
  );
}
