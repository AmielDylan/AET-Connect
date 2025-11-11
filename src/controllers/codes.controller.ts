import { Request, Response } from 'express'
import { codesService } from '@/services/codes.service'
import { logger } from '@/utils/logger'

export class CodesController {
  
  async generateCode(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      // Récupérer user_id depuis le token JWT
      const user_id = req.user.id
      
      const result = await codesService.generateUserCode(user_id)
      
      res.status(201).json({
        success: true,
        code: result.code,
        codes_remaining: result.codes_remaining
      })
    } catch (error: any) {
      logger.error('Error in generateCode:', error)
      
      if (error.message.includes('limite')) {
        res.status(403).json({ error: error.message })
      } else {
        res.status(500).json({ error: error.message })
      }
    }
  }
  
  async getMyCodes(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      // Récupérer user_id depuis le token JWT
      const user_id = req.user.id
      
      const codes = await codesService.getUserCodes(user_id)
      
      res.json({
        codes,
        total: codes.length
      })
    } catch (error: any) {
      logger.error('Error in getMyCodes:', error)
      res.status(500).json({ error: error.message })
    }
  }
}

export const codesController = new CodesController()

