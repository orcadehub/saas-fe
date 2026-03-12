import { useState } from 'react';
import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField, Chip } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import MainCard from 'ui-component/cards/MainCard';
import { useNavigate } from 'react-router-dom';
import { analyzeResume } from 'services/aiMockService';

export default function TopicBasedMock() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [customTopic, setCustomTopic] = useState('');
  const [duration, setDuration] = useState(45);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);

  const availableTopics = ['DSA', 'System Design', 'Database', 'Cloud', 'DevOps', 'Security', 'Networking', 'API Design'];

  const handleAddCustomTopic = () => {
    if (customTopic.trim() && !topics.includes(customTopic.trim())) {
      setTopics([...topics, customTopic.trim()]);
      setCustomTopic('');
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const resumeText = `Technical interview focusing on: ${topics.join(', ')}. Cover concepts, best practices, and real-world scenarios.`;
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
    <MainCard title="Topic Based Mock Interview">
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Select technical topics to focus your interview preparation
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Topics</InputLabel>
          <Select multiple value={topics} onChange={(e) => setTopics(e.target.value)} label="Select Topics"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => <Chip key={value} label={value} size="small" onDelete={() => setTopics(topics.filter(t => t !== value))} />)}
              </Box>
            )}>
            {availableTopics.map(topic => <MenuItem key={topic} value={topic}>{topic}</MenuItem>)}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <TextField 
            fullWidth 
            label="Add Custom Topic" 
            value={customTopic} 
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTopic()}
            placeholder="e.g., Machine Learning, Blockchain"
          />
          <Button variant="outlined" onClick={handleAddCustomTopic} sx={{ minWidth: 100 }}>
            Add
          </Button>
        </Box>

        <TextField fullWidth label="Duration (minutes)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} sx={{ mb: 3 }} />

        <TextField fullWidth select label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} SelectProps={{ native: true }} sx={{ mb: 3 }}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </TextField>

        <Button variant="contained" fullWidth size="large" startIcon={<PlayArrow />} onClick={handleStart} disabled={topics.length === 0 || loading}>
          {loading ? 'Starting...' : 'Start Interview'}
        </Button>
      </Box>
    </MainCard>
  );
}
