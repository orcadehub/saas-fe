import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, LinearProgress } from '@mui/material';

const synonymPairs = [
  ['ABUNDANT', 'Plentiful', ['Scarce', 'Limited', 'Rare']],
  ['BRIEF', 'Short', ['Long', 'Detailed', 'Extended']],
  ['CLEVER', 'Smart', ['Dull', 'Stupid', 'Slow']],
  ['HAPPY', 'Joyful', ['Sad', 'Angry', 'Upset']],
  ['RAPID', 'Fast', ['Slow', 'Steady', 'Gradual']],
  ['VITAL', 'Essential', ['Unimportant', 'Minor', 'Trivial']],
  ['WEALTHY', 'Rich', ['Poor', 'Needy', 'Broke']],
  ['HUGE', 'Enormous', ['Tiny', 'Small', 'Little']],
  ['SIMPLE', 'Easy', ['Complex', 'Hard', 'Difficult']],
  ['STRONG', 'Powerful', ['Weak', 'Feeble', 'Fragile']],
  ['BEAUTIFUL', 'Gorgeous', ['Ugly', 'Plain', 'Hideous']],
  ['BRAVE', 'Courageous', ['Cowardly', 'Timid', 'Fearful']],
  ['CALM', 'Peaceful', ['Agitated', 'Restless', 'Turbulent']],
  ['DIFFICULT', 'Hard', ['Easy', 'Simple', 'Effortless']],
  ['EAGER', 'Enthusiastic', ['Reluctant', 'Unwilling', 'Hesitant']]
];

const antonymPairs = [
  ['BRAVE', 'Cowardly', ['Bold', 'Fearless', 'Heroic']],
  ['ANCIENT', 'Modern', ['Old', 'Historic', 'Aged']],
  ['DIFFICULT', 'Easy', ['Hard', 'Complex', 'Tough']],
  ['EXPAND', 'Contract', ['Grow', 'Increase', 'Enlarge']],
  ['GENEROUS', 'Selfish', ['Kind', 'Giving', 'Charitable']],
  ['INNOCENT', 'Guilty', ['Pure', 'Blameless', 'Virtuous']],
  ['VICTORY', 'Defeat', ['Win', 'Success', 'Triumph']],
  ['LOVE', 'Hate', ['Adore', 'Like', 'Cherish']],
  ['BEGIN', 'End', ['Start', 'Commence', 'Initiate']],
  ['ACCEPT', 'Reject', ['Receive', 'Take', 'Approve']],
  ['BRIGHT', 'Dull', ['Shiny', 'Brilliant', 'Radiant']],
  ['CREATE', 'Destroy', ['Build', 'Make', 'Form']],
  ['DEEP', 'Shallow', ['Profound', 'Bottomless', 'Intense']],
  ['EARLY', 'Late', ['Soon', 'Prompt', 'Timely']],
  ['FRIEND', 'Enemy', ['Ally', 'Companion', 'Buddy']]
];

const sentenceTemplates = [
  ['He was _____ by the news.', 'shocked', ['shocking', 'shock', 'shocks']],
  ['She _____ to the party yesterday.', 'went', ['go', 'goes', 'going']],
  ['The book _____ on the table.', 'is', ['are', 'was', 'were']],
  ['They _____ playing cricket now.', 'are', ['is', 'was', 'were']],
  ['She has _____ her homework.', 'completed', ['complete', 'completing', 'completes']],
  ['He _____ a doctor.', 'is', ['are', 'am', 'be']],
  ['I _____ seen that movie.', 'have', ['has', 'had', 'having']],
  ['She _____ singing beautifully.', 'was', ['is', 'were', 'are']],
  ['They _____ arrived late.', 'have', ['has', 'had', 'having']],
  ['He _____ working hard.', 'is', ['are', 'am', 'be']],
  ['We _____ to the mall tomorrow.', 'will go', ['goes', 'went', 'going']],
  ['She _____ her keys yesterday.', 'lost', ['lose', 'loses', 'losing']],
  ['They _____ football every Sunday.', 'play', ['plays', 'played', 'playing']],
  ['He _____ his breakfast already.', 'has eaten', ['eat', 'ate', 'eating']],
  ['I _____ my friend next week.', 'will meet', ['meet', 'met', 'meeting']]
];

const spellingWords = [
  ['ACCOMMODATE', 'ACCOMMODATE', ['ACCOMODATE', 'ACOMODATE', 'ACOMMODATE']],
  ['NECESSARY', 'NECESSARY', ['NECCESSARY', 'NECESARY', 'NECCESARY']],
  ['SEPARATE', 'SEPARATE', ['SEPERATE', 'SEPARETE', 'SEPRATE']],
  ['DEFINITELY', 'DEFINITELY', ['DEFINATELY', 'DEFINITLY', 'DEFINETLY']],
  ['OCCURRENCE', 'OCCURRENCE', ['OCCURENCE', 'OCCURANCE', 'OCCURRANCE']]
];

const idioms = [
  ['A piece of cake', 'Very easy', ['Very difficult', 'A dessert', 'Expensive']],
  ['Break the ice', 'Start conversation', ['Break something', 'Feel cold', 'Stop talking']],
  ['Hit the nail on the head', 'Exactly right', ['Make mistake', 'Use hammer', 'Be violent']],
  ['Spill the beans', 'Reveal secret', ['Cook food', 'Make mess', 'Waste time']],
  ['Under the weather', 'Feeling sick', ['In rain', 'Outside', 'Happy']]
];

const oneWordSubs = [
  ['A person who loves books', 'Bibliophile', ['Bibliographer', 'Librarian', 'Author']],
  ['Study of stars', 'Astronomy', ['Astrology', 'Biology', 'Geology']],
  ['Fear of heights', 'Acrophobia', ['Claustrophobia', 'Agoraphobia', 'Hydrophobia']],
  ['A person who eats too much', 'Glutton', ['Gourmet', 'Chef', 'Foodie']],
  ['Government by the people', 'Democracy', ['Autocracy', 'Monarchy', 'Oligarchy']]
];

const readingComp = [
  ['The sun rises in the east. It sets in the west.', 'Where does sun rise?', 'East', ['West', 'North', 'South']],
  ['Dogs are loyal animals. They protect homes.', 'What are dogs?', 'Loyal', ['Disloyal', 'Wild', 'Dangerous']],
  ['Water boils at 100°C. It freezes at 0°C.', 'Boiling point of water?', '100°C', ['0°C', '50°C', '200°C']]
];

const generateQuestion = () => {
  const types = ['synonym', 'antonym', 'sentence', 'spelling', 'idiom', 'oneword', 'reading'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  if (type === 'synonym') {
    const [word, correct, wrongs] = synonymPairs[Math.floor(Math.random() * synonymPairs.length)];
    const options = [correct, ...wrongs].sort(() => Math.random() - 0.5);
    return { type, word, options, answer: correct };
  } else if (type === 'antonym') {
    const [word, correct, wrongs] = antonymPairs[Math.floor(Math.random() * antonymPairs.length)];
    const options = [correct, ...wrongs].sort(() => Math.random() - 0.5);
    return { type, word, options, answer: correct };
  } else if (type === 'sentence') {
    const [question, correct, wrongs] = sentenceTemplates[Math.floor(Math.random() * sentenceTemplates.length)];
    const options = [correct, ...wrongs].sort(() => Math.random() - 0.5);
    return { type, question, options, answer: correct };
  } else if (type === 'spelling') {
    const [word, correct, wrongs] = spellingWords[Math.floor(Math.random() * spellingWords.length)];
    const options = [correct, ...wrongs].sort(() => Math.random() - 0.5);
    return { type: 'spelling', question: 'Choose correct spelling:', word: options, options, answer: correct };
  } else if (type === 'idiom') {
    const [idiom, correct, wrongs] = idioms[Math.floor(Math.random() * idioms.length)];
    const options = [correct, ...wrongs].sort(() => Math.random() - 0.5);
    return { type: 'idiom', question: `Meaning of "${idiom}"?`, options, answer: correct };
  } else if (type === 'oneword') {
    const [phrase, correct, wrongs] = oneWordSubs[Math.floor(Math.random() * oneWordSubs.length)];
    const options = [correct, ...wrongs].sort(() => Math.random() - 0.5);
    return { type: 'oneword', question: `One word for: ${phrase}`, options, answer: correct };
  } else {
    const [passage, question, correct, wrongs] = readingComp[Math.floor(Math.random() * readingComp.length)];
    const options = [correct, ...wrongs].sort(() => Math.random() - 0.5);
    return { type: 'reading', passage, question, options, answer: correct };
  }
};

const verbalQuestions = [
  { type: 'synonym', word: 'ABUNDANT', options: ['Scarce', 'Plentiful', 'Limited', 'Rare'], answer: 'Plentiful' },
  { type: 'antonym', word: 'BRAVE', options: ['Cowardly', 'Bold', 'Fearless', 'Heroic'], answer: 'Cowardly' },
  { type: 'sentence', question: 'He was _____ by the news.', options: ['shocked', 'shocking', 'shock', 'shocks'], answer: 'shocked' },
  { type: 'synonym', word: 'BRIEF', options: ['Long', 'Short', 'Detailed', 'Extended'], answer: 'Short' },
  { type: 'antonym', word: 'ANCIENT', options: ['Old', 'Modern', 'Historic', 'Aged'], answer: 'Modern' },
  { type: 'sentence', question: 'She _____ to the party yesterday.', options: ['go', 'goes', 'went', 'going'], answer: 'went' },
  { type: 'synonym', word: 'CLEVER', options: ['Dull', 'Smart', 'Stupid', 'Slow'], answer: 'Smart' },
  { type: 'antonym', word: 'DIFFICULT', options: ['Hard', 'Easy', 'Complex', 'Tough'], answer: 'Easy' },
  { type: 'sentence', question: 'The book _____ on the table.', options: ['is', 'are', 'was', 'were'], answer: 'is' },
  { type: 'synonym', word: 'HAPPY', options: ['Sad', 'Joyful', 'Angry', 'Upset'], answer: 'Joyful' },
  { type: 'antonym', word: 'EXPAND', options: ['Grow', 'Increase', 'Contract', 'Enlarge'], answer: 'Contract' },
  { type: 'sentence', question: 'They _____ playing cricket now.', options: ['is', 'are', 'was', 'were'], answer: 'are' },
  { type: 'synonym', word: 'RAPID', options: ['Slow', 'Fast', 'Steady', 'Gradual'], answer: 'Fast' },
  { type: 'antonym', word: 'GENEROUS', options: ['Kind', 'Giving', 'Selfish', 'Charitable'], answer: 'Selfish' },
  { type: 'sentence', question: 'She has _____ her homework.', options: ['complete', 'completed', 'completing', 'completes'], answer: 'completed' },
  { type: 'synonym', word: 'VITAL', options: ['Unimportant', 'Essential', 'Minor', 'Trivial'], answer: 'Essential' },
  { type: 'antonym', word: 'INNOCENT', options: ['Pure', 'Guilty', 'Blameless', 'Virtuous'], answer: 'Guilty' },
  { type: 'sentence', question: 'He _____ a doctor.', options: ['is', 'are', 'am', 'be'], answer: 'is' },
  { type: 'synonym', word: 'WEALTHY', options: ['Poor', 'Rich', 'Needy', 'Broke'], answer: 'Rich' },
  { type: 'antonym', word: 'VICTORY', options: ['Win', 'Success', 'Defeat', 'Triumph'], answer: 'Defeat' }
];

const VerbalAbilityGame = ({ difficulty = 'Easy', onComplete, onQuestionChange }) => {
  const totalQuestions = 20;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setQuestion(generateQuestion());
    if (onQuestionChange) onQuestionChange(currentQuestion + 1, totalQuestions);
  }, [currentQuestion]);

  const handleSubmit = () => {
    const isCorrect = selected === question.answer;
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback('✓ Correct!');
    } else {
      setFeedback(`✗ Wrong! Correct: ${question.answer}`);
    }

    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelected(null);
        setFeedback('');
      } else {
        setGameOver(true);
        if (onComplete) onComplete(score);
      }
    }, 1500);
  };

  if (gameOver) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Game Complete!</Typography>
        <Typography variant="h5" sx={{ mb: 3 }}>Score: {score}/{totalQuestions}</Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>Accuracy: {((score / totalQuestions) * 100).toFixed(1)}%</Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>Play Again</Button>
      </Box>
    );
  }

  if (!question) return null;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
          {question.type === 'synonym' && `Find the SYNONYM of: ${question.word}`}
          {question.type === 'antonym' && `Find the ANTONYM of: ${question.word}`}
          {question.type === 'sentence' && 'Fill in the blank:'}
          {question.type === 'spelling' && question.question}
          {question.type === 'idiom' && question.question}
          {question.type === 'oneword' && question.question}
          {question.type === 'reading' && 'Read and answer:'}
        </Typography>
        
        {question.type === 'sentence' && (
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>{question.question}</Typography>
        )}
        
        {question.type === 'reading' && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>{question.passage}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{question.question}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          {question.options.map((option) => (
            <Box
              key={option}
              onClick={() => !feedback && setSelected(option)}
              sx={{
                p: 2,
                border: '3px solid',
                borderColor: selected === option ? 'primary.main' : 'grey.400',
                borderRadius: 2,
                bgcolor: selected === option ? 'primary.light' : 'background.paper',
                cursor: feedback ? 'default' : 'pointer',
                transition: 'all 0.2s',
                '&:hover': feedback ? {} : { borderColor: 'primary.main', transform: 'scale(1.02)' }
              }}
            >
              <Typography variant="h6">{option}</Typography>
            </Box>
          ))}
        </Box>

        {feedback && (
          <Typography variant="h6" sx={{ mb: 2, color: feedback.includes('✓') ? 'success.main' : 'error.main', fontWeight: 600 }}>
            {feedback}
          </Typography>
        )}
        
        {!feedback && (
          <Button variant="contained" onClick={handleSubmit} disabled={!selected} sx={{ px: 4, py: 1.5 }}>
            Submit
          </Button>
        )}
      </Card>
    </Box>
  );
};

export default VerbalAbilityGame;
