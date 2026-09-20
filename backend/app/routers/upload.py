import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from app.config import settings
from app.utils.document_parser import extract_text, get_file_extension

router = APIRouter(prefix="/api/upload", tags=["Upload"])

ALLOWED_EXTENSIONS = {"pdf", "docx", "pptx", "txt", "md", "markdown"}


@router.post("", response_model=schemas.UploadedFileOut)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ext = get_file_extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    stored_name = f"{uuid.uuid4().hex}.{ext}"
    stored_path = os.path.join(settings.UPLOAD_DIR, stored_name)

    with open(stored_path, "wb") as f:
        f.write(contents)

    try:
        extracted_text = extract_text(stored_path, ext)
    except Exception as exc:
        os.remove(stored_path)
        raise HTTPException(status_code=422, detail=f"Failed to parse file: {exc}")

    if not extracted_text or len(extracted_text.strip()) < 5:
        os.remove(stored_path)
        raise HTTPException(status_code=422, detail="No readable text found in this file.")

    db_file = models.UploadedFile(
        user_id=current_user.id,
        filename=file.filename,
        stored_path=stored_path,
        file_type=ext,
        extracted_text=extracted_text,
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return db_file


@router.get("", response_model=list[schemas.UploadedFileOut])
def list_files(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.UploadedFile)
        .filter(models.UploadedFile.user_id == current_user.id)
        .order_by(models.UploadedFile.uploaded_at.desc())
        .all()
    )


@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_file = (
        db.query(models.UploadedFile)
        .filter(models.UploadedFile.id == file_id, models.UploadedFile.user_id == current_user.id)
        .first()
    )
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    if os.path.exists(db_file.stored_path):
        os.remove(db_file.stored_path)

    db.delete(db_file)
    db.commit()
    return {"detail": "File deleted successfully"}


def get_source_text(db: Session, current_user: models.User, file_id, text) -> str:
    if text and text.strip():
        return text.strip()
    if file_id:
        db_file = (
            db.query(models.UploadedFile)
            .filter(models.UploadedFile.id == file_id, models.UploadedFile.user_id == current_user.id)
            .first()
        )
        if not db_file:
            raise HTTPException(status_code=404, detail="File not found")
        return db_file.extracted_text
    raise HTTPException(status_code=400, detail="Provide either file_id or text")
