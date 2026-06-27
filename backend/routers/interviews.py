from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from typing import List, Optional

from database import get_db
import models, schemas
from utils.auth import get_current_user
from services.gemini import (
    generate_interview_questions, evaluate_answer,
    generate_interview_report
)

router = APIRouter()


@router.post("/start", response_model=schemas.InterviewResponse)
async def start_interview(
    interview_data: schemas.InterviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Start a new interview session."""
    interview = models.Interview(
        user_id=current_user.id,
        role=interview_data.role,
        difficulty=interview_data.difficulty,
        num_questions=interview_data.num_questions,
        status="in_progress",
        resume_used=bool(interview_data.resume_text),
        resume_text=interview_data.resume_text
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    # Generate questions
    questions_data = await generate_interview_questions(
        role=interview_data.role,
        difficulty=interview_data.difficulty,
        num_questions=interview_data.num_questions,
        resume_text=interview_data.resume_text
    )

    for i, q_data in enumerate(questions_data[:interview_data.num_questions]):
        question = models.Question(
            interview_id=interview.id,
            question_text=q_data.get("question_text", ""),
            question_type=q_data.get("question_type", "technical"),
            ideal_answer_hints=q_data.get("ideal_answer_hints", ""),
            order_num=i + 1
        )
        db.add(question)

    db.commit()
    db.refresh(interview)
    return interview


@router.get("/", response_model=List[schemas.InterviewResponse])
async def get_interviews(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    interviews = (
        db.query(models.Interview)
        .filter(models.Interview.user_id == current_user.id)
        .order_by(desc(models.Interview.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return interviews


@router.get("/{interview_id}", response_model=schemas.InterviewResponse)
async def get_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    interview = db.query(models.Interview).filter(
        models.Interview.id == interview_id,
        models.Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview


@router.post("/{interview_id}/answer")
async def submit_answer(
    interview_id: int,
    answer_data: schemas.AnswerSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Submit an answer for evaluation."""
    interview = db.query(models.Interview).filter(
        models.Interview.id == interview_id,
        models.Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    question = db.query(models.Question).filter(
        models.Question.id == answer_data.question_id,
        models.Question.interview_id == interview_id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Evaluate with Groq
    evaluation = await evaluate_answer(
        question=question.question_text,
        answer=answer_data.answer_text,
        role=interview.role,
        difficulty=interview.difficulty,
        question_type=question.question_type,
        ideal_hints=question.ideal_answer_hints or ""
    )

    question.answer_text = answer_data.answer_text
    question.score = evaluation.get("overall_score", 50)
    question.accuracy_score = evaluation.get("accuracy_score", 50)
    question.clarity_score = evaluation.get("clarity_score", 50)
    question.depth_score = evaluation.get("depth_score", 50)
    question.communication_score = evaluation.get("communication_score", 50)
    question.feedback = evaluation.get("feedback", "")
    db.commit()

    return {
        "question_id": question.id,
        "score": question.score,
        "feedback": question.feedback,
        "accuracy_score": question.accuracy_score,
        "clarity_score": question.clarity_score,
        "depth_score": question.depth_score,
        "communication_score": question.communication_score,
        "strengths_shown": evaluation.get("strengths_shown", []),
        "areas_to_improve": evaluation.get("areas_to_improve", [])
    }


@router.post("/{interview_id}/complete", response_model=schemas.InterviewResponse)
async def complete_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Complete an interview and generate final report."""
    interview = db.query(models.Interview).filter(
        models.Interview.id == interview_id,
        models.Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    answered_questions = [q for q in interview.questions if q.answer_text]
    if not answered_questions:
        raise HTTPException(status_code=400, detail="No answers submitted")

    # Calculate aggregate scores
    technical_qs = [q for q in answered_questions if q.question_type == "technical"]
    comm_qs = [q for q in answered_questions if q.question_type in ["behavioral", "hr", "situational"]]

    overall_score = sum(q.score for q in answered_questions) / len(answered_questions)
    technical_score = (sum(q.score for q in technical_qs) / len(technical_qs)) if technical_qs else overall_score
    communication_score = (sum(q.score for q in comm_qs) / len(comm_qs)) if comm_qs else overall_score
    clarity_score = sum(q.clarity_score for q in answered_questions) / len(answered_questions)
    depth_score = sum(q.depth_score for q in answered_questions) / len(answered_questions)
    confidence_score = sum(q.accuracy_score for q in answered_questions) / len(answered_questions)

    # Generate report
    qa_data = [
        {
            "question": q.question_text,
            "answer": q.answer_text or "",
            "type": q.question_type,
            "score": q.score
        }
        for q in answered_questions
    ]

    report = await generate_interview_report(
        role=interview.role,
        difficulty=interview.difficulty,
        questions_and_answers=qa_data,
        scores={"overall": overall_score, "technical": technical_score, "communication": communication_score}
    )

    # Update interview
    interview.status = "completed"
    interview.overall_score = overall_score
    interview.technical_score = technical_score
    interview.communication_score = communication_score
    interview.clarity_score = clarity_score
    interview.depth_score = depth_score
    interview.confidence_score = confidence_score
    interview.strengths = report.get("strengths", [])
    interview.weaknesses = report.get("weaknesses", [])
    interview.missed_concepts = report.get("missed_concepts", [])
    interview.recommended_topics = report.get("recommended_topics", [])
    interview.improvement_plan = report.get("improvement_plan", "")
    interview.completed_at = datetime.utcnow()

    # Update user stats
    current_user.total_interviews += 1
    current_user.streak += 1

    # Check achievements
    _check_achievements(db, current_user, interview)

    db.commit()
    db.refresh(interview)
    return interview


@router.delete("/{interview_id}")
async def delete_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    interview = db.query(models.Interview).filter(
        models.Interview.id == interview_id,
        models.Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    db.delete(interview)
    db.commit()
    return {"message": "Interview deleted"}


def _check_achievements(db: Session, user: models.User, interview: models.Interview):
    """Check and award achievements."""
    existing = {a.title for a in user.achievements}

    def award(title, description, icon):
        if title not in existing:
            db.add(models.Achievement(
                user_id=user.id, title=title,
                description=description, icon=icon
            ))

    if user.total_interviews == 1:
        award("First Interview", "Completed your first mock interview!", "🎯")
    if user.total_interviews == 10:
        award("Interview Pro", "Completed 10 mock interviews!", "⭐")
    if user.total_interviews == 50:
        award("Interview Master", "Completed 50 mock interviews!", "🏆")
    if interview.overall_score >= 90:
        award("Top Performer", "Scored 90+ in an interview!", "🥇")
    if interview.overall_score >= 80:
        award("High Achiever", "Scored 80+ in an interview!", "🎖️")
    if user.streak >= 7:
        award("Week Warrior", "7-day interview streak!", "🔥")
    if user.streak >= 30:
        award("Monthly Champion", "30-day interview streak!", "💎")
