import { supabase } from '@/config/database'
import { AdminStats, AccessRequestFilters, UserFilters, UpdateUserRequest, IncreaseCodeLimitRequest, SetAmbassadorRequest } from '@/models/admin.model'
import bcrypt from 'bcrypt'

export class AdminService {
  
  // Récupérer statistiques globales
  async getStats(): Promise<AdminStats> {
    // Users stats
    const { data: users } = await supabase
      .from('users')
      .select('role, is_active')
    
    const userStats = {
      total: users?.length || 0,
      by_role: {
        alumni: users?.filter(u => u.role === 'alumni').length || 0,
        moderator: users?.filter(u => u.role === 'moderator').length || 0,
        admin: users?.filter(u => u.role === 'admin').length || 0
      },
      active: users?.filter(u => u.is_active).length || 0,
      inactive: users?.filter(u => !u.is_active).length || 0
    }
    
    // Events stats
    const { data: events } = await supabase
      .from('events')
      .select('status')
    
    const eventStats = {
      total: events?.length || 0,
      by_status: {
        upcoming: events?.filter(e => e.status === 'upcoming').length || 0,
        ongoing: events?.filter(e => e.status === 'ongoing').length || 0,
        completed: events?.filter(e => e.status === 'completed').length || 0,
        cancelled: events?.filter(e => e.status === 'cancelled').length || 0
      }
    }
    
    // Codes stats
    const { data: codes } = await supabase
      .from('invitation_codes')
      .select('current_uses, max_uses, expires_at, is_active')
    
    const codeStats = {
      total_generated: codes?.length || 0,
      total_used: codes?.reduce((sum, c) => sum + (c.current_uses || 0), 0) || 0,
      active: codes?.filter(c => {
        if (!c.is_active) return false
        const isNotExpired = !c.expires_at || new Date(c.expires_at) > new Date()
        const isNotMaxed = (c.current_uses || 0) < (c.max_uses || 0)
        return isNotExpired && isNotMaxed
      }).length || 0
    }
    
    // Access requests stats
    const { data: requests } = await supabase
      .from('access_requests')
      .select('status')
    
    const requestStats = {
      pending: requests?.filter(r => r.status === 'pending').length || 0,
      approved: requests?.filter(r => r.status === 'approved').length || 0,
      rejected: requests?.filter(r => r.status === 'rejected').length || 0
    }
    
    // Registrations by month (last 6 months)
    const { data: registrations } = await supabase
      .from('users')
      .select('created_at')
      .order('created_at', { ascending: false })
    
    const registrationsByMonth = this.groupByMonth(registrations || [])
    
    return {
      users: userStats,
      events: eventStats,
      codes: codeStats,
      access_requests: requestStats,
      registrations_by_month: registrationsByMonth
    }
  }
  
  // Grouper inscriptions par mois
  private groupByMonth(registrations: any[]) {
    const months: { [key: string]: number } = {}
    
    registrations.forEach(r => {
      const date = new Date(r.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months[monthKey] = (months[monthKey] || 0) + 1
    })
    
    return Object.entries(months)
      .map(([month, count]) => ({ month, count: count as number }))
      .slice(0, 6)
      .reverse()
  }
  
  // Liste demandes d'accès
  async getAccessRequests(filters: AccessRequestFilters) {
    let query = supabase
      .from('access_requests')
      .select(`
        *,
        school:school_id (
          id,
          name_fr,
          country
        )
      `)
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.school_id) {
      query = query.eq('school_id', filters.school_id)
    }
    
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to)
    }
    
    query = query.order('created_at', { ascending: false })
    
    const limit = filters.limit || 20
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)
    
    const { data, error } = await query
    
    if (error) throw error
    
    return data || []
  }
  
  // Approuver demande d'accès
  async approveAccessRequest(request_id: string) {
    // Récupérer la demande
    const { data: request, error: fetchError } = await supabase
      .from('access_requests')
      .select('*')
      .eq('id', request_id)
      .single()
    
    if (fetchError || !request) {
      throw new Error('Demande non trouvée')
    }
    
    if (request.status !== 'pending') {
      throw new Error('Cette demande a déjà été traitée')
    }
    
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', request.email)
      .single()
    
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà')
    }
    
    // Créer l'utilisateur
    const tempPassword = this.generateTempPassword()
    const passwordHash = await bcrypt.hash(tempPassword, 10)
    
    const maxCodesAllowed = request.wants_ambassador ? 20 : 3
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: request.email,
        password_hash: passwordHash,
        first_name: request.first_name,
        last_name: request.last_name,
        school_id: request.school_id,
        entry_year: request.entry_year,
        role: 'alumni',
        is_active: true,
        is_ambassador: request.wants_ambassador,
        max_codes_allowed: maxCodesAllowed
      })
      .select()
      .single()
    
    if (userError) throw userError
    
    // Mettre à jour la demande
    const { error: updateError } = await supabase
      .from('access_requests')
      .update({
        status: 'approved',
        processed_at: new Date().toISOString()
      })
      .eq('id', request_id)
    
    if (updateError) throw updateError
    
    // TODO: Envoyer email avec mot de passe temporaire
    
    return { user, temp_password: tempPassword }
  }
  
  // Rejeter demande d'accès
  async rejectAccessRequest(request_id: string) {
    const { data: request, error: fetchError } = await supabase
      .from('access_requests')
      .select('status')
      .eq('id', request_id)
      .single()
    
    if (fetchError || !request) {
      throw new Error('Demande non trouvée')
    }
    
    if (request.status !== 'pending') {
      throw new Error('Cette demande a déjà été traitée')
    }
    
    const { error } = await supabase
      .from('access_requests')
      .update({
        status: 'rejected',
        processed_at: new Date().toISOString()
      })
      .eq('id', request_id)
    
    if (error) throw error
    
    // TODO: Envoyer email de refus
    
    return { success: true, message: 'Demande rejetée' }
  }
  
  // Liste utilisateurs
  async getUsers(filters: UserFilters) {
    let query = supabase
      .from('users')
      .select(`
        *,
        school:school_id (
          id,
          name_fr,
          country
        )
      `)
    
    if (filters.role) {
      query = query.eq('role', filters.role)
    }
    
    if (filters.school_id) {
      query = query.eq('school_id', filters.school_id)
    }
    
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    
    if (filters.is_ambassador !== undefined) {
      query = query.eq('is_ambassador', filters.is_ambassador)
    }
    
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }
    
    query = query.order('created_at', { ascending: false })
    
    const limit = filters.limit || 20
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)
    
    const { data, error } = await query
    
    if (error) throw error
    
    return data || []
  }
  
  // Modifier utilisateur
  async updateUser(user_id: string, data: UpdateUserRequest) {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)
      .select()
      .single()
    
    if (error) throw error
    
    return user
  }
  
  // Désigner/retirer ambassadeur
  async setAmbassador(user_id: string, data: SetAmbassadorRequest) {
    const max_codes_allowed = data.is_ambassador ? 20 : 3
    
    const { data: user, error } = await supabase
      .from('users')
      .update({
        is_ambassador: data.is_ambassador,
        max_codes_allowed,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)
      .select()
      .single()
    
    if (error) throw error
    
    return user
  }
  
  // Augmenter limite codes
  async increaseCodeLimit(user_id: string, data: IncreaseCodeLimitRequest) {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        max_codes_allowed: data.new_limit,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)
      .select()
      .single()
    
    if (error) throw error
    
    return user
  }
  
  // Générer mot de passe temporaire
  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password + '!'
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GESTION ÉVÉNEMENTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Liste TOUS les événements (admin)
  async getAllEvents(filters: any) {
    let query = supabase
      .from('events')
      .select(`
        *,
        creator:created_by_user_id (
          id,
          first_name,
          last_name,
          email,
          is_ambassador
        ),
        participants:event_participants(count)
      `)
    
    // Filtres
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.country) {
      query = query.ilike('country', `%${filters.country}%`)
    }
    
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }
    
    if (filters.created_by) {
      query = query.eq('created_by_user_id', filters.created_by)
    }
    
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    
    if (filters.date_from) {
      query = query.gte('event_date', filters.date_from)
    }
    
    if (filters.date_to) {
      query = query.lte('event_date', filters.date_to)
    }
    
    // Ordre par date
    query = query.order('event_date', { ascending: false })
    
    // Pagination
    const limit = filters.limit || 50
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)
    
    const { data: events, error } = await query
    
    if (error) throw error
    
    return (events || []).map((event: any) => ({
      ...event,
      participant_count: event.participants?.[0]?.count || 0
    }))
  }
  
  // Modifier N'IMPORTE QUEL événement (admin)
  async updateAnyEvent(event_id: string, data: any) {
    const { data: event, error } = await supabase
      .from('events')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', event_id)
      .select(`
        *,
        creator:created_by_user_id (
          id,
          first_name,
          last_name
        )
      `)
      .single()
    
    if (error) throw error
    
    return event
  }
  
  // Supprimer N'IMPORTE QUEL événement (admin)
  async deleteAnyEvent(event_id: string) {
    const { error } = await supabase
      .from('events')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', event_id)
    
    if (error) throw error
    
    return { success: true, message: 'Événement supprimé par admin' }
  }
  
  // Liste participants avec détails complets (admin)
  async getEventParticipantsAdmin(event_id: string) {
    const { data: participants, error } = await supabase
      .from('event_participants')
      .select(`
        id,
        registered_at,
        user:user_id (
          id,
          first_name,
          last_name,
          email,
          school_id,
          entry_year,
          current_city,
          current_country,
          is_ambassador,
          role,
          is_active
        )
      `)
      .eq('event_id', event_id)
      .order('registered_at', { ascending: true })
    
    if (error) throw error
    
    return (participants || []).map((p: any) => ({
      ...p.user,
      registered_at: p.registered_at,
      participant_id: p.id
    }))
  }
}

export const adminService = new AdminService()

