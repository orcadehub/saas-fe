import { useState } from 'react';
import { Box, Typography, Button, Paper, Stepper, Step, StepLabel, TextField, Alert, CircularProgress } from '@mui/material';
import { CloudUpload, PlayArrow } from '@mui/icons-material';
import MainCard from 'ui-component/cards/MainCard';
import { useNavigate } from 'react-router-dom';
import { useAIMock } from 'contexts/AIMockContext';

const steps = ['Upload Resume', 'Configure Interview', 'Start Mock'];

export default function ResumeBasedMock() {
  const navigate = useNavigate();
  const { analyzeResume, loading } = useAIMock();
  const [activeStep, setActiveStep] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  const [duration, setDuration] = useState(45);
  const [difficulty, setDifficulty] = useState('medium');
  const [interviewId, setInterviewId] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setResumeFile(file);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        setResumeFile(file);
      } else {
        alert('Please upload PDF or TXT file only');
      }
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleStartInterview = async () => {
    try {
      const resumeText = await resumeFile.text();
      
      const result = await analyzeResume({
        resumeText,
        duration,
        difficulty
      });
      
      setInterviewId(result.interviewId);
      
      navigate(`/ai-mock/interview/${result.interviewId}`, { 
        state: { questions: result.questions, skills: result.skills } 
      });
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Failed to analyze resume');
    }
  };

  return (
    <MainCard title="Resume Based Mock Interview">
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Upload Your Resume</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload your resume in PDF or TXT format. AI will analyze your skills and experience to generate personalized interview questions.
          </Typography>
          
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              border: '2px dashed', 
              borderColor: resumeFile ? 'success.main' : 'divider',
              bgcolor: resumeFile ? 'success.lighter' : 'grey.50',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main' }
            }}
            onClick={() => document.getElementById('resume-upload').click()}
          >
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.txt"
              hidden
              onChange={handleFileUpload}
            />
            <CloudUpload sx={{ fontSize: 60, color: resumeFile ? 'success.main' : 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              {resumeFile ? resumeFile.name : 'Click to upload resume'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              PDF or TXT format (Max 5MB)
            </Typography>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="contained" onClick={handleNext} disabled={!resumeFile}>
              Next
            </Button>
          </Box>
        </Box>
      )}

      {activeStep === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>Configure Interview Settings</Typography>
          
          <TextField
            fullWidth
            label="Duration (minutes)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            select
            label="Difficulty Level"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            SelectProps={{ native: true }}
            sx={{ mb: 3 }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </TextField>

          <Alert severity="info" sx={{ mb: 3 }}>
            AI will generate questions based on your resume's skills and experience level
          </Alert>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={handleBack}>Back</Button>
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          </Box>
        </Box>
      )}

      {activeStep === 2 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Ready to Start</Typography>
          
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>Interview Summary:</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>• Resume: {resumeFile?.name}</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>• Duration: {duration} minutes</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>• Difficulty: {difficulty}</Typography>
            <Typography variant="body2">• Questions: 10-15 personalized questions</Typography>
          </Paper>

          <Alert severity="warning" sx={{ mb: 3 }}>
            Once started, the interview cannot be paused. Make sure you're ready!
          </Alert>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={handleBack}>Back</Button>
            <Button 
              variant="contained" 
              color="success" 
              startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
              onClick={handleStartInterview}
              disabled={loading}
              size="large"
            >
              {loading ? 'Analyzing...' : 'Start Interview'}
            </Button>
          </Box>
        </Box>
      )}
    </MainCard>
  );
}
