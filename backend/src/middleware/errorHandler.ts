import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'

  console.error(`[Error] ${statusCode} - ${message}`)

  res.status(statusCode).json({
    error: message
  })
}
