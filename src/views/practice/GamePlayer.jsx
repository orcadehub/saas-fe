import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog
} from '@mui/material';
import { ArrowBack, Lightbulb, Close, AccessTime } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import { useTheme } from '@mui/material/styles';
import { getMazeQuestions } from '../../data/mazeQuestions';
import { getMemoryGameQuestions } from '../../data/memoryGameQuestions';
import { getPuzzleGameQuestions } from '../../data/puzzleGameQuestions';
import { getBalloonPopGameQuestions } from '../../data/balloonPopGameQuestions';
import { getDigitChallengeQuestions } from '../../data/digitChallengeQuestions';
import { getAccentureGames } from '../../data/accentureGames';
import { getAptitudeGames } from '../../data/aptitudeGames';
import MazeGame from '../../components/games/MazeGame';
import DragDropGame from '../../components/games/DragDropGame';
import OrderingGame from '../../components/games/OrderingGame';
import BalloonPopGame from '../../components/games/BalloonPopGame';
import MemoryCardGame from '../../components/games/MemoryCardGame';
import SlidingPuzzle from '../../components/games/SlidingPuzzle';
import EscapeRoomGame from '../../components/games/EscapeRoomGame';
import TechnicalMCQGame from '../../components/games/TechnicalMCQGame';
import DigitChallengeGame from '../../components/games/DigitChallengeGame';
import GeoSudoGame from '../../components/games/GeoSudoGame';
import InductiveLogicGame from '../../components/games/InductiveLogicGame';
import GridChallengeGame from '../../components/games/GridChallengeGame';
import MotionChallengeGame from '../../components/games/MotionChallengeGame';
import SwitchChallengeGame from '../../components/games/SwitchChallengeGame';
import VerbalAbilityGame from '../../components/games/VerbalAbilityGame';
import QuantitativeGame from '../../components/games/QuantitativeGame';
import LogicalReasoningGame from '../../components/games/LogicalReasoningGame';

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const GamePlayer = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { subtopicId, questionId } = useParams();
  const themeColor = theme.palette.primary.main;
  const [game, setGame] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [selectedDisplayId, setSelectedDisplayId] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [usedHints, setUsedHints] = useState([]);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [showMazePath, setShowMazePath] = useState(false);
  const [mazeHasPath, setMazeHasPath] = useState(null);
  const [mazeDisabled, setMazeDisabled] = useState(false);
  const [aptitudeQuestionInfo, setAptitudeQuestionInfo] = useState(null);

  useEffect(() => {
    fetchGame();
  }, [questionId]);

  useEffect(() => {
    if (game && game.levels[currentLevel]) {
      const level = game.levels[currentLevel];
      if (level.options && level.shuffleOptions !== false) {
        const shuffled = shuffleArray(level.options);
        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        setShuffledOptions(shuffled.map((opt, idx) => ({ ...opt, displayId: labels[idx] })));
      } else if (level.options) {
        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        setShuffledOptions(level.options.map((opt, idx) => ({ ...opt, displayId: labels[idx] })));
      }
    }
    setSelectedAnswer('');
    setSelectedDisplayId('');
    setMazeHasPath(null);
  }, [game, currentLevel]);

  useEffect(() => {
    if (game && timeLeft > 0 && !gameCompleted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, game, gameCompleted]);

  const fetchGame = async () => {
    try {
      if (subtopicId === 'subtopic-gamified-maze-games') {
        const mazeQs = getMazeQuestions(subtopicId);
        const mazeGame = mazeQs.find(q => q._id === questionId);
        if (mazeGame) {
          setGame(mazeGame);
          setTimeLeft(mazeGame.totalTimeLimit || 1200);
          return;
        }
      }
      
      if (subtopicId === 'subtopic-gamified-memory-games') {
        const memoryQs = getMemoryGameQuestions(subtopicId);
        const memoryGame = memoryQs.find(q => q._id === questionId);
        if (memoryGame) {
          setGame(memoryGame);
          setTimeLeft(memoryGame.totalTimeLimit || 1200);
          return;
        }
      }
      
      if (subtopicId === 'subtopic-gamified-puzzle-games') {
        const puzzleQs = getPuzzleGameQuestions(subtopicId);
        const puzzleGame = puzzleQs.find(q => q._id === questionId);
        if (puzzleGame) {
          setGame(puzzleGame);
          setTimeLeft(puzzleGame.totalTimeLimit || 1200);
          return;
        }
      }
      
      if (subtopicId === 'subtopic-gamified-balloon-pop-games') {
        const balloonQs = getBalloonPopGameQuestions(subtopicId);
        const balloonGame = balloonQs.find(q => q._id === questionId);
        if (balloonGame) {
          setGame(balloonGame);
          setTimeLeft(balloonGame.totalTimeLimit || 1200);
          return;
        }
      }
      
      if (subtopicId === 'subtopic-gamified-digit-challenge') {
        const digitQs = getDigitChallengeQuestions(subtopicId);
        const digitGame = digitQs.find(q => q._id === questionId);
        if (digitGame) {
          setGame(digitGame);
          setTimeLeft(digitGame.totalTimeLimit || 300);
          return;
        }
      }
      
      if (subtopicId.startsWith('subtopic-accenture-')) {
        const accentureQs = getAccentureGames(subtopicId);
        const accentureGame = accentureQs.find(q => q._id === questionId);
        if (accentureGame) {
          setGame(accentureGame);
          setTimeLeft(accentureGame.totalTimeLimit || 300);
          return;
        }
      }
      
      if (subtopicId.startsWith('subtopic-aptitude-')) {
        const aptitudeQs = getAptitudeGames(subtopicId);
        const aptitudeGame = aptitudeQs.find(q => q._id === questionId);
        if (aptitudeGame) {
          setGame(aptitudeGame);
          setTimeLeft(aptitudeGame.totalTimeLimit || 300);
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    const level = game.levels[currentLevel];
    let correct = false;
    
    console.log('Submit - selectedAnswer:', selectedAnswer, 'mazeHasPath:', mazeHasPath);
    
    if (level.questionType === 'MCQ') {
      const selectedOption = shuffledOptions.find(opt => opt.displayId === selectedDisplayId);
      correct = selectedOption && selectedOption.id === level.correctAnswer;
    } else if (level.questionType === 'FillBlank') {
      correct = selectedAnswer.trim().toLowerCase() === level.correctAnswer.toLowerCase();
    } else if (level.questionType === 'Interactive') {
      if (selectedAnswer === 'no-path') {
        correct = !mazeHasPath;
        console.log('No-path answer - correct:', correct);
        if (correct) {
          setScore(prev => prev + level.pointsForLevel);
        }
      } else {
        correct = selectedAnswer === 'completed';
        if (correct) {
          setScore(prev => prev + level.pointsForLevel);
        }
      }
    }
    
    setIsCorrect(correct);
    setShowResult(true);


  };

  const handleNextLevel = async () => {
    if (currentLevel < game.levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setSelectedAnswer('');
      setSelectedDisplayId('');
      setShowResult(false);
      setUsedHints([]);
      setShowMazePath(false);
      setMazeDisabled(false);
      setMazeHasPath(null);
    } else {

      setGameCompleted(true);
    }
  };

  const handleUseHint = (hint) => {
    if (!usedHints.includes(hint.hintNumber)) {
      setUsedHints([...usedHints, hint.hintNumber]);
      setScore(Math.max(0, score - hint.pointsDeduction));
      
      if (level.questionType === 'Interactive') {
        setShowMazePath(true);
        setTimeout(() => setShowMazePath(false), 2000);
      }
    }
  };

  if (!game) {
    return (
      <MainCard>
        <Typography>Loading Game...</Typography>
      </MainCard>
    );
  }

  const level = game.levels[currentLevel];
  const progress = ((currentLevel + 1) / game.levels.length) * 100;
  
  const displayQuestionInfo = aptitudeQuestionInfo 
    ? `Question ${aptitudeQuestionInfo.current} of ${aptitudeQuestionInfo.total}`
    : `Question ${currentLevel + 1} of ${game.levels.length}`;

  return (
    <MainCard>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(`/practice/gamified/${subtopicId}`)} color="primary">
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h3">{game.title}</Typography>
            <Typography variant="body2" color="text.secondary">{displayQuestionInfo}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime fontSize="small" />
            <Typography>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Typography>
          </Box>
          <Box sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography>Score: {score} / {game.points}</Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ height: 4, bgcolor: 'grey.200', borderRadius: 2, mb: 3 }}>
        <Box sx={{ height: '100%', width: `${progress}%`, bgcolor: 'primary.main', borderRadius: 2, transition: 'width 0.5s' }} />
      </Box>

      <Box>
          {level.questionType === 'Interactive' ? (
            <Box sx={{ display: 'flex', gap: 4 }}>
              {/* Left Side - Question, Hints, Submit */}
              <Box sx={{ flex: 1 }}>
                {/* Question */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: themeColor, lineHeight: 1.6 }}>
                    {level.question}
                  </Typography>
                </Box>

                {/* Hints */}
                {level.hints && level.hints.length > 0 && !showResult && (
                  <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {level.hints.map((hint) => (
                      <Button
                        key={hint.hintNumber}
                        onClick={() => handleUseHint(hint)}
                        disabled={usedHints.includes(hint.hintNumber)}
                        startIcon={<Lightbulb />}
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          fontWeight: 600,
                          bgcolor: usedHints.includes(hint.hintNumber) ? 'rgba(251,191,36,0.2)' : '#fbbf24',
                          color: usedHints.includes(hint.hintNumber) ? '#92400e' : 'white',
                          border: '1px solid',
                          borderColor: usedHints.includes(hint.hintNumber) ? 'rgba(251,191,36,0.4)' : '#f59e0b',
                          '&:hover': { bgcolor: usedHints.includes(hint.hintNumber) ? `${themeColor}33` : themeColor, filter: 'brightness(0.9)', boxShadow: `0 5px 20px ${themeColor}4D` }
                        }}
                      >
                        {usedHints.includes(hint.hintNumber) ? hint.hintText : `Hint (-${hint.pointsDeduction} pts)`}
                      </Button>
                    ))}
                  </Box>
                )}

                {/* Result */}
                {showResult && (
                  <Box sx={{ mb: 3, p: 3, borderRadius: 3, border: '2px solid', borderColor: isCorrect ? '#10b981' : '#ef4444', background: isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography sx={{ fontSize: '2.5rem' }}>{isCorrect ? '🎉' : (selectedAnswer === 'no-path' && mazeHasPath ? '😂' : '😔')}</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: isCorrect ? '#059669' : '#dc2626' }}>
                        {isCorrect ? 'Correct!' : (selectedAnswer === 'no-path' && mazeHasPath ? 'Incorrect' : 'Incorrect')}
                      </Typography>
                    </Box>
                    <Typography sx={{ color: '#374151', fontSize: '1.125rem' }}>
                      {isCorrect ? `+${level.pointsForLevel} points earned!` : (
                        selectedAnswer === 'no-path' && mazeHasPath ? 'Path exists! Check the highlighted path.' : 'Try again!'
                      )}
                    </Typography>
                  </Box>
                )}

                {/* No Path Button */}
                {!showResult && (
                  <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: '#fef3c7', border: '1px solid #fbbf24' }}>
                    <Typography sx={{ color: '#92400e', fontSize: '0.95rem', mb: 2 }}>
                      💡 If you feel there is no path to reach the goal, click the button below
                    </Typography>
                    <Button
                      onClick={() => {
                        if (mazeHasPath !== null) {
                          console.log('Button clicked - mazeHasPath:', mazeHasPath);
                          setMazeDisabled(true);
                          setShowMazePath(true);
                          setSelectedAnswer('no-path');
                          
                          const level = game.levels[currentLevel];
                          const correct = !mazeHasPath;
                          console.log('Immediate check - correct:', correct);
                          
                          setIsCorrect(correct);
                          setShowResult(true);
                          
                          if (correct) {
                            setScore(prev => prev + level.pointsForLevel);
                          }
                        }
                      }}
                      disabled={mazeHasPath === null}
                      sx={{
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        fontWeight: 600,
                        bgcolor: mazeHasPath === null ? '#d1d5db' : '#ef4444',
                        color: 'white',
                        '&:hover': { bgcolor: mazeHasPath === null ? '#d1d5db' : '#dc2626' },
                        '&:disabled': { cursor: 'not-allowed' }
                      }}
                    >
                      {mazeHasPath === null ? 'Loading...' : 'No Path Available'}
                    </Button>
                  </Box>
                )}

                {/* Action Button */}
                {showResult && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Button
                      onClick={handleNextLevel}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: '1.125rem',
                        bgcolor: themeColor,
                        color: 'white',
                        boxShadow: `0 10px 30px ${themeColor}80`,
                        '&:hover': { bgcolor: themeColor, filter: 'brightness(0.9)', transform: 'scale(1.05)' },
                        transition: 'all 0.3s'
                      }}
                    >
                      {currentLevel < game.levels.length - 1 ? 'Next Level →' : 'Finish Game 🏆'}
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Right Side - Maze */}
              <Box sx={{ flex: 1 }}>
                <MazeGame 
                  key={currentLevel}
                  level={level}
                  showPath={showMazePath}
                  disabled={mazeDisabled}
                  themeColor={themeColor}
                  onNoPathCheck={(hasPath) => {
                    console.log('Setting mazeHasPath to:', hasPath);
                    setMazeHasPath(hasPath);
                  }}
                  onComplete={(success) => {
                    setSelectedAnswer('completed');
                    setIsCorrect(success);
                    setShowResult(true);
                    if (success) setScore(score + level.pointsForLevel);
                  }} 
                />
              </Box>
            </Box>
          ) : level.questionType === 'MemoryCard' ? (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: themeColor, lineHeight: 1.6 }}>
                  {level.question}
                </Typography>
              </Box>

              {!showResult && (
                <MemoryCardGame 
                  level={level} 
                  themeColor={themeColor}
                  onSubmit={(success) => {
                    setSelectedAnswer('completed');
                    setIsCorrect(success);
                    setShowResult(true);
                    if (success) setScore(score + level.pointsForLevel);
                  }}
                />
              )}

              {showResult && (
                <Box sx={{ mb: 3, p: 3, borderRadius: 3, border: '2px solid', borderColor: isCorrect ? '#10b981' : '#ef4444', background: isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography sx={{ fontSize: '2.5rem' }}>{isCorrect ? '🎉' : '😔'}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: isCorrect ? '#059669' : '#dc2626' }}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: '#374151', fontSize: '1.125rem' }}>
                    {isCorrect ? `+${level.pointsForLevel} points earned!` : 'Try again!'}
                  </Typography>
                </Box>
              )}

              {showResult && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    onClick={handleNextLevel}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      background: 'linear-gradient(to right, #6a0dad, #c77dff)',
                      color: 'white',
                      boxShadow: '0 10px 30px rgba(106,13,173,0.5)',
                      '&:hover': { background: 'linear-gradient(to right, #560bad, #b5179e)', transform: 'scale(1.05)' },
                      transition: 'all 0.3s'
                    }}
                  >
                    {currentLevel < game.levels.length - 1 ? 'Next Level →' : 'Finish Game 🏆'}
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <Box>
          {/* Question */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: themeColor, lineHeight: 1.6 }}>
              {level.question}
            </Typography>
          </Box>

          {/* Options */}
          {level.questionType === 'MCQ' && !level.correctAnswer.includes('dataset') && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              {shuffledOptions.map((option) => {
                const isSelected = selectedDisplayId === option.displayId;
                const isCorrectAnswer = showResult && option.id === level.correctAnswer;
                const isWrongAnswer = showResult && isSelected && option.id !== level.correctAnswer;
                
                return (
                  <Box
                    key={option.id}
                    onClick={() => !showResult && (setSelectedAnswer(option.id), setSelectedDisplayId(option.displayId))}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '2px solid',
                    borderColor: isCorrectAnswer ? '#10b981' : isWrongAnswer ? '#ef4444' : isSelected ? themeColor : `${themeColor}4D`,
                      background: isCorrectAnswer ? 'linear-gradient(to right, #10b981, #059669)' : isWrongAnswer ? 'linear-gradient(to right, #ef4444, #dc2626)' : isSelected ? 'linear-gradient(to right, #6a0dad, #9d4edd)' : '#faf5ff',
                      cursor: showResult ? 'default' : 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: isCorrectAnswer || isWrongAnswer || isSelected ? '0 10px 30px rgba(0,0,0,0.3)' : 'none',
                      '&:hover': showResult ? {} : { bgcolor: `${themeColor}14`, borderColor: themeColor, transform: 'scale(1.02)' },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.125rem', color: 'white' }}>
                      {option.displayId}
                    </Box>
                    <Typography sx={{ color: isSelected || isCorrectAnswer || isWrongAnswer ? 'white' : '#6a0dad', fontWeight: 500, fontSize: '1.125rem', flex: 1 }}>{option.text}</Typography>
                    {isCorrectAnswer && <Typography sx={{ fontSize: '1.5rem' }}>✓</Typography>}
                    {isWrongAnswer && <Typography sx={{ fontSize: '1.5rem' }}>✗</Typography>}
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Fill in the Blank */}
          {level.questionType === 'FillBlank' && (
            <Box sx={{ mb: 3 }}>
              <Box
                component="input"
                type="text"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={showResult}
                placeholder="Type your answer here..."
                sx={{
                  width: '100%',
                  p: 2,
                  fontSize: '1.125rem',
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: showResult ? (isCorrect ? '#10b981' : '#ef4444') : themeColor,
                  bgcolor: showResult ? (isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)') : 'white',
                  color: '#6a0dad',
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'all 0.3s',
                  '&:focus': {
                    borderColor: themeColor,
                    boxShadow: `0 0 0 3px ${themeColor}1A`
                  },
                  '&:disabled': {
                    cursor: 'not-allowed',
                    opacity: 0.7
                  }
                }}
              />
            </Box>
          )}

          {/* Interactive Maze */}
          {level.questionType === 'Interactive' && !showResult && (
            <Box />
          )}

          {/* Drag and Drop */}
          {level.questionType === 'DragDrop' && !showResult && (
            <DragDropGame 
              level={level} 
              onComplete={(success) => {
                setSelectedAnswer('completed');
                setIsCorrect(success);
                setShowResult(true);
                if (success) setScore(score + level.pointsForLevel);
              }} 
            />
          )}

          {/* Ordering */}
          {level.questionType === 'Ordering' && !showResult && (
            <OrderingGame 
              level={level} 
              onComplete={(success) => {
                setSelectedAnswer('completed');
                setIsCorrect(success);
                setShowResult(true);
                if (success) setScore(score + level.pointsForLevel);
              }} 
            />
          )}

          {/* Balloon Pop */}
          {level.questionType === 'BalloonPop' && !showResult && (
            <BalloonPopGame 
              level={level} 
              themeColor={themeColor}
              onSubmit={(success) => {
                setSelectedAnswer('completed');
                setIsCorrect(success);
                setShowResult(true);
                if (success) setScore(score + level.pointsForLevel);
              }}
              onHint={() => {
                if (level.hints?.[0] && !usedHints.includes(1)) {
                  setUsedHints([...usedHints, 1]);
                  setScore(Math.max(0, score - level.hints[0].pointsDeduction));
                }
              }}
            />
          )}



          {/* Sliding Puzzle */}
          {level.questionType === 'SlidingPuzzle' && !showResult && (
            <SlidingPuzzle 
              level={level} 
              themeColor={themeColor}
              onSubmit={(success) => {
                setSelectedAnswer('completed');
                setIsCorrect(success);
                setShowResult(true);
                if (success) setScore(score + level.pointsForLevel);
              }}
            />
          )}

          {/* Escape Room */}
          {level.questionType === 'EscapeRoom' && !showResult && (
            <EscapeRoomGame 
              key={currentLevel}
              level={level} 
              onSubmit={(success) => {
                setSelectedAnswer('completed');
                setIsCorrect(success);
                setShowResult(true);
                if (success) setScore(score + level.pointsForLevel);
              }}
            />
          )}

          {/* Technical MCQ from CSV */}
          {level.questionType === 'MCQ' && level.correctAnswer.includes('dataset') && !showResult && (
            <TechnicalMCQGame 
              dataset={JSON.parse(level.correctAnswer).dataset}
              onSubmit={(success) => {
                setSelectedAnswer('completed');
                setIsCorrect(success);
                setShowResult(true);
                if (success) setScore(score + level.pointsForLevel);
              }}
            />
          )}

          {/* Digit Challenge Game */}
          {level.questionType === 'DigitChallenge' && !showResult && (
            <DigitChallengeGame 
              difficulty={level.difficulty}
              onComplete={(finalScore) => {
                setSelectedAnswer('completed');
                setIsCorrect(true);
                setShowResult(true);
                setScore(score + level.pointsForLevel);
              }}
            />
          )}

          {/* Geo-Sudo Game */}
          {level.questionType === 'GeoSudo' && !showResult && (
            <GeoSudoGame 
              difficulty={level.difficulty}
              onComplete={(finalScore) => {
                setSelectedAnswer('completed');
                setIsCorrect(true);
                setShowResult(true);
                setScore(score + level.pointsForLevel);
              }}
            />
          )}

          {/* Inductive Logic Game */}
          {level.questionType === 'InductiveLogic' && !showResult && (
            <InductiveLogicGame 
              difficulty={level.difficulty}
              onComplete={(finalScore) => {
                setSelectedAnswer('completed');
                setIsCorrect(true);
                setShowResult(true);
                setScore(score + level.pointsForLevel);
              }}
            />
          )}

          {/* Grid Challenge Game */}
          {level.questionType === 'GridChallenge' && !showResult && (
            <GridChallengeGame 
              difficulty={level.difficulty}
              onComplete={(finalScore) => {
                setSelectedAnswer('completed');
                setIsCorrect(true);
                setShowResult(true);
                setScore(score + level.pointsForLevel);
              }}
            />
          )}

          {/* Motion Challenge Game */}
          {level.questionType === 'MotionChallenge' && !showResult && (
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <MotionChallengeGame 
                difficulty={level.difficulty}
                onComplete={(finalScore) => {
                  setSelectedAnswer('completed');
                  setIsCorrect(true);
                  setShowResult(true);
                  setScore(score + level.pointsForLevel);
                }}
              />
            </Box>
          )}

          {/* Switch Challenge Game */}
          {level.questionType === 'SwitchChallenge' && !showResult && (
            <SwitchChallengeGame 
              difficulty={level.difficulty}
              onComplete={(finalScore) => {
                setSelectedAnswer('completed');
                setIsCorrect(true);
                setShowResult(true);
                setScore(score + level.pointsForLevel);
              }}
            />
          )}

          {/* Verbal Ability Game */}
          {level.questionType === 'VerbalAbility' && !showResult && (
            <VerbalAbilityGame 
              difficulty={level.difficulty}
              onQuestionChange={(current, total) => setAptitudeQuestionInfo({ current, total })}
              onComplete={(finalScore) => {
                setSelectedAnswer('completed');
                setIsCorrect(true);
                setShowResult(true);
                setScore(score + level.pointsForLevel);
              }}
            />
          )}

          {/* Quantitative Game */}
          {level.questionType === 'Quantitative' && !showResult && (
            <QuantitativeGame 
              difficulty={level.difficulty}
              onQuestionChange={(current, total) => setAptitudeQuestionInfo({ current, total })}
              onComplete={(finalScore) => {
                setSelectedAnswer('completed');
                setIsCorrect(true);
                setShowResult(true);
                setScore(score + level.pointsForLevel);
              }}
            />
          )}

          {/* Logical Reasoning Game */}
          {level.questionType === 'LogicalReasoning' && !showResult && (
            <LogicalReasoningGame 
              difficulty={level.difficulty}
              onQuestionChange={(current, total) => setAptitudeQuestionInfo({ current, total })}
              onComplete={(finalScore) => {
                setSelectedAnswer('completed');
                setIsCorrect(true);
                setShowResult(true);
                setScore(score + level.pointsForLevel);
              }}
            />
          )}

          {/* Hints */}
          {level.hints && level.hints.length > 0 && !showResult && (
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {level.hints.map((hint) => (
                <Button
                  key={hint.hintNumber}
                  onClick={() => handleUseHint(hint)}
                  disabled={usedHints.includes(hint.hintNumber)}
                  startIcon={<Lightbulb />}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    bgcolor: usedHints.includes(hint.hintNumber) ? 'rgba(251,191,36,0.2)' : '#fbbf24',
                    color: usedHints.includes(hint.hintNumber) ? '#92400e' : 'white',
                    border: '1px solid',
                    borderColor: usedHints.includes(hint.hintNumber) ? 'rgba(251,191,36,0.4)' : '#f59e0b',
                    '&:hover': { bgcolor: usedHints.includes(hint.hintNumber) ? 'rgba(251,191,36,0.2)' : '#f59e0b', boxShadow: '0 5px 20px rgba(251,191,36,0.3)' }
                  }}
                >
                  {usedHints.includes(hint.hintNumber) ? hint.hintText : `Hint (-${hint.pointsDeduction} pts)`}
                </Button>
              ))}
            </Box>
          )}

          {/* Result */}
          {showResult && (
            <Box sx={{ mb: 3, p: 3, borderRadius: 3, border: '2px solid', borderColor: isCorrect ? '#10b981' : '#ef4444', background: isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography sx={{ fontSize: '2.5rem' }}>{isCorrect ? '🎉' : '😔'}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: isCorrect ? '#059669' : '#dc2626' }}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </Typography>
              </Box>
              <Typography sx={{ color: '#374151', fontSize: '1.125rem' }}>
                {isCorrect ? `+${level.pointsForLevel} points earned!` : (
                  level.questionType === 'DragDrop' ? (
                    <Box sx={{ mt: 2 }}>
                      <Typography sx={{ fontWeight: 600, mb: 1 }}>Correct Matches:</Typography>
                      {Object.entries(JSON.parse(level.correctAnswer).correct).map(([item, zone]) => (
                        <Typography key={item} sx={{ ml: 2 }}>• {item} → {zone}</Typography>
                      ))}
                    </Box>
                  ) : `Correct answer: ${level.correctAnswer}`
                )}
              </Typography>
            </Box>
          )}

          {/* Action Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {!showResult ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  background: selectedAnswer ? 'linear-gradient(to right, #10b981, #059669)' : `${themeColor}4D`,
                  color: selectedAnswer ? 'white' : themeColor,
                  boxShadow: selectedAnswer ? '0 10px 30px rgba(16,185,129,0.5)' : 'none',
                  '&:hover': selectedAnswer ? { background: 'linear-gradient(to right, #059669, #047857)', transform: 'scale(1.05)' } : {},
                  transition: 'all 0.3s'
                }}
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNextLevel}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  bgcolor: themeColor,
                  color: 'white',
                  boxShadow: `0 10px 30px ${themeColor}80`,
                  '&:hover': { bgcolor: themeColor, filter: 'brightness(0.9)', transform: 'scale(1.05)' },
                  transition: 'all 0.3s'
                }}
              >
                {currentLevel < game.levels.length - 1 ? 'Next Level →' : 'Finish Game 🏆'}
              </Button>
            )}
          </Box>
            </Box>
          )}
        </Box>

      <Dialog open={gameCompleted} maxWidth="sm" fullWidth>
        <Box sx={{ p: 4, position: 'relative' }}>
          <IconButton onClick={() => navigate(`/practice/gamified/${subtopicId}`)} sx={{ position: 'absolute', top: 16, right: 16 }}>
            <Close />
          </IconButton>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ mb: 2 }}>🎉</Typography>
            <Typography variant="h4" sx={{ mb: 3 }}>Game Completed!</Typography>
            
            <Box sx={{ bgcolor: 'grey.100', borderRadius: 2, p: 3, mb: 3 }}>
              <Typography variant="h2" color="primary">
                {score}
              </Typography>
              <Typography>out of {game.points} points</Typography>
            </Box>
            
            <Typography sx={{ mb: 3 }}>
              You completed {currentLevel + 1} of {game.levels.length} levels!
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(`/practice/gamified/${subtopicId}`)}
              >
                Back to Questions
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => window.location.reload()}
              >
                Play Again
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </MainCard>
  );
};

export default GamePlayer;
