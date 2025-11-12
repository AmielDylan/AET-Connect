import { Request, Response } from 'express'
import { eventsService } from '@/services/events.service'
import { logger } from '@/utils/logger'

export class EventsController {
  
  async createEvent(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      const data = req.body
      const event = await eventsService.createEvent(data, req.user.id)
      
      logger.info('Event created:', { event_id: event.id, user_id: req.user.id })
      
      res.status(201).json({
        success: true,
        event
      })
    } catch (error: any) {
      logger.error('Error in createEvent:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async getEvents(req: Request, res: Response) {
    try {
      const filters = req.query
      const user_id = req.user?.id
      
      const events = await eventsService.getEvents(filters, user_id)
      
      res.json({
        events,
        total: events.length
      })
    } catch (error: any) {
      logger.error('Error in getEvents:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async getEventById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const user_id = req.user?.id
      
      const event = await eventsService.getEventById(id, user_id)
      
      res.json(event)
    } catch (error: any) {
      logger.error('Error in getEventById:', error)
      
      if (error.message.includes('non trouvé')) {
        res.status(404).json({ error: error.message })
      } else {
        res.status(500).json({ error: error.message })
      }
    }
  }
  
  async getEventParticipants(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      const participants = await eventsService.getEventParticipants(id)
      
      res.json({
        participants,
        total: participants.length
      })
    } catch (error: any) {
      logger.error('Error in getEventParticipants:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async updateEvent(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      const { id } = req.params
      const data = req.body
      const is_admin = req.user.role === 'admin'
      
      const event = await eventsService.updateEvent(id, data, req.user.id, is_admin)
      
      logger.info('Event updated:', { event_id: id, user_id: req.user.id })
      
      res.json({
        success: true,
        event
      })
    } catch (error: any) {
      logger.error('Error in updateEvent:', error)
      
      if (error.message.includes('permission')) {
        res.status(403).json({ error: error.message })
      } else if (error.message.includes('non trouvé')) {
        res.status(404).json({ error: error.message })
      } else {
        res.status(500).json({ error: error.message })
      }
    }
  }
  
  async deleteEvent(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      const { id } = req.params
      const is_admin = req.user.role === 'admin'
      
      const result = await eventsService.deleteEvent(id, req.user.id, is_admin)
      
      logger.info('Event deleted:', { event_id: id, user_id: req.user.id })
      
      res.json(result)
    } catch (error: any) {
      logger.error('Error in deleteEvent:', error)
      
      if (error.message.includes('permission')) {
        res.status(403).json({ error: error.message })
      } else if (error.message.includes('non trouvé')) {
        res.status(404).json({ error: error.message })
      } else {
        res.status(500).json({ error: error.message })
      }
    }
  }
  
  async registerToEvent(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      const { id } = req.params
      
      const result = await eventsService.registerToEvent(id, req.user.id)
      
      logger.info('User registered to event:', { event_id: id, user_id: req.user.id })
      
      res.json(result)
    } catch (error: any) {
      logger.error('Error in registerToEvent:', error)
      
      if (error.message.includes('déjà inscrit') || 
          error.message.includes('complet') || 
          error.message.includes('passé') ||
          error.message.includes('terminé') ||
          error.message.includes('annulé') ||
          error.message.includes('plus actif')) {
        res.status(400).json({ error: error.message })
      } else if (error.message.includes('non trouvé')) {
        res.status(404).json({ error: error.message })
      } else {
        res.status(500).json({ error: error.message })
      }
    }
  }
  
  async unregisterFromEvent(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      const { id } = req.params
      
      const result = await eventsService.unregisterFromEvent(id, req.user.id)
      
      logger.info('User unregistered from event:', { event_id: id, user_id: req.user.id })
      
      res.json(result)
    } catch (error: any) {
      logger.error('Error in unregisterFromEvent:', error)
      
      if (error.message.includes('Impossible')) {
        res.status(400).json({ error: error.message })
      } else if (error.message.includes('non trouvé')) {
        res.status(404).json({ error: error.message })
      } else {
        res.status(500).json({ error: error.message })
      }
    }
  }
}

export const eventsController = new EventsController()

