import { supabase } from '@/config/database'

export class CodesService {
  
  async generateUserCode(user_id: string): Promise<{
    code: string
    codes_remaining: number
  }> {
    
    // 1. Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('school_id, entry_year, max_codes_allowed, role, is_ambassador')
      .eq('id', user_id)
      .single()
    
    if (userError || !user) {
      throw new Error('Utilisateur non trouvé')
    }
    
    // 2. Compter les codes déjà créés par cet utilisateur
    const { count, error: countError } = await supabase
      .from('invitation_codes')
      .select('*', { count: 'exact', head: true })
      .eq('created_by_user_id', user_id)
    
    if (countError) throw countError
    
    const codesCreated = count || 0
    
    // 3. Vérifier la limite (sauf pour les admins)
    if (user.role !== 'admin' && codesCreated >= user.max_codes_allowed) {
      throw new Error(
        `Vous avez atteint votre limite de ${user.max_codes_allowed} codes. ` +
        (user.is_ambassador 
          ? 'Contactez un administrateur pour augmenter votre limite.' 
          : 'Contactez votre ambassadeur ou un administrateur.')
      )
    }
    
    // 4. Générer le code
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
    const code = `USER-${randomPart}`
    
    // 5. Créer le code en DB
    const { data: newCode, error: createError } = await supabase
      .from('invitation_codes')
      .insert({
        code: code,
        school_id: user.school_id,
        entry_year: user.entry_year,
        created_by_user_id: user_id,
        is_admin_code: false,
        max_uses: 10, // Par défaut
        current_uses: 0,
        is_active: true
      })
      .select()
      .single()
    
    if (createError) throw createError
    
    return {
      code: newCode.code,
      codes_remaining: user.max_codes_allowed - codesCreated - 1
    }
  }
  
  async getUserCodes(user_id: string) {
    const { data, error } = await supabase
      .from('invitation_codes')
      .select(`
        code,
        max_uses,
        current_uses,
        expires_at,
        is_active,
        created_at,
        schools:school_id (
          name_fr
        )
      `)
      .eq('created_by_user_id', user_id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return data
  }
}

export const codesService = new CodesService()

