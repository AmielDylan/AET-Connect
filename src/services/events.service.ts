import { supabase } from '@/config/database'
import { CreateEventRequest, UpdateEventRequest, EventFilters, EventWithDetails } from '@/models/event.model'

export class EventsService {
  
  // Créer un événement
  async createEvent(data: CreateEventRequest, user_id: string) {
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        title: data.title,
        description: data.description || null,
        event_date: data.event_date,
        city: data.city,
        country: data.country,
        address: data.address || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        max_participants: data.max_participants || null,
        created_by_user_id: user_id,
        is_active: true
      })
      .select()
      .single()
    
    if (error) throw error
    
    return event
  }
  
  // Lister les événements avec filtres
  async getEvents(filters: EventFilters, user_id?: string) {
    let query = supabase
      .from('events')
      .select(`
        *,
        creator:created_by_user_id (
          id,
          first_name,
          last_name,
          is_ambassador
        )
      `)
    
    // Appliquer les filtres
    if (filters.country) {
      query = query.ilike('country', `%${filters.country}%`)
    }
    
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }
    
    if (filters.date_from) {
      query = query.gte('event_date', filters.date_from)
    }
    
    if (filters.date_to) {
      query = query.lte('event_date', filters.date_to)
    }
    
    if (filters.created_by) {
      query = query.eq('created_by_user_id', filters.created_by)
    }
    
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    
    // Par défaut, ne montrer que les événements actifs et futurs
    if (filters.is_active === undefined) {
      query = query.eq('is_active', true)
      query = query.gte('event_date', new Date().toISOString())
    } else if (filters.is_active === false) {
      // Si on demande explicitement les inactifs, ne pas filtrer par date
      query = query.eq('is_active', false)
    }
    
    // Ordre par date
    query = query.order('event_date', { ascending: true })
    
    // Pagination
    const limit = filters.limit || 20
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)
    
    const { data: events, error } = await query
    
    if (error) throw error
    
    // Récupérer le nombre de participants pour chaque événement
    const eventIds = events.map(e => e.id)
    const { data: participantCounts } = await supabase
      .from('event_participants')
      .select('event_id')
      .in('event_id', eventIds)
    
    const countsByEventId = new Map<string, number>()
    participantCounts?.forEach(p => {
      countsByEventId.set(p.event_id, (countsByEventId.get(p.event_id) || 0) + 1)
    })
    
    // Si utilisateur connecté, vérifier ses inscriptions
    let registeredEventIds = new Set<string>()
    if (user_id) {
      const { data: registrations } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', user_id)
        .in('event_id', eventIds)
      
      registeredEventIds = new Set(registrations?.map(r => r.event_id) || [])
    }
    
    return events.map(event => ({
      ...event,
      participant_count: countsByEventId.get(event.id) || 0,
      is_registered: registeredEventIds.has(event.id)
    }))
  }
  
  // Récupérer un événement par ID
  async getEventById(event_id: string, user_id?: string): Promise<EventWithDetails> {
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:created_by_user_id (
          id,
          first_name,
          last_name,
          is_ambassador
        )
      `)
      .eq('id', event_id)
      .single()
    
    if (error || !event) {
      throw new Error('Événement non trouvé')
    }
    
    // Récupérer les participants séparément
    const { data: participants } = await supabase
      .from('event_participants')
      .select(`
        user:user_id (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('event_id', event_id)
    
    // Vérifier si l'utilisateur est inscrit
    let is_registered = false
    if (user_id) {
      const { data: registration } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', event_id)
        .eq('user_id', user_id)
        .single()
      
      is_registered = !!registration
    }
    
    return {
      ...event,
      participant_count: participants?.length || 0,
      is_registered,
      participants: participants?.map(p => p.user).filter(Boolean) || []
    }
  }
  
  // Mettre à jour un événement
  async updateEvent(event_id: string, data: UpdateEventRequest, user_id: string, is_admin: boolean) {
    // Vérifier que l'événement existe
    const { data: event } = await supabase
      .from('events')
      .select('created_by_user_id')
      .eq('id', event_id)
      .single()
    
    if (!event) {
      throw new Error('Événement non trouvé')
    }
    
    // Vérifier les permissions (créateur ou admin)
    if (event.created_by_user_id !== user_id && !is_admin) {
      throw new Error('Vous n\'avez pas la permission de modifier cet événement')
    }
    
    // Mettre à jour
    const { data: updated, error } = await supabase
      .from('events')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', event_id)
      .select()
      .single()
    
    if (error) throw error
    
    return updated
  }
  
  // Supprimer un événement (soft delete)
  async deleteEvent(event_id: string, user_id: string, is_admin: boolean) {
    // Vérifier que l'événement existe
    const { data: event } = await supabase
      .from('events')
      .select('created_by_user_id')
      .eq('id', event_id)
      .single()
    
    if (!event) {
      throw new Error('Événement non trouvé')
    }
    
    // Vérifier les permissions
    if (event.created_by_user_id !== user_id && !is_admin) {
      throw new Error('Vous n\'avez pas la permission de supprimer cet événement')
    }
    
    // Soft delete
    const { error } = await supabase
      .from('events')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', event_id)
    
    if (error) throw error
    
    return { success: true, message: 'Événement supprimé' }
  }
  
  // S'inscrire à un événement
  async registerToEvent(event_id: string, user_id: string) {
    // Vérifier que l'événement existe et est actif
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('is_active, max_participants, event_date')
      .eq('id', event_id)
      .single()
    
    if (eventError || !event) {
      throw new Error('Événement non trouvé')
    }
    
    if (!event.is_active) {
      throw new Error('Cet événement n\'est plus actif')
    }
    
    // Vérifier que l'événement n'est pas passé
    if (new Date(event.event_date) < new Date()) {
      throw new Error('Cet événement est déjà passé')
    }
    
    // Vérifier que l'utilisateur n'est pas déjà inscrit
    const { data: existing } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', event_id)
      .eq('user_id', user_id)
      .single()
    
    if (existing) {
      throw new Error('Vous êtes déjà inscrit à cet événement')
    }
    
    // Vérifier le nombre de participants si limite
    if (event.max_participants) {
      const { count } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id)
      
      if (count && count >= event.max_participants) {
        throw new Error('Cet événement est complet')
      }
    }
    
    // Inscrire
    const { data, error } = await supabase
      .from('event_participants')
      .insert({
        event_id,
        user_id
      })
      .select()
      .single()
    
    if (error) throw error
    
    return { success: true, message: 'Inscription réussie' }
  }
  
  // Se désinscrire d'un événement
  async unregisterFromEvent(event_id: string, user_id: string) {
    // Vérifier que l'événement n'est pas passé
    const { data: event } = await supabase
      .from('events')
      .select('event_date')
      .eq('id', event_id)
      .single()
    
    if (!event) {
      throw new Error('Événement non trouvé')
    }
    
    if (new Date(event.event_date) < new Date()) {
      throw new Error('Impossible de se désinscrire d\'un événement passé')
    }
    
    // Supprimer l'inscription
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', event_id)
      .eq('user_id', user_id)
    
    if (error) throw error
    
    return { success: true, message: 'Désinscription réussie' }
  }
}

export const eventsService = new EventsService()

