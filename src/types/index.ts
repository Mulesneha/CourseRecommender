export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Course {
  id: string;
  title: string;
  provider: string;
  description: string;
  skills: string[];
  level: DifficultyLevel;
  duration_hours: number;
  price: number; // 0 for free
  rating: number; // 1.0 - 5.0
  review_count: number;
  prerequisites: string[]; // skill or course prerequisites
  career_roles: string[];
  url: string;
  syllabus: string[];
  practical_projects: string[];
}

export interface SkillRequirement {
  skill: string;
  importance: number; // 1 - 5
  targetMastery: number; // 0.0 - 1.0 (e.g. 0.85 = 85%)
  category: 'core' | 'framework' | 'tools' | 'interview';
  description: string;
}

export interface CareerRole {
  id: string;
  name: string;
  category: string;
  description: string;
  medianSalary: string;
  hiringOutlook: string;
  skills: SkillRequirement[];
  recommendedPrereqOrder: string[];
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  education: string;
  yearOfStudy: string;
  targetRoleId: string;
  weeklyStudyHours: number;
  weeksUntilPlacement: number;
  maxBudget: number; // 0 for free only, or budget cap
  preferredLevel: DifficultyLevel | 'All';
  currentMastery: Record<string, number>; // skill -> 0.0 - 1.0
  enrolledCourseIds: string[];
  completedCourseIds: string[];
  bookmarkedCourseIds: string[];
  completedQuizzes: Array<{
    skill: string;
    score: number; // 0.0 - 1.0
    date: string;
    oldMastery: number;
    newMastery: number;
  }>;
}

export interface HybridScoreBreakdown {
  contentScore: number; // S_content (0 - 1)
  skillGapScore: number; // S_gap (0 - 1)
  collaborativeScore: number; // S_collab (0 - 1)
  preferenceScore: number; // S_preference (0 - 1)
  totalScore: number; // R(u,c) (0 - 1)
  prerequisiteSatisfied: boolean;
  missingPrerequisites: string[];
  targetedGaps: Array<{ skill: string; gap: number; importance: number }>;
  explanation: string;
}

export interface RecommendedCourse {
  course: Course;
  score: HybridScoreBreakdown;
  rank: number;
  priority: 'High Priority' | 'Recommended' | 'Foundational Next';
}

export interface QuizQuestion {
  id: string;
  skill: string;
  difficulty: DifficultyLevel;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  codeSnippet?: string;
}

export interface PlacementReadiness {
  overallScore: number; // 0 - 100
  status: 'Needs Preparation' | 'Approaching Readiness' | 'Placement Ready' | 'Highly Competitive';
  breakdown: {
    coreSkillMastery: number; // 40%
    roleCoverage: number; // 30%
    projectProof: number; // 20%
    assessmentRigor: number; // 10%
  };
  highPriorityGaps: string[];
  estimatedWeeksNeeded: number;
  summary: string;
}

export interface ModelComparisonResult {
  modelName: string;
  precisionAt5: number;
  recallAt5: number;
  ndcgAt5: number;
  prerequisiteViolationRate: number; // percentage (lower is better, ideally 0%)
  adaptationResponsiveness: number; // score 0 - 100
  avgSkillGapClosed: number; // percentage
  description: string;
}

export interface WeeklyMilestone {
  week: number;
  title: string;
  focusSkills: string[];
  allocatedHours: number;
  courseAssignments: Course[];
  practicalTask: string;
  isCurrent: boolean;
  isCompleted: boolean;
}
