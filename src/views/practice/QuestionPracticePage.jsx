import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, IconButton, Tabs, Tab, 
  Select, MenuItem, CircularProgress, 
  Chip, Stack, Tooltip, Breadcrumbs, Link, LinearProgress
} from '@mui/material';
import { 
  ArrowBack, PlayArrow, CheckCircle, Close, Add, Remove, 
  Fullscreen, FullscreenExit, Description, Code, 
  Lightbulb, Timer, Storage, Check, LightMode, DarkMode,
  EmojiEvents, Speed, SignalCellularAlt, Replay, Stars,
  KeyboardBackspace, TrendingUp, Analytics, WorkspacePremium
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResults, setSubmitResults] = useState([]);
  const [submitStats, setSubmitStats] = useState({ runtime: 0, memory: 0, avgTime: 0, coinsEarned: 0 });
  const [leftWidth, setLeftWidth] = useState(45);
  const [compilerSplit, setCompilerSplit] = useState(65);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showResults, setShowResults] = useState(false);
  
  const isResizing = useRef(false);
  const isResizingVertical = useRef(false);

  // ── Drag Handlers ──
  const startResizing = (e) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
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
  };

  const startResizingVertical = (e) => {
    isResizingVertical.current = true;
    document.addEventListener('mousemove', handleMouseMoveVertical);
    document.addEventListener('mouseup', stopResizingVertical);
    document.body.style.cursor = 'row-resize';
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
    } catch (err) { console.error(err); } finally { setLoading(false); }
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
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowResults(true); // Toggle the submission view in the sidebar
    setSubmitStats({ runtime: 0, memory: 0, avgTime: 0, coinsEarned: 0 });
    
    const allTC = question.testCases;
    const results = allTC.map((tc, i) => ({ index: i+1, status: 'Running', type: tc.isPublic ? 'Public' : 'Hidden', running: true }));
    setSubmitResults(results);

    let totalCpuTime = 0;
    let maxMemory = 0;
    let failCount = 0;

    for (let i = 0; i < allTC.length; i++) {
       try {
         const result = await submitCode(code, langMeta[language].id, allTC[i].input?.value || allTC[i].input);
         const userOut = result.stdout?.trim() || '';
         const expected = (allTC[i].output?.value || allTC[i].output)?.toString().trim();
         const passed = userOut === expected && result.status.id === 3;
         results[i] = { ...results[i], status: passed ? 'Passed' : 'Failed', passed, running: false };
         if (!passed) failCount++;
         totalCpuTime += (result.time || 0);
         maxMemory = Math.max(maxMemory, result.memory || 0);
       } catch (err) {
         results[i] = { ...results[i], status: 'Error', passed: false, running: false };
         failCount++;
       }
       setSubmitResults([...results]);
    }
    
    const finalStats = { runtime: totalCpuTime.toFixed(2), memory: (maxMemory / 1024).toFixed(2), avgTime: (totalCpuTime / allTC.length).toFixed(3), coinsEarned: 0 };

    try {
      const apiUrl = import.meta.env.DEV ? 'http://localhost:4000/api' : (config?.apiEndpoint || 'https://backend.orcode.in/api');
      const response = await fetch(`${apiUrl}/practice-submissions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
        body: JSON.stringify({ questionId: id, topicId: question.topicId || id, subTopicId: question.subTopicId || id, code, language, status: failCount === 0 ? 'accepted' : 'wrong_answer', passedTests: allTC.length - failCount, totalTests: allTC.length, executionTime: totalCpuTime, memoryUsed: maxMemory })
      });
      const data = await response.json();
      if (data.success) finalStats.coinsEarned = data.coinsEarned || 0;
    } catch (err) { console.error('Persistence failed:', err); }
    
    setSubmitStats(finalStats);
    setIsSubmitting(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); } 
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  if (loading) return <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isDarkMode ? '#0c0e1a' : '#f8fafc' }}><CircularProgress sx={{ color: '#6366f1' }} /></Box>;

  // ── High Contrast Color Tokens ──
  const t = {
    bg: isDarkMode ? '#0c0e1a' : '#ffffff',
    bgSide: isDarkMode ? 'rgba(15, 17, 30, 0.4)' : '#f8fafc',
    border: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
    text: isDarkMode ? '#f8fafc' : '#1e293b',
    textSecondary: isDarkMode ? '#cbd5e1' : '#475569',
    textMuted: isDarkMode ? '#94a3b8' : '#64748b',
    headerBg: isDarkMode ? 'linear-gradient(to right, rgba(15,17,30,0.9), rgba(12,14,26,0.9))' : '#ffffff',
    codeBg: isDarkMode ? '#0c0e1a' : '#ffffff',
    testCaseBg: isDarkMode ? 'rgba(12,14,26,0.98)' : '#ffffff'
  };

  const passedCount = submitResults.filter(r => r.passed).length;
  const totalCount = submitResults.length;
  const accuracyRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  const isAllPassed = passedCount === totalCount && totalCount > 0 && !isSubmitting;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: t.bg, overflow: 'hidden', position: 'relative' }}>
      {isDarkMode && <StarryBackground />}

      {/* ── Top Header ── */}
      <Box sx={{ 
        height: 64, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${t.border}`, backdropFilter: 'blur(30px)', zIndex: 1000,
        background: t.headerBg, position: 'relative'
      }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <IconButton onClick={() => navigate(-1)} sx={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748b', '&:hover': { color: isDarkMode ? '#fff' : '#1e293b' } }}>
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
          <IconButton onClick={() => setIsDarkMode(!isDarkMode)} sx={{ color: t.textMuted }}>
                {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
          <IconButton onClick={toggleFullscreen} sx={{ color: t.textMuted }}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
          <Button 
            variant="contained" 
            startIcon={isRunning ? <CircularProgress size={16} sx={{ color: isDarkMode ? '#fff' : '#6366f1' }} /> : <PlayArrow />}
            onClick={handleRun}
            disabled={isRunning || !code.trim()}
            sx={{ 
              bgcolor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)', 
              color: '#818cf8', fontWeight: 800, textTransform: 'none',
              px: { xs: 1.5, sm: 3 }, borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)',
              '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)', borderColor: '#818cf8' }
            }}
          >
            Run
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={isSubmitting || !code.trim()}
            sx={{ 
              bgcolor: '#6366f1', color: '#fff', fontWeight: 800, textTransform: 'none',
              px: { xs: 1.5, sm: 3 }, borderRadius: '8px', boxShadow: isDarkMode ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none',
              '&:hover': { bgcolor: '#4f46e5', transform: 'translateY(-1px)' }
            }}
          >
            Submit
          </Button>
        </Stack>
      </Box>

      {/* ── Main Content Area ── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        
        {/* Left Pane (Sidebar) */}
        <Box sx={{ width: `${leftWidth}%`, height: '100%', overflow: 'hidden', borderRight: `1px solid ${t.border}`, bgcolor: t.bgSide, display: 'flex', flexDirection: 'column', backdropFilter: 'blur(20px)' }}>
           <AnimatePresence mode="wait">
              {showResults ? (
                /* ── High Premium Submission Results View ── */
                <MotionBox 
                    key="submission_view" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: 20 }} 
                    sx={{ flex: 1, p: 4, overflow: 'auto', position: 'relative' }}
                >
                   {/* Ambient Flow Background for Results */}
                   <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', bgcolor: isAllPassed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
                   
                   <Button 
                        startIcon={<KeyboardBackspace />} 
                        onClick={() => setShowResults(false)} 
                        sx={{ color: '#818cf8', fontWeight: 800, mb: 4, textTransform: 'none', '&:hover': { bgcolor: 'rgba(129, 140, 248, 0.08)' } }}
                   >
                        Back to Description
                   </Button>
                   
                   <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: '-0.05em', color: isSubmitting ? t.text : (isAllPassed ? '#10b981' : '#ef4444'), mb: 1, textShadow: isDarkMode ? '0 0 20px rgba(0,0,0,0.5)' : 'none' }}>
                      {isSubmitting ? 'Authenticating...' : (isAllPassed ? 'ACCEPTED' : 'WRONG ANSWER')}
                   </Typography>
                   <Typography variant="v6" variant="body1" sx={{ color: t.textSecondary, fontWeight: 700, mb: 5 }}>
                      {isSubmitting ? 'Validating your solution against hidden benchmarks...' : (isAllPassed ? "Masterful! You've passed all requirements." : `Failed on ${totalCount - passedCount} critical test cases.`)}
                   </Typography>

                   {/* Premium Stats Grid */}
                   <Box sx={{ 
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', 
                        bgcolor: isDarkMode ? 'rgba(255,255,255,0.04)' : '#ffffff', 
                        borderRadius: '32px', border: `1px solid ${t.border}`, mb: 6, overflow: 'hidden',
                        boxShadow: isDarkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.03)'
                   }}>
                      <Box sx={{ p: 3, textAlign: 'center', borderRight: `1px solid ${t.border}` }}>
                         <Typography variant="caption" sx={{ color: t.textMuted, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 1 }}>Total Cases</Typography>
                         <Typography variant="h3" sx={{ fontWeight: 950, color: t.text }}>{totalCount}</Typography>
                      </Box>
                      <Box sx={{ p: 3, textAlign: 'center', borderRight: `1px solid ${t.border}` }}>
                         <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 1 }}>Passed</Typography>
                         <Typography variant="h3" sx={{ fontWeight: 950, color: '#10b981' }}>{passedCount}</Typography>
                      </Box>
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                         <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 1 }}>Accuracy</Typography>
                         <Typography variant="h3" sx={{ fontWeight: 950, color: '#818cf8' }}>{accuracyRate}%</Typography>
                      </Box>
                   </Box>

                   <Stack spacing={4} mb={6}>
                      {/* Performance Row */}
                      <Box>
                         <Typography variant="overline" sx={{ color: t.textMuted, fontWeight: 900, mb: 2, display: 'block' }}>Performance Overview</Typography>
                         <Stack direction="row" spacing={2}>
                            <Box sx={{ flex: 1, p: 2.5, borderRadius: '20px', bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                               <Speed sx={{ color: '#818cf8' }} />
                               <Box>
                                  <Typography variant="caption" sx={{ color: t.textMuted, fontWeight: 800 }}>CPU Runtime</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 900, color: t.text }}>{isSubmitting ? '...' : submitStats.runtime}s</Typography>
                               </Box>
                            </Box>
                            <Box sx={{ flex: 1, p: 2.5, borderRadius: '20px', bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                               <SignalCellularAlt sx={{ color: '#10b981' }} />
                               <Box>
                                  <Typography variant="caption" sx={{ color: t.textMuted, fontWeight: 800 }}>Memory</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 900, color: t.text }}>{isSubmitting ? '...' : submitStats.memory} MB</Typography>
                               </Box>
                            </Box>
                            <Box sx={{ flex: 1, p: 2.5, borderRadius: '20px', bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                               <Stars sx={{ color: '#fbbf24' }} />
                               <Box>
                                  <Typography variant="caption" sx={{ color: t.textMuted, fontWeight: 800 }}>Reward</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 900, color: '#fbbf24' }}>{isSubmitting ? '...' : `+${submitStats.coinsEarned}`}</Typography>
                               </Box>
                            </Box>
                         </Stack>
                      </Box>
                      
                      {/* Test Case Grid */}
                      <Box>
                         <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="overline" sx={{ color: t.textMuted, fontWeight: 900 }}>Complete Verdict Grid</Typography>
                            <Typography variant="caption" sx={{ color: t.textMuted, fontWeight: 600 }}>{passedCount} / {totalCount} Passed</Typography>
                         </Stack>
                         <Box sx={{ 
                            display: 'flex', flexWrap: 'wrap', gap: 1.5, p: 3, 
                            borderRadius: '28px', bgcolor: isDarkMode ? 'rgba(0,0,0,0.3)' : '#f8fafc',
                            border: `1px solid ${t.border}`
                         }}>
                            {submitResults.map((r, i) => (
                               <Tooltip key={i} title={`Test Case ${i+1}: ${r.status}`}>
                                  <Box sx={{ 
                                     width: 48, height: 48, borderRadius: '16px', 
                                     bgcolor: r.running ? 'rgba(99, 102, 241, 0.08)' : (r.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'), 
                                     border: '2px solid', 
                                     borderColor: r.running ? 'rgba(99, 102, 241, 0.4)' : (r.passed ? '#10b981' : '#ef4444'), 
                                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                                     transition: 'all 0.2s', '&:hover': { transform: r.running ? 'none' : 'scale(1.15)', boxShadow: r.passed ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none' }
                                  }}>
                                     {r.running ? <CircularProgress size={20} thickness={5} sx={{ color: '#818cf8' }} /> : (r.passed ? <Check sx={{ color: '#10b981', fontWeight: 900 }} /> : <Close sx={{ color: '#ef4444', fontWeight: 900 }} />)}
                                  </Box>
                               </Tooltip>
                            ))}
                         </Box>
                      </Box>
                   </Stack>
                   
                   {!isSubmitting && (
                      <Stack direction="row" spacing={3}>
                         <Button 
                            fullWidth variant="outlined" 
                            onClick={() => setShowResults(false)}
                            startIcon={<Replay />}
                            sx={{ py: 2.2, borderRadius: '22px', fontWeight: 900, textTransform: 'none', border: `2px solid ${t.border}`, color: t.text }}
                         >
                            Retry Solution
                         </Button>
                         {isAllPassed && (
                            <Button 
                                fullWidth variant="contained" 
                                onClick={() => navigate('/practice/programming')} 
                                sx={{ py: 2.2, borderRadius: '22px', bgcolor: '#10b981', fontWeight: 900, color: '#fff', fontSize: '1rem', textTransform: 'none', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)', '&:hover': { bgcolor: '#059669', transform: 'translateY(-2px)' } }}
                            >
                                Done
                            </Button>
                         )}
                      </Stack>
                   )}
                </MotionBox>
              ) : (
                /* ── Detailed Problem Description View ── */
                <MotionBox 
                    key="description_view" 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }} 
                    sx={{ flex: 1, p: 4, overflow: 'auto' }}
                >
                   <Typography variant="h3" sx={{ color: t.text, fontWeight: 950, mb: 1, letterSpacing: '-0.03em' }}>{question.title}</Typography>
                   <Stack direction="row" spacing={1} mb={4}>
                      <Chip label={question.difficulty} size="small" sx={{ fontWeight: 900, bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }} />
                      <Chip label={topic || 'Core'} size="small" sx={{ fontWeight: 900, bgcolor: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }} />
                   </Stack>
                   
                   <Box sx={{ mb: 5 }}>
                      <Typography sx={{ color: t.textMuted, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Description sx={{ fontSize: 18, color: '#6366f1' }} /> Problem Statement
                      </Typography>
                      <Typography sx={{ color: t.textSecondary, lineHeight: 1.8, fontSize: '1.05rem', fontWeight: 500 }}>
                        {question.description}
                      </Typography>
                   </Box>
                   
                   {question.example && (
                     <Box sx={{ mb: 5 }}>
                        <Typography sx={{ color: t.textMuted, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Lightbulb sx={{ color: '#fbbf24', fontSize: 18 }} /> Example Case
                        </Typography>
                        <Box sx={{ p: 4, borderRadius: '24px', bgcolor: isDarkMode ? 'rgba(0,0,0,0.4)' : '#ffffff', border: `1px solid ${t.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                           <Typography variant="overline" sx={{ color: '#818cf8', fontWeight: 900, mb: 1, display: 'block' }}>Input</Typography>
                           <Typography sx={{ color: t.text, fontFamily: "'JetBrains Mono', monospace", bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', p: 1.5, borderRadius: '8px', mb: 3 }}>{question.example.input}</Typography>
                           <Typography variant="overline" sx={{ color: '#10b981', fontWeight: 900, mb: 1, display: 'block' }}>Output</Typography>
                           <Typography sx={{ color: t.text, fontFamily: "'JetBrains Mono', monospace", bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', p: 1.5, borderRadius: '8px', mb: 2 }}>{question.example.output}</Typography>
                           {question.example.explanation && (
                              <Typography sx={{ color: t.textMuted, fontSize: '0.9rem', fontStyle: 'italic', mt: 2 }}>{question.example.explanation}</Typography>
                           )}
                        </Box>
                     </Box>
                   )}
                   
                   {question.constraints && (
                      <Box sx={{ mb: 5 }}>
                        <Typography variant="overline" sx={{ color: t.textMuted, fontWeight: 900, mb: 2, display: 'block' }}>Constraints & Specs</Typography>
                        <Stack spacing={1.5}>
                           {(Array.isArray(question.constraints) ? question.constraints : [question.constraints]).map((c, i) => (
                              <Typography key={i} sx={{ color: t.textSecondary, display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '0.95rem', fontWeight: 500 }}>
                                 <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: '#6366f1', transform: 'rotate(45deg)' }} /> {c}
                              </Typography>
                           ))}
                        </Stack>
                      </Box>
                   )}

                   {question.intuition && (
                      <MotionBox 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        sx={{ mt: 6, p: 4, borderRadius: '24px', bgcolor: isDarkMode ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.02)', border: '1px solid rgba(99, 102, 241, 0.15)' }}
                      >
                         <Typography variant="h6" sx={{ color: '#818cf8', fontWeight: 950, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}><Storage sx={{ fontSize: 20 }} /> Algorithmic Insight</Typography>
                         <Typography sx={{ color: t.textSecondary, fontSize: '1rem', lineHeight: 1.7, fontWeight: 500, mb: 3 }}>{question.intuition.approach}</Typography>
                         <Stack direction="row" spacing={4}>
                            {question.intuition.timeComplexity && (
                                <Box>
                                    <Typography variant="caption" sx={{ color: t.textMuted, fontWeight: 900, display: 'block', mb: 0.5 }}>Time</Typography>
                                    <Typography sx={{ color: t.text, fontWeight: 800, fontFamily: 'monospace' }}>{question.intuition.timeComplexity}</Typography>
                                </Box>
                            )}
                            {question.intuition.spaceComplexity && (
                                <Box>
                                    <Typography variant="caption" sx={{ color: t.textMuted, fontWeight: 900, display: 'block', mb: 0.5 }}>Space</Typography>
                                    <Typography sx={{ color: t.text, fontWeight: 800, fontFamily: 'monospace' }}>{question.intuition.spaceComplexity}</Typography>
                                </Box>
                            )}
                         </Stack>
                      </MotionBox>
                   )}
                </MotionBox>
              )}
           </AnimatePresence>
        </Box>

        {/* Resizer Slider (Vertical Partition) */}
        <Box 
            onMouseDown={startResizing} 
            sx={{ 
                width: 4, cursor: 'col-resize', bgcolor: t.border, 
                zIndex: 100, transition: 'all 0.2s',
                '&:hover': { bgcolor: '#6366f1', boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)' } 
            }} 
        />

        {/* Right Pane (IDE & Output) */}
        <Box id="split-container" sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: t.codeBg }}>
           
            {/* ── IDE Workspace ── */}
            <Box sx={{ height: `${compilerSplit}%`, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ px: 3, height: 48, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: isDarkMode ? 'rgba(0,0,0,0.2)' : '#ffffff' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Code sx={{ fontSize: 18, color: '#6366f1' }} />
                        <Typography variant="button" sx={{ color: t.textSecondary, fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.1em' }}>Editor</Typography>
                        <Select 
                            size="small" 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)}
                            sx={{ color: t.text, fontWeight: 800, fontSize: '0.8rem', height: 28, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                        >
                            {Object.keys(langMeta).map(l => <MenuItem key={l} value={l}>{langMeta[l].label}</MenuItem>)}
                        </Select>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton size="small" onClick={() => setFontSize(Math.max(12, fontSize - 2))} sx={{ color: t.textMuted }}><Remove sx={{ fontSize: 16 }} /></IconButton>
                        <Typography variant="caption" sx={{ color: t.textSecondary, fontWeight: 900, minWidth: 24, textAlign: 'center' }}>{fontSize}</Typography>
                        <IconButton size="small" onClick={() => setFontSize(Math.min(30, fontSize + 2))} sx={{ color: t.textMuted }}><Add sx={{ fontSize: 16 }} /></IconButton>
                    </Stack>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Editor 
                        height="100%" 
                        language={language} 
                        theme={isDarkMode ? 'vs-dark' : 'light'} 
                        value={code} 
                        onChange={handleCodeChange} 
                        options={{ 
                            fontSize, 
                            minimap: { enabled: false }, 
                            fontFamily: "'JetBrains Mono', monospace",
                            padding: { top: 20 },
                            cursorBlinking: 'smooth',
                            smoothScrolling: true,
                            automaticLayout: true
                        }} 
                    />
                </Box>
            </Box>

           {/* Horizontal Partition Drag */}
           <Box 
                onMouseDown={startResizingVertical} 
                sx={{ 
                    height: 6, cursor: 'row-resize', bgcolor: t.border, 
                    zIndex: 50, '&:hover': { bgcolor: '#6366f1' } 
                }} 
           />

           {/* ── Output / Public Test Console ── */}
           <Box sx={{ flex: 1, bgcolor: t.testCaseBg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Tabs 
                value={currentTestCaseTab} 
                onChange={(e, v) => setCurrentTestCaseTab(v)} 
                sx={{ minHeight: 48, borderBottom: `1px solid ${t.border}`, px: 2 }}
              >
                 {question.testCases.filter(tc => tc.isPublic).map((_, i) => (
                    <Tab 
                        key={i} 
                        sx={{ minHeight: 48, fontWeight: 900, fontSize: '0.75rem', color: t.textMuted }} 
                        label={
                            <Stack direction="row" spacing={1} alignItems="center">
                                {testCaseResults[i]?.passed === true ? <CheckCircle sx={{ fontSize: 14, color: '#10b981' }} /> : testCaseResults[i]?.passed === false ? <Close sx={{ fontSize: 14, color: '#ef4444' }} /> : <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: t.border }} />}
                                <span>Case {i+1}</span>
                            </Stack>
                        } 
                    />
                 ))}
              </Tabs>
              
              <Box sx={{ flex: 1, p: 4, overflow: 'auto' }}>
                 {question.testCases.filter(tc => tc.isPublic)[currentTestCaseTab] && (
                    <Stack spacing={4}>
                        <Box>
                            <Typography sx={{ color: t.textMuted, fontSize: '0.7rem', fontWeight: 900, mb: 1.5, letterSpacing: '0.1em' }}>INPUT</Typography>
                            <Box sx={{ bgcolor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.02)', p: 2, borderRadius: '12px', border: `1px solid ${t.border}` }}>
                                <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", color: t.text }}>{question.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].input?.value || question.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].input}</Typography>
                            </Box>
                        </Box>
                        
                        <Box>
                            <Stack direction="row" justifyContent="space-between" mb={1.5}>
                                <Typography sx={{ color: t.textMuted, fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em' }}>CONSOLE OUTPUT</Typography>
                                {testCaseResults[currentTestCaseTab]?.loading && <CircularProgress size={14} sx={{ color: '#6366f1' }} />}
                            </Stack>
                            <Box sx={{ 
                                bgcolor: isDarkMode ? 'rgba(0,0,0,0.4)' : '#ffffff', 
                                p: 2, borderRadius: '12px', 
                                border: `2px solid`,
                                borderColor: testCaseResults[currentTestCaseTab]?.passed === true ? 'rgba(16, 185, 129, 0.4)' : testCaseResults[currentTestCaseTab]?.passed === false ? 'rgba(239, 68, 68, 0.4)' : t.border,
                                minHeight: 60, display: 'flex', alignItems: 'center'
                            }}>
                                <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", color: testCaseResults[currentTestCaseTab]?.passed === true ? '#10b981' : testCaseResults[currentTestCaseTab]?.passed === false ? '#ef4444' : t.text, whiteSpace: 'pre-wrap' }}>
                                    {testCaseResults[currentTestCaseTab]?.loading ? 'Remote kernel executing code...' : (testCaseResults[currentTestCaseTab]?.output || testCaseResults[currentTestCaseTab]?.error || 'Process finished.')}
                                </Typography>
                            </Box>
                        </Box>

                        <Box>
                            <Typography sx={{ color: t.textMuted, fontSize: '0.7rem', fontWeight: 900, mb: 1.5, letterSpacing: '0.1em' }}>EXPECTED</Typography>
                            <Box sx={{ bgcolor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.02)', p: 2, borderRadius: '12px', border: `1px solid ${t.border}` }}>
                                <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#818cf8' }}>{question.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].output?.value || question.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].output}</Typography>
                            </Box>
                        </Box>
                    </Stack>
                 )}
              </Box>
           </Box>
        </Box>
      </Box>
    </Box>
  );
}
