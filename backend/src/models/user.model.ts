export interface UserPrivacySettings {
  show_email: boolean
  show_phone: boolean
  show_current_location: boolean
  show_bio: boolean
  show_linkedin: boolean
  show_entry_year: boolean
  show_in_directory: boolean
}

export interface UpdateProfileRequest {
  first_name?: string
  last_name?: string
  current_city?: string
  current_country?: string
  bio?: string
  phone?: string
  linkedin_url?: string
  avatar_url?: string
}

export interface UserFilters {
  school_id?: string
  entry_year?: string
  country?: string
  city?: string
  is_ambassador?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface PublicUserProfile {
  id: string
  first_name: string
  last_name: string
  school?: {
    id: string
    name: string
    country: string
  }
  entry_year?: string | null
  current_city?: string | null
  current_country?: string | null
  bio?: string | null
  linkedin_url?: string | null
  email?: string | null
  phone?: string | null
  avatar_url?: string | null
  is_ambassador: boolean
  events_participated?: number
  codes_generated?: number
}

