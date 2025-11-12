import { Router } from 'express'
import { adminController } from '@/controllers/admin.controller'
import { authMiddleware, adminMiddleware } from '@/middleware/auth.middleware'
import { validateRequest } from '@/middleware/validation.middleware'
import { 
  UpdateUserSchema, 
  IncreaseCodeLimitSchema, 
  SetAmbassadorSchema,
  AccessRequestFiltersSchema,
  UserFiltersSchema,
  UpdateEventSchema
} from '@/utils/validations'

const router = Router()

// Toutes les routes admin requièrent authentification + rôle admin
router.use(authMiddleware, adminMiddleware)

// GET /api/admin/stats
router.get('/stats', adminController.getStats.bind(adminController))

// GET /api/admin/access-requests
router.get(
  '/access-requests',
  adminController.getAccessRequests.bind(adminController)
)

// POST /api/admin/access-requests/:id/approve
router.post('/access-requests/:id/approve', adminController.approveAccessRequest.bind(adminController))

// POST /api/admin/access-requests/:id/reject
router.post('/access-requests/:id/reject', adminController.rejectAccessRequest.bind(adminController))

// GET /api/admin/users
router.get(
  '/users',
  adminController.getUsers.bind(adminController)
)

// PATCH /api/admin/users/:id
router.patch(
  '/users/:id',
  validateRequest(UpdateUserSchema),
  adminController.updateUser.bind(adminController)
)

// POST /api/admin/users/:id/set-ambassador
router.post(
  '/users/:id/set-ambassador',
  validateRequest(SetAmbassadorSchema),
  adminController.setAmbassador.bind(adminController)
)

// PATCH /api/admin/users/:id/increase-code-limit
router.patch(
  '/users/:id/increase-code-limit',
  validateRequest(IncreaseCodeLimitSchema),
  adminController.increaseCodeLimit.bind(adminController)
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GESTION ÉVÉNEMENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// GET /api/admin/events (liste TOUS les événements)
router.get('/events', adminController.getAllEvents.bind(adminController))

// GET /api/admin/events/:id/participants (détails participants)
router.get('/events/:id/participants', adminController.getEventParticipantsAdmin.bind(adminController))

// PATCH /api/admin/events/:id (modifier N'IMPORTE QUEL événement)
router.patch(
  '/events/:id',
  validateRequest(UpdateEventSchema),
  adminController.updateAnyEvent.bind(adminController)
)

// DELETE /api/admin/events/:id (supprimer N'IMPORTE QUEL événement)
router.delete('/events/:id', adminController.deleteAnyEvent.bind(adminController))

export default router

