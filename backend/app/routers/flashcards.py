import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from app.utils.ai_service import generate_flashcards
from app.routers.upload import get_source_text

router = APIRouter(prefix="/api/flashcards", tags=["Flashcards"])


@router.post("", response_model=schemas.FlashcardOut)
def create_flashcards(
    payload: schemas.FlashcardRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    source_text = get_source_text(db, current_user, payload.file_id, payload.text)
    cards = generate_flashcards(source_text, payload.num_cards)

    title = "Flashcards"
    if payload.file_id:
        db_file = db.query(models.UploadedFile).filter(models.UploadedFile.id == payload.file_id).first()
        if db_file:
            title = f"Flashcards for {db_file.filename}"

    fc_set = models.FlashcardSet(
        user_id=current_user.id,
        file_id=payload.file_id,
        title=title,
        cards_json=json.dumps(cards),
    )
    db.add(fc_set)
    db.commit()
    db.refresh(fc_set)

    return schemas.FlashcardOut(
        id=fc_set.id, title=fc_set.title, cards=cards, created_at=fc_set.created_at
    )


@router.get("", response_model=list[dict])
def list_flashcard_sets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    sets = (
        db.query(models.FlashcardSet)
        .filter(models.FlashcardSet.user_id == current_user.id)
        .order_by(models.FlashcardSet.created_at.desc())
        .all()
    )
    return [
        {
            "id": s.id,
            "title": s.title,
            "created_at": s.created_at,
            "num_cards": len(json.loads(s.cards_json)),
        }
        for s in sets
    ]


@router.get("/{set_id}", response_model=schemas.FlashcardOut)
def get_flashcard_set(
    set_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    fc_set = (
        db.query(models.FlashcardSet)
        .filter(models.FlashcardSet.id == set_id, models.FlashcardSet.user_id == current_user.id)
        .first()
    )
    if not fc_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")
    return schemas.FlashcardOut(
        id=fc_set.id,
        title=fc_set.title,
        cards=json.loads(fc_set.cards_json),
        created_at=fc_set.created_at,
    )
