import { Request, Response } from 'express'
import { usersService } from '@/services/users.service'
import { logger } from '@/utils/logger'

export class UsersController {
  
  async getUsers(req: Request, res: Response) {
    try {
      const filters = {
        school_id: req.query.school_id as string,
        entry_year: req.query.entry_year as string,
        country: req.query.country as string,
        city: req.query.city as string,
        is_ambassador: req.query.is_ambassador === 'true' ? true : req.query.is_ambassador === 'false' ? false : undefined,
        search: req.query.search as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      }
      
      const users = await usersService.getUsers(filters)
      
      res.json({
        users,
        total: users.length
      })
    } catch (error: any) {
      logger.error('Error in getUsers:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      const user = await usersService.getUserById(id)
      
      res.json(user)
    } catch (error: any) {
      logger.error('Error in getUserById:', error)
      
      if (error.message.includes('non trouvé') || error.message.includes('privé')) {
        res.status(404).json({ error: error.message })
      } else {
        res.status(500).json({ error: error.message })
      }
    }
  }
  
  async getMyProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      const profile = await usersService.getMyProfile(req.user.id)
      
      res.json(profile)
    } catch (error: any) {
      logger.error('Error in getMyProfile:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async updateMyProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      const data = req.body
      const profile = await usersService.updateMyProfile(req.user.id, data)
      
      logger.info('User profile updated:', { user_id: req.user.id })
      
      res.json({
        success: true,
        user: profile
      })
    } catch (error: any) {
      logger.error('Error in updateMyProfile:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async getMyPrivacy(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      const privacy = await usersService.getMyPrivacy(req.user.id)
      
      res.json(privacy)
    } catch (error: any) {
      logger.error('Error in getMyPrivacy:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async updateMyPrivacy(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      const data = req.body
      const privacy = await usersService.updateMyPrivacy(req.user.id, data)
      
      logger.info('User privacy updated:', { user_id: req.user.id })
      
      res.json({
        success: true,
        privacy,
        message: 'Paramètres de confidentialité mis à jour'
      })
    } catch (error: any) {
      logger.error('Error in updateMyPrivacy:', error)
      res.status(500).json({ error: error.message })
    }
  }
}

export const usersController = new UsersController()

