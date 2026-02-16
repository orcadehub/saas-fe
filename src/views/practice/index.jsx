import { useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { IconCode, IconTrophy, IconClipboardList, IconBrain, IconBook, IconCalculator, IconBuilding } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';

const practiceCategories = [
  {
    id: 'programming',
    title: 'Programming',
    description: 'Master data structures, algorithms, and problem-solving skills',
    icon: IconCode
  },
  {
    id: 'gamified',
    title: 'Gamified',
    description: 'Learn through interactive games and challenges',
    icon: IconTrophy
  },
  {
    id: 'assessment',
    title: 'Assessment Questions',
    description: 'Practice real assessment problems and coding tests',
    icon: IconClipboardList
  },
  {
    id: 'aptitude',
    title: 'Aptitude',
    description: 'Enhance logical reasoning and analytical thinking',
    icon: IconBrain
  },
  {
    id: 'verbal',
    title: 'Verbal Ability',
    description: 'Improve vocabulary, grammar, and comprehension skills',
    icon: IconBook
  },
  {
    id: 'quantitative',
    title: 'Quantitative',
    description: 'Solve mathematical and numerical reasoning questions',
    icon: IconCalculator
  },
  {
    id: 'company',
    title: 'Company Specific',
    description: 'Practice company-wise interview questions',
    icon: IconBuilding
  }
];

export default function Practice() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId) => {
    navigate(`/practice/${categoryId}`);
  };

  return (
    <MainCard title="Practice">
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
        {practiceCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card
              key={category.id}
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
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Icon size={24} color="#1976d2" />
                  <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    {category.title}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {category.description}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </MainCard>
  );
}
