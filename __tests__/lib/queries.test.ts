import { prismaMock } from '../helpers/prisma-mock'

import {
  getViewings,
  getViewing,
  createViewing,
  updateViewing,
  deleteViewing,
  autoCompletePassedViewings,
  getApartmentsForViewing,
  createApartment,
  updateApartment,
  deleteApartment,
  getPhotosForApartment,
  createPhoto,
  deletePhoto,
  getAllApartmentsWithViewings,
} from '@/lib/queries'

// Helper to create a mock Viewing row (Prisma returns Date objects)
function mockViewing(overrides = {}) {
  return {
    id: 'v1',
    title: 'Midtown',
    date: new Date('2026-05-21'),
    start_time: '14:00',
    end_time: null,
    address: '123 Main',
    notes: null,
    status: 'upcoming',
    created_at: new Date('2026-05-15T00:00:00Z'),
    apartments: [],
    ...overrides,
  }
}

function mockApartment(overrides = {}) {
  return {
    id: 'a1',
    viewing_id: 'v1',
    unit_label: 'Unit 203',
    monthly_rent: 2500,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 850,
    commute_note: '15 min',
    rating: 4,
    notes: 'Great light',
    created_at: new Date('2026-05-15T00:00:00Z'),
    photos: [],
    ...overrides,
  }
}

function mockPhoto(overrides = {}) {
  return {
    id: 'p1',
    apartment_id: 'a1',
    blob_url: 'https://blob.vercel.com/photo.jpg',
    caption: null,
    created_at: new Date('2026-05-15T00:00:00Z'),
    ...overrides,
  }
}

describe('getViewings', () => {
  it('returns serialized viewings ordered by date', async () => {
    prismaMock.viewing.findMany.mockResolvedValueOnce([mockViewing()] as any)
    const result = await getViewings()
    expect(result[0].date).toBe('2026-05-21')
    expect(result[0].id).toBe('v1')
  })
})

describe('getViewing', () => {
  it('returns a single viewing with apartment count', async () => {
    prismaMock.viewing.findUnique.mockResolvedValueOnce(
      { ...mockViewing(), _count: { apartments: 2 } } as any
    )
    const result = await getViewing('v1')
    expect(result?.id).toBe('v1')
    expect(result?.apartment_count).toBe(2)
  })

  it('returns null if not found', async () => {
    prismaMock.viewing.findUnique.mockResolvedValueOnce(null)
    const result = await getViewing('nonexistent')
    expect(result).toBeNull()
  })
})

describe('createViewing', () => {
  it('creates a viewing and returns serialized row', async () => {
    prismaMock.viewing.create.mockResolvedValueOnce(mockViewing({ title: 'Park Ave' }) as any)
    const result = await createViewing({
      title: 'Park Ave', date: '2026-05-22', start_time: '10:00',
      end_time: null, address: '456 Park Ave', notes: 'Bring ID', commute_mins: null,
    })
    expect(result.title).toBe('Park Ave')
    expect(typeof result.date).toBe('string')
  })
})

describe('updateViewing', () => {
  it('updates and returns the viewing', async () => {
    prismaMock.viewing.update.mockResolvedValueOnce(
      mockViewing({ status: 'completed' }) as any
    )
    const result = await updateViewing('v1', { status: 'completed' })
    expect(result.status).toBe('completed')
  })
})

describe('deleteViewing', () => {
  it('deletes without throwing', async () => {
    prismaMock.viewing.delete.mockResolvedValueOnce(mockViewing() as any)
    await expect(deleteViewing('v1')).resolves.toBeUndefined()
  })
})

describe('createApartment', () => {
  it('creates an apartment and returns it', async () => {
    prismaMock.apartment.create.mockResolvedValueOnce(mockApartment() as any)
    const result = await createApartment({
      viewing_id: 'v1', unit_label: 'Unit 203', monthly_rent: 2500,
      bedrooms: 2, bathrooms: 1, sqft: 850, rating: 4, notes: 'Great light',
    })
    expect(result.unit_label).toBe('Unit 203')
  })
})

describe('updateApartment', () => {
  it('updates and returns the apartment', async () => {
    prismaMock.apartment.update.mockResolvedValueOnce(
      mockApartment({ rating: 5 }) as any
    )
    const result = await updateApartment('a1', { rating: 5 })
    expect(result.rating).toBe(5)
  })
})

describe('deleteApartment', () => {
  it('deletes without throwing', async () => {
    prismaMock.apartment.delete.mockResolvedValueOnce(mockApartment() as any)
    await expect(deleteApartment('a1')).resolves.toBeUndefined()
  })
})

describe('createPhoto', () => {
  it('creates a photo and returns it', async () => {
    prismaMock.photo.create.mockResolvedValueOnce(mockPhoto() as any)
    const result = await createPhoto({ apartment_id: 'a1', blob_url: 'https://blob.vercel.com/photo.jpg', caption: null })
    expect(result.blob_url).toBe('https://blob.vercel.com/photo.jpg')
  })
})

describe('deletePhoto', () => {
  it('deletes without throwing', async () => {
    prismaMock.photo.delete.mockResolvedValueOnce(mockPhoto() as any)
    await expect(deletePhoto('p1')).resolves.toBeUndefined()
  })
})

describe('autoCompletePassedViewings', () => {
  it('updates upcoming viewings past their date to completed', async () => {
    prismaMock.viewing.updateMany.mockResolvedValueOnce({ count: 1 })
    await autoCompletePassedViewings()
    expect(prismaMock.viewing.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'completed' },
        where: expect.objectContaining({ status: 'upcoming' }),
      })
    )
  })
})

describe('getApartmentsForViewing', () => {
  it('returns apartments with serialized dates', async () => {
    prismaMock.apartment.findMany.mockResolvedValueOnce([mockApartment()] as any)
    const result = await getApartmentsForViewing('v1')
    expect(result[0].id).toBe('a1')
    expect(typeof result[0].created_at).toBe('string')
  })
})

describe('getPhotosForApartment', () => {
  it('returns photos with serialized dates', async () => {
    prismaMock.photo.findMany.mockResolvedValueOnce([mockPhoto()] as any)
    const result = await getPhotosForApartment('a1')
    expect(result[0].blob_url).toBe('https://blob.vercel.com/photo.jpg')
    expect(typeof result[0].created_at).toBe('string')
  })
})

describe('getAllApartmentsWithViewings', () => {
  it('returns apartments with viewing data serialized', async () => {
    const mockRow = {
      ...mockApartment(),
      viewing: {
        title: 'Midtown',
        date: new Date('2026-05-21'),
        address: '123 Main',
      },
    }
    prismaMock.apartment.findMany.mockResolvedValueOnce([mockRow] as any)
    const result = await getAllApartmentsWithViewings()
    expect(result[0].viewing_title).toBe('Midtown')
    expect(result[0].viewing_date).toBe('2026-05-21')
  })
})
