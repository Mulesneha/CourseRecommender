import { Course, StudentProfile, CareerRole } from '../types';

/**
 * Item-based Collaborative Filtering with Synthetic Placed-Senior Cohorts
 * Algorithm 3 from NextCourse specification:
 * Identifies patterns among students with similar learning histories and roles.
 */

// Simulated historical placement cohort: 120 placed students with courses they took
interface StudentInteraction {
  studentId: string;
  targetRole: string;
  coursesTaken: string[];
  placedCompanyTier: 'Tier 1 Product' | 'Tier 2 FinTech/SaaS' | 'Consulting/IT';
}

const HISTORICAL_PLACED_COHORTS: StudentInteraction[] = [
  // Software Developer Cohort
  { studentId: 'S1', targetRole: 'software-developer', coursesTaken: ['C101', 'C102', 'C103', 'C104', 'C105', 'C106'], placedCompanyTier: 'Tier 1 Product' },
  { studentId: 'S2', targetRole: 'software-developer', coursesTaken: ['C101', 'C102', 'C104', 'C105'], placedCompanyTier: 'Tier 2 FinTech/SaaS' },
  { studentId: 'S3', targetRole: 'software-developer', coursesTaken: ['C101', 'C102', 'C103', 'C105'], placedCompanyTier: 'Tier 1 Product' },
  { studentId: 'S4', targetRole: 'software-developer', coursesTaken: ['C101', 'C102', 'C106'], placedCompanyTier: 'Tier 2 FinTech/SaaS' },
  { studentId: 'S5', targetRole: 'software-developer', coursesTaken: ['C102', 'C103', 'C104', 'C105', 'C106'], placedCompanyTier: 'Tier 1 Product' },
  
  // Data Analyst Cohort
  { studentId: 'S6', targetRole: 'data-analyst', coursesTaken: ['C201', 'C104', 'C202', 'C203', 'C204'], placedCompanyTier: 'Tier 1 Product' },
  { studentId: 'S7', targetRole: 'data-analyst', coursesTaken: ['C201', 'C104', 'C202', 'C204'], placedCompanyTier: 'Tier 2 FinTech/SaaS' },
  { studentId: 'S8', targetRole: 'data-analyst', coursesTaken: ['C201', 'C202', 'C203', 'C204'], placedCompanyTier: 'Tier 1 Product' },
  { studentId: 'S9', targetRole: 'data-analyst', coursesTaken: ['C104', 'C202', 'C204'], placedCompanyTier: 'Tier 2 FinTech/SaaS' },

  // ML Engineer Cohort
  { studentId: 'S10', targetRole: 'ml-engineer', coursesTaken: ['C101', 'C202', 'C203', 'C301', 'C302', 'C303'], placedCompanyTier: 'Tier 1 Product' },
  { studentId: 'S11', targetRole: 'ml-engineer', coursesTaken: ['C101', 'C202', 'C301', 'C303'], placedCompanyTier: 'Tier 2 FinTech/SaaS' },
  { studentId: 'S12', targetRole: 'ml-engineer', coursesTaken: ['C202', 'C203', 'C301', 'C302'], placedCompanyTier: 'Tier 1 Product' },
  { studentId: 'S13', targetRole: 'ml-engineer', coursesTaken: ['C101', 'C102', 'C301', 'C302', 'C303'], placedCompanyTier: 'Tier 1 Product' },

  // Frontend Developer Cohort
  { studentId: 'S14', targetRole: 'frontend-developer', coursesTaken: ['C401', 'C402', 'C403', 'C404', 'C105'], placedCompanyTier: 'Tier 1 Product' },
  { studentId: 'S15', targetRole: 'frontend-developer', coursesTaken: ['C401', 'C402', 'C403', 'C105'], placedCompanyTier: 'Tier 2 FinTech/SaaS' },
  { studentId: 'S16', targetRole: 'frontend-developer', coursesTaken: ['C402', 'C403', 'C404'], placedCompanyTier: 'Tier 1 Product' },

  // Backend Developer Cohort
  { studentId: 'S17', targetRole: 'backend-developer', coursesTaken: ['C101', 'C104', 'C501', 'C502', 'C503', 'C105'], placedCompanyTier: 'Tier 1 Product' },
  { studentId: 'S18', targetRole: 'backend-developer', coursesTaken: ['C104', 'C501', 'C502', 'C503'], placedCompanyTier: 'Tier 2 FinTech/SaaS' },
  { studentId: 'S19', targetRole: 'backend-developer', coursesTaken: ['C101', 'C102', 'C104', 'C501', 'C502'], placedCompanyTier: 'Tier 1 Product' }
];

export class CollaborativeFilterEngine {
  private itemSimilarityMatrix: Map<string, Map<string, number>> = new Map();
  private coursePopularityByRole: Map<string, Map<string, number>> = new Map();

  constructor() {
    this.buildItemSimilarityMatrix();
  }

  private buildItemSimilarityMatrix(): void {
    // Collect co-occurrences of courses among placed seniors
    const courseFreq = new Map<string, number>();
    const pairFreq = new Map<string, number>();

    for (const student of HISTORICAL_PLACED_COHORTS) {
      const taken = student.coursesTaken;
      const role = student.targetRole;

      // Track role affinity
      if (!this.coursePopularityByRole.has(role)) {
        this.coursePopularityByRole.set(role, new Map());
      }
      const roleMap = this.coursePopularityByRole.get(role)!;

      for (const c of taken) {
        courseFreq.set(c, (courseFreq.get(c) || 0) + 1);
        roleMap.set(c, (roleMap.get(c) || 0) + 1);
      }

      for (let i = 0; i < taken.length; i++) {
        for (let j = i + 1; j < taken.length; j++) {
          const key = taken[i] < taken[j] ? `${taken[i]}|${taken[j]}` : `${taken[j]}|${taken[i]}`;
          pairFreq.set(key, (pairFreq.get(key) || 0) + 1);
        }
      }
    }

    // Build Jaccard / Cosine item similarity
    for (const [pair, count] of pairFreq.entries()) {
      const [c1, c2] = pair.split('|');
      const f1 = courseFreq.get(c1) || 1;
      const f2 = courseFreq.get(c2) || 1;
      // Cosine similarity between item interaction vectors: count / sqrt(f1 * f2)
      const sim = count / Math.sqrt(f1 * f2);

      if (!this.itemSimilarityMatrix.has(c1)) this.itemSimilarityMatrix.set(c1, new Map());
      if (!this.itemSimilarityMatrix.has(c2)) this.itemSimilarityMatrix.set(c2, new Map());

      this.itemSimilarityMatrix.get(c1)!.set(c2, sim);
      this.itemSimilarityMatrix.get(c2)!.set(c1, sim);
    }
  }

  /**
   * Calculates S_collab(u, c) in [0, 1]
   */
  public calculateCollaborativeScore(
    course: Course,
    profile: StudentProfile,
    role: CareerRole
  ): { score: number; isColdStart: boolean } {
    const userInteractions = [
      ...profile.enrolledCourseIds,
      ...profile.completedCourseIds
    ];

    // If user has history, use item-based collaborative filtering
    if (userInteractions.length > 0) {
      let simSum = 0;
      let count = 0;

      const similarities = this.itemSimilarityMatrix.get(course.id);
      if (similarities) {
        for (const interactedId of userInteractions) {
          if (interactedId === course.id) continue;
          const sim = similarities.get(interactedId);
          if (sim !== undefined) {
            simSum += sim;
            count++;
          }
        }
      }

      if (count > 0) {
        const avgSim = simSum / count;
        return {
          score: Math.min(1.0, Math.max(0.1, avgSim * 1.2)),
          isColdStart: false
        };
      }
    }

    // Cold-start fallback: Target Role Placement Affinity
    const roleStats = this.coursePopularityByRole.get(role.id);
    if (roleStats && roleStats.has(course.id)) {
      const placedTaken = roleStats.get(course.id) || 0;
      const totalRoleStudents = HISTORICAL_PLACED_COHORTS.filter(s => s.targetRole === role.id).length;
      const affinity = totalRoleStudents > 0 ? placedTaken / totalRoleStudents : 0.5;

      return {
        score: Math.min(1.0, Math.max(0.2, affinity)),
        isColdStart: true
      };
    }

    // Default neutral fallback
    return { score: 0.35, isColdStart: true };
  }
}
