import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Delete, FolderOpen, InsertDriveFile, PlayArrow, Remove } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import apiService from '../../../services/apiService';

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
      const results = await apiService.runFrontendTests(token, {
        html: files['index.html']?.content || '',
        css: files['styles.css']?.content || '',
        js: files['script.js']?.content || '',
        testFile: files['test.spec.js']?.content || ''
      });
      setTestResults(results);
      
      // Notify parent component about test completion
      if (onTestComplete) {
        onTestComplete(results.passed, results.total);
      }
      
      // Save code to backend after running tests
      if (attemptId && question?._id) {
        await apiService.saveFrontendCode(
          token,
          attemptId,
          question._id,
          files['index.html']?.content || '',
          files['styles.css']?.content || '',
          files['script.js']?.content || '',
          results
        );
      }
    } catch (error) {
      console.error('Error running tests:', error);
      setTestResults({
        passed: 0,
        failed: 0,
        total: 0,
        tests: [],
        error: 'Failed to run tests'
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={() => setFontSize(prev => Math.max(10, prev - 2))}>
            <Remove fontSize="small" />
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: '30px', textAlign: 'center' }}>
            {fontSize}
          </Typography>
          <IconButton size="small" onClick={() => setFontSize(prev => Math.min(24, prev + 2))}>
            <Add fontSize="small" />
          </IconButton>
        </Box>
        <Button
          variant="outlined"
          size="medium"
          onClick={handleLoadLastCode}
          disabled={!lastCodeAvailable}
          sx={{ textTransform: 'none', px: 3, py: 1 }}
        >
          Last Code
        </Button>
        <Button
          variant="contained"
          size="medium"
          onClick={() => setShowPreview(!showPreview)}
          sx={{ textTransform: 'none', ml: 'auto', px: 3, py: 1 }}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
        <Button
          variant="contained"
          size="medium"
          startIcon={<PlayArrow />}
          onClick={handleRunTests}
          sx={{ textTransform: 'none', bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, px: 3, py: 1 }}
        >
          Run Tests
        </Button>
      </Box>

      {/* Editor and Preview Container */}
      <Box 
        data-editor-preview-container
        sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', userSelect: isDragging ? 'none' : 'auto', pointerEvents: isDragging ? 'none' : 'auto' }}
      >
        {/* File Tabs and Editor */}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: showPreview ? `${100 - previewWidth}%` : '100%', borderRight: showPreview ? '1px solid #e0e0e0' : 'none' }}>
          {/* File Tabs */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', overflowX: 'auto', minHeight: '48px', '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {Object.keys(files).map(filename => (
            <Box
              key={filename}
              onClick={() => setActiveFile(filename)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                bgcolor: activeFile === filename ? '#fff' : 'transparent',
                color: '#000',
                cursor: 'pointer',
                borderRadius: 1,
                border: activeFile === filename ? '1px solid #e0e0e0' : 'none',
                '&:hover': { bgcolor: '#e8e8e8' }
              }}
            >
              <InsertDriveFile sx={{ fontSize: 16 }} />
              <Typography variant="body2">{filename}</Typography>
              {/* {!files[filename].readOnly && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(filename);
                  }}
                  sx={{ color: '#000', p: 0.5 }}
                >
                  <Delete sx={{ fontSize: 14 }} />
                </IconButton>
              )} */}
            </Box>
          ))}
          </Box>

          {/* Editor */}
          <Box sx={{ flexGrow: 1, position: 'relative', '& .monaco-editor .overflow-guard': { '& .scrollbar': { display: 'none !important' } } }}>
            <Editor
              key={activeFile}
              height="100%"
              language={getLanguage(activeFile)}
              value={files[activeFile]?.content || ''}
              theme="light"
              onChange={(value) => {
                if (!files[activeFile]?.readOnly) {
                  const updatedFiles = { ...files, [activeFile]: { ...files[activeFile], content: value } };
                  setFiles(updatedFiles);
                  
                  // Save to localStorage on every change
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
                scrollbar: {
                  vertical: 'hidden',
                  horizontal: 'hidden'
                }
              }}
            />
            {files[activeFile]?.readOnly && (
              <Box sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: '#ff9800',
                color: '#fff',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                fontSize: '12px',
                fontWeight: 600
              }}>
                READ ONLY
              </Box>
            )}
          </Box>
        </Box>

        {/* Draggable Divider */}
        {showPreview && (
          <Box
            sx={{
              width: '4px',
              cursor: 'col-resize',
              bgcolor: '#6a0dad',
              '&:hover': { bgcolor: '#5a0d9d' },
              pointerEvents: 'auto'
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
          />
        )}

        {/* Preview Panel */}
        {showPreview && (
          <Box sx={{ width: `${previewWidth}%`, bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Preview</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <style>${files['styles.css']?.content || ''}</style>
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
                onLoad={(e) => {
                  // Prevent iframe from stealing focus
                  e.target.contentWindow.addEventListener('focus', (evt) => {
                    evt.stopPropagation();
                  });
                }}
              />
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  pointerEvents: 'auto',
                  zIndex: 1
                }} 
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Test Results Modal */}
      <Dialog open={showTestResults} onClose={() => setShowTestResults(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Test Results
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {!testResults ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1">Running tests...</Typography>
            </Box>
          ) : (
            <>
              <Typography variant="h6" sx={{ mb: 3 }}>
                {testResults.passed}/{testResults.total} Tests Passed
              </Typography>
              {testResults.error && (
                <Typography variant="body2" sx={{ color: 'error.main', mb: 2 }}>
                  {testResults.error}
                </Typography>
              )}
              {testResults.tests?.map((test, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, bgcolor: test.status === 'passed' ? '#e8f5e9' : '#ffebee', borderRadius: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: test.status === 'passed' ? '#10b981' : '#ef4444'
                    }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{test.name}</Typography>
                </Box>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setShowTestResults(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onClose={() => setShowNewFileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="File Name"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="example.js"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewFileDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateFile} variant="contained">Create</Button>
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
