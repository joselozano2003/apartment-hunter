import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Apartment } from '@/types'

export default function ApartmentCard({ apt, viewingId }: { apt: Apartment; viewingId: string }) {
  const stars = apt.rating ? '★'.repeat(apt.rating) + '☆'.repeat(5 - apt.rating) : '—'
  const photoCount = apt.photos?.length ?? 0

  return (
    <Link href={`/viewings/${viewingId}/apartments/${apt.id}`}>
      <div className="border border-gray-200 rounded-xl p-4 mb-3 hover:border-indigo-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800">{apt.unit_label}</span>
          <span className="text-amber-400 text-sm">{stars}</span>
        </div>
        <div className="flex gap-3 mt-1 text-sm text-gray-500">
          {apt.monthly_rent && <span>${apt.monthly_rent.toLocaleString()}/mo</span>}
          {apt.bedrooms && <span>{apt.bedrooms}bd · {apt.bathrooms}ba</span>}
          {apt.sqft && <span>{apt.sqft} sqft</span>}
        </div>
        {photoCount > 0 && (
          <div className="mt-2 text-xs text-gray-400">{photoCount} photo{photoCount !== 1 ? 's' : ''}</div>
        )}
      </div>
    </Link>
  )
}
