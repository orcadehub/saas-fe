import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Chip, CircularProgress } from '@mui/material';
import { Code, Storage, Language, DataObject } from '@mui/icons-material';
import MainCard from 'ui-component/cards/MainCard';
import apiService from 'services/apiService';

const techConfig = {
  'C': { icon: Code, color: '#A8B9CC' },
  'C++': { icon: Code, color: '#00599C' },
  'Java': { icon: Code, color: '#007396' },
  'Python': { icon: Code, color: '#3776AB' },
  'JavaScript': { icon: Code, color: '#F7DF1E' },
  'React': { icon: DataObject, color: '#61DAFB' },
  'MongoDB': { icon: Storage, color: '#47A248' },
  'MySQL': { icon: Storage, color: '#4479A1' },
  'PostgreSQL': { icon: Storage, color: '#336791' },
  'HTML/CSS': { icon: Language, color: '#E34F26' },
  'AI': { icon: Code, color: '#FF6F00' },
  'ML': { icon: Code, color: '#4CAF50' },
  'IoT': { icon: Code, color: '#00BCD4' }
};

export default function LabsList() {
  const navigate = useNavigate();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedLabs, setGroupedLabs] = useState({});

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const response = await apiService.client.get('/labs');
      setLabs(response.data || []);
    } catch (error) {
      console.error('Error fetching labs:', error);
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const grouped = labs.reduce((acc, lab) => {
      const tech = lab.technology || 'Other';
      if (!acc[tech]) acc[tech] = [];
      acc[tech].push(lab);
      return acc;
    }, {});
    setGroupedLabs(grouped);
  }, [labs]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  if (Object.keys(groupedLabs).length === 0) {
    return (
      <MainCard title={<Typography variant="h3">Coding Labs</Typography>}>
        <Typography variant="body1" color="text.secondary">
          No labs available yet.
        </Typography>
      </MainCard>
    );
  }

  return (
    <MainCard title={<Typography variant="h3">Coding Labs</Typography>}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {Object.entries(groupedLabs).map(([technology, techLabs]) => {
          const config = techConfig[technology] || { icon: Code, color: '#1976d2' };
          const Icon = config.icon;
          return (
            <Card 
              key={technology}
              sx={{ 
                cursor: 'pointer', 
                transition: 'all 0.3s', 
                borderRadius: 4,
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
              onClick={() => navigate(`/labs/technology/${encodeURIComponent(technology)}`)}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Icon sx={{ color: config.color, fontSize: 24 }} />
                  <Typography variant="h4" sx={{ flexGrow: 1 }}>{technology}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  Practice {technology} programming challenges
                </Typography>
                <Chip label={`${techLabs.length} Lab${techLabs.length > 1 ? 's' : ''}`} color="primary" size="small" />
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </MainCard>
  );
}
