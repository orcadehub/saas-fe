import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { IconBook } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import useConfig from 'hooks/useConfig';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from 'services/apiService';

export default function StudyMaterials() {
  const navigate = useNavigate();
  const { state: { borderRadius } } = useConfig();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await apiService.getStudyMaterials();
        setMaterials(data);
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  if (loading) {
    return (
      <MainCard title="Study Materials">
        <Typography>Loading...</Typography>
      </MainCard>
    );
  }

  return (
    <MainCard title="Study Materials">
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2
      }}>
        {materials.map((material) => (
          <Card
            key={material._id}
            onClick={() => navigate(`/study-materials/${material._id}`)}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s',
              borderRadius: `${borderRadius}px`,
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <IconBook size={24} color="#1976d2" />
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                  {material.title}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                {material.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 'auto' }}>
                <Chip label={`${material.chapters?.length || 0} chapters`} size="small" color="primary" />
                <Chip label={`${material.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0} lessons`} size="small" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </MainCard>
  );
}
