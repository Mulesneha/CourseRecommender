import React from 'react';
import { Target, BookOpen, RotateCcw, LogOut } from 'lucide-react';

export type NavTab = 'recommendations' | 'skill-gaps';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onReset: () => void;
  onLogout: () => void;
}

const TABS: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: 'recommendations', label: 'Course Recommendations', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'skill-gaps', label: 'Skill Gap Analyzer', icon: <Target className="w-4 h-4" /> },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onReset, onLogout }) => (
  <header className="sticky top-0 z-40 glass border-b border-white/60">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <button onClick={() => onTabChange('recommendations')} className="flex items-center gap-3 text-left">
        <div className="cube-wrap"><div className="cube">
          {['f','b','l','r','t','u'].map(k => <span key={k} className={`face face-${k}`} />)}
        </div></div>
        <div>
          <span className="text-lg font-extrabold tracking-tight grad-text block leading-tight">NextCourse</span>
          <span className="text-xs text-slate-500 block">Smart Course Recommender</span>
        </div>
      </button>

      <nav className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/60 shadow-inner">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
              activeTab === t.id ? 'btn-3d text-white' : 'text-slate-600 hover:bg-white hover:-translate-y-0.5'
            }`}
          >
            {t.icon}<span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <button onClick={onReset} title="Reset profile" aria-label="Reset profile" className="p-2.5 rounded-xl bg-white/70 hover:bg-white text-slate-600 shadow-sm hover:-translate-y-0.5 transition-all">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button onClick={onLogout} title="Log out" aria-label="Log out" className="p-2.5 rounded-xl bg-white/70 hover:bg-white text-slate-600 shadow-sm hover:-translate-y-0.5 transition-all">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  </header>
);
