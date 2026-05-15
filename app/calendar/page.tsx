'use client'
import { useState, useEffect } from 'react'
import { format, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns'
import WeekStrip from '@/components/calendar/WeekStrip'
import ViewingCard from '@/components/calendar/ViewingCard'
import ViewingForm from '@/components/viewings/ViewingForm'
import { Button } from '@/components/ui/button'
import type { Viewing } from '@/types'

export default function CalendarPage() {
  const [referenceDate, setReferenceDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewings, setViewings] = useState<Viewing[]>([])
  const [showForm, setShowForm] = useState(false)

  async function loadViewings() {
    const res = await fetch('/api/viewings')
    setViewings(await res.json())
  }

  useEffect(() => { loadViewings() }, [])

  const dayViewings = viewings.filter(v => isSameDay(parseISO(v.date), selectedDate))

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReferenceDate(d => subWeeks(d, 1))}
        >
          ‹
        </Button>
        <h2 className="text-base font-semibold text-gray-700">{format(referenceDate, 'MMMM yyyy')}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReferenceDate(d => addWeeks(d, 1))}
        >
          ›
        </Button>
      </div>

      <WeekStrip
        referenceDate={referenceDate}
        selectedDate={selectedDate}
        onDaySelect={setSelectedDate}
      />

      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-3">{format(selectedDate, 'EEEE, MMMM d')}</p>
        {dayViewings.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No viewings this day</p>
        ) : (
          dayViewings.map(v => <ViewingCard key={v.id} viewing={v} />)
        )}
      </div>

      {/* FAB */}
      <Button
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-6 md:bottom-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 text-2xl shadow-lg flex items-center justify-center z-40"
        aria-label="Add viewing"
      >
        +
      </Button>

      {showForm && (
        <ViewingForm
          defaultDate={format(selectedDate, 'yyyy-MM-dd')}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadViewings() }}
        />
      )}
    </div>
  )
}
