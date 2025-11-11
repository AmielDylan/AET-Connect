import { Router } from 'express'
import { codesController } from '@/controllers/codes.controller'
import { authMiddleware } from '@/middleware/auth.middleware'

const router = Router()

// POST /api/codes/generate (authentification requise)
router.post(
  '/generate',
  authMiddleware,
  codesController.generateCode.bind(codesController)
)

// GET /api/codes/my-codes (authentification requise)
router.get(
  '/my-codes',
  authMiddleware,
  codesController.getMyCodes.bind(codesController)
)

export default router

