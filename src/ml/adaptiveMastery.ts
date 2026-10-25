import { CareerRole, StudentProfile, PlacementReadiness } from '../types';

/**
 * Adaptive Mastery Estimator & Placement Readiness Calculator
 * Algorithm 5 from NextCourse specification:
 * M_new = alpha * Q + (1 - alpha) * M_old
 * Plus Bayesian Knowledge Tracing (BKT) comparison
 */

export interface BKTParameters {
  priorL0: number; // Initial mastery probability P(L0)
  transitionT: number; // Probability of learning during attempt P(T)
  guessG: number; // Probability of guessing correctly without mastery P(G)
  slipS: number; // Probability of slipping despite mastery P(S)
}

export const DEFAULT_BKT_PARAMS: BKTParameters = {
  priorL0: 0.35,
  transitionT: 0.15,
  guessG: 0.25,
  slipS: 0.10
};

export class AdaptiveMasteryEngine {
  /**
   * Smoothed Mastery Update Formula:
   * M_new = alpha * Q + (1 - alpha) * M_old
   * @param oldMastery M_old (0.0 - 1.0)
   * @param quizScore Q (0.0 - 1.0)
   * @param alpha Learning rate (default 0.30)
   */
  public updateSmoothedMastery(
    oldMastery: number,
    quizScore: number,
    alpha: number = 0.30
  ): {
    newMastery: number;
    delta: number;
    formulaExplanation: string;
  } {
    const clampedQ = Math.min(1.0, Math.max(0.0, quizScore));
    const clampedOld = Math.min(1.0, Math.max(0.0, oldMastery));
    const newMastery = Number((alpha * clampedQ + (1 - alpha) * clampedOld).toFixed(3));
    const delta = Number((newMastery - clampedOld).toFixed(3));

    const formulaExplanation = `M_new = ${alpha.toFixed(2)} × ${clampedQ.toFixed(2)} + (1 - ${alpha.toFixed(2)}) × ${clampedOld.toFixed(2)} = ${newMastery.toFixed(2)}`;

    return {
      newMastery,
      delta,
      formulaExplanation
    };
  }

  /**
   * Bayesian Knowledge Tracing (BKT) estimation
   * P(L_t | obs) and P(L_{t+1})
   */
  public updateBKTMastery(
    currentP: number,
    isCorrect: boolean,
    params: BKTParameters = DEFAULT_BKT_PARAMS
  ): {
    posteriorL: number;
    nextL: number;
  } {
    const { transitionT, guessG, slipS } = params;
    let posterior = 0;

    if (isCorrect) {
      // P(L | correct) = (P(L) * (1 - S)) / (P(L) * (1 - S) + (1 - P(L)) * G)
      const num = currentP * (1 - slipS);
      const denom = num + (1 - currentP) * guessG;
      posterior = num / (denom || 1);
    } else {
      // P(L | incorrect) = (P(L) * S) / (P(L) * S + (1 - P(L)) * (1 - G))
      const num = currentP * slipS;
      const denom = num + (1 - currentP) * (1 - guessG);
      posterior = num / (denom || 1);
    }

    // P(L_{t+1}) = posterior + (1 - posterior) * P(T)
    const nextL = posterior + (1 - posterior) * transitionT;

    return {
      posteriorL: Number(posterior.toFixed(3)),
      nextL: Number(Math.min(1.0, nextL).toFixed(3))
    };
  }

  /**
   * Calculates comprehensive Placement Readiness Score:
   * 40% Core Skill Mastery + 30% Role Skill Coverage + 20% Practical Projects + 10% Assessment Rigor
   */
  public calculatePlacementReadiness(profile: StudentProfile, role: CareerRole): PlacementReadiness {
    const roleSkills = role.skills;
    if (roleSkills.length === 0) {
      return {
        overallScore: 0,
        status: 'Needs Preparation',
        breakdown: { coreSkillMastery: 0, roleCoverage: 0, projectProof: 0, assessmentRigor: 0 },
        highPriorityGaps: [],
        estimatedWeeksNeeded: 12,
        summary: 'Target role not specified.'
      };
    }

    let weightedMasterySum = 0;
    let totalImportance = 0;
    let coveredSkillsCount = 0;
    const highPriorityGaps: string[] = [];

    for (const req of roleSkills) {
      const current = profile.currentMastery[req.skill] ?? 0.0;
      weightedMasterySum += current * req.importance;
      totalImportance += req.importance;

      if (current >= 0.50) {
        coveredSkillsCount++;
      }

      const gap = Math.max(0, req.targetMastery - current);
      if (gap >= 0.25 && req.importance >= 4) {
        highPriorityGaps.push(req.skill);
      }
    }

    // Component 1: Core Skill Mastery (40% weight) -> 0 to 40
    const avgWeightedMastery = totalImportance > 0 ? (weightedMasterySum / totalImportance) : 0;
    const coreSkillMastery = Math.round(avgWeightedMastery * 40);

    // Component 2: Role Skill Coverage (30% weight) -> 0 to 30
    const coverageRatio = coveredSkillsCount / roleSkills.length;
    const roleCoverage = Math.round(coverageRatio * 30);

    // Component 3: Project Proof & Completed Courses (20% weight) -> 0 to 20
    const completedCount = profile.completedCourseIds.length;
    const projectProof = Math.min(20, Math.round((completedCount / 4) * 20));

    // Component 4: Assessment Rigor & Quizzes Taken (10% weight) -> 0 to 10
    const quizzesCount = profile.completedQuizzes.length;
    const assessmentRigor = Math.min(10, Math.round((quizzesCount / 3) * 10));

    const overallScore = Math.min(100, coreSkillMastery + roleCoverage + projectProof + assessmentRigor);

    let status: PlacementReadiness['status'] = 'Needs Preparation';
    if (overallScore >= 80) {
      status = 'Highly Competitive';
    } else if (overallScore >= 65) {
      status = 'Placement Ready';
    } else if (overallScore >= 45) {
      status = 'Approaching Readiness';
    }

    // Estimate weeks required based on study hours and gaps
    const remainingGapSum = roleSkills.reduce((acc, req) => {
      return acc + Math.max(0, req.targetMastery - (profile.currentMastery[req.skill] ?? 0));
    }, 0);
    const studyHours = profile.weeklyStudyHours || 8;
    const estimatedWeeksNeeded = Math.max(2, Math.ceil((remainingGapSum * 45) / studyHours));

    const summary = status === 'Highly Competitive'
      ? `Strong placement profile for ${role.name}. Exceptional foundation across key interview skills.`
      : status === 'Placement Ready'
      ? `Well-prepared for ${role.name} campus drives. Prioritize interview coding drills and final projects.`
      : status === 'Approaching Readiness'
      ? `Solid progression. Close ${highPriorityGaps.length > 0 ? highPriorityGaps.slice(0, 2).join(', ') : 'core'} skill gaps to enter the ready bracket.`
      : `Preparation underway. Focus on prerequisite foundations before tackling advanced technical interview rounds.`;

    return {
      overallScore,
      status,
      breakdown: {
        coreSkillMastery,
        roleCoverage,
        projectProof,
        assessmentRigor
      },
      highPriorityGaps,
      estimatedWeeksNeeded,
      summary
    };
  }
}
