'use client'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Viewing } from '@/types'

interface ViewingFormProps {
  defaultDate?: string
  viewing?: Viewing
  onClose: () => void
  onSaved: () => void
}

export default function ViewingForm({ defaultDate, viewing, onClose, onSaved }: ViewingFormProps) {
  const [title, setTitle] = useState(viewing?.title ?? '')
  const [date, setDate] = useState(viewing?.date ?? defaultDate ?? '')
  const [startTime, setStartTime] = useState(viewing?.start_time?.slice(0, 5) ?? '')
  const [endTime, setEndTime] = useState(viewing?.end_time?.slice(0, 5) ?? '')
  const [address, setAddress] = useState(viewing?.address ?? '')
  const [notes, setNotes] = useState(viewing?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !startTime || !address) {
      setError('Date, start time, and address are required.')
      return
    }
    setSaving(true)
    try {
      const url = viewing ? `/api/viewings/${viewing.id}` : '/api/viewings'
      const method = viewing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          date,
          start_time: startTime,
          end_time: endTime || null,
          address,
          notes: notes || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      onSaved()
    } catch {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <Sheet open onOpenChange={open => { if (!open) onClose() }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-lg font-bold text-[#222222]">
            {viewing ? 'Edit Viewing' : 'Add Viewing'}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#717171] uppercase tracking-wide" htmlFor="title">
              Title (optional)
            </label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Midtown Complex"
              className="border-[#DDDDDD] focus-visible:ring-[#FF385C] focus-visible:border-[#FF385C] rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#717171] uppercase tracking-wide" htmlFor="date">
                Date *
              </label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="border-[#DDDDDD] focus-visible:ring-[#FF385C] focus-visible:border-[#FF385C] rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#717171] uppercase tracking-wide" htmlFor="start-time">
                Start time *
              </label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
                className="border-[#DDDDDD] focus-visible:ring-[#FF385C] focus-visible:border-[#FF385C] rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#717171] uppercase tracking-wide" htmlFor="end-time">
              End time (optional)
            </label>
            <Input
              id="end-time"
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="border-[#DDDDDD] focus-visible:ring-[#FF385C] focus-visible:border-[#FF385C] rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#717171] uppercase tracking-wide" htmlFor="address">
              Address *
            </label>
            <Input
              id="address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="123 Main St, New York, NY"
              required
              className="border-[#DDDDDD] focus-visible:ring-[#FF385C] focus-visible:border-[#FF385C] rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#717171] uppercase tracking-wide" htmlFor="notes">
              Notes
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Bring ID, ask about parking..."
              rows={2}
              className="border-[#DDDDDD] focus-visible:ring-[#FF385C] focus-visible:border-[#FF385C] rounded-xl resize-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border border-[#DDDDDD] text-[#222222] font-semibold text-sm hover:border-[#222222] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-12 rounded-xl bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold text-sm transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : viewing ? 'Save Changes' : 'Add Viewing'}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
