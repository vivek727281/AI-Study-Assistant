import { motion } from 'framer-motion'
import { BrainCircuit } from 'lucide-react'

export default function Loader({ fullScreen = false, text = 'Loading...' }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow"
      >
        <BrainCircuit className="text-white w-8 h-8" />
      </motion.div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">{text}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 dark:bg-surface-dark">
        {content}
      </div>
    )
  }

  return <div className="py-16 flex items-center justify-center">{content}</div>
}
