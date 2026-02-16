export const getAptitudeGames = (subtopicId) => {
  const games = {
    'subtopic-aptitude-verbal': [
      { _id: 'verbal-easy', title: 'Verbal Ability - Easy', points: 50, totalTimeLimit: 300, difficulty: 'Easy', gameType: 'VerbalAbility', isMultiLevel: true, levels: [{ questionType: 'VerbalAbility', difficulty: 'Easy', pointsForLevel: 50 }] },
      { _id: 'verbal-medium', title: 'Verbal Ability - Medium', points: 75, totalTimeLimit: 300, difficulty: 'Medium', gameType: 'VerbalAbility', isMultiLevel: true, levels: [{ questionType: 'VerbalAbility', difficulty: 'Medium', pointsForLevel: 75 }] },
      { _id: 'verbal-hard', title: 'Verbal Ability - Hard', points: 100, totalTimeLimit: 300, difficulty: 'Hard', gameType: 'VerbalAbility', isMultiLevel: true, levels: [{ questionType: 'VerbalAbility', difficulty: 'Hard', pointsForLevel: 100 }] }
    ],
    'subtopic-aptitude-quantitative': [
      { _id: 'quant-easy', title: 'Quantitative Aptitude - Easy', points: 50, totalTimeLimit: 300, difficulty: 'Easy', gameType: 'Quantitative', isMultiLevel: true, levels: [{ questionType: 'Quantitative', difficulty: 'Easy', pointsForLevel: 50 }] },
      { _id: 'quant-medium', title: 'Quantitative Aptitude - Medium', points: 75, totalTimeLimit: 300, difficulty: 'Medium', gameType: 'Quantitative', isMultiLevel: true, levels: [{ questionType: 'Quantitative', difficulty: 'Medium', pointsForLevel: 75 }] },
      { _id: 'quant-hard', title: 'Quantitative Aptitude - Hard', points: 100, totalTimeLimit: 300, difficulty: 'Hard', gameType: 'Quantitative', isMultiLevel: true, levels: [{ questionType: 'Quantitative', difficulty: 'Hard', pointsForLevel: 100 }] }
    ],
    'subtopic-aptitude-reasoning': [
      { _id: 'reasoning-easy', title: 'Logical Reasoning - Easy', points: 50, totalTimeLimit: 300, difficulty: 'Easy', gameType: 'LogicalReasoning', isMultiLevel: true, levels: [{ questionType: 'LogicalReasoning', difficulty: 'Easy', pointsForLevel: 50 }] },
      { _id: 'reasoning-medium', title: 'Logical Reasoning - Medium', points: 75, totalTimeLimit: 300, difficulty: 'Medium', gameType: 'LogicalReasoning', isMultiLevel: true, levels: [{ questionType: 'LogicalReasoning', difficulty: 'Medium', pointsForLevel: 75 }] },
      { _id: 'reasoning-hard', title: 'Logical Reasoning - Hard', points: 100, totalTimeLimit: 300, difficulty: 'Hard', gameType: 'LogicalReasoning', isMultiLevel: true, levels: [{ questionType: 'LogicalReasoning', difficulty: 'Hard', pointsForLevel: 100 }] }
    ]
  };
  
  return games[subtopicId] || [];
};
