'use client'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import StarRating from './StarRating'
import type { Apartment } from '@/types'

interface ApartmentFormProps {
  viewingId: string
  apartment?: Apartment
  onClose: () => void
  onSaved: () => void
}

export default function ApartmentForm({ viewingId, apartment, onClose, onSaved }: ApartmentFormProps) {
  const [unitLabel, setUnitLabel] = useState(apartment?.unit_label ?? '')
  const [rent, setRent] = useState(apartment?.monthly_rent?.toString() ?? '')
  const [bedrooms, setBedrooms] = useState(apartment?.bedrooms?.toString() ?? '')
  const [bathrooms, setBathrooms] = useState(apartment?.bathrooms?.toString() ?? '')
  const [sqft, setSqft] = useState(apartment?.sqft?.toString() ?? '')
  const [commute, setCommute] = useState(apartment?.commute_mins?.toString() ?? '')
  const [rating, setRating] = useState<number | null>(apartment?.rating ?? null)
  const [notes, setNotes] = useState(apartment?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!unitLabel.trim()) { setError('Unit label is required.'); return }
    setSaving(true)
    try {
      const url = apartment ? `/api/apartments/${apartment.id}` : `/api/viewings/${viewingId}/apartments`
      const method = apartment ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_label: unitLabel,
          monthly_rent: rent ? parseInt(rent) : null,
          bedrooms: bedrooms ? parseInt(bedrooms) : null,
          bathrooms: bathrooms ? parseFloat(bathrooms) : null,
          sqft: sqft ? parseInt(sqft) : null,
          commute_mins: commute ? parseInt(commute) : null,
          rating,
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

  const fieldClass = "border-[#DDDDDD] focus-visible:ring-[#FF385C] focus-visible:border-[#FF385C] rounded-xl"

  return (
    <Sheet open onOpenChange={open => { if (!open) onClose() }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-lg font-bold text-[#222222]">
            {apartment ? 'Edit Apartment' : 'Add Apartment'}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#717171] uppercase tracking-wide" htmlFor="unit-label">
              Unit label *
            </label>
            <Input
              id="unit-label"
              value={unitLabel}
              onChange={e => setUnitLabel(e.target.value)}
              placeholder="e.g. Unit 203, Floor 4"
              required
              className={fieldClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#717171] uppercase tracking-wide" htmlFor="rent">
                Monthly rent ($)
              </label>
              <Input id="rent" type="number" value={rent} onChange={e => setRent(e.target.value)} placeholder="2500" className={fieldClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#717171] uppercase tracking-wide" htmlFor="sqft">
                Sqft
              </label>
              <Input id="sqft" type="number" value={sqft} onChange={e => setSqft(e.target.value)} placeholder="850" className={fieldClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#717171] uppercase tracking-wide" htmlFor="bedrooms">
                Bedrooms
              </label>
              <Input id="bedrooms" type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} placeholder="2" className={fieldClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#717171] uppercase tracking-wide" htmlFor="bathrooms">
                Bathrooms
              </label>
              <Input id="bathrooms" type="number" step="0.5" value={bathrooms} onChange={e => setBathrooms(e.target.value)} placeholder="1" className={fieldClass} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#717171] uppercase tracking-wide" htmlFor="commute">
              Commute (minutes)
            </label>
            <Input id="commute" type="number" value={commute} onChange={e => setCommute(e.target.value)} placeholder="20" className={fieldClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#717171] uppercase tracking-wide">Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#717171] uppercase tracking-wide" htmlFor="notes">
              Notes
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Great natural light, quiet floor..."
              rows={3}
              className={`${fieldClass} resize-none`}
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
              {saving ? 'Saving…' : apartment ? 'Save Changes' : 'Add Apartment'}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
