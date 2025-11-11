import { Router } from 'express'
import { codesController } from '@/controllers/codes.controller'
// import { authMiddleware } from '@/middleware/auth.middleware' // À créer plus tard

const router = Router()

// POST /api/codes/generate (authentification requise)
// router.post('/generate', authMiddleware, codesController.generateCode)

// GET /api/codes/my-codes (authentification requise)
// router.get('/my-codes', authMiddleware, codesController.getMyCodes)

// Pour l'instant, routes sans auth (à sécuriser plus tard)
router.post('/generate', codesController.generateCode.bind(codesController))
router.get('/my-codes/:user_id', codesController.getMyCodes.bind(codesController))

export default router

