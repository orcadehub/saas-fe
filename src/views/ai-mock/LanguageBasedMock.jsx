import { useState } from 'react';
import { Box, Typography, Button, Paper, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import MainCard from 'ui-component/cards/MainCard';
import { useNavigate } from 'react-router-dom';
import { analyzeResume } from 'services/aiMockService';

export default function LanguageBasedMock() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('');
  const [customLanguage, setCustomLanguage] = useState('');
  const [duration, setDuration] = useState(45);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);

  const languages = ['Python', 'Java', 'JavaScript', 'C++', 'C#', 'Go', 'Ruby', 'PHP', 'Other'];

  const handleStart = async () => {
    setLoading(true);
    try {
      const selectedLang = language === 'Other' ? customLanguage : language;
      const resumeText = `Programming language interview for ${selectedLang}. Focus on syntax, best practices, and common patterns.`;
      const result = await analyzeResume({ resumeText, duration, difficulty });
      navigate(`/ai-mock/interview/${result.interviewId}`, { 
        state: { questions: result.questions, duration } 
      });
    } catch (error) {
      alert('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="Language Based Mock Interview">
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Select a programming language and practice language-specific interview questions
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Programming Language</InputLabel>
          <Select value={language} onChange={(e) => setLanguage(e.target.value)} label="Programming Language">
            {languages.map(lang => <MenuItem key={lang} value={lang}>{lang}</MenuItem>)}
          </Select>
        </FormControl>

        {language === 'Other' && (
          <TextField 
            fullWidth 
            label="Enter Language Name" 
            value={customLanguage} 
            onChange={(e) => setCustomLanguage(e.target.value)}
            placeholder="e.g., Rust, Kotlin, Swift"
            sx={{ mb: 3 }}
          />
        )}

        <TextField fullWidth label="Duration (minutes)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} sx={{ mb: 3 }} />

        <TextField fullWidth select label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} SelectProps={{ native: true }} sx={{ mb: 3 }}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </TextField>

        <Button variant="contained" fullWidth size="large" startIcon={<PlayArrow />} onClick={handleStart} disabled={!language || (language === 'Other' && !customLanguage) || loading}>
          {loading ? 'Starting...' : 'Start Interview'}
        </Button>
      </Box>
    </MainCard>
  );
}
