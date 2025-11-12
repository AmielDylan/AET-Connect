import { Request, Response, NextFunction } from 'express'
import { JWTUtils } from '@/utils/jwt'
import { logger } from '@/utils/logger'

// Étendre le type Request pour inclure user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: 'alumni' | 'moderator' | 'admin'
      }
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Token manquant ou format invalide'
      })
    }
    
    const token = authHeader.substring(7) // Enlever "Bearer "
    
    // Vérifier le token
    const payload = JWTUtils.verifyToken(token)
    
    if (!payload) {
      return res.status(401).json({
        error: 'Token invalide ou expiré',
        message: 'Veuillez vous reconnecter'
      })
    }
    
    // Vérifier que c'est un access token
    if (payload.type !== 'access') {
      return res.status(401).json({
        error: 'Type de token invalide',
        message: 'Utilisez un access token'
      })
    }
    
    // Ajouter les infos utilisateur à la requête
    req.user = {
      id: payload.user_id,
      email: payload.email,
      role: payload.role
    }
    
    next()
  } catch (error: any) {
    logger.error('Error in authMiddleware:', error)
    res.status(500).json({ error: 'Erreur d\'authentification' })
  }
}

// Middleware pour vérifier le rôle admin
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Non authentifié' })
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Accès interdit',
      message: 'Vous devez être administrateur'
    })
  }
  
  next()
}

// Middleware pour vérifier le rôle moderator ou admin
export function moderatorMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Non authentifié' })
  }
  
  if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Accès interdit',
      message: 'Vous devez être modérateur ou administrateur'
    })
  }
  
  next()
}

