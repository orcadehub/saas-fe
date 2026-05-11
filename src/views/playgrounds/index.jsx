import { CardContent, Typography, Box, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IconCode,
  IconTerminal2,
  IconDatabase,
  IconChartBar,
  IconShieldLock,
  IconCpu,
  IconHierarchy2,
  IconBrandReact,
  IconBrandJavascript,
  IconBrandHtml5,
  IconDeviceGamepad2
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
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
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
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(100px)'
      }}
    />
  </Box>
);

const labs = [
  {
    id: 'c-programming',
    name: 'C Programming Lab',
    icon: IconTerminal2,
    color: '#3b82f6',
    topics: ['Basics', 'Pointers', 'Memory'],
    experiments: 12,
    description: 'Master low-level programming and system fundamentals.'
  },
  {
    id: 'cpp-programming',
    name: 'C++ Programming Lab',
    icon: IconCode,
    color: '#6366f1',
    topics: ['OOP', 'STL', 'Templates'],
    experiments: 12,
    description: 'Master efficient Object-Oriented software design.'
  },
  {
    id: 'java-programming',
    name: 'Java Programming Lab',
    icon: IconCpu,
    color: '#f97316',
    topics: ['Core Java', 'Collections', 'JDBC'],
    experiments: 12,
    description: 'Build robust enterprise-grade applications.'
  },
  {
    id: 'python-programming',
    name: 'Python Programming Lab',
    icon: IconTerminal2,
    color: '#10b981',
    topics: ['Basics', 'OOP', 'Libraries'],
    experiments: 12,
    description: 'Clean code and advanced script automation.'
  },
  {
    id: 'frontend-lab',
    name: 'Frontend Lab',
    icon: IconBrandHtml5,
    color: '#ef4444',
    topics: ['HTML5', 'CSS3', 'Responsive'],
    experiments: 12,
    description: 'Create stunning and pixel-perfect web interfaces.'
  },
  {
    id: 'javascript-lab',
    name: 'JavaScript Lab',
    icon: IconBrandJavascript,
    color: '#eab308',
    topics: ['ES6+', 'DOM', 'Async'],
    experiments: 12,
    description: 'The backbone of modern interactive web experiences.'
  },
  {
    id: 'react-lab',
    name: 'React Lab',
    icon: IconBrandReact,
    color: '#06b6d4',
    topics: ['Hooks', 'State', 'Router'],
    experiments: 12,
    description: 'Component-driven frontend engineering at scale.'
  },
  {
    id: 'data-structures-lab',
    name: 'Data Structures Lab',
    icon: IconHierarchy2,
    color: '#64748b',
    topics: ['Lists', 'Trees', 'Graphs'],
    experiments: 12,
    description: 'Algorithmic problem solving and data efficiency.'
  },
  {
    id: 'ai-lab',
    name: 'AI & Robotics Lab',
    icon: IconDeviceGamepad2,
    color: '#8b5cf6',
    topics: ['Search', 'Neural Nets', 'Logic'],
    experiments: 12,
    description: 'Intelligent systems and autonomous behavior.'
  },
  {
    id: 'ml-lab',
    name: 'Machine Learning Lab',
    icon: IconChartBar,
    color: '#ec4899',
    topics: ['Regression', 'Classification', 'Cleaning'],
    experiments: 12,
    description: 'Data patterns and predictive model training.'
  },
  {
    id: 'iot-lab',
    name: 'Internet of Things Lab',
    icon: IconHierarchy2,
    color: '#84cc16',
    topics: ['Sensors', 'Protocols', 'Cloud'],
    experiments: 12,
    description: 'Hardware connectivity and real-time signals.'
  },
  {
    id: 'cyber-security-lab',
    name: 'Cyber Security Lab',
    icon: IconShieldLock,
    color: '#f43f5e',
    topics: ['Crypto', 'Nmap', 'Security'],
    experiments: 12,
    description: 'Protecting networks and ethical vulnerability testing.'
  },
  {
    id: 'data-science-lab',
    name: 'Data Science Lab',
    icon: IconDatabase,
    color: '#0ea5e9',
    topics: ['Pandas', 'Numpy', 'Viz'],
    experiments: 12,
    description: 'Analyze complex models and big data insights.'
  }
];

export default function Labs() {
  const navigate = useNavigate();

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
        <Box sx={{ mb: { xs: 6, md: 8 }, textAlign: 'center' }}>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 950,
              color: '#1e293b',
              mb: 2,
              fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' },
              letterSpacing: '-1.5px',
              lineHeight: 1
            }}
          >
            Virtual <Box component="span" sx={{ color: '#6366f1' }}>Sandboxes</Box>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#64748b',
              fontSize: { xs: '1rem', sm: '1.2rem' },
              fontWeight: 500,
              maxWidth: '700px',
              mx: 'auto'
            }}
          >
            Master computer science through deeply integrated, browser-based laboratory environments.
            No setup required. Just pure learning.
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
            const Icon = lab.icon;
            return (
              <MotionCard
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => navigate(`/labs/${lab.id}`)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: '24px',
                  bgcolor: '#fff',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
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
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 3, sm: 3.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        bgcolor: `${lab.color}15`,
                        color: lab.color,
                        boxShadow: `0 8px 16px ${lab.color}20`
                      }}
                    >
                      <Icon size={30} stroke={1.5} />
                    </Box>
                    <Box
                      sx={{
                        bgcolor: `${lab.color}10`,
                        color: lab.color,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '10px',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        border: `1px solid ${lab.color}25`
                      }}
                    >
                      {lab.experiments} Labs
                    </Box>
                  </Box>

                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#0f172a',
                      mb: 1.5,
                      fontSize: '1.25rem',
                      lineHeight: 1.3
                    }}
                  >
                    {lab.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748b',
                      fontWeight: 500,
                      lineHeight: 1.6,
                      flexGrow: 1,
                      mb: 3
                    }}
                  >
                    {lab.description}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {lab.topics.map((topic, tIdx) => (
                      <Chip
                        key={tIdx}
                        label={topic}
                        size="small"
                        sx={{
                          height: '24px',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          bgcolor: '#f8fafc',
                          color: '#64748b',
                          borderRadius: '8px',
                          border: '1px solid #f1f5f9'
                        }}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </MotionCard>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
