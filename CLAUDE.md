# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (http://localhost:5173)
pnpm build      # Production build
pnpm lint       # ESLint check
pnpm preview    # Preview production build
```

No test suite is configured in this project.

## Architecture

**Evalyn** is an AI-powered quiz/assessment platform for teachers and students. The frontend is React 19 + Vite + Tailwind CSS v4.

### Routing

`AppRouter.jsx` uses `createBrowserRouter` with two layout groups:
- Public: `/` (LandingPage), `/signin`, `/signup`
- Protected (inside `MainLayout`): `/home`, `/quizzes`, `/create`, `/activity`, `/settings`, and quiz-related routes

`MainLayout` renders a collapsible `Sidebar` + fixed `Topbar` + `<Outlet>` for page content.

### API Layer

All HTTP calls go through `src/services/api.js`, an axios instance pointed at `https://evalyn-backend-production.up.railway.app/api`. A request interceptor reads `evalyn_token` from `localStorage` and attaches it as `Authorization: Bearer <token>`.

Service modules under `src/services/`:
- `auth.js` — login, register
- `quiz.js` — create quiz with questions, get quiz by ID, join by code
- `assessments.js` — student assessments, grading, quiz statistics
- `ai.js` — AI analysis of a quiz (`/ai/analyze-quiz/:id?model_name=azure`)
- `user.js`, `student_answer.js` — user profile and answer submission

> **Note:** Several service files read `localStorage.getItem("evalyn_token")` at module load time (top-level), which means they won't pick up tokens set after the module first imports. The interceptor in `api.js` handles this correctly per-request; the per-call header overrides in individual service methods are redundant.

### Quiz Status Flow

`QuizInfo.jsx` shows different tabs based on `quizData.status`:
- Teacher view (no `status` field, `completed` present): Info + People tabs
- Student `"unfinished"` / `"submited"`: Info + People
- Student `"graded"`: Info + People + Grades
- Quiz detail sub-views live in `src/pages/quiz_info_content/` (GradedQuizInfo, PublishedQuizInfo, SubmittedQuizInfo, UnfinishedQuizInfo)

### Dev Proxy

Vite proxies `/api/*` → the Railway backend (strips `/api` prefix), so you can use relative `/api/...` URLs locally if needed. Production calls use the absolute base URL in `src/services/api.js`.

### Deployment

**Netlify** — `netlify.toml` has a catch-all redirect (`/* → /index.html`) for client-side routing.

**Google Cloud Run** — also deployed at https://evalyn-fe-36261430683.asia-southeast1.run.app

To redeploy to Cloud Run:

```bash
/home/haidarhanif/Work/projects/group-projects/evalyn/evalyn-backend/google-cloud-sdk/bin/gcloud run deploy evalyn-fe \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 80 \
  --project project-867fcb71-907e-452f-a3f
```

Notes:
- `gcloud` lives inside the `evalyn-backend` repo's SDK, not on the system PATH — use the full path above
- `.gcloudignore` controls what gets uploaded; `.env` is intentionally included so Vite bakes `VITE_*` vars into the build
- The Dockerfile does a multi-stage build: Node 20 runs `pnpm build`, then nginx serves `dist/`
