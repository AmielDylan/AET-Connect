import { Request, Response } from 'express'
import { authService } from '@/services/auth.service'
import { logger } from '@/utils/logger'

export class AuthController {
  
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      
      const result = await authService.login(email, password)
      
      logger.info('User logged in:', { user_id: result.user.id, email: result.user.email })
      
      res.json(result)
    } catch (error: any) {
      logger.error('Error in login:', error)
      
      if (error.message.includes('Email ou mot de passe')) {
        res.status(401).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Erreur lors de la connexion' })
      }
    }
  }
  
  async logout(req: Request, res: Response) {
    try {
      // Avec JWT, le logout est côté client (suppression du token)
      // On peut logger l'événement
      if (req.user) {
        logger.info('User logged out:', { user_id: req.user.id, email: req.user.email })
      }
      
      res.json({
        success: true,
        message: 'Déconnexion réussie'
      })
    } catch (error: any) {
      logger.error('Error in logout:', error)
      res.status(500).json({ error: 'Erreur lors de la déconnexion' })
    }
  }
  
  async refreshToken(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body
      
      if (!refresh_token) {
        return res.status(400).json({ error: 'Refresh token manquant' })
      }
      
      const tokens = await authService.refreshToken(refresh_token)
      
      res.json({
        success: true,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token
      })
    } catch (error: any) {
      logger.error('Error in refreshToken:', error)
      
      if (error.message.includes('invalide') || error.message.includes('expiré')) {
        res.status(401).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Erreur lors du refresh' })
      }
    }
  }
  
  async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      const user = await authService.getAuthenticatedUser(req.user.id)
      
      res.json(user)
    } catch (error: any) {
      logger.error('Error in me:', error)
      res.status(500).json({ error: 'Erreur lors de la récupération du profil' })
    }
  }
}

export const authController = new AuthController()

