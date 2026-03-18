import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItemButton, ListItemText, Collapse, IconButton, Chip, Button, Stack, Skeleton, Tooltip } from '@mui/material';
import { ExpandLess, ExpandMore, ChevronLeft, ChevronRight, ArrowBack, MenuBook, CheckCircle } from '@mui/icons-material';
import { IconBook, IconBookmark, IconChevronLeft, IconChevronRight, IconMenu2, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import apiService from 'services/apiService';

const MotionBox = motion.create(Box);

const LightBackground = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#fbfcfe' }} />
    <Box sx={{
      position: 'absolute', top: '5%', right: '10%',
      width: '35vw', height: '35vw',
      background: 'radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, transparent 70%)',
      borderRadius: '50%', filter: 'blur(80px)',
    }} />
  </Box>
);

export default function StudyMaterialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [expandedChapters, setExpandedChapters] = useState([0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const data = await apiService.getStudyMaterialById(id);
        setMaterial(data);
      } catch (error) {
        console.error('Error fetching material:', error);
      }
    };
    fetchMaterial();
  }, [id]);

  const handleChapterToggle = (index) => {
    setExpandedChapters(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleLessonChange = (chapterIdx, lessonIdx) => {
    setCurrentChapter(chapterIdx);
    setCurrentLesson(lessonIdx);
    if (!expandedChapters.includes(chapterIdx)) {
      setExpandedChapters(prev => [...prev, chapterIdx]);
    }
    document.querySelector('.content-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    const chapter = material.chapters[currentChapter];
    if (currentLesson < chapter.lessons.length - 1) {
      handleLessonChange(currentChapter, currentLesson + 1);
    } else if (currentChapter < material.chapters.length - 1) {
      handleLessonChange(currentChapter + 1, 0);
    }
  };

  const handlePrevious = () => {
    if (currentLesson > 0) {
      handleLessonChange(currentChapter, currentLesson - 1);
    } else if (currentChapter > 0) {
      const prevChapter = currentChapter - 1;
      handleLessonChange(prevChapter, material.chapters[prevChapter].lessons.length - 1);
    }
  };

  if (!material) return (
    <Box sx={{ p: { xs: 2.5, sm: 3, md: 4.5 }, bgcolor: '#fbfcfe', minHeight: '100vh' }}>
      <LightBackground />
      <Box sx={{ position: 'relative', zIndex: 10 }}>
        <Skeleton variant="rounded" height={60} sx={{ borderRadius: '16px', mb: 3 }} />
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Skeleton variant="rounded" width={300} height={500} sx={{ borderRadius: '24px' }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rounded" height={60} sx={{ borderRadius: '16px', mb: 2 }} />
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: '24px' }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const lesson = material.chapters[currentChapter]?.lessons[currentLesson];
  const totalLessons = material.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const currentLessonNumber = material.chapters.slice(0, currentChapter).reduce((acc, ch) => acc + ch.lessons.length, 0) + currentLesson + 1;
  const isFirst = currentChapter === 0 && currentLesson === 0;
  const isLast = currentChapter === material.chapters.length - 1 && currentLesson === material.chapters[currentChapter].lessons.length - 1;

  return (
    <Box sx={{
      minHeight: '100vh',
      p: { xs: 2, sm: 3, md: 4 },
      bgcolor: '#fbfcfe',
      color: '#1e293b',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      <LightBackground />

      <Box sx={{ position: 'relative', zIndex: 10 }}>
        {/* Top Bar */}
        <MotionBox
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          sx={{
            display: 'flex', alignItems: 'center', gap: 2, mb: 3,
            p: 2, bgcolor: '#fff', borderRadius: '16px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 8px rgba(15,23,42,0.03)'
          }}
        >
          <Tooltip title="Back to Materials">
            <IconButton onClick={() => navigate('/study-materials')} sx={{ bgcolor: '#f8fafc', borderRadius: '12px' }}>
              <ArrowBack sx={{ color: '#64748b' }} />
            </IconButton>
          </Tooltip>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {material.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              Lesson {currentLessonNumber} of {totalLessons}
            </Typography>
          </Box>
          <Chip
            label={`${Math.round((currentLessonNumber / totalLessons) * 100)}%`}
            sx={{ bgcolor: '#6366f1', color: '#fff', fontWeight: 800, fontSize: '0.8rem', height: 30, borderRadius: '10px' }}
          />
          {!sidebarOpen && (
            <IconButton onClick={() => setSidebarOpen(true)} sx={{ bgcolor: '#f1f5f9', borderRadius: '12px' }}>
              <IconMenu2 size={20} color="#475569" />
            </IconButton>
          )}
        </MotionBox>

        {/* Main Content Layout */}
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          {/* Sidebar */}
          {sidebarOpen && (
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              sx={{
                width: { xs: '100%', md: 320 },
                flexShrink: 0,
                position: { xs: 'fixed', md: 'sticky' },
                top: { md: 20 },
                left: { xs: 0, md: 'auto' },
                right: { xs: 0, md: 'auto' },
                bottom: { xs: 0, md: 'auto' },
                zIndex: { xs: 1200, md: 1 },
                maxHeight: { md: 'calc(100vh - 140px)' },
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Overlay for mobile */}
              <Box
                onClick={() => setSidebarOpen(false)}
                sx={{
                  display: { xs: 'block', md: 'none' },
                  position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', zIndex: -1
                }}
              />

              <Box sx={{
                bgcolor: '#fff',
                borderRadius: { xs: '24px 24px 0 0', md: '24px' },
                border: '1px solid #f1f5f9',
                boxShadow: '0 10px 40px rgba(15,23,42,0.08)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: { xs: '75vh', md: 'calc(100vh - 140px)' },
                position: { xs: 'fixed', md: 'relative' },
                bottom: { xs: 0, md: 'auto' },
                left: { xs: 0, md: 'auto' },
                right: { xs: 0, md: 'auto' },
                width: { xs: '100%', md: 320 },
              }}>
                {/* Sidebar Header */}
                <Box sx={{
                  p: 2.5, borderBottom: '1px solid #f1f5f9',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.03) 100%)'
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>
                      Chapters
                    </Typography>
                    <IconButton size="small" onClick={() => setSidebarOpen(false)} sx={{ bgcolor: '#f8fafc', borderRadius: '10px' }}>
                      <IconX size={16} color="#64748b" />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Chip label={`${material.chapters?.length || 0} chapters`} size="small"
                      sx={{ bgcolor: '#ede9fe', color: '#6366f1', fontWeight: 700, fontSize: '0.7rem', height: 24, borderRadius: '8px' }} />
                    <Chip label={`${totalLessons} lessons`} size="small"
                      sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 700, fontSize: '0.7rem', height: 24, borderRadius: '8px' }} />
                  </Stack>
                </Box>

                {/* Chapter List */}
                <List sx={{ overflow: 'auto', flexGrow: 1, p: 1.5, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 10 } }}>
                  {material.chapters.map((chapter, chIdx) => (
                    <Box key={chIdx} sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => handleChapterToggle(chIdx)}
                        sx={{
                          borderRadius: '14px',
                          bgcolor: currentChapter === chIdx ? 'rgba(99,102,241,0.06)' : 'transparent',
                          py: 1.5,
                          '&:hover': { bgcolor: 'rgba(99,102,241,0.04)' }
                        }}
                      >
                        <Box sx={{
                          width: 28, height: 28, borderRadius: '8px', mr: 1.5, flexShrink: 0,
                          bgcolor: currentChapter === chIdx ? '#6366f1' : '#f1f5f9',
                          color: currentChapter === chIdx ? '#fff' : '#94a3b8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 800
                        }}>
                          {chIdx + 1}
                        </Box>
                        <ListItemText
                          primary={chapter.title}
                          primaryTypographyProps={{
                            fontWeight: currentChapter === chIdx ? 700 : 600,
                            fontSize: '0.875rem',
                            color: currentChapter === chIdx ? '#1e293b' : '#475569'
                          }}
                        />
                        {expandedChapters.includes(chIdx) ? <ExpandLess sx={{ color: '#94a3b8', fontSize: 20 }} /> : <ExpandMore sx={{ color: '#94a3b8', fontSize: 20 }} />}
                      </ListItemButton>

                      <Collapse in={expandedChapters.includes(chIdx)} timeout="auto">
                        <List component="div" disablePadding sx={{ ml: 2.5, borderLeft: '2px solid #f1f5f9', pl: 1 }}>
                          {chapter.lessons.map((les, lIdx) => {
                            const isActive = currentChapter === chIdx && currentLesson === lIdx;
                            return (
                              <ListItemButton
                                key={lIdx}
                                onClick={() => handleLessonChange(chIdx, lIdx)}
                                sx={{
                                  borderRadius: '12px',
                                  py: 1,
                                  mb: 0.3,
                                  bgcolor: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                                  '&:hover': { bgcolor: 'rgba(99,102,241,0.04)' }
                                }}
                              >
                                <Box sx={{
                                  width: 6, height: 6, borderRadius: '50%', mr: 1.5, flexShrink: 0,
                                  bgcolor: isActive ? '#6366f1' : '#cbd5e1'
                                }} />
                                <ListItemText
                                  primary={les.title}
                                  primaryTypographyProps={{
                                    fontSize: '0.8rem',
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? '#6366f1' : '#64748b'
                                  }}
                                />
                              </ListItemButton>
                            );
                          })}
                        </List>
                      </Collapse>
                    </Box>
                  ))}
                </List>
              </Box>
            </MotionBox>
          )}

          {/* Main Content */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <MotionBox
              key={`${currentChapter}-${currentLesson}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Lesson Content */}
              <Box
                className="content-scroll"
                sx={{
                  bgcolor: '#fff', borderRadius: '20px',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.03)',
                  p: { xs: 3, sm: 4, md: 5 },
                  maxHeight: 'calc(100vh - 240px)',
                  overflow: 'auto',
                  '&::-webkit-scrollbar': { width: 6 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 10 },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }
                }}
              >
                <Box sx={{
                  '& h1': { fontSize: '2rem', fontWeight: 800, mb: 3, mt: 5, color: '#1e293b', '&:first-of-type': { mt: 0 } },
                  '& h2': { fontSize: '1.5rem', fontWeight: 800, mb: 2.5, mt: 4, color: '#1e293b', '&:first-of-type': { mt: 0 } },
                  '& h3': { fontSize: '1.25rem', fontWeight: 700, mb: 2, mt: 3, color: '#334155' },
                  '& p': { mb: 2.5, lineHeight: 1.9, fontSize: '1rem', color: '#475569' },
                  '& ul, & ol': { mb: 2.5, pl: 4, lineHeight: 1.9 },
                  '& li': { mb: 1, color: '#475569' },
                  '& table': {
                    width: '100%', borderCollapse: 'collapse', mb: 3,
                    border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden'
                  },
                  '& th, & td': { border: '1px solid #e2e8f0', p: 2, textAlign: 'left', fontSize: '0.9rem' },
                  '& th': { bgcolor: '#f8fafc', fontWeight: 700, color: '#1e293b' },
                  '& pre': {
                    bgcolor: '#1e293b', color: '#e2e8f0', p: 3, borderRadius: '16px',
                    overflow: 'auto', mb: 3, fontSize: '0.875rem', lineHeight: 1.7,
                    border: '1px solid #334155'
                  },
                  '& code': { fontFamily: "'JetBrains Mono', Consolas, Monaco, monospace", fontSize: '0.875rem' },
                  '& :not(pre) > code': {
                    bgcolor: '#f1f5f9', color: '#6366f1', px: 1, py: 0.3,
                    borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600
                  },
                  '& img': { maxWidth: '100%', height: 'auto', borderRadius: '16px', my: 3, display: 'block' },
                  '& blockquote': {
                    borderLeft: '4px solid #6366f1', bgcolor: '#f8fafc',
                    px: 3, py: 2, my: 3, borderRadius: '0 12px 12px 0',
                    '& p': { color: '#475569', mb: 0 }
                  },
                  '& a': { color: '#6366f1', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
                  '& hr': { border: 'none', borderTop: '1px solid #f1f5f9', my: 4 }
                }}>
                  <div dangerouslySetInnerHTML={{ __html: lesson?.content }} />
                </Box>
              </Box>

              {/* Navigation Footer */}
              <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                mt: 3, p: 2,
                bgcolor: '#fff', borderRadius: '16px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 2px 8px rgba(15,23,42,0.03)'
              }}>
                <Button
                  startIcon={<IconChevronLeft size={18} />}
                  onClick={handlePrevious}
                  disabled={isFirst}
                  sx={{
                    color: isFirst ? '#cbd5e1' : '#475569',
                    fontWeight: 700,
                    borderRadius: '12px',
                    px: 3,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#f8fafc' }
                  }}
                >
                  Previous
                </Button>

                <Typography sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.8rem' }}>
                  {currentLessonNumber} / {totalLessons}
                </Typography>

                <Button
                  endIcon={<IconChevronRight size={18} />}
                  onClick={handleNext}
                  disabled={isLast}
                  sx={{
                    bgcolor: isLast ? '#f1f5f9' : '#6366f1',
                    color: isLast ? '#cbd5e1' : '#fff',
                    fontWeight: 700,
                    borderRadius: '12px',
                    px: 3,
                    textTransform: 'none',
                    boxShadow: isLast ? 'none' : '0 4px 12px rgba(99,102,241,0.3)',
                    '&:hover': { bgcolor: isLast ? '#f1f5f9' : '#4f46e5' },
                    '&.Mui-disabled': { bgcolor: '#f1f5f9', color: '#cbd5e1' }
                  }}
                >
                  Next
                </Button>
              </Box>
            </MotionBox>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
