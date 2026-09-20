import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, ListChecks, Layers, MessageSquareText, History as HistoryIcon } from 'lucide-react'
import api from '../api/axios'
import Card from '../components/Card.jsx'
import Loader from '../components/Loader.jsx'

const TABS = [
  { key: 'summaries', label: 'Summaries', icon: FileText },
  { key: 'quizzes', label: 'Quizzes', icon: ListChecks },
  { key: 'flashcards', label: 'Flashcards', icon: Layers },
  { key: 'chats', label: 'Q&A Chats', icon: MessageSquareText },
]

export default function History() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('summaries')

  useEffect(() => {
    api.get('/history').then(({ data }) => setData(data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader text="Loading your history..." />

  const items = data?.[tab] || []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">History</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Review everything you've generated</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              tab === key
                ? 'bg-gradient-brand text-white border-transparent shadow-glow'
                : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <Card hover={false} className="text-center py-16">
          <HistoryIcon className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No {tab} yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card hover={false} className="p-4">
                {tab === 'summaries' && (
                  <>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.content}</p>
                  </>
                )}
                {tab === 'quizzes' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.num_questions} questions</p>
                    </div>
                    {item.score !== null && (
                      <span className="text-sm font-bold gradient-text">{item.score}%</span>
                    )}
                  </div>
                )}
                {tab === 'flashcards' && (
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.num_cards} cards</p>
                  </div>
                )}
                {tab === 'chats' && (
                  <div>
                    <p className="font-semibold text-sm">Q: {item.question}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">A: {item.answer}</p>
                  </div>
                )}
                <p className="text-[11px] text-gray-400 mt-2">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
