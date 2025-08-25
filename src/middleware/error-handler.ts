import { AppError } from '@/utils/errors';
import { ResponseBuilder, jsonResponse } from '@/utils/response';
import { logger } from '@/utils/logger';
import { HTTP_STATUS } from '@/utils/constants';
import { t } from '@/localization';
import { ZodError } from 'zod';
import { randomUUID } from 'crypto';

type ErrorContext = {
  // Keep only what we actually need to avoid strict generic mismatches
  error: unknown;
  requestId?: string;
  request: Request;
};

const appErrorResponse = (err: AppError, requestId: string) =>
  jsonResponse(
    ResponseBuilder.error(err.message, err.code, requestId),
    err.statusCode
  );

const zodErrorResponse = (err: ZodError, requestId: string) => {
  const message = err.errors.map(e => e.message).join(', ');
  return jsonResponse(
    ResponseBuilder.error(message, 'VALIDATION_ERROR', requestId),
    HTTP_STATUS.BAD_REQUEST
  );
};

const genericErrorResponse = (requestId: string) =>
  jsonResponse(
    ResponseBuilder.error(t('server.error'), 'INTERNAL_ERROR', requestId),
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );

export const errorHandler = ({ error, requestId, request }: ErrorContext) => {
  // If a plugin/route returned a Response directly, pass it through
  if (error instanceof Response) return error;

  const anyErr = error as any;
  logger.error('Error occurred:', {
    message: anyErr?.message,
    stack: anyErr?.stack,
    requestId,
  });

  const safeRequestId = requestId ?? request.headers.get('x-request-id') ?? randomUUID();

  if (error instanceof AppError) return appErrorResponse(error, safeRequestId);
  if (error instanceof ZodError) return zodErrorResponse(error, safeRequestId);
  return genericErrorResponse(safeRequestId);
};