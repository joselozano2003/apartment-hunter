import { NextResponse } from 'next/server'
import { uploadPhoto } from '@/lib/blob'
import { createPhoto } from '@/lib/queries'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const apartmentId = formData.get('apartment_id') as string | null
  const caption = formData.get('caption') as string | null

  if (!file || !apartmentId) {
    return NextResponse.json({ error: 'file and apartment_id are required' }, { status: 400 })
  }

  const blobUrl = await uploadPhoto(file)
  const photo = await createPhoto({ apartment_id: apartmentId, blob_url: blobUrl, caption })
  return NextResponse.json(photo, { status: 201 })
}
