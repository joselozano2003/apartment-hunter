'use client'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
        <SheetHeader>
          <SheetTitle>{viewing ? 'Edit Viewing' : 'Add Viewing'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Midtown Complex"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start-time">Start time *</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end-time">End time (optional)</Label>
            <Input
              id="end-time"
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="123 Main St, New York, NY"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Bring ID, ask about parking..."
              rows={2}
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {saving ? 'Saving…' : viewing ? 'Save Changes' : 'Add Viewing'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
