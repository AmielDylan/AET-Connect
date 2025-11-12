import { Request, Response } from 'express'
import { schoolsService } from '@/services/schools.service'
import { logger } from '@/utils/logger'

export class SchoolsController {
  
  async getSchools(req: Request, res: Response) {
    try {
      const filters = {
        country: req.query.country as string,
        is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined
      }
      
      const schools = await schoolsService.getSchools(filters)
      
      res.json({
        schools,
        total: schools.length
      })
    } catch (error: any) {
      logger.error('Error in getSchools:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async getSchoolById(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      const school = await schoolsService.getSchoolById(id)
      
      res.json(school)
    } catch (error: any) {
      logger.error('Error in getSchoolById:', error)
      
      if (error.message.includes('non trouvée')) {
        res.status(404).json({ error: error.message })
      } else {
        res.status(500).json({ error: error.message })
      }
    }
  }
  
  async getSchoolStats(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      const stats = await schoolsService.getSchoolStats(id)
      
      res.json(stats)
    } catch (error: any) {
      logger.error('Error in getSchoolStats:', error)
      
      if (error.message.includes('non trouvée')) {
        res.status(404).json({ error: error.message })
      } else {
        res.status(500).json({ error: error.message })
      }
    }
  }
}

export const schoolsController = new SchoolsController()

