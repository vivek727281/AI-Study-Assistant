import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import hash_password, verify_password, create_access_token
from app.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = create_access_token({"sub": str(user.id)})
    return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
@router.post("/profile-image", response_model=schemas.UserOut)
async def upload_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    allowed_types = {"image/jpeg", "image/png", "image/webp"}

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, and WEBP images are allowed",
        )

    contents = await file.read()

    max_size = 5 * 1024 * 1024
    if len(contents) > max_size:
        raise HTTPException(
            status_code=400,
            detail="Profile image must be smaller than 5MB",
        )

    extension = file.filename.split(".")[-1].lower()
    stored_name = f"profile_{current_user.id}_{uuid.uuid4().hex}.{extension}"
    stored_path = os.path.join(settings.UPLOAD_DIR, stored_name)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    if current_user.profile_image:
        old_filename = os.path.basename(current_user.profile_image)
        old_path = os.path.join(settings.UPLOAD_DIR, old_filename)

        if os.path.exists(old_path):
            os.remove(old_path)

    with open(stored_path, "wb") as f:
        f.write(contents)

    current_user.profile_image = f"/uploads/{stored_name}"

    db.commit()
    db.refresh(current_user)

    return current_user
