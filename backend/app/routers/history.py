import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("")
def get_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    summaries = (
        db.query(models.Summary)
        .filter(models.Summary.user_id == current_user.id)
        .order_by(models.Summary.created_at.desc())
        .all()
    )
    quizzes = (
        db.query(models.Quiz)
        .filter(models.Quiz.user_id == current_user.id)
        .order_by(models.Quiz.created_at.desc())
        .all()
    )
    flashcards = (
        db.query(models.FlashcardSet)
        .filter(models.FlashcardSet.user_id == current_user.id)
        .order_by(models.FlashcardSet.created_at.desc())
        .all()
    )
    chats = (
        db.query(models.ChatHistory)
        .filter(models.ChatHistory.user_id == current_user.id)
        .order_by(models.ChatHistory.created_at.desc())
        .limit(50)
        .all()
    )

    return {
        "summaries": [
            {"id": s.id, "title": s.title, "content": s.content, "created_at": s.created_at}
            for s in summaries
        ],
        "quizzes": [
            {
                "id": q.id, "title": q.title, "score": q.score,
                "num_questions": len(json.loads(q.questions_json)),
                "created_at": q.created_at,
            }
            for q in quizzes
        ],
        "flashcards": [
            {
                "id": f.id, "title": f.title,
                "num_cards": len(json.loads(f.cards_json)),
                "created_at": f.created_at,
            }
            for f in flashcards
        ],
        "chats": [
            {"id": c.id, "question": c.question, "answer": c.answer, "created_at": c.created_at}
            for c in chats
        ],
    }


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    files_count = db.query(models.UploadedFile).filter(models.UploadedFile.user_id == current_user.id).count()
    summaries_count = db.query(models.Summary).filter(models.Summary.user_id == current_user.id).count()
    quizzes = db.query(models.Quiz).filter(models.Quiz.user_id == current_user.id).all()
    flashcards_count = db.query(models.FlashcardSet).filter(models.FlashcardSet.user_id == current_user.id).count()
    chats_count = db.query(models.ChatHistory).filter(models.ChatHistory.user_id == current_user.id).count()

    scored = [q.score for q in quizzes if q.score is not None]
    avg_score = round(sum(scored) / len(scored), 2) if scored else 0

    return {
        "files_uploaded": files_count,
        "summaries_generated": summaries_count,
        "quizzes_taken": len(quizzes),
        "flashcard_sets": flashcards_count,
        "questions_asked": chats_count,
        "average_quiz_score": avg_score,
    }
