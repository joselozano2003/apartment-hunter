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

      <div className="bg-indigo-600 text-white rounded-2xl p-5 mb-4">
        <h1 className="text-xl font-bold">{viewing.title}</h1>
        <p className="text-indigo-200 text-sm mt-1">
          {format(parseISO(viewing.date), 'EEE, MMMM d')} · {viewing.start_time.slice(0, 5)}
          {viewing.end_time ? ` – ${viewing.end_time.slice(0, 5)}` : ''}
        </p>
        <p className="text-indigo-100 text-sm mt-1">📍 {viewing.address}</p>
        <ViewingActions viewing={viewing} />
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Apartments ({apartments.length})
      </h2>

      {apartments.map(apt => (
        <ApartmentCard key={apt.id} apt={apt} viewingId={id} />
      ))}

      <AddApartmentButton viewingId={id} />
    </div>
  )
}
