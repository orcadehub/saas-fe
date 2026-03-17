import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Stack, Card } from '@mui/material';
import { Add, Delete, FolderOpen, InsertDriveFile, PlayArrow, Remove, CheckCircle, Close, Warning } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import apiService from '../../../services/apiService';
import frontendTestValidator from '../../../utils/frontendTestValidator';

export default function FrontendEditor({ assessment, question, attemptId, onTestComplete }) {
  const isProduction = import.meta.env.MODE === 'production';
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState('index.html');
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [fontSize, setFontSize] = useState(18);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [previewWidth, setPreviewWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showTestResults, setShowTestResults] = useState(false);
  const [lastCodeAvailable, setLastCodeAvailable] = useState(false);

  // Initialize files when question changes
  useEffect(() => {
    const loadFiles = async () => {
      const allowedFiles = question?.allowedFiles || ['html', 'css', 'js'];
      const newFiles = {};
      
      // Try localStorage first
      const localStorageKey = `frontend_${attemptId}_${question?._id}`;
      const localCode = localStorage.getItem(localStorageKey);
      const parsedLocal = localCode ? JSON.parse(localCode) : null;
      
      // Try to load from backend
      let backendCode = null;
      if (attemptId && question?._id) {
        try {
          const token = localStorage.getItem('studentToken');
          const response = await apiService.getLastExecutedCode(token, attemptId);
          const lastExecutedFrontendCode = response.lastExecutedFrontendCode;
          if (lastExecutedFrontendCode?.[question._id]) {
            backendCode = lastExecutedFrontendCode[question._id];
            setLastCodeAvailable(true);
          } else {
            setLastCodeAvailable(false);
          }
        } catch (error) {
          console.error('Error loading last executed code:', error);
          setLastCodeAvailable(false);
        }
      }
      
      if (allowedFiles.includes('html')) {
        newFiles['index.html'] = { 
          content: parsedLocal?.html || backendCode?.html || question?.defaultFiles?.html || '<!DOCTYPE html>\n<html>\n<head>\n  <title>Solution</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <script src="script.js"></script>\n</body>\n</html>', 
          readOnly: false 
        };
      }
      
      if (allowedFiles.includes('css')) {
        newFiles['styles.css'] = { 
          content: parsedLocal?.css || backendCode?.css || question?.defaultFiles?.css || '/* Write your CSS here */\n', 
          readOnly: false 
        };
      }
      
      if (allowedFiles.includes('js')) {
        newFiles['script.js'] = { 
          content: parsedLocal?.js || backendCode?.js || question?.defaultFiles?.js || '// Write your JavaScript here\n', 
          readOnly: false 
        };
      }
      
      if (allowedFiles.includes('data.js')) {
        newFiles['data.js'] = { 
          content: question?.defaultFiles?.dataJs || '', 
          readOnly: true 
        };
      }
      
      newFiles['test.spec.js'] = { content: question?.jestTestFile || generateJestTests(assessment), readOnly: true };
      
      setFiles(newFiles);
      setActiveFile(Object.keys(newFiles)[0]);
    };
    
    loadFiles();
  }, [question?._id, attemptId]);

  const getLanguage = (filename) => {
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.js')) return 'javascript';
    return 'plaintext';
  };

  const handleCreateFile = () => {
    if (newFileName && !files[newFileName]) {
      setFiles({ ...files, [newFileName]: { content: '', readOnly: false } });
      setActiveFile(newFileName);
      setNewFileName('');
      setShowNewFileDialog(false);
    }
  };

  const handleDeleteFile = (filename) => {
    if (!files[filename].readOnly) {
      setFileToDelete(filename);
      setDeleteConfirmOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deleteConfirmText === 'delete' && fileToDelete) {
      const newFiles = { ...files };
      delete newFiles[fileToDelete];
      setFiles(newFiles);
      if (activeFile === fileToDelete) {
        setActiveFile(Object.keys(newFiles)[0]);
      }
      setDeleteConfirmOpen(false);
      setFileToDelete(null);
      setDeleteConfirmText('');
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const container = document.querySelector('[data-editor-preview-container]');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const editorWidth = ((e.clientX - rect.left) / rect.width) * 100;
      if (editorWidth >= 20 && editorWidth <= 80) {
        setPreviewWidth(100 - editorWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleLoadLastCode = async () => {
    if (attemptId && question?._id) {
      try {
        const token = localStorage.getItem('studentToken');
        const response = await apiService.getLastExecutedCode(token, attemptId);
        const lastExecutedFrontendCode = response.lastExecutedFrontendCode;
        if (lastExecutedFrontendCode?.[question._id]) {
          const backendCode = lastExecutedFrontendCode[question._id];
          const updatedFiles = { ...files };
          if (updatedFiles['index.html']) updatedFiles['index.html'].content = backendCode.html || '';
          if (updatedFiles['styles.css']) updatedFiles['styles.css'].content = backendCode.css || '';
          if (updatedFiles['script.js']) updatedFiles['script.js'].content = backendCode.js || '';
          setFiles(updatedFiles);
        }
      } catch (error) {
        console.error('Error loading last code:', error);
      }
    }
  };

  // Check if last code exists whenever question changes
  useEffect(() => {
    const checkLastCode = async () => {
      if (attemptId && question?._id) {
        try {
          const token = localStorage.getItem('studentToken');
          const response = await apiService.getLastExecutedCode(token, attemptId);
          const lastExecutedFrontendCode = response.lastExecutedFrontendCode;
          setLastCodeAvailable(!!lastExecutedFrontendCode?.[question._id]);
        } catch (error) {
          setLastCodeAvailable(false);
        }
      }
    };
    checkLastCode();
  }, [question?._id, attemptId]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, previewWidth]);

  const handleRunTests = async () => {
    setTestResults(null);
    setShowTestResults(true);
    try {
      const token = localStorage.getItem('studentToken');
      
      // Run tests in frontend
      const results = await frontendTestValidator.runAllTests(
        files['test.spec.js']?.content || '',
        files['index.html']?.content || '',
        files['styles.css']?.content || '',
        files['script.js']?.content || '',
        files['data.js']?.content || ''
      );
      
      setTestResults(results);
      
      // Notify parent component about test completion
      if (onTestComplete) {
        onTestComplete(results.passed, results.total, results.percentage);
      }
      
      // Save code to backend with percentage
      if (attemptId && question?._id) {
        await apiService.saveFrontendCode(
          token,
          attemptId,
          question._id,
          files['index.html']?.content || '',
          files['styles.css']?.content || '',
          files['script.js']?.content || '',
          {
            passed: results.passed,
            failed: results.failed,
            total: results.total,
            percentage: results.percentage,
            tests: results.tests
          }
        );
      }
    } catch (error) {
      console.error('Error running tests:', error);
      setTestResults({
        passed: 0,
        failed: 0,
        total: 0,
        tests: [],
        percentage: 0,
        error: 'Failed to run tests: ' + error.message
      });
    }
  };

  return (
    <Box 
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      onCopy={isProduction ? (e) => e.preventDefault() : undefined}
      onCut={isProduction ? (e) => e.preventDefault() : undefined}
      onPaste={isProduction ? (e) => e.preventDefault() : undefined}
      onContextMenu={isProduction ? (e) => e.preventDefault() : undefined}
      onSelectStart={isProduction ? (e) => e.preventDefault() : undefined}
    >
      {/* Toolbar */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: 2, 
        px: 2.5, 
        py: 1, 
        bgcolor: '#ffffff', 
        borderBottom: '1px solid #f1f5f9',
        overflowX: 'auto',
        minHeight: '68px',
        '&::-webkit-scrollbar': { height: '4px' },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: '4px' }
      }}>
        <Stack direction="row" alignItems="center" spacing={2.5}>
          {/* Font Size Control */}
          <Box sx={{ 
            display: 'flex', alignItems: 'center', gap: 0.5, 
            bgcolor: '#f8fafc', px: 1, py: 0.5, borderRadius: '12px',
            border: '1px solid #f1f5f9'
          }}>
            <IconButton size="small" onClick={() => setFontSize(prev => Math.max(10, prev - 2))} sx={{ color: '#64748b' }}>
              <Remove fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: '32px', textAlign: 'center', fontWeight: 900, color: '#0f172a', fontFamily: 'JetBrains Mono' }}>
              {fontSize}px
            </Typography>
            <IconButton size="small" onClick={() => setFontSize(prev => Math.min(24, prev + 2))} sx={{ color: '#64748b' }}>
              <Add fontSize="small" />
            </IconButton>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<FolderOpen sx={{ fontSize: '1.2rem' }} />}
            onClick={handleLoadLastCode}
            disabled={!lastCodeAvailable}
            sx={{ 
              textTransform: 'none', 
              borderRadius: '12px', 
              fontWeight: 800,
              px: 2,
              borderColor: '#e2e8f0',
              color: '#475569',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
              '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' }
            }}
          >
            Recover Session
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            variant="text"
            size="small"
            onClick={() => setShowPreview(!showPreview)}
            sx={{ 
              textTransform: 'none', 
              borderRadius: '12px', 
              fontWeight: 800,
              px: 2,
              color: showPreview ? '#6366f1' : '#64748b',
              bgcolor: showPreview ? '#f5f7ff' : 'transparent',
              '&:hover': { bgcolor: showPreview ? '#eff2ff' : '#f8fafc' }
            }}
          >
            {showPreview ? 'Stop Live Preview' : 'Launch Viewport'}
          </Button>
          
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayArrow />}
            onClick={handleRunTests}
            sx={{ 
              textTransform: 'none', 
              borderRadius: '12px', 
              fontWeight: 900,
              px: 3,
              py: 1,
              bgcolor: '#6366f1', 
              boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
              '&:hover': { bgcolor: '#4f46e5', boxShadow: '0 12px 20px -5px rgba(99, 102, 241, 0.4)' }
            }}
          >
            Deploy & Run Diagnostics
          </Button>
        </Stack>
      </Box>

      {/* Editor and Preview Container */}
      <Box 
        data-editor-preview-container
        sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', userSelect: isDragging ? 'none' : 'auto', pointerEvents: isDragging ? 'none' : 'auto' }}
      >
        {/* File Tabs and Editor */}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: showPreview ? `${100 - previewWidth}%` : '100%', borderRight: showPreview ? '1px solid #f1f5f9' : 'none' }}>
          {/* File Tabs */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            px: 2,
            py: 1.25, 
            bgcolor: '#f8fafc', 
            borderBottom: '1px solid #f1f5f9', 
            overflowX: 'auto', 
            minHeight: '52px',
            '&::-webkit-scrollbar': { height: '3px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0' }
          }}>
          {Object.keys(files).map(filename => (
            <Box
              key={filename}
              onClick={() => setActiveFile(filename)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.75,
                bgcolor: activeFile === filename ? '#ffffff' : 'transparent',
                color: activeFile === filename ? '#0f172a' : '#64748b',
                cursor: 'pointer',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: activeFile === filename ? '#e2e8f0' : 'transparent',
                boxShadow: activeFile === filename ? '0 2px 4px rgba(0,0,0,0.04)' : 'none',
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: activeFile === filename ? '#ffffff' : 'rgba(0,0,0,0.03)' }
              }}
            >
              <InsertDriveFile sx={{ fontSize: 16, color: activeFile === filename ? '#6366f1' : 'inherit', opacity: activeFile === filename ? 1 : 0.6 }} />
              <Typography variant="body2" sx={{ fontWeight: activeFile === filename ? 800 : 700, fontSize: '0.8rem', letterSpacing: '-0.01em' }}>{filename}</Typography>
              {files[filename].readOnly && <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#f59e0b', ml: 0.5 }} />}
            </Box>
          ))}
          </Box>

          {/* Editor */}
          <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden', bgcolor: '#1e1e1e' }}>
            <Editor
              key={activeFile}
              height="100%"
              language={getLanguage(activeFile)}
              value={files[activeFile]?.content || ''}
              theme="vs-dark"
              onChange={(value) => {
                if (!files[activeFile]?.readOnly) {
                  const updatedFiles = { ...files, [activeFile]: { ...files[activeFile], content: value } };
                  setFiles(updatedFiles);
                  
                  const localStorageKey = `frontend_${attemptId}_${question?._id}`;
                  localStorage.setItem(localStorageKey, JSON.stringify({
                    html: updatedFiles['index.html']?.content || '',
                    css: updatedFiles['styles.css']?.content || '',
                    js: updatedFiles['script.js']?.content || ''
                  }));
                }
              }}
              options={{
                fontSize: fontSize,
                minimap: { enabled: false },
                readOnly: files[activeFile]?.readOnly || false,
                wordWrap: 'on',
                padding: { top: 24 },
                fontFamily: "'JetBrains Mono', monospace",
                fontLigatures: true,
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                lineHeight: 1.6
              }}
            />
            {files[activeFile]?.readOnly && (
              <Box sx={{
                position: 'absolute',
                top: 20,
                right: 24,
                bgcolor: 'rgba(245, 158, 11, 0.1)',
                color: '#f59e0b',
                px: 1.5,
                py: 0.5,
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 900,
                border: '1px solid rgba(245, 158, 11, 0.3)',
                zIndex: 10,
                letterSpacing: '0.1em'
              }}>
                SECURED CONTENT
              </Box>
            )}
          </Box>
        </Box>

        {/* Draggable Divider */}
        {showPreview && (
          <Box
            sx={{
              width: '2px',
              cursor: 'col-resize',
              bgcolor: '#f1f5f9',
              '&:hover': { bgcolor: '#6366f1' },
              transition: 'background 0.2s',
              zIndex: 10
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
          />
        )}

        {/* Preview Panel */}
        {showPreview && (
          <Box sx={{ width: `${previewWidth}%`, bgcolor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: 2, py: 1.25, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Runtime Environment</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative', bgcolor: '#fff' }}>
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <style>
                      ::-webkit-scrollbar { width: 8px; height: 8px; }
                      ::-webkit-scrollbar-track { background: transparent; }
                      ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
                      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
                      ${files['styles.css']?.content || ''}
                    </style>
                  </head>
                  <body>
                    ${files['index.html']?.content || ''}
                    <script>${files['data.js']?.content || ''}</script>
                    <script>${files['script.js']?.content || ''}</script>
                  </body>
                  </html>
                `}
                sandbox="allow-scripts allow-same-origin"
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Preview"
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Test Results Modal */}
      <Dialog 
        open={showTestResults} 
        onClose={() => setShowTestResults(false)} 
        maxWidth="md" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' } }}
      >
        <DialogTitle sx={{ p: 4, pb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Execution Summary
            </Typography>
            <IconButton onClick={() => setShowTestResults(false)} sx={{ color: '#94a3b8' }}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 4, bgcolor: '#ffffff' }}>
          {!testResults ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <CircularProgress size={48} sx={{ color: '#6366f1', mb: 3 }} />
              <Typography variant="h5" sx={{ color: '#64748b', fontWeight: 600 }}>Analyzing build output...</Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ 
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 5
              }}>
                <Card sx={{ p: 3, borderRadius: '24px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9', boxShadow: 'none' }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', mb: 1, display: 'block' }}>Success Rate</Typography>
                  <Typography variant="h2" sx={{ fontWeight: 900, color: '#0f172a' }}>
                    {testResults.passed} <Typography component="span" sx={{ fontSize: '1.25rem', color: '#64748b', fontWeight: 700 }}>out of</Typography> {testResults.total}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mt: 0.5 }}>Validated Scenarios</Typography>
                </Card>

                <Card sx={{ p: 3, borderRadius: '24px', bgcolor: testResults.percentage >= 70 ? '#f0fdf4' : '#fef2f2', border: '1px solid', borderColor: testResults.percentage >= 70 ? '#dcfce7' : '#fee2e2', boxShadow: 'none' }}>
                  <Typography variant="caption" sx={{ color: testResults.percentage >= 70 ? '#22c55e' : '#ef4444', fontWeight: 800, textTransform: 'uppercase', mb: 1, display: 'block' }}>Score Projection</Typography>
                  <Typography variant="h2" sx={{ fontWeight: 900, color: testResults.percentage >= 70 ? '#14532d' : '#991b1b' }}>
                    {testResults.percentage}%
                  </Typography>
                  <Box sx={{ width: '100%', height: 6, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 3, mt: 1.5, overflow: 'hidden' }}>
                     <Box sx={{ width: `${testResults.percentage}%`, height: '100%', bgcolor: testResults.percentage >= 70 ? '#22c55e' : '#ef4444' }} />
                  </Box>
                </Card>
              </Box>

              {testResults.error && (
                <Box sx={{ mb: 4, p: 2.5, bgcolor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '16px' }}>
                  <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning sx={{ fontSize: 18 }} /> Runtime Exception
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 600, fontFamily: 'JetBrains Mono', display: 'block' }}>
                    {testResults.error}
                  </Typography>
                </Box>
              )}

              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 2.5 }}>Test Case Diagnostics</Typography>
              <Stack spacing={2}>
                {testResults.tests?.map((test, idx) => (
                  <Box key={idx} sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 2.5, 
                    p: 2.5, 
                    bgcolor: '#f8fafc',
                    borderRadius: '20px',
                    border: '1px solid #f1f5f9',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateX(8px)', borderColor: '#cbd5e1' }
                  }}>
                    <Box sx={{ 
                      width: 40, height: 40, borderRadius: '14px', flexShrink: 0,
                      bgcolor: test.passed ? '#dcfce7' : '#fee2e2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {test.passed ? <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} /> : <Close sx={{ color: '#ef4444', fontSize: 20 }} />}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>{test.name}</Typography>
                      {test.error ? (
                        <Box sx={{ mt: 1, p: 1.5, bgcolor: '#ffffff', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                           <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700, fontFamily: 'JetBrains Mono', display: 'block', lineHeight: 1.5 }}>
                            EXPECTED: {test.error}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mt: 0.5 }}>Scenario executed and verified successfully.</Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2 }}>
          <Button 
            onClick={() => setShowTestResults(false)} 
            variant="contained"
            fullWidth
            sx={{ 
                borderRadius: '16px', 
                py: 2, 
                fontWeight: 900,
                fontSize: '1rem',
                bgcolor: '#0f172a',
                '&:hover': { bgcolor: '#1e293b' } 
            }}
          >
            Return to Editor
          </Button>
        </DialogActions>
      </Dialog>

      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onClose={() => setShowNewFileDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Create Project File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Filename (e.g., config.js)"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            sx={{ 
                mt: 2,
                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowNewFileDialog(false)} sx={{ fontWeight: 700, color: '#64748b' }}>Cancel</Button>
          <Button 
            onClick={handleCreateFile} 
            variant="contained"
            sx={{ borderRadius: '12px', px: 3, fontWeight: 800, bgcolor: '#6366f1' }}
          >
            Create File
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => {
        setDeleteConfirmOpen(false);
        setFileToDelete(null);
        setDeleteConfirmText('');
      }} maxWidth="sm" fullWidth>
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to delete <strong>{fileToDelete}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Type <strong>delete</strong> to confirm:
          </Typography>
          <TextField
            autoFocus
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="delete"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteConfirmOpen(false);
            setFileToDelete(null);
            setDeleteConfirmText('');
          }}>Cancel</Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            color="error"
            disabled={deleteConfirmText !== 'delete'}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function generateJestTests(assessment) {
  return `// Jest Test Suite - READ ONLY
// These tests will validate your solution

describe('Frontend Assessment Tests', () => {
  test('renders correctly', () => {
    expect(document.querySelector('body')).toBeTruthy();
  });

  test('handles click events', () => {
    const button = document.querySelector('button');
    expect(button).toBeTruthy();
  });

  test('validates form input', () => {
    const input = document.querySelector('input');
    expect(input).toBeTruthy();
  });

  test('displays error messages', () => {
    const error = document.querySelector('.error');
    expect(error).toBeTruthy();
  });
});
`;
}
