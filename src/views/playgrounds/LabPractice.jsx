import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip
} from '@mui/material';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconFileCode,
  IconFolderOpen,
  IconTerminal2,
  IconPlayerPlay,
  IconSettings,
  IconFiles,
  IconSearch,
  IconGitBranch,
  IconArrowLeft,
  IconBook,
  IconX,
  IconChevronRight,
  IconChevronDown,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLayoutBottombarCollapse,
  IconLayoutBottombarExpand,
  IconBrandJavascript,
  IconBrandPython,
  IconBrandHtml5,
  IconBrandCss3,
  IconMarkdown,
  IconMaximize,
  IconLock,
  IconAlertCircle
} from '@tabler/icons-react';

const VSCODE_THEME = {
  bgActivityBar: '#181825',
  bgSidebar: '#1e1e2e',
  bgEditor: '#1e1e2e',
  bgTerminal: '#181825',
  bgTab: '#1e1e2e',
  bgTabActive: '#1e1e2e',
  bgTabInactive: '#181825',
  border: '#313244',
  accent: '#cba6f7',
  accentHover: '#b4befe',
  textDefault: '#cdd6f4',
  textMuted: '#6c7086',
  error: '#f38ba8',
  success: '#a6e3a1',
  warning: '#f9e2af',
  statusBar: '#11111b'
};

const labQuestions = {
  'c-programming': [
    {
      id: 1,
      title: 'Hello World',
      difficulty: 'Easy',
      topics: ['Basics', 'Syntax'],
      description: 'Create a C program to output "Hello World".\n\nEnsure you include the standard input/output library and return 0 from the main function.',
      example: { input: 'None', output: 'Hello World' },
      constraints: ['Time limit: 1s', 'Memory: 256MB'],
      completed: false
    }
  ]
};

const getFileIcon = (fileName) => {
  if (fileName.endsWith('.js')) return <IconBrandJavascript size={16} color="#f9e2af" />;
  if (fileName.endsWith('.py')) return <IconBrandPython size={16} color="#89b4fa" />;
  if (fileName.endsWith('.html')) return <IconBrandHtml5 size={16} color="#fab387" />;
  if (fileName.endsWith('.css')) return <IconBrandCss3 size={16} color="#89b4fa" />;
  if (fileName.endsWith('.md')) return <IconMarkdown size={16} color="#cdd6f4" />;
  return <IconFileCode size={16} color="#cdd6f4" />;
};

export default function LabPractice() {
  const { labId, questionId } = useParams();
  const navigate = useNavigate();

  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Workspace State
  const [files, setFiles] = useState([
    { id: '1', name: 'main.js', type: 'file', content: 'console.log("Hello, Orca!");\n', language: 'javascript' },
    { id: '2', name: 'utils.js', type: 'file', content: 'export const add = (a, b) => a + b;\n', language: 'javascript' },
    { id: '3', name: 'README.md', type: 'file', content: '# Lab Workspace\n\nWelcome to your sandbox.', language: 'markdown' }
  ]);
  const [activeFileId, setActiveFileId] = useState('1');
  const [openFileIds, setOpenFileIds] = useState(['1', '3']);
  
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [activeActivity, setActiveActivity] = useState('explorer');
  const [isSRSModalOpen, setIsSRSModalOpen] = useState(false);
  const terminalEndRef = useRef(null);

  // Terminal State
  const [terminals, setTerminals] = useState([{ id: 'default', name: 'bash', logs: [{ id: 'init', text: 'Orca V-Sandbox initialized...', type: 'info' }] }]);
  const [activeTermId] = useState('default');
  const [terminalCommand, setTerminalCommand] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    // Initial check
    setIsFullscreen(!!document.fullscreenElement);
    
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: \${err.message}`);
      });
    }
  };

  const currentQuestion = labQuestions[labId]?.find((q) => q.id === parseInt(questionId)) || {
    title: 'Laboratory Experiment',
    description: 'Complete the tasks as specified in the SRS document.',
    example: { input: 'v1.0.0', output: 'Success' },
    constraints: ['Strict time limit applied', 'Memory monitoring active']
  };

  const activeTerminal = terminals.find((t) => t.id === activeTermId) || terminals[0];

  const appendLog = (text, type = 'output') => {
    setTerminals((prev) =>
      prev.map((t) =>
        t.id === activeTermId
          ? { ...t, logs: [...t.logs, { id: Date.now() + Math.random(), text, type }] }
          : t
      )
    );
  };

  const processCommand = (cmd) => {
    const parts = cmd.trim().split(' ');
    const base = parts[0].toLowerCase();
    const arg = parts[1];

    switch (base) {
      case 'clear':
        setTerminals((prev) => prev.map((t) => (t.id === activeTermId ? { ...t, logs: [] } : t)));
        break;
      case 'ls':
        appendLog(files.map(f => f.name).join('  '));
        break;
      case 'node':
        if (!arg) appendLog('Usage: node <file>', 'error');
        else {
          const file = files.find(f => f.name === arg);
          if (file) {
            appendLog(`> Executing ${arg}...`, 'info');
            if (file.name === 'main.js') {
              appendLog('Hello, Orca!', 'success');
            } else {
              appendLog('[Execution finished]', 'info');
            }
          } else {
            appendLog(`Error: Cannot find module '${arg}'`, 'error');
          }
        }
        break;
      default:
        if (base) appendLog(`bash: ${base}: command not found`, 'error');
    }
  };

  const handleTerminalSubmit = (e) => {
    if (e.key === 'Enter') {
      const cmd = terminalCommand.trim();
      if (cmd) {
        appendLog(`student@orca:~/workspace$ ${cmd}`, 'prompt');
        processCommand(cmd);
      } else {
        appendLog(`student@orca:~/workspace$`, 'prompt');
      }
      setTerminalCommand('');
    }
  };

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeTerminal.logs]);

  const activeFile = files.find((f) => f.id === activeFileId);

  const openFile = (id) => {
    if (!openFileIds.includes(id)) {
      setOpenFileIds([...openFileIds, id]);
    }
    setActiveFileId(id);
  };

  const closeFile = (e, id) => {
    e.stopPropagation();
    const newOpenIds = openFileIds.filter(fid => fid !== id);
    setOpenFileIds(newOpenIds);
    if (activeFileId === id) {
      setActiveFileId(newOpenIds.length > 0 ? newOpenIds[newOpenIds.length - 1] : null);
    }
  };

  const runCode = () => {
    setTerminalOpen(true);
    appendLog(`student@orca:~/workspace$ node ${activeFile?.name || 'main.js'}`, 'prompt');
    processCommand(`node ${activeFile?.name || 'main.js'}`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: VSCODE_THEME.bgEditor, color: VSCODE_THEME.textDefault, overflow: 'hidden', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Top Header */}
      <Box sx={{ height: 40, bgcolor: VSCODE_THEME.bgActivityBar, display: 'flex', alignItems: 'center', px: 2, justifyContent: 'space-between', borderBottom: `1px solid ${VSCODE_THEME.border}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton size="small" onClick={() => navigate('/labs')} sx={{ color: VSCODE_THEME.textMuted, p: 0.5, '&:hover': { color: '#fff' } }}>
            <IconArrowLeft size={18} />
          </IconButton>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#cdd6f4' }}>ORCA <span style={{color: VSCODE_THEME.accent}}>Sandbox</span></Typography>
        </Box>
        <Typography sx={{ fontSize: '13px', color: VSCODE_THEME.textMuted, fontWeight: 500 }}>{currentQuestion.title} - Workspace</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" startIcon={<IconBook size={16} />} onClick={() => setIsSRSModalOpen(true)} sx={{ textTransform: 'none', color: '#cdd6f4', fontSize: '12px', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
            Problem Spec
          </Button>
          <Button size="small" startIcon={<IconPlayerPlay size={16} />} onClick={runCode} sx={{ textTransform: 'none', bgcolor: 'rgba(166, 227, 161, 0.1)', color: VSCODE_THEME.success, fontSize: '12px', px: 2, '&:hover': { bgcolor: 'rgba(166, 227, 161, 0.2)' } }}>
            Run
          </Button>
        </Box>
      </Box>

      {/* Main Area */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        
        {/* Activity Bar */}
        <Box sx={{ width: 48, bgcolor: VSCODE_THEME.bgActivityBar, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1, borderRight: `1px solid ${VSCODE_THEME.border}`, zIndex: 10 }}>
          <Tooltip title="Explorer" placement="right">
            <IconButton onClick={() => { setActiveActivity('explorer'); setSidebarOpen(true); }} sx={{ color: activeActivity === 'explorer' && sidebarOpen ? VSCODE_THEME.accent : VSCODE_THEME.textMuted, mb: 1, borderRadius: '8px' }}>
              <IconFiles size={24} stroke={1.5} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Search" placement="right">
            <IconButton onClick={() => { setActiveActivity('search'); setSidebarOpen(true); }} sx={{ color: activeActivity === 'search' && sidebarOpen ? VSCODE_THEME.accent : VSCODE_THEME.textMuted, mb: 1, borderRadius: '8px' }}>
              <IconSearch size={24} stroke={1.5} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Source Control" placement="right">
            <IconButton onClick={() => { setActiveActivity('git'); setSidebarOpen(true); }} sx={{ color: activeActivity === 'git' && sidebarOpen ? VSCODE_THEME.accent : VSCODE_THEME.textMuted, mb: 1, borderRadius: '8px' }}>
              <IconGitBranch size={24} stroke={1.5} />
            </IconButton>
          </Tooltip>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton sx={{ color: VSCODE_THEME.textMuted, borderRadius: '8px' }}><IconSettings size={24} stroke={1.5} /></IconButton>
        </Box>

        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden', flexShrink: 0, borderRight: `1px solid ${VSCODE_THEME.border}`, backgroundColor: VSCODE_THEME.bgSidebar }}>
              <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: VSCODE_THEME.textMuted }}>
                  {activeActivity}
                </Typography>
                <IconButton size="small" onClick={() => setSidebarOpen(false)} sx={{ color: VSCODE_THEME.textMuted, p: 0.5 }}>
                  <IconLayoutSidebarLeftCollapse size={16} />
                </IconButton>
              </Box>
              
              {activeActivity === 'explorer' && (
                <Box sx={{ p: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, mb: 0.5, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                    <IconChevronDown size={16} color={VSCODE_THEME.textMuted} />
                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: VSCODE_THEME.textDefault }}>WORKSPACE</Typography>
                  </Box>
                  {files.map(file => (
                    <Box key={file.id} onClick={() => openFile(file.id)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1, py: 0.5, ml: 1, cursor: 'pointer', bgcolor: activeFileId === file.id ? 'rgba(203, 166, 247, 0.1)' : 'transparent', color: activeFileId === file.id ? VSCODE_THEME.accent : VSCODE_THEME.textDefault, '&:hover': { bgcolor: activeFileId === file.id ? 'rgba(203, 166, 247, 0.15)' : 'rgba(255,255,255,0.05)' } }}>
                      {getFileIcon(file.name)}
                      <Typography sx={{ fontSize: '13px' }}>{file.name}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor & Terminal Column */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          
          {/* File Tabs */}
          <Box sx={{ display: 'flex', bgcolor: VSCODE_THEME.bgTabInactive, overflowX: 'auto', '&::-webkit-scrollbar': { height: 2 } }}>
            {!sidebarOpen && (
              <IconButton size="small" onClick={() => setSidebarOpen(true)} sx={{ color: VSCODE_THEME.textMuted, m: 0.5, borderRadius: 1 }}>
                <IconLayoutSidebarLeftExpand size={16} />
              </IconButton>
            )}
            {openFileIds.map(id => {
              const file = files.find(f => f.id === id);
              if (!file) return null;
              const isActive = activeFileId === id;
              return (
                <Box key={id} onClick={() => setActiveFileId(id)} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, minWidth: 120, cursor: 'pointer', bgcolor: isActive ? VSCODE_THEME.bgTabActive : VSCODE_THEME.bgTabInactive, borderTop: isActive ? `2px solid ${VSCODE_THEME.accent}` : '2px solid transparent', borderRight: `1px solid ${VSCODE_THEME.border}`, color: isActive ? VSCODE_THEME.accentHover : VSCODE_THEME.textMuted, '&:hover': { bgcolor: isActive ? VSCODE_THEME.bgTabActive : 'rgba(255,255,255,0.02)' } }}>
                  {getFileIcon(file.name)}
                  <Typography sx={{ fontSize: '13px', flexGrow: 1 }}>{file.name}</Typography>
                  <IconButton size="small" onClick={(e) => closeFile(e, id)} sx={{ p: 0.2, color: VSCODE_THEME.textMuted, opacity: isActive ? 1 : 0, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' } }}>
                    <IconX size={14} />
                  </IconButton>
                </Box>
              );
            })}
          </Box>

          {/* Editor Area */}
          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            {activeFile ? (
              <Editor
                height="100%"
                theme="vs-dark"
                language={activeFile.language}
                value={activeFile.content}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                  fontLigatures: true,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  padding: { top: 16 }
                }}
                onChange={(val) => setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: val } : f))}
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: VSCODE_THEME.textMuted }}>
                <Typography>Select a file to open</Typography>
              </Box>
            )}
          </Box>

          {/* Terminal Area */}
          <AnimatePresence initial={false}>
            {terminalOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: 250 }} exit={{ height: 0 }} transition={{ duration: 0.2 }} style={{ borderTop: `1px solid ${VSCODE_THEME.border}`, backgroundColor: VSCODE_THEME.bgTerminal, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, borderBottom: `1px solid ${VSCODE_THEME.border}` }}>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#cdd6f4', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `1px solid ${VSCODE_THEME.accent}`, pb: 0.5 }}>TERMINAL</Typography>
                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: VSCODE_THEME.textMuted, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', '&:hover': { color: '#cdd6f4' } }}>OUTPUT</Typography>
                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: VSCODE_THEME.textMuted, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', '&:hover': { color: '#cdd6f4' } }}>PROBLEMS</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setTerminalOpen(false)} sx={{ p: 0.5, color: VSCODE_THEME.textMuted, '&:hover': { color: '#fff' } }}>
                    <IconLayoutBottombarCollapse size={16} />
                  </IconButton>
                </Box>
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, fontFamily: '"Fira Code", monospace', fontSize: '13px' }}>
                  {activeTerminal.logs.map((log) => (
                    <Box key={log.id} sx={{ color: log.type === 'error' ? VSCODE_THEME.error : log.type === 'success' ? VSCODE_THEME.success : log.type === 'prompt' ? '#89b4fa' : '#a6adc8', mb: 0.5, display: 'flex', gap: 1 }}>
                      {log.type === 'prompt' && <IconChevronRight size={16} style={{ marginTop: 2, flexShrink: 0 }} />}
                      <span style={{ wordBreak: 'break-all' }}>{log.text}</span>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography sx={{ color: VSCODE_THEME.success, fontWeight: 700 }}>student@orca:~/workspace$</Typography>
                    <input
                      value={terminalCommand}
                      onChange={(e) => setTerminalCommand(e.target.value)}
                      onKeyDown={handleTerminalSubmit}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#cdd6f4',
                        outline: 'none',
                        width: '100%',
                        fontFamily: 'inherit',
                        fontSize: '13px'
                      }}
                      spellCheck={false}
                    />
                  </Box>
                  <div ref={terminalEndRef} />
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

        </Box>
      </Box>

      {/* Status Bar */}
      <Box sx={{ height: 24, bgcolor: VSCODE_THEME.accent, color: '#11111b', display: 'flex', alignItems: 'center', px: 2, justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><IconGitBranch size={14} /> main</Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><IconX size={14} /> 0</Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {!terminalOpen && (
            <Box onClick={() => setTerminalOpen(true)} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
              <IconLayoutBottombarExpand size={14} /> Terminal
            </Box>
          )}
          <Box>UTF-8</Box>
          <Box>{activeFile?.language || 'Plain Text'}</Box>
          <Box>Prettier</Box>
        </Box>
      </Box>

      {/* SRS Modal */}
      <Dialog open={isSRSModalOpen} onClose={() => setIsSRSModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: VSCODE_THEME.bgSidebar, color: VSCODE_THEME.textDefault, borderRadius: '12px', border: `1px solid ${VSCODE_THEME.border}` } }}>
        <DialogTitle sx={{ borderBottom: `1px solid ${VSCODE_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Problem Specification
          <IconButton onClick={() => setIsSRSModalOpen(false)} sx={{ color: VSCODE_THEME.textMuted }}><IconX size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, color: VSCODE_THEME.accentHover, fontWeight: 700 }}>{currentQuestion.title}</Typography>
          <Typography variant="body1" sx={{ color: '#bac2de', mb: 4, whiteSpace: 'pre-wrap' }}>{currentQuestion.description}</Typography>
          
          <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 3, borderRadius: '8px', border: `1px solid ${VSCODE_THEME.border}` }}>
            <Typography sx={{ color: VSCODE_THEME.accent, fontWeight: 700, mb: 1, fontSize: '13px', letterSpacing: '1px' }}>EXAMPLE</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '12px', color: VSCODE_THEME.textMuted, mb: 0.5 }}>Input</Typography>
                <Box sx={{ p: 1.5, bgcolor: '#11111b', borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px' }}>{currentQuestion.example.input}</Box>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', color: VSCODE_THEME.textMuted, mb: 0.5 }}>Output</Typography>
                <Box sx={{ p: 1.5, bgcolor: '#11111b', borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px' }}>{currentQuestion.example.output}</Box>
              </Box>
            </Box>

            <Typography sx={{ color: VSCODE_THEME.accent, fontWeight: 700, mt: 3, mb: 1, fontSize: '13px', letterSpacing: '1px' }}>CONSTRAINTS</Typography>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#bac2de' }}>
              {currentQuestion.constraints.map((c, i) => <li key={i} style={{ marginBottom: '4px' }}>{c}</li>)}
            </ul>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Guard Overlay */}
      <AnimatePresence>
        {!isFullscreen && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              bgcolor: 'rgba(15, 23, 42, 0.98)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 3
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  color: '#6366f1',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 4,
                  mx: 'auto',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  boxShadow: '0 0 40px rgba(99, 102, 241, 0.1)'
                }}
              >
                <IconLock size={40} />
              </Box>
              <Typography
                variant="h2"
                sx={{
                  color: '#fff',
                  fontWeight: 900,
                  mb: 2,
                  fontSize: { xs: '1.75rem', sm: '2.5rem' },
                  letterSpacing: '-1px'
                }}
              >
                Fullscreen Mode Required
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#94a3b8',
                  maxWidth: 450,
                  mb: 5,
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  mx: 'auto'
                }}
              >
                To provide a focused and secure assessment environment, all laboratory operations are suspended until you enter fullscreen mode.
              </Typography>
              <Button
                variant="contained"
                startIcon={<IconMaximize size={24} />}
                onClick={enterFullscreen}
                sx={{
                  bgcolor: '#6366f1',
                  color: '#fff',
                  borderRadius: '16px',
                  px: 6,
                  py: 2,
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: '#4f46e5',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 15px 35px rgba(99, 102, 241, 0.4)'
                  },
                  '&:active': {
                    transform: 'translateY(0)'
                  }
                }}
              >
                Enter Fullscreen to Begin
              </Button>
            </motion.div>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
}
