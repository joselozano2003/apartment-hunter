import { getAllApartmentsWithViewings } from '@/lib/queries'
import CompareTable from '@/components/compare/CompareTable'

export const dynamic = 'force-dynamic'

export default async function ComparePage() {
  const apartments = await getAllApartmentsWithViewings()

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Compare Apartments</h1>

      {apartments.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          No apartments yet — complete a viewing to see comparisons.
        </p>
      ) : (
        <CompareTable apartments={apartments} />
      )}
    </div>
  )
}
