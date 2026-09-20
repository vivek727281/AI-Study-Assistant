import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Layers, Shuffle, ChevronLeft, ChevronRight, Sparkles, RotateCcw } from 'lucide-react'
import api from '../api/axios'
import Card from '../components/Card.jsx'
import Loader from '../components/Loader.jsx'

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Flashcards() {
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState('')
  const [numCards, setNumCards] = useState(10)
  const [cardSet, setCardSet] = useState(null)
  const [cards, setCards] = useState([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/upload').then(({ data }) => setFiles(data))
  }, [])

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast.error('Please select a study file')
      return
    }
    setLoading(true)
    setCardSet(null)
    try {
      const { data } = await api.post('/flashcards', { file_id: Number(selectedFile), num_cards: numCards })
      setCardSet(data)
      setCards(data.cards)
      setCurrent(0)
      setFlipped(false)
      toast.success('Flashcards generated!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate flashcards')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    setFlipped(false)
    setCurrent((c) => (c + 1) % cards.length)
  }
  const handlePrev = () => {
    setFlipped(false)
    setCurrent((c) => (c - 1 + cards.length) % cards.length)
  }
  const handleShuffle = () => {
    setCards(shuffleArray(cards))
    setCurrent(0)
    setFlipped(false)
    toast.success('Cards shuffled')
  }
  const handleReset = () => {
    setCardSet(null)
    setCards([])
    setCurrent(0)
  }

  if (loading) return <Loader text="Creating your flashcards..." />

  if (cardSet) {
    const card = cards[current]
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-title">{cardSet.title}</h1>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {current + 1} / {cards.length}
          </span>
        </div>

        <div className="relative h-72" style={{ perspective: 1200 }}>
          <motion.div
            className="absolute inset-0 cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setFlipped(!flipped)}
          >
            <div
              className="absolute inset-0 rounded-2xl bg-gradient-brand shadow-glow flex items-center justify-center p-8 text-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-white/70 font-semibold mb-3">Question</p>
                <p className="text-white text-xl font-bold">{card.question}</p>
              </div>
            </div>
            <div
              className="absolute inset-0 rounded-2xl glass-card flex items-center justify-center p-8 text-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-500 font-semibold mb-3">Answer</p>
                <p className="text-lg font-semibold">{card.answer}</p>
              </div>
            </div>
          </motion.div>
        </div>
        <p className="text-center text-xs text-gray-400">Click the card to flip</p>

        <div className="flex items-center justify-center gap-3">
          <button onClick={handlePrev} className="btn-secondary"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={handleShuffle} className="btn-secondary"><Shuffle className="w-4 h-4" /> Shuffle</button>
          <button onClick={handleReset} className="btn-secondary"><RotateCcw className="w-4 h-4" /> New Set</button>
          <button onClick={handleNext} className="btn-secondary"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Generate Flashcards</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Quick revision cards from your study material</p>
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
            <label className="text-sm font-medium mb-1.5 block">Number of Cards: {numCards}</label>
            <input
              type="range"
              min="5"
              max="30"
              value={numCards}
              onChange={(e) => setNumCards(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>
        <button onClick={handleGenerate} className="btn-primary w-full">
          <Layers className="w-4 h-4" /> Generate Flashcards
        </button>
      </Card>
    </div>
  )
}
