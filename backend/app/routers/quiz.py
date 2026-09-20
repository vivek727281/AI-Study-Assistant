import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from app.utils.ai_service import generate_quiz
from app.routers.upload import get_source_text

router = APIRouter(prefix="/api/quiz", tags=["Quiz"])


@router.post("", response_model=schemas.QuizOut)
def create_quiz(
    payload: schemas.QuizRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    source_text = get_source_text(db, current_user, payload.file_id, payload.text)
    questions = generate_quiz(source_text, payload.num_questions)

    title = "Quiz"
    if payload.file_id:
        db_file = db.query(models.UploadedFile).filter(models.UploadedFile.id == payload.file_id).first()
        if db_file:
            title = f"Quiz on {db_file.filename}"

    quiz = models.Quiz(
        user_id=current_user.id,
        file_id=payload.file_id,
        title=title,
        questions_json=json.dumps(questions),
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    return schemas.QuizOut(
        id=quiz.id, title=quiz.title, questions=questions, created_at=quiz.created_at
    )


@router.get("", response_model=list[dict])
def list_quizzes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    quizzes = (
        db.query(models.Quiz)
        .filter(models.Quiz.user_id == current_user.id)
        .order_by(models.Quiz.created_at.desc())
        .all()
    )
    return [
        {
            "id": q.id,
            "title": q.title,
            "score": q.score,
            "created_at": q.created_at,
            "num_questions": len(json.loads(q.questions_json)),
        }
        for q in quizzes
    ]


@router.get("/{quiz_id}", response_model=schemas.QuizOut)
def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    quiz = (
        db.query(models.Quiz)
        .filter(models.Quiz.id == quiz_id, models.Quiz.user_id == current_user.id)
        .first()
    )
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return schemas.QuizOut(
        id=quiz.id,
        title=quiz.title,
        questions=json.loads(quiz.questions_json),
        created_at=quiz.created_at,
    )


@router.post("/submit", response_model=schemas.QuizResultOut)
def submit_quiz(
    payload: schemas.QuizSubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    quiz = (
        db.query(models.Quiz)
        .filter(models.Quiz.id == payload.quiz_id, models.Quiz.user_id == current_user.id)
        .first()
    )
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = json.loads(quiz.questions_json)
    if len(payload.answers) != len(questions):
        raise HTTPException(status_code=400, detail="Answer count does not match question count")

    correct_count = 0
    details = []
    for q, user_answer in zip(questions, payload.answers):
        is_correct = user_answer.strip() == q["correct_answer"].strip()
        if is_correct:
            correct_count += 1
        details.append({
            "question": q["question"],
            "options": q["options"],
            "correct_answer": q["correct_answer"],
            "user_answer": user_answer,
            "is_correct": is_correct,
            "explanation": q.get("explanation", ""),
        })

    score = round((correct_count / len(questions)) * 100, 2)
    quiz.score = score
    db.commit()

    return schemas.QuizResultOut(
        quiz_id=quiz.id,
        score=score,
        total=len(questions),
        correct=correct_count,
        details=details,
    )
