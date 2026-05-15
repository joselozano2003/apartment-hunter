import Link from 'next/link'
import type { Viewing } from '@/types'

export default function ViewingCard({ viewing }: { viewing: Viewing }) {
  const isCompleted = viewing.status === 'completed'
  return (
    <Link href={`/viewings/${viewing.id}`}>
      <div className={`rounded-xl p-4 mb-3 border-l-4 ${
        isCompleted
          ? 'bg-green-50 border-green-400'
          : 'bg-indigo-50 border-indigo-500'
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800">{viewing.title}</span>
          {isCompleted && <span className="text-green-600 text-xs font-medium">Done ✓</span>}
        </div>
        <div className="text-sm text-gray-500 mt-0.5">
          {viewing.start_time.slice(0, 5)}
          {viewing.end_time ? ` – ${viewing.end_time.slice(0, 5)}` : ''}
          {' · '}
          {viewing.apartment_count ?? 0} apartment{viewing.apartment_count !== 1 ? 's' : ''}
        </div>
      </div>
    </Link>
  )
}
