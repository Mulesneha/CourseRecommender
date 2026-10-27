# NextCourse — Smart Course Recommender

NextCourse is a client-side learning dashboard that helps students find courses for a career goal, identify skill gaps, and organize their study time. It is built with React, TypeScript, Vite, and Tailwind CSS.

## Features

 **Account screen:** Demo signup and login forms, with password confirmation and a password visibility toggle.
- **Course recommendations:** Ranks courses using content similarity, skill gaps, collaborative filtering, learner preferences, and prerequisite checks.
- **Skill gap analysis:** Compare your current skills with the requirements of a target career role.
- **Personalized study settings:** Choose a target role and weekly study hours to update recommendations and the study plan.
- **Course details and progress:** Review course information and track enrolled, completed, and bookmarked courses.
- **Adaptive learning:** Update skill mastery using quiz results and view placement readiness.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Getting started

From the project directory (the folder containing `package.json`), install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

```bash
npm run dev      # Start the Vite development server on port 3000
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build on port 3000
npm run lint     # Run the TypeScript check
```


## Project structure

```text
src/
  components/  React UI components, including the account screen
  context/     Student profile and application state
  data/        Course, career role, and quiz data
  ml/          Recommendation, skill-gap, mastery, and scheduling logic
  types/       Shared TypeScript types
```

