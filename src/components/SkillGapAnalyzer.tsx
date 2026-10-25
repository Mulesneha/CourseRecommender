import React from 'react';
import { useStudent } from '../context/StudentContext';
import { Target, AlertTriangle, CheckCircle, HelpCircle, ArrowUpRight, Play, BookOpen } from 'lucide-react';
import { SkillGapEngine } from '../ml/skillGapEngine';

interface SkillGapAnalyzerProps {
  onSelectCourse: (courseId: string) => void;
}

export const SkillGapAnalyzer: React.FC<SkillGapAnalyzerProps> = ({
  onSelectCourse
}) => {
  const { profile, activeRole, updateSkillMastery, allCourses, recommendedCourses } = useStudent();
  const skillGapEngine = new SkillGapEngine();
  const gaps = skillGapEngine.calculateSkillGaps(profile, activeRole);

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Concept Explanation */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            Feature 01: Placement Skill Gap Analyzer
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Placement Skill Gap Analysis for {activeRole.name}
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Your personalized roadmap for {activeRole.name}: explore your strengths, discover skills to build, and choose your next step.
          </p>
        </div>
      </div>

      {/* Main Analysis Table & Interactive Sliders */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Ranked Skill Gap Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Ordered by Job Relevance and Gap Severity (Highest Priority First)
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {gaps.length} Required Role Competencies
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {gaps.map((item, idx) => {
            const currentPct = Math.round(item.currentMastery * 100);
            const targetPct = Math.round(item.targetMastery * 100);
            const gapPct = Math.round(item.gap * 100);
            const isCritical = item.gap >= 0.25 && item.importance >= 4;

            // Find courses that teach this skill
            const matchingCourses = allCourses.filter(c => c.skills.includes(item.skill));

            return (
              <div key={item.skill} className="p-6 hover:bg-slate-50/60 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Skill metadata & classification */}
                  <div className="space-y-1.5 lg:w-1/3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        #{idx + 1}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">
                        {item.skill}
                      </h3>
                      {item.isStrength && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Strength
                        </span>
                      )}
                      {isCritical && (
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          High Priority Gap
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Category: <strong className="text-slate-700 capitalize">{item.category}</strong></span>
                      <span>·</span>
                      <span>Importance: <strong className="text-slate-700">{item.importance}/5</strong></span>
                      <span>·</span>
                      <span>Role Weight: <strong className="text-indigo-600 tabular-nums">w={item.importance}</strong></span>
                    </div>
                  </div>

                  {/* Visual Progress Bar & Slider */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        Current Mastery: <strong className="text-slate-900 tabular-nums">{currentPct}%</strong>
                      </span>
                      <span className="text-slate-600">
                        Target: <strong className="text-slate-900 tabular-nums">{targetPct}%</strong>
                      </span>
                      <span className={`font-semibold tabular-nums ${gapPct > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {gapPct > 0 ? `Gap: -${gapPct}%` : 'Target Met'}
                      </span>
                    </div>

                    {/* Dual comparison bar */}
                    <div className="relative w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      {/* Target marker indicator */}
                      <div 
                        className="absolute top-0 bottom-0 border-r-2 border-slate-400 z-10"
                        style={{ left: `${targetPct}%` }}
                        title={`Target: ${targetPct}%`}
                      />
                      {/* Current level */}
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          isCritical ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${currentPct}%` }}
                      />
                    </div>

                    {/* Interactive Slider to simulate progress */}
                    <div className="flex items-center gap-3 pt-1">
                      <label htmlFor={`slider-${item.skill}`} className="text-[11px] text-slate-600 shrink-0">
                        Simulate Mastery:
                      </label>
                      <input 
                        id={`slider-${item.skill}`}
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={item.currentMastery}
                        onChange={(e) => updateSkillMastery(item.skill, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <span className="text-[11px] font-mono text-slate-500 w-10 text-right tabular-nums">
                        {currentPct}%
                      </span>
                    </div>
                  </div>

                  {/* Actions: Take Quiz & Recommend Course */}
                  <div className="flex items-center gap-2 lg:w-48 justify-end shrink-0">
                    {matchingCourses.length > 0 && (
                      <button
                        onClick={() => onSelectCourse(matchingCourses[0].id)}
                        title={`View ${matchingCourses[0].title}`}
                        className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct Course Recommendation for this gap */}
                {matchingCourses.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">Recommended Course to Close This Gap:</span>
                      <button 
                        onClick={() => onSelectCourse(matchingCourses[0].id)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline flex items-center gap-1"
                      >
                        {matchingCourses[0].title}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-slate-400">
                      {matchingCourses[0].provider} · {matchingCourses[0].duration_hours} hrs
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
