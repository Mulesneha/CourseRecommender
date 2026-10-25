import React, { useState } from 'react';
import { ArrowRight, BookOpen, Check, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from 'lucide-react';

export interface AuthIdentity {
  name: string;
  email: string;
}

interface AuthPageProps {
  onContinue: (identity: AuthIdentity) => void;
}

type AuthMode = 'login' | 'signup';

export const AuthPage: React.FC<AuthPageProps> = ({ onContinue }) => {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (isSignup && password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    onContinue({
      name: isSignup ? name.trim() : email.split('@')[0],
      email: email.trim(),
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-[1.05fr_.95fr] rounded-[2rem] overflow-hidden bg-white/80 border border-white/80 shadow-[0_32px_100px_-35px_rgba(67,56,202,.38)] backdrop-blur-xl">
        <section className="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full border border-white/15" />
          <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full border border-white/20" />
          <div className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold tracking-tight text-xl">NextCourse</p>
                <p className="text-xs text-indigo-100">Your next step starts here</p>
              </div>
            </div>
          </div>

          <div className="relative max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-semibold text-indigo-50">
              <Sparkles className="w-3.5 h-3.5" /> A learning path built around you
            </span>
            <h1 className="mt-6 text-4xl xl:text-5xl font-extrabold leading-[1.1] tracking-tight">
              Turn your goals into a <span className="text-indigo-200">clear next step.</span>
            </h1>
            <p className="mt-5 text-indigo-100 leading-relaxed max-w-md">
              Discover courses matched to your career goals, build in-demand skills, and make every hour of study count.
            </p>
            <div className="mt-9 grid grid-cols-2 gap-3">
              {['Personalized course picks', 'Skill gap insights', 'A focused study plan', 'Progress that adds up'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/95">
                  <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-indigo-100/75">Learn with a plan. Grow with confidence.</p>
        </section>

        <section className="p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-center">
          <div className="lg:hidden flex items-center gap-3 mb-9">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold grad-text">NextCourse</span>
          </div>

          <div className="mb-8">
            <p className="text-sm font-bold text-indigo-600 mb-2">{isSignup ? 'START LEARNING' : 'WELCOME BACK'}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {isSignup ? 'Create your account' : 'Log in to NextCourse'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isSignup ? 'Set up your learning space in just a moment.' : 'Pick up where your learning journey left off.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 mb-7" role="tablist" aria-label="Account access">
            <button
              type="button"
              role="tab"
              aria-selected={isSignup}
              onClick={() => switchMode('signup')}
              className={`rounded-lg py-2.5 text-sm font-bold transition-all ${isSignup ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign up
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isSignup}
              onClick={() => switchMode('login')}
              className={`rounded-lg py-2.5 text-sm font-bold transition-all ${!isSignup ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Log in
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-1.5">Your name</span>
                <input
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                />
              </label>
            )}

            <label className="block">
              <span className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</span>
              <span className="relative block">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                />
              </span>
            </label>

            <label className="block">
              <span className="block text-sm font-semibold text-slate-700 mb-1.5">Password</span>
              <span className="relative block">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </span>
            </label>

            {isSignup && (
              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm password</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Enter your password again"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                />
              </label>
            )}

            {error && <p role="alert" className="text-sm font-medium text-rose-600">{error}</p>}

            <button type="submit" className="btn-3d w-full rounded-xl py-3.5 font-bold flex items-center justify-center gap-2">
              {isSignup ? 'Create account' : 'Log in'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isSignup ? 'Already have an account?' : 'New to NextCourse?'}{' '}
            <button
              type="button"
              onClick={() => switchMode(isSignup ? 'login' : 'signup')}
              className="font-bold text-indigo-600 hover:text-indigo-700"
            >
              {isSignup ? 'Log in' : 'Create an account'}
            </button>
          </p>

          <p className="mt-7 rounded-xl bg-amber-50 border border-amber-100 px-3.5 py-3 text-xs leading-relaxed text-amber-800">
            Demo only: account details are used for this browser session. Authentication is not connected to a server, and your password is never saved.
          </p>
        </section>
      </div>
    </main>
  );
};
