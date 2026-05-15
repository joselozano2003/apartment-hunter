'use client'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const [commute, setCommute] = useState(apartment?.commute_note ?? '')
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
          commute_note: commute || null,
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

  return (
    <Sheet open onOpenChange={open => { if (!open) onClose() }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{apartment ? 'Edit Apartment' : 'Add Apartment'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="unit-label">Unit label *</Label>
            <Input id="unit-label" value={unitLabel} onChange={e => setUnitLabel(e.target.value)} placeholder="e.g. Unit 203, Floor 4" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rent">Monthly rent ($)</Label>
              <Input id="rent" type="number" value={rent} onChange={e => setRent(e.target.value)} placeholder="2500" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sqft">Sqft</Label>
              <Input id="sqft" type="number" value={sqft} onChange={e => setSqft(e.target.value)} placeholder="850" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} placeholder="2" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" type="number" step="0.5" value={bathrooms} onChange={e => setBathrooms(e.target.value)} placeholder="1" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="commute">Commute</Label>
            <Input id="commute" value={commute} onChange={e => setCommute(e.target.value)} placeholder="15 min to office" />
          </div>
          <div className="space-y-1.5">
            <Label>Rating</Label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Great natural light, quiet floor..." rows={3} />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {saving ? 'Saving…' : apartment ? 'Save Changes' : 'Add Apartment'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
