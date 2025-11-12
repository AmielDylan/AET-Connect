import { Router } from 'express'
import { authController } from '@/controllers/auth.controller'
import { validateRequest } from '@/middleware/validation.middleware'
import { authMiddleware } from '@/middleware/auth.middleware'
import { LoginSchema, RefreshTokenSchema } from '@/utils/validations'

const router = Router()

// POST /api/auth/login
router.post(
  '/login',
  validateRequest(LoginSchema),
  authController.login.bind(authController)
)

// POST /api/auth/logout (authentification requise)
router.post(
  '/logout',
  authMiddleware,
  authController.logout.bind(authController)
)

// POST /api/auth/refresh
router.post(
  '/refresh',
  validateRequest(RefreshTokenSchema),
  authController.refreshToken.bind(authController)
)

// GET /api/auth/me (authentification requise)
router.get(
  '/me',
  authMiddleware,
  authController.me.bind(authController)
)

export default router

