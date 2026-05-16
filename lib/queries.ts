import { prisma } from '@/lib/prisma'
import type { Viewing, Apartment, Photo, ApartmentWithViewing, ViewingStatus } from '@/types'
import type { Viewing as PrismaViewing, Apartment as PrismaApartment, Photo as PrismaPhoto } from '@prisma/client'

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function toISOStr(d: Date): string {
  return d.toISOString()
}

function serializeViewing(v: PrismaViewing & { _count?: { apartments: number } }, apartmentCount?: number): Viewing {
  return {
    id: v.id,
    title: v.title,
    date: toDateStr(v.date),
    start_time: v.start_time,
    end_time: v.end_time ?? null,
    address: v.address,
    notes: v.notes ?? null,
    commute_mins: v.commute_mins ?? null,
    status: v.status as ViewingStatus,
    created_at: toISOStr(v.created_at),
    apartment_count: apartmentCount ?? v._count?.apartments ?? 0,
  }
}

function serializeApartment(a: PrismaApartment & { photos?: PrismaPhoto[] }): Apartment {
  return {
    id: a.id,
    viewing_id: a.viewing_id,
    unit_label: a.unit_label,
    monthly_rent: a.monthly_rent ?? null,
    bedrooms: a.bedrooms ?? null,
    bathrooms: a.bathrooms !== null && a.bathrooms !== undefined ? Number(a.bathrooms) : null,
    sqft: a.sqft ?? null,
    rating: a.rating ?? null,
    notes: a.notes ?? null,
    includes_water: a.includes_water ?? null,
    includes_electricity: a.includes_electricity ?? null,
    includes_heating: a.includes_heating ?? null,
    includes_gym: a.includes_gym ?? null,
    created_at: toISOStr(a.created_at),
    photos: a.photos?.map(serializePhoto) ?? [],
  }
}

function serializePhoto(p: PrismaPhoto): Photo {
  return {
    id: p.id,
    apartment_id: p.apartment_id,
    blob_url: p.blob_url,
    caption: p.caption ?? null,
    created_at: toISOStr(p.created_at),
  }
}

export async function getViewings(): Promise<Viewing[]> {
  const rows = await prisma.viewing.findMany({
    orderBy: [{ date: 'asc' }, { start_time: 'asc' }],
    include: { _count: { select: { apartments: true } } },
  })
  return rows.map(v => serializeViewing(v))
}

export async function getViewing(id: string): Promise<Viewing | null> {
  const v = await prisma.viewing.findUnique({
    where: { id },
    include: { _count: { select: { apartments: true } } },
  })
  return v ? serializeViewing(v) : null
}

export async function createViewing(data: {
  title: string; date: string; start_time: string; end_time: string | null; address: string; notes: string | null; commute_mins: number | null
}): Promise<Viewing> {
  const v = await prisma.viewing.create({
    data: {
      title: data.title,
      date: new Date(data.date),
      start_time: data.start_time,
      end_time: data.end_time ?? null,
      address: data.address,
      notes: data.notes ?? null,
      commute_mins: data.commute_mins ?? null,
    },
  })
  return serializeViewing(v)
}

export async function updateViewing(
  id: string,
  data: Partial<{ title: string; date: string; start_time: string; end_time: string | null; address: string; notes: string | null; status: ViewingStatus }>
): Promise<Viewing> {
  const updateData: Record<string, unknown> = { ...data }
  if (data.date) updateData.date = new Date(data.date)
  const v = await prisma.viewing.update({ where: { id }, data: updateData })
  return serializeViewing(v)
}

export async function deleteViewing(id: string): Promise<void> {
  await prisma.viewing.delete({ where: { id } })
}

export async function getApartmentsForViewing(viewingId: string): Promise<Apartment[]> {
  const rows = await prisma.apartment.findMany({
    where: { viewing_id: viewingId },
    orderBy: { created_at: 'asc' },
    include: { photos: { orderBy: { created_at: 'asc' } } },
  })
  return rows.map(serializeApartment)
}

export async function createApartment(data: {
  viewing_id: string; unit_label: string; monthly_rent: number | null; bedrooms: number | null;
  bathrooms: number | null; sqft: number | null; rating: number | null; notes: string | null
}): Promise<Apartment> {
  const a = await prisma.apartment.create({ data })
  return serializeApartment(a)
}

export async function updateApartment(
  id: string,
  data: Partial<Omit<Apartment, 'id' | 'viewing_id' | 'created_at' | 'photos'>>
): Promise<Apartment> {
  const a = await prisma.apartment.update({ where: { id }, data })
  return serializeApartment(a)
}

export async function deleteApartment(id: string): Promise<void> {
  await prisma.apartment.delete({ where: { id } })
}

export async function getPhotosForApartment(apartmentId: string): Promise<Photo[]> {
  const rows = await prisma.photo.findMany({
    where: { apartment_id: apartmentId },
    orderBy: { created_at: 'asc' },
  })
  return rows.map(serializePhoto)
}

export async function createPhoto(data: { apartment_id: string; blob_url: string; caption: string | null }): Promise<Photo> {
  const p = await prisma.photo.create({ data })
  return serializePhoto(p)
}

export async function deletePhoto(id: string): Promise<void> {
  await prisma.photo.delete({ where: { id } })
}

export async function autoCompletePassedViewings(): Promise<void> {
  await prisma.viewing.updateMany({
    where: { status: 'upcoming', date: { lt: new Date() } },
    data: { status: 'completed' },
  })
}

export async function getAllApartmentsWithViewings(): Promise<ApartmentWithViewing[]> {
  const rows = await prisma.apartment.findMany({
    orderBy: [{ rating: 'desc' }, { viewing: { date: 'asc' } }],
    include: { viewing: true },
  })
  return rows.map(a => ({
    ...serializeApartment(a),
    viewing_title: a.viewing.title,
    viewing_date: toDateStr(a.viewing.date),
    viewing_address: a.viewing.address,
    commute_mins: a.viewing.commute_mins ?? null,
  }))
}
