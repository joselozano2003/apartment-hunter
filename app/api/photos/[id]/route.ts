import { NextResponse } from 'next/server'
import { deletePhoto } from '@/lib/queries'
import { removeBlob } from '@/lib/blob'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ id: string }> }

export async function DELETE(_: Request, { params }: RouteContext) {
  const { id } = await params
  const photo = await prisma.photo.findUnique({ where: { id }, select: { blob_url: true } })
  if (photo?.blob_url) {
    await removeBlob(photo.blob_url)
  }
  await deletePhoto(id)
  return new NextResponse(null, { status: 204 })
}
