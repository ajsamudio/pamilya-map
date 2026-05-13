export type Category =
  | 'food'
  | 'tourist'
  | 'accommodation'
  | 'transport'
  | 'shopping'
  | 'airport'

export interface Profile {
  id: string
  display_name: string
  created_at: string
}

export interface Pin {
  id: string
  name: string
  category: Category
  address: string | null
  lat: number
  lng: number
  notes: string | null
  link: string | null
  added_by: string | null
  created_at: string
  profiles?: Profile | null
}
