from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime


# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    is_admin: bool
    streak: int
    total_interviews: int
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# Interview Schemas
class InterviewCreate(BaseModel):
    role: str
    difficulty: str
    num_questions: int = 5
    resume_text: Optional[str] = None


class QuestionResponse(BaseModel):
    id: int
    question_text: str
    question_type: str
    order_num: int
    answer_text: Optional[str]
    score: float
    feedback: Optional[str]
    accuracy_score: float
    clarity_score: float
    depth_score: float
    communication_score: float

    class Config:
        from_attributes = True


class AnswerSubmit(BaseModel):
    question_id: int
    answer_text: str


class InterviewResponse(BaseModel):
    id: int
    role: str
    difficulty: str
    num_questions: int
    status: str
    overall_score: float
    technical_score: float
    communication_score: float
    confidence_score: float
    clarity_score: float
    depth_score: float
    strengths: Optional[List[str]]
    weaknesses: Optional[List[str]]
    missed_concepts: Optional[List[str]]
    recommended_topics: Optional[List[str]]
    improvement_plan: Optional[str]
    resume_used: bool
    duration_seconds: int
    created_at: datetime
    completed_at: Optional[datetime]
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True


# Analytics Schemas
class AnalyticsSummary(BaseModel):
    total_interviews: int
    average_score: float
    technical_score: float
    communication_score: float
    improvement_trend: float
    interviews_this_week: int
    best_score: float
    success_rate: float


class PerformanceTrend(BaseModel):
    date: str
    overall_score: float
    technical_score: float
    communication_score: float


class TopicWeakness(BaseModel):
    topic: str
    weakness_score: float
    frequency: int


# Leaderboard Schemas
class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    full_name: Optional[str]
    total_interviews: int
    average_score: float
    streak: int
    best_score: float


# Coach Schemas
class CoachPlanResponse(BaseModel):
    weekly_plan: List[Any]
    recommended_skills: List[str]
    learning_roadmap: List[Any]
    preparation_strategy: str
    generated_at: datetime

    class Config:
        from_attributes = True


# Admin Schemas
class AdminStats(BaseModel):
    total_users: int
    total_interviews: int
    average_score: float
    popular_roles: List[dict]
    recent_signups: int
    active_users_today: int
