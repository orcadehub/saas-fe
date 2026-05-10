import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Stack, IconButton, Chip, CircularProgress, Divider } from '@mui/material';
import { IconChevronLeft, IconCheck, IconX, IconArrowRight, IconInfoCircle, IconTrophy, IconChevronRight } from '@tabler/icons-react';
import apiService from 'services/apiService';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopicPracticePage() {
  const { category, topic } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [answeredStatus, setAnsweredStatus] = useState({}); // { index: { correct: boolean } }

  useEffect(() => {
    fetchAllQuestions();
  }, [topic]);

  const fetchAllQuestions = async () => {
    setLoading(true);
    try {
      let data = [];
      if (category === 'aptitude') data = await apiService.getAptitudeTopicQuestions(topic);
      else if (category === 'verbal') data = await apiService.getVerbalTopicQuestions(topic);
      else if (category === 'quantitative') data = await apiService.getQuantitativeTopicQuestions(topic);
      
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (idx) => {
    if (selectedOption !== null) return;
    
    const correct = idx === questions[currentIndex].correctAnswer;
    setSelectedOption(idx);
    setIsCorrect(correct);
    setShowExplanation(true);
    
    setAnsweredStatus(prev => ({
      ...prev,
      [currentIndex]: { correct }
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setIsCorrect(null);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setIsCorrect(null);
    }
  };

  const goToQuestion = (idx) => {
    setCurrentIndex(idx);
    setSelectedOption(null);
    setShowExplanation(false);
    setIsCorrect(null);
  };

  if (loading) {
    return (
      <Box sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (questions.length === 0) return <Typography>No questions found for this topic.</Typography>;

  const currentQuestion = questions[currentIndex];

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4.5 } }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<IconChevronLeft />}
          onClick={() => navigate(`/practice/${category}`)}
          sx={{ fontWeight: 700, color: '#64748b' }}
        >
          Back
        </Button>
        <Typography variant="h2" sx={{ fontWeight: 900, color: '#1e293b', textTransform: 'capitalize' }}>
          {topic} Practice
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '280px 1fr 300px' }, gap: 4, alignItems: 'start' }}>
        {/* Left Sidebar: Question Navigator */}
        <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'sticky', top: 24 }}>
          <Paper sx={{ p: 3, borderRadius: '24px', border: '1px solid #f1f5f9', bgcolor: '#fff' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: '#1e293b' }}>Questions</Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: 1.2,
              maxHeight: '60vh',
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 2 }
            }}>
              {questions.map((_, idx) => {
                const status = answeredStatus[idx];
                const isCurrent = currentIndex === idx;
                
                let bgcolor = '#f8fafc';
                let color = '#64748b';
                let border = '1px solid #e2e8f0';

                if (isCurrent) {
                  bgcolor = '#6366f1';
                  color = '#fff';
                  border = 'none';
                } else if (status) {
                  bgcolor = status.correct ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 44, 44, 0.1)';
                  color = status.correct ? '#16a34a' : '#ef4444';
                  border = `1px solid ${status.correct ? '#22c55e' : '#ef4444'}30`;
                }

                return (
                  <Box
                    key={idx}
                    onClick={() => goToQuestion(idx)}
                    sx={{
                      aspectRatio: '1/1',
                      borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: 800,
                      bgcolor, color, border,
                      '&:hover': !isCurrent ? { bgcolor: '#e2e8f0' } : {}
                    }}
                  >
                    {idx + 1}
                  </Box>
                );
              })}
            </Box>
            
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #f1f5f9' }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: '#6366f1' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>Current</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: '#22c55e' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>Correct</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: '#ef4444' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>Incorrect</Typography>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Box>

        {/* Mobile Navigator (Horizontal) */}
        <Box sx={{ display: { xs: 'block', lg: 'none' }, mb: 3 }}>
          <Paper sx={{ p: 2, borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
              {questions.map((_, idx) => (
                <Box
                  key={idx}
                  onClick={() => goToQuestion(idx)}
                  sx={{
                    minWidth: 36, height: 36,
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: currentIndex === idx ? '#6366f1' : '#f8fafc',
                    color: currentIndex === idx ? '#fff' : '#64748b',
                    fontSize: '0.75rem', fontWeight: 800,
                    flexShrink: 0
                  }}
                >
                  {idx + 1}
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Center: Question Area */}
        <Box>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: { xs: 3, sm: 6 }, borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b', mb: 6, lineHeight: 1.6, fontSize: '1.5rem' }}>
                  {currentQuestion.question}
                </Typography>

                <Stack spacing={2.5} sx={{ mb: 6 }}>
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrectOption = idx === currentQuestion.correctAnswer;
                    
                    let borderColor = '#f1f5f9';
                    let bgcolor = '#fff';
                    let color = '#475569';
                    
                    if (selectedOption !== null) {
                      if (isCorrectOption) {
                        borderColor = '#22c55e';
                        bgcolor = 'rgba(34, 197, 94, 0.05)';
                        color = '#16a34a';
                      } else if (isSelected && !isCorrectOption) {
                        borderColor = '#ef4444';
                        bgcolor = 'rgba(239, 44, 44, 0.05)';
                        color = '#ef4444';
                      }
                    }

                    return (
                      <Paper
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        sx={{
                          p: 3,
                          borderRadius: '20px',
                          cursor: selectedOption === null ? 'pointer' : 'default',
                          border: '2px solid',
                          borderColor: borderColor,
                          bgcolor: bgcolor,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          transition: 'all 0.2s',
                          '&:hover': selectedOption === null ? { borderColor: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.02)' } : {}
                        }}
                      >
                        <Box sx={{ 
                          width: 36, height: 36, 
                          borderRadius: '10px', 
                          bgcolor: (selectedOption !== null && isCorrectOption) || (isSelected && !isCorrectOption) ? color : '#f8fafc', 
                          color: (selectedOption !== null && isCorrectOption) || (isSelected && !isCorrectOption) ? '#fff' : '#64748b',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900
                        }}>
                          {String.fromCharCode(65 + idx)}
                        </Box>
                        <Typography sx={{ fontWeight: 700, color: color, flexGrow: 1 }}>{option}</Typography>
                        {selectedOption !== null && isCorrectOption && <IconCheck color="#22c55e" size={24} />}
                        {selectedOption !== null && isSelected && !isCorrectOption && <IconX color="#ef4444" size={24} />}
                      </Paper>
                    );
                  })}
                </Stack>

                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box sx={{ mt: 4, p: 4, bgcolor: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                          <Box sx={{ 
                            p: 1, borderRadius: '10px', 
                            bgcolor: isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 44, 44, 0.1)',
                            color: isCorrect ? '#16a34a' : '#ef4444' 
                          }}>
                            {isCorrect ? <IconTrophy size={20} /> : <IconInfoCircle size={20} />}
                          </Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                            {isCorrect ? 'Correct!' : 'Incorrect'}
                          </Typography>
                        </Stack>
                        <Divider sx={{ mb: 2.5, opacity: 0.5 }} />
                        <Typography sx={{ color: '#475569', fontWeight: 600, lineHeight: 1.7, fontSize: '1.05rem' }}>
                          {currentQuestion.explanation || 'No detailed explanation provided.'}
                        </Typography>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    startIcon={<IconChevronLeft />}
                    disabled={currentIndex === 0}
                    onClick={handlePrevious}
                    sx={{ fontWeight: 700, color: '#64748b' }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={<IconChevronRight />}
                    disabled={currentIndex === questions.length - 1}
                    onClick={handleNext}
                    sx={{ py: 1.5, px: 4, borderRadius: '14px', fontWeight: 800, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
                  >
                    Next Question
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Right Sidebar: Stats */}
        <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'sticky', top: 24 }}>
          <Paper sx={{ p: 4, borderRadius: '28px', border: '1px solid #f1f5f9', bgcolor: '#fff' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: '#1e293b' }}>Topic Stats</Typography>
            <Stack spacing={3}>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Total Questions</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900 }}>{questions.length}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Answered</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#6366f1' }}>{Object.keys(answeredStatus).length}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Accuracy</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#22c55e' }}>
                  {Object.keys(answeredStatus).length > 0 
                    ? Math.round((Object.values(answeredStatus).filter(s => s.correct).length / Object.keys(answeredStatus).length) * 100) 
                    : 0}%
                </Typography>
              </Box>
            </Stack>
            <Divider sx={{ my: 4 }} />
            <Box sx={{ bgcolor: 'rgba(99, 102, 241, 0.05)', p: 2, borderRadius: '16px' }}>
              <Typography variant="body2" sx={{ color: '#6366f1', fontWeight: 700, textAlign: 'center' }}>
                Keep practicing to master this topic!
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
