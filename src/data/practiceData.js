export const practiceData = [
  {
    _id: "topic-company-specific",
    title: "Company Specific",
    description: "Practice company-specific interview questions and coding challenges",
    domain: "company-specific",
    subtopics: [
      { _id: "subtopic-company-tcs", title: "TCS", description: "TCS NQT and Digital coding questions", useExcel: false },
      { _id: "subtopic-company-infosys", title: "Infosys", description: "Infosys coding and aptitude questions", useExcel: false },
      { _id: "subtopic-company-wipro", title: "Wipro", description: "Wipro NLTH coding challenges", useExcel: false },
      { _id: "subtopic-company-accenture", title: "Accenture", description: "Accenture coding and cognitive questions", useExcel: false },
      { _id: "subtopic-company-cognizant", title: "Cognizant", description: "Cognizant GenC and coding questions", useExcel: false },
      { _id: "subtopic-company-capgemini", title: "Capgemini", description: "Capgemini coding and pseudocode questions", useExcel: false }
    ]
  },
  {
    _id: "topic-gamified",
    title: "Gamified",
    description: "Interactive gamified learning experiences",
    domain: "gamified-aptitude",
    excelFile: "https://docs.google.com/spreadsheets/d/1fs-XvvPhY_HV1FPx6QkP79uenzJXuiA45u_s5wgUWgU/edit?usp=sharing",
    // excelFile: "/datasets/gamified_questions.xlsx", // For offline: use local Excel file
    subtopics: [
      { _id: "subtopic-accenture-motion", title: "Motion Challenge", description: "Directional movement and coordinate tracking", useExcel: false },
      { _id: "subtopic-accenture-geosudo", title: "Geo-Sudo", description: "Deductive logical thinking with geometric patterns", useExcel: false },
      { _id: "subtopic-gamified-maze-games", title: "Maze Games", description: "Navigate through challenging mazes", useExcel: false },
      { _id: "subtopic-gamified-balloon-pop-games", title: "Balloon Pop Games", description: "Pop balloons to solve puzzles", useExcel: false },
      { _id: "subtopic-gamified-digit-challenge", title: "Digit Challenge", description: "Number memory and equation solving", useExcel: false },
      { _id: "subtopic-accenture-inductive", title: "Inductive Logic", description: "Pattern recognition and sequence completion", useExcel: false },
      { _id: "subtopic-gamified-memory-games", title: "Memory Games", description: "Test and improve your memory", useExcel: false },
      { _id: "subtopic-gamified-puzzle-games", title: "Puzzle Games", description: "Solve visual and logic puzzles", useExcel: false },
      { _id: "subtopic-accenture-grid", title: "Grid Challenge", description: "Spatial reasoning and pattern matching", useExcel: false },
      { _id: "subtopic-accenture-switch", title: "Switch Challenge", description: "Toggle logic and state management", useExcel: false }
    ]
  },
  {
    _id: "topic-aptitude",
    title: "Aptitude",
    description: "Verbal, Quantitative, and Logical Reasoning for placement preparation",
    domain: "aptitude",
    subtopics: [
      { _id: "subtopic-aptitude-verbal", title: "Verbal Ability", description: "Synonyms, antonyms, and sentence completion", useExcel: false },
      { _id: "subtopic-aptitude-quantitative", title: "Quantitative Aptitude", description: "Math problems: percentage, ratio, profit, time & distance", useExcel: false },
      { _id: "subtopic-aptitude-reasoning", title: "Logical Reasoning", description: "Syllogisms, comparisons, and logical deductions", useExcel: false }
    ]
  },
  {
    _id: "topic-programming",
    title: "Programming",
    description: "Learn programming from basics to complete DSA with strong problem-solving skills.",
    domain: "programming",
    excelFile: "https://docs.google.com/spreadsheets/d/197pQuWdj0u9fiFyN2WILdvpOiZ2Qm_rvALzSTRg1mho/edit?usp=sharing",
    // excelFile: "/datasets/practice_questions.xlsx", // For offline: use local Excel file
    subtopics: [
      { _id: "subtopic-programming-inputs", title: "Inputs", description: "Learn input reading, validation, parsing, error handling, and secure processing techniques.", useExcel: true },
      { _id: "subtopic-programming-operators", title: "Operators", description: "Learn arithmetic, relational, logical, bitwise operators, and practical usage techniques.", useExcel: true },
      { _id: "subtopic-programming-basic-conditions", title: "Basic Conditions", description: "Learn if-else statements, switch cases, logical operators, and decision-making techniques.", useExcel: true },
      { _id: "subtopic-programming-nested-conditions", title: "Nested Conditions", description: "Learn if-else chains, nested switch cases, logical nesting, and complex decision flows.", useExcel: true },
      { _id: "subtopic-programming-loops", title: "Loops", description: "Learn for, while loops, break/continue, and iteration techniques.", useExcel: true },
      { _id: "subtopic-programming-nested-loops", title: "Nested Loops", description: "Learn double/triple loops, patterns, optimization, break/continue, and matrix applications.", useExcel: true },
      { _id: "subtopic-programming-pattern-printing", title: "Pattern Printing", description: "Learn star, number, alphabet patterns using nested loops and printing techniques.", useExcel: true },
      { _id: "subtopic-programming-arrays", title: "Arrays", description: "Practice array problems from Excel dataset", useExcel: true },
      { _id: "subtopic-programming-strings", title: "Strings", description: "Learn declaration, traversal, manipulation, searching, sorting, and string operations.", useExcel: true },
      { _id: "subtopic-programming-2d-arrays", title: "2D Arrays", description: "Learn declaration, initialization, traversal, matrix operations, and common applications.", useExcel: true },
      { _id: "subtopic-programming-two-pointers", title: "Two Pointers", description: "Learn left/right pointers, array traversal, pair finding, and optimization techniques.", useExcel: true },
      { _id: "subtopic-programming-sliding-window-fixed", title: "Sliding Window Fixed", description: "Learn fixed-size windows, maximum sum, subarray averages, and efficient sliding techniques.", useExcel: true },
      { _id: "subtopic-programming-sliding-window-variable", title: "Sliding Window Variable", description: "Learn dynamic windows, longest substring, minimum subarray, condition-based expansion/shrinking.", useExcel: true },
      { _id: "subtopic-programming-hashmap", title: "HashMap", description: "Learn key-value storage, hashing, collisions, put/get/remove, and practical applications.", useExcel: true },
      { _id: "subtopic-programming-stack", title: "Stack", description: "Learn push, pop, peek operations, parentheses matching, and monotonic stack techniques.", useExcel: true },
      { _id: "subtopic-programming-queue", title: "Queue", description: "Learn enqueue, dequeue, peek operations, circular queue, and FIFO applications.", useExcel: true }
    ]
  }
];
