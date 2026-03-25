import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Code, Storage, Cloud, Security, Dns, Computer, Memory, Terminal, DataObject, Hub } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionCard = motion.create(Card);

const labs = [
  { id: 'c-programming', name: 'C Programming Lab', icon: <Code />, color: '#00599C', topics: ['Basics', 'Pointers', 'Structures', 'File Handling', 'Memory Management'], experiments: 12, description: 'Master C programming fundamentals and system programming' },
  { id: 'cpp-programming', name: 'C++ Programming Lab', icon: <Code />, color: '#00599C', topics: ['OOP', 'STL', 'Templates', 'Exception Handling', 'Smart Pointers'], experiments: 12, description: 'Learn C++ and object-oriented programming concepts' },
  { id: 'java-programming', name: 'Java Programming Lab', icon: <Code />, color: '#f57c00', topics: ['Core Java', 'Collections', 'Multithreading', 'JDBC', 'Servlets'], experiments: 12, description: 'Java programming and enterprise applications' },
  { id: 'python-programming', name: 'Python Programming Lab', icon: <Terminal />, color: '#388e3c', topics: ['Basics', 'Data Structures', 'OOP', 'File Handling', 'Libraries'], experiments: 12, description: 'Python programming from basics to advanced' },
  { id: 'frontend-lab', name: 'Frontend Lab (HTML/CSS)', icon: <Code />, color: '#E34F26', topics: ['HTML5', 'CSS3 Flex/Grid', 'Responsive Design', 'Bootstrap'], experiments: 12, description: 'Build visually stunning structured web pages' },
  { id: 'javascript-lab', name: 'JavaScript Lab', icon: <Code />, color: '#F7DF1E', topics: ['ES6+', 'DOM Manipulation', 'Async/Await', 'Fetch API'], experiments: 12, description: 'Master modern JavaScript features and DOM handling' },
  { id: 'react-lab', name: 'React Development Lab', icon: <Code />, color: '#61DAFB', topics: ['Components', 'Hooks', 'State Management', 'React Router'], experiments: 12, description: 'Build Single Page Applications natively with React' },
  { id: 'data-structures-lab', name: 'Data Structures Lab', icon: <Hub />, color: '#555555', topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Hashing'], experiments: 12, description: 'Implement complex algorithms and core structures' },
  { id: 'ai-lab', name: 'Artificial Intelligence Lab', icon: <Memory />, color: '#9c27b0', topics: ['Search Algorithms', 'Neural Networks', 'Logic', 'Heuristics'], experiments: 12, description: 'Implement pathfinding and advanced AI concepts' },
  { id: 'ml-lab', name: 'Machine Learning Lab', icon: <Computer />, color: '#00bcd4', topics: ['Regression', 'Classification', 'Clustering', 'Model Validation'], experiments: 12, description: 'Train and validate supervised and unsupervised ML models' },
  { id: 'iot-lab', name: 'Internet of Things Lab', icon: <Hub />, color: '#8bc34a', topics: ['Microcontrollers', 'Sensors', 'Actuators', 'Protocols'], experiments: 12, description: 'Work with IoT simulator boards and signals' },
  { id: 'cyber-security-lab', name: 'Cyber Security Lab', icon: <Security />, color: '#d32f2f', topics: ['Pen Testing', 'Cryptography', 'Network Security', 'Vulnerability Scan'], experiments: 12, description: 'Network scanning, encryption, and exploit testing' },
  { id: 'data-science-lab', name: 'Data Science Lab', icon: <DataObject />, color: '#1976d2', topics: ['Pandas', 'Numpy', 'Data Visualization', 'Cleaning'], experiments: 12, description: 'Analyze huge models and visualize data points' }
];

export default function Labs() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h1" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
          Programming Labs
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
          Master computer science concepts through deeply integrated virtual sandboxes.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 3
        }}
      >
        {labs.map((lab, idx) => {
          return (
            <MotionCard
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              sx={{
                cursor: 'pointer',
                borderRadius: '24px',
                bgcolor: '#fff',
                border: '1px solid #f1f5f9',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                '&:hover': { 
                  transform: 'translateY(-5px)', 
                  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)' 
                }
              }}
              onClick={() => navigate(`/labs/${lab.id}`)}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 2.5, sm: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                  <Box sx={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    width: 52, height: 52, 
                    borderRadius: '12px', 
                    bgcolor: lab.color + '1A', 
                    color: lab.color 
                  }}>
                    {lab.icon}
                  </Box>
                  <Box sx={{ 
                    bgcolor: lab.color + '1A', 
                    color: lab.color, 
                    px: 1.5, py: 0.5, 
                    borderRadius: '10px', 
                    fontSize: '0.75rem', 
                    fontWeight: 800,
                    border: `1px solid ${lab.color}20`
                  }}>
                    {lab.experiments} Labs
                  </Box>
                </Box>
                
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  color: '#1e293b', 
                  mb: 1.5,
                  fontSize: '1.25rem',
                  textTransform: 'capitalize'
                }}>
                  {lab.name}
                </Typography>
                
                <Typography variant="body2" sx={{ 
                  color: '#64748b', 
                  fontWeight: 600, 
                  lineHeight: 1.6,
                  flexGrow: 1 
                }}>
                  {lab.description}
                </Typography>

                <Box sx={{ mt: 2.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {lab.topics.slice(0, 2).map((topic, tIdx) => (
                    <Chip
                      key={tIdx}
                      label={topic}
                      size="small"
                      sx={{ 
                        height: '24px',
                        fontSize: '0.7rem',
                        fontWeight: 700, 
                        bgcolor: '#f1f5f9', 
                        color: '#475569',
                        borderRadius: '6px'
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </MotionCard>
          );
        })}
      </Box>
    </Box>
  );
}
