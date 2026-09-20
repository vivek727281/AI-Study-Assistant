import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { ListChecks, Sparkles, CheckCircle2, XCircle, RotateCcw, Download } from 'lucide-react'
import api from '../api/axios'
import Card from '../components/Card.jsx'
import Loader from '../components/Loader.jsx'

export default function Quiz() {
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState('')
  const [numQuestions, setNumQuestions] = useState(10)
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState([])
  const [current, setCurrent] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get('/upload').then(({ data }) => setFiles(data))
  }, [])

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast.error('Please select a study file')
      return
    }
    setLoading(true)
    setQuiz(null)
    setResult(null)
    try {
      const { data } = await api.post('/quiz', { file_id: Number(selectedFile), num_questions: numQuestions })
      setQuiz(data)
      setAnswers(new Array(data.questions.length).fill(null))
      setCurrent(0)
      toast.success('Quiz generated!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate quiz')
    } finally {
      setLoading(false)
    }
  }

  const selectAnswer = (option) => {
    const updated = [...answers]
    updated[current] = option
    setAnswers(updated)
  }

  const handleSubmit = async () => {
    if (answers.some((a) => a === null)) {
      toast.error('Please answer all questions')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/quiz/submit', { quiz_id: quiz.id, answers })
      setResult(data)
    } catch (err) {
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownload = async (fmt) => {
    try {
      const res = await api.get(`/download/quiz/${quiz.id}/${fmt}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `quiz_${quiz.id}.${fmt}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      toast.error('Download failed')
    }
  }

  const resetQuiz = () => {
    setQuiz(null)
    setResult(null)
    setAnswers([])
    setCurrent(0)
  }

  if (loading) return <Loader text="Generating your quiz..." />

  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card hover={false} className="text-center py-10">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-brand flex items-center justify-center shadow-glow mb-4">
            <span className="text-2xl font-extrabold text-white">{result.score}%</span>
          </div>
          <h1 className="text-2xl font-extrabold mb-1">Quiz Complete!</h1>
          <p className="text-gray-500 dark:text-gray-400">
            You scored {result.correct} out of {result.total} correct
          </p>
          <div className="flex justify-center gap-3 mt-6 flex-wrap">
            <button onClick={resetQuiz} className="btn-secondary"><RotateCcw className="w-4 h-4" /> New Quiz</button>
            <button onClick={() => handleDownload('pdf')} className="btn-secondary"><Download className="w-4 h-4" /> PDF</button>
            <button onClick={() => handleDownload('docx')} className="btn-secondary"><Download className="w-4 h-4" /> DOCX</button>
          </div>
        </Card>

        <div className="space-y-3">
          {result.details.map((d, i) => (
            <Card key={i} hover={false} className="p-4">
              <div className="flex items-start gap-3">
                {d.is_correct ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{i + 1}. {d.question}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Your answer: <span className={d.is_correct ? 'text-emerald-600' : 'text-red-500'}>{d.user_answer}</span>
                  </p>
                  {!d.is_correct && (
                    <p className="text-xs text-emerald-600 mt-0.5">Correct answer: {d.correct_answer}</p>
                  )}
                  {d.explanation && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{d.explanation}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (quiz) {
    const q = quiz.questions[current]
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-title">{quiz.title}</h1>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {current + 1} / {quiz.questions.length}
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
          <motion.div
            animate={{ width: `${((current + 1) / quiz.questions.length) * 100}%` }}
            className="h-full bg-gradient-brand"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Card hover={false}>
              <p className="font-semibold text-lg mb-5">{q.question}</p>
              <div className="space-y-3">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => selectAnswer(opt)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      answers[current] === opt
                        ? 'bg-gradient-brand text-white border-transparent shadow-glow'
                        : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="btn-secondary disabled:opacity-40"
          >
            Previous
          </button>
          {current === quiz.questions.length - 1 ? (
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button onClick={() => setCurrent((c) => Math.min(quiz.questions.length - 1, c + 1))} className="btn-primary">
              Next
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Generate Quiz</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Test your knowledge with AI-generated MCQs</p>
      </div>

      <Card hover={false}>
        <div className="space-y-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Study File</label>
            <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)} className="input-field">
              <option value="">Select a file...</option>
              {files.map((f) => (
                <option key={f.id} value={f.id}>{f.filename}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Number of Questions: {numQuestions}</label>
            <input
              type="range"
              min="5"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>
        <button onClick={handleGenerate} className="btn-primary w-full">
          <ListChecks className="w-4 h-4" /> Generate Quiz
        </button>
      </Card>
    </div>
  )
}
