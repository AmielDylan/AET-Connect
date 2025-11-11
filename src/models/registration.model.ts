// Types pour le module Registration

export interface School {
  id: string
  name_fr: string
  name_en: string | null
  city: string
  country: string
  established_year: number | null
  is_active: boolean
}

export interface User {
  id: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  school_id: string | null
  entry_year: string
  current_city: string | null
  current_country: string | null
  role: 'alumni' | 'moderator' | 'admin'
  is_ambassador: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InvitationCode {
  id: string
  code: string
  school_id: string
  entry_year: string
  created_by_user_id: string | null
  is_admin_code: boolean
  max_uses: number
  current_uses: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface AccessRequest {
  id: string
  first_name: string
  last_name: string
  email: string
  school_id: string
  entry_year: string
  message: string | null
  wants_ambassador: boolean
  status: 'pending' | 'approved' | 'rejected'
  invitation_code_id: string | null
  created_at: string
  processed_at: string | null
}

// DTOs (Data Transfer Objects)

export interface CheckSchoolPromoRequest {
  school_id: string
  entry_year: string
}

export interface CheckSchoolPromoResponse {
  exists: boolean
  has_ambassador: boolean
  ambassador_info: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
  } | null
  member_count: number
}

export interface RequestInitialAccessRequest {
  school_id: string
  entry_year: string
  first_name: string
  last_name: string
  email: string
  message: string
  wants_ambassador: boolean
}

export interface VerifyInvitationCodeRequest {
  code: string
  school_id: string
  entry_year: string
}

export interface CompleteRegistrationRequest {
  invitation_code: string
  first_name: string
  last_name: string
  email: string
  password: string
}

export interface RequestCodeFromPeerRequest {
  school_id: string
  entry_year: string
  first_name: string
  last_name: string
  message: string
}

