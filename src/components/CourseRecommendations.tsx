import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Award, 
  Bookmark, 
  Filter, 
  Calculator, 
  ChevronDown, 
  ExternalLink,
  Check
} from 'lucide-react';
import { RecommendedCourse, DifficultyLevel } from '../types';

interface CourseRecommendationsProps {
  onSelectCourse: (courseId: string) => void;
}

export const CourseRecommendations: React.FC<CourseRecommendationsProps> = ({
  onSelectCourse
}) => {
  const { 
    recommendedCourses, 
    profile, 
    activeRole, 
    weights,
    toggleEnrollCourse, 
    toggleCompleteCourse, 
    toggleBookmarkCourse 
  } = useStudent();

  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | 'All'>('All');
  const [filterPrereqOnly, setFilterPrereqOnly] = useState<boolean>(false);
  const [inspectingCourse, setInspectingCourse] = useState<RecommendedCourse | null>(null);

  // Filter recommendations
  const filtered = recommendedCourses.filter(item => {
    if (selectedLevel !== 'All' && item.course.level !== selectedLevel) return false;
    if (filterPrereqOnly && !item.score.prerequisiteSatisfied) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Feature 05 Explainable AI concept */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Explainable Course Recommendations
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Ranked Course Recommendations for {activeRole.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Every course recommendation includes an explicit mathematical breakdown and human explanation of why it was chosen, which role-specific gaps it addresses, and its prerequisite satisfaction.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 shrink-0">
            <span className="font-semibold block text-slate-900 mb-1">Current Hybrid Formula:</span>
            R(u,c) = {weights.content}·S_cont + {weights.gap}·S_gap + {weights.collab}·S_collab + {weights.preference}·S_pref
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter Level:
            </span>
            {(['All', 'Beginner', 'Intermediate', 'Advanced'] as (DifficultyLevel | 'All')[]).map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedLevel === lvl
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium select-none">
              <input
                type="checkbox"
                checked={filterPrereqOnly}
                onChange={(e) => setFilterPrereqOnly(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              Only Show Prerequisite-Ready Courses
            </label>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500 tabular-nums">
              Showing {filtered.length} of {recommendedCourses.length} courses
            </span>
          </div>
        </div>
      </div>

      {/* Recommended Courses Grid */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const { course, score, rank, priority } = item;
          const isEnrolled = profile.enrolledCourseIds.includes(course.id);
          const isCompleted = profile.completedCourseIds.includes(course.id);
          const isBookmarked = profile.bookmarkedCourseIds.includes(course.id);

          return (
            <div 
              key={course.id}
              className={`bg-white rounded-xl border transition-all p-6 ${
                isCompleted 
                  ? 'border-emerald-200 bg-emerald-50/20' 
                  : isEnrolled
                  ? 'border-indigo-200 bg-indigo-50/10'
                  : 'border-slate-200 hover:border-indigo-300 shadow-xs'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Main Course Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-400 tabular-nums">
                      Rank #{rank}
                    </span>
                    <span className={`font-semibold px-2 py-0.5 rounded ${
                      priority === 'High Priority'
                        ? 'bg-rose-50 text-rose-700'
                        : priority === 'Foundational Next'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {priority}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-slate-600">{course.provider}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600">{course.level}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 tabular-nums">{course.duration_hours} Hours</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 tabular-nums">★ {course.rating} ({course.review_count.toLocaleString()})</span>
                  </div>

                  <h2 
                    onClick={() => onSelectCourse(course.id)}
                    className="text-lg font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                  >
                    {course.title}
                  </h2>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Explainable AI Highlight Box */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs leading-relaxed text-slate-700">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      Explainable Match Rationale:
                    </div>
                    <p className="text-slate-600">
                      {score.explanation}
                    </p>
                  </div>

                  {/* Skills Tagged & Prerequisite Indicator */}
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span>Skills:</span>
                      <div className="flex flex-wrap items-center gap-1">
                        {course.skills.map(s => (
                          <span key={s} className="font-medium text-slate-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <span className="text-slate-300">·</span>

                    <div>
                      {score.prerequisiteSatisfied ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Prerequisites Met
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Missing Prerequisites: {score.missingPrerequisites.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Pill & Interactive Actions */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 lg:w-48 shrink-0">
                  <div className="text-right">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Hybrid Score
                    </div>
                    <div className="text-2xl font-extrabold text-indigo-600 tabular-nums">
                      {Math.round(score.totalScore * 100)}%
                    </div>
                    <button
                      onClick={() => setInspectingCourse(item)}
                      className="mt-1 text-[11px] text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-1 lg:justify-end"
                    >
                      <Calculator className="w-3 h-3" />
                      Inspect Weights
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => toggleBookmarkCourse(course.id)}
                      title={isBookmarked ? 'Bookmarked' : 'Bookmark'}
                      className={`p-2 rounded-lg border transition-colors ${
                        isBookmarked 
                          ? 'border-indigo-300 text-indigo-600 bg-indigo-50' 
                          : 'border-slate-200 text-slate-400 hover:text-slate-700 bg-white'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleEnrollCourse(course.id)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                        isEnrolled 
                          ? 'bg-slate-200 text-slate-800' 
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isEnrolled ? 'Enrolled' : 'Enroll Free'}
                    </button>

                    <button
                      onClick={() => toggleCompleteCourse(course.id)}
                      title={isCompleted ? 'Mark Incomplete' : 'Mark Completed (Updates Skill Profile)'}
                      className={`p-2 rounded-lg border transition-colors ${
                        isCompleted 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'border-slate-200 text-slate-500 hover:text-emerald-600 bg-white'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mathematical Breakdown Modal */}
      {inspectingCourse && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Explainable AI Mathematical Inspector
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {inspectingCourse.course.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectingCourse(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs font-mono text-slate-700 leading-relaxed">
              <strong>Hybrid Formula:</strong>
              <div className="mt-1">
                R(u,c) = ({weights.content} × {inspectingCourse.score.contentScore}) + ({weights.gap} × {inspectingCourse.score.skillGapScore}) + ({weights.collab} × {inspectingCourse.score.collaborativeScore}) + ({weights.preference} × {inspectingCourse.score.preferenceScore})
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <div>
                  <span className="font-semibold text-slate-900 block">S_content (TF-IDF Similarity)</span>
                  <span className="text-slate-500">Cosine similarity between student role profile and course vectors</span>
                </div>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {inspectingCourse.score.contentScore}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <div>
                  <span className="font-semibold text-slate-900 block">S_gap (Role Skill Gap Fit)</span>
                  <span className="text-slate-500">Coverage of unmastered high-importance skills for {activeRole.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {inspectingCourse.score.skillGapScore}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <div>
                  <span className="font-semibold text-slate-900 block">S_collab (Collaborative Cohort Filtering)</span>
                  <span className="text-slate-500">Item similarity and placement cohort completion path patterns</span>
                </div>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {inspectingCourse.score.collaborativeScore}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <div>
                  <span className="font-semibold text-slate-900 block">S_preference (Student Fit)</span>
                  <span className="text-slate-500">Match with {profile.weeklyStudyHours}h/wk schedule, budget, and level</span>
                </div>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {inspectingCourse.score.preferenceScore}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-indigo-50 border border-indigo-100">
                <span className="font-bold text-indigo-900">Final Composite Hybrid Score:</span>
                <span className="font-mono font-extrabold text-indigo-700 text-base">
                  {Math.round(inspectingCourse.score.totalScore * 100)}%
                </span>
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={() => setInspectingCourse(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
