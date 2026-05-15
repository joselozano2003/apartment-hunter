'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ApartmentForm from './ApartmentForm'
import type { Apartment } from '@/types'

export default function ApartmentActions({ apartment, viewingId }: { apartment: Apartment; viewingId: string }) {
  const router = useRouter()
  const [showEditForm, setShowEditForm] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this apartment and all its photos?')) return
    await fetch(`/api/apartments/${apartment.id}`, { method: 'DELETE' })
    router.back()
  }

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setShowEditForm(true)}>Edit</Button>
        <Button size="sm" variant="destructive" onClick={handleDelete}>Delete</Button>
      </div>
      {showEditForm && (
        <ApartmentForm
          viewingId={viewingId}
          apartment={apartment}
          onClose={() => setShowEditForm(false)}
          onSaved={() => { setShowEditForm(false); router.refresh() }}
        />
      )}
    </>
  )
}
