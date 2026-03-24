import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, Select, MenuItem, FormControl, IconButton, Typography, CircularProgress, Chip, Tooltip, Stack } from '@mui/material';
import { PlayArrow, Add, Remove, Fullscreen, FullscreenExit, LightMode, DarkMode, ContentCopy, RestartAlt, Terminal, Input, Code, Check } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { submitCode } from 'services/pistonService';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

const templates = {
  python: `# Write your Python code here\nprint("Hello World")`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}`,
  javascript: `console.log("Hello World");`,
  typescript: `const message: string = "Hello World";\nconsole.log(message);`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}`,
  rust: `fn main() {\n    println!("Hello World");\n}`,
  kotlin: `fun main() {\n    println("Hello World")\n}`,
  ruby: `puts "Hello World"`,
  php: `<?php\necho "Hello World\\n";`,
  bash: `#!/bin/bash\necho "Hello World"`,
};

const langMeta = {
  python: { label: 'Python', color: '#3572A5', glow: 'rgba(53, 114, 165, 0.15)' },
  cpp: { label: 'C++', color: '#f34b7d', glow: 'rgba(243, 75, 125, 0.15)' },
  java: { label: 'Java', color: '#b07219', glow: 'rgba(176, 114, 25, 0.15)' },
  c: { label: 'C', color: '#555555', glow: 'rgba(85, 85, 85, 0.15)' },
  javascript: { label: 'JavaScript', color: '#f1e05a', glow: 'rgba(241, 224, 90, 0.15)' },
  typescript: { label: 'TypeScript', color: '#3178c6', glow: 'rgba(49, 120, 198, 0.15)' },
  go: { label: 'Go', color: '#00ADD8', glow: 'rgba(0, 173, 216, 0.15)' },
  rust: { label: 'Rust', color: '#dea584', glow: 'rgba(222, 165, 132, 0.15)' },
  kotlin: { label: 'Kotlin', color: '#A97BFF', glow: 'rgba(169, 123, 255, 0.15)' },
  ruby: { label: 'Ruby', color: '#CC342D', glow: 'rgba(204, 52, 45, 0.15)' },
  php: { label: 'PHP', color: '#4F5D95', glow: 'rgba(79, 93, 149, 0.15)' },
  bash: { label: 'Bash', color: '#89e051', glow: 'rgba(137, 224, 81, 0.15)' },
};

// ── Soft Light Background ──
const LightBackground = () => (
  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: 'inherit' }}>
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#fbfcfe' }} />
    <Box sx={{
      position: 'absolute', top: '-10%', right: '-5%',
      width: '50vw', height: '50vw',
      background: 'radial-gradient(circle, rgba(99, 102, 241, 0.03) 0%, transparent 70%)',
      borderRadius: '50%', filter: 'blur(80px)',
    }} />
    <Box sx={{
      position: 'absolute', bottom: '-10%', left: '-5%',
      width: '40vw', height: '40vw',
      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.03) 0%, transparent 70%)',
      borderRadius: '50%', filter: 'blur(80px)',
    }} />
  </Box>
);

const DarkBackground = () => (
  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: 'inherit' }}>
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#0c0e1a' }} />
    <Box sx={{
      position: 'absolute', top: '-10%', right: '-5%',
      width: '50vw', height: '50vw',
      background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
      borderRadius: '50%', filter: 'blur(100px)',
    }} />
    <Box sx={{
      position: 'absolute', bottom: '-10%', left: '-5%',
      width: '40vw', height: '40vw',
      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, transparent 70%)',
      borderRadius: '50%', filter: 'blur(100px)',
    }} />
  </Box>
);

export default function IDE() {
  const [language, setLanguage] = useState('python');
  const [fontSize, setFontSize] = useState(16);
  const [code, setCode] = useState(() => {
    const saved = sessionStorage.getItem('ide_code_python');
    return saved || templates.python;
  });
  const [editorWidth, setEditorWidth] = useState(60);
  const [ioHeight, setIoHeight] = useState(50);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = sessionStorage.getItem('ide_theme');
    return saved === null ? true : saved === 'dark';
  });
  const [copied, setCopied] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [lineCount, setLineCount] = useState(1);
  const editorRef = useRef(null);

  const languageIds = {
    python: 71,
    cpp: 54,
    java: 62,
    c: 50,
    javascript: 93,
    typescript: 74,
    go: 60,
    rust: 73,
    kotlin: 78,
    ruby: 72,
    php: 68,
    bash: 46,
  };

  useEffect(() => {
    sessionStorage.setItem('ide_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    sessionStorage.setItem(`ide_code_${language}`, code);
    setLineCount((code || '').split('\n').length);
  }, [code, language]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const saved = sessionStorage.getItem(`ide_code_${newLang}`);
    setCode(saved || templates[newLang]);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    setExecutionTime(null);
    const startTime = Date.now();

    try {
      const result = await submitCode(code, languageIds[language], input);
      setExecutionTime(Date.now() - startTime);

      if (result.status.id === 3) {
        setOutput(result.stdout || 'No output');
      } else if (result.stderr) {
        const errorMsg = result.stderr;
        if (errorMsg.includes('fatal signal')) {
          setOutput('Error: Program exceeded time/memory limits.');
        } else {
          setOutput(`Error:\n${errorMsg}`);
        }
      } else {
        setOutput(`Status: ${result.status.description}`);
      }
    } catch (error) {
      setExecutionTime(Date.now() - startTime);
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(templates[language]);
    setOutput('');
    setInput('');
    setExecutionTime(null);
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

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  // Use Ctrl/Cmd+Enter to run
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunning) handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, code, language, input]);

  const t = isDarkMode ? {
    bg: '#0c0e1a',
    headerBg: 'rgba(15, 17, 30, 0.85)',
    panelBg: '#0f1120',
    panelHeaderBg: 'rgba(15, 17, 30, 0.9)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: '#6366f1',
    text: '#e2e8f0',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    textDim: '#475569',
    inputBg: '#0a0c16',
    chipBg: 'rgba(99,102,241,0.12)',
    chipText: '#818cf8',
    success: '#34d399',
    error: '#f87171',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    accentGlow: 'rgba(99, 102, 241, 0.2)',
    runBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    runHover: '#047857',
    runGlow: 'rgba(5, 150, 105, 0.3)',
    selectBg: 'rgba(255, 255, 255, 0.03)',
    editorTheme: 'vs-dark',
    tabActive: 'rgba(99, 102, 241, 0.1)',
    tabBorder: '#6366f1',
    cardBg: 'rgba(255, 255, 255, 0.02)',
    backdrop: 'blur(20px)',
  } : {
    bg: '#fbfcfe',
    headerBg: 'rgba(255, 255, 255, 0.85)',
    panelBg: '#ffffff',
    panelHeaderBg: 'rgba(255, 255, 255, 0.9)',
    border: '#e2e8f0',
    borderHover: '#6366f1',
    text: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#64748b',
    textDim: '#94a3b8',
    inputBg: '#f8fafc',
    chipBg: 'rgba(99,102,241,0.06)',
    chipText: '#6366f1',
    success: '#059669',
    error: '#dc2626',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    accentGlow: 'rgba(99, 102, 241, 0.12)',
    runBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    runHover: '#047857',
    runGlow: 'rgba(5, 150, 105, 0.2)',
    selectBg: '#f1f5f9',
    editorTheme: 'light',
    tabActive: 'rgba(99, 102, 241, 0.06)',
    tabBorder: '#6366f1',
    cardBg: '#ffffff',
    backdrop: 'blur(20px)',
  };


  const ToolbarButton = ({ icon: Icon, tooltip, onClick, active, danger, sx: sxProp }) => (
    <Tooltip title={tooltip} arrow>
      <IconButton size="small" onClick={onClick} sx={{
        color: active ? t.success : t.textMuted,
        bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#f1f5f9',
        borderRadius: '10px', width: 34, height: 34,
        border: `1px solid ${t.border}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: danger ? '#ef4444' : t.accent,
          color: danger ? '#ef4444' : t.accent,
          bgcolor: danger ? 'rgba(239,68,68,0.06)' : isDarkMode ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)',
          transform: 'translateY(-1px)',
        },
        ...sxProp
      }}>
        <Icon sx={{ fontSize: 15 }} />
      </IconButton>
    </Tooltip>
  );

  return (
    <Box sx={{
      height: isFullscreen ? '100vh' : 'calc(100vh - 112px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRadius: isFullscreen ? 0 : '20px',
      border: isFullscreen ? 'none' : `1px solid ${t.border}`,
      boxShadow: isFullscreen ? 'none' : isDarkMode
        ? '0 8px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.02) inset'
        : '0 8px 40px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(255,255,255,0.5) inset',
      position: 'relative',
    }}>
      {isDarkMode ? <DarkBackground /> : <LightBackground />}

      {/* ── Header ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 2,
        px: 3, py: 1.5,
        bgcolor: t.headerBg, backdropFilter: t.backdrop,
        borderBottom: `1px solid ${t.border}`,
        position: 'relative', zIndex: 10,
      }}>
        {/* Left: Title + Language */}
        <Code sx={{ fontSize: 20, color: t.accent }} />
        <Typography sx={{ fontWeight: 800, color: t.text, fontSize: '1rem', mr: 1 }}>
          Code Editor
        </Typography>

        <FormControl size="small">
          <Select
            value={language}
            onChange={handleLanguageChange}
            sx={{
              color: t.text, bgcolor: t.selectBg, borderRadius: '10px',
              fontWeight: 600, fontSize: '0.82rem', minWidth: 130, height: 36,
              '& .MuiOutlinedInput-notchedOutline': { border: `1px solid ${t.border}`, borderRadius: '10px' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.accent },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: t.accent },
              '& .MuiSvgIcon-root': { color: t.textMuted }
            }}
            renderValue={(val) => (
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: langMeta[val].color }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: isDarkMode ? '#fff' : 'inherit' }}>{langMeta[val].label}</Typography>
              </Stack>
            )}
          >
            {Object.entries(langMeta).map(([key, meta]) => (
              <MenuItem key={key} value={key}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: meta.color }} />
                  <Typography sx={{ fontWeight: 600 }}>{meta.label}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />

        {/* Right: Controls */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Font Size */}
          <Box sx={{
            display: 'flex', alignItems: 'center',
            bgcolor: t.selectBg, borderRadius: '10px',
            border: `1px solid ${t.border}`, height: 36, px: 0.5,
          }}>
            <IconButton size="small" onClick={() => setFontSize(p => Math.max(12, p - 2))} sx={{ color: t.textMuted, width: 28, height: 28 }}>
              <Remove sx={{ fontSize: 14 }} />
            </IconButton>
            <Typography sx={{ color: t.text, fontWeight: 700, fontSize: '0.72rem', minWidth: 32, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}>
              {fontSize}px
            </Typography>
            <IconButton size="small" onClick={() => setFontSize(p => Math.min(32, p + 2))} sx={{ color: t.textMuted, width: 28, height: 28 }}>
              <Add sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>

          <ToolbarButton icon={copied ? Check : ContentCopy} tooltip={copied ? 'Copied!' : 'Copy Code'} onClick={handleCopy} active={copied} />
          <ToolbarButton icon={RestartAlt} tooltip="Reset Code" onClick={handleReset} danger />
          <ToolbarButton icon={isDarkMode ? LightMode : DarkMode} tooltip={isDarkMode ? 'Light Mode' : 'Dark Mode'} onClick={() => setIsDarkMode(!isDarkMode)} />
          <ToolbarButton icon={isFullscreen ? FullscreenExit : Fullscreen} tooltip={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} onClick={toggleFullscreen} />

          <Button
            variant="contained" disableElevation
            startIcon={isRunning ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <PlayArrow sx={{ fontSize: 17 }} />}
            onClick={handleRun} disabled={isRunning}
            sx={{
              background: t.runBg, color: '#fff', textTransform: 'none',
              fontWeight: 800, fontSize: '0.82rem', px: 3, height: 36, borderRadius: '10px',
              boxShadow: `0 4px 14px ${t.runGlow}`,
              '&:hover': { background: t.runBg, filter: 'brightness(1.1)' },
              '&.Mui-disabled': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.04)' : '#e2e8f0', color: t.textDim, boxShadow: 'none' }
            }}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
        </Stack>
      </Box>

      {/* ── Main Content Area ── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 5 }}>
        {/* Editor Panel */}
        <Box sx={{ width: `${editorWidth}%`, height: '100%', position: 'relative' }}>
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            value={code}
            theme={t.editorTheme}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorMount}
            options={{
              fontSize: fontSize,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              fontFamily: "'JetBrains Mono', Consolas, Monaco, monospace",
              fontLigatures: true,
              padding: { top: 16, bottom: 16 },
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true },
              scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
              suggest: { showIcons: true },
              lineDecorationsWidth: 8,
            }}
          />

          {/* Language badge */}
          <Box sx={{
            position: 'absolute', bottom: 14, right: 18,
            display: 'flex', alignItems: 'center', gap: 1,
            px: 1.5, py: 0.5, borderRadius: '8px',
            bgcolor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${t.border}`,
            transition: 'opacity 0.3s',
            opacity: 0.7,
            '&:hover': { opacity: 1 },
          }}>
            <Box sx={{
              width: 7, height: 7, borderRadius: '50%', bgcolor: langMeta[language].color,
              boxShadow: `0 0 6px ${langMeta[language].color}`,
            }} />
            <Typography sx={{
              fontSize: '0.65rem', fontWeight: 700, color: t.textMuted,
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              {langMeta[language].label}
            </Typography>
          </Box>
        </Box>

        {/* ── Vertical Resizer ── */}
        <Box
          onMouseDown={(e) => {
            e.preventDefault();
            const container = e.target.parentElement;
            const handleMouseMove = (ev) => {
              const rect = container.getBoundingClientRect();
              const newWidth = ((ev.clientX - rect.left) / rect.width) * 100;
              if (newWidth >= 30 && newWidth <= 80) setEditorWidth(newWidth);
            };
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
              document.body.style.cursor = '';
              document.body.style.userSelect = '';
            };
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
          sx={{
            width: '5px',
            cursor: 'col-resize',
            bgcolor: 'transparent',
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: t.accent },
            position: 'relative',
            flexShrink: 0,
            '&:after': {
              content: '""', position: 'absolute',
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 3, height: 40, borderRadius: 2,
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              transition: 'all 0.2s',
            },
            '&:hover:after': {
              bgcolor: t.accent, height: 60, boxShadow: `0 0 10px ${t.accentGlow}`,
            }
          }}
        />

        {/* ── I/O Panel ── */}
        <Box sx={{
          flex: 1, display: 'flex', flexDirection: 'column', height: '100%',
          bgcolor: t.panelBg, borderLeft: `1px solid ${t.border}`,
        }}>
          {/* Input Section */}
          <Box sx={{ height: `${ioHeight}%`, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{
              px: 2, py: 1, bgcolor: t.panelHeaderBg, backdropFilter: t.backdrop,
              borderBottom: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <Input sx={{ fontSize: 15, color: t.accent }} />
              <Typography sx={{ color: t.text, fontWeight: 700, fontSize: '0.78rem' }}>Input</Typography>
              <Chip label="stdin" size="small" sx={{
                bgcolor: t.chipBg, color: t.chipText,
                fontSize: '0.6rem', height: 20, fontWeight: 700, borderRadius: '6px',
              }} />
            </Box>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input here..."
              spellCheck={false}
              style={{
                flex: 1, padding: '16px',
                backgroundColor: isDarkMode ? '#0a0c16' : '#f8fafc',
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                border: 'none', outline: 'none',
                fontFamily: "'JetBrains Mono', Consolas, Monaco, monospace",
                fontSize: `${fontSize}px`,
                resize: 'none', lineHeight: '1.7',
              }}
            />
          </Box>

          {/* Horizontal Resizer */}
          <Box
            onMouseDown={(e) => {
              e.preventDefault();
              const panel = e.target.parentElement;
              const handleMouseMove = (ev) => {
                const rect = panel.getBoundingClientRect();
                const h = ((ev.clientY - rect.top) / rect.height) * 100;
                if (h >= 20 && h <= 80) setIoHeight(h);
              };
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
              };
              document.body.style.cursor = 'row-resize';
              document.body.style.userSelect = 'none';
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
            sx={{
              height: '3px', cursor: 'row-resize', bgcolor: t.border, flexShrink: 0,
              transition: 'background-color 0.15s', '&:hover': { bgcolor: t.accent },
            }}
          />

          {/* Output Section */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{
              px: 2, py: 1, bgcolor: t.panelHeaderBg, backdropFilter: t.backdrop,
              borderBottom: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <Terminal sx={{ fontSize: 15, color: output.includes('Error') ? t.error : t.success }} />
              <Typography sx={{ color: t.text, fontWeight: 700, fontSize: '0.78rem' }}>Output</Typography>
              <Chip label="stdout" size="small" sx={{
                bgcolor: t.chipBg, color: t.chipText,
                fontSize: '0.6rem', height: 20, fontWeight: 700, borderRadius: '6px',
              }} />
              <Box sx={{ flex: 1 }} />
              {executionTime !== null && (
                <Chip
                  label={`${(executionTime / 1000).toFixed(2)}s`}
                  size="small"
                  sx={{
                    bgcolor: executionTime < 3000 ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                    color: executionTime < 3000 ? t.success : t.error,
                    fontSize: '0.62rem', height: 20, fontWeight: 800, borderRadius: '6px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
              )}
            </Box>
            <Box sx={{
              flex: 1, p: 2,
              fontFamily: "'JetBrains Mono', Consolas, Monaco, monospace",
              fontSize: `${fontSize}px`,
              overflowY: 'auto', whiteSpace: 'pre-wrap',
              bgcolor: isDarkMode ? '#0a0c16' : '#f8fafc',
              color: output.includes('Error') ? t.error : output ? t.success : t.textDim,
              lineHeight: '1.7',
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0', borderRadius: 10 },
            }}>
              {isRunning ? (
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <CircularProgress size={14} sx={{ color: t.accent }} />
                  <Typography sx={{ color: t.textMuted, fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace" }}>
                    Executing...
                  </Typography>
                </Stack>
              ) : (output || 'Output will appear here...')}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Status Bar ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 0.5,
        bgcolor: t.headerBg, backdropFilter: t.backdrop,
        borderTop: `1px solid ${t.border}`,
        minHeight: 26, position: 'relative', zIndex: 10,
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isRunning ? '#fbbf24' : t.success }} />
            <Typography sx={{ fontSize: '0.6rem', color: t.textMuted, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
              {isRunning ? 'Running' : 'Ready'}
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: '0.6rem', color: t.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
            {langMeta[language].label} • UTF-8
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography sx={{ fontSize: '0.6rem', color: t.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
            Ln {lineCount} • Spaces: 4
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
