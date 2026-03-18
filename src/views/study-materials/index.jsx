import { useState, useEffect } from 'react';
import { Typography, Box, Chip, Stack, InputAdornment, TextField, Skeleton } from '@mui/material';
import { IconBook, IconBookmark, IconClock, IconSearch } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiService from 'services/apiService';

const MotionBox = motion.create(Box);

const LightBackground = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#fbfcfe' }} />
    <Box sx={{
      position: 'absolute', top: '5%', left: '10%',
      width: '40vw', height: '40vw',
      background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
      borderRadius: '50%', filter: 'blur(80px)',
    }} />
    <Box sx={{
      position: 'absolute', bottom: '-10%', right: '5%',
      width: '35vw', height: '35vw',
      background: 'radial-gradient(circle, rgba(236, 72, 153, 0.04) 0%, transparent 70%)',
      borderRadius: '50%', filter: 'blur(80px)',
    }} />
  </Box>
);

const cardColors = [
  { gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', glow: 'rgba(99, 102, 241, 0.25)', chip: '#c7d2fe', chipText: '#4338ca' },
  { gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', glow: 'rgba(236, 72, 153, 0.25)', chip: '#fbcfe8', chipText: '#be185d' },
  { gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)', glow: 'rgba(6, 182, 212, 0.25)', chip: '#cffafe', chipText: '#0e7490' },
  { gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', glow: 'rgba(245, 158, 11, 0.25)', chip: '#fef3c7', chipText: '#b45309' },
  { gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', glow: 'rgba(16, 185, 129, 0.25)', chip: '#d1fae5', chipText: '#065f46' },
  { gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', glow: 'rgba(239, 68, 68, 0.25)', chip: '#fecaca', chipText: '#b91c1c' },
];

const LoadingSkeleton = () => (
  <Box sx={{
    display: 'grid',
    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
    gap: 3
  }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: '24px' }} />
    ))}
  </Box>
);

export default function StudyMaterials() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await apiService.getStudyMaterials();
        setMaterials(data);
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              Study Materials
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Curated learning resources to accelerate your growth.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <TextField
              sx={{
                width: { xs: '100%', md: 320 },
                '& .MuiOutlinedInput-root': {
                  color: '#1e293b', borderRadius: '14px', background: '#fff',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#cbd5e1' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                }
              }}
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={20} color="#94a3b8" />
                  </InputAdornment>
                )
              }}
            />
          </Stack>
        </Box>

        {/* Stats Bar */}
        <Box sx={{
          display: 'flex', gap: 3, mb: 5, flexWrap: 'wrap'
        }}>
          {[
            { label: 'Total Courses', value: materials.length, icon: <IconBook size={18} /> },
            { label: 'Total Chapters', value: materials.reduce((acc, m) => acc + (m.chapters?.length || 0), 0), icon: <IconBookmark size={18} /> },
            { label: 'Total Lessons', value: materials.reduce((acc, m) => acc + (m.chapters?.reduce((a, ch) => a + (ch.lessons?.length || 0), 0) || 0), 0), icon: <IconClock size={18} /> },
          ].map((stat, idx) => (
            <Box key={idx} sx={{
              px: 3, py: 1.5,
              bgcolor: '#fff',
              border: '1px solid #f1f5f9',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', gap: 1.5,
              boxShadow: '0 2px 8px rgba(15,23,42,0.03)'
            }}>
              <Box sx={{ color: '#6366f1' }}>{stat.icon}</Box>
              <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>{stat.value}</Typography>
              <Typography sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.8rem' }}>{stat.label}</Typography>
            </Box>
          ))}
        </Box>

        {/* Cards Grid */}
        {loading ? <LoadingSkeleton /> : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3
          }}>
            {filteredMaterials.map((material, idx) => {
              const colorSet = cardColors[idx % cardColors.length];
              const chapterCount = material.chapters?.length || 0;
              const lessonCount = material.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0;

              return (
                <MotionBox
                  key={material._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  onClick={() => navigate(`/study-materials/${material._id}`)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    background: colorSet.gradient,
                    color: '#fff',
                    position: 'relative',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 8px 32px ${colorSet.glow}`,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 50px ${colorSet.glow}`,
                    },
                    '&:after': {
                      content: '""', position: 'absolute', width: 180, height: 180,
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: '50%', top: -60, right: -60,
                    },
                    '&:before': {
                      content: '""', position: 'absolute', width: 120, height: 120,
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '50%', bottom: -40, left: -20,
                    }
                  }}
                >
                  <Box sx={{ p: 3, position: 'relative', zIndex: 1, minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{
                      width: 48, height: 48, borderRadius: '14px',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mb: 2.5
                    }}>
                      <IconBook size={24} color="#fff" />
                    </Box>

                    <Typography sx={{
                      fontWeight: 800, fontSize: '1.15rem', mb: 1, lineHeight: 1.3,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {material.title}
                    </Typography>

                    <Typography sx={{
                      fontSize: '0.82rem', opacity: 0.8, lineHeight: 1.6, mb: 'auto',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {material.description}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
                      <Chip
                        label={`${chapterCount} chapters`}
                        size="small"
                        sx={{
                          bgcolor: colorSet.chip,
                          color: colorSet.chipText,
                          fontWeight: 700, fontSize: '0.7rem',
                          height: 26, borderRadius: '8px'
                        }}
                      />
                      <Chip
                        label={`${lessonCount} lessons`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: '#fff',
                          fontWeight: 700, fontSize: '0.7rem',
                          height: 26, borderRadius: '8px'
                        }}
                      />
                    </Stack>
                  </Box>
                </MotionBox>
              );
            })}
          </Box>
        )}

        {/* Empty State */}
        {!loading && filteredMaterials.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <IconBook size={64} color="#cbd5e1" />
            <Typography sx={{ mt: 3, color: '#94a3b8', fontWeight: 700, fontSize: '1.2rem' }}>
              {searchQuery ? 'No materials match your search' : 'No study materials available yet'}
            </Typography>
            <Typography sx={{ color: '#cbd5e1', mt: 1 }}>
              {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new content'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
