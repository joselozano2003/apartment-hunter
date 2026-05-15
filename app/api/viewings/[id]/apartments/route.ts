import { NextResponse } from 'next/server'
import { getApartmentsForViewing, createApartment } from '@/lib/queries'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params
  const apartments = await getApartmentsForViewing(id)
  return NextResponse.json(apartments)
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params
  const body = await request.json()
  if (!body.unit_label?.trim()) {
    return NextResponse.json({ error: 'unit_label is required' }, { status: 400 })
  }
  const apartment = await createApartment({
    viewing_id: id,
    unit_label: body.unit_label,
    monthly_rent: body.monthly_rent ?? null,
    bedrooms: body.bedrooms ?? null,
    bathrooms: body.bathrooms ?? null,
    sqft: body.sqft ?? null,
    commute_note: body.commute_note ?? null,
    rating: body.rating ?? null,
    notes: body.notes ?? null,
  })
  return NextResponse.json(apartment, { status: 201 })
}
