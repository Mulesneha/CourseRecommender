import { Course, CareerRole, StudentProfile } from '../types';

export interface SkillGapItem {
  skill: string;
  importance: number; // 1 - 5
  targetMastery: number; // T_s
  currentMastery: number; // M_{u,s}
  gap: number; // G(u,s) = max(0, T_s - M_{u,s})
  category: string;
  isStrength: boolean;
  priorityScore: number; // w_s * G(u,s)
}

export class SkillGapEngine {
  /**
   * Calculates individual skill gaps G(u, s) = max(0, T_s - M_{u,s})
   * Ranked by job relevance (w_s) and gap size.
   */
  public calculateSkillGaps(profile: StudentProfile, role: CareerRole): SkillGapItem[] {
    const gaps: SkillGapItem[] = role.skills.map(req => {
      const current = profile.currentMastery[req.skill] ?? 0.0;
      const target = req.targetMastery;
      const gap = Math.max(0, target - current);
      const isStrength = current >= target * 0.9;
      const priorityScore = req.importance * gap;

      return {
        skill: req.skill,
        importance: req.importance,
        targetMastery: target,
        currentMastery: current,
        gap,
        category: req.category,
        isStrength,
        priorityScore
      };
    });

    // Sort by priorityScore descending (highest weighted gap first)
    return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  /**
   * Evaluates how well a course addresses the user's role-specific skill gaps:
   * S_gap(u, c) = sum(w_s * G(u,s) * A(c,s)) / sum(w_s * G(u,s))
   */
  public calculateCourseGapScore(
    course: Course,
    profile: StudentProfile,
    role: CareerRole
  ): {
    score: number;
    addressedGaps: Array<{ skill: string; gap: number; importance: number }>;
  } {
    const gaps = this.calculateSkillGaps(profile, role);
    let totalWeightedGap = 0;
    let coveredWeightedGap = 0;
    const addressedGaps: Array<{ skill: string; gap: number; importance: number }> = [];

    for (const g of gaps) {
      const weight = g.importance;
      const gapVal = g.gap;
      const weightedGap = weight * gapVal;
      totalWeightedGap += weightedGap;

      if (gapVal > 0.05) {
        const coverage = this.measureCourseCoverage(course, g.skill);
        if (coverage > 0) {
          coveredWeightedGap += weightedGap * coverage;
          addressedGaps.push({
            skill: g.skill,
            gap: gapVal,
            importance: g.importance
          });
        }
      }
    }

    if (totalWeightedGap === 0) {
      // If student has zero gaps (all mastered), fallback score
      return { score: 0.1, addressedGaps: [] };
    }

    const rawScore = coveredWeightedGap / totalWeightedGap;
    // Normalize to 0 - 1
    const normalizedScore = Math.min(1.0, Math.max(0.0, rawScore));

    return {
      score: normalizedScore,
      addressedGaps
    };
  }

  /**
   * Measures coverage A(c, s) in [0, 1]
   */
  private measureCourseCoverage(course: Course, targetSkill: string): number {
    const sLower = targetSkill.toLowerCase();
    
    // Exact primary skill match
    if (course.skills.some(s => s.toLowerCase() === sLower)) {
      return 1.0;
    }

    // Partial primary skill match (e.g. 'Python' in 'Python for Data Science')
    if (course.skills.some(s => s.toLowerCase().includes(sLower) || sLower.includes(s.toLowerCase()))) {
      return 0.85;
    }

    // Syllabus coverage match
    const inSyllabus = course.syllabus.some(topic => topic.toLowerCase().includes(sLower));
    if (inSyllabus) {
      return 0.65;
    }

    // Description match
    if (course.description.toLowerCase().includes(sLower)) {
      return 0.45;
    }

    return 0.0;
  }
}
