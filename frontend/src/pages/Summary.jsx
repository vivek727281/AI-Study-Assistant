import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FileText, Download, Sparkles, Copy } from 'lucide-react'
import api from '../api/axios'
import Card from '../components/Card.jsx'
import Loader from '../components/Loader.jsx'

const LENGTHS = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Detailed' },
]

export default function Summary() {
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState('')
  const [length, setLength] = useState('medium')
  const [summary, setSummary] = useState(null)
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
    setSummary(null)
    try {
      const { data } = await api.post('/summary', { file_id: Number(selectedFile), length })
      setSummary(data)
      toast.success('Summary generated!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fmt) => {
    try {
      const res = await api.get(`/download/summary/${summary.id}/${fmt}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `summary_${summary.id}.${fmt}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      toast.error('Download failed')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(summary.content)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Generate Summary</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Get an AI-powered summary of your study material</p>
      </div>

      <Card hover={false}>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
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
            <label className="text-sm font-medium mb-1.5 block">Summary Length</label>
            <div className="flex gap-2">
              {LENGTHS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLength(l.value)}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium border transition-all ${
                    length === l.value
                      ? 'bg-gradient-brand text-white border-transparent shadow-glow'
                      : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full">
          <Sparkles className="w-4 h-4" />
          {loading ? 'Generating...' : 'Generate Summary'}
        </button>
      </Card>

      {loading && <Loader text="AI is analyzing your document..." />}

      {summary && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card hover={false}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                <h2 className="font-bold">{summary.title}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="btn-secondary text-xs px-3 py-2">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <button onClick={() => handleDownload('pdf')} className="btn-secondary text-xs px-3 py-2">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button onClick={() => handleDownload('docx')} className="btn-secondary text-xs px-3 py-2">
                  <Download className="w-3.5 h-3.5" /> DOCX
                </button>
                <button onClick={() => handleDownload('md')} className="btn-secondary text-xs px-3 py-2">
                  <Download className="w-3.5 h-3.5" /> MD
                </button>
              </div>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
              {summary.content}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
