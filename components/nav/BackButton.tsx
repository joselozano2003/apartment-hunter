'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function BackButton() {
  const router = useRouter()
  return (
    <Button variant="ghost" size="sm" className="text-indigo-600 mb-4 -ml-2" onClick={() => router.back()}>
      ‹ Back
    </Button>
  )
}
