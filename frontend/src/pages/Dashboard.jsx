import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import {
  FileText, ListChecks, Layers, MessageSquareText, UploadCloud, TrendingUp, Sparkles
} from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext.jsx'
import Card, { StatCard } from '../components/Card.jsx'
import Loader from '../components/Loader.jsx'

const quickActions = [
  { to: '/upload', label: 'Upload Notes', icon: UploadCloud, desc: 'Add new study material' },
  { to: '/summary', label: 'Generate Summary', icon: FileText, desc: 'Condense your notes' },
  { to: '/quiz', label: 'Take a Quiz', icon: ListChecks, desc: 'Test your knowledge' },
  { to: '/flashcards', label: 'Flashcards', icon: Layers, desc: 'Quick revision cards' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/history/stats')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader text="Loading dashboard..." />

  const chartData = [
    { name: 'Files', value: stats?.files_uploaded || 0 },
    { name: 'Summaries', value: stats?.summaries_generated || 0 },
    { name: 'Quizzes', value: stats?.quizzes_taken || 0 },
    { name: 'Flashcards', value: stats?.flashcard_sets || 0 },
    { name: 'Questions', value: stats?.questions_asked || 0 },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">
          Welcome back, <span className="gradient-text">{user?.full_name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's an overview of your study progress.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={UploadCloud} label="Files" value={stats?.files_uploaded ?? 0} accent="primary" />
        <StatCard icon={FileText} label="Summaries" value={stats?.summaries_generated ?? 0} accent="blue" />
        <StatCard icon={ListChecks} label="Quizzes" value={stats?.quizzes_taken ?? 0} accent="green" />
        <StatCard icon={Layers} label="Flashcards" value={stats?.flashcard_sets ?? 0} accent="orange" />
        <StatCard icon={MessageSquareText} label="Questions" value={stats?.questions_asked ?? 0} accent="primary" />
        <StatCard icon={TrendingUp} label="Avg Score" value={`${stats?.average_quiz_score ?? 0}%`} accent="blue" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-lg">Activity Overview</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
              />
              <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="font-bold text-lg mb-6">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map(({ to, label, icon: Icon, desc }, i) => (
              <Link key={to} to={to}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-500/40 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-brand-soft flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
