import { useState, useEffect } from 'react';
import { Box, Button, Select, MenuItem, FormControl, IconButton, Typography, CircularProgress, Chip } from '@mui/material';
import { PlayArrow, Add, Remove, Fullscreen, FullscreenExit, LightMode, DarkMode } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { submitCode } from 'services/pistonService';

const templates = {
  python: `# Write your Python code here\nprint("Hello World")`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}`
};

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
    return saved === 'dark';
  });

  const languageIds = {
    python: 71,
    cpp: 54,
    java: 62,
    c: 50
  };

  useEffect(() => {
    sessionStorage.setItem('ide_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    sessionStorage.setItem(`ide_code_${language}`, code);
  }, [code, language]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const saved = sessionStorage.getItem(`ide_code_${newLang}`);
    setCode(saved || templates[newLang]);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running...');
    
    try {
      const result = await submitCode(code, languageIds[language], input);
      
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
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
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

  const theme = {
    dark: {
      bg: '#1e1e1e',
      headerBg: '#252526',
      border: '#3e3e42',
      selectBg: '#3c3c3c',
      text: '#fff',
      textSecondary: '#d4d4d4',
      inputBg: '#1e1e1e',
      chipBg: '#3c3c3c',
      chipText: '#888',
      outputSuccess: '#4ade80',
      outputError: '#f87171',
      editorTheme: 'vs-dark'
    },
    light: {
      bg: '#ffffff',
      headerBg: '#f5f5f5',
      border: '#e0e0e0',
      selectBg: '#ffffff',
      text: '#1e293b',
      textSecondary: '#333',
      inputBg: '#ffffff',
      chipBg: '#e0e0e0',
      chipText: '#666',
      outputSuccess: '#16a34a',
      outputError: '#dc2626',
      editorTheme: 'light'
    }
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <Box sx={{ 
      height: isFullscreen ? '100vh' : 'calc(100vh - 140px)', 
      bgcolor: currentTheme.bg, 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        px: 3, 
        py: 1.5,
        bgcolor: currentTheme.headerBg,
        borderBottom: `1px solid ${currentTheme.border}`
      }}>
        <Typography variant="h6" sx={{ color: currentTheme.text, fontWeight: 600, fontSize: '1rem' }}>
          Online IDE
        </Typography>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select 
            value={language} 
            onChange={handleLanguageChange}
            sx={{ 
              color: currentTheme.text,
              bgcolor: currentTheme.selectBg,
              '& .MuiOutlinedInput-notchedOutline': { border: `1px solid ${currentTheme.border}` },
              '& .MuiSvgIcon-root': { color: currentTheme.text }
            }}
          >
            <MenuItem value="python">Python</MenuItem>
            <MenuItem value="cpp">C++</MenuItem>
            <MenuItem value="java">Java</MenuItem>
            <MenuItem value="c">C</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: currentTheme.selectBg, borderRadius: '6px', px: 1, border: `1px solid ${currentTheme.border}` }}>
          <IconButton size="small" onClick={() => setFontSize(prev => Math.max(12, prev - 2))} sx={{ color: currentTheme.text }}>
            <Remove fontSize="small" />
          </IconButton>
          <Typography variant="body2" sx={{ color: currentTheme.text, minWidth: '30px', textAlign: 'center', fontSize: '0.875rem' }}>
            {fontSize}px
          </Typography>
          <IconButton size="small" onClick={() => setFontSize(prev => Math.min(32, prev + 2))} sx={{ color: currentTheme.text }}>
            <Add fontSize="small" />
          </IconButton>
        </Box>

        <IconButton onClick={() => setIsDarkMode(!isDarkMode)} sx={{ color: currentTheme.text }}>
          {isDarkMode ? <LightMode /> : <DarkMode />}
        </IconButton>

        <IconButton onClick={toggleFullscreen} sx={{ color: currentTheme.text }}>
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>

        <Button 
          variant="contained" 
          startIcon={isRunning ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <PlayArrow />}
          onClick={handleRun}
          disabled={isRunning}
          sx={{ 
            bgcolor: '#16a34a', 
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': { bgcolor: '#15803d' },
            '&:disabled': { bgcolor: currentTheme.chipBg, color: currentTheme.chipText }
          }}
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Editor */}
        <Box sx={{ width: `${editorWidth}%`, height: '100%', position: 'relative' }}>
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            value={code}
            theme={currentTheme.editorTheme}
            onChange={(value) => setCode(value || '')}
            options={{
              fontSize: fontSize,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth',
              fontFamily: 'Consolas, Monaco, monospace',
              padding: { top: 16, bottom: 16 }
            }}
          />
        </Box>

        {/* Resizer */}
        <Box
          onMouseDown={(e) => {
            e.preventDefault();
            const handleMouseMove = (e) => {
              const container = e.currentTarget?.parentElement || document.body;
              const rect = container.getBoundingClientRect();
              const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
              if (newWidth >= 30 && newWidth <= 80) setEditorWidth(newWidth);
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
          sx={{
            width: '3px',
            cursor: 'col-resize',
            bgcolor: currentTheme.border,
            '&:hover': { bgcolor: '#6a0dad' },
            transition: 'background-color 0.2s'
          }}
        />

        {/* Input/Output Panel */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: currentTheme.bg }}>
          {/* Input */}
          <Box sx={{ height: `${ioHeight}%`, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              px: 2, 
              py: 1.5, 
              bgcolor: currentTheme.headerBg, 
              borderBottom: `1px solid ${currentTheme.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Typography sx={{ color: currentTheme.text, fontWeight: 600, fontSize: '0.875rem' }}>
                Input
              </Typography>
              <Chip label="stdin" size="small" sx={{ bgcolor: currentTheme.chipBg, color: currentTheme.chipText, fontSize: '0.75rem', height: '20px' }} />
            </Box>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input here..."
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: currentTheme.inputBg,
                color: currentTheme.textSecondary,
                border: 'none',
                outline: 'none',
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: `${fontSize}px`,
                resize: 'none',
                lineHeight: '1.6'
              }}
            />
          </Box>

          {/* Resizer */}
          <Box
            onMouseDown={(e) => {
              e.preventDefault();
              const handleMouseMove = (e) => {
                const container = e.currentTarget?.parentElement || document.body;
                const rect = container.getBoundingClientRect();
                const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
                if (newHeight >= 20 && newHeight <= 80) setIoHeight(newHeight);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
            sx={{
              height: '3px',
              cursor: 'row-resize',
              bgcolor: currentTheme.border,
              '&:hover': { bgcolor: '#6a0dad' },
              transition: 'background-color 0.2s'
            }}
          />

          {/* Output */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              px: 2, 
              py: 1.5, 
              bgcolor: currentTheme.headerBg, 
              borderBottom: `1px solid ${currentTheme.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Typography sx={{ color: currentTheme.text, fontWeight: 600, fontSize: '0.875rem' }}>
                Output
              </Typography>
              <Chip label="stdout" size="small" sx={{ bgcolor: currentTheme.chipBg, color: currentTheme.chipText, fontSize: '0.75rem', height: '20px' }} />
            </Box>
            <Box sx={{
              flex: 1,
              p: 2,
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: `${fontSize}px`,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              bgcolor: currentTheme.inputBg,
              color: output.includes('Error') ? currentTheme.outputError : currentTheme.outputSuccess,
              lineHeight: '1.6'
            }}>
              {output || 'Output will appear here...'}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
