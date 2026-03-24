import { useState } from 'react';
import { Box, Card, CardContent, Typography, Breadcrumbs, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconUser, IconMessage, IconFileText, IconLanguage, IconCode, IconChevronRight } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const MotionCard = motion.create(Card);

const interviewTypes = [
  {
    id: 'resume',
    title: 'Resume Based Mock',
    description: 'AI analyzes your resume to ask personalized technical and behavioral questions.',
    icon: IconFileText,
    color: '#6366f1',
    bg: '#f5f3ff',
    count: 'Top Rated'
  },
  {
    id: 'topic',
    title: 'Topic Based Mock',
    description: 'Select specific CS fundamentals like OS, DBMS, or Networks for deep drilling.',
    icon: IconMessage,
    color: '#ec4899',
    bg: '#fdf2f8',
    count: 'Popular'
  },
  {
    id: 'language',
    title: 'Language Based Mock',
    description: 'Expert level evaluation focused on Java, Python, C++, or JavaScript proficiency.',
    icon: IconLanguage,
    color: '#10b981',
    bg: '#f0fdf4',
    count: 'High Level'
  },
  {
    id: 'jd',
    title: 'JD Based Mock',
    description: 'Upload a job description to simulate a real interview for a specific role.',
    icon: IconUser,
    color: '#f59e0b',
    bg: '#fffbeb',
    count: 'New'
  },
  {
    id: 'coding',
    title: 'Coding Challenge Mock',
    description: 'Mixed challenge with live coding problems and conceptual technical discussion.',
    icon: IconCode,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    count: 'Hard'
  }
];

export default function AIMock() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
      <Breadcrumbs separator={<IconChevronRight size={16} />} sx={{ mb: 4 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => { e.preventDefault(); navigate('/'); }}
          sx={{ cursor: 'pointer', fontWeight: 600, color: '#64748b', '&:hover': { color: '#6366f1' } }}
        >
          Dashboard
        </Link>
        <Typography sx={{ fontWeight: 800, color: '#1e293b' }}>AI Mock Interview</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h1" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
          Interview Mastery Hub
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
          Elevate your career with AI-driven interview simulations tailored to your profile.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: 3
        }}
      >
        {interviewTypes.map((type, idx) => (
          <MotionCard
            key={type.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
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
            onClick={() => navigate(`/ai-mock/${type.id}`)}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                <Box sx={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  width: 52, height: 52, 
                  borderRadius: '12px', 
                  bgcolor: type.bg, 
                  color: type.color 
                }}>
                  <type.icon size={28} />
                </Box>
                <Box sx={{ 
                  bgcolor: type.bg, 
                  color: type.color, 
                  px: 1.5, py: 0.5, 
                  borderRadius: '10px', 
                  fontSize: '0.75rem', 
                  fontWeight: 800,
                  border: `1px solid ${type.color}20`
                }}>
                  {type.count}
                </Box>
              </Box>
              
              <Typography variant="h3" sx={{ 
                fontWeight: 800, 
                color: '#1e293b', 
                mb: 1.5,
                fontSize: '1.25rem'
              }}>
                {type.title}
              </Typography>
              
              <Typography variant="body2" sx={{ 
                color: '#64748b', 
                fontWeight: 600, 
                lineHeight: 1.6,
                flexGrow: 1 
              }}>
                {type.description}
              </Typography>
            </CardContent>
          </MotionCard>
        ))}
      </Box>
    </Box>
  );
}
