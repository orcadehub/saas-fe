import { useState, useEffect } from 'react';
import { Box, Button, Select, MenuItem, FormControl, InputLabel, IconButton, Typography, CircularProgress, Skeleton } from '@mui/material';
import { PlayArrow, Add, Remove } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { submitCode } from 'services/pistonService';
import MainCard from 'ui-component/cards/MainCard';

const templates = {
  python: `# Write your Python code here\nprint("Hello World")`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}`
};

export default function IDE() {
  const [language, setLanguage] = useState('python');
  const [fontSize, setFontSize] = useState(18);
  const [code, setCode] = useState(() => {
    const saved = sessionStorage.getItem('ide_code_python');
    return saved || templates.python;
  });
  const [editorWidth, setEditorWidth] = useState(60);
  const [ioHeight, setIoHeight] = useState(50);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);

  const languageIds = {
    python: 71,
    cpp: 54,
    java: 62,
    c: 50
  };

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

  return (
    <MainCard sx={{ height: 'calc(100vh - 140px)', '& .MuiCardContent-root': { height: '100%', p: 0 } }}>
      {loading ? (
        <Box sx={{ p: 4 }}>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height="calc(100vh - 300px)" />
        </Box>
      ) : (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Language</InputLabel>
          <Select value={language} label="Language" onChange={handleLanguageChange}>
            <MenuItem value="python">Python</MenuItem>
            <MenuItem value="cpp">C++</MenuItem>
            <MenuItem value="java">Java</MenuItem>
            <MenuItem value="c">C</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={() => setFontSize(prev => Math.max(16, prev - 2))}>
            <Remove fontSize="small" />
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: '30px', textAlign: 'center' }}>
            {fontSize}
          </Typography>
          <IconButton size="small" onClick={() => setFontSize(prev => Math.min(50, prev + 2))}>
            <Add fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Button 
          variant="contained" 
          startIcon={isRunning ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <PlayArrow />}
          onClick={handleRun}
          disabled={isRunning}
          sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}
        >
          {isRunning ? 'Running...' : 'Run'}
        </Button>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Box sx={{ width: `${editorWidth}%`, height: '100%' }}>
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            value={code}
            theme="light"
            onChange={(value) => setCode(value || '')}
            options={{
              fontSize: fontSize,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on'
            }}
          />
        </Box>

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
            width: '4px',
            cursor: 'col-resize',
            bgcolor: '#6a0dad',
            '&:hover': { bgcolor: '#5a0d9d' }
          }}
        />

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ height: `${ioHeight}%`, display: 'flex', flexDirection: 'column', borderBottom: '1px solid #e0e0e0' }}>
            <Typography sx={{ p: 1.5, bgcolor: '#f5f5f5', fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>
              Input
            </Typography>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input here..."
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#fff',
                color: '#333',
                border: 'none',
                outline: 'none',
                fontFamily: 'monospace',
                fontSize: `${fontSize}px`,
                resize: 'none'
              }}
            />
          </Box>

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
              height: '4px',
              cursor: 'row-resize',
              bgcolor: '#6a0dad',
              '&:hover': { bgcolor: '#5a0d9d' }
            }}
          />

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ p: 1.5, bgcolor: '#f5f5f5', fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>
              Output
            </Typography>
            <Box sx={{
              flex: 1,
              p: 1.5,
              fontFamily: 'monospace',
              fontSize: `${fontSize}px`,
              overflowY: 'auto',
              whiteSpace: 'pre',
              bgcolor: '#fff'
            }}>
              {output || 'Output will appear here...'}
            </Box>
          </Box>
        </Box>
      </Box>
      </Box>
      )}
    </MainCard>
  );
}
