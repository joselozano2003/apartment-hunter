'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ViewingForm from '@/components/viewings/ViewingForm'
import type { Viewing } from '@/types'

export default function ViewingActions({ viewing }: { viewing: Viewing }) {
  const router = useRouter()
  const [showEditForm, setShowEditForm] = useState(false)

  async function markCompleted() {
    await fetch(`/api/viewings/${viewing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    router.refresh()
  }

  async function markUpcoming() {
    await fetch(`/api/viewings/${viewing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'upcoming' }),
    })
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Delete this viewing and all its apartments?')) return
    await fetch(`/api/viewings/${viewing.id}`, { method: 'DELETE' })
    router.push('/viewings')
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {viewing.status !== 'completed' ? (
          <button
            onClick={markCompleted}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-[#222222] text-white hover:bg-black transition-colors"
          >
            Mark Complete ✓
          </button>
        ) : (
          <button
            onClick={markUpcoming}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border border-[#DDDDDD] text-[#717171] bg-white hover:border-[#222222] hover:text-[#222222] transition-colors"
          >
            Reopen
          </button>
        )}
        <button
          onClick={() => setShowEditForm(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border border-[#DDDDDD] text-[#222222] bg-white hover:border-[#222222] transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border border-[#DDDDDD] text-[#717171] bg-white hover:border-red-300 hover:text-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
      {showEditForm && (
        <ViewingForm
          viewing={viewing}
          onClose={() => setShowEditForm(false)}
          onSaved={() => { setShowEditForm(false); router.refresh() }}
        />
      )}
    </>
  )
}
