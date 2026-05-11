import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Chip, IconButton, Button, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import {
  IconArrowLeft,
  IconCode,
  IconCircleCheck,
  IconPlayerPlay,
  IconClock,
  IconCpu
} from '@tabler/icons-react';

const MotionCard = motion(Box);

// ── Soft Light Background ──
const LightBackground = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#fbfcfe' }} />
    <Box
      sx={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)'
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.04) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(100px)'
      }}
    />
  </Box>
);

const labQuestions = {
  'c-programming': [
    { id: 1, title: 'Hello World', difficulty: 'Easy', topics: ['Basics', 'Syntax'], completed: false, time: '10 min' },
    { id: 2, title: 'Basic Calculator', difficulty: 'Easy', topics: ['Switch Case', 'Operators'], completed: false, time: '15 min' },
    { id: 3, title: 'Array Reversal', difficulty: 'Medium', topics: ['Arrays', 'Pointers'], completed: false, time: '20 min' },
    { id: 4, title: 'String Manipulation', difficulty: 'Medium', topics: ['Strings', 'Memory'], completed: false, time: '25 min' },
    { id: 5, title: 'Linked List Implementation', difficulty: 'Hard', topics: ['Structures', 'Pointers'], completed: false, time: '45 min' }
  ],
  // ... (keeping other lab definitions for consistency)
  'cpp-programming': [
    { id: 1, title: 'Hello World C++', difficulty: 'Easy', topics: ['Basics', 'I/O'], completed: false, time: '10 min' },
    { id: 2, title: 'Class Basics', difficulty: 'Easy', topics: ['Classes', 'Objects'], completed: false, time: '20 min' },
    { id: 3, title: 'Operator Overloading', difficulty: 'Medium', topics: ['OOP', 'Operators'], completed: false, time: '30 min' }
  ],
  'java-programming': [
    { id: 1, title: 'Hello Java', difficulty: 'Easy', topics: ['Basics', 'Syntax'], completed: false, time: '15 min' },
    { id: 2, title: 'Inheritance Hierarchy', difficulty: 'Easy', topics: ['OOP', 'Inheritance'], completed: false, time: '25 min' }
  ],
  'python-programming': [
    { id: 1, title: 'Hello Python', difficulty: 'Easy', topics: ['Basics', 'Print'], completed: false, time: '5 min' },
    { id: 2, title: 'List Comprehensions', difficulty: 'Easy', topics: ['Lists', 'Syntax'], completed: false, time: '15 min' }
  ],
  'frontend-lab': [
    { id: 1, title: 'Semantic HTML', difficulty: 'Easy', topics: ['HTML5', 'Tags'], completed: false, time: '15 min' },
    { id: 2, title: 'CSS Flexbox Layout', difficulty: 'Easy', topics: ['CSS', 'Flexbox'], completed: false, time: '20 min' }
  ],
  'javascript-lab': [
    { id: 1, title: 'Variables and Data Types', difficulty: 'Easy', topics: ['Let/Const', 'Types'], completed: false, time: '10 min' },
    { id: 2, title: 'DOM Manipulation', difficulty: 'Easy', topics: ['DOM', 'Events'], completed: false, time: '30 min' }
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

export default function LabDetail() {
  const { labId } = useParams();
  const navigate = useNavigate();

  // Force scroll to top on mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const questions = labQuestions[labId] || [];
  const labName = labNames[labId] || 'Lab';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: { xs: 2.5, sm: 3, md: 4.5 },
        bgcolor: '#fbfcfe',
        color: '#1e293b',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      <LightBackground />

      <Box sx={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6 }}>
          <IconButton
            onClick={() => navigate('/labs')}
            sx={{
              bgcolor: '#fff',
              color: '#6366f1',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)',
              border: '1px solid #f1f5f9',
              '&:hover': { bgcolor: '#f8fafc', transform: 'translateX(-3px)' },
              transition: 'all 0.2s'
            }}
          >
            <IconArrowLeft size={24} />
          </IconButton>
          <Box>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                color: '#1e293b',
                mb: 0.5,
                fontSize: { xs: '1.75rem', sm: '2.25rem' },
                letterSpacing: '-0.5px'
              }}
            >
              {labName}
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>
              Step into the virtual workshop and master your craft through hands-on experiments.
            </Typography>
          </Box>
        </Box>

        {/* Questions Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 4
          }}
        >
          {questions.map((question, idx) => (
            <MotionCard
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              onClick={() => navigate(`/labs/${labId}/${question.id}`)}
              sx={{
                cursor: 'pointer',
                borderRadius: '24px',
                bgcolor: '#fff',
                border: '1px solid #f1f5f9',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)'
                }
              }}
            >
              {/* Status Indicator */}
              {question.completed && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 48,
                    height: 48,
                    bgcolor: '#10b981',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
                  }}
                >
                  <IconCircleCheck size={20} style={{ marginBottom: 12, marginLeft: 12 }} />
                </Box>
              )}

              <CardContent sx={{ p: { xs: 3, sm: 4 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 52,
                      height: 52,
                      borderRadius: '16px',
                      bgcolor: '#f5f3ff',
                      color: '#6366f1',
                      boxShadow: '0 8px 16px rgba(99, 102, 241, 0.1)'
                    }}
                  >
                    <IconCode size={28} />
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Experiment {question.id}
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                        <IconClock size={14} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{question.time}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Box>

                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: '#0f172a',
                    mb: 2,
                    fontSize: '1.4rem',
                    lineHeight: 1.3
                  }}
                >
                  {question.title}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4, flexGrow: 1 }}>
                  <Chip
                    label={question.difficulty}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      borderRadius: '8px',
                      ...(question.difficulty === 'Easy' && { bgcolor: '#ecfdf5', color: '#059669', border: '1px solid #10b98120' }),
                      ...(question.difficulty === 'Medium' && { bgcolor: '#fffbeb', color: '#d97706', border: '1px solid #f59e0b20' }),
                      ...(question.difficulty === 'Hard' && { bgcolor: '#fef2f2', color: '#dc2626', border: '1px solid #ef444420' })
                    }}
                  />
                  {question.topics.map((topic, idxx) => (
                    <Chip
                      key={idxx}
                      label={topic}
                      size="small"
                      sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, borderRadius: '8px', fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<IconPlayerPlay size={18} />}
                  sx={{
                    borderRadius: '14px',
                    textTransform: 'none',
                    py: 1.75,
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    bgcolor: '#1e293b',
                    color: '#fff',
                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.15)',
                    '&:hover': {
                      bgcolor: '#0f172a',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 25px rgba(15, 23, 42, 0.25)'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  Launch Virtual Lab
                </Button>
              </CardContent>
            </MotionCard>
          ))}
        </Box>

        {/* System Status Footer */}
        <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center' }}>
          <Stack direction="row" spacing={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
              <IconCpu size={18} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Virtualized Instance: Online</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#10b981' }}>
              <Box sx={{ width: 8, height: 8, bgcolor: 'currentColor', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Secure Sandbox Active</Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.4; }
            50% { opacity: 1; }
            100% { opacity: 0.4; }
          }
        `}
      </style>
    </Box>
  );
}
