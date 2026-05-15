import Link from 'next/link'
import { getViewings, autoCompletePassedViewings } from '@/lib/queries'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function ViewingsPage() {
  await autoCompletePassedViewings()
  const viewings = await getViewings()

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">All Viewings</h1>
      {viewings.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">No viewings yet — add one from the calendar.</p>
      )}
      {viewings.map(v => (
        <Link key={v.id} href={`/viewings/${v.id}`}>
          <div className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-colors">
            <div>
              <div className="font-semibold text-gray-800">{v.title}</div>
              <div className="text-sm text-gray-500 mt-0.5">
                {format(parseISO(v.date), 'EEE, MMM d')} · {v.start_time.slice(0, 5)}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {v.apartment_count} apartment{v.apartment_count !== 1 ? 's' : ''}
              </div>
            </div>
            <Badge variant={v.status === 'completed' ? 'secondary' : 'default'}>
              {v.status === 'completed' ? 'Done' : 'Upcoming'}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  )
}
