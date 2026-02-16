export const memoryGameQuestions = [
  {
    _id: 'memory-easy',
    title: 'Memory Match - Easy (4x4)',
    description: 'Match pairs of cards in a 4x4 grid',
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
    tags: ['memory', 'matching', 'cards'],
    isActive: true,
    levels: Array.from({ length: 20 }, (_, i) => ({
      levelNumber: i + 1,
      question: `Match all pairs of cards (Level ${i + 1})`,
      questionType: 'MemoryCard',
      correctAnswer: JSON.stringify({ rows: 4, cols: 4 }),
      pointsForLevel: 2,
      timeLimit: 60,
      hints: [{ hintNumber: 1, hintText: 'Focus on remembering card positions', pointsDeduction: 1 }],
      shuffleOptions: false
    }))
  },
  {
    _id: 'memory-medium',
    title: 'Memory Match - Medium (4x6)',
    description: 'Match pairs of cards in a 4x6 grid',
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
    tags: ['memory', 'matching', 'cards'],
    isActive: true,
    levels: Array.from({ length: 20 }, (_, i) => ({
      levelNumber: i + 1,
      question: `Match all pairs of cards (Level ${i + 1})`,
      questionType: 'MemoryCard',
      correctAnswer: JSON.stringify({ rows: 4, cols: 6 }),
      pointsForLevel: 3,
      timeLimit: 80,
      hints: [{ hintNumber: 1, hintText: 'Take your time to memorize positions', pointsDeduction: 1 }],
      shuffleOptions: false
    }))
  },
  {
    _id: 'memory-hard',
    title: 'Memory Match - Hard (6x6)',
    description: 'Match pairs of cards in a 6x6 grid',
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
    tags: ['memory', 'matching', 'cards'],
    isActive: true,
    levels: Array.from({ length: 20 }, (_, i) => ({
      levelNumber: i + 1,
      question: `Match all pairs of cards (Level ${i + 1})`,
      questionType: 'MemoryCard',
      correctAnswer: JSON.stringify({ rows: 6, cols: 6 }),
      pointsForLevel: 4,
      timeLimit: 100,
      hints: [{ hintNumber: 1, hintText: 'Use memory techniques to remember patterns', pointsDeduction: 1 }],
      shuffleOptions: false
    }))
  }
];

export const getMemoryGameQuestions = (subtopicId) => {
  return memoryGameQuestions.map(q => ({ ...q, subtopicId }));
};
