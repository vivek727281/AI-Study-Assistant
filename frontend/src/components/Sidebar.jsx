import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, UploadCloud, MessageSquareText, FileText,
  ListChecks, Layers, History, Settings, BrainCircuit, X
} from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload Notes', icon: UploadCloud },
  { to: '/chat', label: 'AI Chat', icon: MessageSquareText },
  { to: '/summary', label: 'Summary', icon: FileText },
  { to: '/quiz', label: 'Quiz', icon: ListChecks },
  { to: '/flashcards', label: 'Flashcards', icon: Layers },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ onNavigate }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-6 h-16 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <span className="font-extrabold text-lg gradient-text">StudyAI</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-brand text-white shadow-glow'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-brand-soft border border-primary-200/40 dark:border-primary-500/20">
        <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">Powered by</p>
        <p className="text-sm font-bold gradient-text">Llama 3.2 (Local AI)</p>
      </div>
    </div>
  )
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <aside className="hidden md:block w-64 shrink-0 border-r border-gray-100 dark:border-white/5 glass">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-72 z-50 md:hidden glass"
            >
              <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
              <SidebarContent onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
