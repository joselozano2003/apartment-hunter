import { NextResponse } from 'next/server'
import { getViewing, updateViewing, deleteViewing } from '@/lib/queries'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params
  const viewing = await getViewing(id)
  if (!viewing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(viewing)
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params
  const body = await request.json()
  const viewing = await updateViewing(id, body)
  return NextResponse.json(viewing)
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { id } = await params
  await deleteViewing(id)
  return new NextResponse(null, { status: 204 })
}
