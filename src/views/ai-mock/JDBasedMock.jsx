import { useState } from 'react';
import { Box, Typography, Button, Paper, Stepper, Step, StepLabel, TextField, Alert, CircularProgress } from '@mui/material';
import { CloudUpload, PlayArrow } from '@mui/icons-material';
import MainCard from 'ui-component/cards/MainCard';
import { useNavigate } from 'react-router-dom';
import { analyzeResume } from 'services/aiMockService';

const steps = ['Upload JD', 'Configure Interview', 'Start Mock'];

export default function JDBasedMock() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [jdFile, setJdFile] = useState(null);
  const [duration, setDuration] = useState(45);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setJdFile(file);
    }
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const jdText = await jdFile.text();
      const result = await analyzeResume({ resumeText: jdText, duration, difficulty });
      navigate(`/ai-mock/interview/${result.interviewId}`, { 
        state: { questions: result.questions, duration } 
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to analyze JD');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="JD Based Mock Interview">
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Upload Job Description</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload job description to get role-specific interview questions.
          </Typography>
          <Paper sx={{ p: 4, textAlign: 'center', border: '2px dashed', borderColor: jdFile ? 'success.main' : 'divider', cursor: 'pointer' }}
            onClick={() => document.getElementById('jd-upload').click()}>
            <input id="jd-upload" type="file" accept=".pdf,.txt" hidden onChange={handleFileUpload} />
            <CloudUpload sx={{ fontSize: 60, color: jdFile ? 'success.main' : 'text.secondary', mb: 2 }} />
            <Typography variant="h6">{jdFile ? jdFile.name : 'Click to upload JD'}</Typography>
            <Typography variant="body2" color="text.secondary">PDF or TXT format</Typography>
          </Paper>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="contained" onClick={handleNext} disabled={!jdFile}>Next</Button>
          </Box>
        </Box>
      )}

      {activeStep === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>Configure Interview</Typography>
          <TextField fullWidth label="Duration (minutes)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} sx={{ mb: 3 }} />
          <TextField fullWidth select label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} SelectProps={{ native: true }} sx={{ mb: 3 }}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </TextField>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={handleBack}>Back</Button>
            <Button variant="contained" onClick={handleNext}>Next</Button>
          </Box>
        </Box>
      )}

      {activeStep === 2 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Ready to Start</Typography>
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>Interview Summary:</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>• JD: {jdFile?.name}</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>• Duration: {duration} minutes</Typography>
            <Typography variant="body2">• Difficulty: {difficulty}</Typography>
          </Paper>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={handleBack}>Back</Button>
            <Button variant="contained" color="success" startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
              onClick={handleStartInterview} disabled={loading} size="large">
              {loading ? 'Analyzing...' : 'Start Interview'}
            </Button>
          </Box>
        </Box>
      )}
    </MainCard>
  );
}
