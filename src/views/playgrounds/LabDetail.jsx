import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Chip, IconButton, Button } from '@mui/material';
import { ArrowBack, Code, CheckCircle, PlayArrow } from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionCard = motion.create(Card);

const labQuestions = {
  'c-programming': [
    { id: 1, title: 'Hello World', difficulty: 'Easy', topics: ['Basics', 'Syntax'], completed: false },
    { id: 2, title: 'Basic Calculator', difficulty: 'Easy', topics: ['Switch Case', 'Operators'], completed: false },
    { id: 3, title: 'Array Reversal', difficulty: 'Medium', topics: ['Arrays', 'Pointers'], completed: false },
    { id: 4, title: 'String Manipulation', difficulty: 'Medium', topics: ['Strings', 'Memory'], completed: false },
    { id: 5, title: 'Linked List Implementation', difficulty: 'Hard', topics: ['Structures', 'Pointers'], completed: false }
  ],
  'cpp-programming': [
    { id: 1, title: 'Hello World C++', difficulty: 'Easy', topics: ['Basics', 'I/O'], completed: false },
    { id: 2, title: 'Class Basics', difficulty: 'Easy', topics: ['Classes', 'Objects'], completed: false },
    { id: 3, title: 'Operator Overloading', difficulty: 'Medium', topics: ['OOP', 'Operators'], completed: false },
    { id: 4, title: 'STL Vector Usage', difficulty: 'Medium', topics: ['STL', 'Vectors'], completed: false },
    { id: 5, title: 'Polymorphism', difficulty: 'Hard', topics: ['Virtual Functions', 'Inheritance'], completed: false }
  ],
  'java-programming': [
    { id: 1, title: 'Hello Java', difficulty: 'Easy', topics: ['Basics', 'Syntax'], completed: false },
    { id: 2, title: 'Inheritance Hierarchy', difficulty: 'Easy', topics: ['OOP', 'Inheritance'], completed: false },
    { id: 3, title: 'Collections Framework', difficulty: 'Medium', topics: ['ArrayList', 'HashMap'], completed: false },
    { id: 4, title: 'Exception Handling', difficulty: 'Medium', topics: ['Try-Catch', 'Exceptions'], completed: false },
    { id: 5, title: 'Multithreading', difficulty: 'Hard', topics: ['Threads', 'Concurrency'], completed: false }
  ],
  'python-programming': [
    { id: 1, title: 'Hello Python', difficulty: 'Easy', topics: ['Basics', 'Print'], completed: false },
    { id: 2, title: 'List Comprehensions', difficulty: 'Easy', topics: ['Lists', 'Syntax'], completed: false },
    { id: 3, title: 'Dictionary Operations', difficulty: 'Medium', topics: ['Dictionaries', 'Hashing'], completed: false },
    { id: 4, title: 'File Handling', difficulty: 'Medium', topics: ['I/O', 'Files'], completed: false },
    { id: 5, title: 'Object Oriented Python', difficulty: 'Hard', topics: ['Classes', 'Dunder Methods'], completed: false }
  ],
  'frontend-lab': [
    { id: 1, title: 'Semantic HTML', difficulty: 'Easy', topics: ['HTML5', 'Tags'], completed: false },
    { id: 2, title: 'CSS Flexbox Layout', difficulty: 'Easy', topics: ['CSS', 'Flexbox'], completed: false },
    { id: 3, title: 'CSS Grid System', difficulty: 'Medium', topics: ['CSS', 'Grid'], completed: false },
    { id: 4, title: 'Responsive Design', difficulty: 'Medium', topics: ['Media Queries', 'Mobile-First'], completed: false },
    { id: 5, title: 'CSS Animations', difficulty: 'Hard', topics: ['Keyframes', 'Transitions'], completed: false }
  ],
  'javascript-lab': [
    { id: 1, title: 'Variables and Data Types', difficulty: 'Easy', topics: ['Let/Const', 'Types'], completed: false },
    { id: 2, title: 'DOM Manipulation', difficulty: 'Easy', topics: ['DOM', 'Events'], completed: false },
    { id: 3, title: 'Arrow Functions', difficulty: 'Medium', topics: ['ES6', 'Functions'], completed: false },
    { id: 4, title: 'Promises and Async/Await', difficulty: 'Medium', topics: ['Async', 'Promises'], completed: false },
    { id: 5, title: 'Fetch API', difficulty: 'Hard', topics: ['Network', 'API API'], completed: false }
  ],
  'react-lab': [
    { id: 1, title: 'First React Component', difficulty: 'Easy', topics: ['JSX', 'Components'], completed: false },
    { id: 2, title: 'State management (useState)', difficulty: 'Easy', topics: ['Hooks', 'State'], completed: false },
    { id: 3, title: 'Side Effects (useEffect)', difficulty: 'Medium', topics: ['Hooks', 'Lifecycle'], completed: false },
    { id: 4, title: 'Custom Hooks', difficulty: 'Medium', topics: ['Advanced Hooks', 'Reusability'], completed: false },
    { id: 5, title: 'Context API', difficulty: 'Hard', topics: ['State Management', 'Context'], completed: false }
  ],
  'data-structures-lab': [
    { id: 1, title: 'Array Rotations', difficulty: 'Easy', topics: ['Arrays', 'Math'], completed: false },
    { id: 2, title: 'Linked List Intersection', difficulty: 'Easy', topics: ['Linked Lists', 'Pointers'], completed: false },
    { id: 3, title: 'Binary Search Tree Insert', difficulty: 'Medium', topics: ['Trees', 'BST'], completed: false },
    { id: 4, title: 'Graph BFS & DFS', difficulty: 'Medium', topics: ['Graphs', 'Traversal'], completed: false },
    { id: 5, title: 'Min Heap Implementation', difficulty: 'Hard', topics: ['Heaps', 'Priority Queues'], completed: false }
  ],
  'ai-lab': [
    { id: 1, title: 'State Representation', difficulty: 'Easy', topics: ['State Space', 'AI Basics'], completed: false },
    { id: 2, title: 'Breadth First Search', difficulty: 'Easy', topics: ['Search', 'Graph'], completed: false },
    { id: 3, title: 'A* Algorithm', difficulty: 'Medium', topics: ['Heuristics', 'Pathfinding'], completed: false },
    { id: 4, title: 'Minimax Algorithm', difficulty: 'Medium', topics: ['Adversarial', 'Games'], completed: false },
    { id: 5, title: 'Constraint Satisfaction', difficulty: 'Hard', topics: ['CSP', 'Backtracking'], completed: false }
  ],
  'ml-lab': [
    { id: 1, title: 'Data Preprocessing', difficulty: 'Easy', topics: ['Cleaning', 'Scaling'], completed: false },
    { id: 2, title: 'Linear Regression Model', difficulty: 'Easy', topics: ['Regression', 'Loss Functions'], completed: false },
    { id: 3, title: 'Logistic Classification', difficulty: 'Medium', topics: ['Classification', 'Sigmoid'], completed: false },
    { id: 4, title: 'K-Means Clustering', difficulty: 'Medium', topics: ['Unsupervised', 'Clustering'], completed: false },
    { id: 5, title: 'Neural Network Forward Pass', difficulty: 'Hard', topics: ['Deep Learning', 'Networks'], completed: false }
  ],
  'iot-lab': [
    { id: 1, title: 'Blinking LED', difficulty: 'Easy', topics: ['GPIO', 'Basics'], completed: false },
    { id: 2, title: 'Temperature Sensor', difficulty: 'Easy', topics: ['Sensors', 'Analog'], completed: false },
    { id: 3, title: 'MQTT Publishing', difficulty: 'Medium', topics: ['Networking', 'MQTT'], completed: false },
    { id: 4, title: 'Actuator Control', difficulty: 'Medium', topics: ['Motors', 'PWM'], completed: false },
    { id: 5, title: 'Cloud Data Logging', difficulty: 'Hard', topics: ['Cloud Integrations', 'REST'], completed: false }
  ],
  'cyber-security-lab': [
    { id: 1, title: 'Password Hashing', difficulty: 'Easy', topics: ['Crypto', 'Hashing'], completed: false },
    { id: 2, title: 'SQL Injection Prevention', difficulty: 'Easy', topics: ['Web Security', 'SQL'], completed: false },
    { id: 3, title: 'XSS Sanitization', difficulty: 'Medium', topics: ['XSS', 'Frontend Security'], completed: false },
    { id: 4, title: 'Nmap Scanning Simulation', difficulty: 'Medium', topics: ['Networking', 'Ports'], completed: false },
    { id: 5, title: 'Buffer Overflow Defense', difficulty: 'Hard', topics: ['Memory', 'Exploits'], completed: false }
  ],
  'data-science-lab': [
    { id: 1, title: 'Pandas DataFrames', difficulty: 'Easy', topics: ['Pandas', 'Dataframes'], completed: false },
    { id: 2, title: 'Numpy Array Operations', difficulty: 'Easy', topics: ['Numpy', 'Math'], completed: false },
    { id: 3, title: 'Data Aggregation & Grouping', difficulty: 'Medium', topics: ['Transform', 'Groupby'], completed: false },
    { id: 4, title: 'Handling Missing Values', difficulty: 'Medium', topics: ['Imputation', 'Cleaning'], completed: false },
    { id: 5, title: 'Matplotlib Visualizations', difficulty: 'Hard', topics: ['Graphs', 'Plotting'], completed: false }
  ]
};

const labNames = {
  'c-programming': 'C Programming Lab',
  'cpp-programming': 'C++ Programming Lab',
  'java-programming': 'Java Programming Lab',
  'python-programming': 'Python Programming Lab',
  'frontend-lab': 'Frontend Lab (HTML/CSS)',
  'javascript-lab': 'JavaScript Lab',
  'react-lab': 'React Development Lab',
  'data-structures-lab': 'Data Structures Lab',
  'ai-lab': 'Artificial Intelligence Lab',
  'ml-lab': 'Machine Learning Lab',
  'iot-lab': 'Internet of Things Lab',
  'cyber-security-lab': 'Cyber Security Lab',
  'data-science-lab': 'Data Science Lab'
};

const difficultyColors = {
  'Easy': 'success',
  'Medium': 'warning',
  'Hard': 'error'
};

export default function LabDetail() {
  const { labId } = useParams();
  const navigate = useNavigate();
  const questions = labQuestions[labId] || [];
  const labName = labNames[labId] || 'Lab';

  return (
    <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
        <IconButton 
          onClick={() => navigate('/labs')}
          sx={{ 
            bgcolor: '#f1f5f9', 
            color: '#1e293b',
            '&:hover': { bgcolor: '#e2e8f0' } 
          }}
        >
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h1" sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5, fontSize: '2rem', letterSpacing: '-0.02em' }}>
            {labName}
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>
            Complete the interactive experiments below to build proficiency.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 3
      }}>
        {questions.map((question, idx) => (
          <MotionCard
            key={question.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
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
            onClick={() => navigate(`/labs/${labId}/${question.id}`)}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
                <Box sx={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  width: 48, height: 48, 
                  borderRadius: '12px', 
                  bgcolor: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #e2e8f0'
                }}>
                  <Code />
                </Box>
                {question.completed && (
                  <CheckCircle sx={{ color: '#10b981' }} />
                )}
              </Box>

              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700, mb: 1 }}>
                Experiment {question.id}
              </Typography>
              
              <Typography variant="h3" sx={{ 
                fontWeight: 800, 
                color: '#1e293b', 
                mb: 2,
                fontSize: '1.25rem'
              }}>
                {question.title}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3, flexGrow: 1 }}>
                <Chip 
                  label={question.difficulty} 
                  size="small" 
                  sx={{ 
                    fontWeight: 800,
                    borderRadius: '8px',
                    ...(question.difficulty === 'Easy' && { bgcolor: '#f0fdf4', color: '#16a34a' }),
                    ...(question.difficulty === 'Medium' && { bgcolor: '#fffbed', color: '#d97706' }),
                    ...(question.difficulty === 'Hard' && { bgcolor: '#fef2f2', color: '#dc2626' })
                  }}
                />
                {question.topics.map((topic, idxx) => (
                  <Chip 
                    key={idxx} 
                    label={topic} 
                    size="small" 
                    sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, borderRadius: '8px' }} 
                  />
                ))}
              </Box>

              <Button 
                variant="contained" 
                fullWidth
                startIcon={<PlayArrow />}
                sx={{ 
                  borderRadius: '12px', 
                  textTransform: 'none', 
                  py: 1.5, 
                  fontWeight: 800,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }
                }}
              >
                Launch Sandbox
              </Button>
            </CardContent>
          </MotionCard>
        ))}
      </Box>
    </Box>
  );
}
