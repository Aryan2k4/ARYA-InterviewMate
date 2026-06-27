from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List

from database import get_db
import models, schemas
from utils.auth import get_current_user

router = APIRouter()


@router.get("/summary", response_model=schemas.AnalyticsSummary)
async def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    completed = db.query(models.Interview).filter(
        models.Interview.user_id == current_user.id,
        models.Interview.status == "completed"
    ).all()

    if not completed:
        return schemas.AnalyticsSummary(
            total_interviews=0, average_score=0, technical_score=0,
            communication_score=0, improvement_trend=0, interviews_this_week=0,
            best_score=0, success_rate=0
        )

    avg_score = sum(i.overall_score for i in completed) / len(completed)
    avg_tech = sum(i.technical_score for i in completed) / len(completed)
    avg_comm = sum(i.communication_score for i in completed) / len(completed)
    best_score = max(i.overall_score for i in completed)

    week_ago = datetime.utcnow() - timedelta(days=7)
    this_week = [i for i in completed if i.completed_at and i.completed_at > week_ago]

    # Improvement trend: compare last 5 vs previous 5
    sorted_interviews = sorted(completed, key=lambda x: x.completed_at or datetime.min)
    if len(sorted_interviews) >= 10:
        recent_avg = sum(i.overall_score for i in sorted_interviews[-5:]) / 5
        prev_avg = sum(i.overall_score for i in sorted_interviews[-10:-5]) / 5
        trend = recent_avg - prev_avg
    elif len(sorted_interviews) >= 2:
        trend = sorted_interviews[-1].overall_score - sorted_interviews[0].overall_score
    else:
        trend = 0

    success_rate = len([i for i in completed if i.overall_score >= 70]) / len(completed) * 100

    return schemas.AnalyticsSummary(
        total_interviews=len(completed),
        average_score=round(avg_score, 1),
        technical_score=round(avg_tech, 1),
        communication_score=round(avg_comm, 1),
        improvement_trend=round(trend, 1),
        interviews_this_week=len(this_week),
        best_score=round(best_score, 1),
        success_rate=round(success_rate, 1)
    )


@router.get("/performance-trend")
async def get_performance_trend(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    since = datetime.utcnow() - timedelta(days=days)
    interviews = db.query(models.Interview).filter(
        models.Interview.user_id == current_user.id,
        models.Interview.status == "completed",
        models.Interview.completed_at >= since
    ).order_by(models.Interview.completed_at).all()

    return [
        {
            "date": i.completed_at.strftime("%Y-%m-%d") if i.completed_at else "",
            "overall_score": round(i.overall_score, 1),
            "technical_score": round(i.technical_score, 1),
            "communication_score": round(i.communication_score, 1),
            "role": i.role
        }
        for i in interviews
    ]


@router.get("/topic-weaknesses")
async def get_topic_weaknesses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    questions = db.query(models.Question).join(models.Interview).filter(
        models.Interview.user_id == current_user.id,
        models.Interview.status == "completed",
        models.Question.score < 70
    ).all()

    # Aggregate by question type
    type_scores = {}
    for q in questions:
        qtype = q.question_type or "technical"
        if qtype not in type_scores:
            type_scores[qtype] = {"total": 0, "count": 0}
        type_scores[qtype]["total"] += q.score
        type_scores[qtype]["count"] += 1

    weaknesses = []
    for topic, data in type_scores.items():
        avg = data["total"] / data["count"]
        weaknesses.append({
            "topic": topic.replace("_", " ").title(),
            "weakness_score": round(100 - avg, 1),
            "frequency": data["count"]
        })

    return sorted(weaknesses, key=lambda x: x["weakness_score"], reverse=True)


@router.get("/skill-growth")
async def get_skill_growth(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    interviews = db.query(models.Interview).filter(
        models.Interview.user_id == current_user.id,
        models.Interview.status == "completed"
    ).order_by(models.Interview.completed_at).all()

    skills = {}
    for interview in interviews:
        role = interview.role
        if role not in skills:
            skills[role] = []
        skills[role].append({
            "date": interview.completed_at.strftime("%Y-%m-%d") if interview.completed_at else "",
            "score": round(interview.overall_score, 1)
        })

    return skills
