import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = true, delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { y: -4, boxShadow: '0 12px 40px rgba(124,58,237,0.18)' } : {}}
      className={`glass-card p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StatCard({ icon: Icon, label, value, accent = 'primary' }) {
  const accentClasses = {
    primary: 'from-primary-500 to-primary-700',
    blue: 'from-accent-400 to-accent-600',
    green: 'from-emerald-400 to-emerald-600',
    orange: 'from-orange-400 to-orange-600',
  }
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accentClasses[accent]} flex items-center justify-center shadow-md shrink-0`}>
        {Icon && <Icon className="w-6 h-6 text-white" />}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </Card>
  )
}
