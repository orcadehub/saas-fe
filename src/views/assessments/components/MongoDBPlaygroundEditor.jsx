import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Tabs, Tab, Card, CardContent, IconButton } from '@mui/material';
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

  const arraysEqual = (arr1, arr2) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    if (arr1.length !== arr2.length) return false;
    const sorted1 = JSON.stringify(arr1.map(item => JSON.stringify(item)).sort());
    const sorted2 = JSON.stringify(arr2.map(item => JSON.stringify(item)).sort());
    return sorted1 === sorted2;
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
              expectedOutput
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
      <Box sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
          <Tab label="Shell" />
          <Tab label="Dataset" />
          <Tab label="Expected Output" />
          <Tab label="Your Output" />
        </Tabs>
      </Box>

        {/* Tab Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {currentTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header */}
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid #e0e0e0', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                bgcolor: '#ffffff'
              }}>
                <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                  MongoDB Shell
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size="small" onClick={() => setFontSize(prev => Math.max(12, prev - 2))}>
                    <Remove fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" sx={{ minWidth: '30px', textAlign: 'center' }}>
                    {fontSize}
                  </Typography>
                  <IconButton size="small" onClick={() => setFontSize(prev => Math.min(32, prev + 2))}>
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
                <Button
                  variant="contained"
                  startIcon={isRunning ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <PlayArrow />}
                  onClick={handleRunQuery}
                  disabled={isRunning}
                  sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
                >
                  {isRunning ? 'Running...' : 'Run Query'}
                </Button>
              </Box>

              {/* Query Editor */}
              <Box sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ height: '100%', border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
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
                      wordWrap: 'on'
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {currentTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Collection: {question?.collectionName}
              </Typography>
              <Card sx={{ bgcolor: '#e3f2fd', mb: 2 }}>
                <CardContent>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    db.{question?.collectionName}.find()
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Use this query in the Shell tab to view the complete dataset
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {currentTab === 2 && (
            <Box sx={{ p: 3 }}>
              {expectedOutput ? (
                <Card sx={{ bgcolor: result ? (arraysEqual(result, expectedOutput) ? '#e8f5e9' : '#ffebee') : 'transparent' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Expected Output</Typography>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '16px', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '14px',
                      margin: 0,
                      maxHeight: '500px'
                    }}>
                      {JSON.stringify(expectedOutput, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ) : (
                <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 4 }}>
                  Loading expected output...
                </Typography>
              )}
            </Box>
          )}

          {currentTab === 3 && (
            <Box sx={{ p: 3 }}>
              {error && (
                <Card sx={{ bgcolor: '#ffebee', mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'error.main', mb: 1 }}>Error</Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '14px' }}>{error}</Typography>
                  </CardContent>
                </Card>
              )}
              
              {result && (
                <Card sx={{ bgcolor: arraysEqual(result, expectedOutput) ? '#e8f5e9' : '#ffebee' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Query Result</Typography>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '16px', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '14px',
                      margin: 0,
                      maxHeight: '500px'
                    }}>
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
              
              {!result && !error && (
                <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 4 }}>
                  Run your query to see results
                </Typography>
              )}
            </Box>
          )}
        </Box>
    </Box>
  );
}
