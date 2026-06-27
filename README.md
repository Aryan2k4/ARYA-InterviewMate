# 🚀 ARYA InterviewMate

> AI-powered mock interview platform — practice interviews, get instant feedback, land your dream job.

[![React](https://img.shields.io/badge/Frontend-React_18_+_TypeScript-61DAFB?logo=react)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Groq](https://img.shields.io/badge/AI-Groq_(Free)-F55036?logo=groq)](https://console.groq.com)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **AI Interview Sessions** | Groq generates adaptive technical, behavioral, HR & situational questions |
| 📄 **Resume-Based Interviews** | Upload resume → get questions from YOUR actual experience |
| 📊 **Real-Time Scoring** | Accuracy, Clarity, Depth, Communication, Confidence out of 100 |
| 📋 **Detailed Reports** | Strengths, weaknesses, missed concepts, improvement plan |
| 📈 **Analytics Dashboard** | Performance trends, skill radar, topic weaknesses via Recharts |
| 🏆 **Leaderboard** | Gamified rankings, streaks, achievements |
| 🤖 **AI Career Coach** | Weekly plans, 8-week roadmap, interview strategy |
| 🛡️ **Admin Panel** | Platform stats, user management, popular roles |
| 🔐 **JWT Auth** | Secure signup, login, protected routes |
| 🌙 **Dark UI** | Glassmorphism, Framer Motion, premium SaaS design |

---

## 🤖 AI — Powered by Groq (100% Free)

Groq provides **completely free** API access to powerful open-source LLMs running on their
custom LPU (Language Processing Unit) hardware — the fastest AI inference available.

**Get your free key:** https://console.groq.com/keys (sign up, click "Create API Key")

| Model | Speed | Best for |
|---|---|---|
| `llama-3.3-70b-versatile` | Fast | Default — best quality, smart responses |
| `llama-3.1-8b-instant` | Blazing | Quickest feedback, high rate limits |
| `mixtral-8x7b-32768` | Fast | Long resume analysis |
| `gemma2-9b-it` | Fast | Alternative option |

---

## 🛠️ Local Setup

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # then edit .env and add your GROQ_API_KEY
uvicorn main:app --reload --port 8001
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env      # REACT_APP_API_URL=http://localhost:8001
npm start
```

---

## 🔑 Environment Variables

### `backend/.env`

```env
GROQ_API_KEY=gsk_your-key-from-console.groq.com
GROQ_MODEL=llama-3.3-70b-versatile
SECRET_KEY=any-long-random-string-change-in-production
DATABASE_URL=sqlite:///./arya_interviewmate.db
```

### `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:8001
```

---

## 🚀 Deployment

| Service | Platform | URL |
|---|---|---|
| Backend | Render (free) | https://render.com |
| Frontend | Vercel (free) | https://vercel.com |

See **DELETE_ME.txt** for complete step-by-step deployment instructions.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login + JWT |
| GET | `/api/auth/me` | Current user |
| POST | `/api/interviews/start` | Start interview |
| POST | `/api/interviews/:id/answer` | Submit + evaluate answer |
| POST | `/api/interviews/:id/complete` | Finish + generate report |
| GET | `/api/analytics/summary` | Performance summary |
| GET | `/api/analytics/performance-trend` | Score trend |
| GET | `/api/leaderboard/` | Rankings |
| GET | `/api/coach/plan` | AI coaching plan |
| POST | `/api/resume/upload-and-start` | Resume interview |
| GET | `/api/admin/stats` | Admin stats |

Interactive docs: `http://localhost:8001/api/docs`

---

## 🎨 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Framer Motion |
| Charts | Recharts (Line, Bar, Radar) |
| Icons | Lucide React |
| Backend | FastAPI, Python 3.11, SQLAlchemy |
| Database | SQLite (auto-created) |
| Auth | JWT (python-jose) + bcrypt |
| AI | Groq — `llama-3.3-70b-versatile` (free) |
| Deploy | Vercel + Render (both free) |

---

MIT License
