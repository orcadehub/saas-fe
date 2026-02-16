export const getAccentureGames = (subtopicId) => {
  const games = {
    'subtopic-accenture-geosudo': [
      { _id: 'geosudo-easy', title: 'Geo-Sudo - Easy', points: 40, totalTimeLimit: 600, difficulty: 'Easy', gameType: 'GeoSudo', isMultiLevel: true, totalLevels: 20, levels: Array.from({ length: 20 }, (_, i) => ({ levelNumber: i + 1, questionType: 'GeoSudo', difficulty: 'Easy', pointsForLevel: 2, timeLimit: 30 })) },
      { _id: 'geosudo-medium', title: 'Geo-Sudo - Medium', points: 40, totalTimeLimit: 900, difficulty: 'Medium', gameType: 'GeoSudo', isMultiLevel: true, totalLevels: 20, levels: Array.from({ length: 20 }, (_, i) => ({ levelNumber: i + 1, questionType: 'GeoSudo', difficulty: 'Medium', pointsForLevel: 2, timeLimit: 45 })) },
      { _id: 'geosudo-hard', title: 'Geo-Sudo - Hard', points: 40, totalTimeLimit: 1200, difficulty: 'Hard', gameType: 'GeoSudo', isMultiLevel: true, totalLevels: 20, levels: Array.from({ length: 20 }, (_, i) => ({ levelNumber: i + 1, questionType: 'GeoSudo', difficulty: 'Hard', pointsForLevel: 2, timeLimit: 60 })) }
    ],
    'subtopic-accenture-inductive': [
      { _id: 'inductive-easy', title: 'Inductive Logic - Easy', points: 40, totalTimeLimit: 600, difficulty: 'Easy', gameType: 'InductiveLogic', isMultiLevel: true, totalLevels: 20, levels: Array.from({ length: 20 }, (_, i) => ({ levelNumber: i + 1, questionType: 'InductiveLogic', difficulty: 'Easy', pointsForLevel: 2, timeLimit: 30 })) },
      { _id: 'inductive-medium', title: 'Inductive Logic - Medium', points: 40, totalTimeLimit: 900, difficulty: 'Medium', gameType: 'InductiveLogic', isMultiLevel: true, totalLevels: 20, levels: Array.from({ length: 20 }, (_, i) => ({ levelNumber: i + 1, questionType: 'InductiveLogic', difficulty: 'Medium', pointsForLevel: 2, timeLimit: 45 })) },
      { _id: 'inductive-hard', title: 'Inductive Logic - Hard', points: 40, totalTimeLimit: 1200, difficulty: 'Hard', gameType: 'InductiveLogic', isMultiLevel: true, totalLevels: 20, levels: Array.from({ length: 20 }, (_, i) => ({ levelNumber: i + 1, questionType: 'InductiveLogic', difficulty: 'Hard', pointsForLevel: 2, timeLimit: 60 })) }
    ],
    'subtopic-accenture-grid': [
      { _id: 'grid-easy', title: 'Grid Challenge - Easy', points: 40, totalTimeLimit: 600, difficulty: 'Easy', gameType: 'GridChallenge', isMultiLevel: true, totalLevels: 20, levels: Array.from({ length: 20 }, (_, i) => ({ levelNumber: i + 1, questionType: 'GridChallenge', difficulty: 'Easy', pointsForLevel: 2, timeLimit: 30 })) },
      { _id: 'grid-medium', title: 'Grid Challenge - Medium', points: 40, totalTimeLimit: 900, difficulty: 'Medium', gameType: 'GridChallenge', isMultiLevel: true, totalLevels: 20, levels: Array.from({ length: 20 }, (_, i) => ({ levelNumber: i + 1, questionType: 'GridChallenge', difficulty: 'Medium', pointsForLevel: 2, timeLimit: 45 })) },
      { _id: 'grid-hard', title: 'Grid Challenge - Hard', points: 40, totalTimeLimit: 1200, difficulty: 'Hard', gameType: 'GridChallenge', isMultiLevel: true, totalLevels: 20, levels: Array.from({ length: 20 }, (_, i) => ({ levelNumber: i + 1, questionType: 'GridChallenge', difficulty: 'Hard', pointsForLevel: 2, timeLimit: 60 })) }
    ],
    'subtopic-accenture-motion': [
      { _id: 'motion-easy', title: 'Motion Challenge - Easy', points: 40, totalTimeLimit: 600, difficulty: 'Easy', gameType: 'MotionChallenge', isMultiLevel: true, totalLevels: 20, levels: Array.from({ length: 20 }, (_, i) => ({ levelNumber: i + 1, questionType: 'MotionChallenge', difficulty: 'Easy', pointsForLevel: 2, timeLimit: 30 })) },
      { _id: 'motion-medium', title: 'Motion Challenge - Medium', points: 40, totalTimeLimit: 900, difficulty: 'Medium', gameType: 'MotionChallenge', isMultiLevel: true, totalLevels: 20, levels: Array.from({ length: 20 }, (_, i) => ({ levelNumber: i + 1, questionType: 'MotionChallenge', difficulty: 'Medium', pointsForLevel: 2, timeLimit: 45 })) },
      { _id: 'motion-hard', title: 'Motion Challenge - Hard', points: 40, totalTimeLimit: 1200, difficulty: 'Hard', gameType: 'MotionChallenge', isMultiLevel: true, totalLevels: 20, levels: Array.from({ length: 20 }, (_, i) => ({ levelNumber: i + 1, questionType: 'MotionChallenge', difficulty: 'Hard', pointsForLevel: 2, timeLimit: 60 })) }
    ],
    'subtopic-accenture-switch': [
      { _id: 'switch-easy', title: 'Switch Challenge - Easy', points: 40, totalTimeLimit: 600, difficulty: 'Easy', gameType: 'SwitchChallenge', isMultiLevel: true, totalLevels: 20, levels: Array.from({ length: 20 }, (_, i) => ({ levelNumber: i + 1, questionType: 'SwitchChallenge', difficulty: 'Easy', pointsForLevel: 2, timeLimit: 30 })) },
      { _id: 'switch-medium', title: 'Switch Challenge - Medium', points: 40, totalTimeLimit: 900, difficulty: 'Medium', gameType: 'SwitchChallenge', isMultiLevel: true, totalLevels: 20, levels: Array.from({ length: 20 }, (_, i) => ({ levelNumber: i + 1, questionType: 'SwitchChallenge', difficulty: 'Medium', pointsForLevel: 2, timeLimit: 45 })) },
      { _id: 'switch-hard', title: 'Switch Challenge - Hard', points: 40, totalTimeLimit: 1200, difficulty: 'Hard', gameType: 'SwitchChallenge', isMultiLevel: true, totalLevels: 20, levels: Array.from({ length: 20 }, (_, i) => ({ levelNumber: i + 1, questionType: 'SwitchChallenge', difficulty: 'Hard', pointsForLevel: 2, timeLimit: 60 })) }
    ]
  };
  
  return games[subtopicId] || [];
};
