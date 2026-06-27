from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
import PyPDF2
import io

from database import get_db
import models, schemas
from utils.auth import get_current_user
from services.gemini import generate_resume_questions

router = APIRouter()


@router.post("/upload-and-start", response_model=schemas.InterviewResponse)
async def upload_resume_and_start(
    role: str = Form(...),
    difficulty: str = Form(...),
    num_questions: int = Form(5),
    resume_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Upload resume and start a personalized interview."""
    if not resume_file.filename.endswith(('.pdf', '.txt')):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files supported")

    content = await resume_file.read()
    resume_text = ""

    if resume_file.filename.endswith('.pdf'):
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                resume_text += page.extract_text() + "\n"
        except Exception:
            raise HTTPException(status_code=400, detail="Could not parse PDF")
    else:
        resume_text = content.decode('utf-8', errors='ignore')

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from resume")

    interview = models.Interview(
        user_id=current_user.id,
        role=role,
        difficulty=difficulty,
        num_questions=num_questions,
        status="in_progress",
        resume_used=True,
        resume_text=resume_text[:5000]
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    questions_data = await generate_resume_questions(
        resume_text=resume_text,
        role=role,
        num_questions=num_questions
    )

    for i, q_data in enumerate(questions_data[:num_questions]):
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
