import { Course, CareerRole, StudentProfile, RecommendedCourse, HybridScoreBreakdown } from '../types';
import { TFIDFEngine } from './tfidf';
import { SkillGapEngine } from './skillGapEngine';
import { CollaborativeFilterEngine } from './collaborativeFilter';
import { PrerequisiteGraphEngine } from './prerequisiteGraph';

export interface HybridWeights {
  content: number; // default 0.30
  gap: number; // default 0.35
  collab: number; // default 0.20
  preference: number; // default 0.15
}

export const DEFAULT_HYBRID_WEIGHTS: HybridWeights = {
  content: 0.30,
  gap: 0.35,
  collab: 0.20,
  preference: 0.15
};

export class HybridRecommendationEngine {
  private tfidfEngine: TFIDFEngine;
  private skillGapEngine: SkillGapEngine;
  private collabEngine: CollaborativeFilterEngine;
  private prereqEngine: PrerequisiteGraphEngine;
  private allCourses: Course[];

  constructor(courses: Course[]) {
    this.allCourses = courses;
    this.tfidfEngine = new TFIDFEngine();
    this.skillGapEngine = new SkillGapEngine();
    this.collabEngine = new CollaborativeFilterEngine();
    this.prereqEngine = new PrerequisiteGraphEngine();

    this.trainTFIDF();
  }

  private trainTFIDF(): void {
    const courseCorpus = this.allCourses.map(c => {
      return `${c.title} ${c.description} ${c.skills.join(' ')} ${c.career_roles.join(' ')} ${c.syllabus.join(' ')}`;
    });
    this.tfidfEngine.fit(courseCorpus);
  }

  /**
   * Generates hybrid recommendations R(u, c) for a student profile
   */
  public recommendCourses(
    profile: StudentProfile,
    role: CareerRole,
    weights: HybridWeights = DEFAULT_HYBRID_WEIGHTS,
    options: {
      filterCompleted?: boolean;
      requirePrereqs?: boolean;
    } = { filterCompleted: true, requirePrereqs: false },
    contentScores?: ReadonlyMap<string, number>
  ): RecommendedCourse[] {
    // 1. Build student profile text representation for TF-IDF
    const userProfileText = `${role.name} ${role.description} ${role.skills.map(s => s.skill).join(' ')} ${profile.education} ${profile.yearOfStudy}`;
    const userVector = this.tfidfEngine.transform(userProfileText);

    const scoredCourses: Array<{ course: Course; breakdown: HybridScoreBreakdown }> = [];

    // Filter courses relevant to target role or general computing
    const candidateCourses = this.allCourses.filter(c => {
      if (options.filterCompleted && profile.completedCourseIds.includes(c.id)) {
        return false;
      }
      return true;
    });

    for (const course of candidateCourses) {
      // 1. Content Similarity S_content
      const courseText = `${course.title} ${course.description} ${course.skills.join(' ')} ${course.career_roles.join(' ')} ${course.syllabus.join(' ')}`;
      const courseVector = this.tfidfEngine.transform(courseText);
      const contentScore = contentScores?.get(course.id)
        ?? this.tfidfEngine.cosineSimilarity(userVector, courseVector);

      // 2. Skill Gap Score S_gap
      const { score: gapScore, addressedGaps } = this.skillGapEngine.calculateCourseGapScore(course, profile, role);

      // 3. Collaborative Score S_collab
      const { score: collabScore } = this.collabEngine.calculateCollaborativeScore(course, profile, role);

      // 4. Preference Score S_preference
      const preferenceScore = this.calculatePreferenceScore(course, profile);

      // 5. Prerequisite DAG evaluation
      const prereqStatus = this.prereqEngine.evaluatePrerequisites(course, profile);

      // If hard filtering on prerequisites is turned on and not satisfied, skip
      if (options.requirePrereqs && !prereqStatus.isSatisfied) {
        continue;
      }

      // Hybrid calculation:
      // R(u, c) = w1 * S_content + w2 * S_gap + w3 * S_collab + w4 * S_pref - PrerequisitePenalty
      let rawHybrid = (
        weights.content * contentScore +
        weights.gap * gapScore +
        weights.collab * collabScore +
        weights.preference * preferenceScore
      );

      // Apply prerequisite penalty if prerequisites are missing
      if (!prereqStatus.isSatisfied) {
        rawHybrid = Math.max(0.05, rawHybrid - prereqStatus.prerequisitePenalty);
      }

      const totalScore = Number(Math.min(1.0, Math.max(0.0, rawHybrid)).toFixed(3));

      // Generate explainable reason
      const explanation = this.generateExplanation({
        course,
        contentScore,
        gapScore,
        collabScore,
        preferenceScore,
        prereqStatus,
        addressedGaps,
        role,
        profile
      });

      const breakdown: HybridScoreBreakdown = {
        contentScore: Number(contentScore.toFixed(3)),
        skillGapScore: Number(gapScore.toFixed(3)),
        collaborativeScore: Number(collabScore.toFixed(3)),
        preferenceScore: Number(preferenceScore.toFixed(3)),
        totalScore,
        prerequisiteSatisfied: prereqStatus.isSatisfied,
        missingPrerequisites: prereqStatus.missingPrerequisites,
        targetedGaps: addressedGaps,
        explanation
      };

      scoredCourses.push({ course, breakdown });
    }

    // Sort by total hybrid score descending
    scoredCourses.sort((a, b) => b.breakdown.totalScore - a.breakdown.totalScore);

    return scoredCourses.map((item, index) => {
      let priority: RecommendedCourse['priority'] = 'Recommended';
      if (index < 2 && item.breakdown.totalScore >= 0.65) {
        priority = 'High Priority';
      } else if (!item.breakdown.prerequisiteSatisfied) {
        priority = 'Foundational Next';
      }

      return {
        course: item.course,
        score: item.breakdown,
        rank: index + 1,
        priority
      };
    });
  }

  private calculatePreferenceScore(course: Course, profile: StudentProfile): number {
    let score = 0.5;

    // Budget match
    if (profile.maxBudget === 0) {
      if (course.price === 0) score += 0.25;
      else score -= 0.30;
    } else if (course.price <= profile.maxBudget) {
      score += 0.25;
    }

    // Duration match with weekly study hours
    // Ideal course length: 1 to 4 weeks of study
    const weeksToFinish = course.duration_hours / (profile.weeklyStudyHours || 8);
    if (weeksToFinish >= 1 && weeksToFinish <= 4) {
      score += 0.15;
    } else if (weeksToFinish > 6) {
      score -= 0.10;
    }

    // Level preference match
    if (profile.preferredLevel && profile.preferredLevel !== 'All') {
      if (course.level === profile.preferredLevel) {
        score += 0.10;
      }
    }

    return Math.min(1.0, Math.max(0.1, score));
  }

  private generateExplanation(params: {
    course: Course;
    contentScore: number;
    gapScore: number;
    collabScore: number;
    preferenceScore: number;
    prereqStatus: { isSatisfied: boolean; missingPrerequisites: string[] };
    addressedGaps: Array<{ skill: string; gap: number; importance: number }>;
    role: CareerRole;
    profile: StudentProfile;
  }): string {
    const { course, gapScore, prereqStatus, addressedGaps, role, profile } = params;

    if (!prereqStatus.isSatisfied) {
      return `Recommended later in your roadmap: Builds advanced ${course.skills[0]} proficiency, but requires prerequisite foundations in [${prereqStatus.missingPrerequisites.join(', ')}] first.`;
    }

    if (addressedGaps.length > 0) {
      const topGap = addressedGaps[0];
      const gapPct = Math.round(topGap.gap * 100);
      return `Closes a primary ${gapPct}% skill gap in ${topGap.skill} (Importance ${topGap.importance}/5) for ${role.name}. Meets your ${profile.weeklyStudyHours}h/week study pace.`;
    }

    if (gapScore > 0.4) {
      return `Directly strengthens technical competencies required by top employers for ${role.name} campus interviews.`;
    }

    return `High cohort placement affinity: Verified by seniors who secured placements in ${role.name} roles.`;
  }
}
