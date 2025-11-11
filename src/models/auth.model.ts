export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: 'alumni' | 'moderator' | 'admin'
    is_ambassador: boolean
    school_id: string | null
    entry_year: string
  }
  access_token: string
  refresh_token: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
}

export interface JWTPayload {
  user_id: string
  email: string
  role: 'alumni' | 'moderator' | 'admin'
  type: 'access' | 'refresh'
  iat?: number
  exp?: number
}

export interface AuthenticatedRequest {
  user?: {
    id: string
    email: string
    role: 'alumni' | 'moderator' | 'admin'
  }
}

