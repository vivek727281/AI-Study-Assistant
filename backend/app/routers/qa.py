from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from app.utils.ai_service import answer_question
from app.routers.upload import get_source_text

router = APIRouter(prefix="/api/qa", tags=["Question Answering"])


@router.post("", response_model=schemas.QAOut)
def ask_question(
    payload: schemas.QARequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    source_text = get_source_text(db, current_user, payload.file_id, payload.text)
    answer = answer_question(source_text, payload.question)

    chat = models.ChatHistory(
        user_id=current_user.id,
        file_id=payload.file_id,
        question=payload.question,
        answer=answer,
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


@router.get("", response_model=list[schemas.QAOut])
def list_chat_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.ChatHistory)
        .filter(models.ChatHistory.user_id == current_user.id)
        .order_by(models.ChatHistory.created_at.desc())
        .all()
    )
