import { Request, Response } from 'express'
import { codesService } from '@/services/codes.service'
import { logger } from '@/utils/logger'

export class CodesController {
  
  async generateCode(req: Request, res: Response) {
    try {
      const { user_id } = req.body
      
      // TODO: Récupérer user_id depuis le token JWT (quand auth sera implémenté)
      
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
      const { user_id } = req.params
      
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

