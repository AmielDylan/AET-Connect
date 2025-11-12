import { Router } from 'express'
import { schoolsController } from '@/controllers/schools.controller'

const router = Router()

// Toutes les routes schools sont PUBLIQUES (NO AUTH)

// GET /api/schools
router.get('/', schoolsController.getSchools.bind(schoolsController))

// GET /api/schools/:id
router.get('/:id', schoolsController.getSchoolById.bind(schoolsController))

// GET /api/schools/:id/stats
router.get('/:id/stats', schoolsController.getSchoolStats.bind(schoolsController))

export default router

