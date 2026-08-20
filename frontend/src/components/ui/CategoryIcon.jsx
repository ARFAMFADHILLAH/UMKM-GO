import { Utensils, Hammer, Shirt, Leaf, Wrench, Store, Sparkles } from 'lucide-react'
import { categoryColor } from '../../lib/format'

const MAP = {
  'Kuliner': { Icon: Utensils },
  'Kerajinan Tangan': { Icon: Hammer },
  'Fashion': { Icon: Shirt },
  'Pertanian & Perkebunan': { Icon: Leaf },
  'Jasa & Servis': { Icon: Wrench },
}

export default function CategoryIcon({ name, size = 'size-6', className = '' }) {
  const Icon = MAP[name]?.Icon || Store
  return (
    <span
      className={`grid place-items-center rounded-2xl text-white shadow-sm ${categoryColor(
        name,
      )} ${className}`}
    >
      <Icon className={`${size} shrink-0`} />
    </span>
  )
}

export function CategoryGlyph({ name, className = '' }) {
  const Icon = MAP[name]?.Icon || Sparkles
  return <Icon className={className} />
}