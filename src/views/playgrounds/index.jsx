import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Code, Storage, Cloud, Security, Dns, Computer, Memory, Terminal, DataObject, Hub } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';

const labs = [
  { id: 'c-programming', name: 'C Programming Lab', icon: <Code />, color: '#00599C', topics: ['Basics', 'Pointers', 'Structures', 'File Handling', 'Memory Management'], experiments: 12, description: 'Master C programming fundamentals and system programming' },
  { id: 'cpp-programming', name: 'C++ Programming Lab', icon: <Code />, color: '#00599C', topics: ['OOP', 'STL', 'Templates', 'Exception Handling', 'Smart Pointers'], experiments: 12, description: 'Learn C++ and object-oriented programming concepts' },
  { id: 'java-programming', name: 'Java Programming Lab', icon: <Code />, color: '#f57c00', topics: ['Core Java', 'Collections', 'Multithreading', 'JDBC', 'Servlets'], experiments: 12, description: 'Java programming and enterprise applications' },
  { id: 'python-programming', name: 'Python Programming Lab', icon: <Terminal />, color: '#388e3c', topics: ['Basics', 'Data Structures', 'OOP', 'File Handling', 'Libraries'], experiments: 12, description: 'Python programming from basics to advanced' }
];

export default function Labs() {
  const navigate = useNavigate();

  return (
    <MainCard title="Programming Labs">
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2
      }}>
        {labs.map((lab, index) => (
          <Card
            key={index}
            onClick={() => navigate(`/labs/${lab.id}`)}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s',
              borderRadius: 4,
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ color: lab.color }}>{lab.icon}</Box>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                  {lab.name}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                {lab.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 'auto' }}>
                <Chip label={`${lab.experiments} Experiments`} size="small" color="primary" />
                {lab.topics.slice(0, 2).map((topic, idx) => (
                  <Chip key={idx} label={topic} size="small" variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </MainCard>
  );
}
