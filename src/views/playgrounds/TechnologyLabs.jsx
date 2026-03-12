import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Chip, CircularProgress, IconButton } from '@mui/material';
import { Code, ArrowBack } from '@mui/icons-material';
import MainCard from 'ui-component/cards/MainCard';
import apiService from 'services/apiService';

const difficultyColors = {
  'Easy': 'success',
  'Medium': 'warning',
  'Hard': 'error'
};

export default function TechnologyLabs() {
  const { technology } = useParams();
  const decodedTechnology = decodeURIComponent(technology);
  const navigate = useNavigate();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabs();
  }, [technology]);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const response = await apiService.client.get('/labs');
      const filtered = response.data.filter(lab => lab.technology === decodedTechnology);
      setLabs(filtered);
    } catch (error) {
      console.error('Error fetching labs:', error);
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <MainCard title={
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/labs')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h3">{decodedTechnology} Labs</Typography>
      </Box>
    }>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {labs.length > 0 ? (
          labs.map(lab => (
            <Card 
              key={lab._id}
              sx={{ 
                cursor: 'pointer', 
                transition: 'all 0.3s', 
                borderRadius: 2,
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                border: '1px solid',
                borderColor: 'divider'
              }}
              onClick={() => navigate(`/labs/${lab._id}`)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Code sx={{ color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {lab.title}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label={lab.difficulty} 
                      size="small" 
                      color={difficultyColors[lab.difficulty] || 'default'}
                    />
                    <Chip label={`${lab.timeLimit || 60} min`} size="small" variant="outlined" />
                    <Chip label={`${lab.points} pts`} size="small" color="primary" />
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {lab.description}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No labs available for {decodedTechnology}.
          </Typography>
        )}
      </Box>
    </MainCard>
  );
}
