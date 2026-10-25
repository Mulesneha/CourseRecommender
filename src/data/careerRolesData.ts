import { CareerRole } from '../types';

export const CAREER_ROLES: CareerRole[] = [
  {
    id: 'software-developer',
    name: 'Software Developer',
    category: 'Engineering',
    description: 'Build robust scalable software applications, write clean modular code, design system architectures, and master data structures and algorithms for technical interviews.',
    medianSalary: '$98,000 / ₹12-18 LPA',
    hiringOutlook: '+17% High Demand in Campus Placements',
    recommendedPrereqOrder: [
      'Programming Fundamentals',
      'Data Structures & Algorithms',
      'Object-Oriented Programming',
      'Database Management Systems',
      'Git & Version Control',
      'System Design Basics'
    ],
    skills: [
      {
        skill: 'Data Structures & Algorithms',
        importance: 5,
        targetMastery: 0.85,
        category: 'interview',
        description: 'Arrays, Trees, Graphs, Dynamic Programming, Complexity Analysis for coding rounds.'
      },
      {
        skill: 'Object-Oriented Programming',
        importance: 5,
        targetMastery: 0.80,
        category: 'core',
        description: 'Inheritance, Polymorphism, Abstraction, Encapsulation, SOLID principles.'
      },
      {
        skill: 'Database Management Systems',
        importance: 4,
        targetMastery: 0.75,
        category: 'core',
        description: 'Relational modeling, SQL joins, normalization, indexing, ACID transactions.'
      },
      {
        skill: 'Git & Version Control',
        importance: 4,
        targetMastery: 0.70,
        category: 'tools',
        description: 'Branching, merging, rebasing, pull requests, collaborative repository workflows.'
      },
      {
        skill: 'Programming Fundamentals',
        importance: 5,
        targetMastery: 0.90,
        category: 'core',
        description: 'Proficiency in Python, Java, or C++, memory management, recursion, debugging.'
      },
      {
        skill: 'System Design Basics',
        importance: 3,
        targetMastery: 0.65,
        category: 'interview',
        description: 'Client-server architecture, caching, load balancing, REST API design, rate limiting.'
      }
    ]
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    category: 'Analytics',
    description: 'Transform complex business datasets into actionable insights using SQL querying, statistical analysis, dashboarding, and automated exploratory data workflows.',
    medianSalary: '$82,000 / ₹8-14 LPA',
    hiringOutlook: '+23% Rapidly Growing Across Tech & FinTech',
    recommendedPrereqOrder: [
      'Excel & Spreadsheet Modeling',
      'SQL & Relational Databases',
      'Python for Data Science',
      'Applied Statistics',
      'Data Visualization & BI'
    ],
    skills: [
      {
        skill: 'SQL & Relational Databases',
        importance: 5,
        targetMastery: 0.90,
        category: 'core',
        description: 'Window functions, CTEs, complex subqueries, aggregations, query optimization.'
      },
      {
        skill: 'Applied Statistics',
        importance: 4,
        targetMastery: 0.75,
        category: 'core',
        description: 'Probability distributions, hypothesis testing, A/B testing, regression analysis.'
      },
      {
        skill: 'Python for Data Science',
        importance: 4,
        targetMastery: 0.80,
        category: 'core',
        description: 'Pandas data wrangling, NumPy vectorization, exploratory data analysis.'
      },
      {
        skill: 'Data Visualization & BI',
        importance: 4,
        targetMastery: 0.75,
        category: 'tools',
        description: 'Power BI, Tableau, Seaborn/Matplotlib storytelling and executive reporting.'
      },
      {
        skill: 'Excel & Spreadsheet Modeling',
        importance: 3,
        targetMastery: 0.80,
        category: 'tools',
        description: 'Pivot tables, VLOOKUP/XLOOKUP, financial modeling, dynamic array formulas.'
      }
    ]
  },
  {
    id: 'ml-engineer',
    name: 'Machine Learning Engineer',
    category: 'Artificial Intelligence',
    description: 'Research, design, and train predictive models and neural networks, evaluate metric trade-offs, and operationalize machine learning systems in production pipelines.',
    medianSalary: '$112,000 / ₹16-25 LPA',
    hiringOutlook: '+28% Surging Demand in AI Innovation Centers',
    recommendedPrereqOrder: [
      'Python Programming',
      'Linear Algebra & Calculus',
      'Pandas & NumPy Vectorization',
      'Classical Machine Learning',
      'Deep Learning & Neural Networks',
      'Model Evaluation & Deployment'
    ],
    skills: [
      {
        skill: 'Python Programming',
        importance: 5,
        targetMastery: 0.90,
        category: 'core',
        description: 'Advanced Python idioms, object orientation, profiling, vector computation.'
      },
      {
        skill: 'Classical Machine Learning',
        importance: 5,
        targetMastery: 0.85,
        category: 'core',
        description: 'Supervised & unsupervised algorithms, Scikit-learn, regularization, ensemble trees.'
      },
      {
        skill: 'Model Evaluation & Deployment',
        importance: 5,
        targetMastery: 0.80,
        category: 'tools',
        description: 'ROC-AUC, cross-validation, data drift, FastAPI serving, Dockerization, monitoring.'
      },
      {
        skill: 'Linear Algebra & Statistics',
        importance: 4,
        targetMastery: 0.80,
        category: 'core',
        description: 'Matrix decomposition, eigenvalues, gradient descent mathematics, Bayes theorem.'
      },
      {
        skill: 'Deep Learning & Neural Networks',
        importance: 4,
        targetMastery: 0.75,
        category: 'framework',
        description: 'PyTorch/TensorFlow, backpropagation, CNNs, Transformers, fine-tuning.'
      }
    ]
  },
  {
    id: 'frontend-developer',
    name: 'Frontend Developer',
    category: 'Web Development',
    description: 'Create responsive, high-performance, accessible user interfaces using modern web technologies, React ecosystems, state management architectures, and component libraries.',
    medianSalary: '$92,000 / ₹10-16 LPA',
    hiringOutlook: '+15% Steady Demand across SaaS & Consumer Tech',
    recommendedPrereqOrder: [
      'HTML5 & Modern CSS',
      'JavaScript Fundamentals & ES6+',
      'React & Component Architecture',
      'State Management & Data Fetching',
      'TypeScript for Web Applications',
      'Web Performance & Testing'
    ],
    skills: [
      {
        skill: 'JavaScript Fundamentals & ES6+',
        importance: 5,
        targetMastery: 0.90,
        category: 'core',
        description: 'Closures, event loop, promises, async/await, prototype chain, DOM API.'
      },
      {
        skill: 'React & Component Architecture',
        importance: 5,
        targetMastery: 0.85,
        category: 'framework',
        description: 'Hooks, custom hooks, component lifecycles, memoization, routing, server state.'
      },
      {
        skill: 'TypeScript for Web Applications',
        importance: 4,
        targetMastery: 0.80,
        category: 'core',
        description: 'Generics, union types, interfaces, utility types, strict typing in React.'
      },
      {
        skill: 'HTML5 & Modern CSS',
        importance: 4,
        targetMastery: 0.85,
        category: 'core',
        description: 'Semantic markup, Flexbox, CSS Grid, Tailwind CSS, responsive media queries.'
      },
      {
        skill: 'Web Performance & Testing',
        importance: 3,
        targetMastery: 0.65,
        category: 'tools',
        description: 'Lighthouse metrics, bundle splitting, React Testing Library, accessibility WCAG.'
      }
    ]
  },
  {
    id: 'backend-developer',
    name: 'Backend Developer',
    category: 'Engineering',
    description: 'Architect secure RESTful & GraphQL microservices, manage database schema persistence, design caching layers, handle authentication, and orchestrate containerized cloud environments.',
    medianSalary: '$96,000 / ₹12-18 LPA',
    hiringOutlook: '+19% High Demand for Cloud & Backend Infrastructure',
    recommendedPrereqOrder: [
      'Backend Programming Language',
      'Database Modeling & SQL Optimization',
      'RESTful API & Service Architecture',
      'Authentication & Web Security',
      'Containerization & Cloud Basics'
    ],
    skills: [
      {
        skill: 'RESTful API & Service Architecture',
        importance: 5,
        targetMastery: 0.85,
        category: 'core',
        description: 'API design standards, status codes, middleware, pagination, rate limiting.'
      },
      {
        skill: 'Database Modeling & SQL Optimization',
        importance: 5,
        targetMastery: 0.85,
        category: 'core',
        description: 'PostgreSQL/MySQL schema design, indexing strategies, transactions, ORMs.'
      },
      {
        skill: 'Authentication & Web Security',
        importance: 4,
        targetMastery: 0.75,
        category: 'core',
        description: 'JWT, OAuth2, password hashing with bcrypt, CORS, CSRF, input sanitization.'
      },
      {
        skill: 'Backend Programming Language',
        importance: 5,
        targetMastery: 0.85,
        category: 'core',
        description: 'Express/Node.js, FastAPI/Python, or Spring Boot/Java asynchronous concurrency.'
      },
      {
        skill: 'Containerization & Cloud Basics',
        importance: 3,
        targetMastery: 0.65,
        category: 'tools',
        description: 'Docker multi-stage builds, container networks, deployment to cloud platforms.'
      }
    ]
  }
];
