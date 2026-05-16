import { notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { getViewing, getApartmentsForViewing } from '@/lib/queries'
import ApartmentCard from '@/components/viewings/ApartmentCard'
import ViewingActions from '@/components/viewings/ViewingActions'
import AddApartmentButton from '@/components/viewings/AddApartmentButton'
import BackButton from '@/components/nav/BackButton'

export const dynamic = 'force-dynamic'

export default async function ViewingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [viewing, apartments] = await Promise.all([
    getViewing(id),
    getApartmentsForViewing(id),
  ])

  if (!viewing) notFound()

  return (
    <div className="py-4">
      <BackButton />

      {/* Viewing header card */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-5 mb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[#222222] leading-tight">{viewing.title}</h1>
            <p className="text-sm text-[#717171] mt-1">
              {format(parseISO(viewing.date), 'EEE, MMMM d')} · {viewing.start_time.slice(0, 5)}
              {viewing.end_time ? ` – ${viewing.end_time.slice(0, 5)}` : ''}
            </p>
            <p className="text-sm text-[#717171] mt-0.5">📍 {viewing.address}</p>
            {viewing.commute_mins && (
              <p className="text-sm text-[#717171] mt-0.5">🚇 {viewing.commute_mins} min commute</p>
            )}
          </div>
          {viewing.status === 'completed' && (
            <span className="shrink-0 text-xs font-semibold text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] rounded-full px-3 py-1">
              Completed ✓
            </span>
          )}
        </div>
        <ViewingActions viewing={viewing} />
      </div>

      <h2 className="text-xs font-bold text-[#717171] uppercase tracking-widest mb-3">
        Apartments ({apartments.length})
      </h2>

      {apartments.map(apt => (
        <ApartmentCard key={apt.id} apt={apt} viewingId={id} />
      ))}

      <AddApartmentButton viewingId={id} />
    </div>
  )
}
