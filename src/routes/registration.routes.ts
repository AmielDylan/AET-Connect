import { Router } from 'express'
import { registrationController } from '@/controllers/registration.controller'
import { validateRequest } from '@/middleware/validation.middleware'
import {
  CheckSchoolPromoSchema,
  RequestInitialAccessSchema,
  VerifyInvitationCodeSchema,
  CompleteRegistrationSchema,
  RequestCodeFromPeerSchema
} from '@/utils/validations'

const router = Router()

// POST /api/register/check-school-promo
router.post(
  '/check-school-promo',
  validateRequest(CheckSchoolPromoSchema),
  registrationController.checkSchoolPromo.bind(registrationController)
)

// POST /api/register/request-initial-access
router.post(
  '/request-initial-access',
  validateRequest(RequestInitialAccessSchema),
  registrationController.requestInitialAccess.bind(registrationController)
)

// POST /api/register/verify-invitation-code
router.post(
  '/verify-invitation-code',
  validateRequest(VerifyInvitationCodeSchema),
  registrationController.verifyInvitationCode.bind(registrationController)
)

// POST /api/register/complete-registration
router.post(
  '/complete-registration',
  validateRequest(CompleteRegistrationSchema),
  registrationController.completeRegistration.bind(registrationController)
)

// POST /api/register/request-code-from-peer
router.post(
  '/request-code-from-peer',
  validateRequest(RequestCodeFromPeerSchema),
  registrationController.requestCodeFromPeer.bind(registrationController)
)

export default router

