import jwt from 'jsonwebtoken'
import { config } from '@/config/environment'
import { JWTPayload } from '@/models/auth.model'

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

export class JWTUtils {
  
  // Générer un access token
  static generateAccessToken(user_id: string, email: string, role: string): string {
    const payload: JWTPayload = {
      user_id,
      email,
      role: role as 'alumni' | 'moderator' | 'admin',
      type: 'access'
    }
    
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: ACCESS_TOKEN_EXPIRY
    })
  }
  
  // Générer un refresh token
  static generateRefreshToken(user_id: string, email: string, role: string): string {
    const payload: JWTPayload = {
      user_id,
      email,
      role: role as 'alumni' | 'moderator' | 'admin',
      type: 'refresh'
    }
    
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: REFRESH_TOKEN_EXPIRY
    })
  }
  
  // Générer les deux tokens
  static generateTokens(user_id: string, email: string, role: string) {
    return {
      access_token: this.generateAccessToken(user_id, email, role),
      refresh_token: this.generateRefreshToken(user_id, email, role)
    }
  }
  
  // Vérifier un token
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload
      return decoded
    } catch (error) {
      return null
    }
  }
  
  // Décoder un token sans vérification (pour debug)
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload
    } catch (error) {
      return null
    }
  }
}

