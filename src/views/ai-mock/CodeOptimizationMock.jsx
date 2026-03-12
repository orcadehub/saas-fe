import { useState } from 'react';
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import MainCard from 'ui-component/cards/MainCard';
import { useNavigate } from 'react-router-dom';
import { analyzeResume } from 'services/aiMockService';

export default function CodeOptimizationMock() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('javascript');
  const [customLanguage, setCustomLanguage] = useState('');
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);

  const languages = ['JavaScript', 'Python', 'Java', 'C++', 'Other'];

  const handleStart = async () => {
    setLoading(true);
    try {
      const selectedLang = language === 'other' ? customLanguage : language;
      const resumeText = `Code optimization interview in ${selectedLang}. Focus on time complexity, space complexity, and performance improvements.`;
      const result = await analyzeResume({ resumeText, duration, difficulty });
      navigate(`/ai-mock/code-interview/${result.interviewId}`, { 
        state: { questions: result.questions, duration, type: 'optimization', language: selectedLang } 
      });
    } catch (error) {
      alert('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="Code Optimization Mock Interview">
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Practice optimizing code for better performance and efficiency
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Programming Language</InputLabel>
          <Select value={language} onChange={(e) => setLanguage(e.target.value)} label="Programming Language">
            {languages.map(lang => <MenuItem key={lang} value={lang.toLowerCase()}>{lang}</MenuItem>)}
          </Select>
        </FormControl>

        {language === 'other' && (
          <TextField 
            fullWidth 
            label="Enter Language Name" 
            value={customLanguage} 
            onChange={(e) => setCustomLanguage(e.target.value)}
            placeholder="e.g., Rust, Go, TypeScript"
            sx={{ mb: 3 }}
          />
        )}

        <TextField fullWidth label="Duration (minutes)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} sx={{ mb: 3 }} />

        <TextField fullWidth select label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} SelectProps={{ native: true }} sx={{ mb: 3 }}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </TextField>

        <Button variant="contained" fullWidth size="large" startIcon={<PlayArrow />} onClick={handleStart} disabled={loading}>
          {loading ? 'Starting...' : 'Start Interview'}
        </Button>
      </Box>
    </MainCard>
  );
}
