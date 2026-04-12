import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, IconButton, Tabs, Tab, 
  Select, MenuItem, CircularProgress, 
  Chip, Stack, Tooltip, Breadcrumbs, Link, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { 
  PlayArrow, CheckCircle, Close, Add, Remove, 
  Fullscreen, FullscreenExit, Description, Code, 
  Lightbulb, Check, EmojiEvents, Speed, SignalCellularAlt, Replay, Stars,
  KeyboardBackspace, History, InfoOutlined, WarningAmberRounded,
  CheckCircleTwoTone, ErrorTwoTone, Send, DeleteOutline, EditOutlined
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { submitCode } from 'services/pistonService';
import tenantConfig from 'config/tenantConfig';
import { useAuth } from 'contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion.create(Box);

const langMeta = {
  python: { label: 'Python', color: '#3572A5', id: 71, template: `# Write your Python code here\nprint("Hello ORCA!")\n` },
  cpp: { label: 'C++', color: '#f34b7d', id: 54, template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello ORCA!" << endl;\n    return 0;\n}` },
  java: { label: 'Java', color: '#b07219', id: 62, template: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello ORCA!");\n    }\n}` },
  c: { label: 'C', color: '#555555', id: 50, template: `#include <stdio.h>\n\nint main() {\n    printf("Hello ORCA!\\n");\n    return 0;\n}` },
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
  const [customTestCases, setCustomTestCases] = useState([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [submitStats, setSubmitStats] = useState({ runtime: 0, memory: 0, coinsEarned: 0 });
  const [leftWidth, setLeftWidth] = useState(40);
  const [compilerSplit, setCompilerSplit] = useState(65);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const editorSplitRef = useRef(null);

  const t = {
    bg: '#ffffff',
    bgSide: '#f8fbfc',
    border: '#eef2f6',
    text: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    headerBg: '#ffffff',
    accent: '#6366f1',
    accentLight: 'rgba(99, 102, 241, 0.05)',
    success: '#10b981',
    error: '#ef4444',
  };

  useEffect(() => {
    const init = async () => {
      try {
        const conf = await tenantConfig.load();
        setConfig(conf);
        await fetchQuestion(conf);
      } catch (err) { console.error('Init failed:', err); }
      finally { setLoading(false); }
    };
    init();
  }, [id, topic]);

  const fetchQuestion = async (conf) => {
    try {
      const apiBase = import.meta.env.DEV ? 'http://localhost:4000/api' : (conf?.apiEndpoint || 'https://backend.orcode.in/api');
      const endpoint = topic ? `programming-questions/question/${id}` : `assessment-questions/${id}`;
      const response = await fetch(`${apiBase}/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${user?.token}`, 'x-api-key': conf?.apiKey || '', 'x-tenant-id': conf?.tenantId || '' }
      });
      if (response.ok) {
        const data = await response.json();
        setQuestion(data);
        const savedCode = localStorage.getItem(`orca_code_${id}_${language}`);
        setCode(savedCode || langMeta[language].template);
      }
    } catch (err) { console.error('Fetch failed:', err); }
  };

  useEffect(() => {
    if (question) {
      const savedCode = localStorage.getItem(`orca_code_${id}_${language}`);
      setCode(savedCode || langMeta[language].template);
    }
  }, [language, question, id]);

  const handleCodeChange = (val) => {
    setCode(val);
    localStorage.setItem(`orca_code_${id}_${language}`, val);
  };

  const handleRun = async () => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    setTestCaseResults({});
    const publicTC = question.testCases.filter(tc => tc.isPublic);
    const allRunTC = [...publicTC, ...customTestCases];
    for (let i = 0; i < allRunTC.length; i++) {
      setTestCaseResults(prev => ({ ...prev, [i]: { loading: true } }));
      try {
        const result = await submitCode(code, langMeta[language].id, allRunTC[i].input?.value || allRunTC[i].input);
        const userOut = result.stdout?.trim() || '';
        const expected = (allRunTC[i].output?.value || allRunTC[i].output)?.toString().trim();
        const passed = userOut === expected && result.status.id === 3;
        setTestCaseResults(prev => ({ 
          ...prev, [i]: { loading: false, output: userOut, error: result.stderr || (result.status.id !== 3 ? 'Execution Failed' : null), passed } 
        }));
      } catch (err) { setTestCaseResults(prev => ({ ...prev, [i]: { loading: false, error: err.message, passed: false } })); }
    }
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowResults(true);
    setSubmitResults([]);
    const allTC = question.testCases;
    const currentResults = allTC.map((tc, i) => ({ index: i+1, status: 'Running', type: tc.isPublic ? 'Public' : 'Hidden', running: true }));
    setSubmitResults(currentResults);
    let totalCpuTime = 0, maxMemory = 0, failCount = 0;
    for (let i = 0; i < allTC.length; i++) {
       try {
         const result = await submitCode(code, langMeta[language].id, allTC[i].input?.value || allTC[i].input);
         const userOut = result.stdout?.trim() || '', expected = (allTC[i].output?.value || allTC[i].output)?.toString().trim();
         const passed = userOut === expected && result.status.id === 3;
         currentResults[i] = { ...currentResults[i], status: passed ? 'Passed' : 'Failed', passed, running: false };
         if (!passed) failCount++;
         totalCpuTime += (result.time || 0);
         maxMemory = Math.max(maxMemory, result.memory || 0);
       } catch (err) { currentResults[i] = { ...currentResults[i], status: 'Error', passed: false, running: false }; failCount++; }
       setSubmitResults([...currentResults]);
    }
    const finalStats = { runtime: totalCpuTime.toFixed(3), memory: (maxMemory / 1024).toFixed(2), coinsEarned: 0 };
    try {
      const apiUrl = import.meta.env.DEV ? 'http://localhost:4000/api' : (config?.apiEndpoint || 'https://backend.orcode.in/api');
      const response = await fetch(`${apiUrl}/practice-submissions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
        body: JSON.stringify({ questionId: id, topic: question.topic, code, language, status: failCount === 0 ? 'accepted' : 'wrong_answer', passedTests: allTC.length - failCount, totalTests: allTC.length, executionTime: totalCpuTime, memoryUsed: maxMemory })
      });
      const data = await response.json();
      if (data.success) finalStats.coinsEarned = data.coinsEarned || 0;
    } catch (err) { console.error('Save failed:', err); }
    setSubmitStats(finalStats);
    setIsSubmitting(false);
  };

  const startResizing = useCallback((e) => {
    const mm = (v) => { const nw = (v.clientX / window.innerWidth) * 100; if (nw > 20 && nw < 80) setLeftWidth(nw); };
    const stop = () => { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', stop); document.body.style.cursor = 'default'; };
    window.addEventListener('mousemove', mm); window.addEventListener('mouseup', stop); document.body.style.cursor = 'col-resize';
  }, []);

  const startVerticalResizing = useCallback((e) => {
    const mm = (v) => { if (!editorSplitRef.current) return; const rect = editorSplitRef.current.getBoundingClientRect(); const nh = ((v.clientY - rect.top) / rect.height) * 100; if (nh > 20 && nh < 90) setCompilerSplit(nh); };
    const stop = () => { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', stop); document.body.style.cursor = 'default'; };
    window.addEventListener('mousemove', mm); window.addEventListener('mouseup', stop); document.body.style.cursor = 'row-resize';
  }, []);

  const toggleFullscreen = () => { if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); } else { document.exitFullscreen(); setIsFullscreen(false); } };

  const handleSaveCustom = () => {
    if (editIndex !== null) {
      const updated = [...customTestCases];
      updated[editIndex] = { input: customInput, output: '??' };
      setCustomTestCases(updated);
    } else if (customTestCases.length < 4) {
      setCustomTestCases([...customTestCases, { input: customInput, output: '??' }]);
    }
    setCustomInput(''); setEditIndex(null); setShowAddCustom(false);
  };

  const handleDeleteCustom = (idx) => {
    const updated = customTestCases.filter((_, i) => i !== idx);
    setCustomTestCases(updated);
    if (currentTestCaseTab >= (question.testCases.filter(tc => tc.isPublic).length + updated.length)) setCurrentTestCaseTab(0);
  };

  const handleEditCustom = (idx) => {
    setEditIndex(idx);
    setCustomInput(customTestCases[idx].input);
    setShowAddCustom(true);
  };

  if (loading) return <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: t.bg }}><Stack spacing={3} alignItems="center"><CircularProgress thickness={5} size={60} sx={{ color: t.accent }} /><Typography sx={{ color: t.textSecondary, fontWeight: 700, letterSpacing: '0.1em' }} variant="overline">ORCA INITIALIZING...</Typography></Stack></Box>;

  const passedCount = submitResults.filter(r => r.passed).length;
  const isAllPassed = passedCount === submitResults.length && submitResults.length > 0 && !isSubmitting;
  const publicTC = question.testCases.filter(tc => tc.isPublic);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: t.bg, overflow: 'hidden', color: t.text }}>
      <Box sx={{ height: 56, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${t.border}`, zIndex: 1100, background: t.headerBg, position: 'relative' }}>
        <Stack direction="row" spacing={2} alignItems="center"><IconButton onClick={() => navigate(-1)} size="small" sx={{ color: t.textMuted }}><KeyboardBackspace /></IconButton><Breadcrumbs separator={<Typography sx={{ color: t.textMuted, fontSize: '0.7rem' }}>/</Typography>}><Link component="button" variant="body2" onClick={() => navigate('/practice/programming')} sx={{ color: t.textMuted, textDecoration: 'none', fontWeight: 600, fontSize: '0.75rem' }}>Practice</Link><Typography variant="body2" sx={{ color: t.text, fontWeight: 800, fontSize: '0.8rem' }}>{question.title}</Typography></Breadcrumbs></Stack>
        <Stack direction="row" spacing={1} alignItems="center"><Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}><IconButton onClick={toggleFullscreen} sx={{ color: t.textMuted }}>{isFullscreen ? <FullscreenExit size={20} /> : <Fullscreen size={20} />}</IconButton></Tooltip></Stack>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        <Box sx={{ width: `${leftWidth}%`, height: '100%', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${t.border}`, bgcolor: t.bgSide }}>
          <Box sx={{ borderBottom: `1px solid ${t.border}`, px: 2 }}><Tabs value={showResults ? 1 : 0} onChange={(_, v) => setShowResults(v === 1)} sx={{ minHeight: 48, '& .MuiTab-root': { fontWeight: 800, fontSize: '0.75rem', minHeight: 48 } }}><Tab label="Problem" icon={<Description sx={{ fontSize: 16 }} />} iconPosition="start" /><Tab label="Submissions" icon={<History sx={{ fontSize: 16 }} />} iconPosition="start" disabled={submitResults.length === 0 && !isSubmitting} /></Tabs></Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            <AnimatePresence mode="wait">
              {!showResults ? (
                <MotionBox key="desc" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}><Typography variant="h2" sx={{ fontWeight: 900, fontSize: '1.8rem', mb: 2, letterSpacing: '-0.03em' }}>{question.title}</Typography><Stack direction="row" spacing={1} mb={4}><Chip label={question.difficulty} size="small" sx={{ fontWeight: 800, fontSize: '0.7rem', color: t.success, bgcolor: `${t.success}15`, borderRadius: '6px' }} /><Chip label={topic} size="small" sx={{ fontWeight: 800, fontSize: '0.7rem', color: t.accent, bgcolor: `${t.accent}15`, borderRadius: '6px' }} /></Stack><Box sx={{ mb: 5 }}><Typography sx={{ fontWeight: 900, fontSize: '0.75rem', color: t.textMuted, mb: 2 }}>DESCRIPTION</Typography><Box sx={{ color: t.textSecondary, fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.7, '& *': { color: 'inherit !important' }, '& p': { mb: 2 } }}><div dangerouslySetInnerHTML={{ __html: question.description || question.problemStatement }} /></Box></Box>{question.example && (<Box sx={{ mb: 5 }}><Typography sx={{ fontWeight: 900, fontSize: '0.75rem', color: t.textMuted, mb: 2 }}>EXAMPLE</Typography><Box sx={{ bgcolor: t.bg, p: 3, borderRadius: '20px', border: `1px solid ${t.border}` }}><Stack spacing={2}><Box><Typography variant="overline" sx={{ color: t.textMuted, fontWeight: 900 }}>Input</Typography><Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: t.accent, whiteSpace: 'pre-wrap' }}>{question.example.input?.split('\\n').join('\n')}</Typography></Box><Box><Typography variant="overline" sx={{ color: t.textMuted, fontWeight: 900 }}>Output</Typography><Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: t.success, whiteSpace: 'pre-wrap' }}>{question.example.output?.split('\\n').join('\n')}</Typography></Box>{question.example.explanation && (<Box sx={{ pt: 1, borderTop: `1px dashed ${t.border}` }}><Typography sx={{ fontSize: '0.9rem', color: t.textSecondary }}>{question.example.explanation}</Typography></Box>)}</Stack></Box></Box>)}{question.constraints && (<Box sx={{ mb: 5 }}><Typography sx={{ fontWeight: 900, fontSize: '0.75rem', color: t.textMuted, mb: 2 }}>CONSTRAINTS</Typography><Stack spacing={1}>{(Array.isArray(question.constraints) ? question.constraints : [question.constraints]).map((c, i) => (<Typography key={i} sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '0.85rem', color: '#f97316' }}>• {c}</Typography>))}</Stack></Box>)}</MotionBox>
              ) : (
                <MotionBox key="results" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}><Typography variant="h3" sx={{ fontWeight: 950, color: isSubmitting ? t.text : (isAllPassed ? t.success : t.error), mb: 3 }}>{isSubmitting ? 'VERIFYING...' : (isAllPassed ? 'ACCEPTED' : 'WRONG ANSWER')}</Typography><Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 4 }}><Box sx={{ p: 2, bgcolor: t.bg, borderRadius: '16px', border: `1px solid ${t.border}`, textAlign: 'center' }}><Typography variant="overline" sx={{ color: t.textMuted, fontWeight: 800 }}>Runtime</Typography><Typography sx={{ fontWeight: 900 }}>{isSubmitting ? '...' : `${submitStats.runtime}s`}</Typography></Box><Box sx={{ p: 2, bgcolor: t.bg, borderRadius: '16px', border: `1px solid ${t.border}`, textAlign: 'center' }}><Typography variant="overline" sx={{ color: t.textMuted, fontWeight: 800 }}>Memory</Typography><Typography sx={{ fontWeight: 900 }}>{isSubmitting ? '...' : `${submitStats.memory}MB`}</Typography></Box></Box><Stack spacing={1.5}>{submitResults.map((r, i) => (<Box key={i} sx={{ p: 2, borderRadius: '16px', bgcolor: r.running ? `${t.accent}05` : (r.passed ? `${t.success}05` : `${t.error}05`), border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><Stack direction="row" spacing={2} alignItems="center">{r.running ? <CircularProgress size={16} thickness={6} sx={{ color: t.accent }} /> : (r.passed ? <CheckCircleTwoTone sx={{ color: t.success }} /> : <ErrorTwoTone sx={{ color: t.error }} />)}<Typography sx={{ fontWeight: 800 }}>Case {r.index}</Typography></Stack><Chip label={r.status} size="small" /></Box>))}</Stack>{!isSubmitting && isAllPassed && (<Box sx={{ mt: 5, p: 3, borderRadius: '24px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', textAlign: 'center', color: '#fff' }}><EmojiEvents sx={{ fontSize: 40, mb: 1 }} /><Typography sx={{ fontWeight: 900, mb: 0.5 }}>SOLVED! ✨</Typography><Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>You earned +{submitStats.coinsEarned} Coins</Typography></Box>)}</MotionBox>
              )}
            </AnimatePresence>
          </Box>
        </Box>

        <Box onMouseDown={startResizing} sx={{ width: 4, cursor: 'col-resize', bgcolor: t.border, '&:hover': { bgcolor: t.accent } }} />

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: t.bg }} ref={editorSplitRef}>
          <Box sx={{ height: 48, px: 2, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={2}><Select value={language} onChange={(e) => setLanguage(e.target.value)} size="small" sx={{ height: 32, fontWeight: 900, fontSize: '0.75rem', '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}>{Object.entries(langMeta).map(([k, v]) => <MenuItem key={k} value={k} sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{v.label}</MenuItem>)}</Select><Stack direction="row" alignItems="center" spacing={1}><IconButton size="small" onClick={() => setFontSize(fontSize - 2)}><Remove sx={{ fontSize: 14 }} /></IconButton><Typography sx={{ fontWeight: 800, fontSize: '0.75rem' }}>{fontSize}</Typography><IconButton size="small" onClick={() => setFontSize(fontSize + 2)}><Add sx={{ fontSize: 14 }} /></IconButton></Stack></Stack>
            <Stack direction="row" spacing={1.5}><Button variant="outlined" startIcon={isRunning ? <CircularProgress size={14} /> : <PlayArrow />} onClick={handleRun} disabled={isRunning} sx={{ height: 32, textTransform: 'none', fontWeight: 800 }}>Run</Button><Button variant="contained" onClick={handleSubmit} disabled={isSubmitting} sx={{ height: 32, textTransform: 'none', fontWeight: 900, bgcolor: t.accent }}>Submit</Button></Stack>
          </Box>

          <Box sx={{ height: `${compilerSplit}%` }}><Editor height="100%" language={language} theme="light" value={code} onChange={handleCodeChange} options={{ fontSize, minimap: { enabled: false }, padding: { top: 20 }, fontFamily: "'JetBrains Mono', monospace" }} /></Box>

          <Box onMouseDown={startVerticalResizing} sx={{ height: 4, cursor: 'row-resize', bgcolor: t.border, '&:hover': { bgcolor: t.accent } }} />

          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer starts with Horizontal Tabs on Top */}
            <Box sx={{ borderBottom: `1px solid ${t.border}`, px: 1, background: t.bgSide, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" sx={{ overflow: 'auto', py: 1 }} spacing={1}>
                 {/* Public Case Tabs */}
                 {publicTC.map((tc, i) => {
                   const res = testCaseResults[i];
                   const isActive = currentTestCaseTab === i;
                   const statusColor = res?.passed === true ? t.success : res?.passed === false ? t.error : 'transparent';
                   return (
                    <Box 
                      key={i} 
                      onClick={() => setCurrentTestCaseTab(i)}
                      sx={{ 
                        px: 2, py: 0.8, cursor: 'pointer', borderRadius: '8px', border: `1px solid`,
                        borderColor: statusColor !== 'transparent' ? statusColor : (isActive ? t.accent : t.border),
                        bgcolor: isActive ? (statusColor !== 'transparent' ? `${statusColor}10` : t.accentLight) : (statusColor !== 'transparent' ? `${statusColor}05` : 'transparent'),
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 1, minWidth: 'max-content'
                      }}
                    >
                      {res?.passed === true && <Check sx={{ fontSize: 14, color: t.success }} />}
                      {res?.passed === false && <Close sx={{ fontSize: 14, color: t.error }} />}
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: statusColor !== 'transparent' ? statusColor : (isActive ? t.accent : t.textMuted) }}>Case {i+1}</Typography>
                    </Box>
                   );
                 })}
                 {/* Custom Case Tabs */}
                 {customTestCases.map((tc, ci) => {
                   const i = publicTC.length + ci;
                   const res = testCaseResults[i];
                   const isActive = currentTestCaseTab === i;
                   const statusColor = res?.passed === true ? t.success : res?.passed === false ? t.error : 'transparent';
                   return (
                    <Box 
                      key={`c-${ci}`} 
                      onClick={() => setCurrentTestCaseTab(i)}
                      sx={{ 
                        px: 2, py: 0.8, cursor: 'pointer', borderRadius: '8px', border: `1px solid`,
                        borderColor: statusColor !== 'transparent' ? statusColor : (isActive ? t.accent : t.border),
                        bgcolor: isActive ? (statusColor !== 'transparent' ? `${statusColor}10` : t.accentLight) : (statusColor !== 'transparent' ? `${statusColor}05` : 'transparent'),
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 1, minWidth: 'max-content'
                      }}
                    >
                      {res?.passed === true && <Check sx={{ fontSize: 14, color: t.success }} />}
                      {res?.passed === false && <Close sx={{ fontSize: 14, color: t.error }} />}
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: statusColor !== 'transparent' ? statusColor : (isActive ? t.accent : t.textMuted) }}>Custom {ci+1}</Typography>
                      <Stack direction="row" sx={{ ml: 1 }}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditCustom(ci); }} sx={{ p: 0.2, color: isActive ? t.accent : t.textMuted }}><EditOutlined sx={{ fontSize: 12 }} /></IconButton>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteCustom(ci); }} sx={{ p: 0.2, color: t.error }}><DeleteOutline sx={{ fontSize: 12 }} /></IconButton>
                      </Stack>
                    </Box>
                   );
                 })}
              </Stack>
              <Button onClick={() => { setEditIndex(null); setCustomInput(''); setShowAddCustom(true); }} disabled={customTestCases.length >= 4} size="small" startIcon={<Add />} sx={{ ml: 1, height: 32, fontSize: '0.7rem', fontWeight: 900, bgcolor: 'transparent', color: t.accent }}>Add Case ({customTestCases.length}/4)</Button>
            </Box>

            <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
                {(() => {
                  const allTC = [...publicTC, ...customTestCases];
                  const activeTC = allTC[currentTestCaseTab];
                  if (!activeTC) return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: t.textMuted }}><Typography sx={{ fontWeight: 700 }}>Choose a case to analyze</Typography></Box>;
                  const activeRes = testCaseResults[currentTestCaseTab];
                  return (
                    <Stack spacing={3}>
                      <Box><Typography variant="overline" sx={{ fontWeight: 900, color: t.textMuted, fontSize: '0.65rem' }}>INPUT</Typography><Box sx={{ p: 2, bgcolor: t.bgSide, border: `1px solid ${t.border}`, borderRadius: '12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{(activeTC.input?.value || activeTC.input)?.split('\\n').join('\n')}</Box></Box>
                      {activeRes && (<Box><Typography variant="overline" sx={{ fontWeight: 900, color: activeRes.passed ? t.success : t.error, fontSize: '0.65rem' }}>YOUR OUTPUT</Typography><Box sx={{ p: 2, bgcolor: activeRes.passed ? `${t.success}05` : `${t.error}05`, border: `1px solid ${activeRes.passed ? t.success : t.error}30`, borderRadius: '12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{activeRes.output || activeRes.error}</Box></Box>)}
                      {currentTestCaseTab < publicTC.length && (<Box><Typography variant="overline" sx={{ fontWeight: 900, color: t.textMuted, fontSize: '0.65rem' }}>EXPECTED OUTPUT</Typography><Box sx={{ p: 2, bgcolor: t.bgSide, border: `1px solid ${t.border}`, borderRadius: '12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{(activeTC.output?.value || activeTC.output)?.split('\\n').join('\n')}</Box></Box>)}
                    </Stack>
                  );
                })()}
            </Box>
          </Box>
        </Box>
      </Box>

      <Dialog open={showAddCustom} onClose={() => setShowAddCustom(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}><DialogTitle sx={{ fontWeight: 900, fontSize: '1.4rem' }}>{editIndex !== null ? 'Modify Custom Case' : 'New Custom Case'}</DialogTitle><DialogContent><Typography variant="body2" sx={{ color: t.textMuted, mb: 2, fontWeight: 700 }}>Type your input exactly as expected by the program.</Typography><TextField fullWidth multiline rows={8} value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="e.g.\\n10\\n3.14\\nTrue" sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: t.bgSide, fontFamily: "'JetBrains Mono', monospace", p: 2 } }} /></DialogContent><DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setShowAddCustom(false)} sx={{ fontWeight: 700, color: t.textMuted }}>Cancel</Button><Button variant="contained" onClick={handleSaveCustom} sx={{ bgcolor: t.accent, borderRadius: '12px', fontWeight: 900 }}>{editIndex !== null ? 'Update' : 'Commit'}</Button></DialogActions></Dialog>
    </Box>
  );
}
