import { ReactNode } from 'react'

type Variant = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'grey' | 'indigo'

const styles: Record<Variant, string> = {
  green:  'bg-emerald-100 text-emerald-800',
  red:    'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue:   'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  grey:   'bg-gray-100 text-gray-600',
  indigo: 'bg-indigo-100 text-indigo-700',
}

export default function Badge({ children, variant = 'grey' }: { children: ReactNode; variant?: Variant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${styles[variant]}`}>
      {children}
    </span>
  )
}
