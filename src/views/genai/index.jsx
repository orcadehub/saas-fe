import { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Button, IconButton, Select, MenuItem, FormControl,
  TextField, Chip, CircularProgress, Divider, Tooltip, Paper
} from '@mui/material';
import {
  PlayArrow, Add, Remove, Delete, ContentCopy, AutoAwesome,
  Code, Send, RestartAlt, LightMode, DarkMode
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';

// ── Editable imports block ──────────────────────────────────────────────────
// Add any npm-installed library here and import it in your code below
// Example: import * as tf from '@tensorflow/tfjs';
// ────────────────────────────────────────────────────────────────────────────

const MODELS = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
];

const DEFAULT_CODE = `// GenAI Playground
// Write JavaScript code here. Use 'output()' to print results.
// The 'ai' object is available — call ai.ask(prompt) to query the model.

async function main() {
  // Example: ask the AI a question
  const response = await ai.ask("Explain transformers in 2 sentences");
  output(response);

  // Example: process data with AI
  const data = [1, 2, 3, 4, 5];
  const analysis = await ai.ask(\`Analyze this data: \${JSON.stringify(data)}\`);
  output("Analysis:", analysis);
}

main();
`;

export default function GenAIPlayground() {
  const [code, setCode] = useState(() => sessionStorage.getItem('genai_code') || DEFAULT_CODE);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('genai_api_key') || '');
  const [model, setModel] = useState('gemini-2.0-flash');
  const [fontSize, setFontSize] = useState(15);
  const [isDark, setIsDark] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'chat'
  const logsEndRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => { sessionStorage.setItem('genai_code', code); }, [code]);
  useEffect(() => { if (apiKey) localStorage.setItem('genai_api_key', apiKey); }, [apiKey]);
  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const callGemini = async (userPrompt, history = []) => {
    if (!apiKey) throw new Error('API key is required. Enter your Gemini API key above.');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const contents = [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: userPrompt }] }
    ];
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '(no response)';
  };

  const handleRun = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setActiveTab('output');
    const newLogs = [];

    const outputFn = (...args) => {
      const text = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
      newLogs.push({ type: 'log', text, ts: Date.now() });
      setLogs([...newLogs]);
    };

    const ai = {
      ask: async (prompt) => {
        newLogs.push({ type: 'info', text: `🤖 Calling AI: "${prompt.slice(0, 60)}${prompt.length > 60 ? '...' : ''}"`, ts: Date.now() });
        setLogs([...newLogs]);
        const result = await callGemini(prompt);
        return result;
      }
    };

    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('output', 'ai', `return (async () => { ${code} })()`);
      await fn(outputFn, ai);
      newLogs.push({ type: 'success', text: '✅ Execution completed', ts: Date.now() });
    } catch (err) {
      newLogs.push({ type: 'error', text: `❌ ${err.message}`, ts: Date.now() });
    }

    setLogs([...newLogs]);
    setIsRunning(false);
  };

  const handleChat = async () => {
    if (!prompt.trim() || isChatLoading) return;
    const userMsg = { role: 'user', text: prompt };
    const history = [...chatHistory, userMsg];
    setChatHistory(history);
    setPrompt('');
    setIsChatLoading(true);
    try {
      const reply = await callGemini(prompt, chatHistory);
      setChatHistory([...history, { role: 'model', text: reply }]);
    } catch (err) {
      setChatHistory([...history, { role: 'model', text: `Error: ${err.message}`, isError: true }]);
    }
    setIsChatLoading(false);
  };

  const t = isDark
    ? { bg: '#0f172a', panel: '#1e293b', border: '#334155', text: '#f1f5f9', sub: '#94a3b8', inputBg: '#0f172a', editorTheme: 'vs-dark' }
    : { bg: '#f8fafc', panel: '#ffffff', border: '#e2e8f0', text: '#0f172a', sub: '#64748b', inputBg: '#ffffff', editorTheme: 'light' };

  const logColor = (type) => {
    if (type === 'error') return '#f87171';
    if (type === 'success') return '#4ade80';
    if (type === 'info') return '#818cf8';
    return t.text;
  };

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', bgcolor: t.bg, overflow: 'hidden', borderRadius: '16px', border: `1px solid ${t.border}` }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 1.5, bgcolor: t.panel, borderBottom: `1px solid ${t.border}`, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 0.75, borderRadius: '10px', bgcolor: 'rgba(99,102,241,0.15)', display: 'flex' }}>
            <AutoAwesome sx={{ fontSize: 20, color: '#818cf8' }} />
          </Box>
          <Typography sx={{ fontWeight: 800, color: t.text, fontSize: '1rem', letterSpacing: '-0.01em' }}>
            GenAI Playground
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ borderColor: t.border }} />

        {/* Model selector */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            sx={{ color: t.text, bgcolor: t.inputBg, fontSize: '0.85rem', fontWeight: 600, '& .MuiOutlinedInput-notchedOutline': { borderColor: t.border }, '& .MuiSvgIcon-root': { color: t.sub } }}
          >
            {MODELS.map(m => <MenuItem key={m.id} value={m.id} sx={{ fontSize: '0.85rem' }}>{m.label}</MenuItem>)}
          </Select>
        </FormControl>

        {/* API Key */}
        <TextField
          size="small"
          type="password"
          placeholder="Gemini API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          sx={{
            width: 220,
            '& .MuiInputBase-root': { bgcolor: t.inputBg, color: t.text, fontSize: '0.85rem' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: t.border },
            '& input::placeholder': { color: t.sub }
          }}
        />

        <Box sx={{ flex: 1 }} />

        {/* Font size */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '8px', px: 1 }}>
          <IconButton size="small" onClick={() => setFontSize(p => Math.max(12, p - 1))} sx={{ color: t.sub }}><Remove fontSize="small" /></IconButton>
          <Typography sx={{ color: t.text, fontSize: '0.8rem', minWidth: 28, textAlign: 'center' }}>{fontSize}</Typography>
          <IconButton size="small" onClick={() => setFontSize(p => Math.min(28, p + 1))} sx={{ color: t.sub }}><Add fontSize="small" /></IconButton>
        </Box>

        <Tooltip title="Toggle theme">
          <IconButton onClick={() => setIsDark(p => !p)} sx={{ color: t.sub }}>{isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}</IconButton>
        </Tooltip>

        <Tooltip title="Reset code">
          <IconButton onClick={() => setCode(DEFAULT_CODE)} sx={{ color: t.sub }}><RestartAlt fontSize="small" /></IconButton>
        </Tooltip>

        <Button
          variant="contained"
          startIcon={isRunning ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <PlayArrow />}
          onClick={handleRun}
          disabled={isRunning}
          sx={{ bgcolor: '#6366f1', color: '#fff', fontWeight: 700, textTransform: 'none', px: 3, borderRadius: '10px', '&:hover': { bgcolor: '#4f46e5' }, '&:disabled': { bgcolor: '#334155', color: '#64748b' } }}
        >
          {isRunning ? 'Running...' : 'Run'}
        </Button>
      </Box>

      {/* ── Body: Editor + Right Panel ── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Editor */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Editor toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, bgcolor: t.panel, borderBottom: `1px solid ${t.border}`, borderRight: `1px solid ${t.border}` }}>
            <Code sx={{ fontSize: 16, color: t.sub }} />
            <Typography sx={{ fontSize: '0.8rem', color: t.sub, fontWeight: 600 }}>main.js</Typography>
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Copy code">
              <IconButton size="small" onClick={() => navigator.clipboard.writeText(code)} sx={{ color: t.sub }}><ContentCopy sx={{ fontSize: 15 }} /></IconButton>
            </Tooltip>
          </Box>
          <Editor
            height="100%"
            language="javascript"
            value={code}
            theme={t.editorTheme}
            onChange={(v) => setCode(v || '')}
            options={{ fontSize, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', lineNumbers: 'on', fontFamily: 'JetBrains Mono, Consolas, monospace', padding: { top: 12 } }}
          />
        </Box>

        {/* Right Panel */}
        <Box sx={{ width: '40%', minWidth: 320, display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${t.border}` }}>

          {/* Tabs */}
          <Box sx={{ display: 'flex', bgcolor: t.panel, borderBottom: `1px solid ${t.border}` }}>
            {['output', 'chat'].map(tab => (
              <Box
                key={tab}
                onClick={() => setActiveTab(tab)}
                sx={{
                  px: 3, py: 1.5, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', textTransform: 'capitalize',
                  color: activeTab === tab ? '#818cf8' : t.sub,
                  borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
                  transition: 'all 0.15s'
                }}
              >
                {tab === 'output' ? '⚡ Output' : '💬 Chat'}
              </Box>
            ))}
          </Box>

          {/* Output Tab */}
          {activeTab === 'output' && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, bgcolor: t.panel, borderBottom: `1px solid ${t.border}` }}>
                <Typography sx={{ fontSize: '0.75rem', color: t.sub, fontWeight: 600, flex: 1 }}>CONSOLE</Typography>
                <Tooltip title="Clear">
                  <IconButton size="small" onClick={() => setLogs([])} sx={{ color: t.sub }}><Delete sx={{ fontSize: 15 }} /></IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2, fontFamily: 'JetBrains Mono, monospace', fontSize: `${fontSize - 1}px`, bgcolor: t.bg }}>
                {logs.length === 0 ? (
                  <Typography sx={{ color: t.sub, fontSize: '0.85rem' }}>Run your code to see output here...</Typography>
                ) : (
                  logs.map((log, i) => (
                    <Box key={i} sx={{ mb: 1, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <Typography sx={{ color: t.sub, fontSize: '0.7rem', mt: 0.3, flexShrink: 0 }}>
                        {new Date(log.ts).toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </Typography>
                      <Typography sx={{ color: logColor(log.type), whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>
                        {log.text}
                      </Typography>
                    </Box>
                  ))
                )}
                <div ref={logsEndRef} />
              </Box>
            </Box>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: t.bg }}>
                {chatHistory.length === 0 && (
                  <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <AutoAwesome sx={{ fontSize: 40, color: '#6366f1', mb: 1 }} />
                    <Typography sx={{ color: t.sub, fontSize: '0.9rem' }}>Ask the AI anything directly</Typography>
                  </Box>
                )}
                {chatHistory.map((msg, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <Paper sx={{
                      px: 2, py: 1.5, maxWidth: '85%', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      bgcolor: msg.role === 'user' ? '#6366f1' : t.panel,
                      border: `1px solid ${msg.role === 'user' ? '#6366f1' : t.border}`,
                      boxShadow: 'none'
                    }}>
                      <Typography sx={{ fontSize: '0.875rem', color: msg.isError ? '#f87171' : (msg.role === 'user' ? '#fff' : t.text), whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {msg.text}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                {isChatLoading && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <CircularProgress size={16} sx={{ color: '#6366f1' }} />
                    <Typography sx={{ color: t.sub, fontSize: '0.85rem' }}>Thinking...</Typography>
                  </Box>
                )}
                <div ref={chatEndRef} />
              </Box>

              {/* Chat input */}
              <Box sx={{ p: 2, borderTop: `1px solid ${t.border}`, bgcolor: t.panel, display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  maxRows={4}
                  placeholder="Ask the AI..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
                  sx={{
                    '& .MuiInputBase-root': { bgcolor: t.inputBg, color: t.text, fontSize: '0.875rem', borderRadius: '10px' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: t.border },
                    '& textarea::placeholder': { color: t.sub }
                  }}
                />
                <IconButton
                  onClick={handleChat}
                  disabled={!prompt.trim() || isChatLoading}
                  sx={{ bgcolor: '#6366f1', color: '#fff', borderRadius: '10px', width: 40, height: 40, alignSelf: 'flex-end', '&:hover': { bgcolor: '#4f46e5' }, '&:disabled': { bgcolor: t.border, color: t.sub } }}
                >
                  <Send fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Status bar ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 0.75, bgcolor: '#6366f1', borderTop: `1px solid #4f46e5` }}>
        <Chip label={model} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>JavaScript · Gemini API · Direct browser execution</Typography>
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
          {apiKey ? '🔑 API key set' : '⚠️ No API key'}
        </Typography>
      </Box>
    </Box>
  );
}
