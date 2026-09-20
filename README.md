# 🧠 AI Study Assistant

An AI-powered Study Assistant web application that helps students **summarize**, **question**, **quiz**, and **revise** their study material using a **100% local, free, open-source LLM** (Llama 3.2 via Ollama) — no paid APIs required.

Built as a Full Stack MCA Minor Project.

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT-based register/login with bcrypt password hashing
- 📂 **Multi-format Upload** — PDF, DOCX, PPTX, TXT, Markdown
- 📝 **AI Summarization** — Short / Medium / Detailed summaries
- 💬 **AI Chat (Q&A)** — Ask questions about your uploaded notes
- ❓ **Quiz Generator** — Auto-generated 10-question MCQ quizzes with instant scoring
- 🗂️ **Flashcards** — Flip cards with shuffle, next/previous navigation
- 📊 **Dashboard** — Activity charts and quick stats
- 🕘 **History** — Review all past summaries, quizzes, flashcards & chats
- 📤 **Export** — Download summaries, quizzes, and flashcards as PDF, DOCX, or Markdown
- 🌗 **Dark Mode** — Full light/dark theme support
- 💎 **Premium UI** — Glassmorphism, gradients, and smooth Framer Motion animations

---

## 🧱 Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS
- React Router v6
- Axios
- Framer Motion
- Lucide Icons
- Recharts
- react-hot-toast

### Backend
- Python 3.13 + FastAPI
- SQLAlchemy ORM
- JWT Authentication (python-jose)
- Passlib (bcrypt) password hashing
- Pydantic v2

### Database
- SQLite

### AI
- [Ollama](https://ollama.com) running **Llama 3.2** locally (no API keys, no cost)

### Document Parsing
- PyMuPDF (PDF)
- python-docx (DOCX)
- python-pptx (PPTX)
- markdown (MD)

### Export
- ReportLab (PDF)
- python-docx (DOCX)

---

## 📁 Project Structure

```
study-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI entrypoint
│   │   ├── config.py               # Environment/config settings
│   │   ├── database.py             # SQLAlchemy engine/session
│   │   ├── models.py               # DB models (users, files, summaries...)
│   │   ├── schemas.py              # Pydantic request/response schemas
│   │   ├── auth.py                 # JWT + password hashing
│   │   ├── dependencies.py         # get_current_user dependency
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── upload.py
│   │   │   ├── summary.py
│   │   │   ├── qa.py
│   │   │   ├── quiz.py
│   │   │   ├── flashcards.py
│   │   │   ├── history.py
│   │   │   ├── download.py
│   │   │   └── health.py
│   │   └── utils/
│   │       ├── document_parser.py  # PDF/DOCX/PPTX/TXT/MD extraction
│   │       ├── ai_service.py       # Ollama/Llama 3.2 integration
│   │       └── export_service.py   # PDF/DOCX/Markdown export
│   ├── uploads/                    # Uploaded files storage
│   ├── database/                   # SQLite DB file
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── context/AuthContext.jsx
│   │   ├── components/             # Navbar, Sidebar, Card, Loader, ProtectedRoute
│   │   ├── pages/                  # Login, Register, Dashboard, Upload, Chat,
│   │   │                           # Summary, Quiz, Flashcards, History, Settings
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── docs/
└── README.md
```

---

## ⚙️ Prerequisites

1. **Python 3.13+**
2. **Node.js 18+** and npm
3. **Ollama** installed — [Download here](https://ollama.com/download)

### Install & Run Ollama with Llama 3.2

```bash
# Install Ollama (see https://ollama.com for your OS)

# Pull the Llama 3.2 model
ollama pull llama3.2

# Start the Ollama server (usually runs automatically after install)
ollama serve
```

Verify Ollama is running at `http://localhost:11434`.

---

## 🚀 Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# (On Windows: copy .env.example .env)

# Run the server
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: **http://localhost:8000**
Interactive API docs (Swagger): **http://localhost:8000/docs**

---

## 💻 Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

The Vite dev server proxies all `/api` requests to `http://localhost:8000`, so both servers must be running simultaneously.

---

## 🏗️ Production Build

```bash
cd frontend
npm run build
npm run preview
```

---

## 🗄️ Database Schema

| Table | Description |
|---|---|
| `users` | User accounts (name, email, hashed password) |
| `uploaded_files` | Uploaded study material + extracted text |
| `chat_history` | AI Q&A conversation history |
| `summaries` | Generated summaries |
| `quizzes` | Generated MCQ quizzes + scores |
| `flashcards` | Generated flashcard sets |

SQLite database is auto-created at `backend/database/study_assistant.db` on first run.

---

## 🔑 Environment Variables (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | JWT signing secret | change in production |
| `ALGORITHM` | JWT algorithm | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | 1440 (24h) |
| `DATABASE_URL` | SQLite connection string | sqlite:///./database/study_assistant.db |
| `UPLOAD_DIR` | File storage directory | ./uploads |
| `OLLAMA_BASE_URL` | Ollama server URL | http://localhost:11434 |
| `OLLAMA_MODEL` | Model name | llama3.2 |
| `CORS_ORIGINS` | Allowed frontend origins | http://localhost:5173 |
| `MAX_UPLOAD_SIZE_MB` | Max upload size | 25 |

---

## 🔒 Security

- Passwords hashed with **bcrypt**
- Stateless **JWT** authentication on all protected routes
- Pydantic input validation on every request
- CORS restricted to configured frontend origins
- Global exception handlers prevent stack trace leakage

---

## 📸 Screenshots

> _Add your application screenshots here for your project report._

| Page | Screenshot |
|---|---|
| Login | `docs/screenshots/login.png` |
| Dashboard | `docs/screenshots/dashboard.png` |
| Upload | `docs/screenshots/upload.png` |
| AI Chat | `docs/screenshots/chat.png` |
| Summary | `docs/screenshots/summary.png` |
| Quiz | `docs/screenshots/quiz.png` |
| Flashcards | `docs/screenshots/flashcards.png` |

---

## 🧪 API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/upload` | Upload & parse a study file |
| GET | `/api/upload` | List uploaded files |
| DELETE | `/api/upload/{id}` | Delete a file |
| POST | `/api/summary` | Generate AI summary |
| POST | `/api/qa` | Ask a question (AI Chat) |
| POST | `/api/quiz` | Generate MCQ quiz |
| POST | `/api/quiz/submit` | Submit quiz answers & get score |
| POST | `/api/flashcards` | Generate flashcards |
| GET | `/api/history` | Get all user history |
| GET | `/api/history/stats` | Get dashboard statistics |
| GET | `/api/download/{type}/{id}/{format}` | Export as pdf/docx/md |
| GET | `/api/health` | Health check + Ollama status |

Full interactive documentation available at `/docs` once the backend is running.

---

## 👨‍🎓 Author

MCA Minor Project — AI Study Assistant using Generative AI (Local LLM, No Paid APIs)
