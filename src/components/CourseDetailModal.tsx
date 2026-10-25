import { useStudent } from '../context/StudentContext';
import { Course } from '../types';
import { PrerequisiteGraphEngine } from '../ml/prerequisiteGraph';

const IconBase = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const BookOpen = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H20a1 1 0 0 1 1 1v12.5a2.5 2.5 0 0 0-2.5-2.5H4.5A2.5 2.5 0 0 0 2 14.5v-9Z" />
    <path d="M2 18.5A2.5 2.5 0 0 1 4.5 16H20" />
    <path d="M8 7h8" />
    <path d="M8 11h8" />
  </IconBase>
);

const ExternalLink = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <path d="M14 3h7v7" />
    <path d="M10 14 21 3" />
    <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
  </IconBase>
);

const CheckCircle2 = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <path d="M9 11.5 11 13.5l4-5" />
    <circle cx="12" cy="12" r="9" />
  </IconBase>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </IconBase>
);

const Clock = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </IconBase>
);

const Award = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <circle cx="12" cy="9" r="6" />
    <path d="M12 15v5l-2-1-2 1v-5" />
    <path d="M14 15h3.5a2.5 2.5 0 0 0 2.5-2.5V9" />
  </IconBase>
);

const Code = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <path d="m9 18 6-12" />
    <path d="m15 3 5 9-5 9" />
    <path d="M9 3 4 12l5 9" />
  </IconBase>
);

const Bookmark = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <path d="M6 3.5h12a1 1 0 0 1 1 1v16l-7-4-7 4v-16a1 1 0 0 1 1-1Z" />
  </IconBase>
);

const Check = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <path d="m5 12 4 4L19 2" />
  </IconBase>
);

const Sparkles = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <path d="m12 2 1.6 4.9L18.5 8l-4.9 1.1L12 14l-1.6-4.9L5.5 8l4.9-1.1L12 2Z" />
    <path d="m18.5 13 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" />
  </IconBase>
);

const ArrowRight = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <path d="M5 12h14" />
    <path d="m13 5 7 7-7 7" />
  </IconBase>
);

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
