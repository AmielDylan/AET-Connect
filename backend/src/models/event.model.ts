export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

export interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  event_end_date: string
  city: string
  country: string
  address: string | null
  latitude: number | null
  longitude: number | null
  max_participants: number | null
  status: EventStatus
  created_by_user_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EventParticipant {
  id: string
  event_id: string
  user_id: string
  registered_at: string
}

export interface EventWithDetails extends Event {
  creator?: {
    id: string
    first_name: string
    last_name: string
    is_ambassador: boolean
  }
  participant_count?: number
  is_registered?: boolean // Pour utilisateur connecté
  participants?: Array<{
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
  }>
}

// DTOs

export interface CreateEventRequest {
  title: string
  description?: string
  event_date: string
  event_end_date: string
  city: string
  country: string
  address?: string
  latitude?: number
  longitude?: number
  max_participants?: number
}

export interface UpdateEventRequest {
  title?: string
  description?: string
  event_date?: string
  event_end_date?: string
  city?: string
  country?: string
  address?: string
  latitude?: number
  longitude?: number
  max_participants?: number
  status?: EventStatus
  is_active?: boolean
}

export interface EventFilters {
  country?: string
  city?: string
  date_from?: string
  date_to?: string
  status?: EventStatus
  created_by?: string
  is_active?: boolean
  limit?: number
  offset?: number
}

