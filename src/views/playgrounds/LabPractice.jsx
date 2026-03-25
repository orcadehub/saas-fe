import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, CircularProgress, Dialog, DialogTitle, 
  DialogContent, IconButton, Tooltip, TextField 
} from '@mui/material';
import { 
  NoteAdd, CreateNewFolder, Close, PlayArrow, 
  FolderOpen, InsertDriveFile, Delete, MoreVert, AccountTree,
  ExpandMore, ChevronRight, Terminal as TerminalIcon
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';

// Premium VS Code Theme Constants
const VSCODE_THEME = {
    bgEditor: '#1e1e2e',      // Deep Space Blue-Dark
    bgSidebar: '#16161e',     // Darker Sidebar
    bgTerminal: '#10101a',    // Pure Terminal Dark
    border: '#2a2a3a',        // Subtle Border
    accent: '#7c4dff',        // Purple Accent
    textDefault: '#d0d0e0',   // Soft White text
    textMuted: '#6e6e8e'      // Muted text
};

const labQuestions = {
    'c-programming': [
      { id: 1, title: 'Hello World', difficulty: 'Easy', topics: ['Basics', 'Syntax'], description: 'Create a program to output "Hello World".', example: { input: 'None', output: 'Hello World' }, constraints: ['Time limit: 1s', 'Memory: 256MB'], completed: false },
      { id: 2, title: 'Basic Calculator', difficulty: 'Easy', topics: ['Switch Case', 'Operators'], description: 'Implement a two-number calculator.', example: { input: '5 + 3', output: '8' }, constraints: ['Handles +,-,*,/'], completed: false }
    ],
    // ... Add others as needed for demo
};

export default function LabPractice() {
    const { labId, questionId } = useParams();
    const navigate = useNavigate();
    
    // Virtual Filesystem State
    const [files, setFiles] = useState([
        { id: 'root', name: 'LAB-WORKSPACE', type: 'folder', isOpen: true, parentId: null }
    ]);
    const [activeFileId, setActiveFileId] = useState(null);
    const [openFileIds, setOpenFileIds] = useState([]);
    
    // Multi-Terminal System
    const [terminals, setTerminals] = useState([{ id: 'default', name: 'bash', logs: [] }]);
    const [activeTermId, setActiveTermId] = useState('default');
    const [terminalCommand, setTerminalCommand] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    
    // UI States
    const [isSRSModalOpen, setIsSRSModalOpen] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(260);
    const terminalEndRef = useRef(null);

    const currentQuestion = labQuestions[labId]?.find(q => q.id === parseInt(questionId)) || {
        title: 'Laboratory Experiment',
        description: 'Complete the tasks as specified in the SRS document.',
        example: { input: 'v1.0.0', output: 'Success' },
        constraints: ['Strict time limit applied', 'Memory monitoring active']
    };

    const activeTerminal = terminals.find(t => t.id === activeTermId) || terminals[0];

    // Helper: Find file by ID
    const findFile = (id) => files.find(f => f.id === id);

    // Virtual Shell Processor (Frontend Only - NO DISK ACCESSS)
    const appendLog = (text, type = 'output') => {
        setTerminals(prev => prev.map(t => t.id === activeTermId ? {
            ...t,
            logs: [...t.logs, { id: Date.now() + Math.random(), text, type }]
        } : t));
    };

    const processCommand = (cmd) => {
        const parts = cmd.trim().split(' ');
        const base = parts[0].toLowerCase();
        const arg = parts[1];

        switch(base) {
            case 'clear':
                setTerminals(prev => prev.map(t => t.id === activeTermId ? { ...t, logs: [] } : t));
                break;
            case 'ls':
                const visible = files.filter(f => f.parentId === 'root').map(f => f.name).join('  ');
                appendLog(visible || 'Directory is empty');
                break;
            case 'pwd':
                appendLog('C:\\Users\\Student\\LAB-WORKSPACE');
                break;
            case 'mkdir':
                if (!arg) appendLog('Error: Specify folder name', 'error');
                else {
                    const id = `folder_${Date.now()}`;
                    setFiles(prev => [...prev, { id, name: arg, type: 'folder', parentId: 'root', isOpen: true }]);
                    appendLog(`Directory created: ${arg}`, 'success');
                }
                break;
            case 'touch':
                if (!arg) appendLog('Error: Specify file name', 'error');
                else {
                    const id = `file_${Date.now()}`;
                    setFiles(prev => [...prev, { id, name: arg, type: 'file', parentId: 'root', content: '', language: 'javascript' }]);
                    appendLog(`File created: ${arg}`, 'success');
                }
                break;
            case 'npm':
                if (parts[1] === 'init' && parts[2] === '-y') {
                    const id = `pkg_${Date.now()}`;
                    setFiles(prev => [...prev, { id, name: 'package.json', type: 'file', parentId: 'root', content: '{\n  "name": "lab-project",\n  "version": "1.0.0"\n}', language: 'json' }]);
                    appendLog('Wrote to package.json', 'success');
                } else {
                    appendLog(`npm command '${parts[1]}' requires network access (simulation only).`, 'info');
                }
                break;
            case 'rm':
                if (!arg) appendLog('Error: Specify target', 'error');
                else {
                    const target = files.find(f => f.name === arg);
                    if (target) {
                        setFiles(prev => prev.filter(f => f.id !== target.id));
                        appendLog(`Deleted: ${arg}`, 'info');
                    } else appendLog(`File not found: ${arg}`, 'error');
                }
                break;
            default:
                appendLog(`'${base}' is not recognized as an internal or external command.`, 'error');
        }
    };

    const handleTerminalSubmit = (e) => {
        if (e.key === 'Enter' && terminalCommand.trim()) {
            const cmd = terminalCommand.trim();
            appendLog(`PS C:\\Users\\Student\\LAB-WORKSPACE> ${cmd}`, 'prompt');
            setTerminalCommand('');
            processCommand(cmd);
        }
    };

    // Auto-scroll terminal
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminals, activeTermId]);

    const activeFile = files.find(f => f.id === activeFileId);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: VSCODE_THEME.bgEditor, color: VSCODE_THEME.textDefault }}>
            {/* Minimal Header */}
            <Box sx={{ px: 2, py: 1, bgcolor: VSCODE_THEME.bgSidebar, borderBottom: `1px solid ${VSCODE_THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>{currentQuestion.title}</Typography>
                    <Box sx={{ bgcolor: VSCODE_THEME.accent + '20', color: VSCODE_THEME.accent, px: 1, py: 0.2, borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>V-SANDBOX</Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                        size="small" 
                        variant="contained" 
                        startIcon={<AccountTree fontSize="small" />}
                        onClick={() => setIsSRSModalOpen(true)}
                        sx={{ bgcolor: '#333', '&:hover': { bgcolor: '#444' }, textTransform: 'none', fontSize: '12px' }}
                    >
                        View SRS
                    </Button>
                    <Button 
                        size="small" 
                        variant="contained" 
                        startIcon={<TerminalIcon fontSize="small" />}
                        onClick={() => setIsMinimized(!isMinimized)}
                        sx={{ bgcolor: VSCODE_THEME.accent, '&:hover': { bgcolor: '#6236ff' }, textTransform: 'none', fontSize: '12px' }}
                    >
                        {isMinimized ? 'Open Terminal' : 'Hide Terminal'}
                    </Button>
                </Box>
            </Box>

            {/* Main Layout */}
            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                {/* Explorer */}
                <Box sx={{ width: sidebarWidth, bgcolor: VSCODE_THEME.bgSidebar, borderRight: `1px solid ${VSCODE_THEME.border}`, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px' }}>EXPLORER</Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
                        {files.filter(f => f.parentId === null || f.parentId === 'root').map(file => (
                            <Box key={file.id} 
                                onClick={() => file.type === 'file' && setActiveFileId(file.id)}
                                sx={{ 
                                    display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, borderRadius: '4px', cursor: 'pointer',
                                    bgcolor: activeFileId === file.id ? '#ffffff10' : 'transparent',
                                    '&:hover': { bgcolor: '#ffffff05' }
                                }}>
                                {file.type === 'folder' ? <FolderOpen sx={{ fontSize: 16, color: '#dcb67a' }} /> : <InsertDriveFile sx={{ fontSize: 16, color: '#519aba' }} />}
                                <Typography variant="body2" sx={{ fontSize: '13px' }}>{file.name}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Editor & Terminal Area */}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Editor */}
                    <Box sx={{ flexGrow: 1 }}>
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            language={activeFile?.language || 'javascript'}
                            value={activeFile?.content || '// Select a file from the explorer to begin.'}
                            options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false }}
                            onChange={(val) => setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: val } : f))}
                        />
                    </Box>

                    {/* Terminal */}
                    {!isMinimized && (
                        <Box sx={{ height: '30%', bgcolor: VSCODE_THEME.bgTerminal, borderTop: `1px solid ${VSCODE_THEME.border}`, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ px: 2, py: 0.5, bgcolor: '#ffffff05', display: 'flex', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '10px' }}>TERMINAL</Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, fontFamily: 'monospace', fontSize: '13px' }}>
                                {activeTerminal.logs.map(log => (
                                    <Box key={log.id} sx={{ color: log.type === 'error' ? '#f44336' : log.type === 'success' ? '#4caf50' : '#ccc', mb: 0.5 }}>
                                        {log.text}
                                    </Box>
                                ))}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" sx={{ color: VSCODE_THEME.accent, fontWeight: 700 }}>PS C:\LAB-WORKSPACE&gt;</Typography>
                                    <input 
                                        autoFocus
                                        value={terminalCommand} 
                                        onChange={(e) => setTerminalCommand(e.target.value)}
                                        onKeyDown={handleTerminalSubmit}
                                        style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontFamily: 'inherit' }}
                                    />
                                </Box>
                                <div ref={terminalEndRef} />
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* SRS Modal */}
            <Dialog open={isSRSModalOpen} onClose={() => setIsSRSModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#1e1e2e', color: '#fff' } }}>
                <DialogTitle sx={{ borderBottom: '1px solid #333' }}>Software Requirements Specification</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="h5" sx={{ mb: 2 }}>{currentQuestion.title}</Typography>
                    <Typography variant="body1" sx={{ color: '#aaa', mb: 3 }}>{currentQuestion.description}</Typography>
                    <Typography variant="button" sx={{ color: VSCODE_THEME.accent, mb: 1, display: 'block' }}>FUNCTIONAL REQUIREMENTS</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#ffffff05', p: 2, borderRadius: '8px' }}>
                        • Input: {currentQuestion.example.input}\n• Expected Output: {currentQuestion.example.output}\n• Performance: {currentQuestion.constraints.join(', ')}
                    </Typography>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
