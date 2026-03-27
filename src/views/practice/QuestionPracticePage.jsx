import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, IconButton, Tabs, Tab, 
  Select, MenuItem, FormControl, InputLabel, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Chip, Stack, Tooltip, Breadcrumbs, Link
} from '@mui/material';
import { 
  ArrowBack, PlayArrow, CheckCircle, Close, Add, Remove, 
  Fullscreen, FullscreenExit, Description, Code, Terminal, 
  Lightbulb, Timer, Storage, Check, LightMode, DarkMode
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { submitCode } from 'services/pistonService';
import tenantConfig from 'config/tenantConfig';
import { useAuth } from 'contexts/AuthContext';
import StarryBackground from 'components/StarryBackground';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion.create(Box);

const langMeta = {
  python: { label: 'Python', color: '#3572A5', id: 71 },
  cpp: { label: 'C++', color: '#f34b7d', id: 54 },
  java: { label: 'Java', color: '#b07219', id: 62 },
  c: { label: 'C', color: '#555555', id: 50 },
};

const templates = {
  python: `# Write your Python code here\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
};

export default function QuestionPracticePage() {
  const { id, topic } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [config, setConfig] = useState(null);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [currentTestCaseTab, setCurrentTestCaseTab] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [testCaseResults, setTestCaseResults] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResults, setSubmitResults] = useState([]);
  const [leftWidth, setLeftWidth] = useState(45);
  const [compilerSplit, setCompilerSplit] = useState(65);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const containerRef = useRef(null);
  const isResizing = useRef(false);
  const isResizingVertical = useRef(false);

  // ── Drag Handlers ──
  const startResizing = (e) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth);
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  const startResizingVertical = (e) => {
    isResizingVertical.current = true;
    document.addEventListener('mousemove', handleMouseMoveVertical);
    document.addEventListener('mouseup', stopResizingVertical);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMoveVertical = (e) => {
    if (!isResizingVertical.current) return;
    const container = document.getElementById('split-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
    if (newHeight > 5 && newHeight < 95) setCompilerSplit(newHeight);
  };

  const stopResizingVertical = () => {
    isResizingVertical.current = false;
    document.removeEventListener('mousemove', handleMouseMoveVertical);
    document.removeEventListener('mouseup', stopResizingVertical);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  // ── Initial Setup ──
  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
    const savedTheme = localStorage.getItem('orca_practice_theme');
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('orca_practice_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (config && user?.token) fetchQuestion();
  }, [config, user, id]);

  const fetchQuestion = async () => {
    try {
      const apiBase = import.meta.env.DEV ? 'http://localhost:4000/api' : (config?.apiEndpoint || 'https://backend.orcode.in/api');
      const endpoint = topic ? `programming-questions/question/${id}` : `assessment-questions/${id}`;
      
      const response = await fetch(`${apiBase}/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'x-api-key': config?.apiKey || '',
          'x-tenant-id': config?.tenantId || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuestion(data);
        const saved = localStorage.getItem(`code_${id}_${language}`);
        setCode(saved || templates[language]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (question) {
      const saved = localStorage.getItem(`code_${id}_${language}`);
      setCode(saved || templates[language]);
    }
  }, [language, question, id]);

  const handleCodeChange = (val) => {
    setCode(val);
    localStorage.setItem(`code_${id}_${language}`, val);
  };

  // ── Execution Logic ──
  const handleRun = async () => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    setTestCaseResults({});
    const publicTC = question.testCases.filter(tc => tc.isPublic);
    
    for (let i = 0; i < publicTC.length; i++) {
      setTestCaseResults(prev => ({ ...prev, [i]: { loading: true } }));
      try {
        const result = await submitCode(code, langMeta[language].id, publicTC[i].input?.value || publicTC[i].input);
        const userOut = result.stdout?.trim() || '';
        const expected = (publicTC[i].output?.value || publicTC[i].output)?.toString().trim();
        setTestCaseResults(prev => ({ 
          ...prev, 
          [i]: { 
            loading: false, 
            output: userOut, 
            error: result.stderr || (result.status.id !== 3 ? 'Runtime Error' : null),
            passed: userOut === expected && result.status.id === 3
          } 
        }));
      } catch (err) {
        setTestCaseResults(prev => ({ ...prev, [i]: { loading: false, error: err.message } }));
      }
    }
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setShowSubmitModal(true);
    const allTC = question.testCases;
    const results = allTC.map((tc, i) => ({ index: i+1, status: 'Running', type: tc.isPublic ? 'Public' : 'Hidden' }));
    setSubmitResults(results);

    for (let i = 0; i < allTC.length; i++) {
       try {
         const result = await submitCode(code, langMeta[language].id, allTC[i].input?.value || allTC[i].input);
         const userOut = result.stdout?.trim() || '';
         const expected = (allTC[i].output?.value || allTC[i].output)?.toString().trim();
         const passed = userOut === expected && result.status.id === 3;
         results[i] = { ...results[i], status: passed ? 'Passed' : 'Failed', passed };
       } catch (err) {
         results[i] = { ...results[i], status: 'Error', passed: false };
       }
       setSubmitResults([...results]);
    }
    setIsSubmitting(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        setIsFullscreen(true);
    } else {
        document.exitFullscreen();
        setIsFullscreen(false);
    }
  };

  if (loading) return <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isDarkMode ? '#0c0e1a' : '#f8fafc' }}><CircularProgress sx={{ color: '#6366f1' }} /></Box>;

  // ── Dynamic Styles ──
  const t = {
    bg: isDarkMode ? '#0c0e1a' : '#ffffff',
    bgSide: isDarkMode ? 'rgba(15, 17, 30, 0.4)' : '#f8fafc',
    border: isDarkMode ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
    text: isDarkMode ? '#ffffff' : '#1e293b',
    textSecondary: isDarkMode ? 'rgba(255,255,255,0.7)' : '#475569',
    textMuted: isDarkMode ? 'rgba(255,255,255,0.4)' : '#64748b',
    headerBg: isDarkMode ? 'linear-gradient(to right, rgba(15,17,30,0.8), rgba(12,14,26,0.8))' : '#ffffff',
    cardBg: isDarkMode ? 'rgba(0,0,0,0.3)' : '#ffffff',
    codeBg: isDarkMode ? '#0c0e1a' : '#ffffff',
    testCaseBg: isDarkMode ? '#fbfcfe' : '#ffffff'
  };

  const selectMenuStyle = {
    '& .MuiPaper-root': {
        bgcolor: isDarkMode ? '#1e293b' : '#ffffff',
        border: `1px solid ${t.border}`,
        '& .MuiMenuItem-root': {
            color: isDarkMode ? '#ffffff' : '#1e293b',
            fontWeight: 700,
            fontSize: '0.85rem',
            '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' },
            '&.Mui-selected': { bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' } }
        }
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: t.bg, overflow: 'hidden', position: 'relative' }}>
      {isDarkMode && <StarryBackground />}

      {/* ── Top Header ── */}
      <Box sx={{ 
        height: 64, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${t.border}`, backdropFilter: 'blur(20px)', zIndex: 1000,
        background: t.headerBg, position: 'relative'
      }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <IconButton onClick={() => navigate(-1)} sx={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748b', '&:hover': { color: isDarkMode ? '#fff' : '#1e293b', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }}>
            <ArrowBack />
          </IconButton>
          <Breadcrumbs separator={<Typography sx={{ color: t.textMuted }}>/</Typography>}>
            <Link component="button" variant="body2" onClick={() => navigate('/practice/programming')} sx={{ color: t.textSecondary, textDecoration: 'none', fontWeight: 600, '&:hover': { color: '#6366f1' } }}>
              Practice Center
            </Link>
            <Typography variant="body2" sx={{ color: t.text, fontWeight: 800 }}>
              {question.title}
            </Typography>
          </Breadcrumbs>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton onClick={() => setIsDarkMode(!isDarkMode)} sx={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
                {isDarkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Toggle Fullscreen">
            <IconButton onClick={toggleFullscreen} sx={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
          <Button 
            variant="contained" 
            startIcon={isRunning ? <CircularProgress size={16} sx={{ color: isDarkMode ? '#fff' : '#6366f1' }} /> : <PlayArrow />}
            onClick={handleRun}
            disabled={isRunning || !code.trim()}
            sx={{ 
              bgcolor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)', 
              color: '#818cf8', fontWeight: 800, textTransform: 'none',
              px: { xs: 1.5, sm: 3 }, borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)',
              '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)', borderColor: '#818cf8' },
              '&.Mui-disabled': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f1f5f9', color: isDarkMode ? 'rgba(255,255,255,0.2)' : '#94a3b8' }
            }}
          >
            Run <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 0.5 }}>Code</Box>
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={isSubmitting || !code.trim()}
            sx={{ 
              bgcolor: '#6366f1', color: '#fff', fontWeight: 800, textTransform: 'none',
              px: { xs: 1.5, sm: 3 }, borderRadius: '8px', boxShadow: isDarkMode ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none',
              '&:hover': { bgcolor: '#4f46e5', transform: 'translateY(-1px)' },
              '&:active': { transform: 'translateY(0)' }
            }}
          >
            Submit
          </Button>
        </Stack>
      </Box>

      {/* ── Main Content Area ── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        
        {/* Left Pane: Problem Description */}
        <Box sx={{ position: 'relative', zIndex: 5, width: `${leftWidth}%`, height: '100%', overflow: 'auto', borderRight: `1px solid ${t.border}`, bgcolor: t.bgSide, backdropFilter: isDarkMode ? 'blur(30px)' : 'none' }}>
          <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
            <Typography variant="h3" sx={{ color: t.text, fontWeight: 900, mb: 1, letterSpacing: '-0.03em' }}>
              {question.title}
            </Typography>
            
            <Stack direction="row" spacing={1} mb={4}>
              <Chip label={question.difficulty} size="small" sx={{ fontWeight: 800, bgcolor: question.difficulty === 'Easy' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(52, 211, 153, 0.1)', color: question.difficulty === 'Easy' ? '#34d399' : '#fbbf24' }} />
              <Chip label={topic || 'Core'} size="small" sx={{ fontWeight: 800, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.1)' }} />
            </Stack>

            <Box sx={{ mb: 4 }}>
              <Typography sx={{ color: t.textMuted, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description sx={{ fontSize: 16, color: '#6366f1' }} /> Description
              </Typography>
              <Typography sx={{ color: t.textSecondary, lineHeight: 1.8, fontSize: '1.05rem', fontWeight: 500 }}>
                {question.description}
              </Typography>
            </Box>

            {question.example && (
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ color: t.textMuted, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lightbulb sx={{ fontSize: 16, color: '#fbbf24' }} /> Example Case
                </Typography>
                <Box sx={{ p: 3, borderRadius: '12px', bgcolor: isDarkMode ? 'rgba(0,0,0,0.3)' : '#ffffff', border: `1px solid ${t.border}`, boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="overline" sx={{ color: '#818cf8', fontWeight: 800, mb: 0.5, display: 'block' }}>Input</Typography>
                      <Typography sx={{ color: t.text, fontFamily: "'JetBrains Mono', monospace", bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc', p: 1, borderRadius: '4px' }}>{question.example.input}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="overline" sx={{ color: '#34d399', fontWeight: 800, mb: 0.5, display: 'block' }}>Output</Typography>
                      <Typography sx={{ color: t.text, fontFamily: "'JetBrains Mono', monospace", bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc', p: 1, borderRadius: '4px' }}>{question.example.output}</Typography>
                    </Box>
                    {question.example.explanation && (
                      <Box>
                        <Typography variant="overline" sx={{ color: t.textMuted, fontWeight: 800, mb: 0.5, display: 'block' }}>Explanation</Typography>
                        <Typography sx={{ color: t.textSecondary, fontStyle: 'italic', fontSize: '0.9rem' }}>{question.example.explanation}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Box>
            )}

            {question.constraints && (
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ color: t.textMuted, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', mb: 2 }}>
                  Constraints
                </Typography>
                <Stack spacing={1}>
                  {(Array.isArray(question.constraints) ? question.constraints : [question.constraints]).map((c, i) => (
                    <Typography key={i} sx={{ color: t.textSecondary, display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '0.9rem' }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#6366f1', flexShrink: 0 }} /> {c}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}

            <AnimatePresence>
               {question.intuition && (
                 <MotionBox 
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                   sx={{ mt: 6, p: 3, borderRadius: '16px', bgcolor: isDarkMode ? 'rgba(99, 102, 241, 0.03)' : 'rgba(99, 102, 241, 0.01)', border: '1px solid rgba(99, 102, 241, 0.1)' }}
                 >
                   <Typography variant="h6" sx={{ color: '#818cf8', fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                     <Storage sx={{ fontSize: 20 }} /> Pedagogical Insight
                   </Typography>
                   {question.intuition.approach && <Typography sx={{ color: t.textSecondary, mb: 3, lineHeight: 1.7, fontSize: '0.95rem' }}>{question.intuition.approach}</Typography>}
                   <Stack direction="row" spacing={4}>
                     {question.intuition.timeComplexity && (
                       <Box>
                         <Typography variant="caption" sx={{ color: t.textMuted, fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Time Complexity</Typography>
                         <Typography sx={{ color: t.text, fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>{question.intuition.timeComplexity}</Typography>
                       </Box>
                     )}
                     {question.intuition.spaceComplexity && (
                       <Box>
                         <Typography variant="caption" sx={{ color: t.textMuted, fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Space Complexity</Typography>
                         <Typography sx={{ color: t.text, fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>{question.intuition.spaceComplexity}</Typography>
                       </Box>
                     )}
                   </Stack>
                 </MotionBox>
               )}
            </AnimatePresence>
          </Box>
        </Box>

        {/* Resizer Slider (Horizontal) */}
        <Box 
            onMouseDown={startResizing} 
            sx={{ 
                width: 4, cursor: 'col-resize', bgcolor: t.border, transition: 'all 0.2s', 
                '&:hover': { bgcolor: '#6366f1', boxShadow: isDarkMode ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none' },
                position: 'relative', zIndex: 50
            }} 
        />

        {/* Right Pane: IDE & Compiler */}
        <Box id="split-container" sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', bgcolor: t.codeBg, position: 'relative', zIndex: 10 }}>
          
          {/* IDE Section */}
          <Box sx={{ position: 'relative', zIndex: 1, height: `${compilerSplit}%`, display: 'flex', flexDirection: 'column', borderBottom: `1px solid ${t.border}`, overflow: 'hidden' }}>
            <Box sx={{ 
              px: 3, height: 48, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              bgcolor: isDarkMode ? 'rgba(15, 17, 30, 0.6)' : '#ffffff', backdropFilter: isDarkMode ? 'blur(10px)' : 'none', zIndex: 10
            }}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Code sx={{ fontSize: 20, color: '#6366f1' }} />
                  <Typography variant="button" sx={{ color: t.textSecondary, fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.1em' }}>CODE WORKSPACE</Typography>
                </Box>
                <Select 
                  size="small" value={language} onChange={(e) => setLanguage(e.target.value)} 
                  MenuProps={{ sx: selectMenuStyle }}
                  sx={{ 
                    height: 32, color: '#818cf8', fontSize: '0.8rem', fontWeight: 800, borderRadius: '8px',
                    bgcolor: isDarkMode ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.03)',
                    '& .MuiOutlinedInput-notchedOutline': { border: isDarkMode ? '1px solid rgba(99, 102, 241, 0.1)' : '1px solid rgba(99, 102, 241, 0.2)' },
                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' },
                    '.MuiSvgIcon-root': { color: '#818cf8' }
                  }}
                >
                  {Object.keys(langMeta).map(l => <MenuItem key={l} value={l} sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{langMeta[l].label}</MenuItem>)}
                </Select>
              </Stack>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#f1f5f9', borderRadius: '6px', p: 0.5 }}>
                    <IconButton size="small" onClick={() => setFontSize(Math.max(12, fontSize - 2))} sx={{ color: t.textMuted, p: 0.5 }}><Remove sx={{ fontSize: 14 }} /></IconButton>
                    <Typography sx={{ color: t.textSecondary, fontSize: '0.75rem', fontWeight: 800, minWidth: 28, textAlign: 'center', fontFamily: 'monospace' }}>{fontSize}px</Typography>
                    <IconButton size="small" onClick={() => setFontSize(Math.min(32, fontSize + 2))} sx={{ color: t.textMuted, p: 0.5 }}><Add sx={{ fontSize: 14 }} /></IconButton>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ flex: 1, p: 0, bgcolor: t.codeBg, position: 'relative', zIndex: 5 }}>
               <Editor
                 height="100%"
                 language={language === 'cpp' ? 'cpp' : language}
                 value={code}
                 theme={isDarkMode ? 'vs-dark' : 'light'}
                 onChange={handleCodeChange}
                 options={{
                    fontSize,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontFamily: "'JetBrains Mono', monospace",
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    padding: { top: 20 },
                    scrollbar: { verticalScrollbarSize: 6 },
                    bracketPairColorization: { enabled: true },
                    automaticLayout: true
                 }}
               />
            </Box>
          </Box>

          {/* Horizontal Resizer Slider (Vertical Sidebar) */}
          <Box 
            onMouseDown={startResizingVertical} 
            sx={{ 
                height: 6, 
                cursor: 'row-resize', 
                bgcolor: t.border, 
                zIndex: 200,
                position: 'relative',
                '&:hover': { bgcolor: '#6366f1' }, 
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 40,
                    height: 3,
                    borderRadius: 2,
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }
            }} 
          />

          {/* Console / Output Section */}
          <Box sx={{ position: 'relative', zIndex: 100, flex: 1, display: 'flex', flexDirection: 'column', bgcolor: t.testCaseBg, overflow: 'hidden' }}>
            <Box sx={{ height: 48, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', px: 2, bgcolor: isDarkMode ? 'rgba(15, 17, 30, 0.4)' : '#ffffff', zIndex: 10 }}>
               <Tabs 
                 value={currentTestCaseTab} onChange={(e, v) => setCurrentTestCaseTab(v)}
                 variant="scrollable" scrollButtons="auto"
                 sx={{ minHeight: 48, '& .MuiTabs-indicator': { height: 3, bgcolor: '#6366f1' } }}
               >
                 {question.testCases.filter(tc => tc.isPublic).map((_, i) => (
                   <Tab key={i} sx={{ minHeight: 48, color: t.textMuted, fontWeight: 900, fontSize: '0.72rem', minWidth: 100, '&.Mui-selected': { color: t.text } }} label={
                     <Stack direction="row" spacing={1.5} alignItems="center">
                       {testCaseResults[i]?.passed === true ? <CheckCircle sx={{ fontSize: 16, color: '#34d399' }} /> : testCaseResults[i]?.passed === false ? <Close sx={{ fontSize: 16, color: '#f87171' }} /> : <Box sx={{ width: 8, height: 8, borderRadius: '50%', border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}` }} />}
                       <span>Case {i+1}</span>
                     </Stack>
                   } />
                 ))}
               </Tabs>
            </Box>

            <Box sx={{ flex: 1, p: 4, overflow: 'auto', bgcolor: t.testCaseBg, position: 'relative', zIndex: 5 }}>
               {question.testCases.filter(tc => tc.isPublic)[currentTestCaseTab] && (
                 <Stack spacing={4}>
                    <Box>
                      <Typography sx={{ color: t.textMuted, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.1em' }}>Standard Input</Typography>
                      <Box sx={{ bgcolor: isDarkMode ? 'rgba(0,0,0,0.4)' : '#ffffff', p: 2.5, borderRadius: '12px', border: `1px solid ${t.border}` }}>
                        <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", color: t.text, fontSize: '0.95rem' }}>{question.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].input?.value || question.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].input}</Typography>
                      </Box>
                    </Box>

                    {testCaseResults[currentTestCaseTab] && (
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                          <Typography sx={{ color: t.textMuted, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Program Output</Typography>
                          {testCaseResults[currentTestCaseTab].loading && <CircularProgress size={16} sx={{ color: '#6366f1' }} />}
                        </Stack>
                        <Box sx={{ 
                          bgcolor: isDarkMode ? 'rgba(0,0,0,0.5)' : '#ffffff', p: 2.5, borderRadius: '12px', 
                          border: '2px solid', 
                          borderColor: testCaseResults[currentTestCaseTab].passed === true ? 'rgba(52, 211, 153, 0.4)' : testCaseResults[currentTestCaseTab].passed === false ? 'rgba(248, 113, 113, 0.4)' : t.border,
                          minHeight: 64, display: 'flex', alignItems: 'center'
                        }}>
                          <Typography sx={{ 
                              fontFamily: "'JetBrains Mono', monospace", 
                              color: testCaseResults[currentTestCaseTab].passed === true ? '#34d399' : testCaseResults[currentTestCaseTab].passed === false ? '#f87171' : t.text,
                              whiteSpace: 'pre-wrap', fontSize: '0.95rem'
                          }}>
                            {testCaseResults[currentTestCaseTab].loading ? 'Executing on remote server...' : (testCaseResults[currentTestCaseTab].output || testCaseResults[currentTestCaseTab].error || 'Process finished with no output')}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    <Box>
                      <Typography sx={{ color: t.textMuted, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.1em' }}>Expected Result</Typography>
                      <Box sx={{ bgcolor: isDarkMode ? 'rgba(0,0,0,0.4)' : '#ffffff', p: 2.5, borderRadius: '12px', border: `1px solid ${t.border}` }}>
                        <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#818cf8', fontSize: '0.95rem' }}>{question.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].output?.value || question.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].output}</Typography>
                      </Box>
                    </Box>
                 </Stack>
               )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Submission Modal ── */}
      <Dialog 
        open={showSubmitModal} maxWidth="md" fullWidth 
        PaperProps={{ sx: { bgcolor: isDarkMode ? '#0c0e1a' : '#ffffff', color: t.text, borderRadius: '32px', border: `1px solid ${t.border}`, backdropFilter: 'blur(50px)', zIndex: 2000 } }}
        disableEscapeKeyDown={isSubmitting}
      >
        <DialogTitle sx={{ py: 4, px: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack spacing={0.5}>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: t.text }}>Final Submission</Typography>
            <Typography variant="body2" sx={{ color: t.textMuted, fontWeight: 600 }}>{isSubmitting ? 'Evaluating your solution against all hidden benchmarks...' : 'Benchmarking complete'}</Typography>
          </Stack>
          {!isSubmitting && <IconButton onClick={() => setShowSubmitModal(false)} sx={{ bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' } }}><Close sx={{ color: t.text }} /></IconButton>}
        </DialogTitle>
        <DialogContent sx={{ px: 5, pb: 5 }}>
          <Stack spacing={3}>
            <Box sx={{ 
                p: 3, borderRadius: '20px', bgcolor: 'rgba(99, 102, 241, 0.05)', 
                border: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
            }}>
              <Stack direction="row" spacing={3} divider={<Box sx={{ width: 1, height: 24, bgcolor: t.border }} />}>
                 <Box>
                    <Typography variant="caption" sx={{ color: t.textMuted, fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>Total Cases</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: t.text }}>{submitResults.length}</Typography>
                 </Box>
                 <Box>
                    <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>Passed</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#34d399' }}>{submitResults.filter(r => r.passed).length}</Typography>
                 </Box>
              </Stack>
              <Box sx={{ textAlign: 'right' }}>
                 <Typography variant="caption" sx={{ color: t.textMuted, fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>Accuracy Rate</Typography>
                 <Typography variant="h4" sx={{ fontWeight: 900, color: '#818cf8', fontFamily: 'monospace' }}>
                    {submitResults.length > 0 ? Math.round((submitResults.filter(r => r.passed).length / submitResults.length) * 100) : 0}%
                 </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2.5 }}>
              {submitResults.map((r, i) => (
                <Box 
                  key={i} 
                  sx={{ 
                    p: 2.5, borderRadius: '20px', border: '1px solid', 
                    borderColor: r.passed === true ? 'rgba(52, 211, 153, 0.2)' : r.passed === false ? 'rgba(248, 113, 113, 0.2)' : t.border,
                    bgcolor: r.passed === true ? 'rgba(52, 211, 153, 0.03)' : r.passed === false ? 'rgba(248, 113, 113, 0.03)' : isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Stack spacing={1.5} alignItems="center">
                    <Typography variant="caption" sx={{ color: t.textMuted, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TC {r.index}</Typography>
                    <AnimatePresence mode="wait">
                        {r.status === 'Running' ? (
                            <MotionBox initial={{ scale: 0.8 }} animate={{ scale: 1 }}><CircularProgress size={24} sx={{ color: '#6366f1' }} /></MotionBox>
                        ) : (
                            <MotionBox initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}>
                                {r.passed ? <CheckCircle sx={{ fontSize: 32, color: '#34d399' }} /> : <Close sx={{ fontSize: 32, color: '#f87171' }} />}
                            </MotionBox>
                        )}
                    </AnimatePresence>
                    <Chip label={r.type} size="small" sx={{ height: 20, bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: t.textMuted, fontWeight: 800, fontSize: '0.65rem' }} />
                  </Stack>
                </Box>
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 5, pb: 5 }}>
           {!isSubmitting && <Button variant="contained" fullWidth onClick={() => setShowSubmitModal(false)} sx={{ bgcolor: '#6366f1', color: '#fff', fontWeight: 900, py: 2, borderRadius: '16px', fontSize: '1rem', textTransform: 'none', boxShadow: isDarkMode ? '0 8px 30px rgba(99, 102, 241, 0.3)' : 'none', '&:hover': { bgcolor: '#4f46e5' } }}>Back to Workspace</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
