import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { 
  StudentProfile, 
  CareerRole, 
  Course, 
  RecommendedCourse, 
  PlacementReadiness, 
  WeeklyMilestone 
} from '../types';
import { CAREER_ROLES } from '../data/careerRolesData';
import { COURSES_DATA } from '../data/coursesData';
import { HybridRecommendationEngine, HybridWeights, DEFAULT_HYBRID_WEIGHTS } from '../ml/hybridRecommender';
import { AdaptiveMasteryEngine } from '../ml/adaptiveMastery';
import { PrerequisiteGraphEngine } from '../ml/prerequisiteGraph';
import { WeeklyScheduler } from '../ml/weeklyScheduler';

interface StudentContextType {
  profile: StudentProfile;
  activeRole: CareerRole;
  allRoles: CareerRole[];
  allCourses: Course[];
  recommendedCourses: RecommendedCourse[];
  recommendationsLoading: boolean;
  recommendationError: string | null;
  readiness: PlacementReadiness;
  weeklyPlan: WeeklyMilestone[];
  weights: HybridWeights;
  alpha: number; // learning rate for adaptive quiz updates
  setAlpha: (val: number) => void;
  setWeights: (weights: HybridWeights) => void;
  setTargetRole: (roleId: string) => void;
  updateProfileIdentity: (name: string, email: string) => void;
  updateStudyPreferences: (hours: number, weeks: number) => void;
  updateSkillMastery: (skill: string, mastery: number) => void;
  submitQuizResult: (skill: string, score: number) => { oldMastery: number; newMastery: number; formula: string };
  toggleEnrollCourse: (courseId: string) => void;
  toggleCompleteCourse: (courseId: string) => void;
  toggleBookmarkCourse: (courseId: string) => void;
  resetToSampleProfile: () => void;
}

// Initial Sample Profile matching Section 6 of prompt:
// Computer Science student, 3rd year, Target: Software Developer, 8h/week, 12 weeks
const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: 'student-sneha-mule',
  name: 'Sneha Mule',
  email: 'sneha2006mule@gmail.com',
  education: 'B.Tech in Computer Science',
  yearOfStudy: '3rd Year (Pre-Final)',
  targetRoleId: 'software-developer',
  weeklyStudyHours: 8,
  weeksUntilPlacement: 12,
  maxBudget: 0, // prefers verified open access / free courses
  preferredLevel: 'All',
  currentMastery: {
    'Programming Fundamentals': 0.75,
    'Data Structures & Algorithms': 0.35,
    'Database Management Systems': 0.45,
    'Object-Oriented Programming': 0.65,
    'Git & Version Control': 0.30,
    'System Design Basics': 0.20,
    // Other roles default baseline
    'SQL & Relational Databases': 0.45,
    'Applied Statistics': 0.30,
    'Python for Data Science': 0.40,
    'Data Visualization & BI': 0.25,
    'Excel & Spreadsheet Modeling': 0.50,
    'Classical Machine Learning': 0.20,
    'Model Evaluation & Deployment': 0.15,
    'JavaScript Fundamentals & ES6+': 0.45,
    'React & Component Architecture': 0.30,
    'RESTful API & Service Architecture': 0.35
  },
  enrolledCourseIds: ['C101'],
  completedCourseIds: ['C101'], // Completed Programming Fundamentals
  bookmarkedCourseIds: ['C102', 'C104'],
  completedQuizzes: [
    {
      skill: 'Programming Fundamentals',
      score: 0.85,
      date: '2026-10-15',
      oldMastery: 0.65,
      newMastery: 0.75
    }
  ]
};

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const isCourseScore = (item: unknown): item is { id: string; score: number } =>
  typeof item === 'object'
  && item !== null
  && 'id' in item
  && typeof item.id === 'string'
  && 'score' in item
  && typeof item.score === 'number'
  && Number.isFinite(item.score);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('nextcourse_student_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure name is Sneha Mule
        if (parsed.name === 'Alex Chen' || !parsed.name) {
          parsed.name = 'Sneha Mule';
          parsed.email = 'sneha2006mule@gmail.com';
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_STUDENT_PROFILE;
  });

  const [weights, setWeights] = useState<HybridWeights>(DEFAULT_HYBRID_WEIGHTS);
  const [alpha, setAlpha] = useState<number>(0.30); // spec default

  // Save profile to local storage on changes
  useEffect(() => {
    localStorage.setItem('nextcourse_student_profile', JSON.stringify(profile));
  }, [profile]);

  const activeRole = useMemo(() => {
    return CAREER_ROLES.find(r => r.id === profile.targetRoleId) || CAREER_ROLES[0];
  }, [profile.targetRoleId]);

  const hybridEngine = useMemo(() => {
    return new HybridRecommendationEngine(COURSES_DATA);
  }, []);

  const adaptiveEngine = useMemo(() => {
    return new AdaptiveMasteryEngine();
  }, []);

  const weeklyScheduler = useMemo(() => {
    return new WeeklyScheduler();
  }, []);

  // Compute recommendations
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const learnerProfile = [
      activeRole.name,
      activeRole.description,
      activeRole.skills.map(skill => `${skill.skill} ${skill.description}`).join(' '),
      profile.education,
      profile.yearOfStudy
    ].join(' ');

    setRecommendationsLoading(true);
    setRecommendationError(null);

    const loadRecommendations = async () => {
      try {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courses: COURSES_DATA,
            learner_profile: learnerProfile
          }),
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Recommendation API returned HTTP ${response.status}`);
        }

        const payload: unknown = await response.json();
        if (!Array.isArray(payload) || !payload.every(isCourseScore)) {
          throw new Error('Recommendation API returned an invalid response');
        }

        const contentScores = new Map<string, number>(
          payload.map(item => [item.id, item.score] as const)
        );
        setRecommendedCourses(
          hybridEngine.recommendCourses(profile, activeRole, weights, undefined, contentScores)
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Unknown error';
        setRecommendationError(
          `Python API unavailable (${message}). Showing local recommendations for now. To enable Python TF-IDF, install dependencies with "python -m pip install -r python\\requirements.txt", then run "npm run dev:api" in a second terminal.`
        );
        setRecommendedCourses(
          hybridEngine.recommendCourses(profile, activeRole, weights)
        );
      } finally {
        if (!controller.signal.aborted) setRecommendationsLoading(false);
      }
    };

    void loadRecommendations();
    return () => controller.abort();
  }, [hybridEngine, profile, activeRole, weights]);

  // Compute readiness
  const readiness = useMemo(() => {
    return adaptiveEngine.calculatePlacementReadiness(profile, activeRole);
  }, [adaptiveEngine, profile, activeRole]);

  // Compute weekly plan
  const weeklyPlan = useMemo(() => {
    const ordered = recommendedCourses.map(r => r.course);
    return weeklyScheduler.generateWeeklyPlan(profile, activeRole, ordered);
  }, [weeklyScheduler, profile, activeRole, recommendedCourses]);

  const setTargetRole = (roleId: string) => {
    setProfile(prev => ({
      ...prev,
      targetRoleId: roleId
    }));
  };

  const updateProfileIdentity = (name: string, email: string) => {
    setProfile(prev => ({ ...prev, name, email }));
  };

  const updateStudyPreferences = (weeklyStudyHours: number, weeksUntilPlacement: number) => {
    setProfile(prev => ({
      ...prev,
      weeklyStudyHours,
      weeksUntilPlacement
    }));
  };

  const updateSkillMastery = (skill: string, mastery: number) => {
    setProfile(prev => ({
      ...prev,
      currentMastery: {
        ...prev.currentMastery,
        [skill]: Number(Math.min(1.0, Math.max(0.0, mastery)).toFixed(2))
      }
    }));
  };

  const submitQuizResult = (skill: string, score: number) => {
    const oldMastery = profile.currentMastery[skill] ?? 0.35;
    const { newMastery, formulaExplanation } = adaptiveEngine.updateSmoothedMastery(oldMastery, score, alpha);

    setProfile(prev => ({
      ...prev,
      currentMastery: {
        ...prev.currentMastery,
        [skill]: newMastery
      },
      completedQuizzes: [
        {
          skill,
          score,
          date: new Date().toISOString().split('T')[0],
          oldMastery,
          newMastery
        },
        ...prev.completedQuizzes
      ]
    }));

    return { oldMastery, newMastery, formula: formulaExplanation };
  };

  const toggleEnrollCourse = (courseId: string) => {
    setProfile(prev => {
      const isEnrolled = prev.enrolledCourseIds.includes(courseId);
      return {
        ...prev,
        enrolledCourseIds: isEnrolled
          ? prev.enrolledCourseIds.filter(id => id !== courseId)
          : [...prev.enrolledCourseIds, courseId]
      };
    });
  };

  const toggleCompleteCourse = (courseId: string) => {
    setProfile(prev => {
      const isCompleted = prev.completedCourseIds.includes(courseId);
      const newCompleted = isCompleted
        ? prev.completedCourseIds.filter(id => id !== courseId)
        : [...prev.completedCourseIds, courseId];

      // If completing, boost skills covered by this course
      const course = COURSES_DATA.find(c => c.id === courseId);
      const updatedMastery = { ...prev.currentMastery };
      if (!isCompleted && course) {
        course.skills.forEach(s => {
          updatedMastery[s] = Math.min(1.0, (updatedMastery[s] || 0.4) + 0.30);
        });
      }

      return {
        ...prev,
        completedCourseIds: newCompleted,
        currentMastery: updatedMastery
      };
    });
  };

  const toggleBookmarkCourse = (courseId: string) => {
    setProfile(prev => {
      const isBookmarked = prev.bookmarkedCourseIds.includes(courseId);
      return {
        ...prev,
        bookmarkedCourseIds: isBookmarked
          ? prev.bookmarkedCourseIds.filter(id => id !== courseId)
          : [...prev.bookmarkedCourseIds, courseId]
      };
    });
  };

  const resetToSampleProfile = () => {
    setProfile(INITIAL_STUDENT_PROFILE);
    setWeights(DEFAULT_HYBRID_WEIGHTS);
    setAlpha(0.30);
  };

  return (
    <StudentContext.Provider
      value={{
        profile,
        activeRole,
        allRoles: CAREER_ROLES,
        allCourses: COURSES_DATA,
        recommendedCourses,
        recommendationsLoading,
        recommendationError,
        readiness,
        weeklyPlan,
        weights,
        alpha,
        setAlpha,
        setWeights,
        setTargetRole,
        updateProfileIdentity,
        updateStudyPreferences,
        updateSkillMastery,
        submitQuizResult,
        toggleEnrollCourse,
        toggleCompleteCourse,
        toggleBookmarkCourse,
        resetToSampleProfile
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
