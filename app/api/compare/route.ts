import { NextResponse } from 'next/server'
import { getAllApartmentsWithViewings } from '@/lib/queries'

export async function GET() {
  const apartments = await getAllApartmentsWithViewings()
  return NextResponse.json(apartments)
}
