import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItemButton, ListItemText, Collapse, IconButton, Chip, Button } from '@mui/material';
import { ExpandLess, ExpandMore, ChevronLeft, ChevronRight, Menu as MenuIcon } from '@mui/icons-material';
import MainCard from 'ui-component/cards/MainCard';
import apiService from 'services/apiService';
import useConfig from 'hooks/useConfig';

export default function StudyMaterialDetail() {
  const { id } = useParams();
  const { state: { borderRadius } } = useConfig();
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

  if (!material) return <MainCard><Typography>Loading...</Typography></MainCard>;

  const lesson = material.chapters[currentChapter]?.lessons[currentLesson];
  const totalLessons = material.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const currentLessonNumber = material.chapters.slice(0, currentChapter).reduce((acc, ch) => acc + ch.lessons.length, 0) + currentLesson + 1;

  return (
    <MainCard>
      <Box sx={{ display: 'flex', height: 'calc(100vh - 200px)' }}>
        {sidebarOpen && (
          <Paper sx={{ 
            width: 300, 
            display: 'flex', 
            flexDirection: 'column', 
            borderRadius: `${borderRadius}px`, 
            mr: 2,
            transition: 'width 0.3s ease, margin 0.3s ease',
            position: 'sticky',
            top: 0,
            alignSelf: 'flex-start',
            maxHeight: 'calc(100vh - 200px)'
          }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h4">{material.title}</Typography>
              <IconButton size="small" onClick={() => setSidebarOpen(false)}>
                <ChevronLeft />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={`${material.chapters?.length || 0} chapters`} size="small" color="primary" />
              <Chip label={`${totalLessons} lessons`} size="small" variant="outlined" />
            </Box>
          </Box>
          
          <List sx={{ overflow: 'auto', flexGrow: 1, p: 1 }}>
            {material.chapters.map((chapter, chIdx) => (
              <Box key={chIdx}>
                <ListItemButton onClick={() => handleChapterToggle(chIdx)} sx={{ 
                  borderRadius: `${borderRadius}px`,
                  bgcolor: currentChapter === chIdx ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' }
                }}>
                  <ListItemText primary={chapter.title} primaryTypographyProps={{ fontWeight: 600 }} />
                  {expandedChapters.includes(chIdx) ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                
                <Collapse in={expandedChapters.includes(chIdx)} timeout="auto">
                  <List component="div" disablePadding>
                    {chapter.lessons.map((lesson, lIdx) => (
                      <ListItemButton
                        key={lIdx}
                        sx={{
                          pl: 4,
                          borderRadius: `${borderRadius}px`,
                          color: currentChapter === chIdx && currentLesson === lIdx ? 'primary.main' : 'inherit',
                          fontWeight: currentChapter === chIdx && currentLesson === lIdx ? 600 : 400,
                          textDecoration: currentChapter === chIdx && currentLesson === lIdx ? 'underline' : 'none',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => handleLessonChange(chIdx, lIdx)}
                      >
                        <ListItemText primary={lesson.title} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ))}
          </List>
        </Paper>
      )}

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!sidebarOpen && (
          <Paper sx={{ 
            p: 1, 
            mb: 2, 
            borderRadius: `${borderRadius}px`, 
            width: 'fit-content',
            transition: 'all 0.3s ease'
          }}>
            <IconButton onClick={() => setSidebarOpen(true)}>
              <ChevronRight />
            </IconButton>
          </Paper>
        )}
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: `${borderRadius}px`, mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h3">{lesson?.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              Lesson {currentLessonNumber} of {totalLessons}
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }} className="content-scroll">
          <Paper sx={{ p: 4, height: '100%', borderRadius: `${borderRadius}px` }}>
            <Box sx={{ 
              '& h2': { fontSize: '1.75rem', fontWeight: 700, mb: 2.5, mt: 4, color: 'text.primary', '&:first-of-type': { mt: 0 } }, 
              '& p': { mb: 2.5, lineHeight: 1.8, fontSize: '1rem', color: 'text.primary' }, 
              '& ul, & ol': { mb: 2.5, pl: 4, lineHeight: 1.8 },
              '& li': { mb: 1 },
              '& table': { width: '100%', borderCollapse: 'collapse', mb: 3, border: '1px solid', borderColor: 'divider' }, 
              '& th, & td': { border: '1px solid', borderColor: 'divider', p: 1.5, textAlign: 'left' }, 
              '& th': { bgcolor: 'primary.lighter', fontWeight: 700, color: 'primary.main' },
              '& pre': { bgcolor: '#1e1e1e', color: '#d4d4d4', p: 3, borderRadius: `${borderRadius}px`, overflow: 'auto', mb: 3, fontSize: '0.9rem' }, 
              '& code': { fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.9rem' },
              '& img': { maxWidth: '100%', height: 'auto', borderRadius: `${borderRadius}px`, my: 3, display: 'block' }
            }}>
              <div dangerouslySetInnerHTML={{ __html: lesson?.content }} />
            </Box>
          </Paper>
        </Box>

        <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', borderRadius: `${borderRadius}px`, mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ChevronLeft />}
            onClick={handlePrevious}
            disabled={currentChapter === 0 && currentLesson === 0}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            endIcon={<ChevronRight />}
            onClick={handleNext}
            disabled={
              currentChapter === material.chapters.length - 1 &&
              currentLesson === material.chapters[currentChapter].lessons.length - 1
            }
          >
            Next
          </Button>
        </Paper>
      </Box>
    </Box>
    </MainCard>
  );
}
