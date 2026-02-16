import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Breadcrumbs, Link } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { IconTrophy, IconChevronRight } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import apiService from 'services/apiService';

export default function GamifiedSubtopics() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [topicId]);

  const fetchData = async () => {
    try {
      const [topicRes, subtopicsRes] = await Promise.all([
        apiService.get(`/student-practice/topics/${topicId}`),
        apiService.get(`/student-practice/topics/${topicId}/subtopics`)
      ]);
      setTopic(topicRes.data);
      setSubtopics(subtopicsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubtopicClick = (subtopicId) => {
    navigate(`/practice/gamified/${topicId}/${subtopicId}`);
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
            navigate('/practice/gamified');
          }}
          sx={{ cursor: 'pointer' }}
        >
          Gamified
        </Link>
        <Typography color="text.primary">{topic?.name || 'Loading...'}</Typography>
      </Breadcrumbs>

      <Typography variant="h3" sx={{ mb: 1 }}>
        {topic?.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {topic?.description}
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : subtopics.length === 0 ? (
        <Typography>No subtopics found</Typography>
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
          {subtopics.map((subtopic) => (
            <Card
              key={subtopic._id}
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
              onClick={() => handleSubtopicClick(subtopic._id)}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <IconTrophy size={24} color="#1976d2" />
                  <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    {subtopic.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {subtopic.description || 'Practice gamified questions'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 'auto' }}>
                  <Chip
                    label={`${subtopic.questionCount} Questions`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`${subtopic.progress || 0}% Complete`}
                    size="small"
                    color="success"
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
