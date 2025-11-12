import { Router } from 'express'
import { eventsController } from '@/controllers/events.controller'
import { validateRequest } from '@/middleware/validation.middleware'
import { authMiddleware } from '@/middleware/auth.middleware'
import { CreateEventSchema, UpdateEventSchema } from '@/utils/validations'

const router = Router()

// POST /api/events (créer événement, auth requise)
router.post(
  '/',
  authMiddleware,
  validateRequest(CreateEventSchema),
  eventsController.createEvent.bind(eventsController)
)

// GET /api/events (liste événements, public mais avec filtres)
router.get(
  '/',
  eventsController.getEvents.bind(eventsController)
)

// GET /api/events/:id (détails événement, public)
router.get(
  '/:id',
  eventsController.getEventById.bind(eventsController)
)

// GET /api/events/:id/participants (liste participants, public)
router.get(
  '/:id/participants',
  eventsController.getEventParticipants.bind(eventsController)
)

// PATCH /api/events/:id (modifier événement, auth requise)
router.patch(
  '/:id',
  authMiddleware,
  validateRequest(UpdateEventSchema),
  eventsController.updateEvent.bind(eventsController)
)

// DELETE /api/events/:id (supprimer événement, auth requise)
router.delete(
  '/:id',
  authMiddleware,
  eventsController.deleteEvent.bind(eventsController)
)

// POST /api/events/:id/register (s'inscrire, auth requise)
router.post(
  '/:id/register',
  authMiddleware,
  eventsController.registerToEvent.bind(eventsController)
)

// DELETE /api/events/:id/unregister (se désinscrire, auth requise)
router.delete(
  '/:id/unregister',
  authMiddleware,
  eventsController.unregisterFromEvent.bind(eventsController)
)

export default router

