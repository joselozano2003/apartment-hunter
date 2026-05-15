'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ApartmentForm from '@/components/apartments/ApartmentForm'

export default function AddApartmentButton({ viewingId }: { viewingId: string }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="w-full border-2 border-dashed border-indigo-200 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 mt-2"
        onClick={() => setShowForm(true)}
      >
        + Add Apartment
      </Button>
      {showForm && (
        <ApartmentForm
          viewingId={viewingId}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); router.refresh() }}
        />
      )}
    </>
  )
}
