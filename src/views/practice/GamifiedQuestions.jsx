import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Breadcrumbs, Link } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { IconTrophy, IconChevronRight } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { gamifiedData } from '../../data/gamifiedData';
import { getMazeQuestions } from '../../data/mazeQuestions';
import { getMemoryGameQuestions } from '../../data/memoryGameQuestions';
import { getPuzzleGameQuestions } from '../../data/puzzleGameQuestions';
import { getBalloonPopGameQuestions } from '../../data/balloonPopGameQuestions';
import { getDigitChallengeQuestions } from '../../data/digitChallengeQuestions';
import { getAccentureGames } from '../../data/accentureGames';

export default function GamifiedQuestions() {
  const navigate = useNavigate();
  const { subtopicId } = useParams();
  const [subtopic, setSubtopic] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const found = gamifiedData.subtopics.find(st => st._id === subtopicId);
    setSubtopic(found);
    
    let gameQuestions = [];
    if (subtopicId === 'subtopic-gamified-maze-games') {
      gameQuestions = getMazeQuestions(subtopicId);
    } else if (subtopicId === 'subtopic-gamified-memory-games') {
      gameQuestions = getMemoryGameQuestions(subtopicId);
    } else if (subtopicId === 'subtopic-gamified-puzzle-games') {
      gameQuestions = getPuzzleGameQuestions(subtopicId);
    } else if (subtopicId === 'subtopic-gamified-balloon-pop-games') {
      gameQuestions = getBalloonPopGameQuestions(subtopicId);
    } else if (subtopicId === 'subtopic-gamified-digit-challenge') {
      gameQuestions = getDigitChallengeQuestions(subtopicId);
    } else if (subtopicId.startsWith('subtopic-accenture-')) {
      gameQuestions = getAccentureGames(subtopicId);
    }
    setQuestions(gameQuestions);
  }, [subtopicId]);

  return (
    <MainCard>
      <Breadcrumbs separator={<IconChevronRight size={16} />} sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/practice');
          }}
          sx={{ cursor: 'pointer' }}
        >
          Practice
        </Link>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/practice/gamified');
          }}
          sx={{ cursor: 'pointer' }}
        >
          Gamified
        </Link>
        <Typography color="text.primary">{subtopic?.title || 'Loading...'}</Typography>
      </Breadcrumbs>

      <Typography variant="h3" sx={{ mb: 1 }}>
        {subtopic?.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {subtopic?.description}
      </Typography>

      {questions.length === 0 ? (
        <Typography>No games available</Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: 2
          }}
        >
          {questions.map((question) => (
            <Card
              key={question._id}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                borderRadius: 4,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                },
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
              onClick={() => navigate(`/practice/gamified/${subtopicId}/${question._id}`)}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <IconTrophy size={24} color="#1976d2" />
                  <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    {question.title}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {question.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 'auto' }}>
                  <Chip
                    label={question.difficulty || 'Easy'}
                    size="small"
                    color={question.difficulty === 'Hard' ? 'error' : question.difficulty === 'Medium' ? 'warning' : 'success'}
                  />
                  <Chip
                    label={`${question.points} pts`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </MainCard>
  );
}
