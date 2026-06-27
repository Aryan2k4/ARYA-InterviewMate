from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    avatar_url = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    streak = Column(Integer, default=0)
    total_interviews = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    interviews = relationship("Interview", back_populates="user")
    achievements = relationship("Achievement", back_populates="user")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    num_questions = Column(Integer, default=5)
    status = Column(String, default="in_progress")  # in_progress, completed
    overall_score = Column(Float, default=0)
    technical_score = Column(Float, default=0)
    communication_score = Column(Float, default=0)
    confidence_score = Column(Float, default=0)
    clarity_score = Column(Float, default=0)
    depth_score = Column(Float, default=0)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    missed_concepts = Column(JSON, default=list)
    recommended_topics = Column(JSON, default=list)
    improvement_plan = Column(Text)
    resume_used = Column(Boolean, default=False)
    resume_text = Column(Text)
    duration_seconds = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))

    user = relationship("User", back_populates="interviews")
    questions = relationship("Question", back_populates="interview", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String)  # technical, behavioral, hr, situational
    order_num = Column(Integer)
    answer_text = Column(Text)
    score = Column(Float, default=0)
    accuracy_score = Column(Float, default=0)
    clarity_score = Column(Float, default=0)
    depth_score = Column(Float, default=0)
    communication_score = Column(Float, default=0)
    feedback = Column(Text)
    ideal_answer_hints = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    interview = relationship("Interview", back_populates="questions")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    icon = Column(String)
    earned_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="achievements")


class CoachPlan(Base):
    __tablename__ = "coach_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    weekly_plan = Column(JSON)
    recommended_skills = Column(JSON)
    learning_roadmap = Column(JSON)
    preparation_strategy = Column(Text)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
