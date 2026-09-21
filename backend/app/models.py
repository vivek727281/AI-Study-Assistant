from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    profile_image = Column(String(500), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    files = relationship("UploadedFile", back_populates="owner", cascade="all, delete-orphan")
    chats = relationship("ChatHistory", back_populates="owner", cascade="all, delete-orphan")
    summaries = relationship("Summary", back_populates="owner", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="owner", cascade="all, delete-orphan")
    flashcard_sets = relationship("FlashcardSet", back_populates="owner", cascade="all, delete-orphan")


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    stored_path = Column(String(500), nullable=False)
    file_type = Column(String(20), nullable=False)
    extracted_text = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="files")
    summaries = relationship("Summary", back_populates="source_file", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="source_file", cascade="all, delete-orphan")
    flashcard_sets = relationship("FlashcardSet", back_populates="source_file", cascade="all, delete-orphan")
    chats = relationship("ChatHistory", back_populates="source_file", cascade="all, delete-orphan")


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("uploaded_files.id"), nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="chats")
    source_file = relationship("UploadedFile", back_populates="chats")


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("uploaded_files.id"), nullable=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="summaries")
    source_file = relationship("UploadedFile", back_populates="summaries")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("uploaded_files.id"), nullable=True)
    title = Column(String(255), nullable=False)
    questions_json = Column(Text, nullable=False)
    score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="quizzes")
    source_file = relationship("UploadedFile", back_populates="quizzes")


class FlashcardSet(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("uploaded_files.id"), nullable=True)
    title = Column(String(255), nullable=False)
    cards_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="flashcard_sets")
    source_file = relationship("UploadedFile", back_populates="flashcard_sets")
