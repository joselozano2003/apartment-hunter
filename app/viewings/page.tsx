import Link from 'next/link'
import { getViewings, autoCompletePassedViewings } from '@/lib/queries'
import { format, parseISO } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function ViewingsPage() {
  await autoCompletePassedViewings()
  const viewings = await getViewings()

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold text-[#222222] mb-4">Viewings</h1>
      {viewings.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#AAAAAA] text-sm">No viewings yet.</p>
          <p className="text-[#AAAAAA] text-sm mt-1">Add one from the calendar.</p>
        </div>
      )}
      {viewings.map(v => (
        <Link key={v.id} href={`/viewings/${v.id}`}>
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-4 mb-3 hover:border-[#DDDDDD] hover:shadow-sm transition-all flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[#222222] text-base truncate">{v.title}</div>
              <div className="text-sm text-[#717171] mt-0.5">
                {format(parseISO(v.date), 'EEE, MMM d')} · {v.start_time.slice(0, 5)}
              </div>
              <div className="text-xs text-[#AAAAAA] mt-0.5">
                {v.apartment_count} apartment{v.apartment_count !== 1 ? 's' : ''}
              </div>
            </div>
            <span className={`shrink-0 text-xs font-semibold rounded-full px-3 py-1 ${
              v.status === 'completed'
                ? 'bg-[#F7F7F7] text-[#717171] border border-[#EBEBEB]'
                : 'bg-[#FFF5F6] text-[#FF385C] border border-[#FFCDD2]'
            }`}>
              {v.status === 'completed' ? 'Completed' : 'Upcoming'}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
