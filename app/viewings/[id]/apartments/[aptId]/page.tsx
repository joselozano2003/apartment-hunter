import { notFound } from 'next/navigation'
import { getApartmentsForViewing } from '@/lib/queries'
import PhotoGrid from '@/components/apartments/PhotoGrid'
import StarRating from '@/components/apartments/StarRating'
import ApartmentActions from '@/components/apartments/ApartmentActions'
import BackButton from '@/components/nav/BackButton'

export const dynamic = 'force-dynamic'

export default async function ApartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string; aptId: string }>
}) {
  const { id: viewingId, aptId } = await params
  const apartments = await getApartmentsForViewing(viewingId)
  const apt = apartments.find(a => a.id === aptId)

  if (!apt) notFound()

  return (
    <div className="py-4">
      <BackButton />

      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-[#222222]">{apt.unit_label}</h1>
          <ApartmentActions apartment={apt} viewingId={viewingId} />
        </div>
        {apt.rating && (
          <div className="flex items-center gap-1.5">
            <StarRating value={apt.rating} readOnly />
            <span className="text-sm text-[#717171] font-medium">{apt.rating} / 5</span>
          </div>
        )}
      </div>

      {/* Photos */}
      {(apt.photos?.length ?? 0) > 0 && (
        <div className="mb-4">
          <PhotoGrid photos={apt.photos ?? []} apartmentId={aptId} />
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {apt.monthly_rent && (
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-4">
            <div className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest mb-1">Monthly Rent</div>
            <div className="text-2xl font-bold text-[#222222]">${apt.monthly_rent.toLocaleString()}</div>
          </div>
        )}
        {(apt.bedrooms || apt.bathrooms) && (
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-4">
            <div className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest mb-1">Rooms</div>
            <div className="text-2xl font-bold text-[#222222]">{apt.bedrooms}bd <span className="text-[#AAAAAA] text-lg">·</span> {apt.bathrooms}ba</div>
          </div>
        )}
        {apt.sqft && (
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-4">
            <div className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest mb-1">Size</div>
            <div className="text-2xl font-bold text-[#222222]">{apt.sqft.toLocaleString()} <span className="text-base font-normal text-[#717171]">sqft</span></div>
          </div>
        )}
        {apt.commute_note && (
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-4">
            <div className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest mb-1">Commute</div>
            <div className="text-sm font-semibold text-[#222222] leading-snug mt-0.5">{apt.commute_note}</div>
          </div>
        )}
      </div>

      {/* Photo upload (when no photos yet) */}
      {(apt.photos?.length ?? 0) === 0 && (
        <div className="mb-4">
          <PhotoGrid photos={[]} apartmentId={aptId} />
        </div>
      )}

      {/* Notes */}
      {apt.notes && (
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-4 mb-4">
          <div className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest mb-2">Notes</div>
          <p className="text-sm text-[#222222] whitespace-pre-wrap leading-relaxed">{apt.notes}</p>
        </div>
      )}
    </div>
  )
}
