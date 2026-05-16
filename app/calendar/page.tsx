'use client'
import { useState, useEffect } from 'react'
import { format, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns'
import Link from 'next/link'
import ViewingForm from '@/components/viewings/ViewingForm'
import type { Viewing } from '@/types'

export default function CalendarPage() {
  const [referenceDate, setReferenceDate] = useState(new Date())
  const [viewings, setViewings] = useState<Viewing[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formDefaultDate, setFormDefaultDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  async function loadViewings() {
    const res = await fetch('/api/viewings')
    setViewings(await res.json())
  }

  useEffect(() => { loadViewings() }, [])

  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  function openFormForDay(day: Date) {
    setFormDefaultDate(format(day, 'yyyy-MM-dd'))
    setShowForm(true)
  }

  return (
    <div className="py-5">
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setReferenceDate(d => subWeeks(d, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-[#DDDDDD] text-[#222222] hover:border-[#222222] transition-colors text-lg font-light"
          aria-label="Previous week"
        >
          ‹
        </button>
        <div className="text-center">
          <h2 className="text-base font-bold text-[#222222]">{format(referenceDate, 'MMMM yyyy')}</h2>
          <p className="text-xs text-[#717171] mt-0.5">
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d')}
          </p>
        </div>
        <button
          onClick={() => setReferenceDate(d => addWeeks(d, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-[#DDDDDD] text-[#222222] hover:border-[#222222] transition-colors text-lg font-light"
          aria-label="Next week"
        >
          ›
        </button>
      </div>

      {/* Week grid — all 7 days visible at once */}
      <div className="space-y-0">
        {weekDays.map((day, idx) => {
          const dayStr = format(day, 'yyyy-MM-dd')
          const dayViewings = viewings.filter(v => v.date === dayStr)
          const today = dayStr === format(new Date(), 'yyyy-MM-dd')
          const isLast = idx === 6

          return (
            <div
              key={day.toISOString()}
              className={`flex gap-4 min-h-[4.5rem] ${!isLast ? 'border-b border-[#EBEBEB]' : ''}`}
            >
              {/* Day label column */}
              <div className="w-14 shrink-0 flex flex-col items-center pt-3 pb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${today ? 'text-[#FF385C]' : 'text-[#AAAAAA]'}`}>
                  {format(day, 'EEE')}
                </span>
                <span className={`text-sm font-bold mt-1 w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                  today
                    ? 'bg-[#FF385C] text-white'
                    : 'text-[#222222]'
                }`}>
                  {format(day, 'd')}
                </span>
              </div>

              {/* Viewings for this day */}
              <div className="flex-1 py-2.5 pr-1">
                {dayViewings.length === 0 ? (
                  <button
                    onClick={() => openFormForDay(day)}
                    className="w-full text-left text-xs text-[#CCCCCC] hover:text-[#FF385C] py-1 transition-colors"
                  >
                    + Add viewing
                  </button>
                ) : (
                  <div className="space-y-2">
                    {dayViewings.map(v => (
                      <Link key={v.id} href={`/viewings/${v.id}`}>
                        <div className={`rounded-xl px-3 py-2.5 border transition-all hover:shadow-sm ${
                          v.status === 'completed'
                            ? 'bg-white border-[#EBEBEB] opacity-70'
                            : 'bg-[#FFF5F6] border-[#FFCDD2]'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-[#222222] text-sm leading-tight">{v.title}</span>
                            {v.status === 'completed' && (
                              <span className="shrink-0 text-[10px] font-semibold text-[#717171] bg-[#EBEBEB] rounded-full px-1.5 py-0.5">Done</span>
                            )}
                          </div>
                          <div className="text-xs text-[#717171] mt-0.5">
                            {v.start_time.slice(0, 5)}
                            {v.end_time ? ` – ${v.end_time.slice(0, 5)}` : ''}
                            {(v.apartment_count ?? 0) > 0 && (
                              <span className="ml-1.5">· {v.apartment_count} apt{v.apartment_count !== 1 ? 's' : ''}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                    <button
                      onClick={() => openFormForDay(day)}
                      className="text-[10px] text-[#CCCCCC] hover:text-[#FF385C] transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setFormDefaultDate(format(new Date(), 'yyyy-MM-dd')); setShowForm(true) }}
        className="fixed bottom-24 right-6 md:bottom-8 bg-[#FF385C] hover:bg-[#E31C5F] active:scale-95 text-white rounded-full w-14 h-14 text-2xl shadow-lg flex items-center justify-center z-40 transition-all"
        aria-label="Add viewing"
      >
        +
      </button>

      {showForm && (
        <ViewingForm
          defaultDate={formDefaultDate}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadViewings() }}
        />
      )}
    </div>
  )
}
