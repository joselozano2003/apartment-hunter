import Link from 'next/link'
import type { Apartment } from '@/types'

export default function ApartmentCard({ apt, viewingId }: { apt: Apartment; viewingId: string }) {
  const photoCount = apt.photos?.length ?? 0

  return (
    <Link href={`/viewings/${viewingId}/apartments/${apt.id}`}>
      <div className="bg-white border border-[#EBEBEB] rounded-2xl p-4 mb-3 hover:border-[#DDDDDD] hover:shadow-sm transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="font-bold text-[#222222] text-base">{apt.unit_label}</span>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-sm text-[#717171]">
              {apt.monthly_rent && (
                <span className="font-semibold text-[#222222]">${apt.monthly_rent.toLocaleString()}<span className="font-normal text-[#717171]">/mo</span></span>
              )}
              {apt.bedrooms && <span>{apt.bedrooms} bd · {apt.bathrooms} ba</span>}
              {apt.sqft && <span>{apt.sqft.toLocaleString()} sqft</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {apt.rating && (
              <div className="flex items-center gap-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF385C" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="text-xs font-semibold text-[#222222]">{apt.rating}</span>
              </div>
            )}
            {photoCount > 0 && (
              <span className="text-xs text-[#717171]">{photoCount} photo{photoCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
