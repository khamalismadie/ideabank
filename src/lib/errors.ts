import { NextResponse } from 'next/server'
import { ValidationError } from './validate'
import logger from './logger'

export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409)
  }
}

export function handleApiError(error: unknown, requestId?: string) {
  const log = requestId ? logger.child({ requestId }) : logger

  if (error instanceof ValidationError) {
    log.warn({ errors: error.errors }, 'Validation error')
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    )
  }

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      log.error({ error: error.message }, 'Application error')
    } else {
      log.warn({ error: error.message }, 'Application error')
    }
    return NextResponse.json({ error: error.message }, { status: error.statusCode })
  }

  log.error({ error }, 'Unexpected error')
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
