import { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Button, IconButton, TextField, Chip,
  CircularProgress, Tooltip, Paper, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, Fade
} from '@mui/material';
import {
  PlayArrow, Add, Delete, AutoAwesome, KeyboardArrowUp,
  KeyboardArrowDown, Stop, CheckCircle, RadioButtonUnchecked,
  Science, MenuBook, ArrowBack, Fullscreen, FullscreenExit
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import tenantConfig from 'config/tenantConfig';

// --- Helpers ---

const diffColor = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };
const diffBg   = { easy: 'rgba(16,185,129,0.08)', medium: 'rgba(245,158,11,0.08)', hard: 'rgba(239,68,68,0.08)' };

function parseTestResults(stdout) {
  const lines = (stdout || '').split('\n');
  const results = [];
  for (const line of lines) {
    const m = line.match(/^(test_\w+)(?:\s+\(.*?\))?\s+\.\.\.\s+(ok|FAIL|ERROR)/);
    if (m) results.push({ name: m[1], passed: m[2] === 'ok', status: m[2] });
  }
  // Check overall result from unittest summary line
  const overallOk = /^OK$/m.test(stdout || '');
  const overallFail = /^FAILED/m.test(stdout || '');
  return { results, overallOk, overallFail };
}

function SimpleMarkdown({ text }) {
  if (!text) return null;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {text.split('\n').map((line, i) => {
        if (line.startsWith('## ')) {
          return <Typography key={i} sx={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b', mt: 1 }}>{line.slice(3)}</Typography>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <Typography key={i} sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.875rem' }}>{line.slice(2, -2)}</Typography>;
        }
        if (line.startsWith('- ')) {
          const content = line.slice(2);
          return (
            <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#6366f1', mt: '7px', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                {renderInline(content)}
              </Typography>
            </Box>
          );
        }
        if (line.trim() === '') return <Box key={i} sx={{ height: 4 }} />;
        return <Typography key={i} sx={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>{renderInline(line)}</Typography>;
      })}
    </Box>
  );
}

function renderInline(text) {
  const parts = text.split(/(`[^`]+`)|(\*\*[^*]+\*\*)/);
  return parts.map((p, i) => {
    if (!p) return null;
    if (p.startsWith('`') && p.endsWith('`'))
      return <Box key={i} component="span" sx={{ fontFamily: 'monospace', bgcolor: '#f1f5f9', px: 0.6, py: 0.1, borderRadius: '4px', fontSize: '0.82rem', color: '#6366f1' }}>{p.slice(1, -1)}</Box>;
    if (p.startsWith('**') && p.endsWith('**'))
      return <Box key={i} component="span" sx={{ fontWeight: 700, color: '#1e293b' }}>{p.slice(2, -2)}</Box>;
    return p;
  });
}

const getApiBase = () => {
  const config = tenantConfig.get();
  return import.meta.env.DEV
    ? 'http://localhost:4000/api'
    : (config?.apiEndpoint || 'https://backend.orcode.in/api');
};

const LightBackground = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#fbfcfe' }} />
    <Box sx={{ position: 'absolute', top: '-10%', right: '-5%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)' }} />
    <Box sx={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(100px)' }} />
  </Box>
);

const DEFAULT_CELLS = [
  { id: 1, code: '', output: null, running: false, executionCount: null }
];

let cellIdCounter = 3;

// Stable session ID persisted across reloads (reuses same sandbox)
const SESSION_ID = (() => {
  let id = localStorage.getItem('genai_session_id');
  if (!id) {
    id = `genai_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('genai_session_id', id);
  }
  return id;
})();

function loadSavedCells() {
  try {
    const saved = localStorage.getItem('genai_notebook_cells');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Reset runtime state, keep code
        const maxId = Math.max(...parsed.map(c => c.id), 2);
        cellIdCounter = maxId + 1;
        return parsed.map(c => ({ ...c, output: null, running: false, executionCount: null }));
      }
    }
  } catch {}
  return DEFAULT_CELLS;
}

export default function GenAIPlayground() {
  const [cells, setCells] = useState(loadSavedCells);
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('genai_gemini_key') || '');
  const [hfKey, setHfKey] = useState(() => localStorage.getItem('genai_hf_key') || '');
  const [execCounter, setExecCounter] = useState(0);
  const [runningAll, setRunningAll] = useState(false);
  const [sandboxStatus, setSandboxStatus] = useState('idle');
  const [mode, setMode] = useState('notebook'); // 'notebook' | 'practice'
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [practiceCode, setPracticeCode] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null); // { stdout, stderr, success, tests, allPassed }
  const [solvedIds, setSolvedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('genai_solved') || '[]'); } catch { return []; }
  });
  const [showResultsModal, setShowResultsModal] = useState(false);
  const execCountRef = useRef(0);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(40);
  const isResizing = useRef(false);

  const startResizing = (e) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    let newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth);
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => { if (geminiKey) localStorage.setItem('genai_gemini_key', geminiKey); }, [geminiKey]);
  useEffect(() => { if (hfKey) localStorage.setItem('genai_hf_key', hfKey); }, [hfKey]);

  // Persist notebook cells to localStorage
  useEffect(() => {
    const toSave = cells.map(c => ({ id: c.id, code: c.code }));
    localStorage.setItem('genai_notebook_cells', JSON.stringify(toSave));
  }, [cells]);

  // Fetch questions when switching to practice mode
  useEffect(() => {
    if (mode !== 'practice' || questions.length > 0) return;
    setQuestionsLoading(true);
    fetch(`${getApiBase()}/genai-questions`, {
      headers: { 'Content-Type': 'application/json', 'x-api-key': tenantConfig.get()?.apiKey || '' }
    })
      .then(r => r.json())
      .then(data => { 
        const questionList = Array.isArray(data) ? data : [];
        setQuestions(questionList); 
        setQuestionsLoading(false);
        if (questionList.length > 0 && !selectedQuestion) {
          selectQuestion(questionList[0]);
        }
      })
      .catch(() => setQuestionsLoading(false));
  }, [mode, questions.length, selectedQuestion]);

  const selectQuestion = (q) => {
    setSelectedQuestion(q);
    // Restore saved code for this question, or use starter code
    const savedCode = localStorage.getItem(`genai_practice_${q._id}`);
    setPracticeCode(savedCode !== null ? savedCode : (q.starterCode || ''));
    setEvalResult(null);
  };

  // Persist practice code per question
  useEffect(() => {
    if (selectedQuestion && practiceCode !== undefined) {
      localStorage.setItem(`genai_practice_${selectedQuestion._id}`, practiceCode);
    }
  }, [practiceCode, selectedQuestion]);

  // Kill sandbox on unmount
  useEffect(() => {
    return () => {
      fetch(`${getApiBase()}/e2b/kill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: SESSION_ID })
      }).catch(() => {});
    };
  }, []);

  const runCell = async (cellId) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell || cell.running) return;

    setCells(prev => prev.map(c => c.id === cellId ? { ...c, running: true, output: null } : c));
    setSandboxStatus('starting');

    try {
      const envVars = {};
      if (geminiKey) envVars['GOOGLE_API_KEY'] = geminiKey;
      if (hfKey) envVars['HF_TOKEN'] = hfKey;

      const res = await fetch(`${getApiBase()}/e2b/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cell.code, sessionId: SESSION_ID, envVars })
      });
      setSandboxStatus('ready');

      const data = await res.json();
      execCountRef.current += 1;
      const count = execCountRef.current;
      setExecCounter(count);

      setCells(prev => prev.map(c => c.id === cellId
        ? { ...c, output: { stdout: data.stdout || '', stderr: data.stderr || '', success: data.success }, executionCount: count, running: false }
        : c
      ));
    } catch (err) {
      setSandboxStatus('error');
      setCells(prev => prev.map(c => c.id === cellId
        ? { ...c, output: { stdout: '', stderr: err.message, success: false }, running: false }
        : c
      ));
    }
  };

  const runAll = async () => {
    setRunningAll(true);
    for (const cell of cells) await runCell(cell.id);
    setRunningAll(false);
  };

  const killSandbox = async () => {
    await fetch(`${getApiBase()}/e2b/kill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID })
    }).catch(() => {});
    setSandboxStatus('idle');
  };

  const addCell = (afterId) => {
    const newCell = { id: cellIdCounter++, code: '# New cell\n', output: null, running: false, executionCount: null };
    setCells(prev => {
      const idx = prev.findIndex(c => c.id === afterId);
      const next = [...prev];
      next.splice(idx + 1, 0, newCell);
      return next;
    });
  };

  const deleteCell = (id) => setCells(prev => prev.length > 1 ? prev.filter(c => c.id !== id) : prev);

  const moveCell = (id, dir) => {
    setCells(prev => {
      const idx = prev.findIndex(c => c.id === id);
      const next = [...prev];
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const updateCode = (id, value) => setCells(prev => prev.map(c => c.id === id ? { ...c, code: value || '' } : c));

  const evaluateCode = async () => {
    if (!selectedQuestion || evaluating) return;
    setEvaluating(true);
    setEvalResult(null);
    setSandboxStatus('starting');
    try {
      const envVars = {};
      if (geminiKey) envVars['GOOGLE_API_KEY'] = geminiKey;
      if (hfKey) envVars['HF_TOKEN'] = hfKey;

      const res = await fetch(`${getApiBase()}/e2b/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: practiceCode,
          questionId: selectedQuestion._id,
          sessionId: SESSION_ID,
          envVars: envVars
        })
      });
      const data = await res.json();
      setSandboxStatus('ready');

      const combinedOutput = (data.stdout || '') + '\n' + (data.stderr || '');
      const { results: parsedTests, overallOk } = parseTestResults(combinedOutput);
      const allPassed = overallOk && parsedTests.length > 0;

      if (allPassed) {
        setSolvedIds(prev => {
          const next = prev.includes(selectedQuestion._id) ? prev : [...prev, selectedQuestion._id];
          localStorage.setItem('genai_solved', JSON.stringify(next));
          return next;
        });
      }

      setEvalResult({ ...data, parsedTests, allPassed });
      setShowResultsModal(true);
    } catch (err) {
      setSandboxStatus('error');
      setEvalResult({ success: false, stderr: err.message, parsedTests: [], allPassed: false });
      setShowResultsModal(true);
    } finally {
      setEvaluating(false);
    }
  };

  const sandboxColor = { idle: '#94a3b8', starting: '#f59e0b', ready: '#10b981', error: '#ef4444' };
  const sandboxLabel = { idle: 'Sandbox local', starting: 'Starting...', ready: 'Sandbox ready', error: 'Error' };

  return (
    <Box ref={containerRef} sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fbfcfe', position: 'relative', overflow: 'hidden' }}>
      <LightBackground />
      
      {/* Header */}
      <Box sx={{ 
        p: 2.5, 
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 3, 
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        position: 'relative'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/assessments')} sx={{ color: '#64748b', bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', lineHeight: 1.2 }}>
              GenAI {mode === 'notebook' ? 'Notebook' : 'Practice'}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>AI Sandbox Platform</Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ p: 0.5, bgcolor: '#f1f5f9', borderRadius: '14px', display: 'flex', gap: 0.5 }}>
            <Button
              size="small"
              startIcon={<AutoAwesome sx={{ fontSize: 16 }} />}
              onClick={() => setMode('notebook')}
              sx={{
                px: 3, py: 1, borderRadius: '10px',
                bgcolor: mode === 'notebook' ? '#fff' : 'transparent',
                color: mode === 'notebook' ? '#6366f1' : '#64748b',
                boxShadow: mode === 'notebook' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                textTransform: 'none', fontWeight: 800, fontSize: '0.85rem'
              }}
            >
              Notebook
            </Button>
            <Button
              size="small"
              startIcon={<Science sx={{ fontSize: 16 }} />}
              onClick={() => setMode('practice')}
              sx={{
                px: 3, py: 1, borderRadius: '10px',
                bgcolor: mode === 'practice' ? '#fff' : 'transparent',
                color: mode === 'practice' ? '#6366f1' : '#64748b',
                boxShadow: mode === 'practice' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                textTransform: 'none', fontWeight: 800, fontSize: '0.85rem'
              }}
            >
              Practice
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: sandboxColor[sandboxStatus] }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>{sandboxLabel[sandboxStatus]}</Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <TextField
            size="small" type="password" placeholder="Gemini Key"
            value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)}
            sx={{ width: 140, '& .MuiInputBase-root': { bgcolor: '#fff', fontSize: '0.8rem', borderRadius: '10px' } }}
          />
          <IconButton onClick={toggleFullscreen} sx={{ color: '#64748b', bgcolor: '#f1f5f9' }}>
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ 
        display: mode === 'notebook' ? 'block' : 'grid', 
        gridTemplateColumns: mode === 'notebook' ? '1fr' : `${leftWidth}% 4px 1fr`, 
        flexGrow: 1, overflow: 'hidden', position: 'relative', zIndex: 10 
      }}>
        
        {/* Panel Content (Notebook or Practice Left) */}
        <Box sx={{ 
          overflowY: 'auto', height: '100%', 
          bgcolor: mode === 'notebook' ? 'transparent' : '#fff', 
          borderRight: mode === 'notebook' ? 'none' : '1px solid #e2e8f0', 
          p: mode === 'notebook' ? 3 : 0 
        }}>
          {mode === 'notebook' ? (
            <Box sx={{ maxWidth: 900, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ 
                display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 1, 
                position: 'sticky', top: 0, zIndex: 10, bgcolor: 'rgba(251, 252, 254, 0.9)', 
                backdropFilter: 'blur(8px)', pb: 1, pt: 1
              }}>
                <Button 
                  startIcon={<Add />} onClick={() => addCell(cells[cells.length - 1].id)}
                  sx={{ color: '#6366f1', fontWeight: 800, textTransform: 'none', bgcolor: '#fff', borderRadius: '12px', px: 2.5, border: '1px dashed rgba(99,102,241,0.3)' }}
                >Add Cell</Button>
                <Button 
                  startIcon={<PlayArrow />} onClick={runAll} disabled={runningAll}
                  sx={{ bgcolor: '#6366f1', color: '#fff', fontWeight: 800, borderRadius: '12px', px: 3, '&:hover': { bgcolor: '#4f46e5' } }}
                >Run All</Button>
              </Box>
              {cells.map((cell, idx) => (
                <Box key={cell.id}>
                  <Paper elevation={0} sx={{ 
                    borderRadius: '20px', border: '1px solid', borderColor: cell.running ? '#6366f1' : '#f1f5f9', bgcolor: '#fff',
                    boxShadow: '0 4px 20px rgba(15,23,42,0.03)', overflow: 'hidden'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, bgcolor: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8' }}>[{cell.executionCount || ' '}]</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Cell {idx + 1}</Typography>
                      <Box sx={{ flex: 1 }} />
                      <IconButton size="small" onClick={() => moveCell(cell.id, 'up')} disabled={idx === 0}><KeyboardArrowUp sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" onClick={() => moveCell(cell.id, 'down')} disabled={idx === cells.length - 1}><KeyboardArrowDown sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" onClick={() => deleteCell(cell.id)} disabled={cells.length === 1}><Delete sx={{ fontSize: 16 }} /></IconButton>
                      <Button size="small" startIcon={<PlayArrow />} onClick={() => runCell(cell.id)} disabled={cell.running} sx={{ ml: 1, bgcolor: '#6366f1', color: '#fff', borderRadius: '8px', fontSize: '0.7rem' }}>Run</Button>
                    </Box>
                    <Editor 
                      height={Math.max(60, (cell.code.split('\n').length || 1) * 20 + 20)}
                      language="python" value={cell.code} theme="light"
                      onChange={(v) => updateCode(cell.id, v)}
                      options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', lineNumbers: 'on', automaticLayout: true }}
                    />
                    {cell.output && (
                      <Box sx={{ p: 2, bgcolor: cell.output.success ? '#fafafa' : '#fff8f8', borderTop: '1px solid #f1f5f9' }}>
                        {cell.output.stdout && <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{cell.output.stdout}</Box>}
                        {cell.output.stderr && <Box sx={{ p: 1.5, bgcolor: '#fff8f8', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#ef4444', mt: 1 }}>{cell.output.stderr}</Box>}
                      </Box>
                    )}
                  </Paper>
                </Box>
              ))}
            </Box>
          ) : (
            <>
              {/* Practice Questions Row */}
              <Box sx={{ 
                p: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 1.25, 
                bgcolor: 'rgba(250, 250, 250, 0.95)', backdropFilter: 'blur(8px)',
                overflowX: 'auto', position: 'sticky', top: 0, zIndex: 10 
              }}>
                {questionsLoading ? <Box sx={{ p: 2 }}>Loading...</Box> : 
                  questions.map((q, idx) => {
                    const active = selectedQuestion?._id === q._id;
                    const solved = solvedIds.includes(q._id);
                    return (
                      <Box key={q._id} onClick={() => selectQuestion(q)} sx={{
                        width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontWeight: 900, fontSize: '1rem', flexShrink: 0,
                        bgcolor: active ? '#6366f1' : '#fff', color: active ? '#fff' : '#64748b',
                        border: '2px solid', borderColor: active ? '#6366f1' : '#e2e8f0',
                        position: 'relative', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', borderColor: '#6366f1' }
                      }}>
                        {idx + 1}
                        {solved && <CheckCircle sx={{ position: 'absolute', top: -5, right: -5, fontSize: 14, color: '#10b981', bgcolor: '#fff', borderRadius: '50%' }} />}
                      </Box>
                    );
                  })
                }
                {isFullscreen && (
                  <IconButton onClick={toggleFullscreen} sx={{ ml: 'auto', color: '#64748b' }}>
                    <FullscreenExit />
                  </IconButton>
                )}
              </Box>

              {/* Question Detail */}
              {selectedQuestion ? (
                <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5, color: '#1e293b' }}>{selectedQuestion.title}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
                    <Chip label={selectedQuestion.difficulty} size="small" sx={{ fontWeight: 800, bgcolor: diffBg[selectedQuestion.difficulty], color: diffColor[selectedQuestion.difficulty] }} />
                    {selectedQuestion.requiredLibraries?.map(l => <Chip key={l} label={l} size="small" sx={{ fontWeight: 700 }} />)}
                  </Box>
                  <Typography sx={{ fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.1em', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
                    Problem Statement
                  </Typography>
                  <SimpleMarkdown text={selectedQuestion.problemStatement} />
                </Box>
              ) : (
                <Box sx={{ p: 10, textAlign: 'center' }}>
                  <Science sx={{ fontSize: 64, color: '#e2e8f0', mb: 2 }} />
                  <Typography sx={{ color: '#94a3b8', fontWeight: 600 }}>Select a question to view statement</Typography>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Practice-only Split Elements */}
        {mode === 'practice' && (
          <>
            {/* Resizer */}
            <Box 
              onMouseDown={startResizing}
              sx={{ width: '4px', bgcolor: '#f1f5f9', cursor: 'col-resize', zIndex: 100, transition: 'background 0.2s', '&:hover': { bgcolor: '#6366f1' } }} 
            />

            {/* Right Panel: Editor Area */}
            <Box sx={{ bgcolor: '#fff', height: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              {selectedQuestion ? (
                <>
                  <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fafafa' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>Solution Editor</Typography>
                      {evalResult && (
                        <Button 
                          size="small" 
                          onClick={() => setShowResultsModal(true)}
                          sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.75rem', color: '#6366f1' }}
                        >View Last Result</Button>
                      )}
                    </Box>
                    <Button 
                      startIcon={evaluating ? <CircularProgress size={14} color="inherit" /> : <PlayArrow />} 
                      onClick={evaluateCode} disabled={evaluating}
                      sx={{ bgcolor: '#6366f1', color: '#fff', fontWeight: 800, borderRadius: '10px', px: 3, '&:hover': { bgcolor: '#4f46e5' } }}
                    >Evaluate Solution</Button>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Editor 
                      height="100%" language="python" value={practiceCode} theme="light"
                      onChange={(v) => setPracticeCode(v || '')}
                      options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true, padding: { top: 20 } }}
                    />
                  </Box>
                </>
              ) : (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Typography sx={{ color: '#94a3b8' }}>Select a challenge to begin</Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>

      {/* Evaluation Results Modal */}
      <Dialog
        open={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: { borderRadius: '28px', p: 1.5, boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 3, pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>Evaluation Results</Typography>
          {evalResult && (
            <Chip 
              label={evalResult.allPassed ? "PASSED" : "FAILED"}
              sx={{ 
                height: 24, fontWeight: 900, fontSize: '0.7rem',
                bgcolor: evalResult.allPassed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: evalResult.allPassed ? '#10b981' : '#ef4444'
              }} 
            />
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {evalResult ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Score banner */}
              <Box sx={{ p: 2, borderRadius: '14px', bgcolor: evalResult.allPassed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                {evalResult.allPassed
                  ? <CheckCircle sx={{ color: '#10b981', fontSize: 28 }} />
                  : <Stop sx={{ color: '#ef4444', fontSize: 28 }} />
                }
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: evalResult.allPassed ? '#059669' : '#dc2626' }}>
                    {evalResult.allPassed ? 'All tests passed! 🎉' : 'Some tests failed'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {evalResult.parsedTests.filter(t => t.passed).length} / {evalResult.parsedTests.length} tests passing
                  </Typography>
                </Box>
              </Box>

              {/* Test case cards */}
              {evalResult.parsedTests.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Test Cases</Typography>
                  {evalResult.parsedTests.map((t, i) => (
                    <Box key={i} sx={{ p: 1.5, borderRadius: '12px', bgcolor: t.passed ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)', border: '1px solid', borderColor: t.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', gap: 2 }}>
                      {t.passed
                        ? <CheckCircle sx={{ color: '#10b981', fontSize: 18, flexShrink: 0 }} />
                        : <Stop sx={{ color: '#ef4444', fontSize: 18, flexShrink: 0 }} />
                      }
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', flex: 1, color: '#1e293b', fontFamily: 'monospace' }}>{t.name}</Typography>
                      <Chip label={t.status.toUpperCase()} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: t.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: t.passed ? '#10b981' : '#ef4444' }} />
                    </Box>
                  ))}
                </Box>
              )}

              {/* Console output — only non-test lines */}
              {evalResult.stdout && (
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>Program Output</Typography>
                  <Box sx={{ p: 2, bgcolor: '#0f172a', borderRadius: '14px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#e2e8f0', maxHeight: 180, overflow: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {evalResult.stdout
                      .split('\n')
                      .filter(l => !l.match(/^(test_\w+|------|Ran \d+|OK$|FAILED|ERROR)/))
                      .join('\n')
                      .trim() || 'No text printed to console.'
                    }
                  </Box>
                </Box>
              )}

              {/* Stderr */}
              {evalResult.stderr && (
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>Errors</Typography>
                  <Box sx={{ p: 2, bgcolor: '#fff8f8', borderRadius: '14px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#ef4444', maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap', border: '1px solid #fee2e2' }}>
                    {evalResult.stderr
                      .split('\n')
                      .filter(l => !l.match(/^(test_\w+|------|Ran \d+|OK$|FAILED)/))
                      .join('\n')
                      .trim() || 'No execution errors.'
                    }
                  </Box>
                </Box>
              )}

              {evalResult.parsedTests.length === 0 && (
                <Typography sx={{ color: '#ef4444', fontStyle: 'italic', textAlign: 'center', py: 2 }}>No test output received. Make sure your code defines the required variables.</Typography>
              )}
            </Box>
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress size={30} sx={{ color: '#6366f1', mb: 2 }} />
              <Typography sx={{ color: '#64748b' }}>Awaiting evaluation...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            fullWidth onClick={() => setShowResultsModal(false)}
            sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 800, borderRadius: '12px', py: 1.5, '&:hover': { bgcolor: '#e2e8f0' } }}
          >Dismiss</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
