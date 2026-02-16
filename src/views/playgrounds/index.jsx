import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Code, Storage, Cloud, Security, Dns, Computer, Memory, Terminal, DataObject, Hub } from '@mui/icons-material';
import MainCard from 'ui-component/cards/MainCard';

const labs = [
  { name: 'Data Structures Lab', icon: <DataObject />, color: '#1976d2', topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Hashing'], experiments: 12, description: 'Master fundamental data structures and their implementations' },
  { name: 'Algorithms Lab', icon: <Code />, color: '#2e7d32', topics: ['Sorting', 'Searching', 'Dynamic Programming', 'Greedy', 'Backtracking'], experiments: 15, description: 'Learn algorithm design and analysis techniques' },
  { name: 'Database Management Lab', icon: <Storage />, color: '#ed6c02', topics: ['SQL', 'Normalization', 'Transactions', 'PL/SQL', 'NoSQL'], experiments: 10, description: 'Database design, queries, and management systems' },
  { name: 'Operating Systems Lab', icon: <Computer />, color: '#9c27b0', topics: ['Process Scheduling', 'Memory Management', 'File Systems', 'Deadlocks'], experiments: 10, description: 'OS concepts and system programming' },
  { name: 'Computer Networks Lab', icon: <Hub />, color: '#0288d1', topics: ['Socket Programming', 'Routing', 'TCP/IP', 'DNS', 'Network Security'], experiments: 12, description: 'Network protocols and socket programming' },
  { name: 'Web Technologies Lab', icon: <Cloud />, color: '#d32f2f', topics: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'REST APIs'], experiments: 14, description: 'Full-stack web development technologies' },
  { name: 'Object Oriented Programming Lab', icon: <Code />, color: '#7b1fa2', topics: ['Classes', 'Inheritance', 'Polymorphism', 'Abstraction'], experiments: 10, description: 'OOP concepts and design patterns' },
  { name: 'Python Programming Lab', icon: <Terminal />, color: '#388e3c', topics: ['Basics', 'Data Structures', 'OOP', 'File Handling', 'Libraries'], experiments: 12, description: 'Python programming from basics to advanced' },
  { name: 'Java Programming Lab', icon: <Code />, color: '#f57c00', topics: ['Core Java', 'Collections', 'Multithreading', 'JDBC', 'Servlets'], experiments: 12, description: 'Java programming and enterprise applications' },
  { name: 'Computer Architecture Lab', icon: <Memory />, color: '#5e35b1', topics: ['Assembly', 'Pipelining', 'Cache Memory', 'CPU Design'], experiments: 8, description: 'Computer organization and architecture' },
  { name: 'Compiler Design Lab', icon: <Terminal />, color: '#c62828', topics: ['Lexical Analysis', 'Parsing', 'Syntax Trees', 'Code Generation'], experiments: 10, description: 'Compiler construction and optimization' },
  { name: 'Software Engineering Lab', icon: <Code />, color: '#00796b', topics: ['SDLC', 'UML', 'Testing', 'Version Control', 'Agile'], experiments: 8, description: 'Software development lifecycle and methodologies' },
  { name: 'Machine Learning Lab', icon: <DataObject />, color: '#1565c0', topics: ['Regression', 'Classification', 'Clustering', 'Neural Networks'], experiments: 10, description: 'ML algorithms and model building' },
  { name: 'Artificial Intelligence Lab', icon: <Memory />, color: '#6a1b9a', topics: ['Search Algorithms', 'Expert Systems', 'NLP', 'Computer Vision'], experiments: 10, description: 'AI techniques and intelligent systems' },
  { name: 'Cybersecurity Lab', icon: <Security />, color: '#d84315', topics: ['Cryptography', 'Network Security', 'Ethical Hacking', 'Firewalls'], experiments: 10, description: 'Security concepts and ethical hacking' },
  { name: 'Cloud Computing Lab', icon: <Cloud />, color: '#0277bd', topics: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Serverless'], experiments: 12, description: 'Cloud platforms and containerization' },
  { name: 'Mobile App Development Lab', icon: <Computer />, color: '#558b2f', topics: ['Android', 'iOS', 'React Native', 'Flutter', 'UI/UX'], experiments: 10, description: 'Mobile application development' },
  { name: 'Internet of Things Lab', icon: <Dns />, color: '#f57f17', topics: ['Arduino', 'Raspberry Pi', 'Sensors', 'MQTT', 'IoT Protocols'], experiments: 10, description: 'IoT devices and communication protocols' }
];

export default function Labs() {
  return (
    <MainCard title="BTech CSE Labs">
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2
      }}>
        {labs.map((lab, index) => (
          <Card
            key={index}
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
