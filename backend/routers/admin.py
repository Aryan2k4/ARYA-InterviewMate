from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from collections import Counter

from database import get_db
import models, schemas
from utils.auth import get_admin_user

router = APIRouter()


@router.get("/stats", response_model=schemas.AdminStats)
async def get_admin_stats(
    db: Session = Depends(get_db),
    admin_user=Depends(get_admin_user)
):
    total_users = db.query(models.User).count()
    total_interviews = db.query(models.Interview).filter(
        models.Interview.status == "completed"
    ).count()

    all_completed = db.query(models.Interview).filter(
        models.Interview.status == "completed"
    ).all()
    avg_score = (sum(i.overall_score for i in all_completed) / len(all_completed)) if all_completed else 0

    role_counts = Counter(i.role for i in all_completed)
    popular_roles = [
        {"role": role, "count": count}
        for role, count in role_counts.most_common(5)
    ]

    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_signups = db.query(models.User).filter(
        models.User.created_at >= week_ago
    ).count()

    today = datetime.utcnow().date()
    active_today = db.query(models.Interview).filter(
        func.date(models.Interview.created_at) == today
    ).distinct(models.Interview.user_id).count()

    return schemas.AdminStats(
        total_users=total_users,
        total_interviews=total_interviews,
        average_score=round(avg_score, 1),
        popular_roles=popular_roles,
        recent_signups=recent_signups,
        active_users_today=active_today
    )


@router.get("/users")
async def get_users(
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    admin_user=Depends(get_admin_user)
):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return [
        {
            "id": u.id, "email": u.email, "username": u.username,
            "full_name": u.full_name, "total_interviews": u.total_interviews,
            "is_active": u.is_active, "is_admin": u.is_admin,
            "created_at": u.created_at, "streak": u.streak
        }
        for u in users
    ]
