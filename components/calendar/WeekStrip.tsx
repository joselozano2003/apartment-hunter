'use client'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'

interface WeekStripProps {
  referenceDate: Date
  onDaySelect: (date: Date) => void
  selectedDate: Date
}

export default function WeekStrip({ referenceDate, onDaySelect, selectedDate }: WeekStripProps) {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="grid grid-cols-7 gap-1 py-3">
      {days.map(day => {
        const isSelected = isSameDay(day, selectedDate)
        const isToday = isSameDay(day, new Date())
        return (
          <button
            key={day.toISOString()}
            onClick={() => onDaySelect(day)}
            className={`flex flex-col items-center py-1.5 rounded-lg transition-colors ${
              isSelected
                ? 'bg-indigo-600 text-white'
                : isToday
                ? 'bg-indigo-50 text-indigo-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xs uppercase">{format(day, 'EEE')}</span>
            <span className="text-sm font-medium mt-0.5">{format(day, 'd')}</span>
          </button>
        )
      })}
    </div>
  )
}
