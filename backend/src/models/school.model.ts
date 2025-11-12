export interface School {
  id: string
  name_fr: string
  name_en: string | null
  country: string
  city: string
  established_year: number | null
  is_active: boolean
  logo_url?: string | null
  description?: string | null
  website?: string | null
  created_at?: string
  updated_at?: string
}

export interface SchoolWithStats extends School {
  total_members: number
  total_ambassadors: number
  total_events: number
}

export interface SchoolStatistics {
  school_id: string
  school_name: string
  statistics: {
    total_members: number
    total_ambassadors: number
    total_events_organized: number
    total_codes_generated: number
    by_entry_year: Array<{ year: string; count: number }>
    by_current_country: Array<{ country: string; count: number }>
    growth_trend: Array<{ month: string; new_members: number }>
  }
}

export interface SchoolFilters {
  country?: string
  is_active?: boolean
}

