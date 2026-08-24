import { UtensilsCrossed, Sparkles, Shirt, Wrench, Sprout, Store } from 'lucide-react'
import { categoryColor } from '../../lib/format'

const ICON_MAP = {
  'Kuliner': UtensilsCrossed,
  'Kerajinan Tangan': Sparkles,
  'Fashion': Shirt,
  'Jasa & Servis': Wrench,
  'Pertanian & Perkebunan': Sprout,
}

export default function CategoryIcon({ category, size = 'md', className = '', isActive = false }) {
  const catColor = categoryColor(category)

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }[size]

  const iconSizes = { sm: 14, md: 20, lg: 24 }[size]

  const Icon = ICON_MAP[category] || Store

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full transition-all ${sizeClasses} ${className}`}
      style={{
        backgroundColor: isActive ? catColor : `${catColor}18`,
        color: isActive ? '#ffffff' : catColor,
        border: `1.5px solid ${isActive ? catColor : `${catColor}35`}`,
      }}
    >
      <Icon size={iconSizes} strokeWidth={2.2} />
    </div>
  )
}
