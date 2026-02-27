import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, TextField, InputAdornment, Pagination } from '@mui/material';
import { IconArrowLeft, IconPlus, IconTrash, IconEdit, IconSearch } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';

const InstructorViewAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [availableQuizQuestions, setAvailableQuizQuestions] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [addToAssessmentLoading, setAddToAssessmentLoading] = useState(null);
  const [programmingPage, setProgrammingPage] = useState(1);
  const [quizPage, setQuizPage] = useState(1);
  const itemsPerPage = 5;
  const [editAssessmentOpen, setEditAssessmentOpen] = useState(false);
  const [assessmentEditData, setAssessmentEditData] = useState({ title: '', description: '' });
  const [runCodeOpen, setRunCodeOpen] = useState(false);
  const [selectedQuestionForRun, setSelectedQuestionForRun] = useState(null);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [testResults, setTestResults] = useState([]);
  const [runningTests, setRunningTests] = useState(false);

  useEffect(() => {
    fetchAssessment();
    fetchAvailableQuestions();
    fetchAvailableQuizQuestions();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAssessment(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAvailableQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/assessment-questions?type=programming`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAvailableQuestions(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAvailableQuizQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/quiz-questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAvailableQuizQuestions(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addQuestionToAssessment = async (question) => {
    setAddToAssessmentLoading(question._id);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/assessments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ questions: [...assessment.questions.map(q => q._id), question._id] })
      });
      fetchAssessment();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAddToAssessmentLoading(null);
    }
  };

  const removeQuestionFromAssessment = async (question) => {
    setAddToAssessmentLoading(question._id);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/assessments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ questions: assessment.questions.filter(q => q._id !== question._id).map(q => q._id) })
      });
      fetchAssessment();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAddToAssessmentLoading(null);
    }
  };

  const addQuizQuestionToAssessment = async (question) => {
    setAddToAssessmentLoading(question._id);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/assessments/${id}/quiz-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ questionId: question._id })
      });
      fetchAssessment();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAddToAssessmentLoading(null);
    }
  };

  const removeQuizQuestionFromAssessment = async (questionId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/assessments/${id}/quiz-questions/${questionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAssessment();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const handleRunCode = (question) => {
    setSelectedQuestionForRun(question);
    setCode('');
    setTestResults([]);
    setRunCodeOpen(true);
  };

  const executeCode = async () => {
    if (!code.trim()) return;
    setRunningTests(true);
    const results = [];
    const languageMap = { 'python': 71, 'cpp': 54, 'java': 62, 'c': 50 };
    const languageId = languageMap[selectedLanguage];
    for (const testCase of selectedQuestionForRun.testCases) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/piston/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ language: selectedLanguage, version: '*', files: [{ content: code }], stdin: testCase.input || '' })
        });
        const result = await response.json();
        const isCorrect = result.run?.code === 0 && result.run?.stdout?.trim().replace(/\s+/g, ' ') === testCase.output.trim().replace(/\s+/g, ' ');
        results.push({ ...testCase, actualOutput: result.run?.stdout?.trim() || result.run?.stderr || 'No output', isCorrect, error: result.run?.stderr });
      } catch (error) {
        results.push({ ...testCase, actualOutput: 'Execution Error', isCorrect: false, error: error.message });
      }
    }
    setTestResults(results);
    setRunningTests(false);
  };

  if (!assessment) return <Typography>Loading...</Typography>;

  return (
    <MainCard>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconArrowLeft style={{ cursor: 'pointer' }} onClick={() => navigate('/instructor/assessments')} />
        <Typography variant="h3" sx={{ fontWeight: 600, flexGrow: 1 }}>
          {assessment.title}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<IconEdit />}
          onClick={() => {
            setAssessmentEditData({ title: assessment.title, description: assessment.description });
            setEditAssessmentOpen(true);
          }}
          sx={{ textTransform: 'none' }}
        >
          Edit
        </Button>
      </Box>
      {assessment.description && (
        <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
          {assessment.description}
        </Typography>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Duration</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{assessment.duration} min</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Questions</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{assessment.questions?.length || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Tab Limit</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{assessment.maxTabSwitches === -1 ? '∞' : assessment.maxTabSwitches}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Status</Typography>
              <Chip label={assessment.status?.toUpperCase()} color={assessment.status === 'active' ? 'success' : 'default'} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Type</Typography>
              <Chip label={assessment.type?.toUpperCase() || 'PROGRAMMING'} color="primary" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Programming Questions ({assessment.questions?.length || 0})
            </Typography>
            <Button variant="contained" startIcon={<IconPlus />} onClick={() => { setTabValue(0); setAddQuestionOpen(true); }}>
              Add Question
            </Button>
          </Box>

          {assessment.questions?.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {assessment.questions.map((question, index) => (
                <Card key={question._id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip label={index + 1} color="primary" />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {question.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={question.difficulty} color={getDifficultyColor(question.difficulty)} size="small" />
                            <Chip label={`${question.testCases?.length || 0} test cases`} size="small" />
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="contained" color="success" onClick={() => handleRunCode(question)}>Run</Button>
                        <Button size="small" variant="outlined" color="error" startIcon={<IconTrash />}
                                onClick={() => removeQuestionFromAssessment(question)}
                                disabled={addToAssessmentLoading === question._id}>
                          Remove
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">No questions added yet</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Quiz Questions ({assessment.quizQuestions?.length || 0})
            </Typography>
            <Button variant="contained" startIcon={<IconPlus />} onClick={() => { setTabValue(1); setAddQuestionOpen(true); }}>
              Add Quiz Question
            </Button>
          </Box>

          {assessment.quizQuestions?.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {assessment.quizQuestions.map((question, index) => (
                <Card key={question._id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip label={`Q${index + 1}`} color="secondary" />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {question.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={question.difficulty} color={getDifficultyColor(question.difficulty)} size="small" />
                            <Chip label={`${question.options?.length || 0} options`} size="small" />
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" color="error" startIcon={<IconTrash />}
                                onClick={() => removeQuizQuestionFromAssessment(question._id)}>
                          Remove
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">No quiz questions added yet</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={addQuestionOpen} onClose={() => setAddQuestionOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Question to Assessment</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Programming Questions" />
              <Tab label="Quiz Questions" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Box sx={{ height: 'auto', display: 'flex', flexDirection: 'column' }}>
              <TextField fullWidth placeholder="Search questions..." value={searchQuery}
                         onChange={(e) => { setSearchQuery(e.target.value); setProgrammingPage(1); }} sx={{ mb: 2 }}
                         InputProps={{ startAdornment: <InputAdornment position="start"><IconSearch size={20} /></InputAdornment> }} />
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto', mb: 2 }}>
                {(() => {
                  const filtered = availableQuestions.filter(q => 
                    q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    q.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    q.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                  );
                  const paginated = filtered.slice((programmingPage - 1) * itemsPerPage, programmingPage * itemsPerPage);
                  return paginated.length > 0 ? (
                    paginated.map((question) => (
                    <Card key={question._id} variant="outlined" sx={{ minHeight: 'auto' }}>
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{question.title}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip label={question.difficulty} color={getDifficultyColor(question.difficulty)} size="small" />
                              <Chip label={`${question.testCases?.length || 0} test cases`} size="small" />
                            </Box>
                          </Box>
                          <Button size="small"
                            variant={assessment?.questions?.some(q => q._id === question._id) ? 'contained' : 'outlined'}
                            color={assessment?.questions?.some(q => q._id === question._id) ? 'error' : 'primary'}
                            disabled={addToAssessmentLoading === question._id}
                            onClick={() => assessment?.questions?.some(q => q._id === question._id)
                              ? removeQuestionFromAssessment(question) : addQuestionToAssessment(question)}>
                            {addToAssessmentLoading === question._id ? 'Loading...' : 
                             assessment?.questions?.some(q => q._id === question._id) ? 'Remove' : 'Add'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No questions found
                  </Typography>
                );
                })()}
              </Box>
              {availableQuestions.filter(q => 
                q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
              ).length > itemsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Pagination 
                    count={Math.ceil(availableQuestions.filter(q => 
                      q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      q.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      q.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                    ).length / itemsPerPage)} 
                    page={programmingPage} 
                    onChange={(e, page) => setProgrammingPage(page)} 
                    color="primary" 
                  />
                </Box>
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ height: 'auto', display: 'flex', flexDirection: 'column' }}>
              <TextField fullWidth placeholder="Search quiz questions..." value={searchQuery}
                         onChange={(e) => { setSearchQuery(e.target.value); setQuizPage(1); }} sx={{ mb: 2 }}
                         InputProps={{ startAdornment: <InputAdornment position="start"><IconSearch size={20} /></InputAdornment> }} />
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto', mb: 2 }}>
                {(() => {
                  const filtered = availableQuizQuestions.filter(q => 
                    q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    q.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    q.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                  );
                  const paginated = filtered.slice((quizPage - 1) * itemsPerPage, quizPage * itemsPerPage);
                  return paginated.length > 0 ? (
                    paginated.map((question) => (
                    <Card key={question._id} variant="outlined" sx={{ minHeight: 'auto' }}>
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{question.title}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip label={question.difficulty} color={getDifficultyColor(question.difficulty)} size="small" />
                              <Chip label={`${question.options?.length || 0} options`} size="small" />
                            </Box>
                          </Box>
                          <Button size="small"
                            variant={assessment?.quizQuestions?.some(q => q._id === question._id) ? 'contained' : 'outlined'}
                            color={assessment?.quizQuestions?.some(q => q._id === question._id) ? 'error' : 'primary'}
                            disabled={addToAssessmentLoading === question._id}
                            onClick={() => assessment?.quizQuestions?.some(q => q._id === question._id)
                              ? removeQuizQuestionFromAssessment(question._id) : addQuizQuestionToAssessment(question)}>
                            {addToAssessmentLoading === question._id ? 'Loading...' : 
                             assessment?.quizQuestions?.some(q => q._id === question._id) ? 'Remove' : 'Add'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No quiz questions found
                  </Typography>
                );
                })()}
              </Box>
              {availableQuizQuestions.filter(q => 
                q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
              ).length > itemsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Pagination 
                    count={Math.ceil(availableQuizQuestions.filter(q => 
                      q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      q.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      q.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                    ).length / itemsPerPage)} 
                    page={quizPage} 
                    onChange={(e, page) => setQuizPage(page)} 
                    color="primary" 
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddQuestionOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editAssessmentOpen} onClose={() => setEditAssessmentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Assessment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={assessmentEditData.title}
              onChange={(e) => setAssessmentEditData({...assessmentEditData, title: e.target.value})}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={assessmentEditData.description}
              onChange={(e) => setAssessmentEditData({...assessmentEditData, description: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditAssessmentOpen(false)}>Cancel</Button>
          <Button 
            onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(assessmentEditData)
                });
                if (response.ok) {
                  setAssessment({...assessment, ...assessmentEditData});
                  setEditAssessmentOpen(false);
                } else {
                  console.error('Failed to update assessment');
                }
              } catch (error) {
                console.error('Error updating assessment:', error);
              }
            }} 
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={runCodeOpen} onClose={() => setRunCodeOpen(false)} maxWidth="xl" fullWidth>
        <DialogTitle>Test Code - {selectedQuestionForRun?.title}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1, height: '70vh' }}>
            <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '48%' }}>
              <TextField select fullWidth label="Language" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} SelectProps={{ native: true }} sx={{ mb: 2 }}>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="c">C</option>
              </TextField>
              <TextField fullWidth multiline rows={20} placeholder="Write your code here..." value={code} onChange={(e) => setCode(e.target.value)} sx={{ fontFamily: 'monospace', mb: 2, flex: 1 }} />
              <Button variant="contained" fullWidth onClick={executeCode} disabled={runningTests || !code.trim()}>{runningTests ? 'Running...' : 'Run Tests'}</Button>
            </Grid>
            <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '48%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Test Results</Typography>
              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {testResults.length > 0 ? testResults.map((result, idx) => (
                  <Card key={idx} sx={{ mb: 2, border: `2px solid ${result.isCorrect ? 'green' : 'red'}`, bgcolor: result.isCorrect ? '#e8f5e9' : '#ffebee' }}>
                    <CardContent>
                      <Typography variant="subtitle2">Test Case {idx + 1} - {result.isCorrect ? 'PASS' : 'FAIL'}</Typography>
                      <Typography variant="body2">Input: {result.input}</Typography>
                      <Typography variant="body2">Expected: [{result.output}]</Typography>
                      <Typography variant="body2">Actual: [{result.actualOutput}]</Typography>
                      {result.error && <Typography variant="body2" color="error">Error: {result.error}</Typography>}
                    </CardContent>
                  </Card>
                )) : <Typography color="text.secondary">Run code to see results</Typography>}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRunCodeOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default InstructorViewAssessment;
