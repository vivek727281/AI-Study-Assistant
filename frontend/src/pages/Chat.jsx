import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { MessageSquare, MessageSquareText, Send, ChevronDown, FileText } from 'lucide-react'
import api from '../api/axios'

export default function Chat() {
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState('')
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    api.get('/upload').then(({ data }) => setFiles(data))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!question.trim()) return
    if (!selectedFile) {
      toast.error('Please select a study file first')
      return
    }
    const q = question.trim()
    setMessages((prev) => [...prev, { role: 'user', text: q }])
    setQuestion('')
    setLoading(true)
    try {
      const { data } = await api.post('/qa', { file_id: Number(selectedFile), question: q })
      setMessages((prev) => [...prev, { role: 'ai', text: data.answer }])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to get an answer')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h1 className="page-title">AI Chat</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Ask questions about your study material</p>
      </div>

      <div className="glass-card relative z-50 p-4 mb-4 flex items-center gap-3">
        <FileText className="w-4 h-4 text-primary-500 shrink-0" />
       <div className="relative flex-1">
        <button
          type="button"
          onClick={() => setFileDropdownOpen(!fileDropdownOpen)}
          className="input-field w-full flex items-center justify-between text-left cursor-pointer"
        >
          <span>
            {selectedFile
              ? files.find((f) => String(f.id) === String(selectedFile))?.filename
                : 'Select a study file...'}
          </span>

          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              fileDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {fileDropdownOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border border-purple-500/40 bg-white dark:bg-[#1e1e2e] shadow-xl overflow-hidden">
            <button
              type="button"
                onClick={() => {
                  setSelectedFile('')
                  setFileDropdownOpen(false)
              }}
              className="w-full px-4 py-3 text-left text-gray-500 dark:text-gray-400 hover:bg-purple-500/10 transition-colors"
            >
              Select a study file...
            </button>

            {files.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setSelectedFile(f.id)
                  setFileDropdownOpen(false)
                }}
                className="w-full px-4 py-3 text-left text-gray-800 dark:text-white hover:bg-purple-500/10 transition-colors"
              >
                {f.filename}
              </button>
            ))}
          </div>
        )}
      </div>
      </div>

      <div className="flex-1 glass-card p-4 md:p-6 overflow-y-auto mb-4 min-h-[400px] max-h-[55vh]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-brand-soft flex items-center justify-center mb-4">
              <MessageSquareText className="w-8 h-8 text-primary-500" />
            </div>
            <p className="font-semibold">Start a conversation</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select a file and ask anything about it.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === 'user' ? 'bg-gray-200 dark:bg-white/10' : 'bg-gradient-brand'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-gradient-brand text-white rounded-tr-sm'
                    : 'bg-gray-100 dark:bg-white/10 rounded-tl-sm'
                }`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 rounded-full bg-primary-500"
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="input-field"
          placeholder="Ask a question about your notes..."
        />
        <button type="submit" disabled={loading} className="btn-primary px-4">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
