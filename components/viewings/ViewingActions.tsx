'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
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

  async function handleDelete() {
    if (!confirm('Delete this viewing and all its apartments?')) return
    await fetch(`/api/viewings/${viewing.id}`, { method: 'DELETE' })
    router.push('/viewings')
  }

  return (
    <>
      <div className="flex gap-2 mt-3">
        {viewing.status !== 'completed' && (
          <Button size="sm" variant="secondary" onClick={markCompleted}>
            Mark Complete ✓
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => setShowEditForm(true)}>
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
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
