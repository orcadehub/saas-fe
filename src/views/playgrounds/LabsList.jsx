import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Breadcrumbs, Link } from '@mui/material';
import { Code, Storage, Language, DataObject, ChevronRight } from '@mui/icons-material';
import CardSkeleton from 'ui-component/skeletons/CardSkeleton';
import apiService from 'services/apiService';
import { motion } from 'framer-motion';

const MotionCard = motion.create(Card);

const techConfig = {
  'C': { 
    color: '#6366f1', bg: '#f5f3ff', 
    subtitle: 'Master C programming fundamentals and system programming',
    highlights: ['Basics', 'Pointers']
  },
  'C++': { 
    color: '#ec4899', bg: '#fdf2f8',
    subtitle: 'Learn C++ and object-oriented programming concepts',
    highlights: ['OOP', 'STL']
  },
  'Java': { 
    color: '#8b5cf6', bg: '#f5f3ff',
    subtitle: 'Java programming and enterprise applications',
    highlights: ['Core Java', 'Collections']
  },
  'Python': { 
    color: '#10b981', bg: '#f0fdf4',
    subtitle: 'Python programming from basics to advanced',
    highlights: ['Basics']
  },
  'JavaScript': { color: '#f59e0b', bg: '#fffbeb', subtitle: 'Web and Server-side JS', highlights: ['DOM', 'Async'] },
  'React': { color: '#06b6d4', bg: '#ecfeff', subtitle: 'Modern Web UI', highlights: ['Hooks', 'State'] },
  'MongoDB': { color: '#10b981', bg: '#f0fdf4', subtitle: 'NoSQL Database Management', highlights: ['Queries', 'Indexing'] },
  'MySQL': { color: '#3b82f6', bg: '#eff6ff', subtitle: 'Relational Database (SQL)', highlights: ['DDL/DML', 'Joins'] },
  'AI': { color: '#ef4444', bg: '#fef2f2', subtitle: 'Artificial Intelligence Core', highlights: ['Search', 'Logic'] },
  'ML': { color: '#8b5cf6', bg: '#f5f3ff', subtitle: 'Predictive Modeling', highlights: ['Training', 'Stats'] },
  'IoT': { color: '#00dc82', bg: '#f0fdf9', subtitle: 'Connected Systems', highlights: ['Sensors', 'Cloud'] },
  'Data Structures': { color: '#6366f1', bg: '#f5f3ff', subtitle: 'Core Logic & Data', highlights: ['Lists', 'Trees'] },
  'Operating Systems': { color: '#ec4899', bg: '#fdf2f8', subtitle: 'System Architecture', highlights: ['Scheduling', 'Memory'] },
  'Computer Networks': { color: '#8b5cf6', bg: '#f5f3ff', subtitle: 'Communication Protocols', highlights: ['Sockets', 'Layers'] },
};

export default function LabsList() {
  const navigate = useNavigate();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedLabs, setGroupedLabs] = useState({});

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const response = await apiService.client.get('/labs');
      setLabs(response.data || []);
    } catch (error) {
      console.error('Error fetching labs:', error);
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const grouped = labs.reduce((acc, lab) => {
      const tech = lab.technology || 'Other';
      if (!acc[tech]) acc[tech] = [];
      acc[tech].push(lab);
      return acc;
    }, {});
    setGroupedLabs(grouped);
  }, [labs]);

  return (
    <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
      <Breadcrumbs separator={<ChevronRight fontSize="small" />} sx={{ mb: 4 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => { e.preventDefault(); navigate('/'); }}
          sx={{ cursor: 'pointer', fontWeight: 600, color: '#64748b', '&:hover': { color: '#6366f1' } }}
        >
          Dashboard
        </Link>
        <Typography sx={{ fontWeight: 800, color: '#1e293b' }}>Coding Labs</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h1" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
          Engineering Labs (B.Tech CSE)
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
          Comprehensive virtual labs for core computer science subjets.
        </Typography>
      </Box>

      {loading ? (
        <CardSkeleton count={8} />
      ) : Object.keys(groupedLabs).length === 0 ? (
        <Box sx={{ p: 8, textAlign: 'center', bgcolor: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
          <Typography sx={{ color: '#64748b', fontWeight: 600 }}>No engineering labs available yet.</Typography>
        </Box>
      ) : (
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
          {Object.entries(groupedLabs).map(([technology, techLabs], idx) => {
            const theme = techConfig[technology] || { color: '#6366f1', bg: '#f5f3ff' };
            return (
              <MotionCard
                key={technology}
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
                onClick={() => navigate(`/labs/technology/${encodeURIComponent(technology)}`)}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 2.5, sm: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                    <Box sx={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      width: 52, height: 52, 
                      borderRadius: '12px', 
                      bgcolor: theme.bg, 
                      color: theme.color 
                    }}>
                      <Code sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                  
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: '#1e293b', 
                    mb: 0.5,
                    fontSize: '1.25rem',
                    textTransform: 'capitalize'
                  }}>
                    {technology} Programming Lab
                  </Typography>
                  
                  <Typography variant="body2" sx={{ 
                    color: '#64748b', 
                    fontWeight: 600, 
                    lineHeight: 1.4,
                    mb: 2,
                    fontSize: '0.85rem'
                  }}>
                    {theme.subtitle || `Comprehensive ${technology} engineering curriculum and experiments.`}
                  </Typography>

                  <Box sx={{ flexGrow: 1 }} />

                  <Typography sx={{ fontWeight: 800, color: theme.color, fontSize: '0.875rem', mb: 1.5 }}>
                    {techLabs.length} Experiments
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(theme.highlights || ['Foundations', 'Advanced']).map(h => (
                      <Typography key={h} sx={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>
                        {h}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </MotionCard>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
