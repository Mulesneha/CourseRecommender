# NextCourse — Smart Course Recommender

A fully client-side React app with two focused screens:

1. **Course Recommendations** — ranked courses with an explainable score
   (TF-IDF content match + skill-gap severity + collaborative filtering + preferences),
   level filters, and prerequisite checks.
2. **Skill Gap Analyzer** — compares your skill levels with your target role.
   Drag a skill's "Simulate Mastery" slider and the recommendations re-rank instantly.

Pick a target role and weekly study time at the top. No backend or API key needed.

## Run
```bash
npm install
npm run dev        # http://localhost:3000
```
Requires Node.js 18+.

## Commands
```bash
npm run build      # production build -> dist/
npm run preview    # serve the build
npm run lint       # TypeScript check
```
