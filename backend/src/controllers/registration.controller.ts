import { Request, Response } from 'express'
import { registrationService } from '@/services/registration.service'
import { logger } from '@/utils/logger'

export class RegistrationController {
  
  async checkSchoolPromo(req: Request, res: Response) {
    try {
      const { school_id, entry_year } = req.body
      
      const result = await registrationService.checkSchoolPromo(school_id, entry_year)
      
      res.json(result)
    } catch (error: any) {
      logger.error('Error in checkSchoolPromo:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async requestInitialAccess(req: Request, res: Response) {
    try {
      const data = req.body
      
      const request = await registrationService.createAccessRequest(data)
      
      // TODO: Envoyer email à l'admin
      
      res.status(201).json({
        success: true,
        request_id: request.id,
        message: 'Votre demande a été envoyée à l\'équipe AET Connect'
      })
    } catch (error: any) {
      logger.error('Error in requestInitialAccess:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async verifyInvitationCode(req: Request, res: Response) {
    try {
      const { code, school_id, entry_year } = req.body
      
      const result = await registrationService.verifyInvitationCode(
        code,
        school_id,
        entry_year
      )
      
      // Logger les rejets pour analytics
      if (!result.valid) {
        logger.warn('Code invitation rejeté:', {
          code_prefix: code.substring(0, 10) + '...', // Masquer partiellement
          school_id,
          entry_year,
          reason: result.message
        })
      } else {
        logger.info('Code invitation validé:', {
          code_prefix: code.substring(0, 10) + '...',
          school_id,
          entry_year
        })
      }
      
      res.json(result)
    } catch (error: any) {
      logger.error('Error in verifyInvitationCode:', error)
      res.status(500).json({ 
        error: 'Erreur lors de la vérification du code. Veuillez réessayer.' 
      })
    }
  }
  
  async completeRegistration(req: Request, res: Response) {
    try {
      const data = req.body
      
      const result = await registrationService.completeRegistration(data)
      
      // TODO: Envoyer email de bienvenue
      
      res.status(201).json({
        success: true,
        user_id: result.user_id,
        message: 'Inscription réussie'
      })
    } catch (error: any) {
      logger.error('Error in completeRegistration:', error)
      
      if (error.message.includes('email')) {
        res.status(400).json({ error: error.message })
      } else {
        res.status(500).json({ error: error.message })
      }
    }
  }
  
  async requestCodeFromPeer(req: Request, res: Response) {
    try {
      const data = req.body
      
      const result = await registrationService.requestCodeFromPeer(data)
      
      res.json({
        success: true,
        recipient_name: result.recipient_name,
        message: `Demande envoyée à ${result.recipient_name}`
      })
    } catch (error: any) {
      logger.error('Error in requestCodeFromPeer:', error)
      res.status(500).json({ error: error.message })
    }
  }
}

export const registrationController = new RegistrationController()

