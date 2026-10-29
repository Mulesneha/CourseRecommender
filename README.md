# NextCourse — Smart Course Recommender

A React app with a Python recommendation API and two focused screens:

1. **Course Recommendations** — ranked courses with an explainable score
   (TF-IDF content match + skill-gap severity + collaborative filtering + preferences),
   level filters, and prerequisite checks.
2. **Skill Gap Analyzer** — compares your skill levels with your target role.
   Drag a skill's "Simulate Mastery" slider and the recommendations re-rank instantly.

Pick a target role and weekly study time at the top. The app uses a local
Python API for TF-IDF recommendations and falls back to its in-browser
recommender if the API is unavailable.

## Run
```bash
npm install
python -m pip install -r python/requirements.txt
```
Start the Python API and React app in two terminals:
```bash
npm run dev:api
```

```bash
npm run dev
```

Open the Local URL printed by Vite (usually http://localhost:3000; if that
port is busy, Vite automatically uses http://localhost:3001). Requires Node.js
18+ and Python 3.10+.

## Commands
```bash
npm run build      # production build -> dist/
npm run preview    # serve the build
npm run lint       # TypeScript check
```

## Python TF-IDF integration

The Python API supplies TF-IDF content scores to the React app. Those scores
are combined with the existing skill-gap, collaborative, preference, and
prerequisite scoring in the browser.

Run the API and frontend in two terminals from the project root. Start the API:
```bash
python -m uvicorn python.api:app --reload --host 127.0.0.1 --port 8000
```

In a second terminal run the frontend:
```bash
npm run dev
```

Then open the Local URL printed by Vite. You can also start the API with
`npm run dev:api`. Confirm it is ready at http://127.0.0.1:8000/api/health.

Run the Python recommender tests with:
```bash
python -m unittest discover -s python -p "test_*.py"
```
