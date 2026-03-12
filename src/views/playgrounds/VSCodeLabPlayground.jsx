import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Modal, Checkbox, IconButton, TextField, Menu, MenuItem } from '@mui/material';
import { Save, Delete, FolderOpen, InsertDriveFile, CreateNewFolder, NoteAdd, Close, Add, Remove, MoreVert } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { useLabs } from 'contexts/LabsContext';

export default function VSCodeLabPlayground() {
  const { labId } = useParams();
  const navigate = useNavigate();
  const { currentLab: lab, getLabById, saveProgress, submitLab, executeCommand } = useLabs();
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [fullscreenWarningTimer, setFullscreenWarningTimer] = useState(30);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [newItemName, setNewItemName] = useState('');
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItemType, setNewItemType] = useState('file');
  const [newItemParent, setNewItemParent] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [srsWidth, setSrsWidth] = useState(40);
  const [terminalHeight, setTerminalHeight] = useState(250);
  const [fontSize, setFontSize] = useState(14);
  const [isDragging, setIsDragging] = useState(null);
  const [currentDir, setCurrentDir] = useState('/');
  const [isExecuting, setIsExecuting] = useState(false);
  const [softwareChecks, setSoftwareChecks] = useState([]);
  const [checkingRequirements, setCheckingRequirements] = useState(false);
  const [instructionStep, setInstructionStep] = useState(0);
  const terminalInputRef = useRef(null);
  const terminalEndRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    getLabById(labId).then(labData => {
      if (labData?.initialFiles?.length) {
        setFiles(labData.initialFiles);
      }
    });
  }, [labId]);

  useEffect(() => {
    if (lab?.requiredSoftware?.length && showInstructions) {
      checkSoftwareRequirements();
    }
  }, [lab]);

  useEffect(() => {
    if (lab?.timeLimit) {
      setTimeRemaining(lab.timeLimit * 60);
    }
  }, [lab]);

  useEffect(() => {
    if (timeRemaining > 0 && !showInstructions) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, showInstructions]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !showInstructions) {
        setFullscreenExitCount(prev => prev + 1);
        setShowFullscreenWarning(true);
        setFullscreenWarningTimer(30);
      } else {
        setShowFullscreenWarning(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [showInstructions]);

  useEffect(() => {
    if (showFullscreenWarning && fullscreenWarningTimer > 0) {
      const timer = setInterval(() => {
        setFullscreenWarningTimer(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showFullscreenWarning, fullscreenWarningTimer]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        console.log('Tab switch detected:', tabSwitchCount + 1);
      }
    };

    if (!showInstructions) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [showInstructions, tabSwitchCount]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging === 'srs') {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 20 && newWidth < 60) setSrsWidth(newWidth);
      } else if (isDragging === 'terminal') {
        const header = 64;
        const newHeight = window.innerHeight - e.clientY - header;
        if (newHeight > 100 && newHeight < window.innerHeight - 200) setTerminalHeight(newHeight);
      }
    };

    const handleMouseUp = () => setIsDragging(null);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  const checkSoftwareRequirements = async () => {
    if (!lab?.requiredSoftware?.length) return;
    
    setCheckingRequirements(true);
    const checks = [];
    
    for (const sw of lab.requiredSoftware) {
      try {
        const response = await executeCommand(labId, sw.versionCommand || `${sw.command} --version`, [], '');
        const output = response.output || '';
        const isError = output.includes('not found') || 
                       output.includes('command not found') || 
                       output.includes('no input files') ||
                       output.includes('Unable to locate') ||
                       output.includes('is not recognized') ||
                       output.includes('No such file');
        checks.push({ 
          name: sw.name, 
          installed: !isError,
          version: !isError ? output.trim().split('\n')[0] : null
        });
      } catch (error) {
        checks.push({ name: sw.name, installed: false, version: null });
      }
    }
    
    setSoftwareChecks(checks);
    setCheckingRequirements(false);
  };

  const handleAutoSubmit = async () => {
    try {
      await submitLab(labId, files);
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      navigate('/labs');
    } catch (error) {
      console.error('Auto-submit error:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const createItem = () => {
    if (!newItemName.trim()) return;
    if (newItemName.length > 30) {
      addTerminalOutput('Error: Name must be less than 30 characters', 'error');
      return;
    }
    const fullPath = newItemParent ? `${newItemParent}/${newItemName}` : newItemName;
    const newItem = { 
      path: fullPath, 
      content: '', 
      readOnly: false,
      isFolder: newItemType === 'folder'
    };
    setFiles([...files, newItem]);
    if (newItemType === 'file') {
      setActiveFile(newItem);
    }
    setNewItemName('');
    setNewItemParent('');
    setShowNewItemDialog(false);
  };

  const deleteFile = (filePath) => {
    const filtered = files.filter(f => f.path !== filePath);
    setFiles(filtered);
    if (activeFile?.path === filePath) setActiveFile(filtered[0] || null);
    setDeleteConfirm(null);
  };

  const handleStartLab = async () => {
    if (!termsAccepted) return;
    try {
      await document.documentElement.requestFullscreen();
      setShowInstructions(false);
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const saveLabProgress = async () => {
    try {
      await saveProgress(labId, files);
      addTerminalOutput('File saved successfully', 'success');
    } catch (error) {
      addTerminalOutput('Error saving file', 'error');
    }
  };

  const addTerminalOutput = (text, type = 'output') => {
    setTerminalOutput(prev => [...prev, { text, type, timestamp: Date.now() }]);
  };

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  };

  const getFileTree = () => {
    const tree = [];
    
    const addToTree = (parentPath = '', level = 0) => {
      const items = files.filter(f => {
        const parts = f.path.split('/');
        const itemParent = parts.slice(0, -1).join('/');
        return itemParent === parentPath;
      }).sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.path.localeCompare(b.path);
      });
      
      items.forEach(item => {
        tree.push({ ...item, level });
        if (item.isFolder && expandedFolders.has(item.path)) {
          addToTree(item.path, level + 1);
        }
      });
    };
    
    addToTree();
    return tree;
  };

  const executeCommand = async (command) => {
    if (!command.trim()) {
      addTerminalOutput('', 'command');
      return;
    }

    addTerminalOutput(command, 'command');
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setIsExecuting(true);

    const parts = command.trim().split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    try {
      if (cmd === 'clear') {
        setTerminalOutput([]);
        setIsExecuting(false);
      } else if (cmd === 'cd') {
        const target = args[0] || '/';
        if (target === '/' || target === '~') {
          setCurrentDir('/');
          addTerminalOutput('', 'output');
        } else if (target === '..') {
          const parts = currentDir.split('/').filter(p => p);
          parts.pop();
          setCurrentDir(parts.length ? '/' + parts.join('/') : '/');
          addTerminalOutput('', 'output');
        } else {
          const newPath = currentDir === '/' ? target : `${currentDir}/${target}`.replace('//', '/');
          const folder = files.find(f => f.path === newPath && f.isFolder);
          if (folder) {
            setCurrentDir('/' + newPath);
            addTerminalOutput('', 'output');
          } else {
            addTerminalOutput(`cd: ${target}: No such directory`, 'error');
          }
        }
        setIsExecuting(false);
      } else if (cmd === 'npm' && args.length > 0) {
        const dirPath = currentDir === '/' ? '' : currentDir.substring(1);
        const packageJsonPath = dirPath ? `${dirPath}/package.json` : 'package.json';
        
        if (['install', 'i', 'start', 'run', 'test'].includes(args[0]) && !files.find(f => f.path === packageJsonPath)) {
          addTerminalOutput('Error: package.json not found. Run "npm init -y" first.', 'error');
          setIsExecuting(false);
          return;
        }
        if (['start', 'run', 'test', 'build'].includes(args[0])) {
          const nodeModulesPath = dirPath ? `${dirPath}/node_modules` : 'node_modules';
          const hasNodeModules = files.some(f => f.path === nodeModulesPath && f.isFolder);
          if (hasNodeModules) {
            addTerminalOutput('Error: node_modules from previous session cannot be used. Run "npm install" again in this session.', 'error');
            setIsExecuting(false);
            return;
          }
        }
        const npmCommand = `npm ${args.join(' ')}`;
        addTerminalOutput(`Running: ${npmCommand}...`, 'output');
        try {
          const response = await executeCommand(labId, npmCommand, files, dirPath);
          addTerminalOutput(response.output || 'Command executed', 'success');
          if (response.files?.length) setFiles(response.files);
          setIsExecuting(false);
        } catch (error) {
          addTerminalOutput(error.response?.data?.error || error.response?.data?.output || 'Command failed', 'error');
          setIsExecuting(false);
        }
      } else if (cmd === 'npx' && args.length > 0) {
        const npxCommand = `npx ${args.join(' ')}`;
        addTerminalOutput(`Running: ${npxCommand}...`, 'output');
        try {
          const response = await executeCommand(labId, npxCommand, files, '');
          addTerminalOutput(response.output || 'Command executed', 'success');
          if (response.files?.length) setFiles(response.files);
          setIsExecuting(false);
        } catch (error) {
          addTerminalOutput(error.response?.data?.error || error.response?.data?.output || 'Command failed', 'error');
          setIsExecuting(false);
        }
      } else if (cmd === 'ls') {
        const dirPath = currentDir === '/' ? '' : currentDir.substring(1);
        const items = files.filter(f => {
          if (dirPath === '') return !f.path.includes('/');
          return f.path.startsWith(dirPath + '/') && f.path.substring(dirPath.length + 1).indexOf('/') === -1;
        }).map(f => f.path.split('/').pop());
        addTerminalOutput(items.join('\n') || 'No files', 'output');
        setIsExecuting(false);
      } else if (cmd === 'pwd') {
        addTerminalOutput(currentDir, 'output');
        setIsExecuting(false);
      } else if (cmd === 'cat' && args[0]) {
        const file = files.find(f => f.path === args[0] && !f.isFolder);
        if (file) {
          addTerminalOutput(file.content || '(empty file)', 'output');
        } else {
          addTerminalOutput(`cat: ${args[0]}: No such file`, 'error');
        }
        setIsExecuting(false);
      } else if (cmd === 'mkdir' && args[0]) {
        const newFolder = { path: args[0], isFolder: true, readOnly: false };
        setFiles(prev => [...prev, newFolder]);
        addTerminalOutput(`Created directory: ${args[0]}`, 'success');
        setIsExecuting(false);
      } else if (cmd === 'touch' && args[0]) {
        const newFile = { path: args[0], content: '', readOnly: false, isFolder: false };
        setFiles(prev => [...prev, newFile]);
        addTerminalOutput(`Created file: ${args[0]}`, 'success');
        setIsExecuting(false);
      } else if (cmd === 'rm' && args[0]) {
        const filtered = files.filter(f => f.path !== args[0]);
        if (filtered.length < files.length) {
          setFiles(filtered);
          if (activeFile?.path === args[0]) setActiveFile(null);
          addTerminalOutput(`Removed: ${args[0]}`, 'success');
        } else {
          addTerminalOutput(`rm: ${args[0]}: No such file or directory`, 'error');
        }
        setIsExecuting(false);
      } else if (cmd === 'node' && args[0]) {
        const file = files.find(f => f.path === args[0]);
        if (file) {
          addTerminalOutput(`Executing ${args[0]}...`, 'output');
          setTimeout(() => {
            addTerminalOutput('Hello World', 'output');
            setIsExecuting(false);
          }, 300);
        } else {
          addTerminalOutput(`node: ${args[0]}: No such file`, 'error');
          setIsExecuting(false);
        }
      } else if ((cmd === 'python' || cmd === 'python3') && args[0]) {
        const file = files.find(f => f.path === args[0]);
        if (file) {
          addTerminalOutput(`Executing ${args[0]}...`, 'output');
          setTimeout(() => {
            addTerminalOutput('Hello World', 'output');
            setIsExecuting(false);
          }, 300);
        } else {
          addTerminalOutput(`python: ${args[0]}: No such file`, 'error');
          setIsExecuting(false);
        }
      } else if (cmd === 'help') {
        addTerminalOutput('Available commands:\ncd <dir> - change directory\nls - list files\npwd - print working directory\ncat <file> - show file content\nmkdir <name> - create directory\ntouch <name> - create file\nrm <name> - remove file\nnode <file> - run JavaScript\npython <file> - run Python\nnpm <args> - run npm commands\nnpx <args> - run npx commands\nclear - clear terminal', 'output');
        setIsExecuting(false);
      } else {
        addTerminalOutput(`bash: ${cmd}: command not found`, 'error');
        setIsExecuting(false);
      }
    } catch (error) {
      addTerminalOutput(`Error: ${error.message}`, 'error');
      setIsExecuting(false);
    }
  };

  const handleTerminalKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(terminalInput);
      setTerminalInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setTerminalInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setTerminalInput('');
        } else {
          setHistoryIndex(newIndex);
          setTerminalInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const getLanguage = (path) => {
    if (path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.py')) return 'python';
    if (path.endsWith('.html')) return 'html';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.sh')) return 'shell';
    if (path.endsWith('.c')) return 'c';
    if (path.endsWith('.cpp')) return 'cpp';
    if (path.endsWith('.java')) return 'java';
    return 'plaintext';
  };

  if (!lab) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;

  if (showInstructions) {
    return (
      <Dialog open={showInstructions} maxWidth="md" fullWidth disableEscapeKeyDown>
        <DialogTitle sx={{ bgcolor: 'primary.lighter', textAlign: 'center', py: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {instructionStep === 0 ? 'Software Requirements' : 'Lab Instructions'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {instructionStep === 0 ? (
            <>
              {lab.requiredSoftware?.length > 0 ? (
                <Box>
                  <Typography variant="body1" sx={{ mb: 3 }}>Please ensure the following software is installed on your system:</Typography>
                  {checkingRequirements ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, py: 4 }}>
                      <CircularProgress />
                      <Typography variant="body1">Checking installed software...</Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                        {softwareChecks.map((check, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: check.installed ? 'success.lighter' : 'error.lighter', borderRadius: 2 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: check.installed ? 'success.main' : 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography sx={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>{check.installed ? '✓' : '✗'}</Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>{check.name}</Typography>
                              {check.version && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{check.version}</Typography>}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                      {softwareChecks.some(c => !c.installed) && (
                        <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 2 }}>
                          <Typography variant="body2" color="error.dark" sx={{ fontWeight: 600 }}>
                            ⚠️ Please install all required software before proceeding with the lab.
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>No software requirements for this lab.</Typography>
              )}
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Requirements</Typography>
              <Box component="ul" sx={{ pl: 3, mb: 3 }}>
                {lab.srs?.requirements?.map((req, i) => (
                  <Typography key={i} component="li" variant="body1" sx={{ mb: 1 }}>{req}</Typography>
                ))}
              </Box>
              <Box sx={{ p: 3, bgcolor: 'error.lighter', borderRadius: 2, mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, color: 'error.dark' }}>Important Rules:</Typography>
                <Typography variant="body2" color="error.dark">
                  • Fullscreen mode is required throughout the lab<br/>
                  • Tab switches are monitored and counted<br/>
                  • Time limit: {lab.timeLimit} minutes<br/>
                  • Auto-submit on time expiry or violations
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                <Typography variant="body1">I have read and agree to all instructions and rules</Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button onClick={() => navigate('/labs')} variant="outlined">Cancel</Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {instructionStep === 1 && (
              <Button onClick={() => setInstructionStep(0)} variant="outlined">Back</Button>
            )}
            {instructionStep === 0 ? (
              <Button 
                onClick={() => setInstructionStep(1)} 
                variant="contained" 
                disabled={checkingRequirements || (lab.requiredSoftware?.length > 0 && softwareChecks.some(c => !c.installed))}
                size="large"
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleStartLab} 
                variant="contained" 
                disabled={!termsAccepted} 
                size="large"
              >
                Start Lab
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#1e1e1e', userSelect: isDragging ? 'none' : 'auto' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 3, zIndex: 10 }}>
        <Typography variant="h6" sx={{ color: '#000', flex: 1, fontWeight: 600 }}>{lab.title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#888', fontSize: '12px' }}>TIME</Typography>
            <Typography sx={{ color: timeRemaining < 60 ? '#f44336' : '#4caf50', fontWeight: 700, fontSize: '20px' }}>{formatTime(timeRemaining)}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#888', fontSize: '12px' }}>TAB SWITCHES</Typography>
            <Typography sx={{ color: '#ff9800', fontWeight: 700, fontSize: '20px' }}>{tabSwitchCount}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#888', fontSize: '12px' }}>FS EXITS</Typography>
            <Typography sx={{ color: '#ff9800', fontWeight: 700, fontSize: '20px' }}>{fullscreenExitCount}</Typography>
          </Box>
          <Button variant="contained" color="error" onClick={handleAutoSubmit}>Submit Lab</Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <Box sx={{ width: `${srsWidth}%`, overflow: 'auto', bgcolor: '#fff', p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Requirements</Typography>
          <Box component="ul" sx={{ pl: 3, mb: 3 }}>
            {lab.srs?.requirements?.map((req, i) => (
              <Typography key={i} component="li" variant="body2" sx={{ mb: 1 }}>{req}</Typography>
            ))}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Test Cases</Typography>
          {lab.testCases?.filter(tc => tc.isPublic).map((tc, i) => (
            <Box key={i} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}><strong>Input:</strong> {tc.input || 'None'}</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}><strong>Expected:</strong> {tc.expectedOutput}</Typography>
            </Box>
          ))}
        </Box>

        <Box
          onMouseDown={() => setIsDragging('srs')}
          sx={{
            width: '4px',
            bgcolor: '#e0e0e0',
            cursor: 'col-resize',
            '&:hover': { bgcolor: '#2196f3' },
            transition: 'background-color 0.2s'
          }}
        />

        <Box sx={{ flex: 1, display: 'flex', height: '100%', bgcolor: '#1e1e1e' }}>
          {/* File Explorer */}
          <Box sx={{ width: '200px', bgcolor: '#252526', borderRight: '1px solid #333', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
              <Typography variant="caption" sx={{ color: '#ccc', textTransform: 'uppercase', fontWeight: 600 }}>Explorer</Typography>
              <Box>
                <IconButton size="small" onClick={() => { setNewItemType('file'); setShowNewItemDialog(true); }} sx={{ color: '#ccc' }} title="New File">
                  <NoteAdd fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => { setNewItemType('folder'); setShowNewItemDialog(true); }} sx={{ color: '#ccc' }} title="New Folder">
                  <CreateNewFolder fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#555', borderRadius: '3px' } }}>
              {getFileTree().map(file => (
                <Box
                  key={file.path}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    pl: 1 + file.level * 2,
                    cursor: 'pointer',
                    bgcolor: activeFile?.path === file.path ? '#37373d' : 'transparent',
                    '&:hover': { bgcolor: '#2a2d2e', '& .file-menu-icon': { opacity: 1 } }
                  }}
                  onClick={() => {
                    if (file.isFolder) {
                      toggleFolder(file.path);
                    } else {
                      if (!openFiles.find(f => f.path === file.path)) {
                        setOpenFiles([...openFiles, file]);
                      }
                      setActiveFile(file);
                    }
                  }}
                >
                  {file.isFolder && (
                    <Box sx={{ color: '#ccc', mr: 0.5, fontSize: '12px' }}>
                      {expandedFolders.has(file.path) ? '▼' : '▶'}
                    </Box>
                  )}
                  <Box sx={{ color: file.isFolder ? '#dcb67a' : '#519aba', mr: 1 }}>
                    {file.isFolder ? <FolderOpen fontSize="small" /> : <InsertDriveFile fontSize="small" />}
                  </Box>
                  <Typography variant="body2" sx={{ color: '#ccc', flex: 1, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                    {file.path.split('/').pop()}
                  </Typography>
                  <IconButton 
                    size="small" 
                    className="file-menu-icon"
                    sx={{ color: '#888', opacity: 0, transition: 'opacity 0.2s', p: 0.5 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, file });
                    }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Editor + Terminal */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Editor Section */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
              {/* Open Files Tabs */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                bgcolor: '#252526', 
                borderBottom: '1px solid #333',
                overflowX: 'auto',
                '&::-webkit-scrollbar': { height: '6px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#555', borderRadius: '3px' }
              }}>
                {openFiles.map((file) => (
                  <Box
                    key={file.path}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      bgcolor: activeFile?.path === file.path ? '#1e1e1e' : 'transparent',
                      borderRight: '1px solid #333',
                      minWidth: 'fit-content',
                      '&:hover': { bgcolor: activeFile?.path === file.path ? '#1e1e1e' : '#2a2d2e' }
                    }}
                    onClick={() => setActiveFile(file)}
                  >
                    <InsertDriveFile sx={{ fontSize: 16, color: '#519aba' }} />
                    <Typography variant="body2" sx={{ color: '#ccc', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {file.path.split('/').pop()}
                    </Typography>
                    <Close 
                      sx={{ fontSize: 16, color: '#888', '&:hover': { color: '#fff' } }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const filtered = openFiles.filter(f => f.path !== file.path);
                        setOpenFiles(filtered);
                        if (activeFile?.path === file.path) {
                          setActiveFile(filtered[filtered.length - 1] || null);
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>

              {/* Editor Toolbar */}
              <Box sx={{ p: 1.5, bgcolor: '#252526', borderBottom: '1px solid #333', display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#ccc', flex: 1, fontSize: '13px' }}>
                  {activeFile?.path || 'No file selected'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#1e1e1e', borderRadius: 1, px: 1, py: 0.5 }}>
                  <IconButton size="small" onClick={() => setFontSize(prev => Math.max(10, prev - 2))} sx={{ color: '#ccc', p: 0.5 }}>
                    <Remove fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" sx={{ color: '#ccc', minWidth: '30px', textAlign: 'center', fontSize: '12px' }}>
                    {fontSize}px
                  </Typography>
                  <IconButton size="small" onClick={() => setFontSize(prev => Math.min(24, prev + 2))} sx={{ color: '#ccc', p: 0.5 }}>
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
                <Button size="small" variant="outlined" startIcon={<Save />} onClick={saveLabProgress} sx={{ color: '#ccc', borderColor: '#555', textTransform: 'none', fontSize: '12px' }}>
                  Save
                </Button>
              </Box>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {activeFile ? (
                  <Editor
                    height="100%"
                    language={getLanguage(activeFile.path)}
                    value={activeFile.content}
                    theme="vs-dark"
                    onChange={(value) => {
                      setFiles(files.map(f => f.path === activeFile?.path ? { ...f, content: value } : f));
                      setOpenFiles(openFiles.map(f => f.path === activeFile?.path ? { ...f, content: value } : f));
                    }}
                    onMount={(editor) => { editorRef.current = editor; }}
                    options={{ fontSize: fontSize, minimap: { enabled: false }, scrollBeyondLastLine: false, lineNumbersMinChars: 1, glyphMargin: false, folding: false, lineDecorationsWidth: 0, lineNumbers: 'on', padding: { left: 20 } }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', bgcolor: '#1e1e1e' }}>
                    <Typography sx={{ color: '#888' }}>Select a file to start editing</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box
              onMouseDown={() => setIsDragging('terminal')}
              sx={{
                height: '4px',
                bgcolor: isDragging === 'terminal' ? '#2196f3' : '#333',
                cursor: 'row-resize',
                '&:hover': { bgcolor: '#2196f3' },
                transition: 'background-color 0.2s',
                zIndex: 1
              }}
            />

            {/* Terminal Section */}
            <Box sx={{ height: `${terminalHeight}px`, display: 'flex', flexDirection: 'column', bgcolor: '#1e1e1e', flexShrink: 0 }}>
              <Box sx={{ p: 1, bgcolor: '#252526', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#ccc', textTransform: 'uppercase', fontWeight: 600 }}>Terminal</Typography>
                <Button size="small" onClick={() => { setTerminalOutput([]); setTerminalInput(''); }} sx={{ color: '#888', fontSize: '11px', textTransform: 'none', minWidth: 'auto', p: 0.5 }}>Clear</Button>
              </Box>
              <Box 
                sx={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  p: 2, 
                  fontFamily: 'monospace', 
                  fontSize: '13px', 
                  bgcolor: '#1e1e1e',
                  '&::-webkit-scrollbar': { width: '8px' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#555', borderRadius: '4px' },
                  '&::-webkit-scrollbar-track': { bgcolor: '#1e1e1e' }
                }}
                onClick={() => terminalInputRef.current?.focus()}
              >
                {terminalOutput.map((line, i) => (
                  <Box key={i} sx={{ mb: 0.5 }}>
                    {line.type === 'command' && (
                      <Box sx={{ display: 'flex' }}>
                        <Typography sx={{ color: '#4caf50', mr: 1 }}>$</Typography>
                        <Typography sx={{ color: '#ccc' }}>{line.text}</Typography>
                      </Box>
                    )}
                    {line.type === 'output' && (
                      <Typography sx={{ color: '#ccc', whiteSpace: 'pre-wrap' }}>{line.text}</Typography>
                    )}
                    {line.type === 'error' && (
                      <Typography sx={{ color: '#f44336', whiteSpace: 'pre-wrap' }}>{line.text}</Typography>
                    )}
                    {line.type === 'success' && (
                      <Typography sx={{ color: '#4caf50', whiteSpace: 'pre-wrap' }}>{line.text}</Typography>
                    )}
                  </Box>
                ))}
                {!isExecuting && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ color: '#4caf50', mr: 1 }}>{currentDir}$</Typography>
                    <Box
                      ref={terminalInputRef}
                      component="input"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyDown={handleTerminalKeyDown}
                      autoFocus
                      sx={{
                        flex: 1,
                        bgcolor: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#ccc',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        caretColor: '#ccc'
                      }}
                    />
                  </Box>
                )}
                <div ref={terminalEndRef} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* New Item Dialog */}
      <Dialog open={showNewItemDialog} onClose={() => { setShowNewItemDialog(false); setNewItemParent(''); }} maxWidth="sm" fullWidth>
        <DialogTitle>Create New {newItemType === 'folder' ? 'Folder' : 'File'}{newItemParent && ` in ${newItemParent}`}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            fullWidth
            label={newItemType === 'folder' ? 'Folder name' : 'File name'}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createItem()}
            size="medium"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowNewItemDialog(false)} size="large">Cancel</Button>
          <Button onClick={createItem} variant="contained" size="large">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography>Are you sure you want to delete <strong>{deleteConfirm?.path}</strong>?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)} size="large">Cancel</Button>
          <Button onClick={() => deleteFile(deleteConfirm.path)} variant="contained" color="error" size="large">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
      >
        <MenuItem onClick={() => {
          setDeleteConfirm(contextMenu?.file);
          setContextMenu(null);
        }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
        {contextMenu?.file?.isFolder && (
          <>
            <MenuItem onClick={() => {
              setNewItemType('file');
              setNewItemParent(contextMenu.file.path);
              setShowNewItemDialog(true);
              setContextMenu(null);
            }}>
              <NoteAdd fontSize="small" sx={{ mr: 1 }} /> New File
            </MenuItem>
            <MenuItem onClick={() => {
              setNewItemType('folder');
              setNewItemParent(contextMenu.file.path);
              setShowNewItemDialog(true);
              setContextMenu(null);
            }}>
              <CreateNewFolder fontSize="small" sx={{ mr: 1 }} /> New Folder
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Fullscreen Warning Modal */}
      <Modal open={showFullscreenWarning} disableEscapeKeyDown>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 6, borderRadius: 3, textAlign: 'center', minWidth: 500 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'error.main' }}>Fullscreen Required</Typography>
          <Typography variant="h5" sx={{ color: 'text.secondary', mb: 3 }}>Lab will auto-submit in:</Typography>
          <Box sx={{ width: 150, height: 150, borderRadius: '50%', background: `conic-gradient(#f44336 ${((30 - fullscreenWarningTimer) / 30) * 360}deg, #e0e0e0 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
            <Box sx={{ width: 120, height: 120, borderRadius: '50%', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h1" sx={{ fontWeight: 900, color: 'error.main', fontFamily: 'monospace' }}>{fullscreenWarningTimer}</Typography>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ mb: 3 }}>Fullscreen exits: <strong>{fullscreenExitCount}</strong></Typography>
          <Button variant="contained" color="error" size="large" fullWidth onClick={() => document.documentElement.requestFullscreen()}>Enter Fullscreen</Button>
        </Box>
      </Modal>
    </Box>
  );
}
