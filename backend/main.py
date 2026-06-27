from dotenv import load_dotenv
load_dotenv()  # MUST be first — loads .env before any other imports read env vars

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from database import engine, Base
from routers import auth, interviews, analytics, leaderboard, admin, coach, resume

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ARYA InterviewMate API",
    description="AI-powered mock interview platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://arya-interviewmate.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["Interviews"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["Leaderboard"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(coach.router, prefix="/api/coach", tags=["Career Coach"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
