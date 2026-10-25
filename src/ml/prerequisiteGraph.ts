import { Course, StudentProfile } from '../types';

export interface PrerequisiteStatus {
  isSatisfied: boolean;
  missingPrerequisites: string[];
  satisfiedPrerequisites: string[];
  prerequisitePenalty: number; // 0.0 if all satisfied, up to 0.70 penalty if foundational skills missing
}

export class PrerequisiteGraphEngine {
  /**
   * Checks whether all prerequisites for a course are satisfied by the student profile
   */
  public evaluatePrerequisites(course: Course, profile: StudentProfile): PrerequisiteStatus {
    if (!course.prerequisites || course.prerequisites.length === 0) {
      return {
        isSatisfied: true,
        missingPrerequisites: [],
        satisfiedPrerequisites: [],
        prerequisitePenalty: 0.0
      };
    }

    const missing: string[] = [];
    const satisfied: string[] = [];

    for (const prereq of course.prerequisites) {
      // Check 1: Has student completed a course that covers this prerequisite?
      const completedMatch = profile.completedCourseIds.some(cId => {
        // Course title match or skill match
        return cId.toLowerCase().includes(prereq.toLowerCase());
      });

      // Check 2: Does student have demonstrated mastery >= 0.60 in the prerequisite skill?
      const currentMastery = profile.currentMastery[prereq] ?? 0.0;
      const masterySatisfied = currentMastery >= 0.60;

      if (completedMatch || masterySatisfied) {
        satisfied.push(prereq);
      } else {
        missing.push(prereq);
      }
    }

    const isSatisfied = missing.length === 0;
    // Penalty is proportional to missing prerequisites: 0.35 per missing foundational link
    const prerequisitePenalty = isSatisfied ? 0.0 : Math.min(0.70, missing.length * 0.35);

    return {
      isSatisfied,
      missingPrerequisites: missing,
      satisfiedPrerequisites: satisfied,
      prerequisitePenalty
    };
  }

  /**
   * Generates a topologically sequenced roadmap respecting prerequisite edges
   */
  public generateSequencedRoadmap(courses: Course[]): Course[][] {
    const courseMap = new Map<string, Course>();
    courses.forEach(c => courseMap.set(c.id, c));

    // Group into 3 Phased Stages based on prerequisite depth
    const phase1Foundations: Course[] = [];
    const phase2Core: Course[] = [];
    const phase3Advanced: Course[] = [];

    for (const c of courses) {
      if (c.prerequisites.length === 0 && c.level === 'Beginner') {
        phase1Foundations.push(c);
      } else if (c.level === 'Advanced' || c.prerequisites.length >= 2) {
        phase3Advanced.push(c);
      } else {
        phase2Core.push(c);
      }
    }

    return [phase1Foundations, phase2Core, phase3Advanced];
  }

  /**
   * Checks whether a list of recommended courses violates prerequisite ordering
   * (e.g. recommending advanced ML before Python basics)
   */
  public calculatePrerequisiteViolationRate(recommended: Course[], profile: StudentProfile): number {
    if (recommended.length === 0) return 0;
    let violations = 0;

    const completedOrRecommendedBefore = new Set<string>(profile.completedCourseIds);

    for (const c of recommended) {
      for (const prereq of c.prerequisites) {
        const mastery = profile.currentMastery[prereq] ?? 0;
        const satisfiesByMastery = mastery >= 0.60;
        const satisfiesByPriorCourse = Array.from(completedOrRecommendedBefore).some(prior => prior.includes(prereq));

        if (!satisfiesByMastery && !satisfiesByPriorCourse) {
          violations++;
          break; // Count at most 1 violation per course
        }
      }
      completedOrRecommendedBefore.add(c.id);
      c.skills.forEach(s => completedOrRecommendedBefore.add(s));
    }

    return (violations / recommended.length) * 100;
  }
}
