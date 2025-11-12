import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export function validateRequest(schema: ZodSchema, source: 'body' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = source === 'query' ? req.query : req.body
      schema.parse(data)
      next()
    } catch (error: any) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors
      })
    }
  }
}

