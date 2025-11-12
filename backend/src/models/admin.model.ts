export interface AdminStats {
  users: {
    total: number
    by_role: {
      alumni: number
      moderator: number
      admin: number
    }
    active: number
    inactive: number
  }
  events: {
    total: number
    by_status: {
      upcoming: number
      ongoing: number
      completed: number
      cancelled: number
    }
  }
  codes: {
    total_generated: number
    total_used: number
    active: number
  }
  access_requests: {
    pending: number
    approved: number
    rejected: number
  }
  registrations_by_month: Array<{
    month: string
    count: number
  }>
}

export interface AccessRequestFilters {
  status?: 'pending' | 'approved' | 'rejected'
  school_id?: string
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}

export interface UserFilters {
  role?: 'alumni' | 'moderator' | 'admin'
  school_id?: string
  is_active?: boolean
  is_ambassador?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface UpdateUserRequest {
  first_name?: string
  last_name?: string
  email?: string
  school_id?: string
  entry_year?: string
  current_city?: string
  current_country?: string
  role?: 'alumni' | 'moderator' | 'admin'
  is_active?: boolean
}

export interface IncreaseCodeLimitRequest {
  new_limit: number
}

export interface SetAmbassadorRequest {
  is_ambassador: boolean
}

