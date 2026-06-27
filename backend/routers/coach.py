from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import List

from database import get_db
import models
from utils.auth import get_current_user
from services.gemini import generate_coach_plan, _chat

router = APIRouter()


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class CoachChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []


@router.get("/plan")
async def get_coach_plan(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    recent = db.query(models.CoachPlan).filter(
        models.CoachPlan.user_id == current_user.id
    ).order_by(models.CoachPlan.generated_at.desc()).first()

    if recent:
        from datetime import timedelta
        if (datetime.utcnow() - recent.generated_at).total_seconds() < 86400:
            return {
                "weekly_plan": recent.weekly_plan,
                "recommended_skills": recent.recommended_skills,
                "learning_roadmap": recent.learning_roadmap,
                "preparation_strategy": recent.preparation_strategy,
                "generated_at": recent.generated_at
            }

    completed = [i for i in current_user.interviews if i.status == "completed"]
    roles = list(set(i.role for i in completed)) if completed else ["Software Engineer"]
    avg_score = (sum(i.overall_score for i in completed) / len(completed)) if completed else 0

    history = [
        {"role": i.role, "difficulty": i.difficulty, "score": i.overall_score}
        for i in completed[-10:]
    ]

    plan = await generate_coach_plan(
        user_data={"total_interviews": len(completed), "avg_score": avg_score, "roles": roles},
        interview_history=history
    )

    coach_plan = models.CoachPlan(
        user_id=current_user.id,
        weekly_plan=plan.get("weekly_plan", []),
        recommended_skills=plan.get("recommended_skills", []),
        learning_roadmap=plan.get("learning_roadmap", []),
        preparation_strategy=plan.get("preparation_strategy", "")
    )
    db.add(coach_plan)
    db.commit()

    return {**plan, "generated_at": coach_plan.generated_at}


@router.post("/chat")
async def coach_chat(
    request: CoachChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Interactive AI coach chat endpoint."""
    completed = [i for i in current_user.interviews if i.status == "completed"]
    avg_score = (sum(i.overall_score for i in completed) / len(completed)) if completed else 0
    roles = list(set(i.role for i in completed)) if completed else []

    recent_history = ""
    if completed:
        recent_history = "\n".join(
            f"- {i.role} ({i.difficulty}): {i.overall_score:.0f}/100"
            for i in completed[-5:]
        )

    system_context = f"""You are ARYA, an elite AI career coach specializing in technical interview preparation. You are direct, expert, and genuinely helpful — like a senior engineer who mentors juniors.

Candidate profile:
- Name: {current_user.full_name or current_user.username}
- Interviews completed: {len(completed)}
- Average score: {avg_score:.1f}/100
- Target roles: {', '.join(roles) if roles else 'Not specified yet'}
- Recent sessions: {recent_history or 'No sessions yet'}

Your coaching style:
- Be direct and specific, not vague
- Give concrete examples, not generic advice
- Ask follow-up questions to understand their specific situation
- Reference their actual interview data when relevant
- Keep responses concise — 3-5 sentences max unless they ask for detail
- Never use bullet points unless explicitly asked
- Sound like a human mentor, not a chatbot"""

    # Build messages for Groq
    messages = [{"role": "system", "content": system_context}]
    for msg in request.history[-10:]:  # last 10 messages for context
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.message})

    try:
        from groq import Groq
        import os
        client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))
        import json

        GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=400,
        )
        reply = response.choices[0].message.content or "I couldn't process that. Please try again."
    except Exception as e:
        print(f"[Groq] coach chat error: {e}")
        reply = "I'm having trouble connecting right now. Make sure your GROQ_API_KEY is set correctly in your .env file."

    return {"reply": reply}
