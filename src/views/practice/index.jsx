import { useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { IconCode, IconTrophy, IconClipboardList, IconBrain, IconBook, IconCalculator, IconBuilding } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CardSkeleton from 'ui-component/skeletons/CardSkeleton';

const MotionCard = motion.create(Card);

const practiceCategories = [
  {
    id: 'gamified',
    title: 'Gamified',
    description: 'Learn through interactive games and challenges',
    icon: IconTrophy,
    color: '#f59e0b',
    bg: '#fffbeb'
  }
];

// ── Soft Light Background ──
const LightBackground = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#fbfcfe' }} />
    <Box sx={{
      position: 'absolute', top: '-10%', right: '-5%',
      width: '60vw', height: '60vw',
      background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
      borderRadius: '50%', filter: 'blur(80px)',
    }} />
    <Box sx={{
      position: 'absolute', bottom: '-15%', left: '-10%',
      width: '50vw', height: '50vw',
      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
      borderRadius: '50%', filter: 'blur(100px)',
    }} />
  </Box>
);

export default function Practice() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCategoryClick = (categoryId) => {
    navigate(`/practice/${categoryId}`);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      p: { xs: 2.5, sm: 3, md: 4.5 }, 
      bgcolor: '#fbfcfe', 
      color: '#1e293b', 
      position: 'relative',
      overflowX: 'hidden'
    }}>
      <LightBackground />
      
      <Box sx={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          gap: 3, 
          mb: { xs: 4, md: 6 } 
        }}>
          <Box>
            <Typography variant="h1" sx={{ 
              fontWeight: 900, 
              color: '#1e293b', 
              mb: 1, 
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' } 
            }}>
              Practice Center
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Sharpen your skills through interactive challenges and coding practice.
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box>
            <CardSkeleton count={4} />
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
            {practiceCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <MotionCard
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
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
                >
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 2.5, sm: 3 } }}>
                    <Box sx={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      width: { xs: 44, sm: 52 }, height: { xs: 44, sm: 52 }, 
                      borderRadius: '12px', 
                      bgcolor: category.bg || 'rgba(99, 102, 241, 0.1)', 
                      color: category.color || '#6366f1', 
                      mb: 2
                    }}>
                      <Icon size={28} />
                    </Box>
                    
                    <Typography variant="h3" sx={{ 
                      fontWeight: 800, 
                      color: '#1e293b', 
                      mb: 1,
                      fontSize: { xs: '1.25rem', sm: '1.35rem' } 
                    }}>
                      {category.title}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ 
                      color: '#64748b', 
                      fontWeight: 500, 
                      lineHeight: 1.5,
                      flexGrow: 1 
                    }}>
                      {category.description}
                    </Typography>
                  </CardContent>
                </MotionCard>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
