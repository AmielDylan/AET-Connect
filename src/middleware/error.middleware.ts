import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'
import { ZodError } from 'zod'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  })
  
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors
    })
  }
  
  // Generic error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
}

export function notFoundHandler(req: Request, res: Response) {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`)
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  })
}

