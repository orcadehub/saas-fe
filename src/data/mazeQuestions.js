const generateMaze = (rows, cols, seed) => {
  const grid = Array(rows).fill(null).map(() => Array(cols).fill(1));
  let rng = seed;
  const random = () => (rng = (rng * 9301 + 49297) % 233280) / 233280;
  
  const startRow = Math.floor(random() * rows);
  const endRow = Math.floor(random() * rows);
  
  let row = startRow;
  let col = 0;
  
  const turn1Col = Math.floor(random() * (cols - 2)) + 1;
  for (let c = 0; c <= turn1Col; c++) {
    grid[row][c] = 0;
  }
  
  const turn2Row = row < endRow 
    ? Math.min(endRow, row + Math.floor(random() * (endRow - row + 1))) 
    : Math.max(endRow, row - Math.floor(random() * (row - endRow + 1)));
  
  const step = row < turn2Row ? 1 : -1;
  for (let r = row; r !== turn2Row; r += step) {
    grid[r][turn1Col] = 0;
  }
  row = turn2Row;
  grid[row][turn1Col] = 0;
  
  for (let c = turn1Col; c < cols; c++) {
    grid[row][c] = 0;
  }
  
  const numBranches = Math.floor(rows * cols * 0.3);
  for (let i = 0; i < numBranches; i++) {
    const r = Math.floor(random() * rows);
    const c = Math.floor(random() * cols);
    const branchLength = 2 + Math.floor(random() * 4);
    
    let br = r, bc = c;
    for (let j = 0; j < branchLength; j++) {
      if (br >= 0 && br < rows && bc >= 0 && bc < cols) {
        grid[br][bc] = 0;
        const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        const dir = dirs[Math.floor(random() * 4)];
        br += dir[0];
        bc += dir[1];
      }
    }
  }
  
  return { grid, start: [startRow, 0], end: [endRow, cols - 1] };
};

export const mazeQuestions = [
  {
    _id: 'maze-5x5',
    title: 'Maze Challenge - Easy (5x5)',
    description: 'Navigate through 5x5 mazes from start to end',
    difficulty: 'Easy',
    points: 40,
    gameType: 'MCQ',
    isMultiLevel: true,
    totalLevels: 20,
    hasTimer: true,
    totalTimeLimit: 1200,
    maxScore: 40,
    passingScore: 24,
    speedBonus: { enabled: true, maxBonus: 20, timeThreshold: 300 },
    streakBonus: { enabled: true, bonusPerStreak: 5 },
    tags: ['maze', 'navigation', 'puzzle'],
    isActive: true,
    levels: Array.from({ length: 20 }, (_, i) => ({
      levelNumber: i + 1,
      question: `Navigate through the 5x5 maze from start to end (Level ${i + 1})`,
      questionType: 'Interactive',
      correctAnswer: JSON.stringify({ type: 'maze', rows: 5, cols: 5 }),
      pointsForLevel: 2,
      timeLimit: 60,
      hints: [{ hintNumber: 1, hintText: 'Follow the open paths to reach the goal', pointsDeduction: 1 }],
      shuffleOptions: false
    }))
  },
  {
    _id: 'maze-4x8',
    title: 'Maze Challenge - Medium (4x8)',
    description: 'Navigate through 4x8 mazes from start to end',
    difficulty: 'Medium',
    points: 60,
    gameType: 'MCQ',
    isMultiLevel: true,
    totalLevels: 20,
    hasTimer: true,
    totalTimeLimit: 1600,
    maxScore: 60,
    passingScore: 36,
    speedBonus: { enabled: true, maxBonus: 30, timeThreshold: 400 },
    streakBonus: { enabled: true, bonusPerStreak: 5 },
    tags: ['maze', 'navigation', 'puzzle'],
    isActive: true,
    levels: Array.from({ length: 20 }, (_, i) => ({
      levelNumber: i + 1,
      question: `Navigate through the 4x8 maze from start to end (Level ${i + 1})`,
      questionType: 'Interactive',
      correctAnswer: JSON.stringify({ type: 'maze', rows: 4, cols: 8 }),
      pointsForLevel: 3,
      timeLimit: 80,
      hints: [{ hintNumber: 1, hintText: 'Plan your route carefully', pointsDeduction: 1 }],
      shuffleOptions: false
    }))
  },
  {
    _id: 'maze-5x10',
    title: 'Maze Challenge - Hard (5x10)',
    description: 'Navigate through 5x10 mazes from start to end',
    difficulty: 'Hard',
    points: 80,
    gameType: 'MCQ',
    isMultiLevel: true,
    totalLevels: 20,
    hasTimer: true,
    totalTimeLimit: 2000,
    maxScore: 80,
    passingScore: 48,
    speedBonus: { enabled: true, maxBonus: 40, timeThreshold: 500 },
    streakBonus: { enabled: true, bonusPerStreak: 5 },
    tags: ['maze', 'navigation', 'puzzle'],
    isActive: true,
    levels: Array.from({ length: 20 }, (_, i) => ({
      levelNumber: i + 1,
      question: `Navigate through the 5x10 maze from start to end (Level ${i + 1})`,
      questionType: 'Interactive',
      correctAnswer: JSON.stringify({ type: 'maze', rows: 5, cols: 10 }),
      pointsForLevel: 4,
      timeLimit: 100,
      hints: [{ hintNumber: 1, hintText: 'Look for the longest clear path', pointsDeduction: 1 }],
      shuffleOptions: false
    }))
  }
];

export const getMazeQuestions = (subtopicId) => {
  return mazeQuestions.map(q => ({ ...q, subtopicId }));
};
