from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from app.utils.ai_service import generate_summary
from app.routers.upload import get_source_text

router = APIRouter(prefix="/api/summary", tags=["Summary"])


@router.post("", response_model=schemas.SummaryOut)
def create_summary(
    payload: schemas.SummaryRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    source_text = get_source_text(db, current_user, payload.file_id, payload.text)
    content = generate_summary(source_text, payload.length)

    title = "Summary"
    if payload.file_id:
        db_file = db.query(models.UploadedFile).filter(models.UploadedFile.id == payload.file_id).first()
        if db_file:
            title = f"Summary of {db_file.filename}"

    summary = models.Summary(
        user_id=current_user.id,
        file_id=payload.file_id,
        title=title,
        content=content,
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return summary


@router.get("", response_model=list[schemas.SummaryOut])
def list_summaries(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Summary)
        .filter(models.Summary.user_id == current_user.id)
        .order_by(models.Summary.created_at.desc())
        .all()
    )


@router.get("/{summary_id}", response_model=schemas.SummaryOut)
def get_summary(
    summary_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from fastapi import HTTPException
    summary = (
        db.query(models.Summary)
        .filter(models.Summary.id == summary_id, models.Summary.user_id == current_user.id)
        .first()
    )
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return summary
