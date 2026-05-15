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

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">{apt.unit_label}</h1>
        <ApartmentActions apartment={apt} viewingId={viewingId} />
      </div>

      <div className="mb-5">
        <PhotoGrid photos={apt.photos ?? []} apartmentId={aptId} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {apt.monthly_rent && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Rent</div>
            <div className="text-lg font-bold text-indigo-700 mt-0.5">${apt.monthly_rent.toLocaleString()}</div>
          </div>
        )}
        {(apt.bedrooms || apt.bathrooms) && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Rooms</div>
            <div className="text-lg font-bold text-gray-800 mt-0.5">{apt.bedrooms}bd · {apt.bathrooms}ba</div>
          </div>
        )}
        {apt.sqft && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Size</div>
            <div className="text-lg font-bold text-gray-800 mt-0.5">{apt.sqft} sqft</div>
          </div>
        )}
        {apt.commute_note && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Commute</div>
            <div className="text-base font-medium text-gray-800 mt-0.5">{apt.commute_note}</div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Rating</div>
        <StarRating value={apt.rating} readOnly />
      </div>

      {apt.notes && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{apt.notes}</p>
        </div>
      )}
    </div>
  )
}
