import React, { useEffect, useState } from 'react';
import { StudentProvider, useStudent } from './context/StudentContext';
import { Navbar, NavTab } from './components/Navbar';
import { SkillGapAnalyzer } from './components/SkillGapAnalyzer';
import { CourseRecommendations } from './components/CourseRecommendations';
import { CourseDetailModal } from './components/CourseDetailModal';

const CARD = '[class*="bg-white"][class*="rounded-"]';

// Mouse-driven 3D tilt for every card (event delegation, no per-card code)
const useTilt = () => {
  useEffect(() => {
    let last: HTMLElement | null = null;
    const reset = (el: HTMLElement | null) => { if (el) el.style.transform = ''; };
    const move = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest?.(CARD) as HTMLElement | null;
      if (el !== last) { reset(last); last = el; }
      if (!el || el.closest('[role="dialog"], .no-tilt')) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const max = Math.max(1.2, 9 - r.width / 140); // bigger cards tilt less
      el.style.transform = `perspective(1100px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateZ(8px)`;
    };
    const leave = () => { reset(last); last = null; };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    return () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseleave', leave); };
  }, []);
};

const ControlBar: React.FC = () => {
  const { profile, activeRole, allRoles, setTargetRole, updateStudyPreferences } = useStudent();
  const sel = 'bg-white/80 border border-white text-slate-900 text-sm rounded-xl px-3 py-2 font-medium shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none';
  return (
    <section className="no-tilt glass rounded-3xl p-5 mb-8 flex flex-wrap items-end gap-5 float-in">
      <div className="mr-auto">
        <h2 className="text-xl font-extrabold text-slate-900">{profile.name}</h2>
        <p className="text-sm text-slate-500">Pick your goal — recommendations update instantly.</p>
      </div>
      <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Target Role
        <select className={sel} value={activeRole.id} onChange={(e) => setTargetRole(e.target.value)}>
          {allRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Study Time
        <select className={sel} value={profile.weeklyStudyHours} onChange={(e) => updateStudyPreferences(Number(e.target.value), profile.weeksUntilPlacement)}>
          {[4, 8, 12, 16, 20].map((h) => <option key={h} value={h}>{h} hrs / week</option>)}
        </select>
      </label>
    </section>
  );
};

const AppContent: React.FC = () => {
  const { resetToSampleProfile } = useStudent();
  const [tab, setTab] = useState<NavTab>('recommendations');
  const [courseId, setCourseId] = useState<string | null>(null);
  useTilt();

  return (
    <div className="min-h-screen flex flex-col text-slate-900 relative overflow-x-clip">
      <div className="orb orb-a" /><div className="orb orb-b" /><div className="orb orb-c" />
      <Navbar activeTab={tab} onTabChange={setTab} onReset={resetToSampleProfile} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10 float-in">
        <ControlBar />
        {tab === 'recommendations' && <CourseRecommendations onSelectCourse={setCourseId} />}
        {tab === 'skill-gaps' && <SkillGapAnalyzer onSelectCourse={setCourseId} />}
      </main>
      <footer className="py-6 text-center text-xs text-slate-500 relative z-10">
        <span className="font-bold grad-text">NextCourse</span> · TF-IDF + Collaborative Filtering + Skill-Gap Scoring + Prerequisite Sequencing
      </footer>
      {courseId && <CourseDetailModal courseId={courseId} onClose={() => setCourseId(null)} />}
    </div>
  );
};

export default function App() {
  return <StudentProvider><AppContent /></StudentProvider>;
}
