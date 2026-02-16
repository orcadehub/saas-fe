import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconTrophy } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { gamifiedData } from '../../data/gamifiedData';

export default function GamifiedPractice() {
  const navigate = useNavigate();
  const [subtopics] = useState(gamifiedData.subtopics);

  return (
    <MainCard title="Gamified Practice">
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
              onClick={() => navigate(`/practice/gamified/${subtopic._id}`)}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <IconTrophy size={24} color="#1976d2" />
                  <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    {subtopic.title}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {subtopic.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
    </MainCard>
  );
}
