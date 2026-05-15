'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ApartmentForm from '@/components/apartments/ApartmentForm'

export default function AddApartmentButton({ viewingId }: { viewingId: string }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="w-full mt-2 h-12 rounded-2xl border-2 border-dashed border-[#DDDDDD] text-[#AAAAAA] hover:border-[#FF385C] hover:text-[#FF385C] font-semibold text-sm transition-colors"
      >
        + Add Apartment
      </button>
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
