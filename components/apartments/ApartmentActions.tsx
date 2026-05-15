'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
        <button
          onClick={() => setShowEditForm(true)}
          className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-semibold border border-[#DDDDDD] text-[#222222] bg-white hover:border-[#222222] transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-semibold border border-[#DDDDDD] text-[#717171] bg-white hover:border-red-300 hover:text-red-600 transition-colors"
        >
          Delete
        </button>
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
