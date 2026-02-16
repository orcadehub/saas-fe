const generateBalloons = (count, seed) => {
  const rng = (s) => (s * 9301 + 49297) % 233280 / 233280;
  const nums = [];
  let s = seed;
  while (nums.length < count) {
    const num = Math.floor(rng(s) * 100) + 1;
    if (!nums.includes(num)) nums.push(num);
    s++;
  }
  return nums;
};

const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
};

export const balloonPopGameQuestions = [
  {
    _id: 'balloon-easy',
    title: 'Balloon Pop - Easy (3 Balloons)',
    description: 'Pop balloons in correct order',
    difficulty: 'Easy',
    points: 40,
    gameType: 'MCQ',
    isMultiLevel: true,
    totalLevels: 20,
    hasTimer: true,
    totalTimeLimit: 600,
    maxScore: 40,
    passingScore: 24,
    speedBonus: { enabled: true, maxBonus: 20, timeThreshold: 300 },
    streakBonus: { enabled: true, bonusPerStreak: 5 },
    tags: ['balloon', 'sorting', 'numbers'],
    isActive: true,
    levels: Array.from({ length: 20 }, (_, i) => {
      const balloons = generateBalloons(3, (i + 1) * 100);
      const types = ['ascending', 'descending', 'min', 'max'];
      const type = types[i % 4];
      let question, answer;
      
      if (type === 'ascending') {
        question = 'Pop the balloons in ascending order';
        answer = [...balloons].sort((a, b) => a - b);
      } else if (type === 'descending') {
        question = 'Pop the balloons in descending order';
        answer = [...balloons].sort((a, b) => b - a);
      } else if (type === 'min') {
        question = 'Pop the balloon with the smallest number';
        answer = [Math.min(...balloons)];
      } else {
        question = 'Pop the balloon with the largest number';
        answer = [Math.max(...balloons)];
      }

      return {
        levelNumber: i + 1,
        question,
        questionType: 'BalloonPop',
        correctAnswer: JSON.stringify({ balloons, answer, type }),
        pointsForLevel: 2,
        timeLimit: 30,
        hints: [{ hintNumber: 1, hintText: 'Look at the numbers carefully', pointsDeduction: 1 }],
        shuffleOptions: false
      };
    })
  },
  {
    _id: 'balloon-medium',
    title: 'Balloon Pop - Medium (4 Balloons)',
    description: 'Pop balloons based on number properties',
    difficulty: 'Medium',
    points: 40,
    gameType: 'MCQ',
    isMultiLevel: true,
    totalLevels: 20,
    hasTimer: true,
    totalTimeLimit: 900,
    maxScore: 40,
    passingScore: 24,
    speedBonus: { enabled: true, maxBonus: 20, timeThreshold: 450 },
    streakBonus: { enabled: true, bonusPerStreak: 5 },
    tags: ['balloon', 'sorting', 'numbers'],
    isActive: true,
    levels: Array.from({ length: 20 }, (_, i) => {
      const balloons = generateBalloons(4, (i + 1) * 200);
      const types = ['ascending', 'descending', 'even', 'odd', 'prime'];
      const type = types[i % 5];
      let question, answer;
      
      if (type === 'ascending') {
        question = 'Pop the balloons in ascending order';
        answer = [...balloons].sort((a, b) => a - b);
      } else if (type === 'descending') {
        question = 'Pop the balloons in descending order';
        answer = [...balloons].sort((a, b) => b - a);
      } else if (type === 'even') {
        question = 'Pop all balloons with even numbers';
        answer = balloons.filter(n => n % 2 === 0).sort((a, b) => a - b);
      } else if (type === 'odd') {
        question = 'Pop all balloons with odd numbers';
        answer = balloons.filter(n => n % 2 !== 0).sort((a, b) => a - b);
      } else {
        question = 'Pop all balloons with prime numbers';
        answer = balloons.filter(isPrime).sort((a, b) => a - b);
      }

      return {
        levelNumber: i + 1,
        question,
        questionType: 'BalloonPop',
        correctAnswer: JSON.stringify({ balloons, answer, type }),
        pointsForLevel: 2,
        timeLimit: 45,
        hints: [{ hintNumber: 1, hintText: 'Think about the number properties', pointsDeduction: 1 }],
        shuffleOptions: false
      };
    })
  },
  {
    _id: 'balloon-hard',
    title: 'Balloon Pop - Hard (5 Balloons)',
    description: 'Pop balloons with complex number patterns',
    difficulty: 'Hard',
    points: 40,
    gameType: 'MCQ',
    isMultiLevel: true,
    totalLevels: 20,
    hasTimer: true,
    totalTimeLimit: 1200,
    maxScore: 40,
    passingScore: 24,
    speedBonus: { enabled: true, maxBonus: 20, timeThreshold: 600 },
    streakBonus: { enabled: true, bonusPerStreak: 5 },
    tags: ['balloon', 'sorting', 'numbers'],
    isActive: true,
    levels: Array.from({ length: 20 }, (_, i) => {
      const balloons = generateBalloons(5, (i + 1) * 300);
      const types = ['ascending', 'descending', 'prime', 'divisibleBy3', 'perfectSquare'];
      const type = types[i % 5];
      let question, answer;
      
      if (type === 'ascending') {
        question = 'Pop the balloons in ascending order';
        answer = [...balloons].sort((a, b) => a - b);
      } else if (type === 'descending') {
        question = 'Pop the balloons in descending order';
        answer = [...balloons].sort((a, b) => b - a);
      } else if (type === 'prime') {
        question = 'Pop all prime number balloons in ascending order';
        answer = balloons.filter(isPrime).sort((a, b) => a - b);
      } else if (type === 'divisibleBy3') {
        question = 'Pop all balloons divisible by 3 in ascending order';
        answer = balloons.filter(n => n % 3 === 0).sort((a, b) => a - b);
      } else {
        question = 'Pop all perfect square balloons in ascending order';
        const isPerfectSquare = (n) => Math.sqrt(n) === Math.floor(Math.sqrt(n));
        answer = balloons.filter(isPerfectSquare).sort((a, b) => a - b);
      }

      return {
        levelNumber: i + 1,
        question,
        questionType: 'BalloonPop',
        correctAnswer: JSON.stringify({ balloons, answer, type }),
        pointsForLevel: 2,
        timeLimit: 60,
        hints: [{ hintNumber: 1, hintText: 'Analyze the mathematical properties', pointsDeduction: 1 }],
        shuffleOptions: false
      };
    })
  }
];

export const getBalloonPopGameQuestions = (subtopicId) => {
  return balloonPopGameQuestions.map(q => ({ ...q, subtopicId }));
};
