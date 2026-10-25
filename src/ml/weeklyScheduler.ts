import { Course, CareerRole, StudentProfile, WeeklyMilestone } from '../types';

export class WeeklyScheduler {
  /**
   * Generates week-by-week structured curriculum based on hours/week and weeks until placement
   */
  public generateWeeklyPlan(
    profile: StudentProfile,
    role: CareerRole,
    orderedCourses: Course[]
  ): WeeklyMilestone[] {
    const totalWeeks = Math.max(4, Math.min(24, profile.weeksUntilPlacement || 12));
    const weeklyHours = profile.weeklyStudyHours || 8;
    const milestones: WeeklyMilestone[] = [];

    // Distribute courses across the weeks
    let currentCourseIndex = 0;
    let accumulatedCourseHours = 0;

    for (let w = 1; w <= totalWeeks; w++) {
      const isEarlyPhase = w <= Math.ceil(totalWeeks * 0.35);
      const isMidPhase = w > Math.ceil(totalWeeks * 0.35) && w <= Math.ceil(totalWeeks * 0.75);
      const isFinalPhase = w > Math.ceil(totalWeeks * 0.75);

      const assignedCourses: Course[] = [];
      let weekBudgetRemaining = weeklyHours;

      // Assign courses that fit into this week
      while (currentCourseIndex < orderedCourses.length && weekBudgetRemaining > 2) {
        const c = orderedCourses[currentCourseIndex];
        assignedCourses.push(c);
        accumulatedCourseHours += c.duration_hours;
        weekBudgetRemaining -= Math.min(weekBudgetRemaining, c.duration_hours);

        // Move to next course when enough hours accumulated
        if (accumulatedCourseHours >= c.duration_hours) {
          currentCourseIndex++;
          accumulatedCourseHours = 0;
        }
      }

      // Determine focus skills
      const focusSkills = assignedCourses.flatMap(c => c.skills).slice(0, 3);
      if (focusSkills.length === 0 && role.skills[w % role.skills.length]) {
        focusSkills.push(role.skills[w % role.skills.length].skill);
      }

      let title = `Sprint ${w}: Foundations & Core Concepts`;
      let practicalTask = 'Complete module exercises and commit notes to GitHub.';

      if (isEarlyPhase) {
        title = `Week ${w}: Foundations & Prerequisite Mastery`;
        practicalTask = `Implement 5 foundational algorithms/syntax drills for ${focusSkills[0] || 'core skills'}.`;
      } else if (isMidPhase) {
        title = `Week ${w}: Core Competencies & Role Architecture`;
        practicalTask = `Build a hands-on mini-project demonstrating ${focusSkills[0] || 'core framework'} and push to GitHub.`;
      } else if (isFinalPhase) {
        title = `Week ${w}: Technical Interview Sprints & Mock Rounds`;
        practicalTask = `Timed mock interview simulation: 3 coding challenges + behavioral system discussion.`;
      }

      milestones.push({
        week: w,
        title,
        focusSkills,
        allocatedHours: weeklyHours,
        courseAssignments: assignedCourses,
        practicalTask,
        isCurrent: w === 1,
        isCompleted: w === 0
      });
    }

    return milestones;
  }
}
