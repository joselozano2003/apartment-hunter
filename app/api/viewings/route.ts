import { NextResponse } from 'next/server'
import { getViewings, createViewing, autoCompletePassedViewings } from '@/lib/queries'

export async function GET() {
  await autoCompletePassedViewings()
  const viewings = await getViewings()
  return NextResponse.json(viewings)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { title, date, start_time, end_time, address, notes } = body

  if (!date || !start_time || !address) {
    return NextResponse.json({ error: 'date, start_time, and address are required' }, { status: 400 })
  }

  const effectiveTitle = title?.trim() || address
  const viewing = await createViewing({
    title: effectiveTitle,
    date,
    start_time,
    end_time: end_time ?? null,
    address,
    notes: notes ?? null,
  })
  return NextResponse.json(viewing, { status: 201 })
}
