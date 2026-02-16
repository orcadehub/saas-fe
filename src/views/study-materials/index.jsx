import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { IconBook } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';

const studyMaterials = [
  { id: 1, name: 'C Programming', description: 'Basics to advanced C programming concepts', category: 'Programming' },
  { id: 2, name: 'C++', description: 'Object-oriented programming with C++', category: 'Programming' },
  { id: 3, name: 'Java', description: 'Core Java and advanced Java concepts', category: 'Programming' },
  { id: 4, name: 'Python', description: 'Python programming from basics to advanced', category: 'Programming' },
  { id: 5, name: 'Data Structures & Algorithms', description: 'DSA concepts and problem solving', category: 'Core CS' },
  { id: 6, name: 'HTML', description: 'HTML5 and semantic markup', category: 'Web Development' },
  { id: 7, name: 'CSS', description: 'CSS3, Flexbox, Grid, and animations', category: 'Web Development' },
  { id: 8, name: 'JavaScript', description: 'Modern JavaScript ES6+ features', category: 'Web Development' },
  { id: 9, name: 'React', description: 'React.js library and hooks', category: 'Web Development' },
  { id: 10, name: 'Node.js & Express', description: 'Backend development with Node and Express', category: 'Web Development' },
  { id: 11, name: 'MongoDB', description: 'NoSQL database and CRUD operations', category: 'Database' },
  { id: 12, name: 'Django', description: 'Python web framework', category: 'Web Development' },
  { id: 13, name: 'Machine Learning', description: 'ML algorithms and model training', category: 'AI/ML' },
  { id: 14, name: 'Artificial Intelligence', description: 'AI concepts and applications', category: 'AI/ML' },
  { id: 15, name: 'Data Science', description: 'Data analysis and visualization', category: 'AI/ML' },
  { id: 16, name: 'Cybersecurity', description: 'Network security and ethical hacking', category: 'Security' },
  { id: 17, name: 'IoT', description: 'Internet of Things and embedded systems', category: 'Emerging Tech' },
  { id: 18, name: 'Operating Systems', description: 'OS concepts and process management', category: 'Core CS' },
  { id: 19, name: 'DBMS', description: 'Database management systems', category: 'Database' },
  { id: 20, name: 'Computer Networks', description: 'Networking protocols and architecture', category: 'Core CS' },
  { id: 21, name: 'Cloud Computing', description: 'AWS, Azure, and cloud services', category: 'Emerging Tech' },
  { id: 22, name: 'DevOps', description: 'CI/CD, Docker, and Kubernetes', category: 'Emerging Tech' },
  { id: 23, name: 'Blockchain', description: 'Blockchain technology and cryptocurrencies', category: 'Emerging Tech' },
  { id: 24, name: 'Software Engineering', description: 'SDLC and software design patterns', category: 'Core CS' }
];

export default function StudyMaterials() {
  return (
    <MainCard title="Study Materials">
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
        {studyMaterials.map((material) => (
          <Card
            key={material.id}
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
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <IconBook size={24} color="#1976d2" />
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                  {material.name}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                {material.description}
              </Typography>

              <Box sx={{ mt: 'auto' }}>
                <Chip
                  label={material.category}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </MainCard>
  );
}
