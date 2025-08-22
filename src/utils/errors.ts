import { HTTP_STATUS, ERROR_CODES } from './constants';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    public code: string = ERROR_CODES.INTERNAL_ERROR,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTH_ERROR);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, ERROR_CODES.RATE_LIMIT_EXCEEDED);
  }
}