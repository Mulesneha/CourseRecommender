import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Data Structures & Algorithms
  {
    id: 'dsa-1',
    skill: 'Data Structures & Algorithms',
    difficulty: 'Intermediate',
    question: 'What is the average time complexity of searching for an element in a balanced Binary Search Tree (AVL or Red-Black Tree)?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctIndex: 1,
    explanation: 'In a balanced binary search tree, the height is bounded by O(log n), so search, insertion, and deletion operations take O(log n) time in both average and worst cases.',
    codeSnippet: `// Searching in a Balanced BST
function searchBST(root, target) {
  if (!root || root.val === target) return root;
  return target < root.val 
    ? searchBST(root.left, target) 
    : searchBST(root.right, target);
}`
  },
  {
    id: 'dsa-2',
    skill: 'Data Structures & Algorithms',
    difficulty: 'Intermediate',
    question: 'Which sorting algorithm has a guaranteed worst-case time complexity of O(n log n) and does not require O(n) auxiliary space?',
    options: ['Quicksort', 'Mergesort', 'Heapsort', 'Insertion Sort'],
    correctIndex: 2,
    explanation: 'Heapsort operates in-place using O(1) auxiliary space and guarantees O(n log n) in the worst case (unlike Quicksort which can degrade to O(n^2), and Mergesort which requires O(n) extra space).',
    codeSnippet: `// Heapsort guarantees O(n log n) worst case in-place
function heapSort(arr) {
  buildMaxHeap(arr);
  for (let i = arr.length - 1; i > 0; i--) {
    swap(arr, 0, i);
    heapify(arr, 0, i);
  }
}`
  },
  {
    id: 'dsa-3',
    skill: 'Data Structures & Algorithms',
    difficulty: 'Advanced',
    question: 'In graph theory, which algorithm is best suited for finding the shortest paths from a single source vertex to all other vertices in a directed graph with non-negative edge weights?',
    options: ['Floyd-Warshall Algorithm', 'Dijkstra Algorithm with Min-Heap', 'Bellman-Ford Algorithm', 'Depth-First Search'],
    correctIndex: 1,
    explanation: 'Dijkstra\'s algorithm implemented with a min-priority heap operates in O((V + E) log V) time, which is optimal for non-negative edge weights.',
    codeSnippet: `// Priority Queue Dijkstra
const pq = new MinPriorityQueue();
dist[src] = 0;
pq.enqueue(src, 0);`
  },

  // Object-Oriented Programming
  {
    id: 'oop-1',
    skill: 'Object-Oriented Programming',
    difficulty: 'Beginner',
    question: 'In the SOLID design principles, what does the "L" (Liskov Substitution Principle) state?',
    options: [
      'Modules should have only one reason to change',
      'Objects of a superclass should be replaceable with objects of a subclass without breaking application correctness',
      'High-level modules should not depend on low-level modules',
      'Interfaces should be segregated into smaller client-specific interfaces'
    ],
    correctIndex: 1,
    explanation: 'Liskov Substitution Principle (LSP) mandates that subclasses must behave consistently with the contracts established by their parent classes so that substituting a subtype does not produce unexpected defects.',
    codeSnippet: `// LSP compliant: Square cannot arbitrarily break Rectangle assumptions
class Rectangle {
  setWidth(w) { this.width = w; }
  setHeight(h) { this.height = h; }
  getArea() { return this.width * this.height; }
}`
  },
  {
    id: 'oop-2',
    skill: 'Object-Oriented Programming',
    difficulty: 'Intermediate',
    question: 'What is the key difference between Method Overloading (compile-time polymorphism) and Method Overriding (runtime polymorphism)?',
    options: [
      'Overloading occurs in different classes; overriding occurs in the same class',
      'Overloading has the same signature; overriding requires different argument counts',
      'Overloading defines multiple methods with the same name but different parameters in the same class; overriding re-implements a parent method in a child class',
      'Overriding is resolved at compile time; overloading is resolved dynamically by the JVM'
    ],
    correctIndex: 2,
    explanation: 'Overloading provides multiple methods with the same name but varying parameter signatures in a class. Overriding allows a derived class to supply a specific implementation of a method already declared in its base class.',
    codeSnippet: `class Shape {
  render() { /* default */ } // overridden in Circle
}
class Circle extends Shape {
  override render() { /* circle specific */ }
}`
  },

  // Database Management Systems & SQL
  {
    id: 'dbms-1',
    skill: 'Database Management Systems',
    difficulty: 'Intermediate',
    question: 'Which SQL clause is executed FIRST in the logical query processing order of an SQL SELECT statement?',
    options: ['SELECT', 'WHERE', 'FROM & JOIN', 'GROUP BY'],
    correctIndex: 2,
    explanation: 'Logically, SQL engines first evaluate FROM and JOIN clauses to establish the working dataset, then filter rows using WHERE, group them with GROUP BY, evaluate HAVING, select columns, and finally apply ORDER BY and LIMIT.',
    codeSnippet: `SELECT department, COUNT(*)
FROM employees -- Step 1: FROM / JOIN
WHERE salary > 50000 -- Step 2: WHERE
GROUP BY department -- Step 3: GROUP BY
HAVING COUNT(*) > 5 -- Step 4: HAVING`
  },
  {
    id: 'dbms-2',
    skill: 'SQL & Relational Databases',
    difficulty: 'Advanced',
    question: 'What is the purpose of a Window Function with the OVER (PARTITION BY ... ORDER BY ...) clause in modern SQL?',
    options: [
      'It combines multiple rows into a single collapsed summary row like GROUP BY',
      'It computes an aggregate calculation across a set of table rows while retaining each individual row in the output',
      'It creates a temporary in-memory database index for faster lookups',
      'It enforces referential foreign key integrity between two tables'
    ],
    correctIndex: 1,
    explanation: 'Window functions perform calculations across a subset of rows (partition) related to the current row, without collapsing the individual rows into a single summary row like standard GROUP BY does.',
    codeSnippet: `SELECT employee_id, department, salary,
       RANK() OVER (
         PARTITION BY department 
         ORDER BY salary DESC
       ) as dept_rank
FROM employees;`
  },

  // Programming Fundamentals
  {
    id: 'prog-1',
    skill: 'Programming Fundamentals',
    difficulty: 'Beginner',
    question: 'What is the primary risk of an improperly terminated recursive function?',
    options: ['Memory fragmentation', 'Call stack overflow', 'Syntax compiler failure', 'Deadlock in thread pool'],
    correctIndex: 1,
    explanation: 'Every recursive call pushes a new execution stack frame onto the call stack. Without a valid base case, calls continue indefinitely until stack memory is exhausted, throwing a Stack Overflow error.',
    codeSnippet: `function countdown(n) {
  // Base case prevents stack overflow:
  if (n <= 0) return;
  console.log(n);
  countdown(n - 1);
}`
  },

  // Git & Version Control
  {
    id: 'git-1',
    skill: 'Git & Version Control',
    difficulty: 'Beginner',
    question: 'What is the fundamental difference between `git merge` and `git rebase` when integrating feature branch changes into main?',
    options: [
      '`git rebase` deletes remote commits while `git merge` keeps them',
      '`git merge` creates a non-linear history with a dedicated merge commit, while `git rebase` rewrites commit history onto the target base for a linear commit line',
      '`git merge` is only for GitHub pull requests and cannot run locally',
      '`git rebase` is unable to handle merge conflicts'
    ],
    correctIndex: 1,
    explanation: '`git merge` preserves full branching context by generating an explicit merge commit, whereas `git rebase` reapplies commits from the feature branch on top of the tip of the target branch, producing a tidy, linear commit graph.',
    codeSnippet: `git checkout feature/auth
git rebase main
# Solves conflicts, produces clean linear history`
  },

  // System Design
  {
    id: 'sys-1',
    skill: 'System Design Basics',
    difficulty: 'Intermediate',
    question: 'In distributed systems and caching, what is the primary benefit of "Consistent Hashing" over simple modular hashing (hash(key) % N)?',
    options: [
      'It reduces cache latency to absolute zero',
      'When nodes are added or removed, only k/N keys need to be remapped on average rather than almost all keys',
      'It eliminates the need for replication across nodes',
      'It automatically encrypts cached payloads with AES-256'
    ],
    correctIndex: 1,
    explanation: 'In traditional hash % N, changing the node count N reshuffles nearly 100% of all keys, causing a catastrophic cache stampede. Consistent hashing maps keys to a virtual hash ring, so adding/removing a server only reassigns ~1/N keys.',
    codeSnippet: `// Key mapped to ring angle (0 - 360 deg)
// Server nodes placed on ring
// Key maps to first server clockwise`
  },

  // Python for Data Science
  {
    id: 'pyds-1',
    skill: 'Python for Data Science',
    difficulty: 'Intermediate',
    question: 'In Pandas, what is the most computationally efficient method to perform mathematical operations across an entire DataFrame column?',
    options: [
      'Looping through rows using a standard Python for-loop',
      'Using the `iterrows()` generator function',
      'Vectorized operations (e.g. df["col"] * 2) or NumPy universal functions (ufuncs)',
      'Exporting to a CSV and processing with bash awk'
    ],
    correctIndex: 2,
    explanation: 'Pandas and NumPy vectorized operations execute compiled C code under the hood with SIMD processor optimizations, running 100x to 1000x faster than Python-level loops or iterrows().',
    codeSnippet: `import pandas as pd
# Vectorized: executes in compiled C memory
df['normalized_revenue'] = (df['revenue'] - df['revenue'].mean()) / df['revenue'].std()`
  },

  // Applied Statistics
  {
    id: 'stat-1',
    skill: 'Applied Statistics',
    difficulty: 'Intermediate',
    question: 'What does a p-value of 0.03 indicate when testing a hypothesis against a significance threshold (alpha) of 0.05?',
    options: [
      'There is a 3% probability that the null hypothesis is true',
      'The effect size is exactly 0.03 units',
      'Assuming the null hypothesis is true, there is a 3% probability of observing results as extreme or more extreme than what was measured; we reject the null hypothesis',
      'The experiment has an 97% confidence of being commercially profitable'
    ],
    correctIndex: 2,
    explanation: 'The p-value is P(Data >= observed | H0 is true). Since p = 0.03 < alpha (0.05), we reject the null hypothesis as statistically significant at the 5% level.',
    codeSnippet: `from scipy import stats
t_stat, p_val = stats.ttest_ind(control_group, test_group)
if p_val < 0.05:
    print("Statistically significant difference detected")`
  },

  // Classical Machine Learning
  {
    id: 'ml-1',
    skill: 'Classical Machine Learning',
    difficulty: 'Intermediate',
    question: 'Why is it critical to fit feature scaling transformers (e.g., StandardScaler) ONLY on training data and not on the whole dataset before train-test split?',
    options: [
      'Scaling the test set causes division by zero errors',
      'To prevent Data Leakage, ensuring test metrics accurately reflect model generalization to completely unseen future data',
      'Scikit-learn raises a syntax error if fit_transform is called twice',
      'It increases training speed by 90%'
    ],
    correctIndex: 1,
    explanation: 'If mean and variance from the test set are used during feature scaling, future test information leaks into model training, producing overly optimistic, non-generalizable validation metrics.',
    codeSnippet: `from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train) # Fit only train
X_test_scaled = scaler.transform(X_test)       # Transform test with train params`
  },

  // React & Component Architecture
  {
    id: 'react-1',
    skill: 'React & Component Architecture',
    difficulty: 'Intermediate',
    question: 'In React 19, what is the primary purpose of the `useMemo` hook?',
    options: [
      'To trigger side-effects like data fetching when a component mounts',
      'To cache the result of an expensive calculation between re-renders when dependencies haven\'t changed',
      'To create global application context accessible by all child components',
      'To replace HTML local storage with RAM memory'
    ],
    correctIndex: 1,
    explanation: '`useMemo(calculateValue, dependencies)` memoizes expensive computational values so they are not re-calculated on every unrelated component re-render unless specified dependency variables change.',
    codeSnippet: `const visibleRecommendations = useMemo(() => {
  return filterAndRankCourses(allCourses, studentProfile, weights);
}, [allCourses, studentProfile, weights]);`
  },

  // RESTful API Architecture
  {
    id: 'api-1',
    skill: 'RESTful API & Service Architecture',
    difficulty: 'Beginner',
    question: 'Which HTTP method should be used for an endpoint that is idempotent and completely replaces an existing resource representation?',
    options: ['POST', 'PUT', 'PATCH', 'CONNECT'],
    correctIndex: 1,
    explanation: 'PUT is defined by HTTP specifications as idempotent (submitting the same payload multiple times results in the same resource state) and replaces the target entity entirely, unlike PATCH which applies partial modifications, or POST which creates new resources.',
    codeSnippet: `// PUT /api/students/:id/profile
app.put('/api/students/:id/profile', (req, res) => {
  // Replaces the complete profile resource
});`
  }
];
