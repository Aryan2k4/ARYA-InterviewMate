from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
import models
from utils.auth import get_current_user

router = APIRouter()


@router.get("/")
async def get_leaderboard(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    users = db.query(models.User).filter(
        models.User.is_active == True,
        models.User.total_interviews > 0
    ).all()

    entries = []
    for user in users:
        completed = [i for i in user.interviews if i.status == "completed"]
        if not completed:
            continue
        avg_score = sum(i.overall_score for i in completed) / len(completed)
        best_score = max(i.overall_score for i in completed)
        entries.append({
            "user_id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "total_interviews": user.total_interviews,
            "average_score": round(avg_score, 1),
            "streak": user.streak,
            "best_score": round(best_score, 1),
            "achievements": len(user.achievements)
        })

    entries.sort(key=lambda x: x["average_score"], reverse=True)
    for i, entry in enumerate(entries):
        entry["rank"] = i + 1

    return entries[:limit]


@router.get("/my-rank")
async def get_my_rank(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    all_users = db.query(models.User).filter(models.User.is_active == True).all()
    scores = []
    for user in all_users:
        completed = [i for i in user.interviews if i.status == "completed"]
        if completed:
            avg = sum(i.overall_score for i in completed) / len(completed)
            scores.append((user.id, avg))

    scores.sort(key=lambda x: x[1], reverse=True)
    rank = next((i + 1 for i, (uid, _) in enumerate(scores) if uid == current_user.id), None)

    return {"rank": rank, "total_users": len(scores)}
