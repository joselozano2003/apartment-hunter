import { NextResponse } from 'next/server'
import { updateApartment, deleteApartment } from '@/lib/queries'

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params
  const body = await request.json()
  const apartment = await updateApartment(id, body)
  return NextResponse.json(apartment)
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { id } = await params
  await deleteApartment(id)
  return new NextResponse(null, { status: 204 })
}
