import { supabase } from '@/config/database'
import { UserFilters, PublicUserProfile, UpdateProfileRequest, UserPrivacySettings } from '@/models/user.model'

export class UsersService {
  
  // Appliquer privacy settings sur profil
  private applyPrivacySettings(user: any, privacy: any): PublicUserProfile {
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      school: user.school,
      avatar_url: user.avatar_url,
      is_ambassador: user.is_ambassador,
      
      // Champs conditionnels selon privacy
      entry_year: privacy?.show_entry_year !== false ? user.entry_year : null,
      current_city: privacy?.show_current_location !== false ? user.current_city : null,
      current_country: privacy?.show_current_location !== false ? user.current_country : null,
      bio: privacy?.show_bio !== false ? user.bio : null,
      linkedin_url: privacy?.show_linkedin !== false ? user.linkedin_url : null,
      email: privacy?.show_email === true ? user.email : null,
      phone: privacy?.show_phone === true ? user.phone : null,
      
      events_participated: user.events_participated,
      codes_generated: user.codes_generated
    }
  }
  
  // Liste utilisateurs (annuaire) - AUTH REQUIS
  async getUsers(filters: UserFilters) {
    let query = supabase
      .from('users')
      .select(`
        *,
        school:school_id (
          id,
          name_fr,
          country
        ),
        privacy:user_privacy_settings!user_privacy_settings_user_id_fkey (
          show_email,
          show_phone,
          show_current_location,
          show_bio,
          show_linkedin,
          show_entry_year,
          show_in_directory
        )
      `)
      .eq('is_active', true)
    
    if (filters.school_id) {
      query = query.eq('school_id', filters.school_id)
    }
    
    if (filters.entry_year) {
      query = query.eq('entry_year', filters.entry_year)
    }
    
    if (filters.country) {
      query = query.ilike('current_country', `%${filters.country}%`)
    }
    
    if (filters.city) {
      query = query.ilike('current_city', `%${filters.city}%`)
    }
    
    if (filters.is_ambassador !== undefined) {
      query = query.eq('is_ambassador', filters.is_ambassador)
    }
    
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`)
    }
    
    query = query.order('created_at', { ascending: false })
    
    const limit = filters.limit || 20
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)
    
    const { data: users, error } = await query
    
    if (error) throw error
    
    // Filtrer les users qui ne veulent pas apparaître dans l'annuaire
    const filteredUsers = (users || []).filter((u: any) => {
      const privacy = Array.isArray(u.privacy) ? u.privacy[0] : u.privacy
      return privacy?.show_in_directory !== false
    })
    
    // Ajouter statistiques pour chaque user
    const usersWithStats = await Promise.all(
      filteredUsers.map(async (user: any) => {
        // Compter événements participés
        const { count: eventsCount } = await supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        
        // Compter codes générés
        const { count: codesCount } = await supabase
          .from('invitation_codes')
          .select('*', { count: 'exact', head: true })
          .eq('created_by_user_id', user.id)
        
        const privacy = Array.isArray(user.privacy) ? user.privacy[0] : user.privacy
        
        return this.applyPrivacySettings(
          {
            ...user,
            school: Array.isArray(user.school) ? user.school[0] : user.school,
            events_participated: eventsCount || 0,
            codes_generated: codesCount || 0
          },
          privacy || {}
        )
      })
    )
    
    return usersWithStats
  }
  
  // Profil public d'un user - AUTH REQUIS
  async getUserById(user_id: string): Promise<PublicUserProfile> {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        school:school_id (
          id,
          name_fr,
          country
        ),
        privacy:user_privacy_settings!user_privacy_settings_user_id_fkey (
          show_email,
          show_phone,
          show_current_location,
          show_bio,
          show_linkedin,
          show_entry_year,
          show_in_directory
        )
      `)
      .eq('id', user_id)
      .eq('is_active', true)
      .single()
    
    if (error || !user) {
      throw new Error('Utilisateur non trouvé')
    }
    
    // Vérifier que l'user veut apparaître publiquement
    const privacy = Array.isArray(user.privacy) ? user.privacy[0] : user.privacy
    if (privacy?.show_in_directory === false) {
      throw new Error('Ce profil est privé')
    }
    
    // Compter événements et codes
    const { count: eventsCount } = await supabase
      .from('event_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
    
    const { count: codesCount } = await supabase
      .from('invitation_codes')
      .select('*', { count: 'exact', head: true })
      .eq('created_by_user_id', user_id)
    
    return this.applyPrivacySettings(
      {
        ...user,
        school: Array.isArray(user.school) ? user.school[0] : user.school,
        events_participated: eventsCount || 0,
        codes_generated: codesCount || 0
      },
      privacy || {}
    )
  }
  
  // Mon profil complet (toutes infos) - AUTH REQUIS
  async getMyProfile(user_id: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        school:school_id (
          id,
          name_fr,
          country
        ),
        privacy:user_privacy_settings!user_privacy_settings_user_id_fkey (*)
      `)
      .eq('id', user_id)
      .single()
    
    if (error || !user) {
      throw new Error('Utilisateur non trouvé')
    }
    
    // Compter événements et codes
    const { count: eventsCount } = await supabase
      .from('event_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
    
    const { count: codesCount } = await supabase
      .from('invitation_codes')
      .select('*', { count: 'exact', head: true })
      .eq('created_by_user_id', user_id)
    
    const privacy = Array.isArray(user.privacy) ? user.privacy[0] : user.privacy
    
    return {
      ...user,
      school: Array.isArray(user.school) ? user.school[0] : user.school,
      privacy: privacy || null,
      events_participated: eventsCount || 0,
      codes_generated: codesCount || 0
    }
  }
  
  // Modifier mon profil - AUTH REQUIS
  async updateMyProfile(user_id: string, data: UpdateProfileRequest) {
    // Filtrer uniquement les champs modifiables (exclure email, role, etc.)
    const allowedFields: (keyof UpdateProfileRequest)[] = [
      'first_name',
      'last_name',
      'current_city',
      'current_country',
      'bio',
      'phone',
      'linkedin_url',
      'avatar_url'
    ]
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    // Ne garder que les champs autorisés
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    })
    
    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user_id)
      .select(`
        *,
        school:school_id (
          id,
          name_fr,
          country
        )
      `)
      .single()
    
    if (error) throw error
    
    return {
      ...user,
      school: Array.isArray(user.school) ? user.school[0] : user.school
    }
  }
  
  // Récupérer mes privacy settings - AUTH REQUIS
  async getMyPrivacy(user_id: string): Promise<UserPrivacySettings> {
    const { data: privacy, error } = await supabase
      .from('user_privacy_settings')
      .select('*')
      .eq('user_id', user_id)
      .single()
    
    if (error) {
      // Si pas de settings, créer avec valeurs par défaut
      const { data: newPrivacy, error: createError } = await supabase
        .from('user_privacy_settings')
        .insert({ user_id })
        .select()
        .single()
      
      if (createError) throw createError
      
      return {
        show_email: newPrivacy.show_email,
        show_phone: newPrivacy.show_phone,
        show_current_location: newPrivacy.show_current_location,
        show_bio: newPrivacy.show_bio,
        show_linkedin: newPrivacy.show_linkedin,
        show_entry_year: newPrivacy.show_entry_year,
        show_in_directory: newPrivacy.show_in_directory
      }
    }
    
    return {
      show_email: privacy.show_email,
      show_phone: privacy.show_phone,
      show_current_location: privacy.show_current_location,
      show_bio: privacy.show_bio,
      show_linkedin: privacy.show_linkedin,
      show_entry_year: privacy.show_entry_year,
      show_in_directory: privacy.show_in_directory
    }
  }
  
  // Modifier mes privacy settings - AUTH REQUIS
  async updateMyPrivacy(user_id: string, data: Partial<UserPrivacySettings>): Promise<UserPrivacySettings> {
    // Vérifier si settings existent
    const { data: existing } = await supabase
      .from('user_privacy_settings')
      .select('id')
      .eq('user_id', user_id)
      .single()
    
    if (!existing) {
      // Créer si n'existe pas
      const { data: privacy, error } = await supabase
        .from('user_privacy_settings')
        .insert({
          user_id,
          ...data
        })
        .select()
        .single()
      
      if (error) throw error
      
      return {
        show_email: privacy.show_email,
        show_phone: privacy.show_phone,
        show_current_location: privacy.show_current_location,
        show_bio: privacy.show_bio,
        show_linkedin: privacy.show_linkedin,
        show_entry_year: privacy.show_entry_year,
        show_in_directory: privacy.show_in_directory
      }
    }
    
    // Mettre à jour
    const { data: privacy, error } = await supabase
      .from('user_privacy_settings')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      show_email: privacy.show_email,
      show_phone: privacy.show_phone,
      show_current_location: privacy.show_current_location,
      show_bio: privacy.show_bio,
      show_linkedin: privacy.show_linkedin,
      show_entry_year: privacy.show_entry_year,
      show_in_directory: privacy.show_in_directory
    }
  }
}

export const usersService = new UsersService()

