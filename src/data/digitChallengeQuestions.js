export const getDigitChallengeQuestions = (subtopicId) => {
  return [
    {
      _id: 'digit-challenge-easy',
      title: 'Digit Challenge - Easy',
      points: 40,
      totalTimeLimit: 600,
      difficulty: 'Easy',
      gameType: 'memory',
      isMultiLevel: true,
      totalLevels: 20,
      levels: Array.from({ length: 20 }, (_, i) => ({
        levelNumber: i + 1,
        questionType: 'DigitChallenge',
        difficulty: 'Easy',
        pointsForLevel: 2,
        timeLimit: 30
      }))
    },
    {
      _id: 'digit-challenge-medium',
      title: 'Digit Challenge - Medium',
      points: 40,
      totalTimeLimit: 900,
      difficulty: 'Medium',
      gameType: 'memory',
      isMultiLevel: true,
      totalLevels: 20,
      levels: Array.from({ length: 20 }, (_, i) => ({
        levelNumber: i + 1,
        questionType: 'DigitChallenge',
        difficulty: 'Medium',
        pointsForLevel: 2,
        timeLimit: 45
      }))
    },
    {
      _id: 'digit-challenge-hard',
      title: 'Digit Challenge - Hard',
      points: 40,
      totalTimeLimit: 1200,
      difficulty: 'Hard',
      gameType: 'memory',
      isMultiLevel: true,
      totalLevels: 20,
      levels: Array.from({ length: 20 }, (_, i) => ({
        levelNumber: i + 1,
        questionType: 'DigitChallenge',
        difficulty: 'Hard',
        pointsForLevel: 2,
        timeLimit: 60
      }))
    }
  ];
};
