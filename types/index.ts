export type ViewingStatus = 'upcoming' | 'completed'

export interface Viewing {
  id: string
  title: string
  date: string          // YYYY-MM-DD
  start_time: string    // HH:MM
  end_time: string | null
  address: string
  notes: string | null
  status: ViewingStatus
  created_at: string
  apartment_count?: number
}

export interface Apartment {
  id: string
  viewing_id: string
  unit_label: string
  monthly_rent: number | null
  bedrooms: number | null
  bathrooms: number | null
  sqft: number | null
  commute_note: string | null
  rating: number | null
  notes: string | null
  created_at: string
  photos?: Photo[]
}

export interface Photo {
  id: string
  apartment_id: string
  blob_url: string
  caption: string | null
  created_at: string
}

export interface ApartmentWithViewing extends Apartment {
  viewing_title: string
  viewing_date: string
  viewing_address: string
}
