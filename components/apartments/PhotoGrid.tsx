'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import type { Photo } from '@/types'

interface PhotoGridProps {
  photos: Photo[]
  apartmentId: string
}

export default function PhotoGrid({ photos: initialPhotos, apartmentId }: PhotoGridProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('apartment_id', apartmentId)
      const res = await fetch('/api/photos', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      const photo: Photo = await res.json()
      setPhotos(prev => [...prev, photo])
    } catch {
      setUploadError('Upload failed — tap to retry')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(photo: Photo) {
    if (!confirm('Delete this photo?')) return
    await fetch(`/api/photos/${photo.id}`, { method: 'DELETE' })
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map(photo => (
          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
            <Image src={photo.blob_url} alt={photo.caption ?? 'Apartment photo'} fill className="object-cover" />
            <button
              onClick={() => handleDelete(photo)}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-black/70"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-xl border-2 border-dashed border-indigo-300 flex flex-col items-center justify-center text-indigo-400 hover:bg-indigo-50 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <span className="text-xs">Uploading…</span>
          ) : (
            <>
              <span className="text-3xl">+</span>
              <span className="text-xs mt-1">Add photo</span>
            </>
          )}
        </button>
      </div>
      {uploadError && <p className="text-destructive text-xs mt-1">{uploadError}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
