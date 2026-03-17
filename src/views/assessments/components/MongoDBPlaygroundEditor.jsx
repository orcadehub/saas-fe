import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Tabs, Tab, Card, CardContent, IconButton, Chip } from '@mui/material';
import { PlayArrow, Add, Remove } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import apiService from 'services/apiService';
import tenantConfig from 'config/tenantConfig';

export default function MongoDBPlaygroundEditor({ question, attemptId, onTestComplete }) {
  const [query, setQuery] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [expectedOutput, setExpectedOutput] = useState(null);
  const editorRef = useRef(null);

  const sortData = (data) => {
    if (Array.isArray(data)) {
      return data.map(sortData).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    } else if (data !== null && typeof data === 'object') {
      const sorted = {};
      Object.keys(data).sort().forEach(key => {
        sorted[key] = sortData(data[key]);
      });
      return sorted;
    }
    return data;
  };

  const arraysEqual = (arr1, arr2) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    if (arr1.length !== arr2.length) return false;
    return JSON.stringify(sortData(arr1)) === JSON.stringify(sortData(arr2));
  };

  // Load query from localStorage when question changes
  useEffect(() => {
    if (question?._id) {
      const storageKey = `mongodb_query_${question._id}`;
      const savedQuery = localStorage.getItem(storageKey);
      setQuery(savedQuery || '');
      setExpectedOutput(null);
      setResult(null);
      setError(null);
    }
  }, [question?._id]);

  // Save query to localStorage when it changes
  useEffect(() => {
    if (question?._id && query !== undefined) {
      const storageKey = `mongodb_query_${question._id}`;
      localStorage.setItem(storageKey, query);
    }
  }, [query, question?._id]);

  useEffect(() => {
    if (question?.testCases?.[0]?.expectedQuery && question?._id) {
      fetchExpectedOutput();
    }
  }, [question?._id, question?.testCases]);

  const fetchExpectedOutput = async () => {
    try {
      const expectedQuery = question?.testCases?.[0]?.expectedQuery;
      if (!expectedQuery) return;

      const token = localStorage.getItem('studentToken');
      const config = tenantConfig.get();
      const baseURL = import.meta.env.DEV ? 'http://localhost:4000' : 'https://backend.orcode.in';
      const response = await axios.post(
        `${baseURL}/api/mongodb-playground/expected-output`,
        {
          expectedQuery,
          collectionName: question.collectionName
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-key': config?.apiKey || ''
          }
        }
      );

      if (response.data.success) {
        setExpectedOutput(response.data.result);
      }
    } catch (err) {
      console.error('Error fetching expected output:', err);
    }
  };

  const handleRunQuery = async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('studentToken');
      const config = tenantConfig.get();
      const baseURL = import.meta.env.DEV ? 'http://localhost:4000' : 'https://backend.orcode.in';
      const response = await axios.post(
        `${baseURL}/api/mongodb-playground/execute`,
        {
          query,
          collectionName: question.collectionName
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-key': config?.apiKey || ''
          }
        }
      );

      if (response.data.success) {
        setResult(response.data.result);
        setCurrentTab(3);
        
        // Check if correct by comparing with expected output
        const isCorrect = arraysEqual(response.data.result, expectedOutput);
        
        // Save to backend
        if (attemptId && question._id) {
          try {
            await apiService.saveMongoDBQuery(
              token,
              attemptId,
              question._id,
              query,
              response.data.result,
              expectedOutput,
              isCorrect
            );
          } catch (err) {
            console.error('Error saving MongoDB query:', err);
          }
        }
        
        if (onTestComplete) {
          onTestComplete(isCorrect ? 1 : 0, 1);
        }
      } else {
        setError(response.data.error);
        setCurrentTab(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setCurrentTab(3);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff' }}>
      {/* Tabs */}
      <Box sx={{ 
        bgcolor: '#f8fafc',
        borderBottom: '1px solid #f1f5f9',
        px: 2,
        py: 0.5,
      }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, v) => setCurrentTab(v)}
          sx={{
            minHeight: 48,
            '& .MuiTabs-indicator': { bgcolor: '#6366f1', height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': { 
              textTransform: 'none', 
              fontWeight: 800, 
              fontSize: '0.85rem', 
              color: '#64748b',
              minHeight: 48,
              transition: 'all 0.2s',
              '&.Mui-selected': {
                color: '#0f172a'
              },
              '&:hover:not(.Mui-selected)': {
                color: '#334155',
                bgcolor: 'rgba(99, 102, 241, 0.04)',
                borderRadius: '8px 8px 0 0'
              }
            }
          }}
        >
          <Tab label="Shell Environment" />
          <Tab label="Data Schema" />
          <Tab label="Expected Output" />
          <Tab label="Runtime Output" />
        </Tabs>
      </Box>

        {/* Tab Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {currentTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header */}
              <Box sx={{ 
                p: 1.5, 
                borderBottom: '1px solid rgba(226, 232, 240, 0.8)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: 2,
                bgcolor: '#fcfdfe',
                overflowX: 'auto',
                minHeight: '64px',
                pb: 0.5,
                '&::-webkit-scrollbar': { height: '6px' },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(99, 102, 241, 0.2)', borderRadius: '10px' },
                '&:hover::-webkit-scrollbar-thumb': { bgcolor: 'rgba(99, 102, 241, 0.4)' }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    MongoDB Shell
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(0,0,0,0.03)', px: 1, borderRadius: '8px' }}>
                    <IconButton size="small" onClick={() => setFontSize(prev => Math.max(12, prev - 2))} sx={{ color: '#64748b' }}>
                      <Remove fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" sx={{ minWidth: '24px', textAlign: 'center', fontWeight: 800, color: '#1e293b' }}>
                      {fontSize}
                    </Typography>
                    <IconButton size="small" onClick={() => setFontSize(prev => Math.min(32, prev + 2))} sx={{ color: '#64748b' }}>
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={isRunning ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <PlayArrow />}
                  onClick={handleRunQuery}
                  disabled={isRunning}
                  sx={{ 
                    borderRadius: '10px', 
                    fontWeight: 800, 
                    textTransform: 'none',
                    bgcolor: '#6366f1',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                    '&:hover': { bgcolor: '#4f46e5', boxShadow: '0 6px 16px rgba(99, 102, 241, 0.3)' }
                  }}
                >
                  {isRunning ? 'Running...' : 'Execute Query'}
                </Button>
              </Box>

              {/* Query Editor */}
              <Box sx={{ flexGrow: 1, p: 0, overflow: 'hidden' }}>
                <Box sx={{ height: '100%', overflow: 'hidden' }}>
                  <Editor
                    height="100%"
                    language="javascript"
                    value={query}
                    theme="vs-dark"
                    onChange={(value) => setQuery(value || '')}
                    onMount={(editor) => { editorRef.current = editor; }}
                    options={{
                      fontSize: fontSize,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      padding: { top: 20 },
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {currentTab === 1 && (
            <Box sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 800, color: '#1e293b' }}>
                Collection Structure
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
                Currently interacting with collection: <Typography component="span" sx={{ fontWeight: 800, color: '#6366f1' }}>{question?.collectionName}</Typography>
              </Typography>
              
              <Card sx={{ borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', bgcolor: '#fff' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', mb: 2 }}>
                    <Typography variant="body1" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#1e293b' }}>
                      db.{question?.collectionName}.find()
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, lineHeight: 1.6 }}>
                    Tip: Use the find() command in the Shell tab to explore every document in this collection.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {currentTab === 2 && (
            <Box sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 800, color: '#1e293b' }}>Target Payload</Typography>
              {expectedOutput ? (
                <Card sx={{ borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', bgcolor: '#fff' }}>
                  <CardContent sx={{ p: 3 }}>
                    <pre style={{ 
                      backgroundColor: '#1e293b', 
                      color: '#e2e8f0',
                      padding: '24px', 
                      borderRadius: '12px',
                      overflow: 'auto',
                      fontSize: '14px',
                      fontFamily: "'JetBrains Mono', monospace",
                      margin: 0,
                      maxHeight: '500px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      {JSON.stringify(expectedOutput, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ) : (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <CircularProgress size={24} sx={{ color: '#6366f1', mb: 2 }} />
                  <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Syncing expected output...</Typography>
                </Box>
              )}
            </Box>
          )}

          {currentTab === 3 && (
            <Box sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 800, color: '#1e293b' }}>Execution Terminal</Typography>
              {error && (
                <Card sx={{ borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)', bgcolor: 'rgba(239, 68, 68, 0.02)', mb: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: '#ef4444', fontWeight: 800, textTransform: 'uppercase', mb: 1 }}>Query Error</Typography>
                    <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: '#1e293b' }}>{error}</Typography>
                  </CardContent>
                </Card>
              )}
              
              {result && (
                <Card sx={{ 
                    borderRadius: '20px', 
                    border: '1px solid', 
                    borderColor: arraysEqual(result, expectedOutput) ? 'rgba(34, 197, 94, 0.2)' : 'rgba(226, 232, 240, 0.8)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
                    bgcolor: '#fff' 
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>Result Snapshot</Typography>
                        <Chip 
                            label={arraysEqual(result, expectedOutput) ? 'Match Successful' : 'Mismatch Detected'} 
                            size="small"
                            sx={{ 
                                fontWeight: 800, 
                                bgcolor: arraysEqual(result, expectedOutput) ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: arraysEqual(result, expectedOutput) ? '#22c55e' : '#ef4444'
                            }}
                        />
                    </Box>
                    <pre style={{ 
                      backgroundColor: '#1e293b', 
                      color: '#e2e8f0',
                      padding: '24px', 
                      borderRadius: '12px',
                      overflow: 'auto',
                      fontSize: '14px',
                      fontFamily: "'JetBrains Mono', monospace",
                      margin: 0,
                      maxHeight: '500px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
              
              {!result && !error && (
                <Box sx={{ py: 12, textAlign: 'center' }}>
                  <Typography sx={{ color: '#94a3b8', fontWeight: 600 }}>Execute your query in the Shell tab to see results here.</Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
    </Box>
  );
}
