import { supabase } from '@/config/database'
import bcrypt from 'bcrypt'
import { JWTUtils } from '@/utils/jwt'
import { LoginResponse } from '@/models/auth.model'

export class AuthService {
  
  // Login utilisateur
  async login(email: string, password: string): Promise<LoginResponse> {
    
    // 1. Récupérer l'utilisateur par email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()
    
    if (error || !user) {
      throw new Error('Email ou mot de passe incorrect')
    }
    
    // 2. Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    
    if (!passwordMatch) {
      throw new Error('Email ou mot de passe incorrect')
    }
    
    // 3. Générer les tokens JWT
    const tokens = JWTUtils.generateTokens(user.id, user.email, user.role)
    
    // 4. Mettre à jour last_login (optionnel)
    await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', user.id)
    
    // 5. Retourner la réponse
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_ambassador: user.is_ambassador,
        school_id: user.school_id,
        entry_year: user.entry_year
      },
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    }
  }
  
  // Refresh token
  async refreshToken(refresh_token: string): Promise<{ access_token: string; refresh_token: string }> {
    
    // 1. Vérifier le refresh token
    const payload = JWTUtils.verifyToken(refresh_token)
    
    if (!payload || payload.type !== 'refresh') {
      throw new Error('Refresh token invalide ou expiré')
    }
    
    // 2. Vérifier que l'utilisateur existe toujours
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', payload.user_id)
      .single()
    
    if (error || !user || !user.is_active) {
      throw new Error('Utilisateur non trouvé ou inactif')
    }
    
    // 3. Générer de nouveaux tokens
    const tokens = JWTUtils.generateTokens(user.id, user.email, user.role)
    
    return tokens
  }
  
  // Récupérer utilisateur connecté
  async getAuthenticatedUser(user_id: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        is_ambassador,
        school_id,
        entry_year,
        current_city,
        current_country,
        max_codes_allowed,
        created_at,
        schools:school_id (
          id,
          name_fr,
          country
        )
      `)
      .eq('id', user_id)
      .eq('is_active', true)
      .single()
    
    if (error || !user) {
      throw new Error('Utilisateur non trouvé')
    }
    
    return user
  }
}

export const authService = new AuthService()

