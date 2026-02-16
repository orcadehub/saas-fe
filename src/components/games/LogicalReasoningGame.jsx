import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, LinearProgress } from '@mui/material';

const entities = ['cats', 'dogs', 'birds', 'fish', 'roses', 'flowers', 'books', 'pens', 'doctors', 'engineers', 'students', 'teachers', 'cars', 'vehicles', 'mangoes', 'fruits', 'lions', 'tigers', 'elephants', 'zebras'];
const properties = ['animals', 'living beings', 'red', 'aquatic', 'graduates', 'intelligent', 'sweet', 'fit', 'round', 'pets', 'wheels', 'liquid', 'polygons', 'rectangles', 'carnivores', 'herbivores', 'mammals', 'wild'];

const generateSyllogism = () => {
  const templates = [
    { p1: 'All {A} are {B}', p2: 'All {B} are {C}', conc: 'All {A} are {C}', ans: 'True' },
    { p1: 'Some {A} are {B}', p2: 'All {B} are {C}', conc: 'Some {A} are {C}', ans: 'True' },
    { p1: 'No {A} is {B}', p2: 'All {B} are {C}', conc: 'No {A} is {C}', ans: 'False' },
    { p1: 'All {A} are {B}', p2: 'Some {B} are {C}', conc: 'All {A} are {C}', ans: 'Cannot say' },
    { p1: 'All {A} are {B}', p2: 'No {B} is {C}', conc: 'No {A} is {C}', ans: 'True' },
    { p1: 'Some {A} are {B}', p2: 'No {B} is {C}', conc: 'Some {A} are not {C}', ans: 'True' }
  ];
  
  const template = templates[Math.floor(Math.random() * templates.length)];
  const a = entities[Math.floor(Math.random() * entities.length)];
  const b = properties[Math.floor(Math.random() * properties.length)];
  const c = properties.filter(p => p !== b)[Math.floor(Math.random() * (properties.length - 1))];
  
  const p1 = template.p1.replace('{A}', a).replace('{B}', b).replace('{C}', c);
  const p2 = template.p2.replace('{A}', a).replace('{B}', b).replace('{C}', c);
  const conc = template.conc.replace('{A}', a).replace('{B}', b).replace('{C}', c);
  
  return {
    question: `${p1}. ${p2}. Conclusion: ${conc}.`,
    options: ['True', 'False', 'Cannot say', 'Partially true'],
    answer: template.ans
  };
};

const generateComparison = () => {
  const vars = ['A', 'B', 'C', 'P', 'Q', 'R', 'X', 'Y', 'Z', 'M', 'N', 'O'];
  const ops = ['>', '<', '='];
  
  const v1 = vars[Math.floor(Math.random() * vars.length)];
  const v2 = vars.filter(v => v !== v1)[Math.floor(Math.random() * (vars.length - 1))];
  const v3 = vars.filter(v => v !== v1 && v !== v2)[Math.floor(Math.random() * (vars.length - 2))];
  
  const op1 = ops[Math.floor(Math.random() * ops.length)];
  const op2 = ops[Math.floor(Math.random() * ops.length)];
  
  let answer;
  if (op1 === '>' && op2 === '>') answer = `${v1} > ${v3}`;
  else if (op1 === '<' && op2 === '<') answer = `${v1} < ${v3}`;
  else if (op1 === '=' && op2 === '=') answer = `${v1} = ${v3}`;
  else if (op1 === '=' && op2 === '>') answer = `${v1} > ${v3}`;
  else if (op1 === '=' && op2 === '<') answer = `${v1} < ${v3}`;
  else answer = 'Cannot determine';
  
  const options = [`${v1} > ${v3}`, `${v1} < ${v3}`, `${v1} = ${v3}`, 'Cannot determine'].filter((v, i, a) => a.indexOf(v) === i);
  
  return {
    question: `If ${v1} ${op1} ${v2} and ${v2} ${op2} ${v3}, then:`,
    options,
    answer
  };
};

const generateBloodRelation = () => {
  const names = ['A', 'B', 'C', 'P', 'Q', 'R', 'X', 'Y', 'Z'];
  const n1 = names[Math.floor(Math.random() * names.length)];
  const n2 = names.filter(n => n !== n1)[Math.floor(Math.random() * (names.length - 1))];
  const n3 = names.filter(n => n !== n1 && n !== n2)[Math.floor(Math.random() * (names.length - 2))];
  
  const relations = [
    { r1: 'father', r2: 'mother', ans: 'Grandfather', opts: ['Grandfather', 'Grandmother', 'Uncle', 'Father'] },
    { r1: 'brother', r2: 'sister', ans: 'Brother', opts: ['Brother', 'Sister', 'Cousin', 'Uncle'] },
    { r1: 'mother', r2: 'daughter', ans: 'Mother', opts: ['Mother', 'Daughter', 'Sister', 'Aunt'] },
    { r1: 'son', r2: 'wife', ans: 'Son', opts: ['Son', 'Daughter', 'Brother', 'Nephew'] },
    { r1: 'sister', r2: 'brother', ans: 'Sister', opts: ['Sister', 'Brother', 'Cousin', 'Aunt'] }
  ];
  
  const rel = relations[Math.floor(Math.random() * relations.length)];
  return {
    question: `${n1} is ${n2}'s ${rel.r1}. ${n2} is ${n3}'s ${rel.r2}. How is ${n1} related to ${n3}?`,
    options: rel.opts.sort(() => Math.random() - 0.5),
    answer: rel.ans
  };
};

const generateDirection = () => {
  const directions = ['North', 'South', 'East', 'West'];
  const dist1 = Math.floor(Math.random() * 8) + 2;
  const dist2 = Math.floor(Math.random() * 8) + 2;
  const dir1 = directions[Math.floor(Math.random() * directions.length)];
  const dir2 = directions.filter(d => d !== dir1 && d !== (dir1 === 'North' ? 'South' : dir1 === 'South' ? 'North' : dir1 === 'East' ? 'West' : 'East'))[Math.floor(Math.random() * 2)];
  
  const finalDir = `${dir1.includes('North') || dir2.includes('North') ? 'North' : 'South'}-${dir1.includes('East') || dir2.includes('East') ? 'East' : 'West'}`;
  const options = ['North-East', 'South-West', 'North-West', 'South-East'].filter(d => d !== finalDir);
  options.push(finalDir);
  
  return {
    question: `A person walks ${dist1}m ${dir1}, then ${dist2}m ${dir2}. In which direction from starting point?`,
    options: options.sort(() => Math.random() - 0.5),
    answer: finalDir
  };
};

const generateCoding = () => {
  const type = Math.random();
  if (type < 0.5) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const word1 = letters[Math.floor(Math.random() * 10)] + letters[Math.floor(Math.random() * 10)] + letters[Math.floor(Math.random() * 10)];
    const code1 = word1.split('').map(c => letters.indexOf(c) + 1).join('');
    const word2 = letters[Math.floor(Math.random() * 10)] + letters[Math.floor(Math.random() * 10)] + letters[Math.floor(Math.random() * 10)];
    const answer = word2.split('').map(c => letters.indexOf(c) + 1).join('');
    const options = [answer, (parseInt(answer) + 111).toString(), (parseInt(answer) - 111).toString(), (parseInt(answer) + 100).toString()];
    return { question: `If ${word1} = ${code1}, then ${word2} = ?`, options: options.sort(() => Math.random() - 0.5), answer };
  } else {
    const num1 = Math.floor(Math.random() * 5) + 1;
    const num2 = Math.floor(Math.random() * 5) + 1;
    const num3 = Math.floor(Math.random() * 5) + 1;
    const answer = (num1 + num2 + num3).toString();
    const options = [answer, (parseInt(answer) + 1).toString(), (parseInt(answer) - 1).toString(), (parseInt(answer) + 2).toString()];
    return { question: `If A=${num1}, B=${num2}, C=${num3}, then ABC = ?`, options: options.sort(() => Math.random() - 0.5), answer };
  }
};

const generateSeating = () => {
  const seating = [
    ['5 people sit in a row. A is left of B. B is left of C.', 'A is leftmost', ['A is leftmost', 'C is leftmost', 'B is leftmost', 'Cannot say']],
    ['4 people sit around a table. P is opposite to Q. R is right of P.', 'R is left of Q', ['R is left of Q', 'R is right of Q', 'R is opposite Q', 'Cannot say']]
  ];
  const [question, answer, options] = seating[Math.floor(Math.random() * seating.length)];
  return { question: `${question} Which is true?`, options: options.sort(() => Math.random() - 0.5), answer };
};

const generateRanking = () => {
  const total = Math.floor(Math.random() * 30) + 20;
  const fromTop = Math.floor(Math.random() * (total - 5)) + 5;
  const answer = (total - fromTop + 1).toString() + 'th';
  const options = [answer, (total - fromTop).toString() + 'th', (total - fromTop + 2).toString() + 'th', (total - fromTop - 1).toString() + 'th'];
  return {
    question: `In a class of ${total}, Ram ranks ${fromTop}th from top. What is rank from bottom?`,
    options: options.sort(() => Math.random() - 0.5),
    answer
  };
};

const generateCalendar = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const date1 = Math.floor(Math.random() * 20) + 1;
  const day1 = days[Math.floor(Math.random() * days.length)];
  const date2 = date1 + 7;
  const answer = day1;
  return {
    question: `If ${date1}th is ${day1}, what day is ${date2}th?`,
    options: days.sort(() => Math.random() - 0.5).slice(0, 4),
    answer
  };
};

const generateClock = () => {
  const hours = [3, 6, 9, 12];
  const minutes = [0, 15, 30, 45];
  const h = hours[Math.floor(Math.random() * hours.length)];
  const m = minutes[Math.floor(Math.random() * minutes.length)];
  const angle = Math.abs(30 * h - 6 * m);
  const answer = angle > 180 ? (360 - angle) + '°' : angle + '°';
  const options = [answer, (angle + 15) + '°', (angle - 15) + '°', (angle + 30) + '°'].filter(o => parseFloat(o) >= 0);
  return {
    question: `At ${h}:${m.toString().padStart(2, '0')}, angle between hour and minute hands?`,
    options: options.sort(() => Math.random() - 0.5).slice(0, 4),
    answer
  };
};

const generateVennDiagram = () => {
  const venns = [
    ['Which diagram represents: All A are B, Some B are C?', 'Overlapping circles', ['Overlapping circles', 'Separate circles', 'Concentric circles', 'Intersecting lines']],
    ['Which represents: No A is B, All B are C?', 'Separate circles', ['Separate circles', 'Overlapping circles', 'Concentric circles', 'Intersecting lines']]
  ];
  const [question, answer, options] = venns[Math.floor(Math.random() * venns.length)];
  return { question, options: options.sort(() => Math.random() - 0.5), answer };
};

const generateAnalogy = () => {
  const pairs = [
    ['Book', 'Pages', 'Tree', 'Leaves', ['Leaves', 'Branches', 'Roots', 'Trunk']],
    ['Doctor', 'Hospital', 'Teacher', 'School', ['School', 'College', 'University', 'Library']],
    ['Car', 'Road', 'Ship', 'Sea', ['Sea', 'Ocean', 'River', 'Water']],
    ['Pen', 'Write', 'Knife', 'Cut', ['Cut', 'Sharp', 'Steel', 'Kitchen']],
    ['Fish', 'Water', 'Bird', 'Sky', ['Sky', 'Air', 'Nest', 'Tree']],
    ['Hand', 'Glove', 'Foot', 'Shoe', ['Shoe', 'Sock', 'Boot', 'Sandal']]
  ];
  const [a, b, c, ans, opts] = pairs[Math.floor(Math.random() * pairs.length)];
  return { question: `${a} : ${b} :: ${c} : ?`, options: opts.sort(() => Math.random() - 0.5), answer: ans };
};

const generateOddOneOut = () => {
  const type = Math.random();
  if (type < 0.5) {
    const even = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    const nums = [];
    for (let i = 0; i < 4; i++) nums.push(even[Math.floor(Math.random() * even.length)]);
    const odd = Math.floor(Math.random() * 10) * 2 + 1;
    nums[Math.floor(Math.random() * 4)] = odd;
    return { question: `Find odd one: ${nums.join(', ')}`, options: nums.map(String).sort(() => Math.random() - 0.5), answer: odd.toString() };
  } else {
    const categories = [
      [['Apple', 'Mango', 'Banana', 'Grapes'], 'Potato'],
      [['Dog', 'Cat', 'Lion', 'Tiger'], 'Table'],
      [['Red', 'Blue', 'Green', 'Yellow'], 'Circle'],
      [['Chair', 'Table', 'Desk', 'Bed'], 'Apple']
    ];
    const [items, odd] = categories[Math.floor(Math.random() * categories.length)];
    const all = [...items.slice(0, 3), odd];
    return { question: `Find odd one: ${all.join(', ')}`, options: all.sort(() => Math.random() - 0.5), answer: odd };
  }
};

const generateMissingNumber = () => {
  const patterns = [
    { type: 'multiply', factor: 2 },
    { type: 'add', diff: 5 },
    { type: 'square', start: 1 },
    { type: 'multiply', factor: 3 }
  ];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const start = Math.floor(Math.random() * 5) + 1;
  let series = [start];
  
  if (pattern.type === 'multiply') {
    for (let i = 0; i < 3; i++) series.push(series[i] * pattern.factor);
    const answer = series[3] * pattern.factor;
    const options = [answer, answer + pattern.factor, answer - pattern.factor, answer + pattern.factor * 2];
    return { question: `Find missing: ${series.join(', ')}, ?`, options: options.map(String).sort(() => Math.random() - 0.5), answer: answer.toString() };
  } else if (pattern.type === 'add') {
    for (let i = 0; i < 3; i++) series.push(series[i] + pattern.diff);
    const answer = series[3] + pattern.diff;
    const options = [answer, answer + pattern.diff, answer - pattern.diff, answer + 2];
    return { question: `Find missing: ${series.join(', ')}, ?`, options: options.map(String).sort(() => Math.random() - 0.5), answer: answer.toString() };
  } else {
    series = [1, 4, 9, 16];
    const answer = 25;
    const options = [25, 20, 24, 30];
    return { question: `Find missing: ${series.join(', ')}, ?`, options: options.map(String).sort(() => Math.random() - 0.5), answer: answer.toString() };
  }
};

const generateQuestion = () => {
  const types = [
    generateSyllogism, generateComparison, generateBloodRelation, generateDirection, 
    generateCoding, generateSeating, generateRanking, generateCalendar, generateClock,
    generateVennDiagram, generateAnalogy, generateOddOneOut, generateMissingNumber
  ];
  return types[Math.floor(Math.random() * types.length)]();
};

const reasoningQuestions = [
  { question: 'All cats are animals. All animals are living beings. Conclusion: All cats are living beings.', options: ['True', 'False', 'Cannot say', 'Partially true'], answer: 'True' },
  { question: 'Some books are pens. All pens are pencils. Conclusion: Some books are pencils.', options: ['True', 'False', 'Cannot say', 'Partially true'], answer: 'True' },
  { question: 'If A > B and B > C, then:', options: ['A > C', 'A < C', 'A = C', 'Cannot determine'], answer: 'A > C' },
  { question: 'All roses are flowers. Some flowers are red. Conclusion: Some roses are red.', options: ['True', 'False', 'Cannot say', 'Partially true'], answer: 'Cannot say' },
  { question: 'No bird is a fish. All fish are aquatic. Conclusion: No bird is aquatic.', options: ['True', 'False', 'Cannot say', 'Partially true'], answer: 'False' },
  { question: 'If P = Q and Q = R, then:', options: ['P = R', 'P > R', 'P < R', 'Cannot determine'], answer: 'P = R' },
  { question: 'Some doctors are engineers. All engineers are graduates. Conclusion: Some doctors are graduates.', options: ['True', 'False', 'Cannot say', 'Partially true'], answer: 'True' },
  { question: 'All squares are rectangles. All rectangles are polygons. Conclusion: All squares are polygons.', options: ['True', 'False', 'Cannot say', 'Partially true'], answer: 'True' },
  { question: 'If X < Y and Y < Z, then:', options: ['X < Z', 'X > Z', 'X = Z', 'Cannot determine'], answer: 'X < Z' },
  { question: 'No teacher is a student. Some students are intelligent. Conclusion: No teacher is intelligent.', options: ['True', 'False', 'Cannot say', 'Partially true'], answer: 'False' },
  { question: 'All mangoes are fruits. Some fruits are sweet. Conclusion: All mangoes are sweet.', options: ['True', 'False', 'Cannot say', 'Partially true'], answer: 'Cannot say' },
  { question: 'If M = N and N > O, then:', options: ['M > O', 'M < O', 'M = O', 'Cannot determine'], answer: 'M > O' },
  { question: 'Some players are athletes. All athletes are fit. Conclusion: Some players are fit.', options: ['True', 'False', 'Cannot say', 'Partially true'], answer: 'True' },
  { question: 'All circles are round. No square is round. Conclusion: No circle is a square.', options: ['True', 'False', 'Cannot say', 'Partially true'], answer: 'True' },
  { question: 'If A = B and B < C, then:', options: ['A < C', 'A > C', 'A = C', 'Cannot determine'], answer: 'A < C' },
  { question: 'Some cars are vehicles. All vehicles have wheels. Conclusion: Some cars have wheels.', options: ['True', 'False', 'Cannot say', 'Partially true'], answer: 'True' },
  { question: 'All dogs are mammals. Some mammals are pets. Conclusion: All dogs are pets.', options: ['True', 'False', 'Cannot say', 'Partially true'], answer: 'Cannot say' },
  { question: 'If P > Q and Q = R, then:', options: ['P > R', 'P < R', 'P = R', 'Cannot determine'], answer: 'P > R' },
  { question: 'No metal is liquid. Mercury is a metal. Conclusion: Mercury is not liquid.', options: ['True', 'False', 'Cannot say', 'Partially true'], answer: 'False' },
  { question: 'All birds can fly. Penguin is a bird. Conclusion: Penguin can fly.', options: ['True', 'False', 'Cannot say', 'Partially true'], answer: 'False' }
];

const LogicalReasoningGame = ({ difficulty = 'Easy', onComplete, onQuestionChange }) => {
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
      <Card sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 4, lineHeight: 1.8 }}>{question.question}</Typography>

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
          <Typography variant="h6" sx={{ mb: 2, color: feedback.includes('✓') ? 'success.main' : 'error.main', fontWeight: 600, textAlign: 'center' }}>
            {feedback}
          </Typography>
        )}
        
        {!feedback && (
          <Box sx={{ textAlign: 'center' }}>
            <Button variant="contained" onClick={handleSubmit} disabled={!selected} sx={{ px: 4, py: 1.5 }}>
              Submit
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default LogicalReasoningGame;
