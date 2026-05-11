import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Stack, IconButton, Chip, CircularProgress, Divider } from '@mui/material';
import { IconChevronLeft, IconCheck, IconX, IconArrowRight, IconInfoCircle, IconTrophy } from '@tabler/icons-react';
import apiService from 'services/apiService';
import { motion, AnimatePresence } from 'framer-motion';

export default function MCQPracticePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    setShowExplanation(false);
    setIsCorrect(null);
    try {
      const data = await apiService.getAptitudeQuestionById(id);
      setQuestion(data);
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (idx) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    const correct = idx === question.correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);
  };

  if (loading) {
    return (
      <Box sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (!question) return <Typography>Question not found</Typography>;

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Button startIcon={<IconChevronLeft />} onClick={() => navigate(-1)} sx={{ mb: 4, fontWeight: 700, color: '#64748b' }}>
        Back to Topics
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Paper sx={{ p: { xs: 3, sm: 6 }, borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Chip
              label={question.topic}
              sx={{
                bgcolor: 'rgba(99, 102, 241, 0.08)',
                color: '#6366f1',
                fontWeight: 800,
                borderRadius: '8px',
                textTransform: 'capitalize'
              }}
            />
            <Chip
              label={question.difficulty}
              sx={{
                bgcolor:
                  question.difficulty === 'easy'
                    ? 'rgba(34, 197, 94, 0.08)'
                    : question.difficulty === 'medium'
                      ? 'rgba(234, 179, 8, 0.08)'
                      : 'rgba(239, 44, 44, 0.08)',
                color: question.difficulty === 'easy' ? '#16a34a' : question.difficulty === 'medium' ? '#ca8a04' : '#ef4444',
                fontWeight: 800,
                borderRadius: '8px',
                textTransform: 'uppercase',
                fontSize: '0.65rem'
              }}
            />
          </Stack>

          <Typography variant="h2" sx={{ fontWeight: 800, color: '#1e293b', mb: 6, lineHeight: 1.6, fontSize: '1.6rem' }}>
            {question.question}
          </Typography>

          <Stack spacing={2.5} sx={{ mb: 6 }}>
            {question.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === question.correctAnswer;

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
              } else {
                // Hover state handled by SX
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
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      bgcolor: isSelected || (selectedOption !== null && isCorrectOption) ? color : '#f8fafc',
                      color: isSelected || (selectedOption !== null && isCorrectOption) ? '#fff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900
                    }}
                  >
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
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                <Box sx={{ mt: 4, p: 4, bgcolor: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: '10px',
                        bgcolor: isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 44, 44, 0.1)',
                        color: isCorrect ? '#16a34a' : '#ef4444'
                      }}
                    >
                      {isCorrect ? <IconTrophy size={20} /> : <IconInfoCircle size={20} />}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                      {isCorrect ? 'Excellent! Correct Answer' : 'Keep Learning! Incorrect Answer'}
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2.5, opacity: 0.5 }} />
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: t.textMuted,
                      fontSize: '0.7rem',
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                  >
                    Explanation
                  </Typography>
                  <Typography sx={{ color: '#475569', fontWeight: 600, lineHeight: 1.7, fontSize: '1.05rem' }}>
                    {question.explanation ||
                      'No detailed explanation provided for this question yet. Focus on the core concept and the correct option indicated above.'}
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedOption !== null && (
            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                endIcon={<IconArrowRight />}
                onClick={() => navigate(-1)}
                sx={{ py: 1.5, px: 4, borderRadius: '14px', fontWeight: 800, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
              >
                Next Challenge
              </Button>
            </Box>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
}
