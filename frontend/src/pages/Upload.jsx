import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { UploadCloud, FileText, Trash2, File, FileType, Presentation } from 'lucide-react'
import api from '../api/axios'
import Card from '../components/Card.jsx'
import Loader from '../components/Loader.jsx'

const ICONS = {
  pdf: FileText,
  docx: FileType,
  pptx: Presentation,
  txt: File,
  md: File,
}

export default function Upload() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const loadFiles = () => {
    api.get('/upload').then(({ data }) => setFiles(data)).finally(() => setLoading(false))
  }

  useEffect(() => { loadFiles() }, [])

  const handleUpload = async (fileList) => {
    if (!fileList.length) return
    setUploading(true)
    for (const file of fileList) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success(`${file.name} uploaded successfully`)
      } catch (err) {
        toast.error(err.response?.data?.detail || `Failed to upload ${file.name}`)
      }
    }
    setUploading(false)
    loadFiles()
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/upload/${id}`)
      toast.success('File deleted')
      setFiles((prev) => prev.filter((f) => f.id !== id))
    } catch (err) {
      toast.error('Failed to delete file')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="page-title">Upload Study Material</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Supported formats: PDF, DOCX, PPTX, TXT, Markdown</p>
      </div>

      <Card
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleUpload(Array.from(e.dataTransfer.files))
        }}
        className={`border-2 border-dashed text-center py-16 cursor-pointer transition-colors ${
          dragOver ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/5' : 'border-gray-200 dark:border-white/10'
        }`}
        onClick={() => inputRef.current?.click()}
        hover={false}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept=".pdf,.docx,.pptx,.txt,.md"
          onChange={(e) => handleUpload(Array.from(e.target.files))}
        />
        <motion.div
          animate={{ y: dragOver ? -6 : 0 }}
          className="w-16 h-16 mx-auto rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow mb-4"
        >
          <UploadCloud className="w-8 h-8 text-white" />
        </motion.div>
        <p className="font-semibold text-lg">
          {uploading ? 'Uploading...' : 'Drag & drop files here, or click to browse'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Max file size 25MB</p>
      </Card>

      <div>
        <h2 className="font-bold text-lg mb-4">Your Files</h2>
        {loading ? (
          <Loader />
        ) : files.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No files uploaded yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {files.map((file) => {
                const Icon = ICONS[file.file_type] || File
                return (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="flex items-start gap-3" hover={false}>
                      <div className="w-11 h-11 rounded-xl bg-gradient-brand-soft flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" title={file.filename}>{file.filename}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mt-0.5">{file.file_type}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
