from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.dependencies import get_current_user
from app.utils.export_service import export_to_markdown, export_to_docx, export_to_pdf

router = APIRouter(prefix="/api/download", tags=["Export"])

MEDIA_TYPES = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "md": "text/markdown",
}


@router.get("/summary/{summary_id}/{fmt}")
def download_summary(
    summary_id: int,
    fmt: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if fmt not in MEDIA_TYPES:
        raise HTTPException(status_code=400, detail="Format must be pdf, docx, or md")

    summary = (
        db.query(models.Summary)
        .filter(models.Summary.id == summary_id, models.Summary.user_id == current_user.id)
        .first()
    )
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")

    content = _export(summary.title, summary.content, fmt)
    filename = f"summary_{summary_id}.{fmt}"
    return Response(
        content=content,
        media_type=MEDIA_TYPES[fmt],
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/flashcards/{set_id}/{fmt}")
def download_flashcards(
    set_id: int,
    fmt: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    import json
    if fmt not in MEDIA_TYPES:
        raise HTTPException(status_code=400, detail="Format must be pdf, docx, or md")

    fc_set = (
        db.query(models.FlashcardSet)
        .filter(models.FlashcardSet.id == set_id, models.FlashcardSet.user_id == current_user.id)
        .first()
    )
    if not fc_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")

    cards = json.loads(fc_set.cards_json)
    body = "\n\n".join([f"Q: {c['question']}\nA: {c['answer']}" for c in cards])
    content = _export(fc_set.title, body, fmt)
    filename = f"flashcards_{set_id}.{fmt}"
    return Response(
        content=content,
        media_type=MEDIA_TYPES[fmt],
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/quiz/{quiz_id}/{fmt}")
def download_quiz(
    quiz_id: int,
    fmt: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    import json
    if fmt not in MEDIA_TYPES:
        raise HTTPException(status_code=400, detail="Format must be pdf, docx, or md")

    quiz = (
        db.query(models.Quiz)
        .filter(models.Quiz.id == quiz_id, models.Quiz.user_id == current_user.id)
        .first()
    )
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = json.loads(quiz.questions_json)
    lines = []
    for i, q in enumerate(questions, start=1):
        lines.append(f"{i}. {q['question']}")
        for opt in q["options"]:
            lines.append(f"   - {opt}")
        lines.append(f"   Correct Answer: {q['correct_answer']}")
        lines.append("")
    content = _export(quiz.title, "\n".join(lines), fmt)
    filename = f"quiz_{quiz_id}.{fmt}"
    return Response(
        content=content,
        media_type=MEDIA_TYPES[fmt],
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _export(title: str, content: str, fmt: str) -> bytes:
    if fmt == "pdf":
        return export_to_pdf(title, content)
    if fmt == "docx":
        return export_to_docx(title, content)
    return export_to_markdown(title, content)
