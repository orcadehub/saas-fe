export const puzzleGameQuestions = [
  {
    _id: 'puzzle-easy',
    title: 'Sliding Puzzle - Easy (3x3)',
    description: 'Solve 8-puzzle sliding games',
    difficulty: 'Easy',
    points: 40,
    gameType: 'MCQ',
    isMultiLevel: true,
    totalLevels: 20,
    hasTimer: true,
    totalTimeLimit: 2400,
    maxScore: 40,
    passingScore: 24,
    speedBonus: { enabled: true, maxBonus: 20, timeThreshold: 1200 },
    streakBonus: { enabled: true, bonusPerStreak: 5 },
    tags: ['puzzle', 'sliding', 'logic'],
    isActive: true,
    levels: Array.from({ length: 20 }, (_, i) => ({
      levelNumber: i + 1,
      question: `Arrange the tiles in order by sliding them into the empty space (Level ${i + 1})`,
      questionType: 'SlidingPuzzle',
      correctAnswer: JSON.stringify({ rows: 3, cols: 3 }),
      pointsForLevel: 2,
      timeLimit: 120,
      hints: [{ hintNumber: 1, hintText: 'Solve row by row from top to bottom', pointsDeduction: 1 }],
      shuffleOptions: false
    }))
  },
  {
    _id: 'puzzle-medium',
    title: 'Sliding Puzzle - Medium (4x4)',
    description: 'Solve 15-puzzle sliding games',
    difficulty: 'Medium',
    points: 40,
    gameType: 'MCQ',
    isMultiLevel: true,
    totalLevels: 20,
    hasTimer: true,
    totalTimeLimit: 3600,
    maxScore: 40,
    passingScore: 24,
    speedBonus: { enabled: true, maxBonus: 20, timeThreshold: 1800 },
    streakBonus: { enabled: true, bonusPerStreak: 5 },
    tags: ['puzzle', 'sliding', 'logic'],
    isActive: true,
    levels: Array.from({ length: 20 }, (_, i) => ({
      levelNumber: i + 1,
      question: `Arrange the tiles in order by sliding them into the empty space (Level ${i + 1})`,
      questionType: 'SlidingPuzzle',
      correctAnswer: JSON.stringify({ rows: 4, cols: 4 }),
      pointsForLevel: 2,
      timeLimit: 180,
      hints: [{ hintNumber: 1, hintText: 'Focus on positioning corner tiles first', pointsDeduction: 1 }],
      shuffleOptions: false
    }))
  },
  {
    _id: 'puzzle-hard',
    title: 'Sliding Puzzle - Hard (5x5)',
    description: 'Solve 24-puzzle sliding games',
    difficulty: 'Hard',
    points: 40,
    gameType: 'MCQ',
    isMultiLevel: true,
    totalLevels: 20,
    hasTimer: true,
    totalTimeLimit: 4800,
    maxScore: 40,
    passingScore: 24,
    speedBonus: { enabled: true, maxBonus: 20, timeThreshold: 2400 },
    streakBonus: { enabled: true, bonusPerStreak: 5 },
    tags: ['puzzle', 'sliding', 'logic'],
    isActive: true,
    levels: Array.from({ length: 20 }, (_, i) => ({
      levelNumber: i + 1,
      question: `Arrange the tiles in order by sliding them into the empty space (Level ${i + 1})`,
      questionType: 'SlidingPuzzle',
      correctAnswer: JSON.stringify({ rows: 5, cols: 5 }),
      pointsForLevel: 2,
      timeLimit: 240,
      hints: [{ hintNumber: 1, hintText: 'Work systematically from top-left to bottom-right', pointsDeduction: 1 }],
      shuffleOptions: false
    }))
  }
];

export const getPuzzleGameQuestions = (subtopicId) => {
  return puzzleGameQuestions.map(q => ({ ...q, subtopicId }));
};
