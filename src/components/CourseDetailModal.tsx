import React from 'react';
import { useStudent } from '../context/StudentContext';
import { 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Award, 
  Code, 
  Bookmark, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Course } from '../types';
import { PrerequisiteGraphEngine } from '../ml/prerequisiteGraph';

interface CourseDetailModalProps {
  courseId: string | null;
  onClose: () => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  courseId,
  onClose
}) => {
  const { 
    allCourses, 
    profile, 
    activeRole, 
    toggleEnrollCourse, 
    toggleCompleteCourse, 
    toggleBookmarkCourse 
  } = useStudent();

  if (!courseId) return null;

  const course = allCourses.find(c => c.id === courseId);
  if (!course) return null;

  const prereqEngine = new PrerequisiteGraphEngine();
  const prereqStatus = prereqEngine.evaluatePrerequisites(course, profile);
  const isEnrolled = profile.enrolledCourseIds.includes(course.id);
  const isCompleted = profile.completedCourseIds.includes(course.id);
  const isBookmarked = profile.bookmarkedCourseIds.includes(course.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8 animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>{course.provider}</span>
              <span>·</span>
              <span>{course.level}</span>
              <span>·</span>
              <span className="tabular-nums">{course.duration_hours} Hours</span>
              <span>·</span>
              <span className="tabular-nums">★ {course.rating}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {course.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed">
          {course.description}
        </p>

        {/* Prerequisites Evaluation */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span>Prerequisite Verification Status:</span>
            {prereqStatus.isSatisfied ? (
              <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                All Prerequisites Cleared
              </span>
            ) : (
              <span className="text-amber-700 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-4 h-4" />
                Prerequisite Foundation Needed
              </span>
            )}
          </div>

          {course.prerequisites.length > 0 ? (
            <div className="space-y-1 text-xs">
              {course.prerequisites.map(p => {
                const isSatisfied = (profile.currentMastery[p] ?? 0) >= 0.60;
                return (
                  <div key={p} className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-700">{p}</span>
                    {isSatisfied ? (
                      <span className="text-emerald-600 font-semibold">Mastery &ge; 60%</span>
                    ) : (
<span className="text-amber-600 font-semibold">Build this skill first</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">
              No previous coursework required. Open foundational module.
            </p>
          )}
        </div>

        {/* Syllabus Modules */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            Curriculum Modules & Syllabus
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {course.syllabus.map((topic, i) => (
              <li key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="leading-snug">{topic}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Practical Projects */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-emerald-500" />
            Practical Projects for Placement Portfolio
          </h3>
          <div className="space-y-1.5 text-xs">
            {course.practical_projects.map((proj, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-emerald-900 font-medium">
                ✦ {proj}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Open Verified Provider URL
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmarkCourse(course.id)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                isBookmarked 
                  ? 'border-indigo-300 text-indigo-600 bg-indigo-50' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>

            <button
              onClick={() => toggleCompleteCourse(course.id)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                isCompleted 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              {isCompleted ? 'Completed' : 'Mark Complete'}
            </button>

            <button
              onClick={() => toggleEnrollCourse(course.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
                isEnrolled 
                  ? 'bg-slate-200 text-slate-800' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isEnrolled ? 'Enrolled in Plan' : 'Enroll Free'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
