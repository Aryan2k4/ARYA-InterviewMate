<div align="center">

<img src="https://img.shields.io/badge/ARYA-InterviewMate-0066FF?style=for-the-badge&labelColor=0A0A0F&color=0066FF" alt="ARYA InterviewMate" />

# ARYA InterviewMate

**AI-powered mock interview platform to help you land your dream job**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-0066FF?style=flat-square&logo=vercel&logoColor=white)](https://arya-interview-mate-hll11.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Render-00C896?style=flat-square&logo=render&logoColor=white)](https://arya-interviewmate.onrender.com/api/health)
[![GitHub](https://img.shields.io/badge/Source-GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Aryan2k4/ARYA-InterviewMate)

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLM-F55036?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)

</div>

---

## What is ARYA InterviewMate?

ARYA InterviewMate is a production-ready AI mock interview platform that simulates real technical and behavioural interviews. It uses the **Groq LLM API** (llama-3.3-70b-versatile) to generate adaptive questions, evaluate your answers across five dimensions in real time, and give you a detailed performance report with a personalised improvement plan.

Built entirely by one developer — from database schema design to production deployment.

---

## Live Links

| Service | URL |
|---|---|
| **Frontend** (Vercel) | [arya-interview-mate-hll11.vercel.app](https://arya-interview-mate-hll11.vercel.app) |
| **Backend API** (Render) | [arya-interviewmate.onrender.com](https://arya-interviewmate.onrender.com) |
| **API Docs** (Swagger) | [arya-interviewmate.onrender.com/api/docs](https://arya-interviewmate.onrender.com/api/docs) |
| **Health Check** | [arya-interviewmate.onrender.com/api/health](https://arya-interviewmate.onrender.com/api/health) |

---

## Features

### Core Interview Engine
- **Adaptive AI Questions** — Groq generates technical, behavioural, HR, and situational questions that evolve based on your previous answers
- **5-Dimensional Scoring** — every answer is evaluated on Accuracy, Clarity, Depth, Communication, and Confidence (0–100 each)
- **Resume-Based Interviews** — upload your CV (PDF/TXT) and get questions tailored to your actual projects and experience
- **Real-Time Feedback** — instant AI evaluation with strengths, areas to improve, and score breakdown after each answer

### Reports & Analytics
- **Detailed Interview Report** — strengths, weaknesses, missed concepts, recommended topics, and a personalised improvement plan
- **Performance Trend Charts** — line charts tracking Overall, Technical, and Communication scores across sessions
- **Skill Radar** — radar chart of strengths and weaknesses by question category
- **Topic Weakness Breakdown** — identifies which areas (system design, algorithms, behavioural, etc.) need the most work

### AI Career Coach
- **Interactive Chat** — real-time conversation with an AI coach that knows your interview history and scores
- **8-Week Learning Roadmap** — personalised phase-by-phase prep plan based on your performance data
- **Weekly Schedule** — day-by-day prep tasks with duration and focus areas
- **Skill Recommendations** — AI-identified priority skills based on your weakest performance areas

### Platform
- **Leaderboard** — ranked by average score with streaks and achievements
- **Interview History** — revisit any past session, download report as TXT, or delete
- **Admin Panel** — platform stats, user management, popular roles breakdown
- **JWT Authentication** — secure signup/login with protected routes
- **Responsive UI** — works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Framer Motion |
| **Charts** | Recharts (Line, Bar, Radar) |
| **Backend** | FastAPI, Python 3.12 |
| **Database** | SQLite + SQLAlchemy ORM |
| **Authentication** | JWT (python-jose) + bcrypt |
| **AI** | Groq API — llama-3.3-70b-versatile |
| **Icons** | Lucide React |
| **Frontend Deploy** | Vercel |
| **Backend Deploy** | Render |

---

## Project Structure

```
ARYA-InterviewMate/
│
├── backend/
│   ├── main.py                # FastAPI app — load_dotenv() is first call
│   ├── database.py            # SQLAlchemy + SQLite setup
│   ├── models.py              # User, Interview, Question, Achievement, CoachPlan
│   ├── schemas.py             # Pydantic request/response models
│   ├── requirements.txt
│   ├── .env.example
│   ├── render.yaml            # Render deployment config
│   │
│   ├── routers/
│   │   ├── auth.py            # /api/auth/* — signup, login, JWT
│   │   ├── interviews.py      # /api/interviews/* — start, answer, complete
│   │   ├── analytics.py       # /api/analytics/* — trends, weaknesses
│   │   ├── leaderboard.py     # /api/leaderboard/*
│   │   ├── coach.py           # /api/coach/* — plan + interactive chat
│   │   ├── resume.py          # /api/resume/* — PDF upload + interview
│   │   └── admin.py           # /api/admin/*
│   │
│   └── services/
│       └── gemini.py          # All Groq LLM calls (named for compatibility)
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── App.tsx            # All routes
        ├── index.tsx
        ├── index.css          # Design system — Plus Jakarta Sans, CSS vars
        ├── types/index.ts     # TypeScript interfaces
        ├── services/api.ts    # All Axios calls
        ├── context/
        │   └── AuthContext.tsx
        └── components/
            ├── LandingPage.tsx
            ├── auth/          # Login, Signup, ProtectedRoute
            ├── dashboard/     # Stats, quick start, recent sessions
            ├── interview/     # Setup, Session (pulse ring UX), Report, History
            ├── analytics/     # Charts and performance trends
            ├── leaderboard/   # Rankings table
            ├── coach/         # AI chat + weekly plan tabs
            ├── admin/         # Admin panel
            ├── layout/        # Sidebar, AppLayout
            └── ui/            # Button, Input, ScoreRing, Badge, ProgressBar, etc.
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/interviews/start` | Start interview, generate questions |
| `GET` | `/api/interviews/` | List all interviews |
| `GET` | `/api/interviews/:id` | Get interview with questions |
| `POST` | `/api/interviews/:id/answer` | Submit answer, get AI evaluation |
| `POST` | `/api/interviews/:id/complete` | Complete interview, generate report |
| `DELETE` | `/api/interviews/:id` | Delete interview |
| `GET` | `/api/analytics/summary` | Performance summary |
| `GET` | `/api/analytics/performance-trend` | Score trend over time |
| `GET` | `/api/analytics/topic-weaknesses` | Weak areas by question type |
| `GET` | `/api/analytics/skill-growth` | Score growth per role |
| `GET` | `/api/leaderboard/` | Full rankings |
| `GET` | `/api/leaderboard/my-rank` | Current user's rank |
| `GET` | `/api/coach/plan` | Get/generate AI coaching plan |
| `POST` | `/api/coach/chat` | Interactive AI coach chat |
| `POST` | `/api/resume/upload-and-start` | Upload resume, start interview |
| `GET` | `/api/admin/stats` | Platform stats (admin only) |
| `GET` | `/api/admin/users` | All users (admin only) |

Full interactive docs: [arya-interviewmate.onrender.com/api/docs](https://arya-interviewmate.onrender.com/api/docs)

---

## Local Setup

### Prerequisites
- Python 3.11+ (3.12 recommended)
- Node.js 20+
- A free Groq API key from [console.groq.com/keys](https://console.groq.com/keys)

### Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Open .env and set GROQ_API_KEY=gsk_your_key_here

# Run — MUST be run from inside backend/ directory
uvicorn main:app --reload --port 8001
```

Test: [http://localhost:8001/api/health](http://localhost:8001/api/health)

### Frontend

```bash
cd frontend
npm install

cp .env.example .env
# .env already contains: REACT_APP_API_URL=http://localhost:8001

npm start
```

App: [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

### `backend/.env`

```env
GROQ_API_KEY=gsk_your_key_from_console_groq_com
GROQ_MODEL=llama-3.3-70b-versatile
SECRET_KEY=any-long-random-string-32-chars-minimum
DATABASE_URL=sqlite:///./arya_interviewmate.db
```

### `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:8001
```

Get a free Groq key (no credit card): [console.groq.com/keys](https://console.groq.com/keys)

---

## Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect this GitHub repo
3. Set **Root Directory** to `backend`
4. **Build command:** `pip install -r requirements.txt`
5. **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `GROQ_API_KEY` = your key
   - `GROQ_MODEL` = `llama-3.3-70b-versatile`
   - `SECRET_KEY` = any long random string
   - `DATABASE_URL` = `sqlite:///./arya_interviewmate.db`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import this repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com`
5. Deploy

After deploying, update `allow_origins` in `backend/main.py` with your Vercel URL and push.

---

## Database Schema

```
users           id, email, username, hashed_password, streak, total_interviews, is_admin
interviews      id, user_id, role, difficulty, num_questions, status, scores (5), report fields
questions       id, interview_id, question_text, type, answer_text, scores (4), feedback
achievements    id, user_id, title, description, earned_at
coach_plans     id, user_id, weekly_plan, roadmap, recommended_skills, preparation_strategy
```

---

## Make yourself Admin

```bash
cd backend
source venv/bin/activate
python3 -c "
from dotenv import load_dotenv; load_dotenv()
from database import SessionLocal
from models import User
db = SessionLocal()
u = db.query(User).filter(User.email=='your@email.com').first()
u.is_admin = True; db.commit()
print('Done —', u.email, 'is now admin')
"
```

---

## Key Design Decisions

- **`load_dotenv()` is the first line of `main.py`** — before any imports, so the Groq API key is available when FastAPI starts. Missing this causes all AI features to silently fall back to dummy 50/50/50 scores.
- **`bcrypt==4.0.1` is pinned** — `passlib 1.7.4` is incompatible with `bcrypt>=4.1`, causing signup/login to crash. The pin is intentional.
- **`groq==1.4.0` is pinned** — older versions pass a deprecated `proxies` kwarg to `httpx`, which breaks on `httpx>=0.28`.
- **`framer-motion@10.18.0`** — v11 has a type incompatibility with `@types/react@18.2.x` that breaks the production build under CI.
- **`uvicorn` must be run from inside `backend/`** — SQLite creates the `.db` file relative to the working directory, and `.env` is loaded from `./`, so running from the parent folder breaks both.

---

## Author

**Aryan Goswami**
B.Tech CSE — ABV GIET Shimla, Himachal Pradesh

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/aryan-goswami-6b0014324)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Aryan2k4)
[![LeetCode](https://img.shields.io/badge/LeetCode-200%2B%20solved-FFA116?style=flat-square&logo=leetcode&logoColor=black)](https://leetcode.com/u/Aryan2k4)

---

<div align="center">
<sub>Built with FastAPI · React · Groq LLM · Deployed on Vercel + Render</sub>
</div>
