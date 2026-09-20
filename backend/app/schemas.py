from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


# ---------- Auth ----------
class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    email: EmailStr
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Files ----------
class UploadedFileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    filename: str
    file_type: str
    uploaded_at: datetime


# ---------- Summary ----------
class SummaryRequest(BaseModel):
    file_id: Optional[int] = None
    text: Optional[str] = None
    length: str = Field(default="medium", pattern="^(short|medium|long)$")


class SummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    content: str
    created_at: datetime


# ---------- QA ----------
class QARequest(BaseModel):
    file_id: Optional[int] = None
    text: Optional[str] = None
    question: str


class QAOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    question: str
    answer: str
    created_at: datetime


# ---------- Quiz ----------
class QuizRequest(BaseModel):
    file_id: Optional[int] = None
    text: Optional[str] = None
    num_questions: int = Field(default=10, ge=1, le=25)


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None


class QuizOut(BaseModel):
    id: int
    title: str
    questions: List[QuizQuestion]
    created_at: datetime


class QuizSubmitRequest(BaseModel):
    quiz_id: int
    answers: List[str]


class QuizResultOut(BaseModel):
    quiz_id: int
    score: float
    total: int
    correct: int
    details: List[dict]


# ---------- Flashcards ----------
class FlashcardRequest(BaseModel):
    file_id: Optional[int] = None
    text: Optional[str] = None
    num_cards: int = Field(default=10, ge=1, le=30)


class FlashcardItem(BaseModel):
    question: str
    answer: str


class FlashcardOut(BaseModel):
    id: int
    title: str
    cards: List[FlashcardItem]
    created_at: datetime


# ---------- History ----------
class HistoryOut(BaseModel):
    summaries: List[SummaryOut]
    quizzes: List[dict]
    flashcards: List[dict]
    chats: List[QAOut]
